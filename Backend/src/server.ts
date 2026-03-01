import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import pool from './config/database'; // added: use the pool to verify DB & debug route

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
import lawlibraryRoutes from './routes/lawLibraryRoutes';

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

// --- Add lightweight body logging for troubleshooting sends not responding / not persisting
app.use((req, res, next) => {
    if (req.method === 'POST' && (req.path.startsWith('/api/messages') || req.path.startsWith('/api/chatbot'))) {
        console.log(`--> Debug BODY ${req.method} ${req.path}:`, JSON.stringify(req.body).slice(0, 2000));
    }
    next();
});

// Serve uploaded files statically
const uploadsPath = path.resolve(process.cwd(), 'uploads');
console.log(`📂 Serving static files from: ${uploadsPath}`);

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

// Debug middleware specifically for /api/posts to capture request + response details
app.use('/api/posts', (req, res, next) => {
	// Log incoming request
	try {
		const safeBody = typeof req.body === 'object' ? JSON.stringify(req.body).slice(0, 2000) : String(req.body || '');
		console.log(`🔎 [Posts Debug] Incoming ${req.method} ${req.originalUrl} query=${JSON.stringify(req.query)} body=${safeBody}`);
	} catch (err) {
		console.log('🔎 [Posts Debug] Failed to stringify request body', err);
	}

	// Wrap res.json and res.send to capture response body for logging
	const oldJson = res.json.bind(res);
	const oldSend = res.send.bind(res);
	let responseBody: any = undefined;

	// Override json
	(res as any).json = (body: any) => {
		responseBody = body;
		res.setHeader('X-Debug-Posts', '1');
		return oldJson(body);
	};

	// Override send
	(res as any).send = (body: any) => {
		responseBody = body;
		res.setHeader('X-Debug-Posts', '1');
		return oldSend(body);
	};

	const start = Date.now();
	res.on('finish', () => {
		const duration = Date.now() - start;
		let respPreview: string;
		try {
			respPreview = typeof responseBody === 'object' ? JSON.stringify(responseBody).slice(0, 2000) : String(responseBody || '');
		} catch (e) {
			respPreview = '[unable to stringify response]';
		}
		console.log(`🔎 [Posts Debug] Response ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms) body=${respPreview}`);
	});

	next();
});

// Add global process handlers to capture unexpected async errors
process.on('unhandledRejection', (reason, p) => {
    console.error('Unhandled Rejection at:', p, 'reason:', reason);
});
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception thrown:', err);
});

// Safe async wrapper for route handlers to avoid Express closing message channel silently
const safeHandler = (fn: (req: any, res: any, next?: any) => Promise<any>) => {
    return async (req: express.Request, res: express.Response, next: express.NextFunction) => {
        try {
            await fn(req, res, next);
        } catch (err) {
            console.error('Chatbot handler error:', err, '\nStack:', (err instanceof Error) ? err.stack : String(err));
            const message = (err instanceof Error) ? err.message : String(err);
            // Respond with structured error so frontend can show fallback UI and not hang
            res.status(500).json({ success: false, message: 'Chatbot service error', error: message });
        }
    };
};

// Chatbot routes (wrapped)
app.post('/api/chatbot/chat', authenticate, safeHandler(ChatbotController.chat.bind(ChatbotController)));
app.get('/api/chatbot/history', authenticate, safeHandler(ChatbotController.getChatHistory.bind(ChatbotController)));

// Add commonly used per-chat endpoints (wrapped). If your frontend calls these, keep them; otherwise harmless.
app.get('/api/chatbot/chat/:chatId', authenticate, safeHandler((ChatbotController as any).getChatMessages?.bind(ChatbotController) ?? (async (req,res)=> res.status(404).json({success:false,message:'not implemented'}))));
app.delete('/api/chatbot/chat/:chatId', authenticate, safeHandler((ChatbotController as any).deleteChat?.bind(ChatbotController) ?? (async (req,res)=> res.status(404).json({success:false,message:'not implemented'}))));
app.put('/api/chatbot/chat/:chatId', authenticate, safeHandler((ChatbotController as any).updateChatName?.bind(ChatbotController) ?? (async (req,res)=> res.status(404).json({success:false,message:'not implemented'}))));

// Development-only debug route to inspect a user's contribution summary by email
if (process.env.NODE_ENV !== 'production') {
    // Use the already-imported pool instead of requiring again
    const db = pool;
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

app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

// Error handler
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Server error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
});

app.listen(PORT, () => {
    console.log(`⚖️ NyayaNet API running on port ${PORT}`);
});