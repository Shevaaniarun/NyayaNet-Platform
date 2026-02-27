import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
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

// Connect to MongoDB for chatbot storage (mongoose)
const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URL || 'mongodb://localhost:27017/nyayanet_chats';
mongoose.connect(mongoUri, {
    // useNewUrlParser and useUnifiedTopology are defaults in modern mongoose
}).then(() => {
    console.log(`✅ Connected to MongoDB at ${mongoUri}`);
}).catch((err) => {
    console.error('❌ Failed to connect to MongoDB:', err && err.message ? err.message : err);
    // Do not exit the process; chatbot endpoints will fallback (but will log errors)
});

// Development-only debug route to inspect a user's contribution summary by email
if (process.env.NODE_ENV !== 'production') {
    const db = require('./config/database').default;
    app.get('/internal/debug/user_contrib', async (req, res) => {
        const email = String(req.query.email || '').trim();
        if (!email) return res.status(400).json({ success: false, message: 'email query param required' });
        try {
            const userRow = await db.query('SELECT id, email, full_name FROM users WHERE email = $1 LIMIT 1', [email]);
            if (!userRow.rows || userRow.rows.length === 0) return res.status(404).json({ success: false, message: 'user not found' });
            const uid = userRow.rows[0].id;
            const summary = await db.query('SELECT * FROM user_contribution_summary WHERE user_id = $1 LIMIT 1', [uid]);
            const likes = await db.query('SELECT COUNT(*) FROM post_likes pl JOIN posts p ON pl.post_id = p.id WHERE p.user_id = $1', [uid]);
            return res.json({ success: true, user: userRow.rows[0], summary: summary.rows[0] || null, post_likes_count: Number(likes.rows[0].count || 0) });
        } catch (err) {
            console.error('Debug route error:', err);
            const msg = (err instanceof Error) ? err.message : String(err);
            return res.status(500).json({ success: false, message: 'internal error', error: msg });
        }
    });
}

app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Server error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
});

app.listen(PORT, () => {
    console.log(`⚖️ NyayaNet API running on port ${PORT}`);
});
