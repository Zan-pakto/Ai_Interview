require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('./services/db.service');

const { generateNextQuestion, generateFeedback } = require('./services/ai.service');
const { transcribeAudio } = require('./services/stt.service');
const { textToSpeech } = require('./services/tts.service');

const app = express();
app.use(cors());
app.use(helmet({
  contentSecurityPolicy: false // Disable for development to allow all sources
}));
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'aura_super_secret_key_123';

// Auth Endpoints
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || email.split('@')[0]
      }
    });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({
      token,
      user: { id: user.id, email: user.email, name: user.name }
    });
  } catch (error) {
    console.error('❌ Signup error:', error);
    console.error('❌ Signup error name:', error.name);
    console.error('❌ Signup error message:', error.message);
    console.error('❌ Signup error stack:', error.stack);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name }
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    console.error('❌ Login error name:', error.name);
    console.error('❌ Login error message:', error.message);
    console.error('❌ Login error stack:', error.stack);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const multer = require('multer');
const { ingestResume } = require('./services/rag.service');

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // Limit to 5MB
});

// Helper Middleware for REST Authentication
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Forbidden' });
    req.userId = decoded.userId;
    next();
  });
};

app.get('/api/auth/me', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, email: true, name: true }
    });

    if (!user) return res.status(401).json({ error: 'User not found' });
    res.json({ user });
  } catch (error) {
    console.error('❌ Auth/me error:', error.name, error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Resume Upload Endpoint with RAG Ingestion
app.post('/api/resume/upload', authenticateToken, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log(`📂 Received resume upload request from user ${req.userId}`);
    
    const ingestionResult = await ingestResume(req.userId, req.file.buffer);

    res.status(200).json({
      message: 'Resume successfully analyzed and indexed for AI interrogation!',
      chunkCount: ingestionResult.chunkCount
    });
  } catch (error) {
    console.error("❌ Resume upload failure:", error);
    res.status(500).json({ 
      error: 'Failed to process resume', 
      details: error.message 
    });
  }
});


const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Session memory (In-memory for now, use Redis/Postgres for scaling)
const sessionStore = new Map();

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('Authentication error: Token missing'));
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return next(new Error('Authentication error: Invalid token'));
    }
    socket.user = decoded;
    next();
  });
});

