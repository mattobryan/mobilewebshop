import { Request, Response, NextFunction } from 'express';
import Review from '../models/review.model';
import Product from '../models/product.model';
import AppError from '../utils/appError';

// Create a new review
export const createReview = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return next(new AppError('You need to be logged in to create a review', 401));
    }

    // Check if the product exists
    const product = await Product.findById(req.params.productId);
    if (!product) {
      return next(new AppError('No product found with that ID', 404));
    }

    // Check if the user has already reviewed this product
    const existingReview = await Review.findOne({
      user: req.user._id,
      product: req.params.productId
    });

    if (existingReview) {
      return next(new AppError('You have already reviewed this product', 400));
    }

    // Create the review
    const newReview = await Review.create({
      user: req.user._id,
      product: req.params.productId,
      rating: req.body.rating,
      comment: req.body.comment
    });

    res.status(201).json({
      status: 'success',
      data: {
        review: newReview
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get all reviews for a product
export const getProductReviews = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate('user', 'username');

    res.status(200).json({
      status: 'success',
      results: reviews.length,
      data: {
        reviews
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get a specific review
export const getReview = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate('user', 'username')
      .populate('product', 'name');

    if (!review) {
      return next(new AppError('No review found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        review
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update a review
export const updateReview = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return next(new AppError('You need to be logged in to update a review', 401));
    }

    const review = await Review.findById(req.params.id);

    if (!review) {
      return next(new AppError('No review found with that ID', 404));
    }

    // Check if the user is the owner of the review
    if ((review.user as any).toString() !== req.user._id.toString()) {
      return next(new AppError('You can only update your own reviews', 403));
    }

    // Update the review
    const updatedReview = await Review.findByIdAndUpdate(
      req.params.id,
      {
        rating: req.body.rating,
        comment: req.body.comment
      },
      {
        new: true,
        runValidators: true
      }
    );

    res.status(200).json({
      status: 'success',
      data: {
        review: updatedReview
      }
    });
  } catch (error) {
    next(error);
  }
};

// Delete a review
export const deleteReview = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return next(new AppError('You need to be logged in to delete a review', 401));
    }

    const review = await Review.findById(req.params.id);

    if (!review) {
      return next(new AppError('No review found with that ID', 404));
    }

    // Check if the user is the owner of the review or an admin
    if ((review.user as any).toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return next(new AppError('You can only delete your own reviews', 403));
    }

    await Review.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

// Get all reviews by a user
export const getUserReviews = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return next(new AppError('You need to be logged in to view your reviews', 401));
    }

    const reviews = await Review.find({ user: req.user._id })
      .populate('product', 'name imageUrl');

    res.status(200).json({
      status: 'success',
      results: reviews.length,
      data: {
        reviews
      }
    });
  } catch (error) {
    next(error);
  }
};
