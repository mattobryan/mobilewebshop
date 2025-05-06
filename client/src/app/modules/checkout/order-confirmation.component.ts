import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: /* html */ `
    <div class="confirmation-container">
      <div class="confirmation-header">
        <div class="success-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        </div>
        <h2>Order Confirmed!</h2>
        <p class="thank-you-message">Thank you for your purchase.</p>
      </div>
      
      <div class="order-details" *ngIf="order">
        <div class="order-info">
          <h3>Order Information</h3>
          <div class="info-row">
            <span class="label">Order ID:</span>
            <span class="value">{{ order._id }}</span>
          </div>
          <div class="info-row">
            <span class="label">Date:</span>
            <span class="value">{{ order.createdAt | date:'medium' }}</span>
          </div>
          <div class="info-row">
            <span class="label">Status:</span>
            <span class="value status-badge" [ngClass]="'status-' + order.status">
              {{ order.status | titlecase }}
            </span>
          </div>
          <div class="info-row">
            <span class="label">Payment Method:</span>
            <span class="value">{{ order.paymentMethod | titlecase }}</span>
          </div>
          <div class="info-row">
            <span class="label">Payment Status:</span>
            <span class="value status-badge" [ngClass]="'payment-' + order.paymentStatus">
              {{ order.paymentStatus | titlecase }}
            </span>
          </div>
        </div>
        
        <div class="shipping-info">
          <h3>Shipping Information</h3>
          <p>{{ order.shippingAddress?.name }}</p>
          <p>{{ order.shippingAddress?.street }}</p>
          <p>{{ order.shippingAddress?.city }}, {{ order.shippingAddress?.state }} {{ order.shippingAddress?.postalCode }}</p>
          <p>{{ order.shippingAddress?.country }}</p>
          <p>{{ order.shippingAddress?.phone }}</p>
        </div>
        
        <div class="order-items">
          <h3>Order Items</h3>
          <div class="items-table">
            <div class="table-header">
              <div class="col product-col">Product</div>
              <div class="col price-col">Price</div>
              <div class="col qty-col">Qty</div>
              <div class="col total-col">Total</div>
            </div>
            
            <div class="table-row" *ngFor="let item of order.items">
              <div class="col product-col">
                <div class="product-info">
                  <div class="product-image" *ngIf="item.product?.imageUrl">
                    <img [src]="item.product?.imageUrl" [alt]="item.product?.name" onerror="this.src='/assets/placeholder.jpg'">
                  </div>
                  <div class="product-name">
                    {{ item.product?.name || 'Product no longer available' }}
                  </div>
                </div>
              </div>
              <div class="col price-col">\${{ item.price?.toFixed(2) }}</div>
              <div class="col qty-col">{{ item.quantity }}</div>
              <div class="col total-col">\${{ (item.price * item.quantity).toFixed(2) }}</div>
            </div>
          </div>
          
          <div class="order-summary">
            <div class="summary-row">
              <span>Subtotal:</span>
              <span>\${{ order.totalAmount?.toFixed(2) }}</span>
            </div>
            <div class="summary-row">
              <span>Shipping:</span>
              <span>Free</span>
            </div>
            <div class="summary-row total">
              <span>Total:</span>
              <span>\${{ order.totalAmount?.toFixed(2) }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="loading" *ngIf="loading">
        <p>Loading order details...</p>
      </div>
      
      <div class="error-container" *ngIf="error">
        <div class="error-message">{{ error }}</div>
      </div>
      
      <div class="actions">
        <button class="track-order-btn" *ngIf="order" (click)="trackOrder()">Track Order</button>
        <button class="continue-shopping-btn" routerLink="/products">Continue Shopping</button>
        <button class="view-orders-btn" routerLink="/orders">View All Orders</button>
      </div>
    </div>
  `,
  styles: [`
    .confirmation-container {
      max-width: 900px;
      margin: 30px auto;
      padding: 20px;
      background-color: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
    .confirmation-header {
      text-align: center;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 1px solid #eee;
    }
    .success-icon {
      display: flex;
      justify-content: center;
      margin-bottom: 15px;
    }
    .success-icon svg {
      color: #2a9d8f;
    }
    h2 {
      margin: 0 0 10px 0;
      color: #333;
      font-size: 28px;
    }
    .thank-you-message {
      font-size: 18px;
      color: #666;
      margin: 0;
    }
    h3 {
      margin-top: 0;
      margin-bottom: 15px;
      color: #333;
      font-size: 20px;
    }
    .order-details {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }
    .order-items {
      grid-column: 1 / -1;
      margin-top: 20px;
    }
    .info-row {
      display: flex;
      margin-bottom: 10px;
    }
    .label {
      font-weight: bold;
      width: 140px;
      color: #555;
    }
    .value {
      flex: 1;
    }
    .status-badge {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 12px;
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
    .payment-pending {
      background-color: #fff3cd;
      color: #856404;
    }
    .payment-paid {
      background-color: #d4edda;
      color: #155724;
    }
    .payment-failed {
      background-color: #f8d7da;
      color: #721c24;
    }
    .shipping-info p {
      margin: 5px 0;
      color: #555;
    }
    .items-table {
      margin-bottom: 20px;
      border: 1px solid #eee;
      border-radius: 4px;
      overflow: hidden;
    }
    .table-header {
      display: flex;
      background-color: #f5f5f5;
      padding: 10px;
      font-weight: bold;
      color: #333;
    }
    .table-row {
      display: flex;
      padding: 15px 10px;
      border-top: 1px solid #eee;
    }
    .col {
      padding: 0 5px;
    }
    .product-col {
      flex: 3;
    }
    .price-col, .qty-col, .total-col {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .product-info {
      display: flex;
      align-items: center;
    }
    .product-image {
      width: 60px;
      height: 60px;
      margin-right: 15px;
    }
    .product-image img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      border-radius: 4px;
    }
    .product-name {
      font-weight: 500;
    }
    .order-summary {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid #eee;
      max-width: 300px;
      margin-left: auto;
    }
    .summary-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
    }
    .total {
      font-weight: bold;
      font-size: 18px;
      margin-top: 10px;
      padding-top: 10px;
      border-top: 1px solid #ddd;
    }
    .loading {
      text-align: center;
      padding: 40px;
      color: #666;
    }
    .error-container {
      margin: 20px 0;
      padding: 15px;
      background-color: #f8d7da;
      color: #721c24;
      border-radius: 4px;
    }
    .actions {
      display: flex;
      justify-content: center;
      gap: 15px;
      margin-top: 30px;
      flex-wrap: wrap;
    }
    button {
      padding: 12px 20px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
      transition: background-color 0.3s;
    }
    .track-order-btn {
      background-color: #2a9d8f;
      color: white;
    }
    .track-order-btn:hover {
      background-color: #218879;
    }
    .continue-shopping-btn {
      background-color: #457b9d;
      color: white;
    }
    .continue-shopping-btn:hover {
      background-color: #366785;
    }
    .view-orders-btn {
      background-color: #6c757d;
      color: white;
    }
    .view-orders-btn:hover {
      background-color: #5a6268;
    }
    @media (max-width: 768px) {
      .order-details {
        grid-template-columns: 1fr;
      }
      .table-header {
        display: none;
      }
      .table-row {
        flex-direction: column;
        padding: 15px;
      }
      .col {
        padding: 5px 0;
      }
      .price-col, .qty-col, .total-col {
        justify-content: flex-start;
      }
      .price-col:before {
        content: "Price: ";
        font-weight: bold;
        margin-right: 5px;
      }
      .qty-col:before {
        content: "Quantity: ";
        font-weight: bold;
        margin-right: 5px;
      }
      .total-col:before {
        content: "Total: ";
        font-weight: bold;
        margin-right: 5px;
      }
    }
  `]
})
export class OrderConfirmationComponent implements OnInit {
  orderId: string | null = null;
  order: any = null;
  loading = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.orderId = params['orderId'];
      if (this.orderId) {
        this.loadOrderDetails();
      } else {
        this.error = 'Order ID not found. Please check your orders history.';
        this.loading = false;
      }
    });
  }

  loadOrderDetails(): void {
    if (!this.orderId) return;
    
    this.loading = true;
    this.error = null;
    
    this.apiService.get(`orders/${this.orderId}`).subscribe({
      next: (response: any) => {
        if (response && response.data && response.data.order) {
          this.order = response.data.order;
        } else {
          this.error = 'Could not load order details.';
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading order:', err);
        this.error = err.error?.message || 'Failed to load order details. Please try again later.';
        this.loading = false;
      }
    });
  }

  trackOrder(): void {
    // In a real application, this would navigate to an order tracking page
    // For now, we'll just show an alert
    alert(`Tracking information for order ${this.orderId} will be available soon.`);
  }
}
