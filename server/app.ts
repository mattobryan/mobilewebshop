import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import config from './config/config';
import authRoutes from './routes/auth.routes';
import productRoutes from './routes/product.routes';
import AppError from './utils/appError';
import { Request, Response, NextFunction } from 'express';

const app = express();

// Security middleware
app.use(helmet());

// Logger middleware
app.use(morgan('dev'));

// Enable CORS with specific configuration
app.use(cors({
  origin: 'http://localhost:4200',
  credentials: true
}));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.send('Mobile Webshop API');
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

// 404 handler
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

// Error handling middleware
app.use((err: AppError, req: Request, res: Response, next: NextFunction) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message
  });
});

export default app;
