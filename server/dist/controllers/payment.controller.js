"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPaymentStatus = exports.handleWebhook = exports.createPaymentIntent = void 0;
const stripe_1 = __importDefault(require("stripe"));
const order_model_1 = __importDefault(require("../models/order.model"));
const appError_1 = __importDefault(require("../utils/appError"));
const config_1 = __importDefault(require("../config/config"));
// Initialize Stripe with the secret key
const stripe = new stripe_1.default(config_1.default.stripe.secretKey, {
    apiVersion: '2023-10-16', // Use the latest API version
});
// Create a payment intent
const createPaymentIntent = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return next(new appError_1.default('You need to be logged in to make a payment', 401));
        }
        const { orderId } = req.body;
        // Find the order
        const order = yield order_model_1.default.findById(orderId);
        if (!order) {
            return next(new appError_1.default('No order found with that ID', 404));
        }
        // Check if the user is the owner of the order
        if (order.user.toString() !== req.user._id.toString()) {
            return next(new appError_1.default('You can only pay for your own orders', 403));
        }
        // Check if the order has already been paid
        if (order.paymentStatus === 'paid') {
            return next(new appError_1.default('This order has already been paid', 400));
        }
        // Create a payment intent
        const paymentIntent = yield stripe.paymentIntents.create({
            amount: Math.round(order.totalAmount * 100), // Stripe expects amount in cents
            currency: 'usd',
            metadata: {
                orderId: order._id.toString(),
                userId: req.user._id.toString(),
            },
        });
        res.status(200).json({
            status: 'success',
            clientSecret: paymentIntent.client_secret,
        });
    }
    catch (error) {
        next(error);
    }
});
exports.createPaymentIntent = createPaymentIntent;
// Handle Stripe webhook events
const handleWebhook = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const sig = req.headers['stripe-signature'];
        let event;
        try {
            event = stripe.webhooks.constructEvent(req.body, sig, config_1.default.stripe.webhookSecret);
        }
        catch (err) {
            res.status(400).send(`Webhook Error: ${err.message}`);
            return;
        }
        // Handle the event
        switch (event.type) {
            case 'payment_intent.succeeded':
                const paymentIntent = event.data.object;
                yield handleSuccessfulPayment(paymentIntent);
                break;
            case 'payment_intent.payment_failed':
                const failedPaymentIntent = event.data.object;
                yield handleFailedPayment(failedPaymentIntent);
                break;
            default:
                console.log(`Unhandled event type ${event.type}`);
        }
        res.status(200).json({ received: true });
    }
    catch (error) {
        next(error);
    }
});
exports.handleWebhook = handleWebhook;
// Handle successful payment
const handleSuccessfulPayment = (paymentIntent) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { orderId } = paymentIntent.metadata;
        // Update the order
        yield order_model_1.default.findByIdAndUpdate(orderId, {
            paymentStatus: 'paid',
            status: 'processing',
            paymentDetails: {
                transactionId: paymentIntent.id,
                paymentDate: new Date(),
            },
        });
    }
    catch (error) {
        console.error('Error handling successful payment:', error);
    }
});
// Handle failed payment
const handleFailedPayment = (paymentIntent) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { orderId } = paymentIntent.metadata;
        // Update the order
        yield order_model_1.default.findByIdAndUpdate(orderId, {
            paymentStatus: 'failed',
        });
    }
    catch (error) {
        console.error('Error handling failed payment:', error);
    }
});
// Get payment status
const getPaymentStatus = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return next(new appError_1.default('You need to be logged in to check payment status', 401));
        }
        const { orderId } = req.params;
        // Find the order
        const order = yield order_model_1.default.findById(orderId);
        if (!order) {
            return next(new appError_1.default('No order found with that ID', 404));
        }
        // Check if the user is the owner of the order or an admin
        if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return next(new appError_1.default('You can only check payment status for your own orders', 403));
        }
        res.status(200).json({
            status: 'success',
            data: {
                paymentStatus: order.paymentStatus,
                paymentDetails: order.paymentDetails,
            },
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getPaymentStatus = getPaymentStatus;
