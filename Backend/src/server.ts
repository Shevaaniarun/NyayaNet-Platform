import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import discussionRoutes from './routes/discussionRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'NyayaNet Backend',
    version: '1.0.0',
  });
});

// Discussion routes
app.use('/api/discussions', discussionRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handler
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', error);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
  ⚖️  NyayaNet Discussion API
  ================================
  ✅ Server running on port ${PORT}
  📊 Discussion endpoints ready
  🌐 CORS: ${process.env.CORS_ORIGIN || 'http://localhost:5173'}
  
  Available endpoints:
  - GET    /api/discussions           - Get all discussions
  - POST   /api/discussions           - Create discussion (auth)
  - GET    /api/discussions/:id       - Get discussion details
  - POST   /api/discussions/:id/replies - Add reply (auth)
  - POST   /api/discussions/replies/:id/upvote - Upvote reply (auth)
  - POST   /api/discussions/:id/follow - Follow discussion (auth)
  - POST   /api/discussions/:id/best-answer - Mark best answer (auth)
  - POST   /api/discussions/:id/resolve - Mark as resolved (auth)
  - GET    /api/discussions/search    - Search discussions
  `);
});