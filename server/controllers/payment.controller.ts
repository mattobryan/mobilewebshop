import { Request, Response, NextFunction } from 'express';
import Stripe from 'stripe';
import Order from '../models/order.model';
import AppError from '../utils/appError';
import config from '../config/config';

// Initialize Stripe with the secret key
const stripe = new Stripe(config.stripe.secretKey as string, {
  apiVersion: '2023-10-16' as Stripe.LatestApiVersion, // Use the latest API version
});

// Create a payment intent
export const createPaymentIntent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return next(new AppError('You need to be logged in to make a payment', 401));
    }

    const { orderId } = req.body;

    // Find the order
    const order = await Order.findById(orderId);

    if (!order) {
      return next(new AppError('No order found with that ID', 404));
    }

    // Check if the user is the owner of the order
    if ((order.user as any).toString() !== req.user._id.toString()) {
      return next(new AppError('You can only pay for your own orders', 403));
    }

    // Check if the order has already been paid
    if (order.paymentStatus === 'paid') {
      return next(new AppError('This order has already been paid', 400));
    }

    // Create a payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.totalAmount * 100), // Stripe expects amount in cents
      currency: 'usd',
      metadata: {
        orderId: (order._id as any).toString(),
        userId: req.user._id.toString(),
      },
    });

    res.status(200).json({
      status: 'success',
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    next(error);
  }
};

// Handle Stripe webhook events
export const handleWebhook = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const sig = req.headers['stripe-signature'] as string;
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        config.stripe.webhookSecret as string
      );
    } catch (err: any) {
      res.status(400).send(`Webhook Error: ${err.message}`);
      return;
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handleSuccessfulPayment(paymentIntent);
        break;
      case 'payment_intent.payment_failed':
        const failedPaymentIntent = event.data.object as Stripe.PaymentIntent;
        await handleFailedPayment(failedPaymentIntent);
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    next(error);
  }
};

// Handle successful payment
const handleSuccessfulPayment = async (paymentIntent: Stripe.PaymentIntent) => {
  try {
    const { orderId } = paymentIntent.metadata;

    // Update the order
    await Order.findByIdAndUpdate(orderId, {
      paymentStatus: 'paid',
      status: 'processing',
      paymentDetails: {
        transactionId: paymentIntent.id,
        paymentDate: new Date(),
      },
    });
  } catch (error) {
    console.error('Error handling successful payment:', error);
  }
};

// Handle failed payment
const handleFailedPayment = async (paymentIntent: Stripe.PaymentIntent) => {
  try {
    const { orderId } = paymentIntent.metadata;

    // Update the order
    await Order.findByIdAndUpdate(orderId, {
      paymentStatus: 'failed',
    });
  } catch (error) {
    console.error('Error handling failed payment:', error);
  }
};

// Get payment status
export const getPaymentStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return next(new AppError('You need to be logged in to check payment status', 401));
    }

    const { orderId } = req.params;

    // Find the order
    const order = await Order.findById(orderId);

    if (!order) {
      return next(new AppError('No order found with that ID', 404));
    }

    // Check if the user is the owner of the order or an admin
    if ((order.user as any).toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return next(new AppError('You can only check payment status for your own orders', 403));
    }

    res.status(200).json({
      status: 'success',
      data: {
        paymentStatus: order.paymentStatus,
        paymentDetails: order.paymentDetails,
      },
    });
  } catch (error) {
    next(error);
  }
};
