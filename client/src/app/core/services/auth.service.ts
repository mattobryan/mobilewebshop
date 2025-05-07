import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { ApiService } from './api.service';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';



interface AuthResponse {
  status: string;
  token: string;
  refreshToken: string;
  data: {
    user: {
      id: string;
      username: string;
      email: string;
      role: string;
      imageUrl?: string;
      createdAt?: Date;
      createdBy?: string;
      ratingsAverage?: number;
      ratingsQuantity?: number;
      stock?: number;
    }
  };
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
  getUserRole(): string | null {
    const currentUser = this.currentUserSubject.value;
    return currentUser ? currentUser.role : null;
  }
  getUserId(): string | null {
    const currentUser = this.currentUserSubject.value;
    return currentUser ? currentUser.id : null;
  }
  getUserName(): string | null {
    const currentUser = this.currentUserSubject.value;
    return currentUser ? currentUser.username : null;
  }
  getUserEmail(): string | null {
    const currentUser = this.currentUserSubject.value;
    return currentUser ? currentUser.email : null;
  }
  getUserImage(): string | null {
    const currentUser = this.currentUserSubject.value;
    return currentUser ? currentUser.imageUrl : null;
  }
  getUserCreatedAt(): Date | null {
    const currentUser = this.currentUserSubject.value;
    return currentUser ? currentUser.createdAt : null;
  }
  getUserCreatedBy(): string | null {
    const currentUser = this.currentUserSubject.value;
    return currentUser ? currentUser.createdBy : null;
  }
  getUserRatingsAverage(): number | null {
    const currentUser = this.currentUserSubject.value;
    return currentUser ? currentUser.ratingsAverage : null;
  }
  getUserRatingsQuantity(): number | null {
    const currentUser = this.currentUserSubject.value;
    return currentUser ? currentUser.ratingsQuantity : null;
  }
  getUserStock(): number | null {
    const currentUser = this.currentUserSubject.value;
    return currentUser ? currentUser.stock : null;
  }
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'user_data';
  private currentUserSubject = new BehaviorSubject<any>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private tokenExpirationTimer: any;

  constructor(
    private apiService: ApiService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object,
    private httpClient: HttpClient 

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
    try {
      // This method should only be called in browser environment
      const token = this.getCookie('auth_token'); // Try to get token from HttpOnly cookie
      const userData = localStorage?.getItem(this.USER_KEY); // Get user data from localStorage if available
      
      if (token && userData) {
        try {
          const user = JSON.parse(userData);
          this.currentUserSubject.next(user);
  
          // Decode and validate token if available
          const decodedToken = this.getDecodedToken(); // Make sure to use the cookie token here
          if (decodedToken && decodedToken.exp) {
            const expirationDate = new Date(decodedToken.exp * 1000);
            if (expirationDate > new Date()) {
              // Set auto logout timer based on the token's expiration date
              this.autoLogout(expirationDate);
            } else {
              // Token expired, log out
              console.log('Token expired, logging out');
              this.logout();
            }
          }
        } catch (error) {
          console.error('Error parsing user data:', error);
          this.logout(); // Clear invalid data
        }
      }
    } catch (error) {
      console.error('Error loading stored auth:', error);
      this.currentUserSubject.next(null); // Prevent app from becoming unresponsive
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
  googleLogin(idToken: string): Observable<any> {
    return this.http.post('/api/google-login', { idToken });
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
    // Clear HttpOnly cookie (requires server-side support)
    this.deleteCookie('auth_token');
    localStorage.removeItem(this.USER_KEY);
    this.currentUserSubject.next(null);
    
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
  private setCookie(name: string, value: string, expiresIn: number = 3600): void {
    const d = new Date();
    d.setTime(d.getTime() + expiresIn * 1000);
    document.cookie = `${name}=${value};expires=${d.toUTCString()};path=/;Secure;HttpOnly`;
  }

  private getCookie(name: string): string | null {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') c = c.substring(1, c.length);
      if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
  }

  private deleteCookie(name: string): void {
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;Secure;HttpOnly`;
  }

 

  /**
   * Set a timer to automatically logout when token expires
   * @param expirationDate Token expiration date
   */
  private autoLogout(expirationDate: Date): void {
    try {
      const expiresIn = expirationDate.getTime() - new Date().getTime();
      
      // Clear any existing timer
      if (this.tokenExpirationTimer) {
        clearTimeout(this.tokenExpirationTimer);
      }
      
      // Set a reasonable maximum timeout (24 hours)
      const maxTimeout = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
      const timeoutValue = Math.min(expiresIn, maxTimeout);
      
      console.log(`Setting auto logout timer for ${timeoutValue / 1000} seconds`);
      
      this.tokenExpirationTimer = setTimeout(() => {
        console.log('Auto logout timer triggered');
        this.logout();
      }, timeoutValue);
    } catch (error) {
      console.error('Error setting auto logout timer:', error);
    }
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
        // If token can't be decoded, it's invalid - logout
        this.logout();
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
