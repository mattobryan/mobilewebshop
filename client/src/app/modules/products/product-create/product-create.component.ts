import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-product-create',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: /* html */ `
    <div class="product-form-container">
      <h2>Create New Product</h2>
      <form [formGroup]="productForm" (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label for="name">Product Name</label>
          <input type="text" id="name" formControlName="name" class="form-control">
          <div *ngIf="productForm.get('name')?.invalid && productForm.get('name')?.touched" class="error-message">
            <span *ngIf="productForm.get('name')?.errors?.['required']">Product name is required.</span>
            <span *ngIf="productForm.get('name')?.errors?.['maxlength']">Product name cannot exceed 100 characters.</span>
          </div>
        </div>

        <div class="form-group">
          <label for="description">Description</label>
          <textarea id="description" formControlName="description" class="form-control" rows="4"></textarea>
          <div *ngIf="productForm.get('description')?.invalid && productForm.get('description')?.touched" class="error-message">
            <span *ngIf="productForm.get('description')?.errors?.['required']">Description is required.</span>
            <span *ngIf="productForm.get('description')?.errors?.['maxlength']">Description cannot exceed 1000 characters.</span>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="price">Price ($)</label>
            <input type="number" id="price" formControlName="price" class="form-control" min="0" step="0.01">
            <div *ngIf="productForm.get('price')?.invalid && productForm.get('price')?.touched" class="error-message">
              <span *ngIf="productForm.get('price')?.errors?.['required']">Price is required.</span>
              <span *ngIf="productForm.get('price')?.errors?.['min']">Price must be greater than 0.</span>
            </div>
          </div>

          <div class="form-group">
            <label for="stock">Stock</label>
            <input type="number" id="stock" formControlName="stock" class="form-control" min="0" step="1">
            <div *ngIf="productForm.get('stock')?.invalid && productForm.get('stock')?.touched" class="error-message">
              <span *ngIf="productForm.get('stock')?.errors?.['required']">Stock is required.</span>
              <span *ngIf="productForm.get('stock')?.errors?.['min']">Stock cannot be negative.</span>
            </div>
          </div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label for="category">Category</label>
            <select id="category" formControlName="category" class="form-control">
              <option value="">Select a category</option>
              <option value="smartphone">Smartphone</option>
              <option value="tablet">Tablet</option>
              <option value="accessory">Accessory</option>
            </select>
            <div *ngIf="productForm.get('category')?.invalid && productForm.get('category')?.touched" class="error-message">
              <span *ngIf="productForm.get('category')?.errors?.['required']">Category is required.</span>
            </div>
          </div>

          <div class="form-group">
            <label for="brand">Brand</label>
            <input type="text" id="brand" formControlName="brand" class="form-control">
            <div *ngIf="productForm.get('brand')?.invalid && productForm.get('brand')?.touched" class="error-message">
              <span *ngIf="productForm.get('brand')?.errors?.['required']">Brand is required.</span>
              <span *ngIf="productForm.get('brand')?.errors?.['maxlength']">Brand cannot exceed 50 characters.</span>
            </div>
          </div>
        </div>

        <div class="form-group">
          <label for="imageUrl">Image URL</label>
          <input type="url" id="imageUrl" formControlName="imageUrl" class="form-control">
          <div *ngIf="productForm.get('imageUrl')?.invalid && productForm.get('imageUrl')?.touched" class="error-message">
            <span *ngIf="productForm.get('imageUrl')?.errors?.['required']">Image URL is required.</span>
            <span *ngIf="productForm.get('imageUrl')?.errors?.['pattern']">Please enter a valid URL.</span>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" class="cancel-btn" (click)="cancel()">Cancel</button>
          <button type="submit" class="submit-btn" [disabled]="productForm.invalid || isSubmitting">
            {{ isSubmitting ? 'Creating...' : 'Create Product' }}
          </button>
        </div>
      </form>
    </div>
    <div class="error-container" *ngIf="error">
      <div class="error-message">{{ error }}</div>
    </div>
  `,
  styles: [`
    .product-form-container {
      max-width: 800px;
      margin: 20px auto;
      padding: 20px;
      background-color: #f9f9f9;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    h2 {
      margin-top: 0;
      margin-bottom: 20px;
      color: #333;
      text-align: center;
    }
    .form-group {
      margin-bottom: 20px;
    }
    .form-row {
      display: flex;
      gap: 20px;
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
    .form-control {
      width: 100%;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 16px;
    }
    textarea.form-control {
      resize: vertical;
    }
    .error-message {
      color: #e63946;
      font-size: 12px;
      margin-top: 5px;
    }
    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin-top: 30px;
    }
    button {
      padding: 12px 20px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 16px;
      transition: background-color 0.3s;
    }
    .submit-btn {
      background-color: #2a9d8f;
      color: white;
    }
    .submit-btn:hover:not(:disabled) {
      background-color: #218879;
    }
    .submit-btn:disabled {
      background-color: #cccccc;
      cursor: not-allowed;
    }
    .cancel-btn {
      background-color: #e9ecef;
      color: #495057;
    }
    .cancel-btn:hover {
      background-color: #dee2e6;
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
      .form-row {
        flex-direction: column;
        gap: 0;
      }
    }
  `]
})
export class ProductCreateComponent implements OnInit {
  productForm: FormGroup;
  isSubmitting = false;
  error: string | null = null;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService,
    private router: Router
  ) {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.maxLength(1000)]],
      price: [null, [Validators.required, Validators.min(0.01)]],
      stock: [null, [Validators.required, Validators.min(0)]],
      category: ['', Validators.required],
      brand: ['', [Validators.required, Validators.maxLength(50)]],
      imageUrl: ['', [
        Validators.required, 
        Validators.pattern('^(https?:\\/\\/)?([\\da-z.-]+)\\.([a-z.]{2,6})([\\/\\w .-]*)*\\/?$')
      ]]
    });
  }

  ngOnInit(): void {
    // Any initialization logic can go here
  }

  onSubmit(): void {
    if (this.productForm.invalid) {
      // Mark all fields as touched to trigger validation messages
      Object.keys(this.productForm.controls).forEach(key => {
        const control = this.productForm.get(key);
        control?.markAsTouched();
      });
      return;
    }

    this.isSubmitting = true;
    this.error = null;

    this.apiService.post('products', this.productForm.value).subscribe({
      next: (response: any) => {
        console.log('Product created successfully:', response);
        this.router.navigate(['/products']);
      },
      error: (err) => {
        console.error('Error creating product:', err);
        this.error = err.error?.message || 'Failed to create product. Please try again.';
        this.isSubmitting = false;
      },
      complete: () => {
        this.isSubmitting = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/products']);
  }
}
