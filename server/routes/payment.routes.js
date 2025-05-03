"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const payment_controller_1 = require("../controllers/payment.controller");
const auth_controller_1 = require("../controllers/auth.controller");
const validaterequest_1 = require("../middlewares/validaterequest");
const express_2 = __importDefault(require("express"));
const router = (0, express_1.Router)();
// Webhook route (no authentication required)
// This route needs raw body for Stripe signature verification
router.post('/webhook', express_2.default.raw({ type: 'application/json' }), payment_controller_1.handleWebhook);
// Protected routes (require authentication)
router.use(auth_controller_1.protect);
router.post('/create-payment-intent', [
    (0, express_validator_1.body)('orderId')
        .isMongoId().withMessage('Invalid order ID')
], validaterequest_1.validateRequest, payment_controller_1.createPaymentIntent);
router.get('/status/:orderId', payment_controller_1.getPaymentStatus);
exports.default = router;
