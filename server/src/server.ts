import mongoose from 'mongoose';
import app from '../app';
import config from '../config/config';

// Set mongoose options
mongoose.set('strictQuery', true); // Suppress deprecation warning

mongoose.connect(config.mongoose.url, config.mongoose.options)
  .then(() => {
    console.log('Connected to MongoDB');
    const server = app.listen(config.port, () => {
      console.log(`Server running on port ${config.port}`);
    });

    process.on('unhandledRejection', (err: Error) => {
      console.error('Unhandled Rejection:', err.name, err.message);
      server.close(() => process.exit(1));
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });