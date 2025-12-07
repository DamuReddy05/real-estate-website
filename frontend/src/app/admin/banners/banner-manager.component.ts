import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { PropertyService } from '../../core/services/property.service';
import { Banner } from '../../core/models/property.model';
import { NgxSpinnerService } from 'ngx-spinner';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-banner-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="banner-shell">
      <header class="hero-card">
        <div>
          <p class="eyebrow">Marketing & Advertising</p>
          <h1>Banner Management</h1>
          <p class="lead">Upload and manage promotional banners for main page, buy section, and rent section.</p>
        </div>
      </header>

      <div class="insight-grid">
        <div class="insight-card">
          <p class="label">Main Banners</p>
          <p class="value">{{ getBannerCount('main_banner') }}</p>
          <small>{{ getActiveBannerCount('main_banner') }} active</small>
        </div>
        <div class="insight-card">
          <p class="label">Buy Banners</p>
          <p class="value">{{ getBannerCount('buy_banner') }}</p>
          <small>{{ getActiveBannerCount('buy_banner') }} active</small>
        </div>
        <div class="insight-card">
          <p class="label">Rent Banners</p>
          <p class="value">{{ getBannerCount('rent_banner') }}</p>
          <small>{{ getActiveBannerCount('rent_banner') }} active</small>
        </div>
      </div>

      <section class="panel-grid">
        <form class="editor-card" (ngSubmit)="saveBanner()" #bannerForm="ngForm">
          <div class="editor-header">
            <div>
              <h2>{{ editingBannerId ? 'Edit Banner' : 'Create Banner' }}</h2>
              <p>Upload banner images to display on the website.</p>
            </div>
            <button type="button" class="btn-text" *ngIf="editingBannerId" (click)="resetBannerForm()">Cancel edit</button>
          </div>

          <label>Name *</label>
          <input type="text" name="bannerName" [(ngModel)]="bannerDraft.name" required placeholder="Internal name for this banner" />

          <label>Banner Type *</label>
          <select name="bannerType" [(ngModel)]="bannerDraft.banner_type" required>
            <option value="">Select banner type</option>
            <option value="main_banner">Main Banner</option>
            <option value="buy_banner">Buy Banner</option>
            <option value="rent_banner">Rent Banner</option>
          </select>

          <label>Banner Image</label>
          <div class="image-upload-area" *ngIf="!bannerDraft.image_url">
            <input type="file" #fileInput (change)="onImageSelected($event)" accept="image/*" style="display: none" />
            <div class="upload-zone" (click)="fileInput.click()" [class.has-image]="bannerPreview">
              <img *ngIf="bannerPreview" [src]="bannerPreview" alt="Banner preview" />
              <div *ngIf="!bannerPreview" class="upload-placeholder">
                <i class="fas fa-cloud-upload-alt"></i>
                <p>Click to upload banner image</p>
                <small>Recommended: 1200x400px</small>
              </div>
            </div>
          </div>

          <label>OR Image URL</label>
          <input type="url" name="imageUrl" [(ngModel)]="bannerDraft.image_url" placeholder="https://example.com/banner.jpg" />

          <label>Link URL</label>
          <input type="url" name="linkUrl" [(ngModel)]="bannerDraft.link_url" placeholder="URL to navigate when clicked" />

          <label>Title (Optional)</label>
          <input type="text" name="bannerTitle" [(ngModel)]="bannerDraft.title" placeholder="Banner title/heading" />

          <label>Description (Optional)</label>
          <textarea name="bannerDescription" [(ngModel)]="bannerDraft.description" rows="2" placeholder="Banner description"></textarea>

          <div class="multi-row">
            <div>
              <label>Priority</label>
              <input type="number" name="bannerPriority" [(ngModel)]="bannerDraft.priority" min="0" />
            </div>
            <div>
              <label>Status</label>
              <select name="bannerStatus" [(ngModel)]="bannerDraft.is_active">
                <option [ngValue]="true">Active</option>
                <option [ngValue]="false">Inactive</option>
              </select>
            </div>
          </div>

          <label>Start Date (Optional)</label>
          <input type="datetime-local" name="startDate" [(ngModel)]="bannerDraft.start_date" />

          <label>End Date (Optional)</label>
          <input type="datetime-local" name="endDate" [(ngModel)]="bannerDraft.end_date" />

          <div class="form-actions">
            <button class="btn-primary" type="submit" [disabled]="bannerSaving || !bannerDraft.name?.trim() || !bannerDraft.banner_type">
              {{ editingBannerId ? 'Update Banner' : 'Create Banner' }}
            </button>
          </div>
        </form>

        <div class="table-card">
          <div class="table-toolbar">
            <div class="toolbar-left">
              <i class="fas fa-search"></i>
              <input type="text" placeholder="Search banners..." [(ngModel)]="bannerSearch" name="bannerSearch" [ngModelOptions]="{standalone: true}">
            </div>
            <div class="toolbar-right">
              <select [(ngModel)]="bannerTypeFilter" name="bannerTypeFilter" [ngModelOptions]="{standalone: true}">
                <option value="">All Types</option>
                <option value="main_banner">Main Banner</option>
                <option value="buy_banner">Buy Banner</option>
                <option value="rent_banner">Rent Banner</option>
              </select>
            </div>
          </div>

          <div class="cards-grid" *ngIf="filteredBanners.length; else emptyBanners">
            <div class="entity-card banner-card" *ngFor="let banner of filteredBanners">
              <div class="banner-image-preview">
                <img [src]="banner.image_source || '/assets/placeholder-banner.jpg'" [alt]="banner.name" *ngIf="banner.image_source" />
                <div class="no-image" *ngIf="!banner.image_source">
                  <i class="fas fa-image"></i>
                  <p>No image</p>
                </div>
              </div>
              <div class="card-head">
                <div>
                  <p class="card-title">{{ banner.name }}</p>
                  <p class="card-subtitle">{{ getBannerTypeLabel(banner.banner_type) }} • Priority {{ banner.priority || 0 }}</p>
                </div>
                <span class="status-pill" [class.inactive]="!banner.is_active">
                  {{ banner.is_active ? 'Active' : 'Inactive' }}
                </span>
              </div>
              <p class="card-body" *ngIf="banner.title">{{ banner.title }}</p>
              <div class="card-actions">
                <button class="btn-ghost" type="button" (click)="editBanner(banner)">Edit</button>
                <button class="btn-danger" type="button" (click)="deleteBanner(banner)">Delete</button>
              </div>
            </div>
          </div>
          <ng-template #emptyBanners>
            <p class="empty-state">No banners found. Create one using the form on the left.</p>
          </ng-template>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .banner-shell {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      padding: 2rem;
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
      font-size: 0.85rem;
      color: #475569;
      margin-top: 0.9rem;
      display: block;
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
      margin-top: 0.25rem;
    }
    .editor-card textarea {
      resize: vertical;
    }
    .editor-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 0.5rem;
      margin-bottom: 1rem;
    }
    .editor-card h2 {
      margin: 0;
      font-size: 1.25rem;
    }
    .btn-text {
      border: none;
      background: transparent;
      color: #2563eb;
      cursor: pointer;
      padding: 0;
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
    }
    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .image-upload-area {
      margin-top: 0.25rem;
    }
    .upload-zone {
      border: 2px dashed #d7def7;
      border-radius: 12px;
      padding: 2rem;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s ease;
      background: #f8fafc;
    }
    .upload-zone:hover {
      border-color: #2563eb;
      background: #eff6ff;
    }
    .upload-zone.has-image {
      padding: 0;
      border: none;
      overflow: hidden;
    }
    .upload-zone.has-image img {
      width: 100%;
      height: auto;
      display: block;
    }
    .upload-placeholder i {
      font-size: 3rem;
      color: #94a3b8;
      margin-bottom: 0.5rem;
    }
    .upload-placeholder p {
      margin: 0.5rem 0 0.25rem;
      color: #64748b;
      font-weight: 600;
    }
    .upload-placeholder small {
      color: #94a3b8;
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
    }
    .toolbar-left input {
      border: none;
      flex: 1;
      font-size: 0.95rem;
      outline: none;
    }
    .toolbar-right select {
      border-radius: 999px;
      border: 1px solid #d7def7;
      padding: 0.4rem 0.9rem;
    }
    .cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1rem;
    }
    .entity-card {
      border: 1px solid #e2e8f0;
      border-radius: 18px;
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.8rem;
    }
    .banner-card {
      min-height: auto;
    }
    .banner-image-preview {
      width: 100%;
      height: 150px;
      border-radius: 12px;
      overflow: hidden;
      background: #f1f5f9;
    }
    .banner-image-preview img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .no-image {
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      color: #94a3b8;
    }
    .no-image i {
      font-size: 2rem;
      margin-bottom: 0.5rem;
    }
    .card-head {
      display: flex;
      justify-content: space-between;
      gap: 0.75rem;
    }
    .card-title {
      margin: 0;
      font-weight: 600;
      color: #0f172a;
    }
    .card-subtitle {
      margin: 0.2rem 0 0;
      color: #94a3b8;
      font-size: 0.85rem;
    }
    .card-body {
      margin: 0;
      color: #475569;
      font-size: 0.9rem;
    }
    .card-actions {
      display: flex;
      gap: 0.4rem;
      justify-content: flex-end;
    }
    .btn-ghost,
    .btn-danger {
      border: none;
      background: transparent;
      cursor: pointer;
      padding: 0.3rem 0.6rem;
      border-radius: 8px;
      font-weight: 600;
    }
    .btn-ghost {
      color: #2563eb;
    }
    .btn-danger {
      color: #dc2626;
    }
    .status-pill {
      display: inline-flex;
      align-items: center;
      border-radius: 999px;
      padding: 0.15rem 0.8rem;
      font-size: 0.78rem;
      font-weight: 600;
      color: #0f172a;
      background: #dcfce7;
    }
    .status-pill.inactive {
      background: #fee2e2;
      color: #b91c1c;
    }
    .empty-state {
      text-align: center;
      color: #94a3b8;
      padding: 2rem 1rem;
    }
    @media (max-width: 1024px) {
      .panel-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class BannerManagerComponent implements OnInit {
  banners: Banner[] = [];
  bannerDraft: Partial<Banner> = this.defaultBanner();
  editingBannerId: number | null = null;
  bannerSaving = false;
  bannerSearch = '';
  bannerTypeFilter = '';
  bannerPreview: string | null = null;
  selectedImageFile: File | null = null;

  constructor(
    private propertyService: PropertyService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private apiService: ApiService
  ) {}

  ngOnInit(): void {
    this.loadBanners();
  }

  loadBanners(): void {
    this.propertyService.getAdminBanners().subscribe({
      next: (banners) => this.banners = banners,
      error: () => this.toastr.error('Failed to load banners')
    });
  }

  get filteredBanners(): Banner[] {
    let filtered = [...this.banners];
    if (this.bannerSearch.trim()) {
      const query = this.bannerSearch.toLowerCase();
      filtered = filtered.filter(b => 
        b.name.toLowerCase().includes(query) ||
        (b.title || '').toLowerCase().includes(query)
      );
    }
    if (this.bannerTypeFilter) {
      filtered = filtered.filter(b => b.banner_type === this.bannerTypeFilter);
    }
    return filtered.sort((a, b) => (b.priority || 0) - (a.priority || 0));
  }

  getBannerCount(type: string): number {
    return this.banners.filter(b => b.banner_type === type).length;
  }

  getActiveBannerCount(type: string): number {
    return this.banners.filter(b => b.banner_type === type && b.is_active).length;
  }

  getBannerTypeLabel(type: string): string {
    const labels: any = {
      'main_banner': 'Main Banner',
      'buy_banner': 'Buy Banner',
      'rent_banner': 'Rent Banner'
    };
    return labels[type] || type;
  }

  onImageSelected(event: any): void {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      this.toastr.error('Image size must be less than 5MB');
      return;
    }

    this.selectedImageFile = file;
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.bannerPreview = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  saveBanner(): void {
    if (!this.bannerDraft.name?.trim() || !this.bannerDraft.banner_type) return;
    
    this.bannerSaving = true;
    this.spinner.show();

    // If there's an image file, use FormData; otherwise use JSON
    const imageFile = this.selectedImageFile;
    const hasImageFile = imageFile && !this.bannerDraft.image_url;
    
    if (hasImageFile && imageFile) {
      // Use FormData for file upload
      const formData = new FormData();
      formData.append('name', this.bannerDraft.name);
      formData.append('banner_type', this.bannerDraft.banner_type);
      formData.append('image', imageFile);
      
      if (this.bannerDraft.link_url) formData.append('link_url', this.bannerDraft.link_url);
      if (this.bannerDraft.title) formData.append('title', this.bannerDraft.title);
      if (this.bannerDraft.description) formData.append('description', this.bannerDraft.description);
      formData.append('is_active', String(this.bannerDraft.is_active !== false));
      formData.append('priority', String(this.bannerDraft.priority || 0));
      if (this.bannerDraft.start_date) formData.append('start_date', this.bannerDraft.start_date);
      if (this.bannerDraft.end_date) formData.append('end_date', this.bannerDraft.end_date);

      const request = this.editingBannerId
        ? this.propertyService.updateBannerWithFormData(this.editingBannerId, formData)
        : this.propertyService.createBannerWithFormData(formData);

      request.subscribe({
        next: (banner) => {
          this.toastr.success(`Banner ${this.editingBannerId ? 'updated' : 'created'} successfully`);
          this.resetBannerForm();
          this.loadBanners();
          this.spinner.hide();
          this.bannerSaving = false;
        },
        error: (error) => {
          this.toastr.error(this.extractErrorMessage(error) || 'Failed to save banner');
          this.bannerSaving = false;
          this.spinner.hide();
        }
      });
    } else {
      // Use JSON payload when no image file
      const payload: any = {
        name: this.bannerDraft.name,
        banner_type: this.bannerDraft.banner_type,
        link_url: this.bannerDraft.link_url || null,
        title: this.bannerDraft.title || null,
        description: this.bannerDraft.description || null,
        is_active: this.bannerDraft.is_active !== false,
        priority: this.bannerDraft.priority || 0,
        start_date: this.bannerDraft.start_date || null,
        end_date: this.bannerDraft.end_date || null,
        image_url: this.bannerDraft.image_url || null
      };

      const request = this.editingBannerId
        ? this.propertyService.updateBanner(this.editingBannerId, payload)
        : this.propertyService.createBanner(payload);

      request.subscribe({
        next: (banner) => {
          this.toastr.success(`Banner ${this.editingBannerId ? 'updated' : 'created'} successfully`);
          this.resetBannerForm();
          this.loadBanners();
          this.spinner.hide();
          this.bannerSaving = false;
        },
        error: (error) => {
          this.toastr.error(this.extractErrorMessage(error) || 'Failed to save banner');
          this.bannerSaving = false;
          this.spinner.hide();
        }
      });
    }
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

  editBanner(banner: Banner): void {
    this.editingBannerId = banner.id;
    this.bannerDraft = {
      name: banner.name,
      banner_type: banner.banner_type,
      image_url: banner.image_url,
      link_url: banner.link_url || '',
      title: banner.title || '',
      description: banner.description || '',
      is_active: banner.is_active,
      priority: banner.priority || 0,
      start_date: banner.start_date || '',
      end_date: banner.end_date || ''
    };
    this.bannerPreview = banner.image_source || null;
    this.selectedImageFile = null;
  }

  deleteBanner(banner: Banner): void {
    if (!confirm(`Delete banner "${banner.name}"?`)) return;
    this.propertyService.deleteBanner(banner.id).subscribe({
      next: () => {
        this.toastr.success('Banner deleted');
        this.loadBanners();
      },
      error: () => this.toastr.error('Failed to delete banner')
    });
  }

  resetBannerForm(): void {
    this.bannerDraft = this.defaultBanner();
    this.editingBannerId = null;
    this.bannerPreview = null;
    this.selectedImageFile = null;
  }

  private defaultBanner(): Partial<Banner> {
    return {
      name: '',
      banner_type: '' as any,
      is_active: true,
      priority: 0
    };
  }
}


