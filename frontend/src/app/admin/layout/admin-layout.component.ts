import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="admin-layout">
      <!-- Sidebar Navigation -->
      <aside class="sidebar" [class.collapsed]="isSidebarCollapsed">
        <!-- Logo/Brand -->
        <div class="sidebar-header">
          <div class="brand">
            <i class="fas fa-building"></i>
            <span *ngIf="!isSidebarCollapsed">RealEstateHub</span>
          </div>
          <button class="toggle-btn" (click)="toggleSidebar()">
            <i class="fas" [class.fa-bars]="isSidebarCollapsed" [class.fa-times]="!isSidebarCollapsed"></i>
          </button>
        </div>

        <!-- Navigation Menu -->
        <nav class="sidebar-nav">
          <a 
            routerLink="/admin/dashboard" 
            routerLinkActive="active"
            class="nav-item"
            [title]="isSidebarCollapsed ? 'Dashboard' : ''"
          >
            <i class="fas fa-chart-line"></i>
            <span *ngIf="!isSidebarCollapsed">Dashboard</span>
          </a>

          <a 
            routerLink="/admin/properties" 
            routerLinkActive="active"
            class="nav-item"
            [title]="isSidebarCollapsed ? 'Properties' : ''"
          >
            <i class="fas fa-home"></i>
            <span *ngIf="!isSidebarCollapsed">Properties</span>
            <span class="badge" *ngIf="!isSidebarCollapsed && propertyCount > 0">{{ propertyCount }}</span>
          </a>

          <a 
            routerLink="/admin/properties/create" 
            routerLinkActive="active"
            class="nav-item sub-item"
            [title]="isSidebarCollapsed ? 'Add Property' : ''"
            *ngIf="!isSidebarCollapsed"
          >
            <i class="fas fa-plus-circle"></i>
            <span>Add Property</span>
          </a>

          <a 
            routerLink="/admin/messages" 
            routerLinkActive="active"
            class="nav-item"
            [title]="isSidebarCollapsed ? 'Messages' : ''"
          >
            <i class="fas fa-envelope"></i>
            <span *ngIf="!isSidebarCollapsed">Messages</span>
            <span class="badge badge-new" *ngIf="!isSidebarCollapsed && newMessageCount > 0">{{ newMessageCount }}</span>
          </a>

          <a 
            routerLink="/admin/taxonomy" 
            routerLinkActive="active"
            class="nav-item"
            [title]="isSidebarCollapsed ? 'Tags & Categories' : ''"
          >
            <i class="fas fa-tags"></i>
            <span *ngIf="!isSidebarCollapsed">Tags & Categories</span>
          </a>

          <a 
            routerLink="/admin/locations" 
            routerLinkActive="active"
            class="nav-item"
            [title]="isSidebarCollapsed ? 'Cities & Pincodes' : ''"
          >
            <i class="fas fa-map-marker-alt"></i>
            <span *ngIf="!isSidebarCollapsed">Cities & Pincodes</span>
          </a>

          <a 
            routerLink="/admin/settings" 
            routerLinkActive="active"
            class="nav-item"
            [title]="isSidebarCollapsed ? 'Site Settings' : ''"
          >
            <i class="fas fa-cog"></i>
            <span *ngIf="!isSidebarCollapsed">Site Settings</span>
          </a>

          <div class="nav-divider" *ngIf="!isSidebarCollapsed"></div>

          <a 
            routerLink="/" 
            class="nav-item"
            [title]="isSidebarCollapsed ? 'View Website' : ''"
          >
            <i class="fas fa-globe"></i>
            <span *ngIf="!isSidebarCollapsed">View Website</span>
          </a>

          <a 
            (click)="logout()"
            class="nav-item logout"
            [title]="isSidebarCollapsed ? 'Logout' : ''"
          >
            <i class="fas fa-sign-out-alt"></i>
            <span *ngIf="!isSidebarCollapsed">Logout</span>
          </a>
        </nav>

        <!-- User Info -->
        <div class="sidebar-footer" *ngIf="!isSidebarCollapsed">
          <div class="user-info">
            <div class="user-avatar">
              <i class="fas fa-user-shield"></i>
            </div>
            <div class="user-details">
              <p class="user-name">Admin User</p>
              <p class="user-role">Administrator</p>
            </div>
          </div>
        </div>
      </aside>

      <!-- Main Content Area -->
      <main class="main-content" [class.expanded]="isSidebarCollapsed">
        <!-- Top Bar -->
        <div class="top-bar">
          <div class="breadcrumb">
            <button class="back-btn" (click)="goBack()" *ngIf="canGoBack()">
              <i class="fas fa-arrow-left"></i>
              <span>Back</span>
            </button>
            <div class="current-page">
              <i [class]="getCurrentPageIcon()"></i>
              {{ getCurrentPageTitle() }}
            </div>
          </div>
          <div class="top-actions">
            <button class="btn-icon" [title]="isSidebarCollapsed ? 'Expand Menu' : 'Collapse Menu'" (click)="toggleSidebar()">
              <i class="fas" [class.fa-bars]="!isSidebarCollapsed" [class.fa-times]="isSidebarCollapsed"></i>
            </button>
          </div>
        </div>

        <!-- Page Content (Router Outlet) -->
        <div class="content-wrapper">
          <router-outlet></router-outlet>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .admin-layout {
      display: flex;
      min-height: 100vh;
      background: #f8fafc;
    }

    /* ===========================
       SIDEBAR
    =========================== */
    
    .sidebar {
      width: 260px;
      background: linear-gradient(180deg, #1e293b 0%, #0f172a 100%);
      color: white;
      display: flex;
      flex-direction: column;
      position: fixed;
      left: 0;
      top: 0;
      height: 100vh;
      transition: all 0.3s ease;
      z-index: 1000;
      box-shadow: 4px 0 12px rgba(0, 0, 0, 0.1);
    }

    .sidebar.collapsed {
      width: 70px;
    }

    /* Sidebar Header */
    .sidebar-header {
      padding: 1.5rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 1.25rem;
      font-weight: 700;
      color: white;
    }

    .brand i {
      font-size: 1.5rem;
      color: #3b82f6;
    }

    .toggle-btn {
      background: rgba(255, 255, 255, 0.1);
      border: none;
      color: white;
      width: 36px;
      height: 36px;
      border-radius: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
    }

    .toggle-btn:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    /* Sidebar Navigation */
    .sidebar-nav {
      flex: 1;
      padding: 1rem 0;
      overflow-y: auto;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.875rem 1.5rem;
      color: #cbd5e1;
      text-decoration: none;
      transition: all 0.3s ease;
      cursor: pointer;
      position: relative;
      white-space: nowrap;
    }

    .sidebar.collapsed .nav-item {
      justify-content: center;
      padding: 0.875rem 0;
    }

    .sidebar.collapsed .nav-item i {
      font-size: 1.25rem;
    }

    .nav-item i {
      font-size: 1.1rem;
      width: 20px;
      text-align: center;
      flex-shrink: 0;
    }

    .nav-item:hover {
      background: rgba(255, 255, 255, 0.1);
      color: white;
    }

    .nav-item.active {
      background: linear-gradient(90deg, rgba(59, 130, 246, 0.2), transparent);
      color: white;
      border-left: 4px solid #3b82f6;
    }

    .nav-item.sub-item {
      padding-left: 3rem;
      font-size: 0.9rem;
    }

    .nav-item.logout {
      color: #f87171;
    }

    .nav-item.logout:hover {
      background: rgba(248, 113, 113, 0.1);
      color: #fca5a5;
    }

    .nav-divider {
      height: 1px;
      background: rgba(255, 255, 255, 0.1);
      margin: 1rem 0;
    }

    .badge {
      background: #3b82f6;
      color: white;
      padding: 0.25rem 0.5rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
      margin-left: auto;
    }

    .badge-new {
      background: #ef4444;
      animation: pulse 2s infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.7; }
    }

    /* Sidebar Footer */
    .sidebar-footer {
      padding: 1rem;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .user-avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(135deg, #3b82f6, #2563eb);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .user-avatar i {
      font-size: 1.25rem;
    }

    .user-details {
      overflow: hidden;
    }

    .user-name {
      margin: 0;
      font-size: 0.9rem;
      font-weight: 600;
      color: white;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .user-role {
      margin: 0;
      font-size: 0.75rem;
      color: #94a3b8;
    }

    /* ===========================
       MAIN CONTENT
    =========================== */
    
    .main-content {
      flex: 1;
      margin-left: 260px;
      transition: all 0.3s ease;
      display: flex;
      flex-direction: column;
    }

    .main-content.expanded {
      margin-left: 70px;
    }

    /* Top Bar */
    .top-bar {
      background: white;
      padding: 1rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
      position: sticky;
      top: 0;
      z-index: 100;
    }

    .breadcrumb {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .back-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background: white;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      color: #475569;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s ease;
    }

    .back-btn:hover {
      border-color: #3b82f6;
      color: #3b82f6;
      transform: translateX(-4px);
    }

    .current-page {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 1.25rem;
      font-weight: 600;
      color: #1e293b;
    }

    .current-page i {
      color: #3b82f6;
    }

    .top-actions {
      display: flex;
      gap: 0.5rem;
    }

    .btn-icon {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      border: 2px solid #e5e7eb;
      background: white;
      color: #475569;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
    }

    .btn-icon:hover {
      border-color: #3b82f6;
      color: #3b82f6;
      background: #f8fafc;
    }

    /* Content Wrapper */
    .content-wrapper {
      flex: 1;
      padding: 2rem;
      overflow-y: auto;
    }

    /* ===========================
       RESPONSIVE
    =========================== */
    
    @media (max-width: 768px) {
      .sidebar {
        transform: translateX(-100%);
      }

      .sidebar.collapsed {
        transform: translateX(0);
        width: 70px;
      }

      .main-content {
        margin-left: 0;
      }

      .main-content.expanded {
        margin-left: 70px;
      }

      .top-bar {
        padding: 1rem;
      }

      .content-wrapper {
        padding: 1rem;
      }

      .back-btn span {
        display: none;
      }
    }
  `]
})
export class AdminLayoutComponent implements OnInit {
  isSidebarCollapsed = false;
  propertyCount = 0;
  newMessageCount = 0;

  constructor(
    private router: Router,
    private authService: AuthService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    // Load counts (simplified for now)
    this.loadCounts();
  }

  loadCounts() {
    // TODO: Load actual counts from API
    this.propertyCount = 0;
    this.newMessageCount = 0;
  }

  toggleSidebar() {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
    localStorage.setItem('sidebarCollapsed', this.isSidebarCollapsed.toString());
  }

  canGoBack(): boolean {
    // Don't show back button on dashboard
    return !this.router.url.includes('/admin/dashboard') && 
           !this.router.url.includes('/admin/login');
  }

  goBack() {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      this.router.navigate(['/admin/dashboard']);
    }
  }

  getCurrentPageTitle(): string {
    const url = this.router.url;
    if (url.includes('/dashboard')) return 'Dashboard';
    if (url.includes('/properties/create')) return 'Add Property';
    if (url.includes('/properties/edit')) return 'Edit Property';
    if (url.includes('/properties')) return 'Properties';
    if (url.includes('/messages') || url.includes('/contact')) return 'Contact Messages';
    if (url.includes('/taxonomy')) return 'Tags & Categories';
    if (url.includes('/locations')) return 'Cities & Pincodes';
    if (url.includes('/settings')) return 'Site Settings';
    return 'Admin Panel';
  }

  getCurrentPageIcon(): string {
    const url = this.router.url;
    if (url.includes('/dashboard')) return 'fas fa-chart-line';
    if (url.includes('/properties/create')) return 'fas fa-plus-circle';
    if (url.includes('/properties/edit')) return 'fas fa-edit';
    if (url.includes('/properties')) return 'fas fa-home';
    if (url.includes('/messages') || url.includes('/contact')) return 'fas fa-envelope';
    if (url.includes('/taxonomy')) return 'fas fa-tags';
    if (url.includes('/locations')) return 'fas fa-map-marker-alt';
    if (url.includes('/settings')) return 'fas fa-cog';
    return 'fas fa-cog';
  }

  logout() {
    if (confirm('Are you sure you want to logout?')) {
      this.authService.logout();
      this.toastr.success('Logged out successfully', 'Success');
      this.router.navigate(['/admin/login']);
    }
  }
}




