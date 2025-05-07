import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-order-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="order-card">
      <div class="order-header">
        <div class="order-info">
          <h3>Order #{{ order._id.substring(order._id.length - 8) }}</h3>
          <p class="order-date">{{ order.createdAt | date:'medium' }}</p>
        </div>
        <div class="order-status" [ngClass]="getStatusClass(order.status)">
          {{ order.status | titlecase }}
        </div>
      </div>

      <div class="order-items">
        <div class="order-item" *ngFor="let item of order.items">
          <div class="item-quantity">{{ item.quantity }}x</div>
          <div class="item-name">{{ item.name }}</div>
          <div class="item-price">\${{ item.price.toFixed(2) }}</div>
        </div>
      </div>

      <div class="order-footer">
        <div class="order-details">
          <div class="detail-row">
            <span>Payment Method:</span>
            <span>{{ getPaymentMethodDisplay(order.paymentMethod) }}</span>
          </div>
          <div class="detail-row">
            <span>Payment Status:</span>
            <span [ngClass]="getPaymentStatusClass(order.paymentStatus)">
              {{ order.paymentStatus | titlecase }}
            </span>
          </div>
          <div class="detail-row">
            <span>Shipping Address:</span>
            <span>{{ formatAddress(order.shippingAddress) }}</span>
          </div>
        </div>

        <div class="order-total">
          <span>Total:</span>
          <span class="total-amount">\${{ order.totalAmount.toFixed(2) }}</span>
        </div>

        <div class="order-actions" *ngIf="order.status === 'pending' || order.status === 'processing'">
          <button class="cancel-btn" (click)="cancel.emit(order._id)">Cancel Order</button>
        </div>
      </div>
    </div>
  `,
  styles: [/* same styles for .order-card and inner elements */]
})
export class OrderCardComponent {
  @Input() order: any;
  @Output() cancel = new EventEmitter<string>();

  getStatusClass(status: string): string {
    return `status-${status.toLowerCase()}`;
  }

  getPaymentStatusClass(status: string): string {
    return `payment-${status.toLowerCase()}`;
  }

  getPaymentMethodDisplay(method: string): string {
    switch (method) {
      case 'credit_card':
        return 'Credit Card';
      case 'paypal':
        return 'PayPal';
      case 'stripe':
        return 'Stripe';
      default:
        return method;
    }
  }

  formatAddress(address: any): string {
    if (!address) return 'N/A';
    return `${address.street}, ${address.city}, ${address.state} ${address.postalCode}, ${address.country}`;
  }
}



