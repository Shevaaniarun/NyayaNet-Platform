import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import path from 'path';

import discussionRoutes from './routes/discussionRoutes';
import profileRoutes from './routes/profileRoutes';
import postRoutes from './routes/postRoutes';
import authRoutes from './routes/authRoutes';
import uploadRoutes from './routes/uploadRoutes';
import notificationRoutes from './routes/notificationRoutes';
import noteRoutes from "./routes/noteRoutes";
import networkRoutes from './routes/networkRoutes';
import messagesRoutes from './routes/messagesRoutes';
import { ChatbotController } from './controllers/chatbotController';
import { authenticate } from './middleware/auth';
import dashboardRoutes from './routes/dashboardRoutes';

// Import PostgreSQL pool to test connection
import pool from './config/database';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: [
        'http://localhost:5173',
        'http://localhost:5175',
        'http://localhost:5174',
        'http://localhost:4173',
        process.env.CORS_ORIGIN || 'http://localhost:5173'
    ],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging for debugging
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
    });
    next();
});

// Serve uploaded files statically
const uploadsPath = path.resolve(process.cwd(), 'uploads');
console.log(`📂 Serving static files from: ${uploadsPath}`);

import fs from 'fs';
if (!fs.existsSync(uploadsPath)) {
    console.warn(`⚠️ Warning: Uploads directory not found at ${uploadsPath}. Creating it...`);
    fs.mkdirSync(uploadsPath, { recursive: true });
}

app.use('/uploads', express.static(uploadsPath));

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString(), service: 'NyayaNet Backend' });
});

// Routes
app.use('/api/notifications', notificationRoutes);
app.use('/api/discussions', discussionRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/upload', uploadRoutes);
app.use("/api", authRoutes);
app.use("/api/notes", noteRoutes);
app.use('/api/network', networkRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Chatbot routes
app.post('/api/chatbot/chat', authenticate, ChatbotController.chat);
app.get('/api/chatbot/history', authenticate, ChatbotController.getChatHistory);
app.get('/api/chatbot/chat/:chatId', authenticate, ChatbotController.getChatMessages);
app.delete('/api/chatbot/chat/:chatId', authenticate, ChatbotController.deleteChat);
app.put('/api/chatbot/chat/:chatId', authenticate, ChatbotController.updateChatName);

// Test PostgreSQL connection on startup
(async () => {
    try {
        const result = await pool.query('SELECT NOW()');
        console.log('✅ PostgreSQL connected successfully');
        console.log(`📊 Database time: ${result.rows[0].now}`);
    } catch (error) {
        console.error('❌ PostgreSQL connection failed:', error);
    }
})();

// 404 handler
app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

// Error handler
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Server error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
});

app.listen(PORT, () => {
    console.log(`⚖️ NyayaNet API running on port ${PORT}`);
});