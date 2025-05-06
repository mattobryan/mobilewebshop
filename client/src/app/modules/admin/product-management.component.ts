import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-product-management',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: /* html */ `
    <div class="product-management-container">
      <div class="page-header">
        <h2>Product Management</h2>
        <button class="add-product-btn" routerLink="/products/create">Add New Product</button>
      </div>
      
      <div class="filters">
        <div class="search-box">
          <input 
            type="text" 
            placeholder="Search by name or brand" 
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
      
      <div class="loading" *ngIf="isLoading">Loading products...</div>
      
      <div class="empty-data" *ngIf="!isLoading && filteredProducts.length === 0">
        <p>No products found matching your criteria.</p>
      </div>
      
      <div class="products-table-container" *ngIf="!isLoading && filteredProducts.length > 0">
        <table class="data-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Brand</th>
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
              <td>{{ product.brand }}</td>
              <td>{{ product.category | titlecase }}</td>
              <td>\${{ product.price.toFixed(2) }}</td>
              <td [ngClass]="{'low-stock': product.stock < 10, 'out-of-stock': product.stock === 0}">
                {{ product.stock }}
              </td>
              <td class="actions-cell">
                <button class="view-btn" [routerLink]="['/products', product._id]">View</button>
                <button class="edit-btn" [routerLink]="['/products/edit', product._id]">Edit</button>
                <button class="delete-btn" (click)="deleteProduct(product)">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Delete Confirmation Modal -->
      <div class="modal" *ngIf="showDeleteModal">
        <div class="modal-content">
          <div class="modal-header">
            <h3>Confirm Delete</h3>
            <button class="close-btn" (click)="cancelDelete()">×</button>
          </div>
          <div class="modal-body" *ngIf="productToDelete">
            <p>Are you sure you want to delete the product "{{ productToDelete.name }}"?</p>
            <p class="warning">This action cannot be undone.</p>
          </div>
          <div class="modal-footer">
            <button class="cancel-btn" (click)="cancelDelete()">Cancel</button>
            <button class="confirm-delete-btn" (click)="confirmDelete()" [disabled]="isDeleting">
              {{ isDeleting ? 'Deleting...' : 'Delete Product' }}
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
    .product-management-container {
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
    .add-product-btn {
      padding: 10px 16px;
      background-color: #2a9d8f;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
      transition: background-color 0.3s;
    }
    .add-product-btn:hover {
      background-color: #218879;
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
    .edit-btn {
      background-color: #f4a261;
      color: white;
    }
    .edit-btn:hover {
      background-color: #e08c48;
    }
    .delete-btn {
      background-color: #e63946;
      color: white;
    }
    .delete-btn:hover {
      background-color: #d62b39;
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
    .warning {
      color: #e63946;
      font-weight: bold;
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
    .confirm-delete-btn {
      background-color: #e63946;
      color: white;
    }
    .confirm-delete-btn:hover:not(:disabled) {
      background-color: #d62b39;
    }
    .confirm-delete-btn:disabled {
      background-color: #cccccc;
      cursor: not-allowed;
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
    }
  `]
})
export class ProductManagementComponent implements OnInit {
  products: any[] = [];
  filteredProducts: any[] = [];
  isLoading = true;
  error: string | null = null;
  successMessage: string | null = null;
  
  // Filters
  searchQuery = '';
  categoryFilter = 'all';
  stockFilter = 'all';
  
  // Delete modal
  showDeleteModal = false;
  productToDelete: any = null;
  isDeleting = false;

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
          this.products = response.data.products;
          this.filteredProducts = [...this.products];
        } else {
          this.products = [];
          this.filteredProducts = [];
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

  deleteProduct(product: any): void {
    this.productToDelete = product;
    this.showDeleteModal = true;
  }

  cancelDelete(): void {
    this.showDeleteModal = false;
    this.productToDelete = null;
  }

  confirmDelete(): void {
    if (!this.productToDelete) return;
    
    this.isDeleting = true;
    this.error = null;
    
    this.apiService.delete(`products/${this.productToDelete._id}`).subscribe({
      next: () => {
        this.isDeleting = false;
        this.showDeleteModal = false;
        
        // Remove the product from the arrays
        this.products = this.products.filter(p => p._id !== this.productToDelete._id);
        this.filteredProducts = this.filteredProducts.filter(p => p._id !== this.productToDelete._id);
        
        this.successMessage = `Product "${this.productToDelete.name}" has been deleted.`;
        this.productToDelete = null;
        
        // Clear success message after 5 seconds
        setTimeout(() => {
          this.successMessage = null;
        }, 5000);
      },
      error: (err) => {
        console.error('Error deleting product:', err);
        this.error = err.error?.message || 'Failed to delete product. Please try again.';
        this.isDeleting = false;
      }
    });
  }
}
