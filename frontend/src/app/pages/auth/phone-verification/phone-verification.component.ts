import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../core/services/auth.service';
import { GoogleAuthService } from '../../../core/services/google-auth.service';

@Component({
  selector: 'app-phone-verification',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './phone-verification.component.html',
  styleUrls: ['./phone-verification.component.scss']
})
export class PhoneVerificationComponent {
  phoneNumber = '';
  role: 'admin' | 'customer' = 'customer';
  private pendingToken: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private googleAuth: GoogleAuthService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService
  ) {
    const info = this.googleAuth.consumePendingToken();
    if (!info) {
      this.toastr.warning('Session expired. Please sign in again.');
      this.router.navigate(['/login']);
      return;
    }
    this.pendingToken = info.token;
    this.role = this.route.snapshot.queryParamMap.get('role') === 'admin' ? 'admin' : info.state.role;
  }

  submit(): void {
    if (!this.pendingToken) {
      this.toastr.error('Missing pending login session. Please try again.');
      this.router.navigate(['/login']);
      return;
    }

    const phone = (this.phoneNumber || '').trim();
    if (phone.length < 8) {
      this.toastr.warning('Please enter a valid phone number');
      return;
    }

    this.spinner.show();
    this.authService.loginWithGoogle({ id_token: this.pendingToken, phone, role: this.role }).subscribe({
      next: () => {
        this.spinner.hide();
        this.pendingToken = null;
        this.toastr.success('Phone verified and login complete!');
        this.router.navigate([this.role === 'admin' ? '/admin/dashboard' : '/']);
      },
      error: (error) => {
        this.spinner.hide();
        console.error('Phone verification failed', error);
        this.toastr.error(error?.error?.detail || 'Unable to verify phone');
      }
    });
  }
}