io.on('connection', (socket) => {
  console.log('User connected:', socket.id, 'User ID:', socket.user?.userId);

  socket.on('join-interview', async (data) => {
    const { roomId, topic, difficulty, duration } = data;
    const userId = socket.user.userId;
    
    socket.join(roomId);
    
    // Initialize session with context
    sessionStore.set(roomId, {
      userId,
      topic,
      difficulty,
      duration,
      history: []
    });

    const greeting = `Hello! I'm your AI interviewer. Today we'll be discussing ${topic} at a ${difficulty} level for the next ${duration}. To get started, could you briefly introduce yourself and your experience with ${topic}?`;
    
    try {
      await prisma.session.upsert({
        where: { roomId },
        update: { userId, topic, difficulty, duration },
        create: { roomId, userId, topic, difficulty, duration }
      });

      await prisma.message.create({
        data: {
          role: 'ai',
          content: greeting,
          sessionId: roomId
        }
      });
    } catch (dbErr) {
      console.error("❌ Database error in join-interview:", dbErr);
      console.error("❌ DB error name:", dbErr.name);
      console.error("❌ DB error message:", dbErr.message);
    }

    const audioBuffer = await textToSpeech(greeting);

    socket.emit('ai-message', {
      type: 'question',
      text: greeting,
      audio: audioBuffer ? audioBuffer.toString('base64') : null,
      timestamp: new Date().toISOString()
    });
  });

  socket.on('submit-metrics', (data) => {
    const { roomId, confidence, eyeContact, expression } = data;
    console.log(`📈 [Metrics] Room: ${roomId} | Confidence: ${confidence}% | Gaze: ${eyeContact ? 'Focused' : 'Away'} | Emotion: ${expression}`);
    
    const session = sessionStore.get(roomId);
    if (session) {
      if (!session.confidenceScores) session.confidenceScores = [];
      if (!session.gazeChecks) session.gazeChecks = [];
      
      session.confidenceScores.push(confidence);
      session.gazeChecks.push(eyeContact ? 1 : 0);
    }
  });

  socket.on('user-answer', async (data) => {
    const { roomId, audio, remainingSeconds } = data;
    const session = sessionStore.get(roomId);
    if (!session) return;

    // 1. Transcribe
    const audioBuffer = Buffer.from(audio, 'base64');
    const userText = await transcribeAudio(audioBuffer);
    
    if (!userText) {
      socket.emit('error', { message: 'Could not transcribe audio' });
      return;
    }

    // Emit live transcript
    socket.emit('user-transcript', { text: userText });

    // 2. Generate Next Question using session context
    const nextQuestion = await generateNextQuestion(session.history, userText, {
      userId: session.userId, // PASSING USER ID FOR RAG SEARCH
      topic: session.topic,
      difficulty: session.difficulty,
      remainingSeconds
    });
    
    // Update history
    session.history.push({ role: 'user', content: userText });
    session.history.push({ role: 'assistant', content: nextQuestion });

    try {
      await prisma.message.createMany({
        data: [
          { role: 'user', content: userText, sessionId: roomId },
          { role: 'ai', content: nextQuestion, sessionId: roomId }
        ]
      });
    } catch (dbErr) {
      console.error("❌ Database error saving messages:", dbErr);
      console.error("❌ DB error name:", dbErr.name);
      console.error("❌ DB error message:", dbErr.message);
    }

    // 3. TTS
    const nextAudioBuffer = await textToSpeech(nextQuestion);

    socket.emit('ai-message', {
      type: 'question',
      text: nextQuestion,
      audio: nextAudioBuffer ? nextAudioBuffer.toString('base64') : null,
      timestamp: new Date().toISOString()
    });
  });

  socket.on('end-interview', async (data) => {
    const { roomId } = data;
    let session = sessionStore.get(roomId);
    
    // Fallback: If in-memory session was lost due to reconnection/server restart, load from DB
    if (!session) {
      try {
        const dbSession = await prisma.session.findUnique({ where: { roomId } });
        if (dbSession) {
          session = {
            topic: dbSession.topic,
            difficulty: dbSession.difficulty
          };
        }
      } catch (dbErr) {
        console.error("❌ Fallback session lookup failed:", dbErr);
      }
    }

    if (!session) {
      socket.emit('error', { message: "Session session not found" });
      return;
    }

    try {
      // Load full interview history directly from PostgreSQL database as source of truth
      const dbMessages = await prisma.message.findMany({
        where: { sessionId: roomId },
        orderBy: { timestamp: 'asc' }
      });

      const history = dbMessages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));

      // Compute averages from tracked live metrics
      let avgConfidence = 75;
      let eyeContactPercent = 100;

      if (session.confidenceScores && session.confidenceScores.length > 0) {
        const sum = session.confidenceScores.reduce((a, b) => a + b, 0);
        avgConfidence = Math.round(sum / session.confidenceScores.length);
      }

      if (session.gazeChecks && session.gazeChecks.length > 0) {
        const sum = session.gazeChecks.reduce((a, b) => a + b, 0);
        eyeContactPercent = Math.round((sum / session.gazeChecks.length) * 100);
      }

      console.log(`📊 [Evaluation] Compiling final feedback. Avg Confidence: ${avgConfidence}%, Eye Contact: ${eyeContactPercent}%`);

      const feedback = await generateFeedback(history, {
        topic: session.topic,
        difficulty: session.difficulty,
        avgConfidence,
        eyeContactPercent
      });

      try {
        await prisma.session.update({
          where: { roomId },
          data: {
            completedAt: new Date(),
            overallScore: feedback.overallScore,
            pacing: feedback.pacing,
            summary: feedback.summary,
            strengths: feedback.strengths || [],
            improvements: feedback.improvements || []
          }
        });
      } catch (dbErr) {
        console.error("❌ Database error saving session feedback:", dbErr);
        console.error("❌ DB error name:", dbErr.name);
        console.error("❌ DB error message:", dbErr.message);
      }

      socket.emit('interview-feedback', { feedback });
    } catch (err) {
      console.error("Error generating interview feedback:", err);
      socket.emit('error', { message: "Failed to generate feedback summary." });
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
