import mongoose from 'mongoose';
import { logger } from '../utils/logger';
import { Error } from 'mongoose';

const connectDB = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      throw new Error('MongoDB URI is not defined');
    }

    await mongoose.connect(MONGODB_URI);
    logger.info('Connected to MongoDB');
  } catch (error) {
    logger.error('MongoDB connection error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
};

export { connectDB };
