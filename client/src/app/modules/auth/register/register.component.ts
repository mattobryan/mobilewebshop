import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="register-container">
      <h2>Register</h2>
      <form [formGroup]="registerForm" (ngSubmit)="onSubmit()">
        <div class="form-group">
          <label for="name">Name</label>
          <input type="text" id="name" formControlName="name" class="form-control">
          <div *ngIf="registerForm.get('name')?.invalid && registerForm.get('name')?.touched" class="error-message">
            Name is required.
          </div>
        </div>
        <div class="form-group">
          <label for="email">Email</label>
          <input type="email" id="email" formControlName="email" class="form-control">
          <div *ngIf="registerForm.get('email')?.invalid && registerForm.get('email')?.touched" class="error-message">
            Please enter a valid email address.
          </div>
        </div>
        <div class="form-group">
          <label for="password">Password</label>
          <input type="password" id="password" formControlName="password" class="form-control">
          <div *ngIf="registerForm.get('password')?.invalid && registerForm.get('password')?.touched" class="error-message">
            Password must be at least 6 characters.
          </div>
        </div>
        <div class="form-group">
          <label for="confirmPassword">Confirm Password</label>
          <input type="password" id="confirmPassword" formControlName="confirmPassword" class="form-control">
          <div *ngIf="registerForm.get('confirmPassword')?.invalid && registerForm.get('confirmPassword')?.touched" class="error-message">
            Passwords must match.
          </div>
        </div>
        <button type="submit" [disabled]="registerForm.invalid">Register</button>
      </form>
    </div>
  `,
  styles: [`
    .register-container {
      max-width: 400px;
      margin: 0 auto;
      padding: 20px;
      border: 1px solid #ccc;
      border-radius: 5px;
      background-color: #f9f9f9;
    }
    .form-group {
      margin-bottom: 15px;
    }
    .form-control {
      width: 100%;
      padding: 8px;
      border: 1px solid #ccc;
      border-radius: 4px;
    }
    .error-message {
      color: red;
      font-size: 12px;
      margin-top: 5px;
    }
    button {
      padding: 10px 15px;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    button:disabled {
      background-color: #cccccc;
    }
  `]
})
export class RegisterComponent {
  registerForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private apiService: ApiService
  ) {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    
    if (password !== confirmPassword) {
      form.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    return null;
  }

  onSubmit() {
    if (this.registerForm.valid) {
      const userData = {
        name: this.registerForm.value.name,
        email: this.registerForm.value.email,
        password: this.registerForm.value.password
      };
      
      this.apiService.post('auth/register', userData).subscribe({
        next: (response: any) => {
          console.log('Registration successful', response);
          // Handle successful registration (e.g., redirect to login)
        },
        error: (error) => {
          console.error('Registration failed', error);
          // Handle registration error
        }
      });
    }
  }
}
