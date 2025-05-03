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
exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProduct = exports.getAllProducts = void 0;
require("../types/express.d"); // Import the express.d.ts file
const product_model_1 = __importDefault(require("../models/product.model"));
const appError_1 = __importDefault(require("../utils/appError"));
const getAllProducts = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Build query
        const queryObj = Object.assign({}, req.query);
        const excludedFields = ['page', 'sort', 'limit', 'fields', 'search'];
        excludedFields.forEach(el => delete queryObj[el]);
        // Advanced filtering
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
        // Use type assertion for the query
        let query = product_model_1.default.find(JSON.parse(queryStr));
        // Search functionality
        if (req.query.search) {
            const searchRegex = new RegExp(req.query.search, 'i');
            query = query.find({
                $or: [
                    { name: searchRegex },
                    { description: searchRegex },
                    { brand: searchRegex }
                ]
            });
        }
        // Filter by category
        if (req.query.category) {
            query = query.find({ category: req.query.category });
        }
        // Filter by price range
        if (req.query.minPrice || req.query.maxPrice) {
            const priceFilter = {};
            if (req.query.minPrice)
                priceFilter.$gte = parseFloat(req.query.minPrice);
            if (req.query.maxPrice)
                priceFilter.$lte = parseFloat(req.query.maxPrice);
            query = query.find({ price: priceFilter });
        }
        // Filter by brand
        if (req.query.brand) {
            query = query.find({ brand: req.query.brand });
        }
        // Filter by stock availability
        if (req.query.inStock === 'true') {
            query = query.find({ stock: { $gt: 0 } });
        }
        // Sorting
        if (req.query.sort) {
            const sortBy = req.query.sort.split(',').join(' ');
            query = query.sort(sortBy);
        }
        else {
            query = query.sort('-createdAt');
        }
        // Field limiting
        if (req.query.fields) {
            const fields = req.query.fields.split(',').join(' ');
            query = query.select(fields);
        }
        else {
            query = query.select('-__v');
        }
        // Pagination
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        query = query.skip(skip).limit(limit);
        // Execute query
        const products = yield query.populate('createdBy', 'username email');
        // Get total count for pagination
        const totalProducts = yield product_model_1.default.countDocuments(JSON.parse(queryStr));
        res.status(200).json({
            status: 'success',
            results: products.length,
            totalProducts,
            totalPages: Math.ceil(totalProducts / limit),
            currentPage: page,
            data: {
                products
            }
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getAllProducts = getAllProducts;
const getProduct = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const product = yield product_model_1.default.findById(req.params.id)
            .populate('createdBy', 'username email');
        if (!product) {
            return next(new appError_1.default('No product found with that ID', 404));
        }
        res.status(200).json({
            status: 'success',
            data: {
                product
            }
        });
    }
    catch (error) {
        next(error);
    }
});
exports.getProduct = getProduct;
const createProduct = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return next(new appError_1.default('You need to be logged in to perform this action', 401));
        }
        const newProduct = yield product_model_1.default.create(Object.assign(Object.assign({}, req.body), { createdBy: req.user._id }));
        res.status(201).json({
            status: 'success',
            data: {
                product: newProduct
            }
        });
    }
    catch (error) {
        next(error);
    }
});
exports.createProduct = createProduct;
const updateProduct = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const product = yield product_model_1.default.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!product) {
            return next(new appError_1.default('No product found with that ID', 404));
        }
        res.status(200).json({
            status: 'success',
            data: {
                product
            }
        });
    }
    catch (error) {
        next(error);
    }
});
exports.updateProduct = updateProduct;
const deleteProduct = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const product = yield product_model_1.default.findByIdAndDelete(req.params.id);
        if (!product) {
            return next(new appError_1.default('No product found with that ID', 404));
        }
        res.status(204).json({
            status: 'success',
            data: null
        });
    }
    catch (error) {
        next(error);
    }
});
exports.deleteProduct = deleteProduct;
