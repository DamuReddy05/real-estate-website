import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { PropertyService } from '../../../core/services/property.service';
import { User } from '../../../core/models/user.model';
import { Property, PropertyEnquiry, CustomerPropertyStats } from '../../../core/models/property.model';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { HeaderComponent } from '../../../shared/header/header.component';

@Component({
  selector: 'app-manage-properties',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent],
  templateUrl: './manage-properties.component.html',
  styleUrls: ['./manage-properties.component.scss']
})
export class ManagePropertiesComponent implements OnInit {
  user: User | null = null;
  welcomeMessage = '';
  stats: CustomerPropertyStats | null = null;
  myProperties: Property[] = [];
  myEnquiries: PropertyEnquiry[] = [];
  loadingDashboard = true;

  constructor(
    private authService: AuthService,
    private propertyService: PropertyService,
    private router: Router,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService
  ) {}

  ngOnInit(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }
    this.user = this.authService.getCurrentUserValue();
    this.welcomeMessage = this.user?.first_name
      ? `Welcome back, ${this.user.first_name}!`
      : 'Welcome to your property workspace!';
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loadingDashboard = true;
    this.spinner.show();
    forkJoin({
      stats: this.propertyService.getCustomerPropertyStats(),
      properties: this.propertyService.getMyProperties(),
      enquiries: this.propertyService.getMyEnquiries()
    }).subscribe({
      next: ({ stats, properties, enquiries }) => {
        this.stats = stats;
        this.myProperties = properties;
        this.myEnquiries = enquiries;
        this.loadingDashboard = false;
        this.spinner.hide();
      },
      error: () => {
        this.loadingDashboard = false;
        this.spinner.hide();
        this.toastr.error('Failed to load your dashboard. Please try again.');
      }
    });
  }

  startListing(): void {
    this.router.navigate(['/customer/properties/create']);
  }

  viewDrafts(): void {
    // Filter to show only inactive/draft properties
    this.toastr.info('Draft management coming soon.');
  }

  viewProperty(property: Property): void {
    this.router.navigate(['/property', property.id]);
  }

  editProperty(property: Property, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.router.navigate(['/customer/properties/edit', property.id]);
  }

  deleteProperty(property: Property, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    
    if (!confirm(`Are you sure you want to delete "${property.title}"? This action cannot be undone.`)) {
      return;
    }

    this.spinner.show();
    this.propertyService.deleteCustomerProperty(property.id).subscribe({
      next: () => {
        this.toastr.success('Property deleted successfully!', 'Success');
        this.loadDashboard();
        this.spinner.hide();
      },
      error: (error) => {
        console.error('Error deleting property:', error);
        const message = error.error?.detail || error.error?.message || 'Failed to delete property. Please try again.';
        this.toastr.error(message, 'Error');
        this.spinner.hide();
      }
    });
  }

  getStatusColor(status: string): string {
    return this.propertyService.getStatusColor(status);
  }

  getPhoneApprovalClass(property: Property): string {
    return property.is_phone_approved ? 'badge-success' : 'badge-warning';
  }

  getPhoneApprovalLabel(property: Property): string {
    return property.is_phone_approved ? 'Verified Contact' : 'Awaiting Approval';
  }

  trackStatusClass(status: string): string {
    const color = this.getStatusColor(status);
    return `badge-${color}`;
  }

  getEnquiryBadgeClass(status: string): string {
    const colorMap: Record<string, string> = {
      new: 'warning',
      contacted: 'info',
      scheduled: 'primary',
      closed: 'success'
    };
    return `badge-${colorMap[status] || 'neutral'}`;
  }

  trackByProperty(_index: number, property: Property): number {
    return property.id;
  }

  trackByEnquiry(_index: number, enquiry: PropertyEnquiry): number {
    return enquiry.id;
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
