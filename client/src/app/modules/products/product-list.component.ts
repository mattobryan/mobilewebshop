import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { NavbarComponent } from './shared/navbar.component';
import { environment } from '../../../environments/environment';

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  imageUrl: string;
}

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, NavbarComponent],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent implements OnInit {
  products: Product[] = [];
  loading = false;
  error = '';

  constructor(private apiService: ApiService) { }

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.loading = true;
    this.error = '';
    
    this.apiService.get<any>('products').subscribe({
      next: (response) => {
        this.loading = false;
        // Handle the API response structure which includes data.products
        if (response && response.data && response.data.products) {
          this.products = response.data.products;
        } else {
          // If the response structure is different, try to use it directly
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
}
