import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, throwError } from 'rxjs';
import { catchError, timeout, retry } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  /**
   * Performs a GET request to the specified endpoint
   * @param endpoint The API endpoint to call
   * @param params Optional query parameters
   * @returns Observable of the response
   */
  get<T>(endpoint: string, params?: any): Observable<T> {
    return this.http.get<T>(`${this.apiUrl}/${endpoint}`, { params })
      .pipe(
        timeout(30000), // 30 seconds timeout
        retry(1), // Retry once on failure
        catchError(this.handleError)
      );
  }

  /**
   * Performs a POST request to the specified endpoint
   * @param endpoint The API endpoint to call
   * @param body The request body
   * @returns Observable of the response
   */
  post<T>(endpoint: string, body: any): Observable<T> {
    return this.http.post<T>(`${this.apiUrl}/${endpoint}`, body)
      .pipe(
        timeout(30000), // 30 seconds timeout
        retry(1), // Retry once on failure
        catchError(this.handleError)
      );
  }

  /**
   * Performs a PUT request to the specified endpoint
   * @param endpoint The API endpoint to call
   * @param body The request body
   * @returns Observable of the response
   */
  put<T>(endpoint: string, body: any): Observable<T> {
    return this.http.put<T>(`${this.apiUrl}/${endpoint}`, body)
      .pipe(
        timeout(30000), // 30 seconds timeout
        retry(1), // Retry once on failure
        catchError(this.handleError)
      );
  }

  /**
   * Performs a DELETE request to the specified endpoint
   * @param endpoint The API endpoint to call
   * @returns Observable of the response
   */
  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.apiUrl}/${endpoint}`)
      .pipe(
        timeout(30000), // 30 seconds timeout
        retry(1), // Retry once on failure
        catchError(this.handleError)
      );
  }

  /**
   * Performs a PATCH request to the specified endpoint
   * @param endpoint The API endpoint to call
   * @param body The request body
   * @returns Observable of the response
   */
  patch<T>(endpoint: string, body: any): Observable<T> {
    return this.http.patch<T>(`${this.apiUrl}/${endpoint}`, body)
      .pipe(
        timeout(30000), // 30 seconds timeout
        retry(1), // Retry once on failure
        catchError(this.handleError)
      );
  }

  /**
   * Error handler for HTTP requests
   * @param error The HTTP error
   * @returns An observable with the error message
   */
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred';
    
    // Check if this is a client-side error (without using instanceof ErrorEvent)
    if (error.error && typeof error.error.message === 'string' && !error.status) {
      // Client-side error
      errorMessage = `Client Error: ${error.error.message}`;
      console.error('Client-side error:', error.error.message);
    } else {
      // Server-side error
      errorMessage = `Server Error: ${error.status} - ${error.message}`;
      console.error(`Server returned code ${error.status}, message was: ${error.message}`);
      
      // Additional context for specific error codes
      if (error.status === 0) {
        errorMessage = 'Server is unreachable. Please check your connection.';
      } else if (error.status === 504) {
        errorMessage = 'Request timeout. Server took too long to respond.';
      }
    }
    
    return throwError(() => new Error(errorMessage));
  }

  /**
   * Gets admin dashboard statistics
   * @returns Observable of admin statistics
   */
  getAdminStats<T>(): Observable<T> {
    return this.get<T>('admin/stats');
  }

  /**
   * Gets recent orders for admin dashboard
   * @returns Observable of recent orders
   */
  getRecentOrders<T>(): Observable<T> {
    return this.get<T>('admin/orders/recent');
  }

  /**
   * Gets low stock products for admin dashboard
   * @returns Observable of low stock products
   */
  getLowStockProducts<T>(): Observable<T> {
    return this.get<T>('admin/products/low-stock');
  }
}
