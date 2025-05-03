"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const auth_controller_1 = require("../controllers/auth.controller");
const validaterequest_1 = require("../middlewares/validaterequest");
const router = (0, express_1.Router)();
router.post('/register', [
    (0, express_validator_1.body)('username')
        .trim()
        .notEmpty().withMessage('Username is required')
        .isLength({ min: 3 }).withMessage('Username must be at least 3 characters')
        .isLength({ max: 30 }).withMessage('Username cannot exceed 30 characters'),
    (0, express_validator_1.body)('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email'),
    (0, express_validator_1.body)('password')
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
], validaterequest_1.validateRequest, auth_controller_1.register);
router.post('/login', [
    (0, express_validator_1.body)('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Please provide a valid email'),
    (0, express_validator_1.body)('password')
        .notEmpty().withMessage('Password is required')
], validaterequest_1.validateRequest, auth_controller_1.login);
exports.default = router;
