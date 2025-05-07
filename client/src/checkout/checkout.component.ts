import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService, CartItem } from '../../core/services/cart.service';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: /* html */ `
    <div class="checkout-container">
      <h2>Checkout</h2>
      
      <div class="checkout-content">
        <div class="order-summary">
          <h3>Order Summary</h3>
          
          <div class="cart-items">
            <div class="cart-item" *ngFor="let item of cartItems">
              <div class="item-image">
                <img [src]="item.imageUrl" [alt]="item.name" onerror="this.src='/assets/placeholder.jpg'">
              </div>
              <div class="item-details">
                <h4>{{ item.name }}</h4>
                <p class="item-price">\${{ item.price.toFixed(2) }} x {{ item.quantity }}</p>
              </div>
              <div class="item-total">
                \${{ (item.price * item.quantity).toFixed(2) }}
              </div>
            </div>
          </div>
          
          <div class="summary-totals">
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
          </div>
        </div>
        
        <div class="checkout-form">
          <h3>Shipping Information</h3>
          <form (ngSubmit)="placeOrder()">
            <div class="form-group">
              <label for="name">Full Name</label>
              <input type="text" id="name" name="name" [(ngModel)]="shippingInfo.name" required>
            </div>
            
            <div class="form-group">
              <label for="street">Street Address</label>
              <input type="text" id="street" name="street" [(ngModel)]="shippingInfo.street" required>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label for="city">City</label>
                <input type="text" id="city" name="city" [(ngModel)]="shippingInfo.city" required>
              </div>
              
              <div class="form-group">
                <label for="state">State/Province</label>
                <input type="text" id="state" name="state" [(ngModel)]="shippingInfo.state" required>
              </div>
            </div>
            
            <div class="form-row">
              <div class="form-group">
                <label for="postalCode">Postal Code</label>
                <input type="text" id="postalCode" name="postalCode" [(ngModel)]="shippingInfo.postalCode" required>
              </div>
              
              <div class="form-group">
                <label for="country">Country</label>
                <input type="text" id="country" name="country" [(ngModel)]="shippingInfo.country" required>
              </div>
            </div>
            
            <div class="form-group">
              <label for="phone">Phone Number</label>
              <input type="tel" id="phone" name="phone" [(ngModel)]="shippingInfo.phone" required>
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
            
            <div *ngIf="paymentMethod === 'credit_card'" class="credit-card-form">
              <div class="form-group">
                <label for="cardNumber">Card Number</label>
                <input type="text" id="cardNumber" name="cardNumber" [(ngModel)]="paymentDetails.cardNumber" placeholder="1234 5678 9012 3456" required>
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label for="expiryDate">Expiry Date</label>
                  <input type="text" id="expiryDate" name="expiryDate" [(ngModel)]="paymentDetails.expiryDate" placeholder="MM/YY" required>
                </div>
                
                <div class="form-group">
                  <label for="cvv">CVV</label>
                  <input type="text" id="cvv" name="cvv" [(ngModel)]="paymentDetails.cvv" placeholder="123" required>
                </div>
              </div>
              
              <div class="form-group">
                <label for="nameOnCard">Name on Card</label>
                <input type="text" id="nameOnCard" name="nameOnCard" [(ngModel)]="paymentDetails.nameOnCard" required>
              </div>
            </div>
            
            <div class="form-actions">
              <button type="button" class="back-btn" (click)="goBack()">Back to Cart</button>
              <button type="submit" class="place-order-btn" [disabled]="isSubmitting">
                {{ isSubmitting ? 'Processing...' : 'Place Order' }}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      <div class="error-container" *ngIf="error">
        <div class="error-message">{{ error }}</div>
      </div>
    </div>
  `,
  styles: [`
    .checkout-container {
      max-width: 1200px;
      margin: 20px auto;
      padding: 20px;
    }
    h2 {
      margin-bottom: 20px;
      color: #333;
      text-align: center;
    }
    .checkout-content {
      display: flex;
      flex-wrap: wrap;
      gap: 30px;
    }
    .order-summary {
      flex: 1;
      min-width: 300px;
      background-color: #f9f9f9;
      padding: 20px;
      border-radius: 8px;
      align-self: flex-start;
    }
    .checkout-form {
      flex: 2;
      min-width: 400px;
    }
    h3 {
      margin-top: 0;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 1px solid #ddd;
      color: #333;
    }
    .cart-items {
      margin-bottom: 20px;
    }
    .cart-item {
      display: flex;
      align-items: center;
      padding: 10px 0;
      border-bottom: 1px solid #eee;
    }
    .item-image {
      width: 60px;
      height: 60px;
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
    .item-details h4 {
      margin: 0 0 5px 0;
      font-size: 16px;
    }
    .item-price {
      color: #666;
      font-size: 14px;
      margin: 0;
    }
    .item-total {
      font-weight: bold;
      min-width: 80px;
      text-align: right;
    }
    .summary-totals {
      margin-top: 20px;
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
    input[type="text"],
    input[type="tel"] {
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
    .credit-card-form {
      background-color: #f9f9f9;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 20px;
    }
    .form-actions {
      display: flex;
      justify-content: space-between;
      margin-top: 20px;
    }
    button {
      padding: 12px 20px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
      transition: background-color 0.3s;
    }
    .back-btn {
      background-color: #6c757d;
      color: white;
    }
    .back-btn:hover {
      background-color: #5a6268;
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
      margin-top: 20px;
      padding: 15px;
      background-color: #f8d7da;
      color: #721c24;
      border-radius: 4px;
    }
    @media (max-width: 768px) {
      .checkout-content {
        flex-direction: column;
      }
      .form-row {
        flex-direction: column;
        gap: 0;
      }
    }
  `]
})
export class CheckoutComponent implements OnInit {
  cartItems: CartItem[] = [];
  cartTotal = 0;
  isSubmitting = false;
  error: string | null = null;
  
