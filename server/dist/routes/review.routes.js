"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const review_controller_1 = require("../controllers/review.controller");
const auth_controller_1 = require("../controllers/auth.controller");
const validaterequest_1 = require("../middlewares/validaterequest");
const router = (0, express_1.Router)({ mergeParams: true }); // mergeParams allows access to params from parent router
// Public routes
router.get('/product/:productId', review_controller_1.getProductReviews);
router.get('/:id', review_controller_1.getReview);
// Protected routes (require authentication)
router.use(auth_controller_1.protect);
router.get('/my-reviews', review_controller_1.getUserReviews);
router.post('/product/:productId', [
    (0, express_validator_1.body)('rating')
        .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    (0, express_validator_1.body)('comment')
        .trim()
        .notEmpty().withMessage('Review comment is required')
        .isLength({ max: 500 }).withMessage('Comment cannot exceed 500 characters')
], validaterequest_1.validateRequest, review_controller_1.createReview);
router.patch('/:id', [
    (0, express_validator_1.body)('rating')
        .optional()
        .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    (0, express_validator_1.body)('comment')
        .optional()
        .trim()
        .notEmpty().withMessage('Review comment is required')
        .isLength({ max: 500 }).withMessage('Comment cannot exceed 500 characters')
], validaterequest_1.validateRequest, review_controller_1.updateReview);
router.delete('/:id', review_controller_1.deleteReview);
exports.default = router;
