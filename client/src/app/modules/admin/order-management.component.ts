import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-order-management',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: /* html */ `
    <div class="order-management-container">
      <div class="page-header">
        <h2>Order Management</h2>
      </div>
      
      <div class="filters">
        <div class="search-box">
          <input 
            type="text" 
            placeholder="Search by order ID or customer name" 
            [(ngModel)]="searchQuery"
            (input)="applyFilters()">
        </div>
        
        <div class="filter-dropdown">
          <select [(ngModel)]="statusFilter" (change)="applyFilters()">
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        
        <div class="filter-dropdown">
          <select [(ngModel)]="paymentFilter" (change)="applyFilters()">
            <option value="all">All Payment Statuses</option>
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
          </select>
        </div>
      </div>
      
      <div class="loading" *ngIf="isLoading">Loading orders...</div>
      
      <div class="empty-data" *ngIf="!isLoading && filteredOrders.length === 0">
        <p>No orders found matching your criteria.</p>
      </div>
      
      <div class="orders-table-container" *ngIf="!isLoading && filteredOrders.length > 0">
        <table class="data-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
              <th>Payment</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let order of filteredOrders">
              <td>{{ order._id.substring(order._id.length - 8) }}</td>
              <td>{{ order.user?.username || 'Guest User' }}</td>
              <td>{{ order.createdAt | date:'short' }}</td>
              <td>{{ order.items?.length || 0 }}</td>
              <td>\${{ order.totalAmount?.toFixed(2) }}</td>
              <td>
                <span class="status-badge" [ngClass]="'status-' + order.status">
                  {{ order.status | titlecase }}
                </span>
              </td>
              <td>
                <span class="status-badge" [ngClass]="'payment-' + order.paymentStatus">
                  {{ order.paymentStatus | titlecase }}
                </span>
              </td>
              <td class="actions-cell">
                <button class="view-btn" (click)="viewOrderDetails(order)">View</button>
                <button class="update-btn" (click)="openUpdateModal(order)">Update</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Order Details Modal -->
      <div class="modal" *ngIf="showDetailsModal">
        <div class="modal-content modal-lg">
          <div class="modal-header">
            <h3>Order Details</h3>
            <button class="close-btn" (click)="closeDetailsModal()">×</button>
          </div>
          <div class="modal-body" *ngIf="selectedOrder">
            <div class="order-details-grid">
              <div class="order-info">
                <h4>Order Information</h4>
                <div class="info-row">
                  <span class="label">Order ID:</span>
                  <span class="value">{{ selectedOrder._id }}</span>
                </div>
                <div class="info-row">
                  <span class="label">Date:</span>
                  <span class="value">{{ selectedOrder.createdAt | date:'medium' }}</span>
                </div>
                <div class="info-row">
                  <span class="label">Status:</span>
                  <span class="value status-badge" [ngClass]="'status-' + selectedOrder.status">
                    {{ selectedOrder.status | titlecase }}
                  </span>
                </div>
                <div class="info-row">
                  <span class="label">Payment Method:</span>
                  <span class="value">{{ selectedOrder.paymentMethod | titlecase }}</span>
                </div>
                <div class="info-row">
                  <span class="label">Payment Status:</span>
                  <span class="value status-badge" [ngClass]="'payment-' + selectedOrder.paymentStatus">
                    {{ selectedOrder.paymentStatus | titlecase }}
                  </span>
                </div>
                <div class="info-row" *ngIf="selectedOrder.paymentDetails?.transactionId">
                  <span class="label">Transaction ID:</span>
                  <span class="value">{{ selectedOrder.paymentDetails.transactionId }}</span>
                </div>
              </div>
              
              <div class="customer-info">
                <h4>Customer Information</h4>
                <div class="info-row">
                  <span class="label">Name:</span>
                  <span class="value">{{ selectedOrder.user?.username || 'Guest User' }}</span>
                </div>
                <div class="info-row">
                  <span class="label">Email:</span>
                  <span class="value">{{ selectedOrder.user?.email || 'N/A' }}</span>
                </div>
              </div>
              
              <div class="shipping-info">
                <h4>Shipping Information</h4>
                <div *ngIf="selectedOrder.shippingAddress">
                  <p>{{ selectedOrder.shippingAddress.name }}</p>
                  <p>{{ selectedOrder.shippingAddress.street }}</p>
                  <p>{{ selectedOrder.shippingAddress.city }}, {{ selectedOrder.shippingAddress.state }} {{ selectedOrder.shippingAddress.postalCode }}</p>
                  <p>{{ selectedOrder.shippingAddress.country }}</p>
                  <p>{{ selectedOrder.shippingAddress.phone }}</p>
                </div>
                <div *ngIf="!selectedOrder.shippingAddress">
                  <p>No shipping information available</p>
                </div>
              </div>
            </div>
            
            <div class="order-items">
              <h4>Order Items</h4>
              <table class="items-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let item of selectedOrder.items">
                    <td class="product-cell">
                      <div class="product-info">
                        <div class="product-image" *ngIf="item.product?.imageUrl">
                          <img [src]="item.product?.imageUrl" [alt]="item.product?.name" onerror="this.src='/assets/placeholder.jpg'">
                        </div>
                        <div class="product-name">
                          {{ item.product?.name || 'Product no longer available' }}
                        </div>
                      </div>
                    </td>
                    <td>\${{ item.price?.toFixed(2) }}</td>
                    <td>{{ item.quantity }}</td>
                    <td>\${{ (item.price * item.quantity).toFixed(2) }}</td>
                  </tr>
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="3" class="text-right">Subtotal:</td>
                    <td>\${{ selectedOrder.totalAmount?.toFixed(2) }}</td>
                  </tr>
                  <tr>
                    <td colspan="3" class="text-right">Shipping:</td>
                    <td>Free</td>
                  </tr>
                  <tr class="total-row">
                    <td colspan="3" class="text-right">Total:</td>
                    <td>\${{ selectedOrder.totalAmount?.toFixed(2) }}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
          <div class="modal-footer">
            <button class="close-btn" (click)="closeDetailsModal()">Close</button>
            <button class="update-btn" (click)="openUpdateModal(selectedOrder)">Update Order</button>
          </div>
        </div>
      </div>
      
      <!-- Update Order Modal -->
      <div class="modal" *ngIf="showUpdateModal">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Update Order Status</h3>
            <button class="close-btn" (click)="closeUpdateModal()">×</button>
          </div>
          <div class="modal-body" *ngIf="orderToUpdate">
            <div class="form-group">
              <label for="orderStatus">Order Status</label>
              <select id="orderStatus" [(ngModel)]="orderToUpdate.status">
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            
            <div class="form-group">
              <label for="paymentStatus">Payment Status</label>
              <select id="paymentStatus" [(ngModel)]="orderToUpdate.paymentStatus">
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="failed">Failed</option>
              </select>
            </div>
            
            <div class="form-group" *ngIf="orderToUpdate.paymentStatus === 'paid'">
              <label for="transactionId">Transaction ID</label>
              <input type="text" id="transactionId" [(ngModel)]="transactionId">
            </div>
            
            <div class="form-group" *ngIf="orderToUpdate.status === 'shipped'">
              <label for="trackingNumber">Tracking Number</label>
              <input type="text" id="trackingNumber" [(ngModel)]="trackingNumber">
            </div>
            
            <div class="form-group">
              <label for="notes">Notes</label>
              <textarea id="notes" [(ngModel)]="notes" rows="3" placeholder="Add any notes about this update"></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button class="cancel-btn" (click)="closeUpdateModal()">Cancel</button>
            <button class="save-btn" (click)="updateOrder()" [disabled]="isUpdating">
              {{ isUpdating ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </div>
      </div>
      
      <div class="error-container" *ngIf="error">
        <div class="error-message">{{ error }}</div>
      </div>
      
      <div class="success-container" *ngIf="successMessage">
        <div class="success-message">{{ successMessage }}</div>
      </div>
    </div>
  `,
  styles: [`
    .order-management-container {
      max-width: 1200px;
      margin: 20px auto;
      padding: 20px;
    }
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    h2 {
      margin: 0;
      color: #333;
      font-size: 28px;
    }
    .filters {
      display: flex;
      gap: 15px;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }
    .search-box {
      flex: 2;
      min-width: 200px;
    }
    .search-box input {
      width: 100%;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 16px;
    }
    .filter-dropdown {
      flex: 1;
      min-width: 150px;
    }
    .filter-dropdown select {
      width: 100%;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 16px;
      background-color: white;
    }
    .loading, .empty-data {
      text-align: center;
      padding: 40px;
      color: #666;
    }
    .data-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    .data-table th, .data-table td {
      padding: 12px 15px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }
    .data-table th {
      background-color: #f5f5f5;
      font-weight: bold;
      color: #333;
    }
    .data-table tbody tr:hover {
      background-color: #f9f9f9;
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
    .status-cancelled {
      background-color: #f8d7da;
      color: #721c24;
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
    .actions-cell {
      white-space: nowrap;
    }
    .actions-cell button {
      margin-right: 5px;
      padding: 6px 10px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
      transition: background-color 0.3s;
    }
    .view-btn {
      background-color: #6c757d;
      color: white;
    }
    .view-btn:hover {
      background-color: #5a6268;
    }
    .update-btn {
      background-color: #f4a261;
      color: white;
    }
    .update-btn:hover {
      background-color: #e08c48;
    }
    
    /* Modal Styles */
    .modal {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 1000;
    }
    .modal-content {
      background-color: white;
      border-radius: 8px;
      width: 500px;
      max-width: 90%;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }
    .modal-lg {
      width: 800px;
    }
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px 20px;
      border-bottom: 1px solid #ddd;
      position: sticky;
      top: 0;
      background-color: white;
      z-index: 1;
    }
    .modal-header h3 {
      margin: 0;
      color: #333;
    }
    .close-btn {
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      color: #666;
    }
    .modal-body {
      padding: 20px;
    }
    .modal-footer {
      padding: 15px 20px;
      border-top: 1px solid #ddd;
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      position: sticky;
      bottom: 0;
      background-color: white;
      z-index: 1;
    }
    .modal-footer button {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    }
    .cancel-btn {
      background-color: #e9ecef;
      color: #495057;
    }
    .cancel-btn:hover {
      background-color: #dee2e6;
    }
    .save-btn {
      background-color: #2a9d8f;
      color: white;
    }
    .save-btn:hover:not(:disabled) {
      background-color: #218879;
    }
    .save-btn:disabled {
      background-color: #cccccc;
      cursor: not-allowed;
    }
    
    /* Order Details Styles */
    .order-details-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 20px;
    }
    .order-info, .customer-info, .shipping-info {
      background-color: #f9f9f9;
      padding: 15px;
      border-radius: 8px;
    }
    .shipping-info {
      grid-column: 2;
      grid-row: 1 / span 2;
    }
    h4 {
      margin-top: 0;
      margin-bottom: 15px;
      color: #333;
      font-size: 18px;
      padding-bottom: 5px;
      border-bottom: 1px solid #eee;
    }
    .info-row {
      display: flex;
      margin-bottom: 8px;
    }
    .label {
      font-weight: bold;
      width: 140px;
      color: #555;
    }
    .value {
      flex: 1;
    }
    .shipping-info p {
      margin: 5px 0;
      color: #555;
    }
    .order-items {
      margin-top: 20px;
    }
    .items-table {
      width: 100%;
      border-collapse: collapse;
    }
    .items-table th, .items-table td {
      padding: 10px;
      text-align: left;
      border-bottom: 1px solid #eee;
    }
    .items-table th {
      background-color: #f5f5f5;
      font-weight: bold;
    }
    .product-cell {
      width: 50%;
    }
    .product-info {
      display: flex;
      align-items: center;
    }
    .product-image {
      width: 50px;
      height: 50px;
      margin-right: 10px;
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
    .text-right {
      text-align: right;
      font-weight: bold;
    }
    .total-row {
      font-size: 18px;
      font-weight: bold;
    }
    .total-row td {
      border-top: 2px solid #ddd;
      padding-top: 15px;
    }
    
    /* Form Styles */
    .form-group {
      margin-bottom: 15px;
    }
    label {
      display: block;
      margin-bottom: 5px;
      font-weight: bold;
      color: #555;
    }
    select, input, textarea {
      width: 100%;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 16px;
    }
    textarea {
      resize: vertical;
    }
    
    .error-container, .success-container {
      margin-top: 20px;
      padding: 15px;
      border-radius: 4px;
    }
    .error-container {
      background-color: #f8d7da;
      color: #721c24;
    }
    .success-container {
      background-color: #d4edda;
      color: #155724;
    }
    @media (max-width: 768px) {
      .page-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
      }
      .filters {
        flex-direction: column;
      }
      .data-table {
        display: block;
        overflow-x: auto;
      }
      .order-details-grid {
        grid-template-columns: 1fr;
      }
      .shipping-info {
        grid-column: 1;
        grid-row: auto;
      }
    }
  `]
})
export class OrderManagementComponent implements OnInit {
  orders: any[] = [];
  filteredOrders: any[] = [];
  isLoading = true;
  error: string | null = null;
  successMessage: string | null = null;
  
  // Filters
  searchQuery = '';
  statusFilter = 'all';
  paymentFilter = 'all';
  
  // Order details modal
  showDetailsModal = false;
  selectedOrder: any = null;
  
  // Update order modal
  showUpdateModal = false;
  orderToUpdate: any = null;
  isUpdating = false;
  transactionId = '';
  trackingNumber = '';
  notes = '';

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading = true;
    this.error = null;
    
    this.apiService.get('orders').subscribe({
      next: (response: any) => {
        if (response && response.data && response.data.orders) {
          this.orders = response.data.orders;
          // Sort orders by date (newest first)
          this.orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          this.filteredOrders = [...this.orders];
        } else {
          this.orders = [];
          this.filteredOrders = [];
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading orders:', err);
        this.error = 'Failed to load orders. Please try again later.';
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    this.filteredOrders = this.orders.filter(order => {
      // Apply search filter
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        const orderId = order._id.toLowerCase();
        const customerName = (order.user?.username || '').toLowerCase();
        
        if (!orderId.includes(query) && !customerName.includes(query)) {
          return false;
        }
      }
      
      // Apply status filter
      if (this.statusFilter !== 'all' && order.status !== this.statusFilter) {
        return false;
      }
      
      // Apply payment filter
      if (this.paymentFilter !== 'all' && order.paymentStatus !== this.paymentFilter) {
        return false;
      }
      
      return true;
    });
  }

  viewOrderDetails(order: any): void {
    this.selectedOrder = { ...order };
    this.showDetailsModal = true;
  }

  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.selectedOrder = null;
  }

  openUpdateModal(order: any): void {
    this.orderToUpdate = { ...order };
    this.transactionId = order.paymentDetails?.transactionId || '';
    this.trackingNumber = order.trackingNumber || '';
    this.notes = '';
    this.showUpdateModal = true;
    
    // Close details modal if it's open
    if (this.showDetailsModal) {
      this.showDetailsModal = false;
    }
  }

  closeUpdateModal(): void {
    this.showUpdateModal = false;
    this.orderToUpdate = null;
    this.transactionId = '';
    this.trackingNumber = '';
    this.notes = '';
  }

  updateOrder(): void {
    if (!this.orderToUpdate) return;
    
    this.isUpdating = true;
    this.error = null;
    
    // Prepare update data
    const updateData: any = {
      status: this.orderToUpdate.status,
      paymentStatus: this.orderToUpdate.paymentStatus
    };
    
    // Add transaction ID if payment is marked as paid
    if (this.orderToUpdate.paymentStatus === 'paid' && this.transactionId) {
      updateData.paymentDetails = {
        transactionId: this.transactionId
      };
    }
    
    // Add tracking number if order is marked as shipped
    if (this.orderToUpdate.status === 'shipped' && this.trackingNumber) {
      updateData.trackingNumber = this.trackingNumber;
    }
    
    // Add notes if provided
    if (this.notes) {
      updateData.notes = this.notes;
    }
    
    this.apiService.patch(`orders/${this.orderToUpdate._id}`, updateData).subscribe({
      next: (response: any) => {
        this.isUpdating = false;
        this.showUpdateModal = false;
        
        // Update the order in the arrays
        const updatedOrder = response.data?.order || this.orderToUpdate;
        
        // Update in orders array
        const orderIndex = this.orders.findIndex(o => o._id === this.orderToUpdate._id);
        if (orderIndex !== -1) {
          this.orders[orderIndex] = {
            ...this.orders[orderIndex],
            status: updatedOrder.status,
            paymentStatus: updatedOrder.paymentStatus,
            paymentDetails: updatedOrder.paymentDetails,
            trackingNumber: updatedOrder.trackingNumber
          };
        }
        
        // Update in filtered orders array
        const filteredIndex = this.filteredOrders.findIndex(o => o._id === this.orderToUpdate._id);
        if (filteredIndex !== -1) {
          this.filteredOrders[filteredIndex] = {
            ...this.filteredOrders[filteredIndex],
            status: updatedOrder.status,
            paymentStatus: updatedOrder.paymentStatus,
            paymentDetails: updatedOrder.paymentDetails,
            trackingNumber: updatedOrder.trackingNumber
          };
        }
        
        this.successMessage = `Order ${this.orderToUpdate._id.substring(this.orderToUpdate._id.length - 8)} has been updated.`;
        this.orderToUpdate = null;
        
        // Clear success message after 5 seconds
        setTimeout(() => {
          this.successMessage = null;
        }, 5000);
      },
      error: (err) => {
        console.error('Error updating order:', err);
        this.error = err.error?.message || 'Failed to update order. Please try again.';
        this.isUpdating = false;
      }
    });
  }
}
