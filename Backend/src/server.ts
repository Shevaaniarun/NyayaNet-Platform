import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
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


dotenv.config();

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
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Serve uploaded files statically - using absolute path from project root
const uploadsPath = path.resolve(process.cwd(), 'uploads');
console.log(`📂 Serving static files from: ${uploadsPath}`);

// Check if directory exists
import fs from 'fs';
if (!fs.existsSync(uploadsPath)) {
    console.warn(`⚠️ Warning: Uploads directory not found at ${uploadsPath}. Creating it...`);
    fs.mkdirSync(uploadsPath, { recursive: true });
}

app.use('/uploads', express.static(uploadsPath));


app.get('/api/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString(), service: 'NyayaNet Backend' });
});

app.use('/api/notifications', notificationRoutes);
app.use('/api/discussions', discussionRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/upload', uploadRoutes);
app.use("/api", authRoutes);
app.use("/api/notes", noteRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/network', networkRoutes);

app.use('/api/messages', messagesRoutes);

// Chatbot routes (inline to avoid module issues)
app.post('/api/chatbot/chat', authenticate, ChatbotController.chat);
app.get('/api/chatbot/history', authenticate, ChatbotController.getChatHistory);
app.use('/api/dashboard', dashboardRoutes);

app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Server error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
});

app.listen(PORT, () => {
    console.log(`⚖️ NyayaNet API running on port ${PORT}`);
});