  shippingInfo = {
    name: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    phone: ''
  };
  
  paymentMethod: 'credit_card' | 'paypal' | 'stripe' = 'credit_card';
  
  paymentDetails = {
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    nameOnCard: ''
  };

  constructor(
    private cartService: CartService,
    private apiService: ApiService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCartItems();
    this.prefillUserInfo();
  }

  loadCartItems(): void {
    this.cartService.cartItems$.subscribe(items => {
      this.cartItems = items;
      
      if (this.cartItems.length === 0) {
        this.router.navigate(['/cart']);
        return;
      }
      
      this.calculateTotal();
    });
  }

  prefillUserInfo(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.shippingInfo.name = currentUser.username || '';
    }
  }

  calculateTotal(): void {
    this.cartTotal = this.cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  goBack(): void {
    this.router.navigate(['/cart']);
  }

  placeOrder(): void {
    if (!this.validateForm()) {
      return;
    }

    this.isSubmitting = true;
    this.error = null;

    const orderData = {
      items: this.cartItems.map(item => ({
        product: item.productId,
        quantity: item.quantity,
        price: item.price
      })),
      shippingAddress: this.shippingInfo,
      paymentMethod: this.paymentMethod,
      paymentDetails: this.paymentMethod === 'credit_card' ? {
        last4: this.paymentDetails.cardNumber.slice(-4),
        expiryDate: this.paymentDetails.expiryDate
      } : {}
    };

    this.apiService.post('orders', orderData).subscribe({
      next: (response: any) => {
        console.log('Order placed successfully:', response);
        this.cartService.clearCart();
        
        // Navigate to order confirmation page with order ID
        if (response && response.data && response.data.order) {
          this.router.navigate(['/order-confirmation'], { 
            queryParams: { orderId: response.data.order._id } 
          });
        } else {
          this.router.navigate(['/order-confirmation']);
        }
      },
      error: (err) => {
        console.error('Error placing order:', err);
        this.error = err.error?.message || 'Failed to place order. Please try again.';
        this.isSubmitting = false;
      }
    });
  }

  validateForm(): boolean {
    // Basic validation
    if (!this.shippingInfo.name || 
        !this.shippingInfo.street || 
        !this.shippingInfo.city || 
        !this.shippingInfo.state || 
        !this.shippingInfo.postalCode || 
        !this.shippingInfo.country || 
        !this.shippingInfo.phone) {
      this.error = 'Please fill in all shipping information fields';
      return false;
    }
    
    // Validate payment details if credit card is selected
    if (this.paymentMethod === 'credit_card') {
      if (!this.paymentDetails.cardNumber || 
          !this.paymentDetails.expiryDate || 
          !this.paymentDetails.cvv || 
          !this.paymentDetails.nameOnCard) {
        this.error = 'Please fill in all payment details';
        return false;
      }
      
      // Basic credit card validation
      if (!/^\d{16}$/.test(this.paymentDetails.cardNumber.replace(/\s/g, ''))) {
        this.error = 'Please enter a valid 16-digit card number';
        return false;
      }
      
      if (!/^\d{3,4}$/.test(this.paymentDetails.cvv)) {
        this.error = 'Please enter a valid CVV code (3-4 digits)';
        return false;
      }
    }
    
    return true;
  }
}
