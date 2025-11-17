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
    <section class="admin-dashboard">
      <div class="dashboard-shell">
        <div class="page-heading">
          <div>
            <p class="eyebrow">Dashboard</p>
            <h1>Welcome back, {{ currentUser?.first_name || currentUser?.username || 'Admin' }}</h1>
            <p class="subtext">Track inventory, enquiries and approvals from a single view.</p>
          </div>
          <div class="heading-actions">
            <button class="btn btn-outline" routerLink="/admin/properties/create">
              <i class="fas fa-plus"></i> Add Property
            </button>
            <button class="btn btn-ghost" routerLink="/">
              <i class="fas fa-globe"></i> View Website
            </button>
          </div>
        </div>
        
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
          <div class="card-heading">
            <h2>Quick Actions</h2>
            <span>Handle the most common admin tasks</span>
          </div>
          <div class="action-buttons">
            <button class="btn btn-primary" routerLink="/admin/properties">
              <i class="fas fa-list"></i> Manage Properties
            </button>
            <button class="btn btn-outline" routerLink="/admin/messages">
              <i class="fas fa-envelope"></i> View Messages
            </button>
            <button class="btn btn-outline" (click)="logout()">
              <i class="fas fa-sign-out-alt"></i> Logout
            </button>
          </div>
        </div>

        <!-- Recent Properties -->
        <div class="recent-properties">
          <div class="card-heading">
            <h2>Recent Properties</h2>
            <button class="link" routerLink="/admin/properties">View all</button>
          </div>
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
                <span><i class="fas fa-tag"></i> ₹{{ formatPrice(property.price) }}</span>
                <span><i class="fas fa-ruler-combined"></i> {{ property.carpet_area }} sq ft</span>
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
          <div class="card-heading">
            <h2>Contact Messages</h2>
            <span>Stay on top of customer conversations</span>
          </div>
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
    .admin-dashboard {
      padding: 2rem 2.5rem;
      min-height: calc(100vh - 120px);
      background: linear-gradient(180deg, #f8fafc 0%, #eef2ff 60%, #ffffff 100%);
    }

    .dashboard-shell {
      max-width: 1240px;
      margin: 0 auto;
    }

    .page-heading {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 2rem;
      margin-bottom: 2.5rem;
    }

    .eyebrow {
      text-transform: uppercase;
      letter-spacing: 0.2em;
      font-size: 0.75rem;
      color: #6366f1;
      margin-bottom: 0.35rem;
    }

    .page-heading h1 {
      margin: 0;
      font-size: 2rem;
      color: #0f172a;
    }

    .subtext {
      margin: 0.4rem 0 0;
      color: #475569;
    }

    .heading-actions {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
      justify-content: flex-end;
    }

    .btn {
      border: none;
      border-radius: 10px;
      padding: 0.85rem 1.4rem;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      cursor: pointer;
    }

    .btn-primary {
      background: #2563eb;
      color: #fff;
      box-shadow: 0 10px 30px rgba(37, 99, 235, 0.25);
    }

    .btn-outline {
      background: #fff;
      border: 1px solid #cbd5f5;
      color: #1e3a8a;
    }

    .btn-ghost {
      background: transparent;
      border: 1px solid transparent;
      color: #475569;
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
      border-radius: 18px;
      box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08);
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
      background: white;
      border-radius: 18px;
      padding: 2rem;
      box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08);
    }

    .card-heading {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 1rem;
      margin-bottom: 1.2rem;
    }

    .card-heading h2 {
      margin: 0;
      font-size: 1.4rem;
      color: #0f172a;
    }

    .card-heading span {
      color: #94a3b8;
    }

    .card-heading .link {
      border: none;
      background: transparent;
      color: #2563eb;
      cursor: pointer;
      font-weight: 600;
    }

    .action-buttons {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .recent-properties,
    .contact-stats {
      margin-bottom: 3rem;
      background: white;
      border-radius: 18px;
      padding: 2rem;
      box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08);
    }

    .property-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .property-item {
      background: #f8fafc;
      padding: 1.5rem;
      border-radius: 16px;
      border: 1px solid #e2e8f0;
    }

    .property-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
    }

    .property-title {
      margin: 0 0 0.5rem 0;
      color: #0f172a;
      font-size: 1.25rem;
    }

    .property-location {
      margin: 0;
      color: #64748b;
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
      color: #475569;
      font-size: 0.875rem;
    }

    .property-actions {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    .no-data {
      text-align: center;
      padding: 3rem;
      color: #94a3b8;
    }

    .no-data i {
      font-size: 3rem;
      margin-bottom: 1rem;
      color: #cbd5f5;
    }

    .no-data a {
      color: #2563eb;
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
      background: #f8fafc;
      padding: 1.5rem;
      border-radius: 16px;
      text-align: center;
      border: 1px solid #e2e8f0;
    }

    .contact-stat i {
      font-size: 2rem;
      color: #2563eb;
      margin-bottom: 0.5rem;
    }

    .contact-stat h3 {
      font-size: 1.5rem;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 0.25rem;
    }

    .contact-stat p {
      color: #475569;
      margin: 0;
      font-size: 0.875rem;
    }

    @media (max-width: 768px) {
      .admin-dashboard {
        padding: 1.5rem;
      }

      .page-heading {
        flex-direction: column;
        align-items: flex-start;
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

  formatPrice(price: number): string {
    if (!price || price === 0) return '0';
    if (price >= 10000000) {
      return `${(price / 10000000).toFixed(2)} Cr`;
    } else if (price >= 100000) {
      return `${(price / 100000).toFixed(2)} L`;
    } else {
      return price.toLocaleString('en-IN');
    }
  }
}
