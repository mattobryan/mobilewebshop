import { Router } from 'express';
import { body } from 'express-validator';
import {
  getAllProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct
} from '../controllers/product.controller';
import { protect, restrictTo } from '../controllers/auth.controller';
import { validateRequest } from '../middlewares/validaterequest';

const router = Router();

router.get('/', getAllProducts);
router.get('/:id', getProduct);

// Protected routes (require authentication)
router.use(protect);

router.post(
  '/',
  restrictTo('admin'),
  [
    body('name')
      .trim()
      .notEmpty().withMessage('Product name is required')
      .isLength({ max: 100 }).withMessage('Product name cannot exceed 100 characters'),
    body('description')
      .trim()
      .notEmpty().withMessage('Description is required')
      .isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),
    body('price')
      .isFloat({ gt: 0 }).withMessage('Price must be greater than 0'),
    body('stock')
      .isInt({ min: 0 }).withMessage('Stock cannot be negative'),
    body('category')
      .isIn(['smartphone', 'tablet', 'accessory']).withMessage('Invalid category'),
    body('brand')
      .trim()
      .notEmpty().withMessage('Brand is required')
      .isLength({ max: 50 }).withMessage('Brand cannot exceed 50 characters'),
    body('imageUrl')
      .trim()
      .notEmpty().withMessage('Image URL is required')
      .isURL().withMessage('Please provide a valid image URL')
  ],
  validateRequest,
  createProduct
);

router.patch(
  '/:id',
  restrictTo('admin'),
  [
    body('price')
      .optional()
      .isFloat({ gt: 0 }).withMessage('Price must be greater than 0'),
    body('stock')
      .optional()
      .isInt({ min: 0 }).withMessage('Stock cannot be negative')
  ],
  validateRequest,
  updateProduct
);

router.delete('/:id', restrictTo('admin'), deleteProduct);

export default router;