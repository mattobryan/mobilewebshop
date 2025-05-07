import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { SocialAuthService, GoogleLoginProvider, SocialUser } from '@abacritt/angularx-social-login';


@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent {
  mode: 'login' | 'register' = 'login';
  loginForm: FormGroup;
  registerForm: FormGroup;
  errorMessage: string = '';

  // For handling login and registration errors
  loginError: boolean = false;
  loginMessage: string = '';
  registerError: boolean = false;
  registerMessage: string = '';

  constructor(
    private fb: FormBuilder, 
    private authService: AuthService, 
    private router: Router,
    private socialAuthService: SocialAuthService) {
    // Initialize login form
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required]
    });

    // Initialize register form
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  // Toggle between login and register forms
  toggleMode() {
    this.errorMessage = '';
    this.loginError = false;
    this.registerError = false;
    this.mode = this.mode === 'login' ? 'register' : 'login';
  }

  // Validator for password and confirm password match
  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  // Handle login
  onLogin() {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      this.authService.login(email, password).subscribe({
        next: () => {
          this.router.navigate(['/products']);
        },
        error: (err) => {
          if (err.status === 401) {
            this.loginError = true;
            this.loginMessage = 'Account not found. Please register.';
          } else {
            this.loginMessage = 'Login failed. Try again.';
          }
        }
      });
    }
  }

  // Handle registration
  onRegister() {
    if (this.registerForm.valid) {
      const { name, email, password } = this.registerForm.value;
      this.authService.register(name, email, password).subscribe({
        next: () => {
          this.router.navigate(['/products']);
        },
        error: (err) => {
          if (err.status === 409) {
            this.registerError = true;
            this.registerMessage = 'Email already registered. Try logging in.';
          } else {
            this.registerMessage = 'Registration failed. Please try again.';
          }
        }
      });
    }
  }

  onSubmit() {
    if (this.mode === 'login' && this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      this.authService.login(email, password).subscribe({
        next: res => {
          localStorage.setItem('user', JSON.stringify(res));
          this.router.navigate(['/products']);
        },
        error: () => {
          this.errorMessage = 'Account not found or invalid credentials. You may need to register.';
        }
      });
    } else if (this.mode === 'register' && this.registerForm.valid) {
      const { name, email, password } = this.registerForm.value;
      this.authService.register(name, email, password).subscribe({
        next: res => {
          localStorage.setItem('user', JSON.stringify(res));
          this.router.navigate(['/products']);
        },
        error: () => {
          this.errorMessage = 'Registration failed. Try again with a different email.';
        }
      });
    }
  }
  
  // Accessor for login form controls
  get loginControls() {
    return this.loginForm.controls;
  }

  // Accessor for register form controls
  get registerControls() {
    return this.registerForm.controls;
  }
  onGoogleLogin() {
    this.socialAuthService.signIn(GoogleLoginProvider.PROVIDER_ID)
      .then((user: SocialUser) => {
        console.log('Google user:', user);
  
        // Optional: Send token to backend for verification
        this.authService.googleLogin(user.idToken).subscribe({
          next: res => {
            localStorage.setItem('user', JSON.stringify(res));
            this.router.navigate(['/products']);
          },
          error: () => {
            this.errorMessage = 'Google login failed. Try again.';
          }
        });
      })
      .catch(err => {
        console.error('Google sign-in error', err);
        this.errorMessage = 'Google login error. Please try again.';
      });
  }
}
