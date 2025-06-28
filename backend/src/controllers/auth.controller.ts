import User from '../models/User';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';
import { Request, Response } from 'express';
import nodemailer from 'nodemailer';

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

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, role = 'user' } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const user = new User({
      email,
      password,
      firstName,
      lastName,
      role,
      emailVerified: false
    });

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
      { userId: user._id },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // Response without password
    const { password: _, ...userWithoutPassword } = user.toObject();

    res.status(201).json({
      message: 'Registration successful. Please check your email to verify your account.',
      token,
      user: userWithoutPassword
    } as AuthResponse);
  } catch (error) {
    logger.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed' });
  }
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

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check if email is verified
    if (!user.emailVerified) {
      return res.status(401).json({ message: 'Please verify your email first' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // Response without password
    const { password: _, ...userWithoutPassword } = user.toObject();

    res.json({
      token,
      user: userWithoutPassword,
    } as AuthResponse);
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json({ message: 'Login failed' });
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
