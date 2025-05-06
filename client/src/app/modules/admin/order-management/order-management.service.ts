import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrderManagementService {

  constructor(private http: HttpClient) {}

  // Get orders
  getOrders(): Observable<any> {
    return this.http.get('/api/orders');
  }

  // Update order
  updateOrder(orderId: string, updateData: any): Observable<any> {
    return this.http.patch(`/api/orders/${orderId}`, updateData);
  }
}
