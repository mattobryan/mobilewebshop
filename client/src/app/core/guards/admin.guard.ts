import { Injectable } from '@angular/core';
import { CanActivate, CanActivateFn, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    // First check if user is logged in
    if (!this.authService.isLoggedIn()) {
      return this.router.createUrlTree(['/login']);
    }
    
    // Then check if user is an admin
    if (this.authService.isAdmin()) {
      return true;
    }
    
    // Redirect to products page if user is not an admin
    return this.router.createUrlTree(['/products']);
  }
}

// Standalone function for use with the new functional guards in Angular 14+
export const isAdmin: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  // First check if user is logged in
  if (!authService.isLoggedIn()) {
    return router.createUrlTree(['/login']);
  }
  
  // Then check if user is an admin
  if (authService.isAdmin()) {
    return true;
  }
  
  // Redirect to products page if user is not an admin
  return router.createUrlTree(['/products']);
};

// Need to add this for the standalone function to work
import { inject } from '@angular/core';
