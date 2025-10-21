import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';

// Routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import deviceRoutes from './routes/devices.js';
import irrigationRoutes from './routes/irrigation.js';
import weatherRoutes from './routes/weather.js';
import aiRoutes from './routes/ai.js';
import contactRoutes from './routes/contact.js';
import farmRoutes from './routes/farmRoutes.js'

// Utils
import { connectMQTT } from './utils/mqttHandler.js';
import { irrigationAI } from './utils/aiModel.js';
import { checkAIIntegration } from './utils/aiStatus.js';

dotenv.config();

const app = express();
const server = createServer(app);

// ===== SOCKET.IO CORS =====
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173", // frontend port
    credentials: true,
  },
});

// ===== GLOBAL MIDDLEWARE =====
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===== AI Initialization =====
const initializeAI = async () => {
  try {
    await irrigationAI.initializeModel();
    console.log('🤖 AI Model: INITIALIZED & READY');
    setTimeout(() => checkAIIntegration(), 1000);
  } catch (error) {
    console.log('❌ AI Model: FAILED TO INITIALIZE -', error.message);
  }
};

// ===== DATABASE CONNECTION =====
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smart_irrigation')
  .then(() => {
    console.log('✅ MongoDB Connected');
    initializeAI(); // Initialize AI after DB connection
  })
  .catch(err => console.log('❌ MongoDB Error:', err));

// ===== ROUTES =====
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/irrigation', irrigationRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/farms', farmRoutes)

// ===== SOCKET.IO =====
io.on('connection', (socket) => {
  console.log('🔌 User connected:', socket.id);

  socket.on('join-farm', (farmId) => {
    socket.join(farmId);
    console.log(`User ${socket.id} joined farm ${farmId}`);
  });

  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id);
  });
});

// Make io accessible to routes
app.set('io', io);

// ===== MQTT =====
connectMQTT(io);

// ===== START SERVER =====
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
