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
exports.getUserReviews = exports.deleteReview = exports.updateReview = exports.getReview = exports.getProductReviews = exports.createReview = void 0;
const review_model_1 = __importDefault(require("../models/review.model"));
const product_model_1 = __importDefault(require("../models/product.model"));
const appError_1 = __importDefault(require("../utils/appError"));
// Create a new review
const createReview = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return next(new appError_1.default('You need to be logged in to create a review', 401));
        }
        // Check if the product exists
        const product = yield product_model_1.default.findById(req.params.productId);
        if (!product) {
            return next(new appError_1.default('No product found with that ID', 404));
        }
        // Check if the user has already reviewed this product
        const existingReview = yield review_model_1.default.findOne({
            user: req.user._id,
            product: req.params.productId
        });
        if (existingReview) {
            return next(new appError_1.default('You have already reviewed this product', 400));
        }
        // Create the review
        const newReview = yield review_model_1.default.create({
            user: req.user._id,
            product: req.params.productId,
            rating: req.body.rating,
            comment: req.body.comment
        });
        res.status(201).json({
            status: 'success',
            data: {
                review: newReview
            }
        });
    }
    catch (error) {
        next(error);
    }
});
exports.createReview = createReview;
// Get all reviews for a product
const getProductReviews = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const reviews = yield review_model_1.default.find({ product: req.params.productId })
            .populate('user', 'username');
        res.status(200).json({
            status: 'success',
            results: reviews.length,
            data: {
                reviews
            }
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getProductReviews = getProductReviews;
// Get a specific review
const getReview = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const review = yield review_model_1.default.findById(req.params.id)
            .populate('user', 'username')
            .populate('product', 'name');
        if (!review) {
            return next(new appError_1.default('No review found with that ID', 404));
        }
        res.status(200).json({
            status: 'success',
            data: {
                review
            }
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getReview = getReview;
// Update a review
const updateReview = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return next(new appError_1.default('You need to be logged in to update a review', 401));
        }
        const review = yield review_model_1.default.findById(req.params.id);
        if (!review) {
            return next(new appError_1.default('No review found with that ID', 404));
        }
        // Check if the user is the owner of the review
        if (review.user.toString() !== req.user._id.toString()) {
            return next(new appError_1.default('You can only update your own reviews', 403));
        }
        // Update the review
        const updatedReview = yield review_model_1.default.findByIdAndUpdate(req.params.id, {
            rating: req.body.rating,
            comment: req.body.comment
        }, {
            new: true,
            runValidators: true
        });
        res.status(200).json({
            status: 'success',
            data: {
                review: updatedReview
            }
        });
    }
    catch (error) {
        next(error);
    }
});
exports.updateReview = updateReview;
// Delete a review
const deleteReview = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return next(new appError_1.default('You need to be logged in to delete a review', 401));
        }
        const review = yield review_model_1.default.findById(req.params.id);
        if (!review) {
            return next(new appError_1.default('No review found with that ID', 404));
        }
        // Check if the user is the owner of the review or an admin
        if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return next(new appError_1.default('You can only delete your own reviews', 403));
        }
        yield review_model_1.default.findByIdAndDelete(req.params.id);
        res.status(204).json({
            status: 'success',
            data: null
        });
    }
    catch (error) {
        next(error);
    }
});
exports.deleteReview = deleteReview;
// Get all reviews by a user
const getUserReviews = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return next(new appError_1.default('You need to be logged in to view your reviews', 401));
        }
        const reviews = yield review_model_1.default.find({ user: req.user._id })
            .populate('product', 'name imageUrl');
        res.status(200).json({
            status: 'success',
            results: reviews.length,
            data: {
                reviews
            }
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getUserReviews = getUserReviews;
