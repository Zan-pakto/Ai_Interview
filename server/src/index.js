require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');

const { generateNextQuestion } = require('./services/ai.service');
const { transcribeAudio } = require('./services/stt.service');
const { textToSpeech } = require('./services/tts.service');

const app = express();
app.use(cors());
app.use(helmet());
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Session memory (In-memory for now, use Redis/Postgres for scaling)
const sessionStore = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-interview', async (data) => {
    const { roomId, userId } = data;
    socket.join(roomId);
    
    // Initialize history
    sessionStore.set(roomId, {
      userId,
      history: []
    });

    const greeting = "Hello! I'm your AI interviewer. To get started, could you briefly introduce yourself and mention the role you're applying for?";
    
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

    // 2. Generate Next Question
    const nextQuestion = await generateNextQuestion(session.history, userText);
    
    // Update history
    session.history.push({ role: 'user', content: userText });
    session.history.push({ role: 'assistant', content: nextQuestion });

    // 3. TTS
    const nextAudioBuffer = await textToSpeech(nextQuestion);

    socket.emit('ai-message', {
      type: 'question',
      text: nextQuestion,
      audio: nextAudioBuffer ? nextAudioBuffer.toString('base64') : null,
      timestamp: new Date().toISOString()
    });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
