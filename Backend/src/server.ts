import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import discussionRoutes from './routes/discussionRoutes';
import profileRoutes from './routes/profileRoutes';
import postRoutes from './routes/postRoutes';
import authRoutes from './routes/authRoutes';
import uploadRoutes from './routes/uploadRoutes';
import noteRoutes from "./routes/noteRoutes";
import networkRoutes from './routes/networkRoutes';

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

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));


app.get('/api/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString(), service: 'NyayaNet Backend' });
});

app.use('/api/discussions', discussionRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/upload', uploadRoutes);
app.use("/api", authRoutes);
app.use("/api/notes", noteRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/network', networkRoutes);

app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Server error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
});

app.listen(PORT, () => {
    console.log(`⚖️ NyayaNet API running on port ${PORT}`);
});
