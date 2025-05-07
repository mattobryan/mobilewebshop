import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-order-confirmation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-confirmation.component.html',
  styleUrls: ['./order-confirmation.component.scss']
})
export class OrderConfirmationComponent implements OnInit {
  orderId: string | null = null;
  order: any = null;
  loading = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.orderId = params['orderId'];
      if (this.orderId) {
        this.loadOrderDetails();
      } else {
        this.error = 'Order ID not found. Please check your orders history.';
        this.loading = false;
      }
    });
  }

  loadOrderDetails(): void {
    if (!this.orderId) return;

    this.loading = true;
    this.error = null;

    this.apiService.get(`orders/${this.orderId}`).subscribe({
      next: (res: any) => {
        this.order = res?.data?.order ?? null;
        if (!this.order) {
          this.error = 'Could not load order details.';
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading order:', err);
        this.error = err.error?.message || 'Failed to load order details. Please try again later.';
        this.loading = false;
      }
    });
  }

  trackOrder(): void {
    alert(`Tracking information for order ${this.orderId} will be available soon.`);
  }
}
