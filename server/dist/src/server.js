"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const app_1 = __importDefault(require("../app"));
const config_1 = __importDefault(require("../config/config"));
// Set mongoose options
mongoose_1.default.set('strictQuery', true); // Suppress deprecation warning
mongoose_1.default.connect(config_1.default.mongoose.url, config_1.default.mongoose.options)
    .then(() => {
    console.log('Connected to MongoDB');
    const server = app_1.default.listen(config_1.default.port, () => {
        console.log(`Server running on port ${config_1.default.port}`);
    });
    process.on('unhandledRejection', (err) => {
        console.error('Unhandled Rejection:', err.name, err.message);
        server.close(() => process.exit(1));
    });
})
    .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
});
