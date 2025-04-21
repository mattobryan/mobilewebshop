import { Express } from 'express-serve-static-core';
import mongoose from 'mongoose';

// Define the User interface based on your User model
interface IUser {
  _id: mongoose.Types.ObjectId;
  id: string; // Alias for _id.toString()
  username: string;
  email: string;
  password?: string;
  role: 'admin' | 'customer';
  createdAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Extend the Express Request interface to include the user property
declare global {
  namespace Express {
    interface Request {
      user: IUser;
    }
  }
}
