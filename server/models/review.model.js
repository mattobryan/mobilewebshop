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
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const reviewSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Review must belong to a user']
    },
    product: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Product',
        required: [true, 'Review must belong to a product']
    },
    rating: {
        type: Number,
        required: [true, 'Review must have a rating'],
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating cannot be more than 5']
    },
    comment: {
        type: String,
        required: [true, 'Review must have a comment'],
        trim: true,
        maxlength: [500, 'Comment cannot exceed 500 characters']
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
// Prevent duplicate reviews (one review per user per product)
reviewSchema.index({ user: 1, product: 1 }, { unique: true });
// Static method to calculate average rating for a product
reviewSchema.statics.calcAverageRating = function (productId) {
    return __awaiter(this, void 0, void 0, function* () {
        const stats = yield this.aggregate([
            {
                $match: { product: productId }
            },
            {
                $group: {
                    _id: '$product',
                    nRatings: { $sum: 1 },
                    avgRating: { $avg: '$rating' }
                }
            }
        ]);
        // Update the product with the calculated stats
        if (stats.length > 0) {
            yield (0, mongoose_1.model)('Product').findByIdAndUpdate(productId, {
                ratingsQuantity: stats[0].nRatings,
                ratingsAverage: stats[0].avgRating
            });
        }
        else {
            // If no reviews, set default values
            yield (0, mongoose_1.model)('Product').findByIdAndUpdate(productId, {
                ratingsQuantity: 0,
                ratingsAverage: 0
            });
        }
    });
};
// Call calcAverageRating after save
reviewSchema.post('save', function () {
    // @ts-ignore: Object is possibly 'null'.
    this.constructor.calcAverageRating(this.product);
});
// Call calcAverageRating before findOneAndUpdate/findOneAndDelete
reviewSchema.pre(/^findOneAnd/, function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        // @ts-ignore: Property 'r' does not exist on type 'Query<any, any>'.
        this.r = yield this.findOne();
        next();
    });
});
reviewSchema.post(/^findOneAnd/, function () {
    return __awaiter(this, void 0, void 0, function* () {
        // @ts-ignore: Property 'r' does not exist on type 'Query<any, any>'.
        yield this.r.constructor.calcAverageRating(this.r.product);
    });
});
const Review = (0, mongoose_1.model)('Review', reviewSchema);
exports.default = Review;
