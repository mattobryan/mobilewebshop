import { Document, Schema, model } from 'mongoose';
import { IUser } from './user.model';
import { IProduct } from './product.model';

export interface IReview extends Document {
  user: IUser['_id'];
  product: IProduct['_id'];
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
}

const reviewSchema = new Schema<IReview>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Review must belong to a user']
    },
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Review must belong to a product']
    },
    rating: {
      type: Number,
      required: [true, 'Review must have a rating'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot be more than 5']
    },
    comment: {
      type: String,
      required: [true, 'Review must have a comment'],
      trim: true,
      maxlength: [500, 'Comment cannot exceed 500 characters']
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Prevent duplicate reviews (one review per user per product)
reviewSchema.index({ user: 1, product: 1 }, { unique: true });

// Static method to calculate average rating for a product
reviewSchema.statics.calcAverageRating = async function(productId) {
  const stats = await this.aggregate([
    {
      $match: { product: productId }
    },
    {
      $group: {
        _id: '$product',
        nRatings: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);

  // Update the product with the calculated stats
  if (stats.length > 0) {
    await model('Product').findByIdAndUpdate(productId, {
      ratingsQuantity: stats[0].nRatings,
      ratingsAverage: stats[0].avgRating
    });
  } else {
    // If no reviews, set default values
    await model('Product').findByIdAndUpdate(productId, {
      ratingsQuantity: 0,
      ratingsAverage: 0
    });
  }
};

// Call calcAverageRating after save
reviewSchema.post('save', function() {
  // @ts-ignore: Object is possibly 'null'.
  this.constructor.calcAverageRating(this.product);
});

// Call calcAverageRating before findOneAndUpdate/findOneAndDelete
reviewSchema.pre(/^findOneAnd/, async function(next) {
  // @ts-ignore: Property 'r' does not exist on type 'Query<any, any>'.
  this.r = await this.findOne();
  next();
});

reviewSchema.post(/^findOneAnd/, async function() {
  // @ts-ignore: Property 'r' does not exist on type 'Query<any, any>'.
  await this.r.constructor.calcAverageRating(this.r.product);
});

const Review = model<IReview>('Review', reviewSchema);
export default Review;
