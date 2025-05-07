import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService, CartItem } from '../../core/services/cart.service';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit {
  cartItems: CartItem[] = [];
  cartTotal = 0;
  isSubmitting = false;
  error: string | null = null;
  checkoutForm: FormGroup;
  totalPrice = 0;
  
  // These properties are needed for backward compatibility
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
    private router: Router,
    private fb: FormBuilder
  ) {
    this.checkoutForm = this.fb.group({
      shippingInfo: this.fb.group({
        name: ['', Validators.required],
        street: ['', Validators.required],
        city: ['', Validators.required],
        state: ['', Validators.required],
        postalCode: ['', Validators.required],
        country: ['', Validators.required],
        phone: ['', Validators.required]
      }),
      paymentMethod: ['credit_card', Validators.required],
      paymentDetails: this.fb.group({
        cardNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{16}$/)]],
        expiryDate: ['', Validators.required],
        cvv: ['', [Validators.required, Validators.pattern(/^[0-9]{3,4}$/)]],
        nameOnCard: ['', Validators.required]
      })
    });
  }

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

  submitOrder(): void {
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

        if (response?.data?.order) {
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

    if (this.paymentMethod === 'credit_card') {
      if (!this.paymentDetails.cardNumber || 
          !this.paymentDetails.expiryDate || 
          !this.paymentDetails.cvv || 
          !this.paymentDetails.nameOnCard) {
        this.error = 'Please fill in all payment details';
        return false;
      }

      if (!/^[0-9]{16}$/.test(this.paymentDetails.cardNumber.replace(/\s/g, ''))) {
        this.error = 'Please enter a valid 16-digit card number';
        return false;
      }

      if (!/^[0-9]{3,4}$/.test(this.paymentDetails.cvv)) {
        this.error = 'Please enter a valid CVV code';
        return false;
      }
    }

    return true;
  }
}
