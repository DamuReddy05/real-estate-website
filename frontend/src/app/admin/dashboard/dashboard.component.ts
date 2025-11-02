import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { PropertyService } from '../../core/services/property.service';
import { ContactService } from '../../core/services/contact.service';
import { AuthService } from '../../core/services/auth.service';
import { PropertyStats } from '../../core/models/property.model';
import { ContactStats } from '../../core/models/contact.model';
import { User } from '../../core/models/user.model';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <!-- Header -->
    <header class="header">
      <nav class="navbar">
        <div class="nav-brand">
          <h2><i class="fas fa-home"></i> RealEstateHub Admin</h2>
        </div>
        <ul class="nav-menu">
          <li><a href="/">View Website</a></li>
          <li><a routerLink="/admin/dashboard" class="active">Dashboard</a></li>
          <li><a routerLink="/admin/properties">Properties</a></li>
          <li><a routerLink="/admin/messages">Messages</a></li>
        </ul>
        <div class="nav-buttons">
          <span class="user-info">Welcome, {{ currentUser?.username }}</span>
          <button class="btn btn-outline" (click)="logout()">Logout</button>
        </div>
      </nav>
    </header>

    <!-- Dashboard Content -->
    <section class="admin-dashboard">
      <div class="container">
        <h1>Property Management Dashboard</h1>
        
        <!-- Stats Cards -->
        <div class="stats-grid">
          <div class="stat-card">
            <i class="fas fa-building"></i>
            <h3>{{ propertyStats?.total_properties || 0 }}</h3>
            <p>Total Properties</p>
          </div>
          <div class="stat-card">
            <i class="fas fa-home"></i>
            <h3>{{ propertyStats?.for_sale || 0 }}</h3>
            <p>For Sale</p>
          </div>
          <div class="stat-card">
            <i class="fas fa-key"></i>
            <h3>{{ propertyStats?.for_rent || 0 }}</h3>
            <p>For Rent</p>
          </div>
          <div class="stat-card">
            <i class="fas fa-map-marked-alt"></i>
            <h3>{{ propertyStats?.plots || 0 }}</h3>
            <p>Plots</p>
          </div>
          <div class="stat-card">
            <i class="fas fa-envelope"></i>
            <h3>{{ contactStats?.total_messages || 0 }}</h3>
            <p>Contact Messages</p>
          </div>
          <div class="stat-card">
            <i class="fas fa-envelope-open"></i>
            <h3>{{ contactStats?.new_messages || 0 }}</h3>
            <p>New Messages</p>
          </div>
        </div>

        <!-- Quick Actions -->
        <div class="quick-actions">
          <h2>Quick Actions</h2>
          <div class="action-buttons">
            <button class="btn btn-primary" routerLink="/admin/properties/create">
              <i class="fas fa-plus"></i> Add New Property
            </button>
            <button class="btn btn-outline" routerLink="/admin/properties">
              <i class="fas fa-list"></i> Manage Properties
            </button>
            <button class="btn btn-outline" routerLink="/admin/messages">
              <i class="fas fa-envelope"></i> View Messages
            </button>
          </div>
        </div>

        <!-- Recent Properties -->
        <div class="recent-properties">
          <h2>Recent Properties</h2>
          <div class="property-list" *ngIf="recentProperties.length > 0; else noProperties">
            <div class="property-item" *ngFor="let property of recentProperties">
              <div class="property-header">
                <div>
                  <h3 class="property-title">{{ property.title }}</h3>
                  <p class="property-location">{{ property.location }}</p>
                </div>
                <span class="property-badge" [ngClass]="'badge-' + propertyService.getStatusColor(property.status)">
                  {{ propertyService.getStatusDisplayName(property.status) }}
                </span>
              </div>
              <div class="property-details">
                <span><i class="fas fa-tag"></i> {{ property.price }}</span>
                <span><i class="fas fa-ruler-combined"></i> {{ property.area }} sq ft</span>
                <span><i class="fas fa-building"></i> {{ propertyService.getCategoryDisplayName(property.category) }}</span>
                <span><i class="fas fa-eye"></i> {{ property.view_count || 0 }} views</span>
              </div>
              <div class="property-actions">
                <button class="btn btn-outline" routerLink="/admin/properties/edit/{{ property.id }}">
                  <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn btn-primary" routerLink="/admin/properties">
                  <i class="fas fa-eye"></i> View All
                </button>
              </div>
            </div>
          </div>
          <ng-template #noProperties>
            <div class="no-data">
              <i class="fas fa-home"></i>
              <p>No properties found. <a routerLink="/admin/properties/create">Add your first property</a></p>
            </div>
          </ng-template>
        </div>

        <!-- Contact Stats -->
        <div class="contact-stats" *ngIf="contactStats">
          <h2>Contact Messages</h2>
          <div class="contact-stats-grid">
            <div class="contact-stat">
              <i class="fas fa-envelope"></i>
              <h3>{{ contactStats.total_messages }}</h3>
              <p>Total Messages</p>
            </div>
            <div class="contact-stat">
              <i class="fas fa-exclamation-circle"></i>
              <h3>{{ contactStats.new_messages }}</h3>
              <p>New Messages</p>
            </div>
            <div class="contact-stat">
              <i class="fas fa-check-circle"></i>
              <h3>{{ contactStats.replied_messages }}</h3>
              <p>Replied</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    .header {
      background: white;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      position: sticky;
      top: 0;
      z-index: 1000;
    }

    .navbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .nav-brand h2 {
      color: var(--primary-color);
      margin: 0;
      font-size: 1.5rem;
    }

    .nav-menu {
      display: flex;
      list-style: none;
      gap: 2rem;
      margin: 0;
      padding: 0;
    }

    .nav-menu a {
      text-decoration: none;
      color: var(--dark-color);
      font-weight: 500;
      transition: color 0.3s ease;
    }

    .nav-menu a:hover,
    .nav-menu a.active {
      color: var(--primary-color);
    }

    .nav-buttons {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .user-info {
      color: var(--secondary-color);
      font-size: 0.875rem;
    }

    .admin-dashboard {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .admin-dashboard h1 {
      margin-bottom: 2rem;
      color: var(--dark-color);
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
      margin-bottom: 3rem;
    }

    .stat-card {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: var(--shadow);
      text-align: center;
      transition: transform 0.3s ease;
    }

    .stat-card:hover {
      transform: translateY(-2px);
    }

    .stat-card i {
      font-size: 2.5rem;
      color: var(--primary-color);
      margin-bottom: 1rem;
    }

    .stat-card h3 {
      font-size: 2rem;
      font-weight: 700;
      color: var(--dark-color);
      margin-bottom: 0.5rem;
    }

    .stat-card p {
      color: var(--secondary-color);
      margin: 0;
    }

    .quick-actions {
      margin-bottom: 3rem;
    }

    .quick-actions h2 {
      margin-bottom: 1.5rem;
      color: var(--dark-color);
    }

    .action-buttons {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .recent-properties,
    .contact-stats {
      margin-bottom: 3rem;
    }

    .recent-properties h2,
    .contact-stats h2 {
      margin-bottom: 1.5rem;
      color: var(--dark-color);
    }

    .property-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .property-item {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: var(--shadow);
      border: 1px solid var(--border-color);
    }

    .property-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
    }

    .property-title {
      margin: 0 0 0.5rem 0;
      color: var(--dark-color);
      font-size: 1.25rem;
    }

    .property-location {
      margin: 0;
      color: var(--secondary-color);
      font-size: 0.875rem;
    }

    .property-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 1rem;
      font-size: 0.75rem;
      font-weight: 500;
      text-transform: uppercase;
    }

    .badge-success { background: #d1fae5; color: #065f46; }
    .badge-warning { background: #fef3c7; color: #92400e; }
    .badge-info { background: #dbeafe; color: #1e40af; }
    .badge-primary { background: #dbeafe; color: #1e40af; }

    .property-details {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
      flex-wrap: wrap;
    }

    .property-details span {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      color: var(--secondary-color);
      font-size: 0.875rem;
    }

    .property-actions {
      display: flex;
      gap: 0.75rem;
    }

    .no-data {
      text-align: center;
      padding: 3rem;
      color: var(--secondary-color);
    }

    .no-data i {
      font-size: 3rem;
      margin-bottom: 1rem;
      color: var(--border-color);
    }

    .no-data a {
      color: var(--primary-color);
      text-decoration: none;
    }

    .no-data a:hover {
      text-decoration: underline;
    }

    .contact-stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 1rem;
    }

    .contact-stat {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: var(--shadow);
      text-align: center;
    }

    .contact-stat i {
      font-size: 2rem;
      color: var(--primary-color);
      margin-bottom: 0.5rem;
    }

    .contact-stat h3 {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--dark-color);
      margin-bottom: 0.25rem;
    }

    .contact-stat p {
      color: var(--secondary-color);
      margin: 0;
      font-size: 0.875rem;
    }

    @media (max-width: 768px) {
      .navbar {
        flex-direction: column;
        gap: 1rem;
      }

      .nav-menu {
        flex-direction: column;
        gap: 1rem;
      }

      .action-buttons {
        flex-direction: column;
      }

      .property-actions {
        flex-direction: column;
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  propertyStats: PropertyStats | null = null;
  contactStats: ContactStats | null = null;
  recentProperties: any[] = [];
  currentUser: User | null = null;

  constructor(
    public propertyService: PropertyService,
    private contactService: ContactService,
    private authService: AuthService,
    private router: Router,
    private spinner: NgxSpinnerService
  ) {}

  ngOnInit() {
    this.currentUser = this.authService.getCurrentUserValue();
    
    // Only load dashboard data if user is authenticated
    if (this.authService.isAuthenticated()) {
      this.loadDashboardData();
    } else {
      // If not authenticated, redirect to login
      this.router.navigate(['/admin/login']);
    }
  }

  loadDashboardData() {
    this.spinner.show();

    // Load property stats
    this.propertyService.getPropertyStats().subscribe({
      next: (stats) => {
        this.propertyStats = stats;
      },
      error: (error) => {
        console.error('Error loading property stats:', error);
      }
    });

    // Load contact stats
    this.contactService.getContactStats().subscribe({
      next: (stats) => {
        this.contactStats = stats;
      },
      error: (error) => {
        console.error('Error loading contact stats:', error);
      }
    });

    // Load recent properties
    this.propertyService.getAdminProperties().subscribe({
      next: (properties) => {
        this.recentProperties = properties.slice(0, 5); // Show only 5 recent
        this.spinner.hide();
      },
      error: (error) => {
        console.error('Error loading recent properties:', error);
        this.spinner.hide();
      }
    });
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/admin/login']);
      },
      error: (error) => {
        console.error('Logout error:', error);
        // Force logout even if API call fails
        this.router.navigate(['/admin/login']);
      }
    });
  }
}
