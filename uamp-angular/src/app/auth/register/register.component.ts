import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { UserRole } from '../../core/models';

@Component({
  selector: 'app-register',
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
              <span class="logo-text">UAMP</span>
            </div>
            <h1>Create Account</h1>
            <p>Join the University Assessment Portal</p>
          </div>

          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" class="auth-form">
            <div class="form-group">
              <label class="form-label" for="fullName">Full Name</label>
              <input id="fullName" type="text" class="form-input" formControlName="fullName" placeholder="John Doe" />
            </div>

            <div class="form-group">
              <label class="form-label" for="reg-email">Email Address</label>
              <input id="reg-email" type="email" class="form-input" formControlName="email" placeholder="you&#64;university.edu" />
            </div>

            <div class="form-group">
              <label class="form-label" for="reg-password">Password</label>
              <input id="reg-password" type="password" class="form-input" formControlName="password" placeholder="Min 8 characters" />
            </div>

            <div class="form-group">
              <label class="form-label" for="role">Role</label>
              <select id="role" class="form-input" formControlName="role">
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label" for="institutionCode">Institution Code</label>
              <input id="institutionCode" type="text" class="form-input" formControlName="institutionCode" placeholder="e.g. UNIV001" />
            </div>

            <div class="form-group" *ngIf="registerForm.get('role')?.value === 'student'">
              <label class="form-label" for="enrollmentNumber">Enrollment Number</label>
              <input id="enrollmentNumber" type="text" class="form-input" formControlName="enrollmentNumber" placeholder="e.g. EN2024001" />
            </div>

            <div class="form-group" *ngIf="registerForm.get('role')?.value !== 'student'">
              <label class="form-label" for="employeeCode">Employee Code</label>
              <input id="employeeCode" type="text" class="form-input" formControlName="employeeCode" placeholder="e.g. EMP001" />
            </div>

            <div class="form-error server-error" *ngIf="errorMessage()">{{ errorMessage() }}</div>
            <div class="form-success" *ngIf="successMessage()">{{ successMessage() }}</div>

            <button type="submit" class="btn btn-primary auth-submit" [disabled]="isLoading()">
              <span *ngIf="!isLoading()">Create Account</span>
              <span *ngIf="isLoading()" class="spinner"></span>
            </button>
          </form>

          <div class="auth-footer">
            <p>Already have an account? <a routerLink="/auth/login">Sign in</a></p>
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
    }

    .auth-container {
      position: relative;
      z-index: 1;
      width: 100%;
      max-width: 480px;
      padding: 24px;
    }

    .auth-card { padding: 36px !important; }

    .auth-header {
      text-align: center;
      margin-bottom: 28px;
    }

    .auth-logo {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 10px;
      margin-bottom: 20px;
    }

    .logo-icon { font-size: 2rem; }

    .logo-text {
      font-family: var(--uamp-font-display);
      font-size: 1.75rem;
      font-weight: 700;
      background: linear-gradient(135deg, var(--uamp-accent-primary), var(--uamp-accent-secondary));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    h1 { font-size: 1.5rem; margin-bottom: 8px; }
    .auth-header p { color: var(--uamp-text-muted); font-size: 0.875rem; }

    .auth-form { display: flex; flex-direction: column; }
    .auth-submit { width: 100%; padding: 12px; font-size: 1rem; margin-top: 8px; }
    .server-error { text-align: center; margin-bottom: 12px; }

    .form-success {
      text-align: center;
      margin-bottom: 12px;
      color: var(--uamp-accent-success);
      font-size: 0.875rem;
    }

    .auth-footer {
      text-align: center;
      margin-top: 24px;
      font-size: 0.875rem;
      color: var(--uamp-text-muted);
      a { color: var(--uamp-accent-primary); font-weight: 500; }
    }

    select.form-input {
      appearance: none;
      background-image: url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1.5L6 6.5L11 1.5' stroke='%2394a3b8' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 16px center;
      padding-right: 40px;
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

    @keyframes spin { to { transform: rotate(360deg); } }
  `]
})
export class RegisterComponent {
  registerForm: FormGroup;
  isLoading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      fullName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      role: ['student' as UserRole, [Validators.required]],
      institutionCode: ['', [Validators.required]],
      enrollmentNumber: [''],
      employeeCode: [''],
    });
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    this.authService.register(this.registerForm.value).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.successMessage.set('Registration successful! Redirecting to login...');
        setTimeout(() => this.router.navigate(['/auth/login']), 2000);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(err.message || 'Registration failed. Please try again.');
      },
    });
  }
}
