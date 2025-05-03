import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: /* html */ `
    <div class="product-detail-container" *ngIf="product">
      <div class="product-image">
        <img [src]="product.imageUrl" [alt]="product.name" onerror="this.src='/assets/placeholder.jpg'">
      </div>
      <div class="product-info">
        <h1>{{ product.name }}</h1>
        <p class="product-brand">{{ product.brand }}</p>
        <p class="product-category">Category: {{ product.category }}</p>
        <p class="product-price">\${{ product.price.toFixed(2) }}</p>
        <p class="product-stock" [ngClass]="{'in-stock': product.stock > 0, 'out-of-stock': product.stock === 0}">
          {{ product.stock > 0 ? 'In Stock (' + product.stock + ' available)' : 'Out of Stock' }}
        </p>
        <div class="product-description">
          <h3>Description</h3>
          <p>{{ product.description }}</p>
        </div>
        <div class="product-actions">
          <button 
            *ngIf="product.stock > 0" 
            class="add-to-cart-btn" 
            (click)="addToCart(product)">
            Add to Cart
          </button>
          <ng-container *ngIf="isAdmin">
            <button class="edit-btn" [routerLink]="['/admin/products/edit', product._id]">Edit Product</button>
          </ng-container>
        </div>
      </div>
    </div>
    <div class="loading" *ngIf="!product && !error">Loading product details...</div>
    <div class="error" *ngIf="error">{{ error }}</div>
  `,
  styles: [`
    .product-detail-container {
      display: flex;
      flex-wrap: wrap;
      max-width: 1200px;
      margin: 20px auto;
      padding: 20px;
      gap: 30px;
    }
    .product-image {
      flex: 1;
      min-width: 300px;
    }
    .product-image img {
      width: 100%;
      max-height: 500px;
      object-fit: contain;
      border-radius: 8px;
    }
    .product-info {
      flex: 2;
      min-width: 300px;
    }
    h1 {
      margin-top: 0;
      font-size: 28px;
      color: #333;
    }
    .product-brand {
      font-size: 18px;
      color: #666;
      margin-bottom: 15px;
    }
    .product-category {
      font-size: 14px;
      color: #888;
      margin-bottom: 15px;
    }
    .product-price {
      font-size: 24px;
      font-weight: bold;
      color: #e63946;
      margin-bottom: 15px;
    }
    .product-stock {
      font-size: 16px;
      margin-bottom: 20px;
    }
    .in-stock {
      color: #2a9d8f;
    }
    .out-of-stock {
      color: #e63946;
    }
    .product-description {
      margin-bottom: 30px;
    }
    .product-description h3 {
      font-size: 18px;
      margin-bottom: 10px;
    }
    .product-description p {
      line-height: 1.6;
      color: #444;
    }
    .product-actions {
      display: flex;
      gap: 15px;
    }
    button {
      padding: 12px 20px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
      transition: background-color 0.3s;
    }
    .add-to-cart-btn {
      background-color: #2a9d8f;
      color: white;
    }
    .add-to-cart-btn:hover {
      background-color: #218879;
    }
    .edit-btn {
      background-color: #f4a261;
      color: white;
    }
    .edit-btn:hover {
      background-color: #e08c48;
    }
    .loading, .error {
      text-align: center;
      padding: 40px;
      font-size: 18px;
    }
    .error {
      color: #e63946;
    }
    @media (max-width: 768px) {
      .product-detail-container {
        flex-direction: column;
      }
    }
  `]
})
export class ProductDetailComponent implements OnInit {
  product: any = null;
  error: string | null = null;
  isAdmin = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private authService: AuthService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    this.loadProduct();
  }

  loadProduct(): void {
    const productId = this.route.snapshot.paramMap.get('id');
    if (!productId) {
      this.error = 'Product ID is missing';
      return;
    }

    this.apiService.get(`products/${productId}`).subscribe({
      next: (response: any) => {
        if (response && response.data && response.data.product) {
          this.product = response.data.product;
        } else {
          this.error = 'Invalid product data received';
        }
      },
      error: (err) => {
        console.error('Error loading product:', err);
        this.error = 'Failed to load product details. Please try again later.';
      }
    });
  }

  addToCart(product: any): void {
    this.cartService.addToCart(product);
  }
}
