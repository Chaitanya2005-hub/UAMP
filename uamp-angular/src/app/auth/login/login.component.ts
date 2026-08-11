import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="auth-page">
      <div class="auth-bg-gradient"></div>
      <div class="auth-container">
        <div class="glass-panel auth-card">
          <div class="auth-header">
            <div class="auth-logo">
              <span class="logo-icon">🎓</span>
              <span class="logo-text">University Assessment and Mastery Portal</span>
            </div>
            <h1>Welcome Back</h1>
            <p>Sign in to your University Assessment Portal</p>
          </div>

          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="auth-form">
            <div class="form-group">
              <label class="form-label" for="email">Email Address</label>
              <input
                id="email"
                type="email"
                class="form-input"
                formControlName="email"
                placeholder="you&#64;university.edu"
                autocomplete="email"
              />
              <span class="form-error" *ngIf="loginForm.get('email')?.invalid && loginForm.get('email')?.touched">
                Please enter a valid email address
              </span>
            </div>

            <div class="form-group">
              <label class="form-label" for="password">Password</label>
              <div class="password-input-wrapper">
                <input
                  id="password"
                  [type]="showPassword() ? 'text' : 'password'"
                  class="form-input"
                  formControlName="password"
                  placeholder="Enter your password"
                  autocomplete="current-password"
                />
                <button 
                  type="button" 
                  class="password-toggle" 
                  (click)="togglePassword()"
                  [attr.aria-label]="showPassword() ? 'Hide password' : 'Show password'"
                >
                  {{ showPassword() ? '🙈' : '👁️' }}
                </button>
              </div>
              <span class="form-error" *ngIf="loginForm.get('password')?.invalid && loginForm.get('password')?.touched">
                Password is required
              </span>
            </div>

            <div class="form-error server-error" *ngIf="errorMessage()">
              <span class="error-icon">⚠️</span>
              {{ errorMessage() }}
            </div>

            <button type="submit" class="btn btn-primary auth-submit" [disabled]="isLoading()">
              <span *ngIf="!isLoading()">Sign In</span>
              <span *ngIf="isLoading()" class="spinner"></span>
            </button>
          </form>

          <div class="auth-footer">
            <p>Don't have an account? <a routerLink="/auth/register">Register here</a></p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
    }

    .auth-bg-gradient {
      position: absolute;
      inset: 0;
      background:
        radial-gradient(ellipse at 20% 50%, rgba(99, 102, 241, 0.15) 0%, transparent 50%),
        radial-gradient(ellipse at 80% 20%, rgba(34, 211, 238, 0.1) 0%, transparent 50%),
        radial-gradient(ellipse at 50% 80%, rgba(52, 211, 153, 0.08) 0%, transparent 50%);
      z-index: 0;
    }

    .auth-container {
      position: relative;
      z-index: 1;
      width: 100%;
      max-width: 440px;
      padding: 24px;
    }

    .auth-card {
      padding: 40px !important;
    }

    .auth-header {
      text-align: center;
      margin-bottom: 32px;
    }

    .auth-logo {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      margin-bottom: 24px;
    }

    .logo-icon {
      font-size: 2rem;
    }

    .logo-text {
      font-family: var(--uamp-font-display);
      font-size: 1.75rem;
      font-weight: 700;
      background: linear-gradient(135deg, var(--uamp-accent-primary), var(--uamp-accent-secondary));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    h1 {
      font-size: 1.5rem;
      margin-bottom: 8px;
    }

    .auth-header p {
      color: var(--uamp-text-muted);
      font-size: 0.875rem;
    }

    .auth-form {
      display: flex;
      flex-direction: column;
    }

    .auth-submit {
      width: 100%;
      padding: 12px;
      font-size: 1rem;
      margin-top: 8px;
    }

    .server-error {
      text-align: center;
      margin-bottom: 12px;
      padding: 12px;
      background: rgba(248, 113, 113, 0.1);
      border: 1px solid rgba(248, 113, 113, 0.3);
      border-radius: 8px;
      color: #f87171;
      font-size: 0.875rem;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    .error-icon {
      font-size: 1.1rem;
    }

    .auth-footer {
      text-align: center;
      margin-top: 24px;
      font-size: 0.875rem;
      color: var(--uamp-text-muted);

      a {
        color: var(--uamp-accent-primary);
        font-weight: 500;
      }
    }

    .spinner {
      display: inline-block;
      width: 20px;
      height: 20px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 600ms linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .password-input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    .password-input-wrapper .form-input {
      padding-right: 48px;
    }

    .password-toggle {
      position: absolute;
      right: 12px;
      background: none;
      border: none;
      cursor: pointer;
      font-size: 1.2rem;
      padding: 4px;
      border-radius: 4px;
      transition: background-color 0.15s ease;
      color: var(--uamp-text-muted);
    }

    .password-toggle:hover {
      background-color: rgba(255, 255, 255, 0.1);
      color: var(--uamp-text-secondary);
    }

    .password-toggle:active {
      transform: scale(0.95);
    }
  `]
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = signal(false);
  errorMessage = signal('');
  showPassword = signal(false);

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        const role = response.user.role;
        // Each role module owns its default landing route. Only the student
        // module has a concrete /dashboard route; admin and teacher modules
        // redirect from their module root to their own landing pages.
        this.router.navigate([`/${role}`]);
      },
      error: (err) => {
        this.isLoading.set(false);
        console.error('Login error:', err);
        
        // Handle different error response formats
        let backendError = '';
        
        if (err.error?.error) {
          // Backend format: { error: "message" }
          backendError = err.error.error;
        } else if (err.error?.message) {
          // Standard error format: { message: "message" }
          backendError = err.error.message;
        } else if (err.message) {
          // Fallback to error message
          backendError = err.message;
        } else {
          // Generic error
          backendError = 'Invalid credentials. Please try again.';
        }
        
        // Provide user-friendly error messages
        let userFriendlyError = 'Invalid credentials. Please try again.';
        
        if (backendError.includes('Wrong password')) {
          userFriendlyError = 'Wrong password entered. Please enter the right password.';
        } else if (backendError.includes('User not found')) {
          userFriendlyError = 'User not found. Please check your email address.';
        } else if (backendError.includes('Invalid credentials')) {
          userFriendlyError = 'Invalid email or password. Please try again.';
        } else if (backendError) {
          userFriendlyError = backendError;
        }
        
        this.errorMessage.set(userFriendlyError);
      },
    });
  }

  togglePassword(): void {
    this.showPassword.update(value => !value);
  }
}
