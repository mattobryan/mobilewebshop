import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { CartService } from '../services/cart.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: /* html */ `
    <header class="main-header">
      <div class="container">
        <div class="logo">
          <a routerLink="/">Mobile Shop</a>
        </div>
        
        <nav class="main-nav">
          <ul>
            <li><a routerLink="/products" routerLinkActive="active">Products</a></li>
            
            <!-- Guest Links -->
            <ng-container *ngIf="!isLoggedIn">
              <li><a routerLink="/auth/login" routerLinkActive="active">Login</a></li>
              <li><a routerLink="/auth/register" routerLinkActive="active">Register</a></li>
            </ng-container>
            
            <!-- Customer Links -->
            <ng-container *ngIf="isLoggedIn">
              <li><a routerLink="/cart" routerLinkActive="active">
                Cart 
                <ng-container *ngIf="cartItemCount$ | async as count">
                  <span class="cart-badge" *ngIf="count > 0">{{ count }}</span>
                </ng-container>
              </a></li>
              <li><a routerLink="/orders" routerLinkActive="active">My Orders</a></li>
            </ng-container>
            
            <!-- Admin Links -->
            <ng-container *ngIf="isAdmin">
              <li><a routerLink="/admin" routerLinkActive="active">Admin Panel</a></li>
            </ng-container>
            
            <!-- Logout Link -->
            <ng-container *ngIf="isLoggedIn">
              <li><a href="javascript:void(0)" (click)="logout()">Logout</a></li>
            </ng-container>
          </ul>
        </nav>
        
        <button class="mobile-menu-btn" (click)="toggleMobileMenu()">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
      
      <!-- Mobile Menu -->
      <div class="mobile-menu" [class.active]="mobileMenuOpen">
        <ul>
          <li><a routerLink="/products" routerLinkActive="active" (click)="closeMobileMenu()">Products</a></li>
          
          <!-- Guest Links -->
          <ng-container *ngIf="!isLoggedIn">
            <li><a routerLink="/auth/login" routerLinkActive="active" (click)="closeMobileMenu()">Login</a></li>
            <li><a routerLink="/auth/register" routerLinkActive="active" (click)="closeMobileMenu()">Register</a></li>
          </ng-container>
          
          <!-- Customer Links -->
          <ng-container *ngIf="isLoggedIn">
            <li><a routerLink="/cart" routerLinkActive="active" (click)="closeMobileMenu()">
              Cart 
              <ng-container *ngIf="cartItemCount$ | async as count">
                <span class="cart-badge" *ngIf="count > 0">{{ count }}</span>
              </ng-container>
            </a></li>
            <li><a routerLink="/orders" routerLinkActive="active" (click)="closeMobileMenu()">My Orders</a></li>
          </ng-container>
          
          <!-- Admin Links -->
          <ng-container *ngIf="isAdmin">
            <li><a routerLink="/admin" routerLinkActive="active" (click)="closeMobileMenu()">Admin Panel</a></li>
          </ng-container>
          
          <!-- Logout Link -->
          <ng-container *ngIf="isLoggedIn">
            <li><a href="javascript:void(0)" (click)="logout(); closeMobileMenu()">Logout</a></li>
          </ng-container>
        </ul>
      </div>
    </header>
  `,
  styles: [`
    .main-header {
      background-color: #fff;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      position: sticky;
      top: 0;
      z-index: 100;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 70px;
    }
    .logo a {
      font-size: 24px;
      font-weight: bold;
      color: #2a9d8f;
      text-decoration: none;
      transition: color 0.3s;
    }
    .logo a:hover {
      color: #218879;
    }
    .main-nav ul {
      display: flex;
      list-style: none;
      margin: 0;
      padding: 0;
    }
    .main-nav li {
      margin-left: 20px;
    }
    .main-nav a {
      color: #333;
      text-decoration: none;
      font-size: 16px;
      padding: 10px 0;
      position: relative;
      transition: color 0.3s;
    }
    .main-nav a:hover, .main-nav a.active {
      color: #2a9d8f;
    }
    .main-nav a.active::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      width: 100%;
      height: 2px;
      background-color: #2a9d8f;
    }
    .cart-badge {
      display: inline-block;
      background-color: #e63946;
      color: white;
      border-radius: 50%;
      width: 20px;
      height: 20px;
      font-size: 12px;
      text-align: center;
      line-height: 20px;
      margin-left: 5px;
    }
    .mobile-menu-btn {
      display: none;
      background: none;
      border: none;
      cursor: pointer;
      padding: 10px;
    }
    .mobile-menu-btn span {
      display: block;
      width: 25px;
      height: 3px;
      background-color: #333;
      margin: 5px 0;
      transition: transform 0.3s, opacity 0.3s;
    }
    .mobile-menu {
      display: none;
      position: absolute;
      top: 70px;
      left: 0;
      width: 100%;
      background-color: #fff;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      padding: 20px;
      transform: translateY(-100%);
      transition: transform 0.3s;
      z-index: 99;
    }
    .mobile-menu.active {
      transform: translateY(0);
    }
    .mobile-menu ul {
      list-style: none;
      margin: 0;
      padding: 0;
    }
    .mobile-menu li {
      margin-bottom: 15px;
    }
    .mobile-menu a {
      color: #333;
      text-decoration: none;
      font-size: 18px;
      display: block;
      padding: 5px 0;
    }
    .mobile-menu a:hover, .mobile-menu a.active {
      color: #2a9d8f;
    }
    
    @media (max-width: 768px) {
      .main-nav {
        display: none;
      }
      .mobile-menu-btn {
        display: block;
      }
      .mobile-menu {
        display: block;
      }
    }
  `]
})
export class HeaderComponent implements OnInit {
  isLoggedIn = false;
  isAdmin = false;
  mobileMenuOpen = false;
  cartItemCount$: Observable<number>;

  constructor(
    private authService: AuthService,
    private cartService: CartService
  ) {
    this.cartItemCount$ = this.cartService.getCartItemCount();
  }

  ngOnInit(): void {
    this.updateAuthStatus();
    
    // Subscribe to auth changes
    this.authService.currentUser$.subscribe(() => {
      this.updateAuthStatus();
    });
  }

  updateAuthStatus(): void {
    this.isLoggedIn = this.authService.isLoggedIn();
    this.isAdmin = this.authService.isAdmin();
  }

  logout(): void {
    this.authService.logout();
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
  }
}
