import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { GoogleAuthService } from '../../../core/services/google-auth.service';
import { HeaderComponent } from '../../../shared/header/header.component';

@Component({
  selector: 'app-customer-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HeaderComponent],
  templateUrl: './customer-login.component.html',
  styleUrls: ['./customer-login.component.scss']
})
export class CustomerLoginComponent {
  loading = false;

  constructor(
    private googleAuthService: GoogleAuthService,
    private router: Router
  ) {}

  loginWithGoogle(): void {
    if (this.loading) return;
    this.loading = true;
    this.googleAuthService.startLogin('customer', '/');
  }
}
