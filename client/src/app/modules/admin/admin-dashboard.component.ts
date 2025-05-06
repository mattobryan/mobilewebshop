import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: /* html */ `
    <div class="admin-dashboard-container">
      <div class="page-header">
        <h2>Admin Dashboard</h2>
      </div>
      
      <div class="dashboard-stats">
        <div class="stat-card">
          <div class="stat-icon orders-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
              <line x1="8" y1="21" x2="16" y2="21"></line>
              <line x1="12" y1="17" x2="12" y2="21"></line>
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.totalOrders }}</div>
            <div class="stat-label">Total Orders</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon revenue-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-value">\${{ stats.totalRevenue.toFixed(2) }}</div>
            <div class="stat-label">Total Revenue</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon products-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.totalProducts }}</div>
            <div class="stat-label">Total Products</div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon users-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          <div class="stat-content">
            <div class="stat-value">{{ stats.totalUsers }}</div>
            <div class="stat-label">Registered Users</div>
          </div>
        </div>
      </div>
      
      <div class="dashboard-sections">
        <div class="section-row">
          <div class="dashboard-section">
            <div class="section-header">
              <h3>Recent Orders</h3>
              <a routerLink="/admin/orders" class="view-all-link">View All</a>
            </div>
            
            <div class="loading" *ngIf="isLoading.orders">Loading orders...</div>
            
            <div class="empty-data" *ngIf="!isLoading.orders && recentOrders.length === 0">
              <p>No recent orders found.</p>
            </div>
            
            <div class="recent-orders" *ngIf="!isLoading.orders && recentOrders.length > 0">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Total</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let order of recentOrders">
                    <td>{{ order._id.substring(order._id.length - 8) }}</td>
                    <td>{{ order.user?.username || 'Guest User' }}</td>
                    <td>{{ order.createdAt | date:'short' }}</td>
                    <td>\${{ order.totalAmount?.toFixed(2) }}</td>
                    <td>
                      <span class="status-badge" [ngClass]="'status-' + order.status">
                        {{ order.status | titlecase }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          
          <div class="dashboard-section">
            <div class="section-header">
              <h3>Low Stock Products</h3>
              <a routerLink="/admin/inventory" class="view-all-link">View All</a>
            </div>
            
            <div class="loading" *ngIf="isLoading.products">Loading products...</div>
            
            <div class="empty-data" *ngIf="!isLoading.products && lowStockProducts.length === 0">
              <p>No low stock products found.</p>
            </div>
            
            <div class="low-stock-products" *ngIf="!isLoading.products && lowStockProducts.length > 0">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Stock</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let product of lowStockProducts">
                    <td>{{ product.name }}</td>
                    <td>{{ product.category | titlecase }}</td>
                    <td [ngClass]="{'low-stock': product.stock < 10, 'out-of-stock': product.stock === 0}">
                      {{ product.stock }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      
      <div class="dashboard-actions">
        <div class="action-card" routerLink="/admin/products">
          <div class="action-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <path d="M16 10a4 4 0 0 1-8 0"></path>
            </svg>
          </div>
          <div class="action-content">
            <h4>Manage Products</h4>
            <p>Add, edit, or remove products from your store</p>
          </div>
        </div>
        
        <div class="action-card" routerLink="/admin/orders">
          <div class="action-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
              <line x1="8" y1="21" x2="16" y2="21"></line>
              <line x1="12" y1="17" x2="12" y2="21"></line>
            </svg>
          </div>
          <div class="action-content">
            <h4>Manage Orders</h4>
            <p>View and update order status and payment information</p>
          </div>
        </div>
        
        <div class="action-card" routerLink="/admin/inventory">
          <div class="action-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
            </svg>
          </div>
          <div class="action-content">
            <h4>Manage Inventory</h4>
            <p>Update stock levels and monitor inventory status</p>
          </div>
        </div>
        
        <div class="action-card" routerLink="/products/create">
          <div class="action-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="16"></line>
              <line x1="8" y1="12" x2="16" y2="12"></line>
            </svg>
          </div>
          <div class="action-content">
            <h4>Add New Product</h4>
            <p>Create a new product listing for your store</p>
          </div>
        </div>
      </div>
      
      <div class="error-container" *ngIf="error">
        <div class="error-message">{{ error }}</div>
      </div>
    </div>
  `,
  styles: [`
    .admin-dashboard-container {
      max-width: 1200px;
      margin: 20px auto;
      padding: 20px;
    }
    .page-header {
      margin-bottom: 30px;
    }
    h2 {
      margin: 0;
      color: #333;
      font-size: 28px;
    }
    h3 {
      margin: 0;
      color: #333;
      font-size: 20px;
    }
    h4 {
      margin: 0 0 5px 0;
      color: #333;
      font-size: 18px;
    }
    
    /* Stats Section */
    .dashboard-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    .stat-card {
      background-color: #fff;
      border-radius: 8px;
      padding: 20px;
      display: flex;
      align-items: center;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .stat-icon {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 15px;
    }
    .orders-icon {
      background-color: #cce5ff;
      color: #0d6efd;
    }
    .revenue-icon {
      background-color: #d1e7dd;
      color: #198754;
    }
    .products-icon {
      background-color: #fff3cd;
      color: #ffc107;
    }
    .users-icon {
      background-color: #f8d7da;
      color: #dc3545;
    }
    .stat-content {
      flex: 1;
    }
    .stat-value {
      font-size: 24px;
      font-weight: bold;
      color: #333;
    }
    .stat-label {
      font-size: 14px;
      color: #666;
    }
    
    /* Dashboard Sections */
    .dashboard-sections {
      margin-bottom: 30px;
    }
    .section-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
      gap: 20px;
    }
    .dashboard-section {
      background-color: #fff;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 1px solid #eee;
    }
    .view-all-link {
      color: #0d6efd;
      text-decoration: none;
      font-size: 14px;
    }
    .view-all-link:hover {
      text-decoration: underline;
    }
    
    /* Tables */
    .data-table {
      width: 100%;
      border-collapse: collapse;
    }
    .data-table th, .data-table td {
      padding: 10px;
      text-align: left;
      border-bottom: 1px solid #eee;
    }
    .data-table th {
      font-weight: bold;
      color: #333;
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
    .low-stock {
      color: #e67e22;
      font-weight: bold;
    }
    .out-of-stock {
      color: #e63946;
      font-weight: bold;
    }
    
    /* Action Cards */
    .dashboard-actions {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 20px;
    }
    .action-card {
      background-color: #fff;
      border-radius: 8px;
      padding: 20px;
      display: flex;
      align-items: center;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .action-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    }
    .action-icon {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background-color: #f8f9fa;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 15px;
      color: #0d6efd;
    }
    .action-content {
      flex: 1;
    }
    .action-content p {
      margin: 0;
      color: #666;
      font-size: 14px;
    }
    
    .loading, .empty-data {
      text-align: center;
      padding: 20px;
      color: #666;
    }
    .error-container {
      margin-top: 20px;
      padding: 15px;
      background-color: #f8d7da;
      color: #721c24;
      border-radius: 4px;
    }
    
    @media (max-width: 768px) {
      .section-row {
        grid-template-columns: 1fr;
      }
      .dashboard-actions {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AdminDashboardComponent implements OnInit {
  stats = {
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalUsers: 0
  };
  
  recentOrders: any[] = [];
  lowStockProducts: any[] = [];
  
  isLoading = {
    stats: true,
    orders: true,
    products: true
  };
  
  error: string | null = null;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loadStats();
    this.loadRecentOrders();
    this.loadLowStockProducts();
  }

  loadStats(): void {
    this.isLoading.stats = true;
    
    this.apiService.get('admin/dashboard/stats').subscribe({
      next: (response: any) => {
        if (response && response.data) {
          this.stats = response.data;
        }
        this.isLoading.stats = false;
      },
      error: (err) => {
        console.error('Error loading dashboard stats:', err);
        this.error = 'Failed to load dashboard statistics.';
        this.isLoading.stats = false;
      }
    });
  }

  loadRecentOrders(): void {
    this.isLoading.orders = true;
    
    this.apiService.get('orders?limit=5').subscribe({
      next: (response: any) => {
        if (response && response.data && response.data.orders) {
          this.recentOrders = response.data.orders;
        } else {
          this.recentOrders = [];
        }
        this.isLoading.orders = false;
      },
      error: (err) => {
        console.error('Error loading recent orders:', err);
        this.error = 'Failed to load recent orders.';
        this.isLoading.orders = false;
      }
    });
  }

  loadLowStockProducts(): void {
    this.isLoading.products = true;
    
    this.apiService.get('products?stock=low&limit=5').subscribe({
      next: (response: any) => {
        if (response && response.data && response.data.products) {
          this.lowStockProducts = response.data.products.filter((product: any) => product.stock < 10)
            .sort((a: any, b: any) => a.stock - b.stock);
        } else {
          this.lowStockProducts = [];
        }
        this.isLoading.products = false;
      },
      error: (err) => {
        console.error('Error loading low stock products:', err);
        this.error = 'Failed to load low stock products.';
        this.isLoading.products = false;
      }
    });
  }
}
