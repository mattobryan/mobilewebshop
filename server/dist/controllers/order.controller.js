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
exports.cancelOrder = exports.updatePaymentStatus = exports.updateOrderStatus = exports.getOrder = exports.getUserOrders = exports.getAllOrders = exports.createOrder = void 0;
const order_model_1 = __importDefault(require("../models/order.model"));
const product_model_1 = __importDefault(require("../models/product.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const appError_1 = __importDefault(require("../utils/appError"));
const email_1 = __importDefault(require("../utils/email"));
// Create a new order
const createOrder = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return next(new appError_1.default('You need to be logged in to place an order', 401));
        }
        const { items, shippingAddress, paymentMethod } = req.body;
        // Validate items
        if (!items || !Array.isArray(items) || items.length === 0) {
            return next(new appError_1.default('Order must contain at least one item', 400));
        }
        // Calculate total amount and verify product availability
        let totalAmount = 0;
        const orderItems = [];
        for (const item of items) {
            const product = yield product_model_1.default.findById(item.product);
            if (!product) {
                return next(new appError_1.default(`Product with ID ${item.product} not found`, 404));
            }
            // Check if enough stock is available
            if (product.stock < item.quantity) {
                return next(new appError_1.default(`Not enough stock available for ${product.name}`, 400));
            }
            // Update product stock
            product.stock -= item.quantity;
            yield product.save();
            // Add item to order
            orderItems.push({
                product: product._id,
                name: product.name,
                price: product.price,
                quantity: item.quantity
            });
            totalAmount += product.price * item.quantity;
        }
        // Create the order
        const newOrder = yield order_model_1.default.create({
            user: req.user._id,
            items: orderItems,
            totalAmount,
            shippingAddress,
            paymentMethod,
            paymentStatus: 'pending',
            status: 'pending'
        });
        // Send order confirmation email
        try {
            yield email_1.default.sendOrderConfirmation(req.user, newOrder);
        }
        catch (emailError) {
            console.error('Error sending order confirmation email:', emailError);
            // Don't fail the request if email sending fails
        }
        res.status(201).json({
            status: 'success',
            data: {
                order: newOrder
            }
        });
    }
    catch (error) {
        next(error);
    }
});
exports.createOrder = createOrder;
// Get all orders (admin only)
const getAllOrders = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const orders = yield order_model_1.default.find().populate('user', 'username email');
        res.status(200).json({
            status: 'success',
            results: orders.length,
            data: {
                orders
            }
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getAllOrders = getAllOrders;
// Get user's orders
const getUserOrders = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return next(new appError_1.default('You need to be logged in to view your orders', 401));
        }
        const orders = yield order_model_1.default.find({ user: req.user._id });
        res.status(200).json({
            status: 'success',
            results: orders.length,
            data: {
                orders
            }
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getUserOrders = getUserOrders;
// Get a specific order
const getOrder = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const order = yield order_model_1.default.findById(req.params.id).populate('user', 'username email');
        if (!order) {
            return next(new appError_1.default('No order found with that ID', 404));
        }
        // Check if the user is the owner of the order or an admin
        if (req.user && (req.user.role === 'admin' || order.user.toString() === req.user._id.toString())) {
            return res.status(200).json({
                status: 'success',
                data: {
                    order
                }
            });
        }
        return next(new appError_1.default('You do not have permission to view this order', 403));
    }
    catch (error) {
        next(error);
    }
});
exports.getOrder = getOrder;
// Update order status (admin only)
const updateOrderStatus = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { status } = req.body;
        if (!status) {
            return next(new appError_1.default('Please provide a status', 400));
        }
        const order = yield order_model_1.default.findByIdAndUpdate(req.params.id, { status }, {
            new: true,
            runValidators: true
        }).populate('user');
        if (!order) {
            return next(new appError_1.default('No order found with that ID', 404));
        }
        // Send order status update email
        try {
            const user = yield user_model_1.default.findById(order.user);
            if (user) {
                yield email_1.default.sendOrderStatusUpdate(user, order);
            }
        }
        catch (emailError) {
            console.error('Error sending order status update email:', emailError);
            // Don't fail the request if email sending fails
        }
        res.status(200).json({
            status: 'success',
            data: {
                order
            }
        });
    }
    catch (error) {
        next(error);
    }
});
exports.updateOrderStatus = updateOrderStatus;
// Update payment status (typically called by payment webhook)
const updatePaymentStatus = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { paymentStatus, transactionId } = req.body;
        if (!paymentStatus) {
            return next(new appError_1.default('Please provide a payment status', 400));
        }
        const paymentDetails = transactionId ? {
            transactionId,
            paymentDate: new Date()
        } : undefined;
        const order = yield order_model_1.default.findByIdAndUpdate(req.params.id, Object.assign({ paymentStatus }, (paymentDetails && { paymentDetails })), {
            new: true,
            runValidators: true
        }).populate('user');
        if (!order) {
            return next(new appError_1.default('No order found with that ID', 404));
        }
        // Send payment confirmation email if payment status is 'paid'
        if (paymentStatus === 'paid') {
            try {
                const user = yield user_model_1.default.findById(order.user);
                if (user) {
                    yield email_1.default.sendPaymentConfirmation(user, order);
                }
            }
            catch (emailError) {
                console.error('Error sending payment confirmation email:', emailError);
                // Don't fail the request if email sending fails
            }
        }
        res.status(200).json({
            status: 'success',
            data: {
                order
            }
        });
    }
    catch (error) {
        next(error);
    }
});
exports.updatePaymentStatus = updatePaymentStatus;
// Cancel an order
const cancelOrder = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const order = yield order_model_1.default.findById(req.params.id);
        if (!order) {
            return next(new appError_1.default('No order found with that ID', 404));
        }
        // Check if the user is the owner of the order or an admin
        if (req.user && (req.user.role === 'admin' || order.user.toString() === req.user._id.toString())) {
            // Only allow cancellation if the order is pending or processing
            if (order.status === 'pending' || order.status === 'processing') {
                // Restore product stock
                for (const item of order.items) {
                    yield product_model_1.default.findByIdAndUpdate(item.product, {
                        $inc: { stock: item.quantity }
                    });
                }
                order.status = 'cancelled';
                yield order.save();
                return res.status(200).json({
                    status: 'success',
                    data: {
                        order
                    }
                });
            }
            else {
                return next(new appError_1.default('Cannot cancel an order that has been shipped or delivered', 400));
            }
        }
        return next(new appError_1.default('You do not have permission to cancel this order', 403));
    }
    catch (error) {
        next(error);
    }
});
exports.cancelOrder = cancelOrder;
