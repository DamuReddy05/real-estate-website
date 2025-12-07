import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { PropertyService } from '../../core/services/property.service';
import { Amenity } from '../../core/models/property.model';

@Component({
  selector: 'app-amenities-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="amenities-shell">
      <header class="hero-card">
        <div>
          <p class="eyebrow">Property Features</p>
          <h1>Amenities Management</h1>
          <p class="lead">Manage property amenities like Parking, Gym, Pool, Security, etc. These will appear in property listings and search filters.</p>
        </div>
      </header>

      <div class="insight-grid">
        <div class="insight-card">
          <p class="label">Total Amenities</p>
          <p class="value">{{ amenities.length }}</p>
          <small>{{ activeAmenities }} active</small>
        </div>
        <div class="insight-card">
          <p class="label">Hidden</p>
          <p class="value">{{ amenities.length - activeAmenities }}</p>
          <small>Not visible to users</small>
        </div>
      </div>

      <div class="panel-grid">
        <form class="editor-card" (ngSubmit)="saveAmenity()" #amenityForm="ngForm">
          <div class="editor-header">
            <div>
              <h2>{{ editingAmenityId ? 'Edit Amenity' : 'Create Amenity' }}</h2>
              <p>Property features like Parking, Gym, Pool, etc.</p>
            </div>
            <button type="button" class="btn-text" (click)="resetAmenityForm()" *ngIf="editingAmenityId">Cancel edit</button>
          </div>
          
          <label>Name *</label>
          <input 
            type="text" 
            name="amenityName" 
            [(ngModel)]="amenityDraft.name" 
            required 
            placeholder="e.g., Swimming Pool" 
          />
          
          <label>Icon (Font Awesome class)</label>
          <input 
            type="text" 
            name="amenityIcon" 
            [(ngModel)]="amenityDraft.icon" 
            placeholder="e.g., fas fa-swimming-pool" 
          />
          <small class="field-hint">Optional: Font Awesome icon class (e.g., "fas fa-swimming-pool", "fas fa-car", "fas fa-dumbbell")</small>
          
          <div class="multi-row">
            <div>
              <label>Priority</label>
              <input 
                type="number" 
                name="amenityPriority" 
                [(ngModel)]="amenityDraft.priority" 
                min="0" 
                placeholder="0"
              />
              <small class="field-hint">Higher priority appears first</small>
            </div>
            <div>
              <label>Status</label>
              <select name="amenityStatus" [(ngModel)]="amenityDraft.is_active">
                <option [ngValue]="true">Active</option>
                <option [ngValue]="false">Hidden</option>
              </select>
            </div>
          </div>
          
          <label>Description</label>
          <textarea 
            name="amenityDescription" 
            [(ngModel)]="amenityDraft.description" 
            rows="3" 
            placeholder="Optional description or note"
          ></textarea>
          
          <div class="form-actions">
            <button class="btn-primary" type="submit" [disabled]="amenitySaving">
              <i class="fas" [class.fa-save]="editingAmenityId" [class.fa-plus]="!editingAmenityId"></i>
              {{ editingAmenityId ? 'Update Amenity' : 'Add Amenity' }}
            </button>
          </div>
        </form>
        
        <div class="table-card">
          <div class="table-toolbar">
            <div class="toolbar-left">
              <i class="fas fa-search"></i>
              <input 
                type="text" 
                placeholder="Search amenities..."
                [(ngModel)]="amenitySearch"
                name="amenitySearch"
                [ngModelOptions]="{standalone: true}"
              >
            </div>
            <span class="table-count">{{ filteredAmenities.length }} results</span>
          </div>
          
          <ng-container *ngIf="filteredAmenities.length; else emptyAmenitiesState">
            <div class="cards-grid">
              <div class="entity-card" *ngFor="let amenity of filteredAmenities">
                <div class="card-head">
                  <div>
                    <p class="card-title">
                      <i *ngIf="amenity.icon" [class]="amenity.icon || 'fas fa-check-circle'"></i>
                      {{ amenity.name }}
                    </p>
                    <p class="card-subtitle">
                      Priority {{ amenity.priority || 0 }}
                      <span *ngIf="amenity.description"> • {{ amenity.description.substring(0, 50) }}{{ amenity.description.length > 50 ? '...' : '' }}</span>
                    </p>
                  </div>
                  <span class="status-pill" [class.inactive]="!amenity.is_active">
                    {{ amenity.is_active ? 'Active' : 'Hidden' }}
                  </span>
                </div>
                <p class="card-body" *ngIf="amenity.description && amenity.description.length > 50">
                  {{ amenity.description }}
                </p>
                <div class="card-actions">
                  <button class="btn-ghost" type="button" (click)="editAmenity(amenity)">
                    <i class="fas fa-edit"></i> Edit
                  </button>
                  <button class="btn-danger" type="button" (click)="deleteAmenity(amenity)">
                    <i class="fas fa-trash"></i> Delete
                  </button>
                </div>
              </div>
            </div>
          </ng-container>
          
          <ng-template #emptyAmenitiesState>
            <p class="empty-state">
              <i class="fas fa-inbox"></i>
              No amenities found. Create one using the form on the left.
            </p>
          </ng-template>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .amenities-shell {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .hero-card {
      background: linear-gradient(120deg, #172554, #1e40af);
      border-radius: 24px;
      padding: 2rem;
      color: #fff;
      box-shadow: 0 20px 45px rgba(15, 23, 42, 0.25);
    }

    .eyebrow {
      text-transform: uppercase;
      letter-spacing: 0.25em;
      font-size: 0.75rem;
      opacity: 0.8;
    }

    .hero-card h1 {
      margin: 0.3rem 0;
      font-size: 2.2rem;
    }

    .hero-card .lead {
      margin: 0;
      opacity: 0.85;
    }

    .insight-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 1rem;
    }

    .insight-card {
      background: #fff;
      border-radius: 18px;
      padding: 1.2rem;
      box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08);
    }

    .insight-card .label {
      margin: 0;
      color: #64748b;
      font-size: 0.85rem;
    }

    .insight-card .value {
      margin: 0.2rem 0;
      font-size: 1.8rem;
      font-weight: 700;
      color: #0f172a;
    }

    .insight-card small {
      color: #94a3b8;
    }

    .panel-grid {
      display: grid;
      grid-template-columns: minmax(320px, 420px) minmax(0, 1fr);
      gap: 1.5rem;
      align-items: flex-start;
    }

    .editor-card, .table-card {
      background: #fff;
      border-radius: 20px;
      padding: 1.5rem;
      box-shadow: 0 15px 40px rgba(15, 23, 42, 0.08);
    }

    .editor-card label {
      display: block;
      font-size: 0.85rem;
      font-weight: 600;
      color: #475569;
      margin-top: 0.9rem;
      margin-bottom: 0.5rem;
    }

    .editor-card input,
    .editor-card textarea,
    .editor-card select {
      width: 100%;
      border-radius: 12px;
      border: 1px solid #d7def7;
      padding: 0.6rem 0.8rem;
      font-size: 0.95rem;
      font-family: inherit;
      transition: all 0.3s ease;
    }

    .editor-card input:focus,
    .editor-card textarea:focus,
    .editor-card select:focus {
      outline: none;
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    }

    .editor-card textarea {
      resize: vertical;
    }

    .field-hint {
      display: block;
      font-size: 0.75rem;
      color: #94a3b8;
      margin-top: 0.25rem;
    }

    .editor-card .editor-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }

    .editor-card h2 {
      margin: 0;
      font-size: 1.25rem;
      color: #1e293b;
    }

    .editor-card .editor-header p {
      margin: 0.25rem 0 0;
      color: #64748b;
      font-size: 0.875rem;
    }

    .btn-text {
      border: none;
      background: transparent;
      color: #2563eb;
      cursor: pointer;
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
      font-weight: 600;
      border-radius: 8px;
      transition: all 0.3s ease;
    }

    .btn-text:hover {
      background: #eff6ff;
    }

    .multi-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 1rem;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      margin-top: 1.25rem;
    }

    .btn-primary {
      background: #2563eb;
      color: #fff;
      border: none;
      border-radius: 12px;
      padding: 0.65rem 1.6rem;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.3s ease;
    }

    .btn-primary:hover:not(:disabled) {
      background: #1d4ed8;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
    }

    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .table-card {
      display: flex;
      flex-direction: column;
      gap: 0.8rem;
    }

    .table-toolbar {
      display: flex;
      justify-content: space-between;
      gap: 1rem;
      flex-wrap: wrap;
      align-items: center;
    }

    .toolbar-left {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex: 1;
      border: 1px solid #d7def7;
      border-radius: 12px;
      padding: 0.4rem 0.8rem;
      min-width: 200px;
    }

    .toolbar-left i {
      color: #64748b;
    }

    .toolbar-left input {
      border: none;
      flex: 1;
      font-size: 0.95rem;
      outline: none;
      background: transparent;
    }

    .table-count {
      font-size: 0.85rem;
      color: #94a3b8;
    }

    .cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 1rem;
    }

    .entity-card {
      border: 1px solid #e2e8f0;
      border-radius: 18px;
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.8rem;
      transition: all 0.3s ease;
    }

    .entity-card:hover {
      border-color: #2563eb;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.1);
      transform: translateY(-2px);
    }

    .card-head {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 1rem;
    }

    .card-title {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 600;
      color: #1e293b;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .card-title i {
      color: #2563eb;
      font-size: 1rem;
    }

    .card-subtitle {
      margin: 0.25rem 0 0;
      font-size: 0.85rem;
      color: #64748b;
    }

    .card-body {
      margin: 0;
      font-size: 0.875rem;
      color: #475569;
      line-height: 1.5;
    }

    .status-pill {
      padding: 0.25rem 0.75rem;
      border-radius: 999px;
      font-size: 0.75rem;
      font-weight: 600;
      background: #d1fae5;
      color: #065f46;
      white-space: nowrap;
    }

    .status-pill.inactive {
      background: #fee2e2;
      color: #991b1b;
    }

    .card-actions {
      display: flex;
      gap: 0.5rem;
      padding-top: 0.5rem;
      border-top: 1px solid #e2e8f0;
    }

    .btn-ghost {
      flex: 1;
      padding: 0.5rem 0.75rem;
      background: transparent;
      border: 1px solid #d7def7;
      border-radius: 8px;
      color: #2563eb;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      font-size: 0.875rem;
    }

    .btn-ghost:hover {
      background: #eff6ff;
      border-color: #2563eb;
    }

    .btn-danger {
      flex: 1;
      padding: 0.5rem 0.75rem;
      background: transparent;
      border: 1px solid #fee2e2;
      border-radius: 8px;
      color: #dc2626;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      font-size: 0.875rem;
    }

    .btn-danger:hover {
      background: #fef2f2;
      border-color: #dc2626;
    }

    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      color: #94a3b8;
    }

    .empty-state i {
      font-size: 3rem;
      margin-bottom: 1rem;
      opacity: 0.5;
    }

    @media (max-width: 1024px) {
      .panel-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AmenitiesManagementComponent implements OnInit {
  amenities: Amenity[] = [];
  amenityDraft: Partial<Amenity> = this.defaultAmenity();
  editingAmenityId: number | null = null;
  amenitySaving = false;
  amenitySearch = '';

  constructor(
    private propertyService: PropertyService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadAmenities();
  }

  loadAmenities(): void {
    this.propertyService.getAdminAmenities().subscribe({
      next: (amenities) => {
        this.amenities = amenities;
      },
      error: (error) => {
        console.error('Error loading amenities:', error);
        this.toastr.error('Failed to load amenities', 'Error');
      }
    });
  }

  get filteredAmenities(): Amenity[] {
    const term = this.amenitySearch.trim().toLowerCase();
    if (!term) {
      return this.amenities;
    }
    return this.amenities.filter(amenity =>
      amenity.name.toLowerCase().includes(term) ||
      (amenity.description && amenity.description.toLowerCase().includes(term)) ||
      (amenity.icon && amenity.icon.toLowerCase().includes(term))
    );
  }

  get activeAmenities(): number {
    return this.amenities.filter(amenity => amenity.is_active !== false).length;
  }

  saveAmenity(): void {
    if (!this.amenityDraft.name || !this.amenityDraft.name.trim()) {
      this.toastr.warning('Please enter an amenity name', 'Validation Error');
      return;
    }

    this.amenitySaving = true;
    const payload = { ...this.amenityDraft };
    
    const request = this.editingAmenityId
      ? this.propertyService.updateAmenity(this.editingAmenityId, payload)
      : this.propertyService.createAmenity(payload);

    request.subscribe({
      next: () => {
        this.toastr.success(
          `Amenity ${this.editingAmenityId ? 'updated' : 'created'} successfully`,
          'Success'
        );
        this.resetAmenityForm();
        this.loadAmenities();
      },
      error: (error) => {
        console.error('Error saving amenity:', error);
        const errorMessage = this.extractErrorMessage(error);
        this.toastr.error(errorMessage || 'Failed to save amenity', 'Error');
      },
      complete: () => {
        this.amenitySaving = false;
      }
    });
  }

  editAmenity(amenity: Amenity): void {
    this.editingAmenityId = amenity.id!;
    this.amenityDraft = { ...amenity };
  }

  deleteAmenity(amenity: Amenity): void {
    if (!confirm(`Are you sure you want to delete "${amenity.name}"? This action cannot be undone.`)) {
      return;
    }

    this.propertyService.deleteAmenity(amenity.id!).subscribe({
      next: () => {
        this.toastr.success('Amenity deleted successfully', 'Success');
        this.loadAmenities();
        // Reset form if the deleted amenity was being edited
        if (this.editingAmenityId === amenity.id) {
          this.resetAmenityForm();
        }
      },
      error: (error) => {
        console.error('Error deleting amenity:', error);
        this.toastr.error('Failed to delete amenity', 'Error');
      }
    });
  }

  resetAmenityForm(): void {
    this.amenityDraft = this.defaultAmenity();
    this.editingAmenityId = null;
  }

  private defaultAmenity(): Partial<Amenity> {
    return {
      name: '',
      description: '',
      icon: '',
      priority: 0,
      is_active: true
    };
  }

  private extractErrorMessage(error: any): string | null {
    if (!error) return null;
    if (error.error) {
      if (typeof error.error === 'string') {
        return error.error;
      }
      if (typeof error.error === 'object') {
        const firstKey = Object.keys(error.error)[0];
        const value = error.error[firstKey];
        if (Array.isArray(value)) {
          return value[0];
        }
        if (typeof value === 'string') {
          return value;
        }
      }
    }
    if (error.message) {
      return error.message;
    }
    return null;
  }
}

