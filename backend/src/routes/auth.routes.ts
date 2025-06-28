import express from 'express';
import { register, login, requestPasswordReset, resetPassword, verifyEmail } from '../controllers/auth.controller';
import { validateRequest } from '../middlewares/validateRequest';
import { registerSchema, loginSchema } from '../utils/validationSchemas';

const router = express.Router();

// Public routes
router.post('/register', validateRequest(registerSchema), register);
router.post('/login', validateRequest(loginSchema), login);
router.post('/request-password-reset', requestPasswordReset);
router.post('/reset-password/:token', resetPassword);
router.get('/verify-email/:token', verifyEmail);

export { router as authRoutes };
