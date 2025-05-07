import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { throwError, TimeoutError } from 'rxjs';
import { catchError, timeout, retry } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

export const AuthInterceptor: HttpInterceptorFn = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  // Get the auth token
  const token = authService.getToken();

  // Clone the request and add the authorization header if token exists
  if (token) {
    request = request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  // Handle the request and catch any authentication errors
  return next(request).pipe(
    // Add timeout to prevent hanging requests
    timeout(30000), // 30 seconds timeout
    // Retry failed requests once
    retry(1),
    catchError((error: HttpErrorResponse | TimeoutError) => {
      // Log the error for debugging
      console.error('HTTP request error:', error);
      
      if (error instanceof TimeoutError) {
        console.error('Request timed out');
        return throwError(() => new Error('Request timed out. Please try again.'));
      }
      
      // Handle 401 Unauthorized or 403 Forbidden errors
      if (error instanceof HttpErrorResponse) {
        if (error.status === 401 || error.status === 403) {
          // If the token is invalid or expired, logout the user
          console.log('Authentication error, logging out');
          authService.logout();
        }
        
        // For server errors, provide more context
        if (error.status >= 500) {
          console.error('Server error:', error);
          return throwError(() => new Error('Server error. Please try again later.'));
        }
      }
      
      return throwError(() => error);
    })
  );
};
