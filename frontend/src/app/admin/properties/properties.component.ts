import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { PropertyService } from '../../core/services/property.service';
import { Property } from '../../core/models/property.model';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-properties',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="container">
      <h1>Property Management</h1>
      <div class="actions">
        <div class="search-filters">
          <input 
            type="text" 
            placeholder="Search properties..." 
            [(ngModel)]="searchQuery"
            (input)="onSearchChange()"
            class="search-input"
          >
          <select [(ngModel)]="statusFilter" (change)="onFilterChange()" class="filter-select">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <select [(ngModel)]="categoryFilter" (change)="onFilterChange()" class="filter-select">
            <option value="">All Categories</option>
            <option value="flat">Flat/Apartment</option>
            <option value="house">House/Villa</option>
            <option value="plot">Plot</option>
            <option value="commercial">Commercial</option>
          </select>
        </div>
        <button class="btn btn-primary" routerLink="/admin/properties/create">
          <i class="fas fa-plus"></i> Add New Property
        </button>
      </div>
      
      <div class="properties-list" *ngIf="!loading; else loadingTemplate">
        <div class="property-item" *ngFor="let property of properties">
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
            <button class="btn btn-primary" (click)="viewProperty(property)">
              <i class="fas fa-eye"></i> View
            </button>
            <button 
              class="btn btn-warning" 
              (click)="togglePropertyStatus(property)"
              [disabled]="loading"
            >
              <i class="fas fa-toggle-on" *ngIf="property.status === 'active'"></i>
              <i class="fas fa-toggle-off" *ngIf="property.status === 'inactive'"></i>
              {{ property.status === 'active' ? 'Deactivate' : 'Activate' }}
            </button>
            <button 
              class="btn btn-danger" 
              (click)="deleteProperty(property)"
              [disabled]="loading"
            >
              <i class="fas fa-trash"></i> Delete
            </button>
          </div>
        </div>
      </div>
      
      <ng-template #loadingTemplate>
        <div class="text-center p-5">
          <div class="loading"></div>
          <p>Loading properties...</p>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }
    
    .actions {
      margin-bottom: 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .search-filters {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .search-input,
    .filter-select {
      padding: 0.5rem 1rem;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      font-size: 0.875rem;
    }

    .search-input {
      min-width: 200px;
    }

    .filter-select {
      min-width: 150px;
    }
    
    .properties-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    
    .property-item {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
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
      color: #1e293b;
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
      color: #64748b;
      font-size: 0.875rem;
    }
    
    .property-actions {
      display: flex;
      gap: 0.75rem;
    }
    
    .loading {
      display: inline-block;
      width: 2rem;
      height: 2rem;
      border: 3px solid #e2e8f0;
      border-radius: 50%;
      border-top-color: #2563eb;
      animation: spin 1s ease-in-out infinite;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .btn-warning {
      background-color: #f59e0b;
      color: white;
    }

    .btn-warning:hover:not(:disabled) {
      background-color: #d97706;
    }

    .btn-danger {
      background-color: #ef4444;
      color: white;
    }

    .btn-danger:hover:not(:disabled) {
      background-color: #dc2626;
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
  `]
})
export class PropertiesComponent implements OnInit {
  properties: Property[] = [];
  allProperties: Property[] = [];
  loading = false;
  searchQuery = '';
  statusFilter = '';
  categoryFilter = '';

  constructor(
    public propertyService: PropertyService,
    private spinner: NgxSpinnerService
  ) {}

  ngOnInit() {
    this.loadProperties();
  }

  loadProperties() {
    this.loading = true;
    this.spinner.show();
    
    this.propertyService.getAdminProperties().subscribe({
      next: (properties) => {
        this.allProperties = properties;
        this.filterProperties();
        this.loading = false;
        this.spinner.hide();
      },
      error: (error) => {
        console.error('Error loading properties:', error);
        this.loading = false;
        this.spinner.hide();
      }
    });
  }

  filterProperties() {
    let filtered = [...this.allProperties];

    // Search filter
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(property => 
        property.title.toLowerCase().includes(query) ||
        property.location.toLowerCase().includes(query) ||
        property.city.toLowerCase().includes(query) ||
        property.description?.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (this.statusFilter) {
      filtered = filtered.filter(property => property.status === this.statusFilter);
    }

    // Category filter
    if (this.categoryFilter) {
      filtered = filtered.filter(property => property.category === this.categoryFilter);
    }

    this.properties = filtered;
  }

  onSearchChange() {
    this.filterProperties();
  }

  onFilterChange() {
    this.filterProperties();
  }

  viewProperty(property: Property) {
    // Navigate to public property detail page
    window.open(`/property/${property.id}`, '_blank');
  }

  togglePropertyStatus(property: Property) {
    if (confirm(`Are you sure you want to ${property.status === 'active' ? 'deactivate' : 'activate'} this property?`)) {
      this.loading = true;
      this.spinner.show();
      
      this.propertyService.togglePropertyStatus(property.id).subscribe({
        next: (updatedProperty) => {
          // Update the property in the list
          const index = this.properties.findIndex(p => p.id === property.id);
          if (index !== -1) {
            this.properties[index] = updatedProperty;
          }
          this.loading = false;
          this.spinner.hide();
        },
        error: (error) => {
          console.error('Error toggling property status:', error);
          this.loading = false;
          this.spinner.hide();
        }
      });
    }
  }

  deleteProperty(property: Property) {
    if (confirm(`Are you sure you want to delete "${property.title}"? This action cannot be undone.`)) {
      this.loading = true;
      this.spinner.show();
      
      this.propertyService.deleteProperty(property.id).subscribe({
        next: () => {
          // Remove the property from the list
          this.properties = this.properties.filter(p => p.id !== property.id);
          this.loading = false;
          this.spinner.hide();
        },
        error: (error) => {
          console.error('Error deleting property:', error);
          this.loading = false;
          this.spinner.hide();
        }
      });
    }
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
