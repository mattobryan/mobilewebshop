"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const orderSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Order must belong to a user']
    },
    items: [
        {
            product: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: 'Product',
                required: [true, 'Order item must have a product']
            },
            name: {
                type: String,
                required: [true, 'Order item must have a name']
            },
            price: {
                type: Number,
                required: [true, 'Order item must have a price']
            },
            quantity: {
                type: Number,
                required: [true, 'Order item must have a quantity'],
                min: [1, 'Quantity cannot be less than 1']
            }
        }
    ],
    totalAmount: {
        type: Number,
        required: [true, 'Order must have a total amount']
    },
    shippingAddress: {
        street: {
            type: String,
            required: [true, 'Shipping address must have a street']
        },
        city: {
            type: String,
            required: [true, 'Shipping address must have a city']
        },
        state: {
            type: String,
            required: [true, 'Shipping address must have a state']
        },
        postalCode: {
            type: String,
            required: [true, 'Shipping address must have a postal code']
        },
        country: {
            type: String,
            required: [true, 'Shipping address must have a country']
        }
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
        default: 'pending'
    },
    paymentMethod: {
        type: String,
        enum: ['credit_card', 'paypal', 'stripe'],
        required: [true, 'Order must have a payment method']
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed'],
        default: 'pending'
    },
    paymentDetails: {
        transactionId: String,
        paymentDate: Date
    }
}, {
    timestamps: true
});
// Create and export the Order model
const Order = (0, mongoose_1.model)('Order', orderSchema);
exports.default = Order;
