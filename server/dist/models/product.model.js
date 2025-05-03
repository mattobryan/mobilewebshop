"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const productSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        trim: true,
        maxlength: [100, 'Product name cannot exceed 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Product description is required'],
        maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    price: {
        type: Number,
        required: [true, 'Product price is required'],
        min: [0, 'Price cannot be negative']
    },
    stock: {
        type: Number,
        required: [true, 'Stock quantity is required'],
        min: [0, 'Stock cannot be negative']
    },
    category: {
        type: String,
        required: [true, 'Product category is required'],
        enum: {
            values: ['smartphone', 'tablet', 'accessory'],
            message: 'Invalid product category'
        }
    },
    brand: {
        type: String,
        required: [true, 'Brand name is required'],
        maxlength: [50, 'Brand name cannot exceed 50 characters']
    },
    imageUrl: {
        type: String,
        required: [true, 'Image URL is required'],
        validate: {
            validator: (value) => {
                try {
                    new URL(value);
                    return true;
                }
                catch (_a) {
                    return false;
                }
            },
            message: 'Please provide a valid image URL'
        }
    },
    ratingsAverage: {
        type: Number,
        default: 0,
        min: [0, 'Rating must be at least 0'],
        max: [5, 'Rating cannot be more than 5'],
        set: (val) => Math.round(val * 10) / 10 // Round to 1 decimal place
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Creator ID is required']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});
// Create and export the Product model
const Product = (0, mongoose_1.model)('Product', productSchema);
exports.default = Product;
