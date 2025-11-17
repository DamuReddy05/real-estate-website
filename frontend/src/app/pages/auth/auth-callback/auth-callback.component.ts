import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { GoogleAuthService } from '../../../core/services/google-auth.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-auth-callback',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="callback-wrapper">
      <div class="loader"></div>
      <p>Signing you in, please wait...</p>
    </div>
  `,
  styles: [`
    .callback-wrapper {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      background: #f8fafc;
      color: #475569;
    }
    .loader {
      width: 42px;
      height: 42px;
      border-radius: 50%;
      border: 4px solid #cbd5f5;
      border-top-color: #2563eb;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class AuthCallbackComponent implements OnInit {
  constructor(
    private googleAuth: GoogleAuthService,
    private authService: AuthService,
    private router: Router,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService
  ) {}

  ngOnInit(): void {
    this.spinner.show();
    try {
      const { idToken, state } = this.googleAuth.handleAuthCallback();
      this.authService.loginWithGoogle({ id_token: idToken, role: state.role }).subscribe({
        next: () => {
          this.spinner.hide();
          this.toastr.success('Welcome back!');
          this.router.navigate([state.redirectPath || '/']);
        },
        error: (error) => {
          this.spinner.hide();
          if (error?.error?.code === 'phone_required') {
            this.googleAuth.storePendingToken(idToken, state);
            this.router.navigate(['/auth/phone'], { queryParams: { role: state.role } });
          } else {
            console.error('Auth callback error', error);
            this.toastr.error(error?.error?.detail || 'Failed to sign in');
            this.router.navigate(['/']);
          }
        }
      });
    } catch (error: any) {
      this.spinner.hide();
      console.error('Callback processing failed', error);
      this.toastr.error(error?.message || 'Unable to process login response');
      this.router.navigate(['/']);
    }
  }
}
