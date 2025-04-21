import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="navbar">
      <div class="logo">Mobile Shop</div>
      <div class="nav-links">
        <a routerLink="/products" routerLinkActive="active">Products</a>
        <a routerLink="/cart" routerLinkActive="active">Cart</a>
        <a routerLink="/auth/login" routerLinkActive="active">Login</a>
      </div>
    </nav>
  `,
  styles: [`
    .navbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background-color: #333;
      color: white;
      padding: 10px 20px;
      margin-bottom: 20px;
    }
    .logo {
      font-size: 1.5rem;
      font-weight: bold;
    }
    .nav-links {
      display: flex;
      gap: 20px;
    }
    .nav-links a {
      color: white;
      text-decoration: none;
      padding: 5px 10px;
      border-radius: 4px;
      transition: background-color 0.3s;
    }
    .nav-links a:hover, .nav-links a.active {
      background-color: #555;
    }
  `]
})
export class NavbarComponent {}
