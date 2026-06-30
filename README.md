# 🤖 AI Interview Prep Application

An advanced, real-time, voice-interactive mock interview preparation application designed to help developers ace their technical interviews. The AI dynamically asks tailored technical questions, listens to spoken answers, speaks back to the candidate, and provides a beautiful comprehensive feedback dashboard with scoring upon completion.

---

## 🚀 Key Features
- **🎙️ Real-Time Voice Interaction:** Fully hands-free voice streaming with instant speech-to-text transcription and ultra-realistic text-to-speech voice playback.
- **🧠 Adaptive Conversational AI:** The AI acts as a professional interviewer, generating contextual follow-up questions tailored to your answers in real-time.
- **📊 Comprehensive Feedback Dashboard:** Generates structured technical evaluation scores (0-100), summarizes performance strengths and areas of focus, and analyzes speaking pacing.
- **🔒 Secure Architecture:** End-to-end user authentication with JWT, secure session handling, and encrypted API workflows.

---

## 🛠️ The Tech Stack
### **AI & Audio Engine**
- **LLM:** [Google Gemini API](https://ai.google.dev/) (`gemini-flash-latest`) for real-time interview flow and scoring.
- **Speech-to-Text (STT):** [Deepgram Nova-2](https://deepgram.com/) for ultra-fast audio transcription.
- **Text-to-Speech (TTS):** [Deepgram Aura](https://deepgram.com/) (`aura-asteria-en`) for natural, human-realistic question playback.

### **Frontend (Client)**
- **Framework:** Next.js (App Router, Tailwind CSS, TypeScript)
- **Real-Time Communication:** Socket.io-client
- **Database ORM:** Prisma Client with `@neondatabase/serverless`

### **Backend (Server)**
- **Environment:** Node.js (Express.js)
- **Real-Time Streaming:** Socket.io (WebSockets)
- **Database Access:** Prisma ORM with Neon Serverless Postgres integration

---

## ⚙️ Local Development Setup

### **1. Clone the Repository**
```bash
git clone https://github.com/Zan-pakto/Ai_Interview.git
cd Ai_Interview
```

### **2. Setup Backend Server**
1. Navigate to the `server` folder:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```
3. Create a `.env` file in the `server` directory:
   ```env
   PORT=5001
   DATABASE_URL="your-neon-postgres-connection-string"
   DEEPGRAM_API_KEY="your-deepgram-api-key"
   GEMINI_API_KEY="your-google-gemini-api-key"
   JWT_SECRET="your-jwt-auth-secret-key"
   NODE_ENV=development
   ```
4. Generate the Prisma Client:
   ```bash
   npx prisma generate
   ```
5. Start the backend development server:
   ```bash
   npm run dev
   ```

### **3. Setup Frontend Client**
1. Open a new terminal and navigate to the `client` folder:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `client` directory:
   ```env
   DATABASE_URL="your-neon-postgres-connection-string"
   JWT_SECRET="your-jwt-auth-secret-key"
   NEXT_PUBLIC_SOCKET_URL="http://localhost:5001"
   NODE_ENV=development
   ```
4. Generate the Prisma Client:
   ```bash
   npx prisma generate
   ```
5. Start the Next.js development server:
   ```bash
   npm run dev
   ```

---

## 🌐 Production Deployments

### **Backend Server (Deploy to Render)**
1. Create a **Web Service** on Render pointing to your repository.
2. Set the **Root Directory** to `server`.
3. Set **Build Command** to `npm install && npx prisma generate`.
4. Set **Start Command** to `npm start`.
5. Add your environment variables under **Advanced** (`DATABASE_URL`, `DEEPGRAM_API_KEY`, `GEMINI_API_KEY`, `JWT_SECRET`, `NODE_ENV`).

### **Frontend Client (Deploy to Vercel)**
1. Create a project on Vercel importing your repository.
2. Set the **Root Directory** to `client`.
3. Override the **Build Command** to:
   ```bash
   npx prisma generate && npm run build
   ```
4. Add your environment variables:
   - `DATABASE_URL` (your Neon connection string)
   - `JWT_SECRET` (your JWT secret)
   - `NEXT_PUBLIC_SOCKET_URL` (your live Render backend URL, e.g., `https://your-backend.onrender.com`)
