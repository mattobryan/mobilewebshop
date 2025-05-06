// inventory.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class InventoryService {
  private apiUrl = 'http://localhost:3000/api/products';

  constructor(private http: HttpClient) {}

  getAllProducts(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  updateProductStock(productId: string, quantity: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${productId}/stock`, { quantity });
  }

  bulkUpdateStock(productIds: string[], quantity: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/bulk-update`, { productIds, quantity });
  }

  filterProducts(
    products: any[],
    searchQuery: string,
    category: string,
    stockStatus: string
  ): any[] {
    return products.filter(product => {
      const matchesSearch = !searchQuery || product.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !category || product.category === category;
      const matchesStock = !stockStatus ||
        (stockStatus === 'low' && product.stock < 10) ||
        (stockStatus === 'medium' && product.stock >= 10 && product.stock <= 50) ||
        (stockStatus === 'high' && product.stock > 50);

      return matchesSearch && matchesCategory && matchesStock;
    });
  }
}
