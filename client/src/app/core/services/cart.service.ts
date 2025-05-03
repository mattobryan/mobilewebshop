import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl: string;
}

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly CART_STORAGE_KEY = 'shopping_cart';
  private cartItemsSubject = new BehaviorSubject<CartItem[]>([]);
  public cartItems$ = this.cartItemsSubject.asObservable();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    // Only load cart if running in browser
    if (isPlatformBrowser(this.platformId)) {
      this.loadCart();
    }
  }

  /**
   * Load cart items from localStorage
   */
  private loadCart(): void {
    // This method should only be called in browser environment
    const storedCart = localStorage?.getItem(this.CART_STORAGE_KEY);
    if (storedCart) {
      try {
        const cartItems = JSON.parse(storedCart);
        this.cartItemsSubject.next(cartItems);
      } catch (error) {
        console.error('Error parsing cart data from localStorage:', error);
        this.cartItemsSubject.next([]);
      }
    }
  }

  /**
   * Save cart items to localStorage
   */
  private saveCart(cartItems: CartItem[]): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.CART_STORAGE_KEY, JSON.stringify(cartItems));
    }
    this.cartItemsSubject.next(cartItems);
  }

  /**
   * Get current cart items
   */
  getCartItems(): CartItem[] {
    return this.cartItemsSubject.value;
  }

  /**
   * Add item to cart
   * @param product Product to add
   * @param quantity Quantity to add
   */
  addToCart(product: any, quantity: number = 1): void {
    const currentCart = this.getCartItems();
    const existingItemIndex = currentCart.findIndex(item => item.productId === product._id);

    if (existingItemIndex !== -1) {
      // Update quantity if item already exists
      const updatedCart = [...currentCart];
      updatedCart[existingItemIndex].quantity += quantity;
      this.saveCart(updatedCart);
    } else {
      // Add new item
      const newItem: CartItem = {
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity: quantity,
        imageUrl: product.imageUrl
      };
      this.saveCart([...currentCart, newItem]);
    }
  }

  /**
   * Update item quantity
   * @param productId Product ID
   * @param quantity New quantity
   */
  updateQuantity(productId: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeFromCart(productId);
      return;
    }

    const currentCart = this.getCartItems();
    const updatedCart = currentCart.map(item => {
      if (item.productId === productId) {
        return { ...item, quantity };
      }
      return item;
    });

    this.saveCart(updatedCart);
  }

  /**
   * Remove item from cart
   * @param productId Product ID to remove
   */
  removeFromCart(productId: string): void {
    const currentCart = this.getCartItems();
    const updatedCart = currentCart.filter(item => item.productId !== productId);
    this.saveCart(updatedCart);
  }

  /**
   * Clear the entire cart
   */
  clearCart(): void {
    this.saveCart([]);
  }

  /**
   * Get total number of items in cart
   */
  getCartItemCount(): Observable<number> {
    return new Observable<number>(observer => {
      this.cartItems$.subscribe(items => {
        const count = items.reduce((total, item) => total + item.quantity, 0);
        observer.next(count);
      });
    });
  }

  /**
   * Get total price of all items in cart
   */
  getCartTotal(): Observable<number> {
    return new Observable<number>(observer => {
      this.cartItems$.subscribe(items => {
        const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        observer.next(total);
      });
    });
  }
}
