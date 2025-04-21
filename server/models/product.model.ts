import { Document, Schema, model } from 'mongoose';
import { IUser } from './user.model';

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: 'smartphone' | 'tablet' | 'accessory';
  brand: string;
  imageUrl: string;
  createdBy: IUser['_id'];
  createdAt: Date;
}

const productSchema = new Schema<IProduct>({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative']
  },
  stock: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    min: [0, 'Stock cannot be negative']
  },
  category: {
    type: String,
    required: [true, 'Product category is required'],
    enum: {
      values: ['smartphone', 'tablet', 'accessory'],
      message: 'Invalid product category'
    }
  },
  brand: {
    type: String,
    required: [true, 'Brand name is required'],
    maxlength: [50, 'Brand name cannot exceed 50 characters']
  },
  imageUrl: {
    type: String,
    required: [true, 'Image URL is required'],
    validate: {
      validator: (value: string) => {
        try {
          new URL(value);
          return true;
        } catch {
          return false;
        }
      },
      message: 'Please provide a valid image URL'
    }
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Creator ID is required']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Create and export the Product model
const Product = model<IProduct>('Product', productSchema);
export default Product;