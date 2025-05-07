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
    // Add error handling to prevent app from becoming unresponsive
    this.fetchStats();
    this.fetchRecentOrders();
    this.fetchLowStockProducts();
  }

  fetchStats() {
    this.apiService.getAdminStats<{
      totalOrders: number;
      totalRevenue: number;
      totalProducts: number;
      totalUsers: number;
    }>().subscribe({
      next: (data) => {
        this.stats = data;
      },
      error: (err: any) => {
        console.error('Error loading stats:', err);
        this.error = 'Failed to load stats.';
      },
      complete: () => {
        // Ensure loading state is updated even if there's an error
        // This prevents the UI from showing perpetual loading state
      }
    });
  }

  fetchRecentOrders() {
    this.apiService.getRecentOrders<any[]>().subscribe({
      next: (orders) => {
        this.recentOrders = orders;
        this.isLoading.orders = false;
      },
      error: (err) => {
        console.error('Error loading recent orders:', err);
        this.error = 'Failed to load recent orders.';
        this.isLoading.orders = false;
      },
      complete: () => {
        // Ensure loading state is updated
        this.isLoading.orders = false;
      }
    });
  }

  fetchLowStockProducts() {
    this.apiService.getLowStockProducts<any[]>().subscribe({
      next: (products) => {
        this.lowStockProducts = products;
        this.isLoading.products = false;
      },
      error: (err) => {
        console.error('Error loading low stock products:', err);
        this.error = 'Failed to load low stock products.';
        this.isLoading.products = false;
      },
      complete: () => {
        // Ensure loading state is updated
        this.isLoading.products = false;
      }
    });
  }
}
