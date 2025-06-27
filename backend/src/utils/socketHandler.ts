import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import { logger } from './logger';
import { User } from '../models/User';

interface SocketData {
  userId: string;
  socketId: string;
}

const socketHandler = (httpServer: HttpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || '*',
      methods: ['GET', 'POST']
    }
  });

  const connectedUsers: SocketData[] = [];

  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id}`);

    // Handle user connection
    socket.on('join', async (userId: string) => {
      try {
        const user = await User.findById(userId);
        if (!user) {
          return;
        }

        // Store connection
        const socketData: SocketData = { userId, socketId: socket.id };
        connectedUsers.push(socketData);
        logger.info(`User ${userId} joined`);

        // Send initial state
        socket.emit('user:connected', { userId, socketId: socket.id });
      } catch (error) {
        logger.error('Error joining socket:', error);
        socket.disconnect();
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id}`);
      connectedUsers.forEach((user, index) => {
        if (user.socketId === socket.id) {
          connectedUsers.splice(index, 1);
          logger.info(`User ${user.userId} disconnected`);
        }
      });
    });

    // Handle report status updates
    socket.on('report:status', async (data) => {
      try {
        const { reportId, status, progress } = data;
        socket.broadcast.emit('report:status:update', {
          reportId,
          status,
          progress
        });
      } catch (error) {
        logger.error('Error handling report status:', error);
      }
    });

    // Handle notifications
    socket.on('notification:create', async (data) => {
      try {
        const { userId, message, type } = data;
        socket.broadcast.emit('notification:received', {
          userId,
          message,
          type,
          timestamp: new Date()
        });
      } catch (error) {
        logger.error('Error handling notification:', error);
      }
    });
  });

  // API to get connected users
  const getConnectedUsers = () => {
    return connectedUsers.map(user => ({
      userId: user.userId,
      socketId: user.socketId
    }));
  };

  return {
    io,
    getConnectedUsers
  };
};

export { socketHandler };
