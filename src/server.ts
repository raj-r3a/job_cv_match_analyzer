import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { createExpressMiddleware } from '@trpc/server/adapters/express';
import { appRouter } from './trpc/router';
import { createContext } from './trpc/context';
import { logger } from './utils/logger';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 80;
const HOST = '0.0.0.0';

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (
    _req: Express.Request,
    file: any,
    cb: multer.FileFilterCallback
  ) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
});

app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// tRPC endpoint with file upload support
app.use(
  '/trpc',
  upload.fields([
    { name: 'jobDescription', maxCount: 1 },
    { name: 'cv', maxCount: 1 },
  ]),
  createExpressMiddleware({
    router: appRouter,
    createContext,
  })
);

// Start server and store the instance
const server = app.listen(PORT, HOST, () => {
  logger.info({ message: `🚀 Server running on http://${HOST}:${PORT}` });
  logger.info({ message: `📡 tRPC endpoint: http://${HOST}:${PORT}/trpc` });
});

// Graceful shutdown function
const gracefulShutdown = async (signal: string) => {
  logger.info({ message: `Received ${signal}. Starting graceful shutdown...` });

  server.close(() => {
    logger.info({ message: 'Server closed. Exiting process...' });
    process.exit(0);
  });

  // Force close after 10s
  setTimeout(() => {
    logger.error({
      message: 'Could not close connections in time, forcefully shutting down',
    });
    process.exit(1);
  }, 10000);
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error({ message: 'Uncaught Exception:', error });
  gracefulShutdown('uncaughtException');
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error({ message: 'Unhandled Rejection at:', promise, reason });
  gracefulShutdown('unhandledRejection');
});

// Handle termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
