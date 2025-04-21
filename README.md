npm # Mobile Webshop Application

This is a full-stack mobile webshop application with an Angular frontend and Express/Node.js backend.

## Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account (required for database access)

## Setup Instructions

### 1. Install Dependencies

Install dependencies for both the client and server:

```bash
# Install root dependencies
npm install

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Database Setup

The application is configured to use MongoDB Atlas (cloud database). The connection string is already set up in the `server/.env` file.

#### Option 1: Initialize with Seed Script

To initialize the database with basic sample data:

```bash
npm run seed
```

This will create:
- An admin user (email: admin@example.com, password: admin123)
- Sample products

#### Option 2: Import Comprehensive Dataset

For a more comprehensive dataset with multiple products and users:

1. Split the MongoDB data file into separate collection files:

```bash
npm run split-mongodb-data
```

2. Import the data into MongoDB Atlas:
   - Follow the instructions in `MONGODB_IMPORT.md`
   - This will create users and products with proper relationships

**Alternative: Using Local MongoDB**

If you prefer to use a local MongoDB instance:
1. Install MongoDB locally
2. Start the MongoDB service:
   - Windows: `net start MongoDB`
   - macOS: `brew services start mongodb-community`
   - Linux: `sudo systemctl start mongod`
3. Update the connection string in `server/.env`:
   ```
   MONGODB_URI=mongodb://localhost:27017/mobile-webshop
   ```

**Note:** The application requires a connection to MongoDB Atlas to function properly. Make sure to set up and configure MongoDB Atlas before running the application.

### 3. Start the Application

You can start both the frontend and backend concurrently:

```bash
npm start
```

Or start them separately:

```bash
# Start the backend server
npm run start:server

# Start the frontend application
npm run start:client
```

## Testing the Application

### Backend API

The backend API will be available at http://localhost:3000/api

Available endpoints:
- GET /api/products - Get all products
- GET /api/products/:id - Get a specific product
- POST /api/auth/login - Login with credentials
- POST /api/auth/register - Register a new user

### Frontend Application

The frontend application will be available at http://localhost:4200

The application includes:
- Product listing page
- Login and registration pages

## Development Notes

- The application requires a connection to MongoDB Atlas
- CORS is configured to allow requests from the frontend
- The frontend uses Angular's standalone component architecture (no NgModules)

## Troubleshooting

### MongoDB Connection Issues

If you encounter MongoDB connection issues:

1. **MongoDB Atlas (Cloud)**: 
   - Check your internet connection
   - Verify the connection string in `server/.env` is correct
   - Make sure your IP address is whitelisted in the MongoDB Atlas dashboard

2. **Local MongoDB**:
   - If you see `Error: MongooseServerSelectionError: connect ECONNREFUSED 127.0.0.1:27017`:
     - MongoDB is not running. Start MongoDB or use the mock data feature.
     - Check if MongoDB is installed: `mongod --version`
     - Start MongoDB service:
       - Windows: `net start MongoDB`
       - macOS: `brew services start mongodb-community`
       - Linux: `sudo systemctl start mongod`
     - Verify MongoDB is running: `mongo` or `mongosh`

### Other Issues

1. Check the browser console for any errors
2. Verify that the backend server is running on port 3000
3. Check that CORS is properly configured in the backend
