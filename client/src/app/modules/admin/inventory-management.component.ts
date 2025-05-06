import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-inventory-management',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: /* html */ `
    <div class="inventory-management-container">
      <div class="page-header">
        <h2>Inventory Management</h2>
      </div>
      
      <div class="filters">
        <div class="search-box">
          <input 
            type="text" 
            placeholder="Search by product name or brand" 
            [(ngModel)]="searchQuery"
            (input)="applyFilters()">
        </div>
        
        <div class="filter-dropdown">
          <select [(ngModel)]="categoryFilter" (change)="applyFilters()">
            <option value="all">All Categories</option>
            <option value="smartphone">Smartphones</option>
            <option value="tablet">Tablets</option>
            <option value="accessory">Accessories</option>
          </select>
        </div>
        
        <div class="filter-dropdown">
          <select [(ngModel)]="stockFilter" (change)="applyFilters()">
            <option value="all">All Stock Levels</option>
            <option value="low">Low Stock (< 10)</option>
            <option value="out">Out of Stock</option>
            <option value="in">In Stock</option>
          </select>
        </div>
      </div>
      
      <div class="loading" *ngIf="isLoading">Loading inventory...</div>
      
      <div class="empty-data" *ngIf="!isLoading && filteredProducts.length === 0">
        <p>No products found matching your criteria.</p>
      </div>
      
      <div class="inventory-table-container" *ngIf="!isLoading && filteredProducts.length > 0">
        <table class="data-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>SKU</th>
              <th>Category</th>
              <th>Current Stock</th>
              <th>Update Stock</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let product of filteredProducts; let i = index">
              <td class="product-image-cell">
                <img [src]="product.imageUrl" [alt]="product.name" onerror="this.src='/assets/placeholder.jpg'">
              </td>
              <td>{{ product.name }}</td>
              <td>{{ product.sku || 'N/A' }}</td>
              <td>{{ product.category | titlecase }}</td>
              <td [ngClass]="{'low-stock': product.stock < 10, 'out-of-stock': product.stock === 0}">
                {{ product.stock }}
              </td>
              <td class="stock-update-cell">
                <div class="stock-controls">
                  <button class="decrease-btn" (click)="decreaseStock(i)" [disabled]="product.newStock <= 0">-</button>
                  <input type="number" [(ngModel)]="product.newStock" min="0" class="stock-input">
                  <button class="increase-btn" (click)="increaseStock(i)">+</button>
                </div>
              </td>
              <td class="actions-cell">
                <button class="update-btn" (click)="updateStock(product)" [disabled]="product.stock === product.newStock || product.isUpdating">
                  {{ product.isUpdating ? 'Updating...' : 'Update' }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div class="bulk-update-container" *ngIf="!isLoading && filteredProducts.length > 0">
        <h3>Bulk Stock Update</h3>
        <div class="bulk-update-form">
          <div class="form-group">
            <label for="updateType">Update Type</label>
            <select id="updateType" [(ngModel)]="bulkUpdateType">
              <option value="set">Set to specific value</option>
              <option value="increase">Increase by amount</option>
              <option value="decrease">Decrease by amount</option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="updateValue">Value</label>
            <input type="number" id="updateValue" [(ngModel)]="bulkUpdateValue" min="0">
          </div>
          
          <div class="form-group">
            <label for="updateCategory">Apply to Category</label>
            <select id="updateCategory" [(ngModel)]="bulkUpdateCategory">
              <option value="all">All Products</option>
              <option value="smartphone">Smartphones</option>
              <option value="tablet">Tablets</option>
              <option value="accessory">Accessories</option>
            </select>
          </div>
          
          <div class="form-actions">
            <button class="apply-btn" (click)="applyBulkUpdate()" [disabled]="isBulkUpdating">
              {{ isBulkUpdating ? 'Applying...' : 'Apply Update' }}
            </button>
          </div>
        </div>
      </div>
      
      <!-- Low Stock Alert Section -->
      <div class="low-stock-alerts" *ngIf="!isLoading && lowStockProducts.length > 0">
        <h3>Low Stock Alerts</h3>
        <div class="alerts-list">
          <div class="alert-item" *ngFor="let product of lowStockProducts">
            <div class="alert-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
            </div>
            <div class="alert-content">
              <div class="alert-title">{{ product.name }}</div>
              <div class="alert-message">
                <span *ngIf="product.stock === 0">Out of stock!</span>
                <span *ngIf="product.stock > 0">Only {{ product.stock }} items left in stock</span>
              </div>
            </div>
            <div class="alert-action">
              <button class="restock-btn" [routerLink]="['/products/edit', product._id]">Restock</button>
            </div>
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
    .inventory-management-container {
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
    h3 {
      color: #333;
      font-size: 22px;
      margin-top: 30px;
      margin-bottom: 15px;
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
    .product-image-cell {
      width: 80px;
    }
    .product-image-cell img {
      width: 60px;
      height: 60px;
      object-fit: contain;
      border-radius: 4px;
    }
    .low-stock {
      color: #e67e22;
      font-weight: bold;
    }
    .out-of-stock {
      color: #e63946;
      font-weight: bold;
    }
    .stock-update-cell {
      width: 150px;
    }
    .stock-controls {
      display: flex;
      align-items: center;
    }
    .decrease-btn, .increase-btn {
      width: 30px;
      height: 30px;
      border: 1px solid #ddd;
      background-color: #f5f5f5;
      font-size: 16px;
      font-weight: bold;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .decrease-btn {
      border-radius: 4px 0 0 4px;
    }
    .increase-btn {
      border-radius: 0 4px 4px 0;
    }
    .decrease-btn:hover, .increase-btn:hover {
      background-color: #e9ecef;
    }
    .decrease-btn:disabled {
      cursor: not-allowed;
      opacity: 0.5;
    }
    .stock-input {
      width: 60px;
      height: 30px;
      border: 1px solid #ddd;
      border-left: none;
      border-right: none;
      text-align: center;
      font-size: 16px;
      padding: 0 5px;
    }
    .stock-input::-webkit-inner-spin-button, 
    .stock-input::-webkit-outer-spin-button { 
      -webkit-appearance: none;
      margin: 0;
    }
    .actions-cell {
      width: 100px;
    }
    .actions-cell button {
      padding: 6px 10px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      transition: background-color 0.3s;
    }
    .update-btn {
      background-color: #2a9d8f;
      color: white;
    }
    .update-btn:hover:not(:disabled) {
      background-color: #218879;
    }
    .update-btn:disabled {
      background-color: #cccccc;
      cursor: not-allowed;
    }
    
    /* Bulk Update Styles */
    .bulk-update-container {
      background-color: #f9f9f9;
      padding: 20px;
      border-radius: 8px;
      margin-top: 30px;
    }
    .bulk-update-form {
      display: flex;
      flex-wrap: wrap;
      gap: 15px;
      align-items: flex-end;
    }
    .form-group {
      flex: 1;
      min-width: 200px;
    }
    .form-actions {
      display: flex;
      align-items: flex-end;
    }
    label {
      display: block;
      margin-bottom: 5px;
      font-weight: bold;
      color: #555;
    }
    select, input {
      width: 100%;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 16px;
    }
    .apply-btn {
      padding: 10px 16px;
      background-color: #2a9d8f;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
      transition: background-color 0.3s;
    }
    .apply-btn:hover:not(:disabled) {
      background-color: #218879;
    }
    .apply-btn:disabled {
      background-color: #cccccc;
      cursor: not-allowed;
    }
    
    /* Low Stock Alerts Styles */
    .low-stock-alerts {
      margin-top: 30px;
    }
    .alerts-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .alert-item {
      display: flex;
      align-items: center;
      padding: 15px;
      background-color: #fff3cd;
      border-left: 4px solid #e67e22;
      border-radius: 4px;
    }
    .alert-icon {
      margin-right: 15px;
      color: #e67e22;
    }
    .alert-content {
      flex: 1;
    }
    .alert-title {
      font-weight: bold;
      margin-bottom: 5px;
    }
    .alert-message {
      color: #856404;
    }
    .alert-action {
      margin-left: 15px;
    }
    .restock-btn {
      padding: 6px 12px;
      background-color: #e67e22;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      transition: background-color 0.3s;
    }
    .restock-btn:hover {
      background-color: #d35400;
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
      .bulk-update-form {
        flex-direction: column;
      }
    }
  `]
})
export class InventoryManagementComponent implements OnInit {
  products: any[] = [];
  filteredProducts: any[] = [];
  lowStockProducts: any[] = [];
  isLoading = true;
  error: string | null = null;
  successMessage: string | null = null;
  
  // Filters
  searchQuery = '';
  categoryFilter = 'all';
  stockFilter = 'all';
  
  // Bulk update
  bulkUpdateType = 'set';
  bulkUpdateValue = 0;
  bulkUpdateCategory = 'all';
  isBulkUpdating = false;

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.isLoading = true;
    this.error = null;
    
    this.apiService.get('products').subscribe({
      next: (response: any) => {
        if (response && response.data && response.data.products) {
          this.products = response.data.products.map((product: any) => ({
            ...product,
            newStock: product.stock,
            isUpdating: false
          }));
          
          this.filteredProducts = [...this.products];
          this.updateLowStockProducts();
        } else {
          this.products = [];
          this.filteredProducts = [];
          this.lowStockProducts = [];
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading products:', err);
        this.error = 'Failed to load products. Please try again later.';
        this.isLoading = false;
      }
    });
  }

  updateLowStockProducts(): void {
    this.lowStockProducts = this.products.filter(product => product.stock < 10)
      .sort((a, b) => a.stock - b.stock);
  }

  applyFilters(): void {
    this.filteredProducts = this.products.filter(product => {
      // Apply search filter
      if (this.searchQuery) {
        const query = this.searchQuery.toLowerCase();
        if (!product.name.toLowerCase().includes(query) && 
            !product.brand.toLowerCase().includes(query)) {
          return false;
        }
      }
      
      // Apply category filter
      if (this.categoryFilter !== 'all' && product.category !== this.categoryFilter) {
        return false;
      }
      
      // Apply stock filter
      if (this.stockFilter === 'low' && product.stock >= 10) {
        return false;
      } else if (this.stockFilter === 'out' && product.stock > 0) {
        return false;
      } else if (this.stockFilter === 'in' && product.stock === 0) {
        return false;
      }
      
      return true;
    });
  }

  increaseStock(index: number): void {
    this.filteredProducts[index].newStock++;
  }

  decreaseStock(index: number): void {
    if (this.filteredProducts[index].newStock > 0) {
      this.filteredProducts[index].newStock--;
    }
  }

  updateStock(product: any): void {
    if (product.stock === product.newStock) return;
    
    product.isUpdating = true;
    this.error = null;
    
    this.apiService.patch(`products/${product._id}`, { stock: product.newStock }).subscribe({
      next: (response: any) => {
        product.isUpdating = false;
        
        if (response && response.data && response.data.product) {
          // Update product in arrays
          const updatedProduct = response.data.product;
          
          // Update in products array
          const productIndex = this.products.findIndex(p => p._id === product._id);
          if (productIndex !== -1) {
            this.products[productIndex].stock = updatedProduct.stock;
          }
          
          // Update current product
          product.stock = updatedProduct.stock;
          
          this.successMessage = `Stock for "${product.name}" updated successfully.`;
          this.updateLowStockProducts();
          
          // Clear success message after 3 seconds
          setTimeout(() => {
            this.successMessage = null;
          }, 3000);
        }
      },
      error: (err) => {
        console.error('Error updating stock:', err);
        this.error = err.error?.message || 'Failed to update stock. Please try again.';
        product.isUpdating = false;
      }
    });
  }

  applyBulkUpdate(): void {
    if (this.bulkUpdateValue < 0) {
      this.error = 'Update value cannot be negative.';
      return;
    }
    
    this.isBulkUpdating = true;
    this.error = null;
    
    // Get products to update based on category filter
    const productsToUpdate = this.products.filter(product => 
      this.bulkUpdateCategory === 'all' || product.category === this.bulkUpdateCategory
    );
    
    if (productsToUpdate.length === 0) {
      this.error = 'No products match the selected category.';
      this.isBulkUpdating = false;
      return;
    }
    
    // Prepare update data for each product
    const updates = productsToUpdate.map(product => {
      let newStock = product.stock;
      
      if (this.bulkUpdateType === 'set') {
        newStock = this.bulkUpdateValue;
      } else if (this.bulkUpdateType === 'increase') {
        newStock = product.stock + this.bulkUpdateValue;
      } else if (this.bulkUpdateType === 'decrease') {
        newStock = Math.max(0, product.stock - this.bulkUpdateValue);
      }
      
      return {
        productId: product._id,
        stock: newStock
      };
    });
    
    // Send bulk update request
    this.apiService.post('products/bulk-update-stock', { updates }).subscribe({
      next: (response: any) => {
        this.isBulkUpdating = false;
        
        if (response && response.data && response.data.updatedProducts) {
          const updatedProducts = response.data.updatedProducts;
          
          // Update products in arrays
          updatedProducts.forEach((updatedProduct: any) => {
            // Update in products array
            const productIndex = this.products.findIndex(p => p._id === updatedProduct._id);
            if (productIndex !== -1) {
              this.products[productIndex].stock = updatedProduct.stock;
              this.products[productIndex].newStock = updatedProduct.stock;
            }
            
            // Update in filtered products array
            const filteredIndex = this.filteredProducts.findIndex(p => p._id === updatedProduct._id);
            if (filteredIndex !== -1) {
              this.filteredProducts[filteredIndex].stock = updatedProduct.stock;
              this.filteredProducts[filteredIndex].newStock = updatedProduct.stock;
            }
          });
          
          this.successMessage = `Stock updated for ${updatedProducts.length} products.`;
          this.updateLowStockProducts();
          
          // Clear success message after 5 seconds
          setTimeout(() => {
            this.successMessage = null;
          }, 5000);
        }
      },
      error: (err) => {
        console.error('Error performing bulk update:', err);
        this.error = err.error?.message || 'Failed to update stock. Please try again.';
        this.isBulkUpdating = false;
      }
    });
  }
}
