import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../core/services/api.service';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-product-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './product-management.component.html',
  styleUrls: ['./product-management.component.scss']
})
export class ProductManagementComponent implements OnInit {
  products: any[] = [];
  filteredProducts: any[] = [];
  searchQuery = '';
  categoryFilter = 'all';
  stockFilter = 'all';
  isLoading = true;
  error = '';
  successMessage = '';
  showDeleteModal = false;
  productToDelete: any = null;
  isDeleting = false;

  constructor(private apiService: ApiService, private router: Router) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.apiService.get('products').subscribe({
      next: (response: any) => {
        this.products = response;
        this.filteredProducts = [...this.products];
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Error loading products';
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    this.filteredProducts = this.products.filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        product.brand.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchesCategory = this.categoryFilter === 'all' || product.category === this.categoryFilter;
      const matchesStock = this.stockFilter === 'all' ||
        (this.stockFilter === 'low' && product.stock < 10) ||
        (this.stockFilter === 'out' && product.stock === 0) ||
        (this.stockFilter === 'in' && product.stock > 0);
      return matchesSearch && matchesCategory && matchesStock;
    });
  }

  deleteProduct(product: any): void {
    this.showDeleteModal = true;
    this.productToDelete = product;
  }

  confirmDelete(): void {
    this.isDeleting = true;
    this.apiService.delete(`products/${this.productToDelete._id}`).subscribe({
      next: () => {
        this.successMessage = 'Product deleted successfully!';
        this.showDeleteModal = false;
        this.isDeleting = false;
        this.loadProducts();
      },
      error: (err) => {
        this.error = 'Error deleting product';
        this.isDeleting = false;
      }
    });
  }

  cancelDelete(): void {
    this.showDeleteModal = false;
    this.productToDelete = null;
  }
}
