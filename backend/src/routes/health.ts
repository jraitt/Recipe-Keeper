import express from 'express';
import { Request, Response } from 'express';
import { prisma } from '../utils/database';

const router = express.Router();

/**
 * Health check endpoint
 */
router.get('/', (_req: Request, res: Response) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'recipe-keeper-api',
    version: '1.0.0',
    environment: process.env.NODE_ENV,
  });
});

/**
 * Detailed health check with database status
 */
router.get('/detailed', async (_req: Request, res: Response) => {
  let databaseStatus = 'disconnected';
  
  try {
    await prisma.$queryRaw`SELECT 1`;
    databaseStatus = 'connected';
  } catch (error) {
    databaseStatus = 'error';
  }

  const healthCheck = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'recipe-keeper-api',
    version: '1.0.0',
    environment: process.env.NODE_ENV,
    uptime: process.uptime(),
    database: databaseStatus,
    memory: process.memoryUsage(),
  };

  res.json(healthCheck);
});

export default router;