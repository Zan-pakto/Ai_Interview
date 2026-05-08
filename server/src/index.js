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
    console.error('Signup error:', error);
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
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/auth/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, name: true }
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    res.json({ user });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
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
      console.error("Database error in join-interview:", dbErr);
    }

    const audioBuffer = await textToSpeech(greeting);

    socket.emit('ai-message', {
      type: 'question',
      text: greeting,
      audio: audioBuffer ? audioBuffer.toString('base64') : null,
      timestamp: new Date().toISOString()
    });
  });

  socket.on('user-answer', async (data) => {
    const { roomId, audio } = data;
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
      topic: session.topic,
      difficulty: session.difficulty
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
      console.error("Database error saving messages:", dbErr);
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
    const session = sessionStore.get(roomId);
    if (!session) return;

    try {
      const feedback = await generateFeedback(session.history, {
        topic: session.topic,
        difficulty: session.difficulty
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
        console.error("Database error saving session feedback:", dbErr);
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
