import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export interface IUser extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
  teams: mongoose.Types.ObjectId[];
  emailVerified: boolean;
  verificationToken: string;
  verificationTokenExpires: Date;
  passwordResetToken: string;
  passwordResetTokenExpires: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  generateVerificationToken(): Promise<string>;
  generatePasswordResetToken(): Promise<string>;
  clearPasswordResetToken(): Promise<void>;
}

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
  },
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'superadmin'],
    default: 'user',
  },
  teams: [{
    type: Schema.Types.ObjectId,
    ref: 'Team',
  }],
}, {
  timestamps: true,
});

// Method to generate verification token
userSchema.methods.generateVerificationToken = async function() {
  const token = crypto.randomBytes(32).toString('hex');
  this.verificationToken = token;
  this.verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  await this.save();
  return token;
};

// Method to generate password reset token
userSchema.methods.generatePasswordResetToken = async function() {
  const token = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = token;
  this.passwordResetTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  await this.save();
  return token;
};

// Method to clear password reset token
userSchema.methods.clearPasswordResetToken = async function() {
  this.passwordResetToken = undefined;
  this.passwordResetTokenExpires = undefined;
  await this.save();
};

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model<IUser>('User', userSchema);
export default User;
