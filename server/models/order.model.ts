import { Document, Schema, model } from 'mongoose';
import { IUser } from './user.model';
import { IProduct } from './product.model';

export interface OrderItem {
  product: IProduct['_id'];
  name: string;
  price: number;
  quantity: number;
}

export interface IOrder extends Document {
  user: IUser['_id'];
  items: OrderItem[];
  totalAmount: number;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod: 'credit_card' | 'paypal' | 'stripe';
  paymentStatus: 'pending' | 'paid' | 'failed';
  paymentDetails?: {
    transactionId?: string;
    paymentDate?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new Schema<IOrder>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Order must belong to a user']
    },
    items: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: 'Product',
          required: [true, 'Order item must have a product']
        },
        name: {
          type: String,
          required: [true, 'Order item must have a name']
        },
        price: {
          type: Number,
          required: [true, 'Order item must have a price']
        },
        quantity: {
          type: Number,
          required: [true, 'Order item must have a quantity'],
          min: [1, 'Quantity cannot be less than 1']
        }
      }
    ],
    totalAmount: {
      type: Number,
      required: [true, 'Order must have a total amount']
    },
    shippingAddress: {
      street: {
        type: String,
        required: [true, 'Shipping address must have a street']
      },
      city: {
        type: String,
        required: [true, 'Shipping address must have a city']
      },
      state: {
        type: String,
        required: [true, 'Shipping address must have a state']
      },
      postalCode: {
        type: String,
        required: [true, 'Shipping address must have a postal code']
      },
      country: {
        type: String,
        required: [true, 'Shipping address must have a country']
      }
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
      default: 'pending'
    },
    paymentMethod: {
      type: String,
      enum: ['credit_card', 'paypal', 'stripe'],
      required: [true, 'Order must have a payment method']
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending'
    },
    paymentDetails: {
      transactionId: String,
      paymentDate: Date
    }
  },
  {
    timestamps: true
  }
);

// Create and export the Order model
const Order = model<IOrder>('Order', orderSchema);
export default Order;
