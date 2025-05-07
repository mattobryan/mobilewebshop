import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';


interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  brand: string;
  imageUrl: string;
  ratingsAverage?: number;
  ratingsQuantity?: number;
  createdBy?: string;
  createdAt?: Date;
}

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  loading = false;
  error = '';

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router,
    private cartService: CartService,
    private snackBar: MatSnackBar

  ) { }

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.error = '';
    
    this.apiService.get<any>('products').subscribe({
      next: (response) => {
        this.loading = false;

        if (response && response.data && response.data.products) {
          this.products = response.data.products;
        } else {
          this.products = Array.isArray(response) ? response : [];
        }

        if (this.products.length === 0) {
          this.error = 'No products found in the database. Please make sure you have imported the data.';
        }
      },
      error: (error) => {
        this.loading = false;
        this.error = 'Error connecting to the database. Please make sure MongoDB is running and properly configured.';
        console.error('Error loading products', error);
      }
    });
  }

  addToCart(product: Product): void {
    if (!this.authService.isLoggedIn()) {
      // Show a snack bar message
      this.snackBar.open('Please log in to add items to your cart.', 'Login', {
        duration: 3000,
      });
  
      // Redirect to login after a slight delay to allow reading the toast
      setTimeout(() => this.router.navigate(['/auth/login']), 1000);
    } else {
      this.cartService.addToCart(product);
      this.snackBar.open(`${product.name} added to cart!`, 'Close', {
        duration: 3000,
      });
    }
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  isAdmin(): boolean {
    return this.authService.getUserRole() === 'admin';
  }
}

