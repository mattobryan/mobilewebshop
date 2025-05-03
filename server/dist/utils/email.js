"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer_1 = __importDefault(require("nodemailer"));
const config_1 = __importDefault(require("../config/config"));
class Email {
    constructor() {
        this.transporter = nodemailer_1.default.createTransport({
            host: config_1.default.email.host,
            port: config_1.default.email.port,
            auth: {
                user: config_1.default.email.user,
                pass: config_1.default.email.pass,
            },
        });
    }
    // Send email
    send(options) {
        return __awaiter(this, void 0, void 0, function* () {
            const mailOptions = {
                from: config_1.default.email.from,
                to: options.email,
                subject: options.subject,
                text: options.message,
                html: options.html,
            };
            yield this.transporter.sendMail(mailOptions);
        });
    }
    // Send order confirmation email
    sendOrderConfirmation(user, order) {
        return __awaiter(this, void 0, void 0, function* () {
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
            yield this.send({
                email: user.email,
                subject,
                message: 'Thank you for your order! Your order has been received and is being processed.',
                html,
            });
        });
    }
    // Send order status update email
    sendOrderStatusUpdate(user, order) {
        return __awaiter(this, void 0, void 0, function* () {
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
            yield this.send({
                email: user.email,
                subject,
                message: statusMessage,
                html,
            });
        });
    }
    // Send payment confirmation email
    sendPaymentConfirmation(user, order) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const subject = `Payment Confirmation - Order #${order._id}`;
            const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Payment Confirmation</h2>
        <p>Hello ${user.username},</p>
        <p>We have received your payment for order #${order._id}. Thank you!</p>
        
        <h3>Payment Details:</h3>
        <p><strong>Order ID:</strong> ${order._id}</p>
        <p><strong>Payment Date:</strong> ${((_a = order.paymentDetails) === null || _a === void 0 ? void 0 : _a.paymentDate) ? new Date(order.paymentDetails.paymentDate).toLocaleDateString() : 'N/A'}</p>
        <p><strong>Transaction ID:</strong> ${((_b = order.paymentDetails) === null || _b === void 0 ? void 0 : _b.transactionId) || 'N/A'}</p>
        <p><strong>Amount:</strong> $${order.totalAmount.toFixed(2)}</p>
        
        <p>Your order is now being processed and will be shipped soon.</p>
        <p>Thank you for shopping with us!</p>
        <p>The Mobile Shop Team</p>
      </div>
    `;
            yield this.send({
                email: user.email,
                subject,
                message: 'We have received your payment. Thank you!',
                html,
            });
        });
    }
}
exports.default = new Email();
