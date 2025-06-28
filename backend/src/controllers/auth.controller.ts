import User from '../models/User';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';
import { Request, Response, NextFunction } from 'express';
import nodemailer from 'nodemailer';
import { Error } from 'mongoose';
import { ZodError } from 'zod';
import { validateRequest, registerSchema, loginSchema } from '../utils/validationSchemas';
import dotenv from 'dotenv';

dotenv.config({ path: '../config/.env' });

// Type definitions for request bodies
interface RegisterRequestBody {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: string;
}

interface LoginRequestBody {
  email: string;
  password: string;
}

// Configure nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

interface PasswordResetRequest {
  email: string;
}

interface ResetPasswordRequest {
  token: string;
  password: string;
}

interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}

export const register = async (req: Request<{}, {}, RegisterRequestBody>, res: Response, next: NextFunction) => {
  try {
    // Validate request body
    await validateRequest(registerSchema)(req, res, next);
    
    const { email, password, firstName, lastName, role = 'user' } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const newUser = new User({
      email,
      password,
      firstName,
      lastName,
      role,
      emailVerified: false
    });

    await newUser.save();

    await user.save();

    // Generate verification token
    const verificationToken = await user.generateVerificationToken();

    // Send verification email
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
    
    await transporter.sendMail({
      to: email,
      subject: 'Verify Your Email',
      html: `
        <p>Thank you for registering!</p>
        <p>Please click this link to verify your email: ${verificationUrl}</p>
        <p>This link will expire in 24 hours</p>
      `
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: newUser._id },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // Response without password
    const { password: _, ...newUserWithoutPassword } = newUser.toObject();

    res.status(201).json({
      message: 'Registration successful. Please check your email to verify your account.',
      token,
      user: newUserWithoutPassword
    } as AuthResponse);
  } catch (error) {
    logger.error('Registration error:', error instanceof Error ? error.message : error);
    return res.status(500).json({ message: 'Registration failed' });
  }
};
};

// Verify email
export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }

    // Verify email
    user.emailVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    logger.error('Email verification error:', error);
    res.status(500).json({ message: 'Email verification failed' });
  }
};

export const login = async (req: Request<{}, {}, LoginRequestBody>, res: Response, next: NextFunction) => {
  try {
    // Validate request body
    await validateRequest(loginSchema)(req, res, next);
    
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const validPassword = await user.comparePassword(password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    );

    // Return response
    return res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });
  } catch (error) {
    logger.error('Login error:', error instanceof Error ? error.message : error);
    return res.status(500).json({ message: 'Login failed' });
  }
};

// Request password reset
export const requestPasswordReset = async (req: Request, res: Response) => {
  try {
    const { email } = req.body as PasswordResetRequest;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate reset token
    const resetToken = await user.generatePasswordResetToken();

    // Send email with reset link
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    
    await transporter.sendMail({
      to: email,
      subject: 'Password Reset Request',
      html: `
        <p>You have requested a password reset</p>
        <p>Click this link to reset your password: ${resetUrl}</p>
        <p>This link will expire in 24 hours</p>
      `
    });

    res.json({ message: 'Password reset email sent' });
  } catch (error) {
    logger.error('Password reset request error:', error);
    res.status(500).json({ message: 'Error sending password reset email' });
  }
};

// Reset password
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const { password } = req.body as ResetPasswordRequest;

    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetTokenExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    // Update password
    user.password = password;
    await user.save();

    // Clear reset token
    await user.clearPasswordResetToken();

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    logger.error('Password reset error:', error);
    res.status(500).json({ message: 'Password reset failed' });
  }
};
