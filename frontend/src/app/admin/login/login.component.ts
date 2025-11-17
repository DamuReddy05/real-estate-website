import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { LoginRequest } from '../../core/models/user.model';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { GoogleAuthService } from '../../core/services/google-auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <h1><i class="fas fa-home"></i> RealEstateHub</h1>
          <p>Admin Panel Login</p>
        </div>
        
        <form class="login-form" (ngSubmit)="onSubmit()" #loginForm="ngForm">
          <div class="form-group">
            <label for="username">Username or Email</label>
            <input 
              type="text" 
              id="username" 
              name="username"
              [(ngModel)]="loginData.username" 
              required 
              placeholder="Enter username or email"
            >
          </div>
          
          <div class="form-group">
            <label for="password">Password</label>
            <input 
              type="password" 
              id="password" 
              name="password"
              [(ngModel)]="loginData.password" 
              required 
              placeholder="Enter password"
            >
          </div>
          
          <button 
            type="submit" 
            class="login-btn"
            [disabled]="loginForm.invalid || loading"
          >
            <i class="fas fa-sign-in-alt"></i> 
            {{ loading ? 'Logging in...' : 'Login' }}
          </button>
        </form>

        <div class="divider"><span>or</span></div>

        <button class="google-btn" type="button" (click)="loginWithGoogle()" [disabled]="googleLoading">
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" />
          <span>{{ googleLoading ? 'Redirecting...' : 'Continue with Google' }}</span>
        </button>
        
        <div class="back-link">
          <a href="/" (click)="goHome($event)">
            <i class="fas fa-arrow-left"></i> Back to Website
          </a>
        </div>
      </div>
    </div>

  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
    }
    
    .login-card {
      background: white;
      padding: 3rem;
      border-radius: 16px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.1);
      width: 100%;
      max-width: 420px;
    }
    
    .login-header {
      text-align: center;
      margin-bottom: 2rem;
    }
    
    .login-header h1 {
      color: var(--primary-color);
      margin-bottom: 0.5rem;
      font-size: 1.5rem;
    }
    
    .login-header p {
      color: var(--secondary-color);
      margin: 0;
    }
    
    .login-form {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }
    
    .form-group label {
      font-weight: 600;
      margin-bottom: 0.5rem;
      color: var(--dark-color);
    }
    
    .form-group input {
      padding: 0.75rem;
      border: 2px solid var(--border-color);
      border-radius: 8px;
      font-size: 1rem;
      transition: border-color 0.3s ease;
    }
    
    .form-group input:focus {
      outline: none;
      border-color: var(--primary-color);
    }
    
    .login-btn {
      background: var(--primary-color);
      color: white;
      padding: 1rem;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }
    
    .login-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    
    .divider {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin: 1.5rem 0;
      color: #94a3b8;
    }

    .divider::before,
    .divider::after {
      content: '';
      flex: 1;
      height: 1px;
      background: #e2e8f0;
    }

    .google-btn {
      width: 100%;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 0.85rem 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      font-weight: 600;
      cursor: pointer;
      background: #fff;
      transition: box-shadow 0.2s ease;
    }

    .google-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .google-btn:hover:not(:disabled) {
      box-shadow: 0 10px 20px rgba(15, 23, 42, 0.1);
    }
    
    .back-link {
      text-align: center;
      margin-top: 1rem;
    }
    
    .back-link a {
      color: var(--primary-color);
      text-decoration: none;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
    }
    
    .back-link a:hover {
      text-decoration: underline;
    }

  `]
})
export class LoginComponent {
  loginData: LoginRequest = {
    username: '',
    password: ''
  };
  loading = false;
  googleLoading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private googleAuthService: GoogleAuthService
  ) {}

  onSubmit() {
    if (this.loading) return;
    
    this.loading = true;
    this.spinner.show();

    this.authService.login(this.loginData).subscribe({
      next: () => {
        this.loading = false;
        this.spinner.hide();
        this.toastr.success('Login successful!');
        this.router.navigate(['/admin/dashboard']);
      },
      error: (error) => {
        this.loading = false;
        this.spinner.hide();
        console.error('Login error:', error);
        this.toastr.error(error.error?.detail || 'Login failed. Please check your credentials.');
      }
    });
  }

  loginWithGoogle(): void {
    if (this.googleLoading) return;
    this.googleLoading = true;
    this.googleAuthService.startLogin('admin', '/admin/dashboard');
  }

  goHome(event: Event) {
    event.preventDefault();
    this.router.navigate(['/']);
  }
}
