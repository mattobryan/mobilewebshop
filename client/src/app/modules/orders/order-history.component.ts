import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-order-history',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: /* html */ `
    <div class="order-history-container">
      <h2>My Orders</h2>
      
      <div class="loading" *ngIf="isLoading">Loading your orders...</div>
      
      <div class="empty-orders" *ngIf="!isLoading && orders.length === 0">
        <p>You haven't placed any orders yet.</p>
        <button class="shop-now-btn" routerLink="/products">Shop Now</button>
      </div>
      
      <div class="orders-list" *ngIf="!isLoading && orders.length > 0">
        <div class="order-card" *ngFor="let order of orders">
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
              <button class="cancel-btn" (click)="cancelOrder(order._id)">Cancel Order</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="error-container" *ngIf="error">
      <div class="error-message">{{ error }}</div>
    </div>
  `,
  styles: [`
    .order-history-container {
      max-width: 1000px;
      margin: 20px auto;
      padding: 20px;
    }
    h2 {
      margin-bottom: 20px;
      color: #333;
      text-align: center;
    }
    .loading {
      text-align: center;
      padding: 40px;
      font-size: 18px;
      color: #666;
    }
    .empty-orders {
      text-align: center;
      padding: 40px;
      background-color: #f9f9f9;
      border-radius: 8px;
    }
    .empty-orders p {
      font-size: 18px;
      color: #666;
      margin-bottom: 20px;
    }
    .shop-now-btn {
      padding: 12px 24px;
      background-color: #2a9d8f;
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 16px;
      cursor: pointer;
      transition: background-color 0.3s;
    }
    .shop-now-btn:hover {
      background-color: #218879;
    }
    .orders-list {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .order-card {
      background-color: #f9f9f9;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .order-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px;
      background-color: #f1f1f1;
      border-bottom: 1px solid #ddd;
    }
    .order-info h3 {
      margin: 0;
      font-size: 18px;
      color: #333;
    }
    .order-date {
      margin: 5px 0 0 0;
      font-size: 14px;
      color: #666;
    }
    .order-status {
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: bold;
    }
    .status-pending {
      background-color: #fff3cd;
      color: #856404;
    }
    .status-processing {
      background-color: #cce5ff;
      color: #004085;
    }
    .status-shipped {
      background-color: #d4edda;
      color: #155724;
    }
    .status-delivered {
      background-color: #d1e7dd;
      color: #0f5132;
    }
    .status-cancelled {
      background-color: #f8d7da;
      color: #721c24;
    }
    .order-items {
      padding: 15px;
      border-bottom: 1px solid #ddd;
    }
    .order-item {
      display: flex;
      align-items: center;
      margin-bottom: 10px;
    }
    .order-item:last-child {
      margin-bottom: 0;
    }
    .item-quantity {
      width: 40px;
      font-weight: bold;
      color: #555;
    }
    .item-name {
      flex: 1;
    }
    .item-price {
      font-weight: bold;
      min-width: 80px;
      text-align: right;
    }
    .order-footer {
      padding: 15px;
    }
    .order-details {
      margin-bottom: 15px;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 14px;
    }
    .detail-row span:first-child {
      color: #666;
    }
    .payment-pending {
      color: #856404;
    }
    .payment-paid {
      color: #155724;
    }
    .payment-failed {
      color: #721c24;
    }
    .order-total {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
      padding-top: 10px;
      border-top: 1px solid #ddd;
      font-weight: bold;
    }
    .total-amount {
      font-size: 18px;
      color: #e63946;
    }
    .order-actions {
      display: flex;
      justify-content: flex-end;
    }
    .cancel-btn {
      padding: 8px 16px;
      background-color: #e63946;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.3s;
    }
    .cancel-btn:hover {
      background-color: #d62b39;
    }
    .error-container {
      max-width: 800px;
      margin: 20px auto;
      padding: 15px;
      background-color: #f8d7da;
      color: #721c24;
      border-radius: 4px;
    }
    @media (max-width: 768px) {
      .order-header {
        flex-direction: column;
        align-items: flex-start;
      }
      .order-status {
        margin-top: 10px;
      }
      .detail-row {
        flex-direction: column;
        margin-bottom: 12px;
      }
      .detail-row span:first-child {
        margin-bottom: 4px;
      }
    }
  `]
})
export class OrderHistoryComponent implements OnInit {
  orders: any[] = [];
  isLoading = true;
  error: string | null = null;

  constructor(
    private apiService: ApiService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading = true;
    this.error = null;

    this.apiService.get('orders/my-orders').subscribe({
      next: (response: any) => {
        if (response && response.data && response.data.orders) {
          this.orders = response.data.orders;
          // Sort orders by date (newest first)
          this.orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        } else {
          this.orders = [];
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading orders:', err);
        this.error = 'Failed to load your orders. Please try again later.';
        this.isLoading = false;
      }
    });
  }

  cancelOrder(orderId: string): void {
    if (confirm('Are you sure you want to cancel this order?')) {
      this.apiService.patch(`orders/${orderId}/cancel`, {}).subscribe({
        next: (response: any) => {
          console.log('Order cancelled successfully:', response);
          // Update the order status in the UI
          const orderIndex = this.orders.findIndex(order => order._id === orderId);
          if (orderIndex !== -1) {
            this.orders[orderIndex].status = 'cancelled';
          }
        },
        error: (err) => {
          console.error('Error cancelling order:', err);
          this.error = err.error?.message || 'Failed to cancel order. Please try again.';
        }
      });
    }
  }

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
