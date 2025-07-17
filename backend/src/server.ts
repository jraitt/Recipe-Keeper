import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import { errorHandler } from './middleware/errorHandler';
import { notFoundHandler } from './middleware/notFoundHandler';
import { logger } from './utils/logger';
import { connectDatabase } from './utils/database';
import healthRoutes from './routes/health';
import authRoutes from './routes/auth';
import { recipeRoutes } from './routes/recipes';
import uploadsRoutes from './routes/uploads';
import aiImportRoutes from './routes/aiImport';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3021;

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: (parseInt(process.env.RATE_LIMIT_WINDOW || '15')) * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3020'],
  credentials: true,
}));

// Body parsing middleware
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Compression
app.use(compression());

// Logging middleware
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));

// Health check routes
app.use('/api/health', healthRoutes);

// Authentication routes
app.use('/api/auth', authRoutes);

// Recipe routes
app.use('/api/recipes', recipeRoutes);

// Upload routes
app.use('/api/uploads', uploadsRoutes);

// AI Import routes
app.use('/api/ai/import', aiImportRoutes);

// API routes fallback
app.use('/api', (_, res) => {
  res.json({ message: 'Recipe Keeper API is running' });
});

// Error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
app.listen(PORT, async () => {
  logger.info(`Server running on port ${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV}`);
  
  // Connect to database
  await connectDatabase();
});