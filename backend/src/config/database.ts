import mongoose from 'mongoose';
import { logger } from '../utils/logger';
import { Error } from 'mongoose';
import dotenv from 'dotenv';
import { config } from 'dotenv';

config({ path: '../config/.env' });

const connectDB = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      throw new Error('MongoDB URI is not defined');
    }

    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000
    });
    logger.info('Connected to MongoDB');
  } catch (error: unknown) {
    logger.error('MongoDB connection error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }

  mongoose.connection.on('error', (err: unknown) => {
    logger.error('MongoDB connection error:', err instanceof Error ? err.message : err);
    process.exit(1);
  });

  mongoose.connection.on('disconnected', () => {
    logger.error('MongoDB disconnected');
    process.exit(1);
  });
};

export { connectDB };
