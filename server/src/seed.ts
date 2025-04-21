import mongoose from 'mongoose';
import config from '../config/config';
import User from '../models/user.model';
import Product from '../models/product.model';
import bcrypt from 'bcryptjs';

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.mongoose.url, config.mongoose.options);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Product.deleteMany({});

    // Create admin user
    const passwordHash = await bcrypt.hash('admin123', 10);
    const admin = await User.create({
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

    await Product.insertMany(products);
    console.log('Sample data created successfully');
    
    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
