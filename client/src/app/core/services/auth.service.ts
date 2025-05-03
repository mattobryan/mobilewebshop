import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { ApiService } from './api.service';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { isPlatformBrowser } from '@angular/common';

interface AuthResponse {
  status: string;
  token: string;
  data: {
    user: {
      id: string;
      username: string;
      email: string;
      role: string;
    }
  }
}

interface DecodedToken {
  id: string;
  role: string;
  exp: number;
  iat: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'user_data';
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private tokenExpirationTimer: any;

  constructor(
    private apiService: ApiService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Only load stored auth if running in browser
    if (isPlatformBrowser(this.platformId)) {
      this.loadStoredAuth();
    }
  }

  /**
   * Load stored authentication data from localStorage on service initialization
   */
  private loadStoredAuth(): void {
    // This method should only be called in browser environment
    const token = localStorage?.getItem(this.TOKEN_KEY);
    const userData = localStorage?.getItem(this.USER_KEY);
    
    if (token && userData) {
      const user = JSON.parse(userData);
      this.currentUserSubject.next(user);
      
      // Check if token is expired
      const decodedToken = this.getDecodedToken();
      if (decodedToken && decodedToken.exp) {
        const expirationDate = new Date(decodedToken.exp * 1000);
        if (expirationDate > new Date()) {
          // Set auto logout timer
          this.autoLogout(expirationDate);
        } else {
          // Token expired, logout
          this.logout();
        }
      }
    }
  }

  /**
   * Login user with email and password
   * @param email User email
   * @param password User password
   * @returns Observable of the login response
   */
  login(email: string, password: string): Observable<AuthResponse> {
    return this.apiService.post<AuthResponse>('auth/login', { email, password })
      .pipe(
        tap(response => {
          if (response && response.token) {
            this.handleAuthentication(response);
          }
        })
      );
  }

  /**
   * Register a new user
   * @param username Username
   * @param email Email
   * @param password Password
   * @returns Observable of the registration response
   */
  register(username: string, email: string, password: string): Observable<AuthResponse> {
    return this.apiService.post<AuthResponse>('auth/register', { username, email, password })
      .pipe(
        tap(response => {
          if (response && response.token) {
            this.handleAuthentication(response);
          }
        })
      );
  }

  /**
   * Handle authentication response
   * @param response Auth response containing token and user data
   */
  private handleAuthentication(response: AuthResponse): void {
    const { token, data } = response;
    
    // Store token and user data (only in browser)
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.TOKEN_KEY, token);
      localStorage.setItem(this.USER_KEY, JSON.stringify(data.user));
    }
    
    // Update current user
    this.currentUserSubject.next(data.user);
    
    // Set auto logout timer
    const decodedToken = this.getDecodedToken();
    if (decodedToken && decodedToken.exp) {
      const expirationDate = new Date(decodedToken.exp * 1000);
      this.autoLogout(expirationDate);
    }
  }

  /**
   * Logout the current user
   */
  logout(): void {
    // Clear stored data (only in browser)
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
    }
    
    // Reset current user
    this.currentUserSubject.next(null);
    
    // Clear logout timer
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
      this.tokenExpirationTimer = null;
    }
    
    // Redirect to login page
    this.router.navigate(['/login']);
  }

  /**
   * Set a timer to automatically logout when token expires
   * @param expirationDate Token expiration date
   */
  private autoLogout(expirationDate: Date): void {
    const expiresIn = expirationDate.getTime() - new Date().getTime();
    
    this.tokenExpirationTimer = setTimeout(() => {
      this.logout();
    }, expiresIn);
  }

  /**
   * Get the stored JWT token
   * @returns The JWT token or null if not logged in
   */
  getToken(): string | null {
    return isPlatformBrowser(this.platformId) ? localStorage.getItem(this.TOKEN_KEY) : null;
  }

  /**
   * Get the decoded JWT token
   * @returns Decoded token or null if not logged in
   */
  getDecodedToken(): DecodedToken | null {
    const token = this.getToken();
    if (token) {
      try {
        return jwtDecode<DecodedToken>(token);
      } catch (error) {
        console.error('Error decoding token:', error);
        return null;
      }
    }
    return null;
  }

  /**
   * Check if user is logged in
   * @returns True if user is logged in, false otherwise
   */
  isLoggedIn(): boolean {
    const token = this.getToken();
    if (!token) return false;
    
    const decodedToken = this.getDecodedToken();
    if (!decodedToken) return false;
    
    // Check if token is expired
    const expirationDate = new Date(decodedToken.exp * 1000);
    return expirationDate > new Date();
  }

  /**
   * Check if current user is an admin
   * @returns True if user is an admin, false otherwise
   */
  isAdmin(): boolean {
    if (!this.isLoggedIn()) return false;
    
    const decodedToken = this.getDecodedToken();
    return decodedToken?.role === 'admin';
  }

  /**
   * Get the current user data
   * @returns Current user data or null if not logged in
   */
  getCurrentUser(): any {
    return this.currentUserSubject.value;
  }
}
