import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import validator from 'validator';
import { Document } from 'mongoose';

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  role: 'admin' | 'customer';
  createdAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema<IUser>({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide a valid email'],
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    select: false,
  },
  role: {
    type: String,
    enum: ['admin', 'customer'],
    default: 'customer',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword: string) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);