import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { CartService, CartItem } from '../../core/services/cart.service';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {
  cartItems: CartItem[] = [];
  cartTotal = 0;
  showCheckoutForm = false;
  isSubmitting = false;
  error: string | null = null;

  shippingAddress = {
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: ''
  };

  paymentMethod: 'credit_card' | 'paypal' | 'stripe' = 'credit_card';

  constructor(
    private cartService: CartService,
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cartService.cartItems$.subscribe(items => {
      this.cartItems = items;
      this.calculateTotal();
    });
  }

  calculateTotal(): void {
    this.cartTotal = this.cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }

  updateQuantity(item: CartItem, event: any): void {
    const newQuantity = Math.max(1, parseInt(event.target.value, 10) || 1);
    this.cartService.updateQuantity(item.productId, newQuantity);
  }

  increaseQuantity(item: CartItem): void {
    this.cartService.updateQuantity(item.productId, item.quantity + 1);
  }

  decreaseQuantity(item: CartItem): void {
    if (item.quantity > 1) {
      this.cartService.updateQuantity(item.productId, item.quantity - 1);
    }
  }

  removeItem(productId: string): void {
    this.cartService.removeFromCart(productId);
  }

  clearCart(): void {
    if (confirm('Are you sure you want to clear your cart?')) {
      this.cartService.clearCart();
    }
  }

  checkout(): void {
    if (!this.authService.isLoggedIn()) {
      this.error = 'Please log in to proceed with checkout.';
      setTimeout(() => this.router.navigate(['/login']), 2000);
      return;
    }
    this.showCheckoutForm = true;
    this.error = null;
  }

  validateShippingAddress(): boolean {
    const { street, city, state, postalCode, country } = this.shippingAddress;
    return !!(street && city && state && postalCode && country);
  }

  placeOrder(): void {
    if (!this.validateShippingAddress()) {
      this.error = 'Please fill in all shipping address fields.';
      return;
    }

    this.isSubmitting = true;
    this.error = null;

    const orderData = {
      items: this.cartItems.map(item => ({
        product: item.productId,
        quantity: item.quantity
      })),
      shippingAddress: this.shippingAddress,
      paymentMethod: this.paymentMethod
    };

    this.apiService.post('orders', orderData).subscribe({
      next: (response) => {
        console.log('Order placed successfully:', response);
        this.cartService.clearCart();
        this.router.navigate(['/orders']);
      },
      error: (err) => {
        console.error('Order failed:', err);
        this.error = 'Failed to place order. Please try again later.';
        this.isSubmitting = false;
      }
    });
  }

  trackByProductId(index: number, item: CartItem) {
    return item.productId;
  }
}
