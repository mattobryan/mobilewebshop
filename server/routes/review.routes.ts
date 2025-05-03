import { Router } from 'express';
import { body } from 'express-validator';
import {
  createReview,
  getProductReviews,
  getReview,
  updateReview,
  deleteReview,
  getUserReviews
} from '../controllers/review.controller';
import { protect, restrictTo } from '../controllers/auth.controller';
import { validateRequest } from '../middlewares/validaterequest';

const router = Router({ mergeParams: true }); // mergeParams allows access to params from parent router

// Public routes
router.get('/product/:productId', getProductReviews);
router.get('/:id', getReview);

// Protected routes (require authentication)
router.use(protect);

router.get('/my-reviews', getUserReviews);

router.post(
  '/product/:productId',
  [
    body('rating')
      .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('comment')
      .trim()
      .notEmpty().withMessage('Review comment is required')
      .isLength({ max: 500 }).withMessage('Comment cannot exceed 500 characters')
  ],
  validateRequest,
  createReview
);

router.patch(
  '/:id',
  [
    body('rating')
      .optional()
      .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('comment')
      .optional()
      .trim()
      .notEmpty().withMessage('Review comment is required')
      .isLength({ max: 500 }).withMessage('Comment cannot exceed 500 characters')
  ],
  validateRequest,
  updateReview
);

router.delete('/:id', deleteReview);

export default router;
