import { Request, Response, NextFunction } from 'express';
import '../types/express.d'; // Import the express.d.ts file
import jwt from 'jsonwebtoken';
import User from '../models/user.model';
import config from '../config/config';
import AppError from '../utils/appError';

const signToken = (id: string, role: string) => {
  return jwt.sign(
    { id, role }, 
    config.jwt.secret as jwt.Secret, 
    { expiresIn: config.jwt.expiresIn } as jwt.SignOptions
  );
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { username, email, password } = req.body;
    
    const newUser = await User.create({
      username,
      email,
      password,
      role: 'customer',
    });

    const token = signToken((newUser._id as any).toString(), newUser.role);

    res.status(201).json({
      status: 'success',
      token,
      data: {
        user: {
          id: newUser._id,
          username: newUser.username,
          email: newUser.email,
          role: newUser.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError('Please provide email and password!', 400));
    }

    const user = await User.findOne({ email }).select('+password');

    // Type assertion to tell TypeScript that user has comparePassword method
    if (!user || !(await (user as any).comparePassword(password))) {
      return next(new AppError('Incorrect email or password', 401));
    }

    const token = signToken((user._id as any).toString(), user.role);

    res.status(200).json({
      status: 'success',
      token,
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const protect = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('You are not logged in! Please log in to get access.', 401));
    }

    const decoded = jwt.verify(token, config.jwt.secret as jwt.Secret) as { id: string, role: string };

    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(new AppError('The user belonging to this token does no longer exist.', 401));
    }

    req.user = currentUser as any;
    next();
  } catch (error) {
    next(error);
  }
};

export const restrictTo = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }
    next();
  };
};
