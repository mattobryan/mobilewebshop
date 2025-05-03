import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CartService, CartItem } from '../../core/services/cart.service';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: /* html */ `
    <div class="cart-container">
      <h2>Your Shopping Cart</h2>
      
      <div class="empty-cart" *ngIf="cartItems.length === 0">
        <p>Your cart is empty.</p>
        <button class="continue-shopping-btn" routerLink="/products">Continue Shopping</button>
      </div>
      
      <div class="cart-content" *ngIf="cartItems.length > 0">
        <div class="cart-items">
          <div class="cart-item" *ngFor="let item of cartItems">
            <div class="item-image">
              <img [src]="item.imageUrl" [alt]="item.name" onerror="this.src='/assets/placeholder.jpg'">
            </div>
            <div class="item-details">
              <h3>{{ item.name }}</h3>
              <p class="item-price">\${{ item.price.toFixed(2) }}</p>
            </div>
            <div class="item-quantity">
              <button class="quantity-btn" (click)="decreaseQuantity(item)">-</button>
              <input type="number" [value]="item.quantity" (change)="updateQuantity(item, $event)" min="1">
              <button class="quantity-btn" (click)="increaseQuantity(item)">+</button>
            </div>
            <div class="item-total">
              \${{ (item.price * item.quantity).toFixed(2) }}
            </div>
            <button class="remove-btn" (click)="removeItem(item.productId)">
              <span class="remove-icon">×</span>
            </button>
          </div>
        </div>
        
        <div class="cart-summary">
          <h3>Order Summary</h3>
          <div class="summary-row">
            <span>Subtotal:</span>
            <span>\${{ cartTotal.toFixed(2) }}</span>
          </div>
          <div class="summary-row">
            <span>Shipping:</span>
            <span>Free</span>
          </div>
          <div class="summary-row total">
            <span>Total:</span>
            <span>\${{ cartTotal.toFixed(2) }}</span>
          </div>
          
          <button class="checkout-btn" (click)="checkout()" [disabled]="isSubmitting">
            {{ isSubmitting ? 'Processing...' : 'Proceed to Checkout' }}
          </button>
          <button class="clear-cart-btn" (click)="clearCart()">Clear Cart</button>
          <button class="continue-shopping-btn" routerLink="/products">Continue Shopping</button>
        </div>
      </div>
    </div>
    
    <!-- Checkout Form -->
    <div class="checkout-form" *ngIf="showCheckoutForm && cartItems.length > 0">
      <h3>Shipping Information</h3>
      <form (ngSubmit)="placeOrder()">
        <div class="form-group">
          <label for="street">Street Address</label>
          <input type="text" id="street" name="street" [(ngModel)]="shippingAddress.street" required>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label for="city">City</label>
            <input type="text" id="city" name="city" [(ngModel)]="shippingAddress.city" required>
          </div>
          
          <div class="form-group">
            <label for="state">State/Province</label>
            <input type="text" id="state" name="state" [(ngModel)]="shippingAddress.state" required>
          </div>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label for="postalCode">Postal Code</label>
            <input type="text" id="postalCode" name="postalCode" [(ngModel)]="shippingAddress.postalCode" required>
          </div>
          
          <div class="form-group">
            <label for="country">Country</label>
            <input type="text" id="country" name="country" [(ngModel)]="shippingAddress.country" required>
          </div>
        </div>
        
        <h3>Payment Method</h3>
        <div class="payment-methods">
          <div class="payment-method">
            <input type="radio" id="credit_card" name="paymentMethod" value="credit_card" [(ngModel)]="paymentMethod" checked>
            <label for="credit_card">Credit Card</label>
          </div>
          
          <div class="payment-method">
            <input type="radio" id="paypal" name="paymentMethod" value="paypal" [(ngModel)]="paymentMethod">
            <label for="paypal">PayPal</label>
          </div>
          
          <div class="payment-method">
            <input type="radio" id="stripe" name="paymentMethod" value="stripe" [(ngModel)]="paymentMethod">
            <label for="stripe">Stripe</label>
          </div>
        </div>
        
        <div class="form-actions">
          <button type="button" class="cancel-btn" (click)="showCheckoutForm = false">Cancel</button>
          <button type="submit" class="place-order-btn" [disabled]="isSubmitting">
            {{ isSubmitting ? 'Processing...' : 'Place Order' }}
          </button>
        </div>
      </form>
    </div>
    
    <div class="error-container" *ngIf="error">
      <div class="error-message">{{ error }}</div>
    </div>
  `,
  styles: [`
    .cart-container {
      max-width: 1200px;
      margin: 20px auto;
      padding: 20px;
    }
    h2 {
      margin-bottom: 20px;
      color: #333;
      text-align: center;
    }
    .empty-cart {
      text-align: center;
      padding: 40px;
      background-color: #f9f9f9;
      border-radius: 8px;
    }
    .empty-cart p {
      font-size: 18px;
      color: #666;
      margin-bottom: 20px;
    }
    .cart-content {
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
    }
    .cart-items {
      flex: 2;
      min-width: 300px;
    }
    .cart-item {
      display: flex;
      align-items: center;
      padding: 15px;
      margin-bottom: 10px;
      background-color: #f9f9f9;
      border-radius: 8px;
      position: relative;
    }
    .item-image {
      width: 80px;
      height: 80px;
      margin-right: 15px;
    }
    .item-image img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      border-radius: 4px;
    }
    .item-details {
      flex: 2;
    }
    .item-details h3 {
      margin: 0 0 5px 0;
      font-size: 16px;
    }
    .item-price {
      color: #666;
      font-size: 14px;
    }
    .item-quantity {
      display: flex;
      align-items: center;
      margin: 0 15px;
    }
    .quantity-btn {
      width: 30px;
      height: 30px;
      background-color: #e9ecef;
      border: none;
      border-radius: 4px;
      font-size: 16px;
      cursor: pointer;
    }
    .item-quantity input {
      width: 40px;
      height: 30px;
      text-align: center;
      margin: 0 5px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    .item-total {
      font-weight: bold;
      min-width: 80px;
      text-align: right;
    }
    .remove-btn {
      background: none;
      border: none;
      color: #e63946;
      font-size: 20px;
      cursor: pointer;
      padding: 0 10px;
    }
    .remove-icon {
      font-size: 24px;
      line-height: 1;
    }
    .cart-summary {
      flex: 1;
      min-width: 250px;
      background-color: #f9f9f9;
      padding: 20px;
      border-radius: 8px;
      align-self: flex-start;
    }
    .cart-summary h3 {
      margin-top: 0;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 1px solid #ddd;
    }
    .summary-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 10px;
    }
    .total {
      font-weight: bold;
      font-size: 18px;
      margin-top: 10px;
      padding-top: 10px;
      border-top: 1px solid #ddd;
    }
    button {
      width: 100%;
      padding: 12px;
      margin-bottom: 10px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
      transition: background-color 0.3s;
    }
    .checkout-btn {
      background-color: #2a9d8f;
      color: white;
    }
    .checkout-btn:hover:not(:disabled) {
      background-color: #218879;
    }
    .checkout-btn:disabled {
      background-color: #cccccc;
      cursor: not-allowed;
    }
    .clear-cart-btn {
      background-color: #e63946;
      color: white;
    }
    .clear-cart-btn:hover {
      background-color: #d62b39;
    }
    .continue-shopping-btn {
      background-color: #457b9d;
      color: white;
    }
    .continue-shopping-btn:hover {
      background-color: #366785;
    }
    
    /* Checkout Form Styles */
    .checkout-form {
      max-width: 800px;
      margin: 20px auto;
      padding: 20px;
      background-color: #f9f9f9;
      border-radius: 8px;
    }
    .checkout-form h3 {
      margin-top: 0;
      margin-bottom: 15px;
      color: #333;
    }
    .form-group {
      margin-bottom: 15px;
    }
    .form-row {
      display: flex;
      gap: 15px;
    }
    .form-row .form-group {
      flex: 1;
    }
    label {
      display: block;
      margin-bottom: 5px;
      font-weight: bold;
      color: #555;
    }
    input[type="text"] {
      width: 100%;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 16px;
    }
    .payment-methods {
      margin-bottom: 20px;
    }
    .payment-method {
      margin-bottom: 10px;
    }
    .payment-method input[type="radio"] {
      margin-right: 10px;
    }
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 20px;
    }
    .form-actions button {
      width: auto;
      padding: 12px 20px;
    }
    .cancel-btn {
      background-color: #e9ecef;
      color: #495057;
    }
    .cancel-btn:hover {
      background-color: #dee2e6;
    }
    .place-order-btn {
      background-color: #2a9d8f;
      color: white;
    }
    .place-order-btn:hover:not(:disabled) {
      background-color: #218879;
    }
    .place-order-btn:disabled {
      background-color: #cccccc;
      cursor: not-allowed;
    }
    .error-container {
      max-width: 800px;
      margin: 20px auto;
      padding: 15px;
      background-color: #f8d7da;
      color: #721c24;
      border-radius: 4px;
    }
    @media (max-width: 768px) {
      .cart-content {
        flex-direction: column;
      }
      .form-row {
        flex-direction: column;
        gap: 0;
      }
    }
  `]
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
    this.loadCartItems();
  }

  loadCartItems(): void {
    this.cartService.cartItems$.subscribe(items => {
      this.cartItems = items;
      this.calculateTotal();
    });
  }

  calculateTotal(): void {
    this.cartTotal = this.cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  updateQuantity(item: CartItem, event: any): void {
    const newQuantity = parseInt(event.target.value, 10);
    if (newQuantity > 0) {
      this.cartService.updateQuantity(item.productId, newQuantity);
    } else {
      event.target.value = item.quantity;
    }
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
      this.error = 'Please log in to proceed with checkout';
      setTimeout(() => {
        this.router.navigate(['/login']);
      }, 2000);
      return;
    }
    
    this.showCheckoutForm = true;
    this.error = null;
  }

  placeOrder(): void {
    if (!this.validateShippingAddress()) {
      this.error = 'Please fill in all shipping address fields';
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
      next: (response: any) => {
        console.log('Order placed successfully:', response);
        this.cartService.clearCart();
        this.router.navigate(['/orders']);
      },
      error: (err) => {
        console.error('Error placing order:', err);
        this.error = err.error?.message || 'Failed to place order. Please try again.';
        this.isSubmitting = false;
      },
      complete: () => {
        this.isSubmitting = false;
      }
    });
  }

  validateShippingAddress(): boolean {
    return (
      !!this.shippingAddress.street &&
      !!this.shippingAddress.city &&
      !!this.shippingAddress.state &&
      !!this.shippingAddress.postalCode &&
      !!this.shippingAddress.country
    );
  }
}
