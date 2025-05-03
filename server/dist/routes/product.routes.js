"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const product_controller_1 = require("../controllers/product.controller");
const auth_controller_1 = require("../controllers/auth.controller");
const validaterequest_1 = require("../middlewares/validaterequest");
const router = (0, express_1.Router)();
router.get('/', product_controller_1.getAllProducts);
router.get('/:id', product_controller_1.getProduct);
// Protected routes (require authentication)
router.use(auth_controller_1.protect);
router.post('/', (0, auth_controller_1.restrictTo)('admin'), [
    (0, express_validator_1.body)('name')
        .trim()
        .notEmpty().withMessage('Product name is required')
        .isLength({ max: 100 }).withMessage('Product name cannot exceed 100 characters'),
    (0, express_validator_1.body)('description')
        .trim()
        .notEmpty().withMessage('Description is required')
        .isLength({ max: 1000 }).withMessage('Description cannot exceed 1000 characters'),
    (0, express_validator_1.body)('price')
        .isFloat({ gt: 0 }).withMessage('Price must be greater than 0'),
    (0, express_validator_1.body)('stock')
        .isInt({ min: 0 }).withMessage('Stock cannot be negative'),
    (0, express_validator_1.body)('category')
        .isIn(['smartphone', 'tablet', 'accessory']).withMessage('Invalid category'),
    (0, express_validator_1.body)('brand')
        .trim()
        .notEmpty().withMessage('Brand is required')
        .isLength({ max: 50 }).withMessage('Brand cannot exceed 50 characters'),
    (0, express_validator_1.body)('imageUrl')
        .trim()
        .notEmpty().withMessage('Image URL is required')
        .isURL().withMessage('Please provide a valid image URL')
], validaterequest_1.validateRequest, product_controller_1.createProduct);
router.patch('/:id', (0, auth_controller_1.restrictTo)('admin'), [
    (0, express_validator_1.body)('price')
        .optional()
        .isFloat({ gt: 0 }).withMessage('Price must be greater than 0'),
    (0, express_validator_1.body)('stock')
        .optional()
        .isInt({ min: 0 }).withMessage('Stock cannot be negative')
], validaterequest_1.validateRequest, product_controller_1.updateProduct);
router.delete('/:id', (0, auth_controller_1.restrictTo)('admin'), product_controller_1.deleteProduct);
exports.default = router;
