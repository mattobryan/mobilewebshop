"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const order_controller_1 = require("../controllers/order.controller");
const auth_controller_1 = require("../controllers/auth.controller");
const validaterequest_1 = require("../middlewares/validaterequest");
const router = (0, express_1.Router)();
// All order routes require authentication
router.use(auth_controller_1.protect);
// Routes for all authenticated users
router.get('/my-orders', order_controller_1.getUserOrders);
router.post('/', [
    (0, express_validator_1.body)('items')
        .isArray({ min: 1 }).withMessage('Order must contain at least one item'),
    (0, express_validator_1.body)('items.*.product')
        .isMongoId().withMessage('Invalid product ID'),
    (0, express_validator_1.body)('items.*.quantity')
        .isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
    (0, express_validator_1.body)('shippingAddress.street')
        .notEmpty().withMessage('Street is required'),
    (0, express_validator_1.body)('shippingAddress.city')
        .notEmpty().withMessage('City is required'),
    (0, express_validator_1.body)('shippingAddress.state')
        .notEmpty().withMessage('State is required'),
    (0, express_validator_1.body)('shippingAddress.postalCode')
        .notEmpty().withMessage('Postal code is required'),
    (0, express_validator_1.body)('shippingAddress.country')
        .notEmpty().withMessage('Country is required'),
    (0, express_validator_1.body)('paymentMethod')
        .isIn(['credit_card', 'paypal', 'stripe']).withMessage('Invalid payment method')
], validaterequest_1.validateRequest, order_controller_1.createOrder);
// Routes for specific orders
router.get('/:id', order_controller_1.getOrder);
router.patch('/:id/cancel', order_controller_1.cancelOrder);
// Admin only routes
const adminMiddleware = (0, auth_controller_1.restrictTo)('admin');
router.get('/', adminMiddleware, order_controller_1.getAllOrders);
router.patch('/:id/status', adminMiddleware, [
    (0, express_validator_1.body)('status')
        .isIn(['pending', 'processing', 'shipped', 'delivered', 'cancelled'])
        .withMessage('Invalid order status')
], validaterequest_1.validateRequest, order_controller_1.updateOrderStatus);
router.patch('/:id/payment', adminMiddleware, [
    (0, express_validator_1.body)('paymentStatus')
        .isIn(['pending', 'paid', 'failed'])
        .withMessage('Invalid payment status')
], validaterequest_1.validateRequest, order_controller_1.updatePaymentStatus);
exports.default = router;
