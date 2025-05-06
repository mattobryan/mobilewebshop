import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
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
    orders: true,
    products: true
  };
  error: string = '';

  constructor(private apiService: ApiService) {}

  ngOnInit(): void {
    this.fetchStats();
    this.fetchRecentOrders();
    this.fetchLowStockProducts();
  }

  fetchStats() {
    this.apiService.getAdminStats().subscribe({
      next: (data) => {
        this.stats = data;
      },
      error: (err) => {
        this.error = 'Failed to load stats.';
      }
    });
  }

  fetchRecentOrders() {
    this.apiService.getRecentOrders().subscribe({
      next: (orders) => {
        this.recentOrders = orders;
        this.isLoading.orders = false;
      },
      error: () => {
        this.error = 'Failed to load recent orders.';
        this.isLoading.orders = false;
      }
    });
  }

  fetchLowStockProducts() {
    this.apiService.getLowStockProducts().subscribe({
      next: (products) => {
        this.lowStockProducts = products;
        this.isLoading.products = false;
      },
      error: () => {
        this.error = 'Failed to load low stock products.';
        this.isLoading.products = false;
      }
    });
  }
}
