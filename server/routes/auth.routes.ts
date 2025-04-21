import { Router } from 'express';
import { body } from 'express-validator';
import { register, login } from '../controllers/auth.controller';
import { validateRequest } from '../middlewares/validaterequest';

const router = Router();

router.post(
  '/register',
  [
    body('username')
      .trim()
      .notEmpty().withMessage('Username is required')
      .isLength({ min: 3 }).withMessage('Username must be at least 3 characters')
      .isLength({ max: 30 }).withMessage('Username cannot exceed 30 characters'),
    body('email')
      .trim()
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Please provide a valid email'),
    body('password')
      .notEmpty().withMessage('Password is required')
      .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
  ],
  validateRequest,
  register
);

router.post(
  '/login',
  [
    body('email')
      .trim()
      .notEmpty().withMessage('Email is required')
      .isEmail().withMessage('Please provide a valid email'),
    body('password')
      .notEmpty().withMessage('Password is required')
  ],
  validateRequest,
  login
);

export default router;