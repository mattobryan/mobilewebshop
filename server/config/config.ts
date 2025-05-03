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
  stripe: {
    secretKey: string;
    webhookSecret: string;
  };
  email: {
    host: string;
    port: number;
    user: string;
    pass: string;
    from: string;
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
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || 'sk_test_your_stripe_secret_key',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || 'whsec_your_stripe_webhook_secret'
  },
  email: {
    host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
    port: parseInt(process.env.EMAIL_PORT || '2525'),
    user: process.env.EMAIL_USER || 'your_mailtrap_user',
    pass: process.env.EMAIL_PASS || 'your_mailtrap_password',
    from: process.env.EMAIL_FROM || 'noreply@mobileshop.com'
  }
};

export default config;
