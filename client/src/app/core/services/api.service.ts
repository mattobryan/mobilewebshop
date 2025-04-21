import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

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
    return this.http.get<T>(`${this.apiUrl}/${endpoint}`, { params });
  }

  /**
   * Performs a POST request to the specified endpoint
   * @param endpoint The API endpoint to call
   * @param body The request body
   * @returns Observable of the response
   */
  post<T>(endpoint: string, body: any): Observable<T> {
    return this.http.post<T>(`${this.apiUrl}/${endpoint}`, body);
  }

  /**
   * Performs a PUT request to the specified endpoint
   * @param endpoint The API endpoint to call
   * @param body The request body
   * @returns Observable of the response
   */
  put<T>(endpoint: string, body: any): Observable<T> {
    return this.http.put<T>(`${this.apiUrl}/${endpoint}`, body);
  }

  /**
   * Performs a DELETE request to the specified endpoint
   * @param endpoint The API endpoint to call
   * @returns Observable of the response
   */
  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.apiUrl}/${endpoint}`);
  }

  /**
   * Performs a PATCH request to the specified endpoint
   * @param endpoint The API endpoint to call
   * @param body The request body
   * @returns Observable of the response
   */
  patch<T>(endpoint: string, body: any): Observable<T> {
    return this.http.patch<T>(`${this.apiUrl}/${endpoint}`, body);
  }
}
