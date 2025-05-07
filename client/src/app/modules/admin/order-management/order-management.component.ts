import { Component, OnInit } from '@angular/core';
import { OrderManagementService } from './order-management.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-order-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './order-management.component.html',
  styleUrls: ['./order-management.component.scss']
})
export class OrderManagementComponent implements OnInit {
  orders: any[] = [];
  filteredOrders: any[] = [];
  isLoading = true;
  error: string | null = null;
  successMessage: string | null = null;
  
  // Filters
  searchQuery = '';
  statusFilter = 'all';
  paymentFilter = 'all';
  
  // Order details modal
  showDetailsModal = false;
  selectedOrder: any = null;
  
  // Update order modal
  showUpdateModal = false;
  orderToUpdate: any = null;
  isUpdating = false;
  transactionId = '';
  trackingNumber = '';
  notes = '';

  constructor(private orderService: OrderManagementService) {}

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading = true;
    this.error = null;
    
    this.orderService.getOrders().subscribe({
      next: (response: any) => {
        if (response && response.data && response.data.orders) {
          this.orders = response.data.orders;
          this.orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          this.filteredOrders = [...this.orders];
        } else {
          this.orders = [];
          this.filteredOrders = [];
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading orders:', err);
        this.error = 'Failed to load orders. Please try again later.';
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    this.filteredOrders = this.orders.filter(order => {
      if (this.searchQuery && !order._id.toLowerCase().includes(this.searchQuery.toLowerCase())) {
        return false;
      }
      if (this.statusFilter !== 'all' && order.status !== this.statusFilter) {
        return false;
      }
      if (this.paymentFilter !== 'all' && order.paymentStatus !== this.paymentFilter) {
        return false;
      }
      return true;
    });
  }

  // Open and close modals as per the current logic
  viewOrderDetails(order: any): void {
    this.selectedOrder = { ...order };
    this.showDetailsModal = true;
  }

  closeDetailsModal(): void {
    this.showDetailsModal = false;
    this.selectedOrder = null;
  }

  openUpdateModal(order: any): void {
    this.orderToUpdate = { ...order };
    this.transactionId = order.paymentDetails?.transactionId || '';
    this.trackingNumber = order.trackingNumber || '';
    this.notes = '';
    this.showUpdateModal = true;
    this.showDetailsModal = false; // Close details modal if it's open
  }

  closeUpdateModal(): void {
    this.showUpdateModal = false;
    this.orderToUpdate = null;
    this.transactionId = '';
    this.trackingNumber = '';
    this.notes = '';
  }

  updateOrder(): void {
    if (!this.orderToUpdate) return;
    
    this.isUpdating = true;
    this.error = null;
    
    const updateData: any = {
      status: this.orderToUpdate.status,
      paymentStatus: this.orderToUpdate.paymentStatus
    };
    
    if (this.orderToUpdate.paymentStatus === 'paid' && this.transactionId) {
      updateData.paymentDetails = { transactionId: this.transactionId };
    }
    
    if (this.orderToUpdate.status === 'shipped' && this.trackingNumber) {
      updateData.trackingNumber = this.trackingNumber;
    }
    
    if (this.notes) {
      updateData.notes = this.notes;
    }
    
    this.orderService.updateOrder(this.orderToUpdate._id, updateData).subscribe({
      next: (response: any) => {
        this.isUpdating = false;
        this.showUpdateModal = false;
        
        // Update in orders and filtered orders arrays
        const updatedOrder = response.data?.order || this.orderToUpdate;
        const updateInArray = (arr: any[]) => {
          const idx = arr.findIndex(o => o._id === this.orderToUpdate._id);
          if (idx !== -1) {
            arr[idx] = { ...arr[idx], ...updatedOrder };
          }
        };
        
        updateInArray(this.orders);
        updateInArray(this.filteredOrders);
        
        this.successMessage = `Order ${this.orderToUpdate._id.substring(this.orderToUpdate._id.length - 8)} has been updated.`;
        setTimeout(() => {
          this.successMessage = null;
        }, 5000);
        
        this.orderToUpdate = null;
      },
      error: (err) => {
        console.error('Error updating order:', err);
        this.error = err.error?.message || 'Failed to update order. Please try again.';
        this.isUpdating = false;
      }
    });
  }
}
