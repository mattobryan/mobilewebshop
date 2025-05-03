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
const mongoose_1 = __importDefault(require("mongoose"));
const config_1 = __importDefault(require("../config/config"));
const user_model_1 = __importDefault(require("../models/user.model"));
const product_model_1 = __importDefault(require("../models/product.model"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
function seedDatabase() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Connect to MongoDB
            yield mongoose_1.default.connect(config_1.default.mongoose.url, config_1.default.mongoose.options);
            console.log('Connected to MongoDB');
            // Clear existing data
            yield user_model_1.default.deleteMany({});
            yield product_model_1.default.deleteMany({});
            // Create admin user
            const passwordHash = yield bcryptjs_1.default.hash('admin123', 10);
            const admin = yield user_model_1.default.create({
                username: 'admin',
                email: 'admin@example.com',
                password: passwordHash,
                role: 'admin'
            });
            // Create sample products
            const products = [
                {
                    name: 'iPhone 15 Pro',
                    description: 'Latest iPhone with advanced features',
                    price: 999.99,
                    stock: 50,
                    category: 'smartphone',
                    brand: 'Apple',
                    imageUrl: 'https://example.com/iphone15.jpg',
                    createdBy: admin._id
                },
                {
                    name: 'Samsung Galaxy S24',
                    description: 'Powerful Android smartphone with great camera',
                    price: 899.99,
                    stock: 45,
                    category: 'smartphone',
                    brand: 'Samsung',
                    imageUrl: 'https://example.com/galaxys24.jpg',
                    createdBy: admin._id
                },
                {
                    name: 'iPad Pro',
                    description: 'Professional tablet for creative work',
                    price: 799.99,
                    stock: 30,
                    category: 'tablet',
                    brand: 'Apple',
                    imageUrl: 'https://example.com/ipadpro.jpg',
                    createdBy: admin._id
                },
                {
                    name: 'AirPods Pro',
                    description: 'Wireless earbuds with noise cancellation',
                    price: 249.99,
                    stock: 100,
                    category: 'accessory',
                    brand: 'Apple',
                    imageUrl: 'https://example.com/airpodspro.jpg',
                    createdBy: admin._id
                }
            ];
            yield product_model_1.default.insertMany(products);
            console.log('Sample data created successfully');
            // Disconnect from MongoDB
            yield mongoose_1.default.disconnect();
            console.log('Disconnected from MongoDB');
        }
        catch (error) {
            console.error('Error seeding database:', error);
            process.exit(1);
        }
    });
}
seedDatabase();
