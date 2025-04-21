/**
 * Script to split the mongodb-data.json file into separate collection files
 * for easier import into MongoDB Atlas
 */

const fs = require('fs');
const path = require('path');

// Create directory for output files
const outputDir = path.join(__dirname, 'mongodb-import');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Read the combined data file
try {
  const data = fs.readFileSync(path.join(__dirname, 'mongodb-data.json'), 'utf8');
  const jsonData = JSON.parse(data);
  
  // Extract and save users collection
  if (jsonData.users && Array.isArray(jsonData.users)) {
    fs.writeFileSync(
      path.join(outputDir, 'users.json'),
      JSON.stringify(jsonData.users, null, 2),
      'utf8'
    );
    console.log(`✅ Successfully extracted ${jsonData.users.length} users to mongodb-import/users.json`);
  } else {
    console.error('❌ No users array found in the data file');
  }
  
  // Extract and save products collection
  if (jsonData.products && Array.isArray(jsonData.products)) {
    fs.writeFileSync(
      path.join(outputDir, 'products.json'),
      JSON.stringify(jsonData.products, null, 2),
      'utf8'
    );
    console.log(`✅ Successfully extracted ${jsonData.products.length} products to mongodb-import/products.json`);
  } else {
    console.error('❌ No products array found in the data file');
  }
  
  console.log('\n📋 Next steps:');
  console.log('1. Use these files to import into MongoDB Atlas');
  console.log('2. For UI import: Go to Atlas > Collections > Import Data');
  console.log('3. For CLI import: Use the mongoimport command as described in MONGODB_IMPORT.md');
  
} catch (error) {
  console.error('Error processing the data file:', error.message);
}
