import { Router } from 'express';
import { body } from 'express-validator';
import {
  createOrder,
  getAllOrders,
  getUserOrders,
  getOrder,
  updateOrderStatus,
  updatePaymentStatus,
  cancelOrder
} from '../controllers/order.controller';
import { protect, restrictTo } from '../controllers/auth.controller';
import { validateRequest } from '../middlewares/validaterequest';

const router = Router();

// All order routes require authentication
router.use(protect);

// Routes for all authenticated users
router.get('/my-orders', getUserOrders);
router.post(
  '/',
  [
    body('items')
      .isArray({ min: 1 }).withMessage('Order must contain at least one item'),
    body('items.*.product')
      .isMongoId().withMessage('Invalid product ID'),
    body('items.*.quantity')
      .isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    body('shippingAddress.street')
      .notEmpty().withMessage('Street is required'),
    body('shippingAddress.city')
      .notEmpty().withMessage('City is required'),
    body('shippingAddress.state')
      .notEmpty().withMessage('State is required'),
    body('shippingAddress.postalCode')
      .notEmpty().withMessage('Postal code is required'),
    body('shippingAddress.country')
      .notEmpty().withMessage('Country is required'),
    body('paymentMethod')
      .isIn(['credit_card', 'paypal', 'stripe']).withMessage('Invalid payment method')
  ],
  validateRequest,
  createOrder
);

// Routes for specific orders
router.get('/:id', getOrder);
router.patch('/:id/cancel', cancelOrder);

// Admin only routes
const adminMiddleware = restrictTo('admin');
router.get('/', adminMiddleware, getAllOrders as any);
router.patch(
  '/:id/status',
  adminMiddleware,
  [
    body('status')
      .isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
      .withMessage('Invalid order status')
  ],
  validateRequest,
  updateOrderStatus
);
router.patch(
  '/:id/payment',
  adminMiddleware,
  [
    body('paymentStatus')
      .isIn(['pending', 'paid', 'failed'])
      .withMessage('Invalid payment status')
  ],
  validateRequest,
  updatePaymentStatus
);

export default router;
