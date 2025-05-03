import { Router } from 'express';
import { body } from 'express-validator';
import {
  createPaymentIntent,
  handleWebhook,
  getPaymentStatus
} from '../controllers/payment.controller';
import { protect } from '../controllers/auth.controller';
import { validateRequest } from '../middlewares/validaterequest';
import express from 'express';

const router = Router();

// Webhook route (no authentication required)
// This route needs raw body for Stripe signature verification
router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  handleWebhook
);

// Protected routes (require authentication)
router.use(protect);

router.post(
  '/create-payment-intent',
  [
    body('orderId')
      .isMongoId().withMessage('Invalid order ID')
  ],
  validateRequest,
  createPaymentIntent
);

router.get(
  '/status/:orderId',
  getPaymentStatus
);

export default router;
