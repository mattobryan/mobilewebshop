# MongoDB Data Import Guide

This guide explains how to import the sample data (`mongodb-data.json`) into your MongoDB Atlas database. The application requires a connection to MongoDB to function properly.

## Prerequisites

- MongoDB Atlas account (already set up)
- MongoDB Database Tools installed on your computer
  - Download from: https://www.mongodb.com/try/download/database-tools

## Import Steps

### 1. Prepare the Data Files

The `mongodb-data.json` file contains data for two collections: `users` and `products`. You need to split this into separate files for import:

```bash
# Create a directory for the split files
mkdir -p mongodb-import

# Extract users collection
jq '.users' mongodb-data.json > mongodb-import/users.json

# Extract products collection
jq '.products' mongodb-data.json > mongodb-import/products.json
```

If you don't have `jq` installed, you can manually create these files by copying the respective arrays from the `mongodb-data.json` file.

### 2. Import Using MongoDB Atlas UI

1. Log in to your MongoDB Atlas account
2. Navigate to your cluster
3. Click on "Collections" tab
4. Click "Add My Own Data" or navigate to the database you want to use
5. For each collection:
   - Click on the "+" button to create a new collection (e.g., "users", "products")
   - Click on the collection name
   - Click "Insert Document" and then "Import File"
   - Select the corresponding JSON file (users.json or products.json)
   - Click "Import"

### 3. Import Using mongoimport Tool

Alternatively, you can use the `mongoimport` command-line tool:

```bash
# Import users collection
mongoimport --uri "mongodb+srv://briaynomwamba:bL35QAZiE4SPG2tq@cluster0.sedenqw.mongodb.net/mobile-webshop?retryWrites=true&w=majority" --collection users --file mongodb-import/users.json --jsonArray

# Import products collection
mongoimport --uri "mongodb+srv://briaynomwamba:bL35QAZiE4SPG2tq@cluster0.sedenqw.mongodb.net/mobile-webshop?retryWrites=true&w=majority" --collection products --file mongodb-import/products.json --jsonArray
```

Replace the URI with your actual MongoDB Atlas connection string if it has changed.

### 4. Verify the Import

1. In MongoDB Atlas, navigate to your cluster
2. Click on "Collections"
3. You should see the "users" and "products" collections with the imported data
4. Check that the relationships are preserved (product.createdBy should reference a valid user._id)

## Data Structure

### Users Collection

The users collection contains:
- Admin user (username: "admin", email: "admin@example.com")
- Customer users

The password for all users is hashed, but corresponds to "admin123" for testing purposes.

### Products Collection

The products collection contains:
- Smartphones (iPhone, Samsung, Google, OnePlus)
- Tablets (iPad, Samsung)
- Accessories (AirPods, Galaxy Watch, chargers, etc.)

Each product has a reference to the admin user as its creator.

## Using the Data in the Application

Once the data is imported:

1. Make sure the MongoDB Atlas connection string is correctly set in `server/.env`
2. Start the application with `npm start`
3. The application will automatically connect to MongoDB and display the products

## Troubleshooting

- If you encounter authentication issues, verify your MongoDB Atlas username and password
- Ensure your IP address is whitelisted in MongoDB Atlas
- Check that the database name in the connection string matches the one you're using
