import nodemailer from 'nodemailer';
import config from '../config/config';
import { IOrder } from '../models/order.model';
import { IUser as UserModel } from '../models/user.model';

// Define a simpler user interface that works with both express.d.ts and user.model.ts
interface IUser {
  _id: any;
  username: string;
  email: string;
  role: string;
}

interface EmailOptions {
  email: string;
  subject: string;
  message: string;
  html?: string;
}

class Email {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      auth: {
        user: config.email.user,
        pass: config.email.pass,
      },
    });
  }

  // Send email
  async send(options: EmailOptions): Promise<void> {
    const mailOptions = {
      from: config.email.from,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html,
    };

    await this.transporter.sendMail(mailOptions);
  }

  // Send order confirmation email
  async sendOrderConfirmation(user: IUser | UserModel, order: IOrder): Promise<void> {
    const subject = `Order Confirmation - Order #${order._id}`;
    
    // Create a simple HTML template for the order confirmation
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Thank you for your order!</h2>
        <p>Hello ${user.username},</p>
        <p>Your order has been received and is being processed.</p>
        
        <h3>Order Details:</h3>
        <p><strong>Order ID:</strong> ${order._id}</p>
        <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
        <p><strong>Order Status:</strong> ${order.status}</p>
        <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
        <p><strong>Payment Status:</strong> ${order.paymentStatus}</p>
        
        <h3>Items:</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #f2f2f2;">
              <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Product</th>
              <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Quantity</th>
              <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Price</th>
              <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${order.items.map(item => `
              <tr>
                <td style="padding: 8px; text-align: left; border: 1px solid #ddd;">${item.name}</td>
                <td style="padding: 8px; text-align: left; border: 1px solid #ddd;">${item.quantity}</td>
                <td style="padding: 8px; text-align: left; border: 1px solid #ddd;">$${item.price.toFixed(2)}</td>
                <td style="padding: 8px; text-align: left; border: 1px solid #ddd;">$${(item.price * item.quantity).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3" style="padding: 8px; text-align: right; border: 1px solid #ddd;"><strong>Total:</strong></td>
              <td style="padding: 8px; text-align: left; border: 1px solid #ddd;">$${order.totalAmount.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
        
        <h3>Shipping Address:</h3>
        <p>
          ${order.shippingAddress.street}<br>
          ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}<br>
          ${order.shippingAddress.country}
        </p>
        
        <p>We will notify you when your order has been shipped.</p>
        <p>Thank you for shopping with us!</p>
        <p>The Mobile Shop Team</p>
      </div>
    `;

    await this.send({
      email: user.email,
      subject,
      message: 'Thank you for your order! Your order has been received and is being processed.',
      html,
    });
  }

  // Send order status update email
  async sendOrderStatusUpdate(user: IUser | UserModel, order: IOrder): Promise<void> {
    const subject = `Order Status Update - Order #${order._id}`;
    
    let statusMessage = '';
    switch (order.status) {
      case 'processing':
        statusMessage = 'Your order is now being processed.';
        break;
      case 'shipped':
        statusMessage = 'Your order has been shipped and is on its way to you!';
        break;
      case 'delivered':
        statusMessage = 'Your order has been delivered. We hope you enjoy your purchase!';
        break;
      case 'cancelled':
        statusMessage = 'Your order has been cancelled.';
        break;
      default:
        statusMessage = `Your order status has been updated to: ${order.status}`;
    }
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Order Status Update</h2>
        <p>Hello ${user.username},</p>
        <p>${statusMessage}</p>
        
        <h3>Order Details:</h3>
        <p><strong>Order ID:</strong> ${order._id}</p>
        <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
        <p><strong>New Status:</strong> ${order.status}</p>
        
        <p>Thank you for shopping with us!</p>
        <p>The Mobile Shop Team</p>
      </div>
    `;

    await this.send({
      email: user.email,
      subject,
      message: statusMessage,
      html,
    });
  }

  // Send payment confirmation email
  async sendPaymentConfirmation(user: IUser | UserModel, order: IOrder): Promise<void> {
    const subject = `Payment Confirmation - Order #${order._id}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Payment Confirmation</h2>
        <p>Hello ${user.username},</p>
        <p>We have received your payment for order #${order._id}. Thank you!</p>
        
        <h3>Payment Details:</h3>
        <p><strong>Order ID:</strong> ${order._id}</p>
        <p><strong>Payment Date:</strong> ${order.paymentDetails?.paymentDate ? new Date(order.paymentDetails.paymentDate).toLocaleDateString() : 'N/A'}</p>
        <p><strong>Transaction ID:</strong> ${order.paymentDetails?.transactionId || 'N/A'}</p>
        <p><strong>Amount:</strong> $${order.totalAmount.toFixed(2)}</p>
        
        <p>Your order is now being processed and will be shipped soon.</p>
        <p>Thank you for shopping with us!</p>
        <p>The Mobile Shop Team</p>
      </div>
    `;

    await this.send({
      email: user.email,
      subject,
      message: 'We have received your payment. Thank you!',
      html,
    });
  }
}

export default new Email();
