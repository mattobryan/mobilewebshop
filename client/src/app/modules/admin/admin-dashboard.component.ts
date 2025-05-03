import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: /* html */ `
    <div class="admin-dashboard">
      <h2>Admin Dashboard</h2>
      
      <div class="dashboard-nav">
        <button 
          class="nav-btn" 
          [class.active]="activeTab === 'orders'"
          (click)="setActiveTab('orders')">
          Orders
        </button>
        <button 
          class="nav-btn" 
          [class.active]="activeTab === 'customers'"
          (click)="setActiveTab('customers')">
          Customers
        </button>
        <button 
          class="nav-btn" 
          [class.active]="activeTab === 'products'"
          (click)="setActiveTab('products')">
          Products
        </button>
      </div>
      
      <!-- Orders Tab -->
      <div class="tab-content" *ngIf="activeTab === 'orders'">
        <div class="tab-header">
          <h3>All Orders</h3>
          <div class="filters">
            <select [(ngModel)]="orderStatusFilter" (change)="applyOrderFilters()">
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select [(ngModel)]="orderPaymentFilter" (change)="applyOrderFilters()">
              <option value="all">All Payment Statuses</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>
        
        <div class="loading" *ngIf="isLoadingOrders">Loading orders...</div>
        
        <div class="empty-data" *ngIf="!isLoadingOrders && filteredOrders.length === 0">
          <p>No orders found.</p>
        </div>
        
        <div class="orders-table-container" *ngIf="!isLoadingOrders && filteredOrders.length > 0">
          <table class="data-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Total</th>
                <th>Status</th>
                <th>Payment</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let order of filteredOrders">
                <td>{{ order._id.substring(order._id.length - 8) }}</td>
                <td>{{ order.user?.username || 'Unknown' }}</td>
                <td>{{ order.createdAt | date:'short' }}</td>
                <td>\${{ order.totalAmount.toFixed(2) }}</td>
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
                  <button class="view-btn" [routerLink]="['/admin/orders', order._id]">View</button>
                  <button class="update-btn" (click)="openUpdateOrderModal(order)">Update</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <!-- Customers Tab -->
      <div class="tab-content" *ngIf="activeTab === 'customers'">
        <div class="tab-header">
          <h3>All Customers</h3>
          <div class="filters">
            <input 
              type="text" 
              placeholder="Search by name or email" 
              [(ngModel)]="customerSearchQuery"
              (input)="applyCustomerFilters()">
          </div>
        </div>
        
        <div class="loading" *ngIf="isLoadingCustomers">Loading customers...</div>
        
        <div class="empty-data" *ngIf="!isLoadingCustomers && filteredCustomers.length === 0">
          <p>No customers found.</p>
        </div>
        
        <div class="customers-table-container" *ngIf="!isLoadingCustomers && filteredCustomers.length > 0">
          <table class="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Orders</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let customer of filteredCustomers">
                <td>{{ customer._id.substring(customer._id.length - 8) }}</td>
                <td>{{ customer.username }}</td>
                <td>{{ customer.email }}</td>
                <td>
                  <span class="role-badge" [ngClass]="'role-' + customer.role">
                    {{ customer.role | titlecase }}
                  </span>
                </td>
                <td>{{ customer.createdAt | date:'mediumDate' }}</td>
                <td>{{ customer.orderCount || 0 }}</td>
                <td class="actions-cell">
                  <button class="view-btn" (click)="viewCustomerOrders(customer._id)">View Orders</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      
      <!-- Products Tab -->
      <div class="tab-content" *ngIf="activeTab === 'products'">
        <div class="tab-header">
          <h3>All Products</h3>
          <div class="filters">
            <input 
              type="text" 
              placeholder="Search by name or brand" 
              [(ngModel)]="productSearchQuery"
              (input)="applyProductFilters()">
            <select [(ngModel)]="productCategoryFilter" (change)="applyProductFilters()">
              <option value="all">All Categories</option>
              <option value="smartphone">Smartphones</option>
              <option value="tablet">Tablets</option>
              <option value="accessory">Accessories</option>
            </select>
          </div>
        </div>
        
        <div class="add-product-btn-container">
          <button class="add-btn" routerLink="/admin/products/create">Add New Product</button>
        </div>
        
        <div class="loading" *ngIf="isLoadingProducts">Loading products...</div>
        
        <div class="empty-data" *ngIf="!isLoadingProducts && filteredProducts.length === 0">
          <p>No products found.</p>
        </div>
        
        <div class="products-table-container" *ngIf="!isLoadingProducts && filteredProducts.length > 0">
          <table class="data-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let product of filteredProducts">
                <td class="product-image-cell">
                  <img [src]="product.imageUrl" [alt]="product.name" onerror="this.src='/assets/placeholder.jpg'">
                </td>
                <td>{{ product.name }}</td>
                <td>{{ product.category | titlecase }}</td>
                <td>\${{ product.price.toFixed(2) }}</td>
                <td [ngClass]="{'low-stock': product.stock < 10}">{{ product.stock }}</td>
                <td class="actions-cell">
                  <button class="view-btn" [routerLink]="['/products', product._id]">View</button>
                  <button class="edit-btn" [routerLink]="['/admin/products/edit', product._id]">Edit</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    
    <!-- Order Update Modal -->
    <div class="modal" *ngIf="showOrderModal">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Update Order Status</h3>
          <button class="close-btn" (click)="showOrderModal = false">×</button>
        </div>
        <div class="modal-body" *ngIf="selectedOrder">
          <div class="form-group">
            <label for="orderStatus">Order Status</label>
            <select id="orderStatus" [(ngModel)]="selectedOrder.status">
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="paymentStatus">Payment Status</label>
            <select id="paymentStatus" [(ngModel)]="selectedOrder.paymentStatus">
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="failed">Failed</option>
            </select>
          </div>
          
          <div class="form-group" *ngIf="selectedOrder.paymentStatus === 'paid'">
            <label for="transactionId">Transaction ID</label>
            <input type="text" id="transactionId" [(ngModel)]="transactionId">
          </div>
        </div>
        <div class="modal-footer">
          <button class="cancel-btn" (click)="showOrderModal = false">Cancel</button>
          <button class="save-btn" (click)="updateOrder()" [disabled]="isUpdating">
            {{ isUpdating ? 'Saving...' : 'Save Changes' }}
          </button>
        </div>
      </div>
    </div>
    
    <div class="error-container" *ngIf="error">
      <div class="error-message">{{ error }}</div>
    </div>
  `,
  styles: [`
    .admin-dashboard {
      max-width: 1200px;
      margin: 20px auto;
      padding: 20px;
    }
    h2 {
      margin-bottom: 20px;
      color: #333;
      text-align: center;
    }
    .dashboard-nav {
      display: flex;
      margin-bottom: 20px;
      border-bottom: 1px solid #ddd;
    }
    .nav-btn {
      padding: 12px 20px;
      background: none;
      border: none;
      border-bottom: 3px solid transparent;
      font-size: 16px;
      cursor: pointer;
      transition: all 0.3s;
    }
    .nav-btn:hover {
      background-color: #f5f5f5;
    }
    .nav-btn.active {
      border-bottom-color: #2a9d8f;
      font-weight: bold;
    }
    .tab-content {
      background-color: #fff;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      padding: 20px;
    }
    .tab-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }
    .tab-header h3 {
      margin: 0;
      color: #333;
    }
    .filters {
      display: flex;
      gap: 10px;
    }
    .filters input, .filters select {
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
    }
    .add-product-btn-container {
      margin-bottom: 20px;
      text-align: right;
    }
    .add-btn {
      padding: 10px 16px;
      background-color: #2a9d8f;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.3s;
    }
    .add-btn:hover {
      background-color: #218879;
    }
    .loading, .empty-data {
      text-align: center;
      padding: 40px;
      font-size: 16px;
      color: #666;
    }
    .data-table {
      width: 100%;
      border-collapse: collapse;
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
    .product-image-cell {
      width: 80px;
    }
    .product-image-cell img {
      width: 60px;
      height: 60px;
      object-fit: contain;
      border-radius: 4px;
    }
    .status-badge, .role-badge {
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
    .role-admin {
      background-color: #cce5ff;
      color: #004085;
    }
    .role-customer {
      background-color: #d1e7dd;
      color: #0f5132;
    }
    .low-stock {
      color: #e63946;
      font-weight: bold;
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
    .edit-btn, .update-btn {
      background-color: #f4a261;
      color: white;
    }
    .edit-btn:hover, .update-btn:hover {
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
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px 20px;
      border-bottom: 1px solid #ddd;
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
    .form-group {
      margin-bottom: 15px;
    }
    .form-group label {
      display: block;
      margin-bottom: 5px;
      font-weight: bold;
      color: #555;
    }
    .form-group select, .form-group input {
      width: 100%;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 16px;
    }
    .modal-footer {
      padding: 15px 20px;
      border-top: 1px solid #ddd;
      display: flex;
      justify-content: flex-end;
      gap: 10px;
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
    .error-container {
      max-width: 800px;
      margin: 20px auto;
      padding: 15px;
      background-color: #f8d7da;
      color: #721c24;
      border-radius: 4px;
    }
    @media (max-width: 768px) {
      .tab-header {
        flex-direction: column;
        align-items: flex-start;
      }
      .filters {
        margin-top: 10px;
        width: 100%;
      }
      .data-table {
        display: block;
        overflow-x: auto;
      }
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  activeTab = 'orders';
  
  // Orders
  orders: any[] = [];
  filteredOrders: any[] = [];
  isLoadingOrders = true;
  orderStatusFilter = 'all';
  orderPaymentFilter = 'all';
  
  // Customers
  customers: any[] = [];
  filteredCustomers: any[] = [];
  isLoadingCustomers = true;
  customerSearchQuery = '';
  
  // Products
  products: any[] = [];
  filteredProducts: any[] = [];
  isLoadingProducts = true;
  productSearchQuery = '';
  productCategoryFilter = 'all';
  
  // Order update modal
  showOrderModal = false;
  selectedOrder: any = null;
  transactionId = '';
  isUpdating = false;
  
  error: string | null = null;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
    
    // Load data for the selected tab if not already loaded
    if (tab === 'orders' && this.orders.length === 0) {
      this.loadOrders();
    } else if (tab === 'customers' && this.customers.length === 0) {
      this.loadCustomers();
    } else if (tab === 'products' && this.products.length === 0) {
      this.loadProducts();
    }
  }

  // Orders methods
  loadOrders(): void {
    this.isLoadingOrders = true;
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
        this.isLoadingOrders = false;
      },
      error: (err) => {
        console.error('Error loading orders:', err);
        this.error = 'Failed to load orders. Please try again later.';
        this.isLoadingOrders = false;
      }
    });
  }

  applyOrderFilters(): void {
    this.filteredOrders = this.orders.filter(order => {
      // Apply status filter
      if (this.orderStatusFilter !== 'all' && order.status !== this.orderStatusFilter) {
        return false;
      }
      
      // Apply payment filter
      if (this.orderPaymentFilter !== 'all' && order.paymentStatus !== this.orderPaymentFilter) {
        return false;
      }
      
      return true;
    });
  }

  openUpdateOrderModal(order: any): void {
    this.selectedOrder = { ...order };
    this.transactionId = order.paymentDetails?.transactionId || '';
    this.showOrderModal = true;
  }

  updateOrder(): void {
    if (!this.selectedOrder) return;
    
    this.isUpdating = true;
    this.error = null;
    
    // Update order status
    this.apiService.patch(`orders/${this.selectedOrder._id}/status`, {
      status: this.selectedOrder.status
    }).subscribe({
      next: () => {
        // Update payment status
        this.apiService.patch(`orders/${this.selectedOrder._id}/payment`, {
          paymentStatus: this.selectedOrder.paymentStatus,
          transactionId: this.selectedOrder.paymentStatus === 'paid' ? this.transactionId : undefined
        }).subscribe({
          next: () => {
            // Update the order in the list
            const index = this.orders.findIndex(o => o._id === this.selectedOrder._id);
            if (index !== -1) {
              this.orders[index].status = this.selectedOrder.status;
              this.orders[index].paymentStatus = this.selectedOrder.paymentStatus;
              if (this.selectedOrder.paymentStatus === 'paid' && this.transactionId) {
                this.orders[index].paymentDetails = {
                  ...this.orders[index].paymentDetails,
                  transactionId: this.transactionId
                };
              }
              this.applyOrderFilters();
            }
            
            this.showOrderModal = false;
            this.isUpdating = false;
          },
          error: (err) => {
            console.error('Error updating payment status:', err);
            this.error = err.error?.message || 'Failed to update payment status. Please try again.';
            this.isUpdating = false;
          }
        });
      },
      error: (err) => {
        console.error('Error updating order status:', err);
        this.error = err.error?.message || 'Failed to update order status. Please try again.';
        this.isUpdating = false;
      }
    });
  }

  // Customers methods
  loadCustomers(): void {
    this.isLoadingCustomers = true;
    this.error = null;

    this.apiService.get('auth/users').subscribe({
      next: (response: any) => {
        if (response && response.data && response.data.users) {
          this.customers = response.data.users;
          this.filteredCustomers = [...this.customers];
        } else {
          this.customers = [];
          this.filteredCustomers = [];
        }
        this.isLoadingCustomers = false;
      },
      error: (err) => {
        console.error('Error loading customers:', err);
        this.error = 'Failed to load customers. Please try again later.';
        this.isLoadingCustomers = false;
      }
    });
  }

  applyCustomerFilters(): void {
    if (!this.customerSearchQuery) {
      this.filteredCustomers = [...this.customers];
      return;
    }
    
    const query = this.customerSearchQuery.toLowerCase();
    this.filteredCustomers = this.customers.filter(customer => {
      return (
        customer.username.toLowerCase().includes(query) ||
        customer.email.toLowerCase().includes(query)
      );
    });
  }

  viewCustomerOrders(customerId: string): void {
    // This would typically navigate to a customer detail page
    // For now, we'll just filter the orders tab to show only this customer's orders
    this.activeTab = 'orders';
    this.filteredOrders = this.orders.filter(order => order.user?._id === customerId);
  }

  // Products methods
  loadProducts(): void {
    this.isLoadingProducts = true;
    this.error = null;

    this.apiService.get('products').subscribe({
      next: (response: any) => {
        if (response && response.data && response.data.products) {
          this.products = response.data.products;
          this.filteredProducts = [...this.products];
        } else {
          this.products = [];
          this.filteredProducts = [];
        }
        this.isLoadingProducts = false;
      },
      error: (err) => {
        console.error('Error loading products:', err);
        this.error = 'Failed to load products. Please try again later.';
        this.isLoadingProducts = false;
      }
    });
  }

  applyProductFilters(): void {
    this.filteredProducts = this.products.filter(product => {
      // Apply category filter
      if (this.productCategoryFilter !== 'all' && product.category !== this.productCategoryFilter) {
        return false;
      }
      
      // Apply search filter
      if (this.productSearchQuery) {
        const query = this.productSearchQuery.toLowerCase();
        return (
          product.name.toLowerCase().includes(query) ||
          product.brand.toLowerCase().includes(query)
        );
      }
      
      return true;
    });
  }
}
