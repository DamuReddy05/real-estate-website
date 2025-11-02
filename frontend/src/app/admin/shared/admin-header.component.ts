import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-admin-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="admin-header">
      <nav class="navbar">
        <div class="nav-brand" routerLink="/admin/dashboard">
          <i class="fas fa-home"></i>
          <h2>RealEstateHub Admin</h2>
        </div>
        <ul class="nav-menu">
          <li>
            <a href="/" target="_blank" class="nav-link">
              <i class="fas fa-external-link-alt"></i>
              View Website
            </a>
          </li>
          <li>
            <a routerLink="/admin/dashboard" routerLinkActive="active" class="nav-link">
              <i class="fas fa-chart-line"></i>
              Dashboard
            </a>
          </li>
          <li>
            <a routerLink="/admin/properties" routerLinkActive="active" class="nav-link">
              <i class="fas fa-building"></i>
              Properties
            </a>
          </li>
          <li>
            <a routerLink="/admin/contact" routerLinkActive="active" class="nav-link">
              <i class="fas fa-envelope"></i>
              Messages
              <span class="badge-count" *ngIf="newMessagesCount > 0">{{ newMessagesCount }}</span>
            </a>
          </li>
        </ul>
        <div class="nav-actions">
          <div class="user-menu">
            <div class="user-avatar">
              <i class="fas fa-user-circle"></i>
            </div>
            <div class="user-info">
              <span class="user-name">{{ currentUser?.username || 'Admin' }}</span>
              <span class="user-role">Administrator</span>
            </div>
          </div>
          <button class="btn-logout" (click)="logout()">
            <i class="fas fa-sign-out-alt"></i>
            <span>Logout</span>
          </button>
        </div>
      </nav>
    </header>
  `,
  styles: [`
    .admin-header {
      background: white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      position: sticky;
      top: 0;
      z-index: 1000;
    }

    .navbar {
      max-width: 1400px;
      margin: 0 auto;
      padding: 1rem 2rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 2rem;
    }

    .nav-brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      cursor: pointer;
      transition: opacity 0.3s ease;
    }

    .nav-brand:hover {
      opacity: 0.8;
    }

    .nav-brand i {
      color: #2563eb;
      font-size: 1.5rem;
    }

    .nav-brand h2 {
      margin: 0;
      color: #1e293b;
      font-size: 1.25rem;
      font-weight: 700;
    }

    .nav-menu {
      display: flex;
      list-style: none;
      gap: 0.5rem;
      margin: 0;
      padding: 0;
      flex: 1;
    }

    .nav-link {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.25rem;
      text-decoration: none;
      color: #64748b;
      font-weight: 500;
      font-size: 0.95rem;
      border-radius: 8px;
      transition: all 0.3s ease;
      position: relative;
    }

    .nav-link:hover {
      background: #f8fafc;
      color: #2563eb;
    }

    .nav-link.active {
      background: #eff6ff;
      color: #2563eb;
      font-weight: 600;
    }

    .badge-count {
      position: absolute;
      top: 0.4rem;
      right: 0.4rem;
      background: #ef4444;
      color: white;
      font-size: 0.7rem;
      font-weight: 700;
      padding: 0.15rem 0.4rem;
      border-radius: 10px;
      min-width: 18px;
      text-align: center;
    }

    .nav-actions {
      display: flex;
      align-items: center;
      gap: 1.5rem;
    }

    .user-menu {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.5rem 1rem;
      background: #f8fafc;
      border-radius: 10px;
    }

    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea, #764ba2);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 1.5rem;
    }

    .user-info {
      display: flex;
      flex-direction: column;
    }

    .user-name {
      font-size: 0.875rem;
      font-weight: 600;
      color: #1e293b;
    }

    .user-role {
      font-size: 0.75rem;
      color: #64748b;
    }

    .btn-logout {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.25rem;
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      color: #64748b;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .btn-logout:hover {
      background: #fef2f2;
      border-color: #fecaca;
      color: #dc2626;
    }

    @media (max-width: 1024px) {
      .navbar {
        flex-wrap: wrap;
      }

      .nav-menu {
        order: 3;
        width: 100%;
        margin-top: 1rem;
        padding-top: 1rem;
        border-top: 1px solid #e2e8f0;
      }

      .user-info {
        display: none;
      }
    }

    @media (max-width: 768px) {
      .navbar {
        padding: 1rem;
      }

      .nav-brand h2 {
        font-size: 1.1rem;
      }

      .nav-menu {
        flex-direction: column;
        gap: 0.25rem;
      }

      .nav-link {
        justify-content: flex-start;
      }

      .btn-logout span {
        display: none;
      }
    }
  `]
})
export class AdminHeaderComponent implements OnInit {
  currentUser: User | null = null;
  newMessagesCount = 0;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUserValue();
    // In production, fetch new messages count from API
  }

  logout() {
    if (confirm('Are you sure you want to logout?')) {
      this.authService.logout().subscribe({
        next: () => {
          this.router.navigate(['/admin/login']);
        },
        error: (error) => {
          console.error('Logout error:', error);
          this.router.navigate(['/admin/login']);
        }
      });
    }
  }
}


