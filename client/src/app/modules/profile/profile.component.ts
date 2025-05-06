import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: /* html */ `
    <div class="profile-container">
      <div class="profile-header">
        <h2>My Profile</h2>
      </div>
      
      <div class="profile-content">
        <div class="profile-sidebar">
          <div class="profile-nav">
            <button 
              class="nav-btn" 
              [class.active]="activeTab === 'info'"
              (click)="setActiveTab('info')">
              Personal Information
            </button>
            <button 
              class="nav-btn" 
              [class.active]="activeTab === 'orders'"
              (click)="setActiveTab('orders')">
              Order History
            </button>
            <button 
              class="nav-btn" 
              [class.active]="activeTab === 'security'"
              (click)="setActiveTab('security')">
              Security
            </button>
            <button 
              class="nav-btn" 
              [class.active]="activeTab === 'addresses'"
              (click)="setActiveTab('addresses')">
              Addresses
            </button>
          </div>
        </div>
        
        <div class="profile-main">
          <!-- Personal Information Tab -->
          <div class="tab-content" *ngIf="activeTab === 'info'">
            <h3>Personal Information</h3>
            
            <div class="loading" *ngIf="isLoading">Loading your information...</div>
            
            <div class="profile-form" *ngIf="!isLoading">
              <div class="form-group">
                <label for="username">Username</label>
                <input type="text" id="username" name="username" [(ngModel)]="userProfile.username" [disabled]="!isEditing">
              </div>
              
              <div class="form-group">
                <label for="email">Email</label>
                <input type="email" id="email" name="email" [(ngModel)]="userProfile.email" [disabled]="!isEditing">
              </div>
              
              <div class="form-group">
                <label for="phone">Phone Number</label>
                <input type="tel" id="phone" name="phone" [(ngModel)]="userProfile.phone" [disabled]="!isEditing">
              </div>
              
              <div class="form-actions" *ngIf="!isEditing">
                <button class="edit-btn" (click)="startEditing()">Edit Profile</button>
              </div>
              
              <div class="form-actions" *ngIf="isEditing">
                <button class="cancel-btn" (click)="cancelEditing()">Cancel</button>
                <button class="save-btn" (click)="saveProfile()" [disabled]="isSaving">
                  {{ isSaving ? 'Saving...' : 'Save Changes' }}
                </button>
              </div>
            </div>
          </div>
          
          <!-- Order History Tab -->
          <div class="tab-content" *ngIf="activeTab === 'orders'">
            <h3>Order History</h3>
            
            <div class="loading" *ngIf="isLoadingOrders">Loading your orders...</div>
            
            <div class="empty-data" *ngIf="!isLoadingOrders && orders.length === 0">
              <p>You haven't placed any orders yet.</p>
              <button class="shop-now-btn" routerLink="/products">Shop Now</button>
            </div>
            
            <div class="orders-list" *ngIf="!isLoadingOrders && orders.length > 0">
              <div class="order-card" *ngFor="let order of orders">
                <div class="order-header">
                  <div class="order-id">
                    <span class="label">Order ID:</span>
                    <span class="value">{{ order._id }}</span>
                  </div>
                  <div class="order-date">
                    <span class="label">Date:</span>
                    <span class="value">{{ order.createdAt | date:'medium' }}</span>
                  </div>
                </div>
                
                <div class="order-status">
                  <div class="status-item">
                    <span class="label">Status:</span>
                    <span class="value status-badge" [ngClass]="'status-' + order.status">
                      {{ order.status | titlecase }}
                    </span>
                  </div>
                  <div class="status-item">
                    <span class="label">Payment:</span>
                    <span class="value status-badge" [ngClass]="'payment-' + order.paymentStatus">
                      {{ order.paymentStatus | titlecase }}
                    </span>
                  </div>
                </div>
                
                <div class="order-items">
                  <div class="item" *ngFor="let item of order.items">
                    <div class="item-image" *ngIf="item.product?.imageUrl">
                      <img [src]="item.product?.imageUrl" [alt]="item.product?.name" onerror="this.src='/assets/placeholder.jpg'">
                    </div>
                    <div class="item-details">
                      <div class="item-name">{{ item.product?.name || 'Product no longer available' }}</div>
                      <div class="item-price">\${{ item.price?.toFixed(2) }} x {{ item.quantity }}</div>
                    </div>
                  </div>
                </div>
                
                <div class="order-footer">
                  <div class="order-total">
                    <span class="label">Total:</span>
                    <span class="value">\${{ order.totalAmount?.toFixed(2) }}</span>
                  </div>
                  <div class="order-actions">
                    <button class="view-details-btn" [routerLink]="['/order-confirmation']" [queryParams]="{orderId: order._id}">View Details</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Security Tab -->
          <div class="tab-content" *ngIf="activeTab === 'security'">
            <h3>Security</h3>
            
            <div class="security-form">
              <h4>Change Password</h4>
              
              <div class="form-group">
                <label for="currentPassword">Current Password</label>
                <input type="password" id="currentPassword" name="currentPassword" [(ngModel)]="passwordForm.currentPassword">
              </div>
              
              <div class="form-group">
                <label for="newPassword">New Password</label>
                <input type="password" id="newPassword" name="newPassword" [(ngModel)]="passwordForm.newPassword">
                <div class="password-requirements">
                  <p>Password must be at least 8 characters long and include:</p>
                  <ul>
                    <li>At least one uppercase letter</li>
                    <li>At least one lowercase letter</li>
                    <li>At least one number</li>
                    <li>At least one special character</li>
                  </ul>
                </div>
              </div>
              
              <div class="form-group">
                <label for="confirmPassword">Confirm New Password</label>
                <input type="password" id="confirmPassword" name="confirmPassword" [(ngModel)]="passwordForm.confirmPassword">
              </div>
              
              <div class="form-actions">
                <button class="save-btn" (click)="changePassword()" [disabled]="isChangingPassword">
                  {{ isChangingPassword ? 'Changing Password...' : 'Change Password' }}
                </button>
              </div>
            </div>
          </div>
          
          <!-- Addresses Tab -->
          <div class="tab-content" *ngIf="activeTab === 'addresses'">
            <h3>Saved Addresses</h3>
            
            <div class="loading" *ngIf="isLoadingAddresses">Loading your addresses...</div>
            
            <div class="empty-data" *ngIf="!isLoadingAddresses && addresses.length === 0">
              <p>You don't have any saved addresses yet.</p>
              <button class="add-btn" (click)="startAddingAddress()">Add New Address</button>
            </div>
            
            <div class="addresses-list" *ngIf="!isLoadingAddresses && addresses.length > 0">
              <div class="address-card" *ngFor="let address of addresses; let i = index">
                <div class="address-header">
                  <h4>{{ address.name }}</h4>
                  <div class="default-badge" *ngIf="address.isDefault">Default</div>
                </div>
                
                <div class="address-content">
                  <p>{{ address.street }}</p>
                  <p>{{ address.city }}, {{ address.state }} {{ address.postalCode }}</p>
                  <p>{{ address.country }}</p>
                  <p>{{ address.phone }}</p>
                </div>
                
                <div class="address-actions">
                  <button class="edit-btn" (click)="editAddress(i)">Edit</button>
                  <button class="delete-btn" (click)="deleteAddress(i)">Delete</button>
                  <button class="default-btn" *ngIf="!address.isDefault" (click)="setDefaultAddress(i)">Set as Default</button>
                </div>
              </div>
              
              <button class="add-btn" (click)="startAddingAddress()">Add New Address</button>
            </div>
            
            <!-- Address Form (Add/Edit) -->
            <div class="address-form-container" *ngIf="showAddressForm">
              <h4>{{ editingAddressIndex === -1 ? 'Add New Address' : 'Edit Address' }}</h4>
              
              <div class="form-group">
                <label for="addressName">Address Name</label>
                <input type="text" id="addressName" name="addressName" [(ngModel)]="addressForm.name" placeholder="Home, Work, etc.">
              </div>
              
              <div class="form-group">
                <label for="addressStreet">Street Address</label>
                <input type="text" id="addressStreet" name="addressStreet" [(ngModel)]="addressForm.street">
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label for="addressCity">City</label>
                  <input type="text" id="addressCity" name="addressCity" [(ngModel)]="addressForm.city">
                </div>
                
                <div class="form-group">
                  <label for="addressState">State/Province</label>
                  <input type="text" id="addressState" name="addressState" [(ngModel)]="addressForm.state">
                </div>
              </div>
              
              <div class="form-row">
                <div class="form-group">
                  <label for="addressPostalCode">Postal Code</label>
                  <input type="text" id="addressPostalCode" name="addressPostalCode" [(ngModel)]="addressForm.postalCode">
                </div>
                
                <div class="form-group">
                  <label for="addressCountry">Country</label>
                  <input type="text" id="addressCountry" name="addressCountry" [(ngModel)]="addressForm.country">
                </div>
              </div>
              
              <div class="form-group">
                <label for="addressPhone">Phone Number</label>
                <input type="tel" id="addressPhone" name="addressPhone" [(ngModel)]="addressForm.phone">
              </div>
              
              <div class="form-group checkbox">
                <input type="checkbox" id="isDefault" name="isDefault" [(ngModel)]="addressForm.isDefault">
                <label for="isDefault">Set as default address</label>
              </div>
              
              <div class="form-actions">
                <button class="cancel-btn" (click)="cancelAddressForm()">Cancel</button>
                <button class="save-btn" (click)="saveAddress()" [disabled]="isSavingAddress">
                  {{ isSavingAddress ? 'Saving...' : 'Save Address' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="error-container" *ngIf="error">
        <div class="error-message">{{ error }}</div>
      </div>
      
      <div class="success-container" *ngIf="successMessage">
        <div class="success-message">{{ successMessage }}</div>
      </div>
    </div>
  `,
  styles: [`
    .profile-container {
      max-width: 1200px;
      margin: 20px auto;
      padding: 20px;
    }
    .profile-header {
      margin-bottom: 30px;
      text-align: center;
    }
    h2 {
      margin: 0;
      color: #333;
      font-size: 28px;
    }
    .profile-content {
      display: flex;
      gap: 30px;
    }
    .profile-sidebar {
      flex: 1;
      max-width: 250px;
    }
    .profile-main {
      flex: 3;
      min-width: 0;
    }
    .profile-nav {
      background-color: #f9f9f9;
      border-radius: 8px;
      overflow: hidden;
    }
    .nav-btn {
      display: block;
      width: 100%;
      padding: 15px;
      text-align: left;
      background: none;
      border: none;
      border-bottom: 1px solid #eee;
      font-size: 16px;
      cursor: pointer;
      transition: all 0.3s;
    }
    .nav-btn:last-child {
      border-bottom: none;
    }
    .nav-btn:hover {
      background-color: #f0f0f0;
    }
    .nav-btn.active {
      background-color: #2a9d8f;
      color: white;
      font-weight: bold;
    }
    .tab-content {
      background-color: #fff;
      border-radius: 8px;
      padding: 20px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    h3 {
      margin-top: 0;
      margin-bottom: 20px;
      color: #333;
      font-size: 22px;
      padding-bottom: 10px;
      border-bottom: 1px solid #eee;
    }
    h4 {
      margin-top: 0;
      margin-bottom: 15px;
      color: #333;
      font-size: 18px;
    }
    .loading, .empty-data {
      text-align: center;
      padding: 40px;
      color: #666;
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
    input[type="email"],
    input[type="tel"],
    input[type="password"] {
      width: 100%;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 16px;
    }
    input[disabled] {
      background-color: #f9f9f9;
      cursor: not-allowed;
    }
    .form-group.checkbox {
      display: flex;
      align-items: center;
    }
    .form-group.checkbox input {
      width: auto;
      margin-right: 10px;
    }
    .form-group.checkbox label {
      margin-bottom: 0;
    }
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 20px;
    }
    button {
      padding: 10px 15px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
      transition: background-color 0.3s;
    }
    .edit-btn, .save-btn {
      background-color: #2a9d8f;
      color: white;
    }
    .edit-btn:hover, .save-btn:hover:not(:disabled) {
      background-color: #218879;
    }
    .cancel-btn {
      background-color: #6c757d;
      color: white;
    }
    .cancel-btn:hover {
      background-color: #5a6268;
    }
    .delete-btn {
      background-color: #e63946;
      color: white;
    }
    .delete-btn:hover {
      background-color: #d62b39;
    }
    .default-btn {
      background-color: #457b9d;
      color: white;
    }
    .default-btn:hover {
      background-color: #366785;
    }
    .shop-now-btn, .add-btn {
      background-color: #2a9d8f;
      color: white;
    }
    .shop-now-btn:hover, .add-btn:hover {
      background-color: #218879;
    }
    button:disabled {
      background-color: #cccccc;
      cursor: not-allowed;
    }
    .password-requirements {
      margin-top: 5px;
      font-size: 14px;
      color: #666;
    }
    .password-requirements ul {
      margin-top: 5px;
      padding-left: 20px;
    }
    .password-requirements li {
      margin-bottom: 3px;
    }
    .orders-list {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    .order-card {
      border: 1px solid #eee;
      border-radius: 8px;
      overflow: hidden;
    }
    .order-header {
      display: flex;
      justify-content: space-between;
      padding: 15px;
      background-color: #f9f9f9;
      border-bottom: 1px solid #eee;
    }
    .order-status {
      display: flex;
      justify-content: space-between;
      padding: 10px 15px;
      background-color: #f5f5f5;
    }
    .status-badge {
      display: inline-block;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: bold;
    }
    .status-pending {
      background-color: #fff3cd;
      color: #856404;
    }
    .status-processing {
      background-color: #cce5ff;
      color: #004085;
    }
    .status-shipped {
      background-color: #d4edda;
      color: #155724;
    }
    .status-delivered {
      background-color: #d1e7dd;
      color: #0f5132;
    }
    .payment-pending {
      background-color: #fff3cd;
      color: #856404;
    }
    .payment-paid {
      background-color: #d4edda;
      color: #155724;
    }
    .payment-failed {
      background-color: #f8d7da;
      color: #721c24;
    }
    .order-items {
      padding: 15px;
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }
    .item {
      display: flex;
      align-items: center;
      width: 100%;
      max-width: 300px;
    }
    .item-image {
      width: 50px;
      height: 50px;
      margin-right: 10px;
    }
    .item-image img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      border-radius: 4px;
    }
    .item-name {
      font-weight: 500;
      margin-bottom: 3px;
    }
    .item-price {
      font-size: 14px;
      color: #666;
    }
    .order-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px;
      background-color: #f9f9f9;
      border-top: 1px solid #eee;
    }
    .order-total {
      font-weight: bold;
      font-size: 18px;
    }
    .view-details-btn {
      background-color: #457b9d;
      color: white;
      padding: 8px 12px;
      font-size: 14px;
    }
    .view-details-btn:hover {
      background-color: #366785;
    }
    .addresses-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
      margin-bottom: 20px;
    }
    .address-card {
      border: 1px solid #eee;
      border-radius: 8px;
      padding: 15px;
      position: relative;
    }
    .address-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }
    .address-header h4 {
      margin: 0;
    }
    .default-badge {
      background-color: #2a9d8f;
      color: white;
      padding: 3px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: bold;
    }
    .address-content p {
      margin: 5px 0;
      color: #555;
    }
    .address-actions {
      display: flex;
      gap: 10px;
      margin-top: 15px;
    }
    .address-actions button {
      padding: 6px 10px;
      font-size: 14px;
    }
    .address-form-container {
      margin-top: 20px;
      padding: 20px;
      background-color: #f9f9f9;
      border-radius: 8px;
    }
    .error-container, .success-container {
      margin-top: 20px;
      padding: 15px;
      border-radius: 4px;
    }
    .error-container {
      background-color: #f8d7da;
      color: #721c24;
    }
    .success-container {
      background-color: #d4edda;
      color: #155724;
    }
    @media (max-width: 768px) {
      .profile-content {
        flex-direction: column;
      }
      .profile-sidebar {
        max-width: none;
      }
      .form-row {
        flex-direction: column;
        gap: 0;
      }
      .order-header, .order-status, .order-footer {
        flex-direction: column;
        gap: 10px;
      }
      .addresses-list {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ProfileComponent implements OnInit {
  activeTab = 'info';
  isLoading = false;
  isEditing = false;
  isSaving = false;
  error: string | null = null;
  successMessage: string | null = null;
  
  // User profile data
  userProfile = {
    username: '',
    email: '',
    phone: ''
  };
  
  // Orders
  orders: any[] = [];
  isLoadingOrders = false;
  
  // Password change
  passwordForm = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };
  isChangingPassword = false;
  
  // Addresses
  addresses: any[] = [];
  isLoadingAddresses = false;
  showAddressForm = false;
  editingAddressIndex = -1;
  isSavingAddress = false;
  
  addressForm = {
    name: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    phone: '',
    isDefault: false
  };

  constructor(
    private authService: AuthService,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.loadUserProfile();
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
    this.error = null;
    this.successMessage = null;
    
    // Load data for the selected tab if not already loaded
    if (tab === 'orders' && this.orders.length === 0) {
      this.loadOrders();
    } else if (tab === 'addresses' && this.addresses.length === 0) {
      this.loadAddresses();
    }
  }

  // User Profile Methods
  loadUserProfile(): void {
    this.isLoading = true;
    this.error = null;
    
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.apiService.get(`auth/users/${currentUser.id}`).subscribe({
        next: (response: any) => {
          if (response && response.data && response.data.user) {
            const user = response.data.user;
            this.userProfile = {
              username: user.username || '',
              email: user.email || '',
              phone: user.phone || ''
            };
          }
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Error loading user profile:', err);
          this.error = 'Failed to load your profile information. Please try again later.';
          this.isLoading = false;
        }
      });
    } else {
      this.isLoading = false;
      this.error = 'User information not available. Please log in again.';
    }
  }

  startEditing(): void {
    this.isEditing = true;
  }

  cancelEditing(): void {
    this.isEditing = false;
    this.loadUserProfile(); // Reload original data
  }

  saveProfile(): void {
    this.isSaving = true;
    this.error = null;
    this.successMessage = null;
    
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.error = 'User information not available. Please log in again.';
      this.isSaving = false;
      return;
    }
    
    this.apiService.patch(`auth/users/${currentUser.id}`, this.userProfile).subscribe({
      next: (response: any) => {
        this.isSaving = false;
        this.isEditing = false;
        this.successMessage = 'Profile updated successfully!';
        
        // Update local user data if needed
        if (response && response.data && response.data.user) {
          // Update any local user data if needed
        }
      },
      error: (err) => {
        console.error('Error updating profile:', err);
        this.error = err.error?.message || 'Failed to update profile. Please try again.';
        this.isSaving = false;
      }
    });
  }

  // Orders Methods
  loadOrders(): void {
    this.isLoadingOrders = true;
    this.error = null;
    
    this.apiService.get('orders').subscribe({
      next: (response: any) => {
        if (response && response.data && response.data.orders) {
          this.orders = response.data.orders;
          // Sort orders by date (newest first)
          this.orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        } else {
          this.orders = [];
        }
        this.isLoadingOrders = false;
      },
      error: (err) => {
        console.error('Error loading orders:', err);
        this.error = 'Failed to load your orders. Please try again later.';
        this.isLoadingOrders = false;
      }
    });
  }

  // Password Methods
  changePassword(): void {
    if (!this.validatePasswordForm()) {
      return;
    }
    
    this.isChangingPassword = true;
    this.error = null;
    this.successMessage = null;
    
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.error = 'User information not available. Please log in again.';
      this.isChangingPassword = false;
      return;
    }
    
    this.apiService.patch(`auth/users/${currentUser.id}/password`, {
      currentPassword: this.passwordForm.currentPassword,
      newPassword: this.passwordForm.newPassword
    }).subscribe({
      next: () => {
        this.isChangingPassword = false;
        this.successMessage = 'Password changed successfully!';
        this.passwordForm = {
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        };
      },
      error: (err) => {
        console.error('Error changing password:', err);
        this.error = err.error?.message || 'Failed to change password. Please try again.';
        this.isChangingPassword = false;
      }
    });
  }

  validatePasswordForm(): boolean {
    if (!this.passwordForm.currentPassword) {
      this.error = 'Please enter your current password';
      return false;
    }
    
    if (!this.passwordForm.newPassword) {
      this.error = 'Please enter a new password';
      return false;
    }
    
    if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
      this.error = 'New password and confirmation do not match';
      return false;
    }
    
    // Password strength validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(this.passwordForm.newPassword)) {
      this.error = 'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character';
      return false;
    }
    
    return true;
  }

  // Address Methods
  loadAddresses(): void {
    this.isLoadingAddresses = true;
    this.error = null;
    
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.error = 'User information not available. Please log in again.';
      this.isLoadingAddresses = false;
      return;
    }
    
    this.apiService.get(`auth/users/${currentUser.id}/addresses`).subscribe({
      next: (response: any) => {
        if (response && response.data && response.data.addresses) {
          this.addresses = response.data.addresses;
        } else {
          this.addresses = [];
        }
        this.isLoadingAddresses = false;
      },
      error: (err) => {
        console.error('Error loading addresses:', err);
        this.error = 'Failed to load your addresses. Please try again later.';
        this.isLoadingAddresses = false;
      }
    });
  }

  startAddingAddress(): void {
    this.resetAddressForm();
    this.editingAddressIndex = -1;
    this.showAddressForm = true;
  }

  editAddress(index: number): void {
    const address = this.addresses[index];
    this.addressForm = {
      name: address.name || '',
      street: address.street || '',
      city: address.city || '',
      state: address.state || '',
      postalCode: address.postalCode || '',
      country: address.country || '',
      phone: address.phone || '',
      isDefault: address.isDefault || false
    };
    this.editingAddressIndex = index;
    this.showAddressForm = true;
  }

  cancelAddressForm(): void {
    this.showAddressForm = false;
    this.resetAddressForm();
  }

  resetAddressForm(): void {
    this.addressForm = {
      name: '',
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
      phone: '',
      isDefault: false
    };
  }

  saveAddress(): void {
    if (!this.validateAddressForm()) {
      return;
    }
    
    this.isSavingAddress = true;
    this.error = null;
    this.successMessage = null;
    
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.error = 'User information not available. Please log in again.';
      this.isSavingAddress = false;
      return;
    }
    
    if (this.editingAddressIndex === -1) {
      // Add new address
      this.apiService.post(`auth/users/${currentUser.id}/addresses`, this.addressForm).subscribe({
        next: (response: any) => {
          this.isSavingAddress = false;
          this.showAddressForm = false;
          this.successMessage = 'Address added successfully!';
          this.loadAddresses(); // Reload addresses
        },
        error: (err) => {
          console.error('Error adding address:', err);
          this.error = err.error?.message || 'Failed to add address. Please try again.';
          this.isSavingAddress = false;
        }
      });
    } else {
      // Update existing address
      const addressId = this.addresses[this.editingAddressIndex]._id;
      this.apiService.put(`auth/users/${currentUser.id}/addresses/${addressId}`, this.addressForm).subscribe({
        next: (response: any) => {
          this.isSavingAddress = false;
          this.showAddressForm = false;
          this.successMessage = 'Address updated successfully!';
          this.loadAddresses(); // Reload addresses
        },
        error: (err) => {
          console.error('Error updating address:', err);
          this.error = err.error?.message || 'Failed to update address. Please try again.';
          this.isSavingAddress = false;
        }
      });
    }
  }

  validateAddressForm(): boolean {
    if (!this.addressForm.name || 
        !this.addressForm.street || 
        !this.addressForm.city || 
        !this.addressForm.state || 
        !this.addressForm.postalCode || 
        !this.addressForm.country) {
      this.error = 'Please fill in all required address fields';
      return false;
    }
    return true;
  }

  deleteAddress(index: number): void {
    if (!confirm('Are you sure you want to delete this address?')) {
      return;
    }
    
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.error = 'User information not available. Please log in again.';
      return;
    }
    
    const addressId = this.addresses[index]._id;
    this.apiService.delete(`auth/users/${currentUser.id}/addresses/${addressId}`).subscribe({
      next: () => {
        this.successMessage = 'Address deleted successfully!';
        this.loadAddresses(); // Reload addresses
      },
      error: (err) => {
        console.error('Error deleting address:', err);
        this.error = err.error?.message || 'Failed to delete address. Please try again.';
      }
    });
  }

  setDefaultAddress(index: number): void {
    const currentUser = this.authService.getCurrentUser();
    if (!currentUser) {
      this.error = 'User information not available. Please log in again.';
      return;
    }
    
    const addressId = this.addresses[index]._id;
    this.apiService.patch(`auth/users/${currentUser.id}/addresses/${addressId}/default`, {}).subscribe({
      next: () => {
        this.successMessage = 'Default address updated successfully!';
        this.loadAddresses(); // Reload addresses
      },
      error: (err) => {
        console.error('Error setting default address:', err);
        this.error = err.error?.message || 'Failed to set default address. Please try again.';
      }
    });
  }
}
