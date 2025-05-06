import { Routes } from '@angular/router';
import { CartComponent } from './modules/cart/cart.component';
import { OrderHistoryComponent } from './modules/orders/order-history.component';
import { AdminDashboardComponent } from './modules/admin/admin-dashboard.component';
import { isAuthenticated } from './core/guards/auth.guard';
import { isAdmin } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: 'auth',
    children: [
      {
        path: 'login',
        loadComponent: () => import('./modules/auth/login/login/login.component').then(c => c.LoginComponent)
      },
      {
        path: 'register',
        loadComponent: () => import('./modules/auth/register/register.component').then(c => c.RegisterComponent)
      }
    ]
  },
  {
    path: 'products',
    children: [
      {
        path: '',
        loadComponent: () => import('./modules/products/product-list.component').then(c => c.ProductListComponent)
      },
      {
        path: 'create',
        loadComponent: () => import('./modules/products/product-create/product-create.component').then(c => c.ProductCreateComponent),
        canActivate: [isAuthenticated, isAdmin]
      },
      {
        path: 'edit/:id',
        loadComponent: () => import('./modules/products/product-edit/product-edit.component').then(c => c.ProductEditComponent),
        canActivate: [isAuthenticated, isAdmin]
      },
      {
        path: ':id',
        loadComponent: () => import('./modules/products/product-detail/product-detail.component').then(c => c.ProductDetailComponent)
      }
    ]
  },
  {
    path: 'cart',
    component: CartComponent,
    canActivate: [isAuthenticated]
  },
  {
    path: 'checkout',
    loadComponent: () => import('./modules/checkout/checkout.component').then(c => c.CheckoutComponent),
    canActivate: [isAuthenticated]
  },
  {
    path: 'order-confirmation',
    loadComponent: () => import('./modules/checkout/order-confirmation.component').then(c => c.OrderConfirmationComponent),
    canActivate: [isAuthenticated]
  },
  {
    path: 'orders',
    component: OrderHistoryComponent,
    canActivate: [isAuthenticated]
  },
  {
    path: 'profile',
    loadComponent: () => import('./modules/profile/profile.component').then(c => c.ProfileComponent),
    canActivate: [isAuthenticated]
  },
  {
    path: 'admin',
    children: [
      {
        path: '',
        component: AdminDashboardComponent,
        canActivate: [isAuthenticated, isAdmin]
      },
      {
        path: 'products',
        loadComponent: () => import('./modules/admin/product-management.component').then(c => c.ProductManagementComponent),
        canActivate: [isAuthenticated, isAdmin]
      },
      {
        path: 'orders',
        loadComponent: () => import('./modules/admin/order-management.component').then(c => c.OrderManagementComponent),
        canActivate: [isAuthenticated, isAdmin]
      },
      {
        path: 'inventory',
        loadComponent: () => import('./modules/admin/inventory-management.component').then(c => c.InventoryManagementComponent),
        canActivate: [isAuthenticated, isAdmin]
      }
    ]
  },
  {
    path: '',
    redirectTo: 'products',
    pathMatch: 'full'
  }
];
