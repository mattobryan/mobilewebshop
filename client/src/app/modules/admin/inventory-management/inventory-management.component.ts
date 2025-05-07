import { Component, OnInit } from '@angular/core';
import { InventoryService } from './inventory-service';
import { debounceTime, Subject } from 'rxjs';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-inventory-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './inventory-management.component.html',
  styleUrls: ['./inventory-management.component.scss']
})
export class InventoryManagementComponent implements OnInit {
  products: any[] = [];
  filteredProducts: any[] = [];
  searchQuery: string = '';
  searchInputChanged = new Subject<string>();
  filterByCategory: string = '';
  filterByStock: string = '';
  newStock: { [key: string]: number } = {};
  bulkUpdateValue: number = 0;

  constructor(private inventoryService: InventoryService) {}

  ngOnInit(): void {
    this.fetchProducts();
    this.searchInputChanged.pipe(debounceTime(300)).subscribe(value => {
      this.searchQuery = value;
      this.applyFilters();
    });
  }

  onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.searchInputChanged.next(target.value);
  }

  fetchProducts(): void {
    this.inventoryService.getAllProducts().subscribe({
      next: (data: any[]) => {
        this.products = data;
        this.applyFilters();
      },
      error: (error) => console.error('Error fetching products', error)
    });
  }

  updateStock(productId: string): void {
    const quantity = this.newStock[productId];
    if (quantity == null || quantity < 0) return;
    this.inventoryService.updateProductStock(productId, quantity).subscribe({
      next: () => this.fetchProducts(),
      error: (error) => console.error('Error updating stock', error)
    });
  }

  applyFilters(): void {
    this.filteredProducts = this.inventoryService.filterProducts(
      this.products,
      this.searchQuery,
      this.filterByCategory,
      this.filterByStock
    );
  }

  bulkUpdateStock(): void {
    if (this.bulkUpdateValue < 0) return;
    const productIds = this.filteredProducts.map(product => product._id);
    this.inventoryService.bulkUpdateStock(productIds, this.bulkUpdateValue).subscribe({
      next: () => this.fetchProducts(),
      error: (error) => console.error('Error performing bulk update', error)
    });
  }

  onImgError(event: any): void {
    event.target.src = '/assets/placeholder.jpg';
  }

  trackByProductId(index: number, product: any): string {
    return product._id;
  }
}
