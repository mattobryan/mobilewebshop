import { Request, Response, NextFunction } from 'express';
import Order from '../models/order.model';
import Product from '../models/product.model';
import User from '../models/user.model';
import AppError from '../utils/appError';
import Email from '../utils/email';

// Create a new order
export const createOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return next(new AppError('You need to be logged in to place an order', 401));
    }

    const { items, shippingAddress, paymentMethod } = req.body;

    // Validate items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return next(new AppError('Order must contain at least one item', 400));
    }

    // Calculate total amount and verify product availability
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      
      if (!product) {
        return next(new AppError(`Product with ID ${item.product} not found`, 404));
      }

      // Check if enough stock is available
      if (product.stock < item.quantity) {
        return next(new AppError(`Not enough stock available for ${product.name}`, 400));
      }

      // Update product stock
      product.stock -= item.quantity;
      await product.save();

      // Add item to order
      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity
      });

      totalAmount += product.price * item.quantity;
    }

    // Create the order
    const newOrder = await Order.create({
      user: req.user._id,
      items: orderItems,
      totalAmount,
      shippingAddress,
      paymentMethod,
      paymentStatus: 'pending',
      status: 'pending'
    });

    // Send order confirmation email
    try {
      await Email.sendOrderConfirmation(req.user, newOrder);
    } catch (emailError) {
      console.error('Error sending order confirmation email:', emailError);
      // Don't fail the request if email sending fails
    }

    res.status(201).json({
      status: 'success',
      data: {
        order: newOrder
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get all orders (admin only)
export const getAllOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const orders = await Order.find().populate('user', 'username email');

    res.status(200).json({
      status: 'success',
      results: orders.length,
      data: {
        orders
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get user's orders
export const getUserOrders = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return next(new AppError('You need to be logged in to view your orders', 401));
    }

    const orders = await Order.find({ user: req.user._id });

    res.status(200).json({
      status: 'success',
      results: orders.length,
      data: {
        orders
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get a specific order
export const getOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'username email');

    if (!order) {
      return next(new AppError('No order found with that ID', 404));
    }

    // Check if the user is the owner of the order or an admin
    if (req.user && (req.user.role === 'admin' || (order.user as any).toString() === req.user._id.toString())) {
      return res.status(200).json({
        status: 'success',
        data: {
          order
        }
      });
    }

    return next(new AppError('You do not have permission to view this order', 403));
  } catch (error) {
    next(error);
  }
};

// Update order status (admin only)
export const updateOrderStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { status } = req.body;

    if (!status) {
      return next(new AppError('Please provide a status', 400));
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      {
        new: true,
        runValidators: true
      }
    ).populate('user');

    if (!order) {
      return next(new AppError('No order found with that ID', 404));
    }

    // Send order status update email
    try {
      const user = await User.findById(order.user);
      if (user) {
        await Email.sendOrderStatusUpdate(user, order);
      }
    } catch (emailError) {
      console.error('Error sending order status update email:', emailError);
      // Don't fail the request if email sending fails
    }

    res.status(200).json({
      status: 'success',
      data: {
        order
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update payment status (typically called by payment webhook)
export const updatePaymentStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { paymentStatus, transactionId } = req.body;

    if (!paymentStatus) {
      return next(new AppError('Please provide a payment status', 400));
    }

    const paymentDetails = transactionId ? {
      transactionId,
      paymentDate: new Date()
    } : undefined;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { 
        paymentStatus,
        ...(paymentDetails && { paymentDetails })
      },
      {
        new: true,
        runValidators: true
      }
    ).populate('user');

    if (!order) {
      return next(new AppError('No order found with that ID', 404));
    }

    // Send payment confirmation email if payment status is 'paid'
    if (paymentStatus === 'paid') {
      try {
        const user = await User.findById(order.user);
        if (user) {
          await Email.sendPaymentConfirmation(user, order);
        }
      } catch (emailError) {
        console.error('Error sending payment confirmation email:', emailError);
        // Don't fail the request if email sending fails
      }
    }

    res.status(200).json({
      status: 'success',
      data: {
        order
      }
    });
  } catch (error) {
    next(error);
  }
};

// Cancel an order
export const cancelOrder = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return next(new AppError('No order found with that ID', 404));
    }

    // Check if the user is the owner of the order or an admin
    if (req.user && (req.user.role === 'admin' || (order.user as any).toString() === req.user._id.toString())) {
      // Only allow cancellation if the order is pending or processing
      if (order.status === 'pending' || order.status === 'processing') {
        // Restore product stock
        for (const item of order.items) {
          await Product.findByIdAndUpdate(item.product, {
            $inc: { stock: item.quantity }
          });
        }

        order.status = 'cancelled';
        await order.save();

        return res.status(200).json({
          status: 'success',
          data: {
            order
          }
        });
      } else {
        return next(new AppError('Cannot cancel an order that has been shipped or delivered', 400));
      }
    }

    return next(new AppError('You do not have permission to cancel this order', 403));
  } catch (error) {
    next(error);
  }
};
