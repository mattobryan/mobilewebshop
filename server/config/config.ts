import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

interface Config {
  port: number;
  mongoose: {
    url: string;
    options: mongoose.ConnectOptions; // Use the correct type
  };
  jwt: {
    secret: string;
    expiresIn: string;
  };
}

const config: Config = {
  port: parseInt(process.env.PORT || '3000'),
  mongoose: {
    url: process.env.MONGODB_URI || 'mongodb://localhost:27017/mobile-webshop',
    options: {
      // These options are now deprecated in MongoDB driver v6+
      // but we'll include them for backward compatibility
      //useNewUrlParser: true,
      //useUnifiedTopology: true,
      
      // Recommended new options
      maxPoolSize: 10, // Maximum number of connections in pool
      serverSelectionTimeoutMS: 5000, // Timeout for server selection
      socketTimeoutMS: 45000, // Socket timeout
      family: 4 // Use IPv4, skip IPv6
    }
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '1d'
  }
};

export default config;