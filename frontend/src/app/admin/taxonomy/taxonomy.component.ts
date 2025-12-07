import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { PropertyService } from '../../core/services/property.service';
import { Tag, CategoryOption, SubCategoryOption, Amenity } from '../../core/models/property.model';

@Component({
  selector: 'app-taxonomy',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="taxonomy-shell">
      <header class="hero-card">
        <div>
          <p class="eyebrow">Inventory Controls</p>
          <h1>Tags, Categories & Sub-categories</h1>
          <p class="lead">Keep your taxonomy clean so that listings stay consistent across the website and mobile apps.</p>
        </div>
      </header>

      <div class="insight-grid">
        <div class="insight-card">
          <p class="label">Total Tags</p>
          <p class="value">{{ tags.length }}</p>
          <small>{{ activeTags }} active</small>
        </div>
        <div class="insight-card">
          <p class="label">Categories</p>
          <p class="value">{{ categories.length }}</p>
          <small>{{ activeCategories }} active</small>
        </div>
        <div class="insight-card">
          <p class="label">Sub Categories</p>
          <p class="value">{{ subcategoryList.length }}</p>
          <small>{{ activeSubcategories }} active</small>
        </div>
        <div class="insight-card">
          <p class="label">Amenities</p>
          <p class="value">{{ amenities.length }}</p>
          <small>{{ activeAmenities }} active</small>
        </div>
      </div>

      <div class="panel-switcher stacked">
        <button type="button" class="pill" [class.active]="activePanel === 'tags'" (click)="switchPanel('tags')">
          <i class="fas fa-tags"></i>
          <div>
            <span>Tags</span>
            <small>{{ tags.length }} total • {{ activeTags }} active</small>
          </div>
        </button>
        <button type="button" class="pill" [class.active]="activePanel === 'categories'" (click)="switchPanel('categories')">
          <i class="fas fa-layer-group"></i>
          <div>
            <span>Categories</span>
            <small>{{ categories.length }} total • {{ activeCategories }} active</small>
          </div>
        </button>
        <button type="button" class="pill" [class.active]="activePanel === 'subcategories'" (click)="switchPanel('subcategories')">
          <i class="fas fa-sitemap"></i>
          <div>
            <span>Sub Categories</span>
            <small>{{ subcategoryList.length }} total • {{ activeSubcategories }} active</small>
          </div>
        </button>
        <button type="button" class="pill" [class.active]="activePanel === 'amenities'" (click)="switchPanel('amenities')">
          <i class="fas fa-star"></i>
          <div>
            <span>Amenities</span>
            <small>{{ amenities.length }} total • {{ activeAmenities }} active</small>
          </div>
        </button>
      </div>

      <!-- TAGS PANEL -->
      <section class="panel-grid" [hidden]="activePanel !== 'tags'" id="tags-panel">
        <form class="editor-card" (ngSubmit)="saveTag()" #tagForm="ngForm">
          <div class="editor-header">
            <div>
              <h2>{{ editingTagId ? 'Edit Tag' : 'Create Tag' }}</h2>
              <p>Labels like RERA, HMDA, Zero Brokerage, etc.</p>
            </div>
            <button type="button" class="btn-text" (click)="resetTagForm()" *ngIf="editingTagId">Cancel edit</button>
          </div>
          <label>Name *</label>
          <input type="text" name="tagName" [(ngModel)]="tagDraft.name" required placeholder="e.g., HMDA Approved" />

          <label>Description</label>
          <textarea name="tagDescription" [(ngModel)]="tagDraft.description" rows="2" placeholder="Visible tooltip or note"></textarea>

          <label>Status</label>
          <select name="tagStatus" [(ngModel)]="tagDraft.is_active">
            <option [ngValue]="true">Active</option>
            <option [ngValue]="false">Hidden</option>
          </select>

            <div class="form-actions">
              <button class="btn-primary" type="submit" [disabled]="tagSaving">
              {{ editingTagId ? 'Update Tag' : 'Add Tag' }}
            </button>
          </div>
        </form>

          <div class="table-card">
          <div class="table-toolbar">
            <div class="toolbar-left">
              <i class="fas fa-search"></i>
                <input type="text" placeholder="Search tags..."
                  [(ngModel)]="tagSearch"
                  name="tagSearch"
                  [ngModelOptions]="{standalone: true}">
            </div>
            <span class="table-count">{{ filteredTags.length }} results</span>
          </div>

          <ng-container *ngIf="filteredTags.length; else emptyTagsState">
            <div class="cards-grid">
              <div class="entity-card" *ngFor="let tag of filteredTags">
                <div class="card-head">
                  <div>
                    <p class="card-title">{{ tag.name }}</p>
                    <p class="card-subtitle">{{ tag.description || 'No description' }}</p>
                  </div>
                  <span class="status-pill" [class.inactive]="!tag.is_active">
                    {{ tag.is_active ? 'Active' : 'Hidden' }}
                  </span>
                </div>
                <div class="card-actions">
                  <button class="btn-ghost" type="button" (click)="editTag(tag)">Edit</button>
                  <button class="btn-danger" type="button" (click)="deleteTag(tag)">Delete</button>
                </div>
              </div>
            </div>
          </ng-container>
          <ng-template #emptyTagsState>
            <p class="empty-state">No tags found. Create one using the form on the left.</p>
          </ng-template>
        </div>
      </section>

      <!-- CATEGORIES PANEL -->
      <section class="panel-grid" [hidden]="activePanel !== 'categories'" id="categories-panel">
        <form class="editor-card" (ngSubmit)="saveCategory()" #categoryForm="ngForm">
          <div class="editor-header">
            <div>
              <h2>{{ editingCategoryId ? 'Edit Category' : 'Create Category' }}</h2>
              <p>Primary groupings such as Apartments, Villas, Commercial, etc.</p>
            </div>
            <button type="button" class="btn-text" (click)="resetCategoryForm()" *ngIf="editingCategoryId">Cancel edit</button>
          </div>

          <label>Name *</label>
          <input type="text" name="categoryName" [(ngModel)]="categoryDraft.name" required placeholder="e.g., Luxury Apartments" />

          <div class="multi-row">
            <div>
              <label>Priority</label>
              <input type="number" name="categoryPriority" [(ngModel)]="categoryDraft.priority" min="0" />
            </div>
            <div>
              <label>Status</label>
              <select name="categoryStatus" [(ngModel)]="categoryDraft.is_active">
                <option [ngValue]="true">Active</option>
                <option [ngValue]="false">Hidden</option>
              </select>
            </div>
          </div>

          <label>Description</label>
          <textarea name="categoryDescription" [(ngModel)]="categoryDraft.description" rows="2" placeholder="Optional note for admins"></textarea>

          <div class="form-actions">
            <button class="btn-primary" type="submit" [disabled]="categorySaving">
              {{ editingCategoryId ? 'Update Category' : 'Add Category' }}
            </button>
          </div>
        </form>

        <div class="table-card">
          <div class="table-toolbar">
            <div class="toolbar-left">
              <i class="fas fa-search"></i>
              <input type="text" placeholder="Search categories..."
                [(ngModel)]="categorySearch"
                name="categorySearch"
                [ngModelOptions]="{standalone: true}">
            </div>
            <span class="table-count">{{ filteredCategories.length }} results</span>
          </div>

          <ng-container *ngIf="filteredCategories.length; else emptyCategoriesState">
            <div class="cards-grid">
              <div class="entity-card" *ngFor="let category of filteredCategories">
                <div class="card-head">
                  <div>
                    <p class="card-title">{{ category.name }}</p>
                    <p class="card-subtitle">
                      Priority {{ category.priority || 0 }} • {{ category.subcategories?.length || 0 }} sub categories
                    </p>
                  </div>
                  <span class="status-pill" [class.inactive]="!category.is_active">
                    {{ category.is_active ? 'Active' : 'Hidden' }}
                  </span>
                </div>
                <p class="card-body">{{ category.description || 'No description provided.' }}</p>
                <div class="chip-row" *ngIf="category.subcategories?.length">
                  <span class="chip" *ngFor="let sub of category.subcategories">{{ sub.name }}</span>
                </div>
                <div class="card-actions">
                  <button class="btn-ghost" type="button" (click)="editCategory(category)">Edit</button>
                  <button class="btn-danger" type="button" (click)="deleteCategory(category)">Delete</button>
                </div>
              </div>
            </div>
          </ng-container>
          <ng-template #emptyCategoriesState>
            <p class="empty-state">No categories found.</p>
          </ng-template>
        </div>
      </section>

      <!-- SUB CATEGORIES PANEL -->
      <section class="panel-grid" [hidden]="activePanel !== 'subcategories'" id="subcategories-panel">
        <form class="editor-card" (ngSubmit)="saveSubcategory()" #subcategoryForm="ngForm">
          <div class="editor-header">
            <div>
              <h2>{{ editingSubcategoryId ? 'Edit Sub Category' : 'Create Sub Category' }}</h2>
              <p>Attach finer buckets like “2 BHK”, “Ready to Move”, “Penthouse”.</p>
            </div>
            <button type="button" class="btn-text" (click)="resetSubcategoryForm()" *ngIf="editingSubcategoryId">Cancel edit</button>
          </div>

          <label>Parent Category *</label>
          <select name="subcategoryCategory" [(ngModel)]="subcategoryDraft.category" required>
            <option [ngValue]="undefined">Select category</option>
            <option *ngFor="let cat of categories" [ngValue]="cat.id">{{ cat.name }}</option>
          </select>

          <label>Name *</label>
          <input type="text" name="subcategoryName" [(ngModel)]="subcategoryDraft.name" required placeholder="e.g., Ready to Move" />

          <div class="multi-row">
            <div>
              <label>Priority</label>
              <input type="number" name="subcategoryPriority" [(ngModel)]="subcategoryDraft.priority" min="0" />
            </div>
            <div>
              <label>Status</label>
              <select name="subcategoryStatus" [(ngModel)]="subcategoryDraft.is_active">
                <option [ngValue]="true">Active</option>
                <option [ngValue]="false">Hidden</option>
              </select>
            </div>
          </div>

          <label>Description</label>
          <input type="text" name="subcategoryDescription" [(ngModel)]="subcategoryDraft.description" placeholder="Optional" />

          <div class="form-actions">
            <button class="btn-primary" type="submit" [disabled]="subcategorySaving">
              {{ editingSubcategoryId ? 'Update Sub Category' : 'Add Sub Category' }}
            </button>
          </div>
        </form>

        <div class="table-card">
          <div class="table-toolbar">
            <div class="toolbar-left">
              <i class="fas fa-search"></i>
              <input type="text" placeholder="Search sub categories..."
                [(ngModel)]="subcategorySearch"
                name="subcategorySearch"
                [ngModelOptions]="{standalone: true}">
            </div>
            <div class="toolbar-right">
              <select [(ngModel)]="subcategoryCategoryFilter"
                name="subcategoryFilter"
                [ngModelOptions]="{standalone: true}">
                <option [ngValue]="'all'">All categories</option>
                <option *ngFor="let cat of categories" [ngValue]="cat.id">{{ cat.name }}</option>
              </select>
            </div>
          </div>

          <ng-container *ngIf="filteredSubcategories.length; else emptySubcategoriesState">
            <div class="cards-grid">
              <div class="entity-card" *ngFor="let sub of filteredSubcategories">
                <div class="card-head">
                  <div>
                    <p class="card-title">{{ sub.name }}</p>
                    <p class="card-subtitle">{{ getCategoryName(sub.category) }} • Priority {{ sub.priority || 0 }}</p>
                  </div>
                  <span class="status-pill" [class.inactive]="!sub.is_active">
                    {{ sub.is_active ? 'Active' : 'Hidden' }}
                  </span>
                </div>
                <p class="card-body">{{ sub.description || 'No description provided.' }}</p>
                <div class="card-actions">
                  <button class="btn-ghost" type="button" (click)="editSubcategory(sub)">Edit</button>
                  <button class="btn-danger" type="button" (click)="deleteSubcategory(sub)">Delete</button>
                </div>
              </div>
            </div>
          </ng-container>
          <ng-template #emptySubcategoriesState>
            <p class="empty-state">No sub categories found.</p>
          </ng-template>
        </div>
      </section>

      <!-- AMENITIES PANEL -->
      <section class="panel-grid" [hidden]="activePanel !== 'amenities'" id="amenities-panel">
        <form class="editor-card" (ngSubmit)="saveAmenity()" #amenityForm="ngForm">
          <div class="editor-header">
            <div>
              <h2>{{ editingAmenityId ? 'Edit Amenity' : 'Create Amenity' }}</h2>
              <p>Property features like Parking, Gym, Pool, etc.</p>
            </div>
            <button type="button" class="btn-text" (click)="resetAmenityForm()" *ngIf="editingAmenityId">Cancel edit</button>
          </div>
          <label>Name *</label>
          <input type="text" name="amenityName" [(ngModel)]="amenityDraft.name" required placeholder="e.g., Swimming Pool" />
          
          <label>Icon (Font Awesome class)</label>
          <input type="text" name="amenityIcon" [(ngModel)]="amenityDraft.icon" placeholder="e.g., fa-swimming-pool" />
          
          <div class="multi-row">
            <div>
              <label>Priority</label>
              <input type="number" name="amenityPriority" [(ngModel)]="amenityDraft.priority" min="0" />
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
          <textarea name="amenityDescription" [(ngModel)]="amenityDraft.description" rows="2" placeholder="Optional description"></textarea>
          
          <div class="form-actions">
            <button class="btn-primary" type="submit" [disabled]="amenitySaving">
              {{ editingAmenityId ? 'Update Amenity' : 'Add Amenity' }}
            </button>
          </div>
        </form>
        
        <div class="table-card">
          <div class="table-toolbar">
            <div class="toolbar-left">
              <i class="fas fa-search"></i>
              <input type="text" placeholder="Search amenities..."
                [(ngModel)]="amenitySearch"
                name="amenitySearch"
                [ngModelOptions]="{standalone: true}">
            </div>
            <span class="table-count">{{ filteredAmenities.length }} results</span>
          </div>
          
          <ng-container *ngIf="filteredAmenities.length; else emptyAmenitiesState">
            <div class="cards-grid">
              <div class="entity-card" *ngFor="let amenity of filteredAmenities">
                <div class="card-head">
                  <div>
                    <p class="card-title">
                      <i [class]="amenity.icon || 'fas fa-check-circle'" *ngIf="amenity.icon"></i>
                      {{ amenity.name }}
                    </p>
                    <p class="card-subtitle">Priority {{ amenity.priority || 0 }}</p>
                  </div>
                  <span class="status-pill" [class.inactive]="!amenity.is_active">
                    {{ amenity.is_active ? 'Active' : 'Hidden' }}
                  </span>
                </div>
                <p class="card-body">{{ amenity.description || 'No description provided.' }}</p>
                <div class="card-actions">
                  <button class="btn-ghost" type="button" (click)="editAmenity(amenity)">Edit</button>
                  <button class="btn-danger" type="button" (click)="deleteAmenity(amenity)">Delete</button>
                </div>
              </div>
            </div>
          </ng-container>
          <ng-template #emptyAmenitiesState>
            <p class="empty-state">No amenities found. Create one using the form on the left.</p>
          </ng-template>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .taxonomy-shell {
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
    .panel-switcher.stacked {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }
    .panel-switcher .pill {
      border: none;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      background: #fff;
      border-radius: 16px;
      border: 1px solid #e2e8f0;
      padding: 0.9rem 1.2rem;
      box-shadow: 0 10px 25px rgba(15, 23, 42, 0.05);
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .panel-switcher .pill i {
      font-size: 1.2rem;
      color: #2563eb;
    }
    .panel-switcher .pill span {
      display: block;
      font-weight: 600;
      color: #0f172a;
    }
    .panel-switcher .pill.active {
      border-color: #2563eb;
      box-shadow: 0 10px 25px rgba(37, 99, 235, 0.2);
    }
    .panel-switcher .pill small {
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
    }
    .editor-card textarea {
      resize: vertical;
    }
    .editor-card .editor-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 0.5rem;
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
    .table-count {
      font-size: 0.85rem;
      color: #94a3b8;
    }
    .cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 1rem;
    }
    .entity-card {
      border: 1px solid #e2e8f0;
      border-radius: 18px;
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.8rem;
      min-height: 160px;
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
      .table-head,
      .table-row {
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
      }
    }
    @media (max-width: 768px) {
      .taxonomy-shell {
        padding: 1.25rem;
      }
      .panel-switcher {
        flex-direction: column;
      }
      .row-actions {
        justify-content: flex-start;
      }
    }
  `]
})
export class TaxonomyComponent implements OnInit {
  tags: Tag[] = [];
  categories: CategoryOption[] = [];
  subcategoryList: SubCategoryOption[] = [];
  amenities: Amenity[] = [];

  tagDraft: Partial<Tag> = this.defaultTag();
  categoryDraft: Partial<CategoryOption> = this.defaultCategory();
  subcategoryDraft: Partial<SubCategoryOption> = this.defaultSubcategory();
  amenityDraft: Partial<Amenity> = this.defaultAmenity();

  editingTagId: number | null = null;
  editingCategoryId: number | null = null;
  editingSubcategoryId: number | null = null;
  editingAmenityId: number | null = null;

  tagSaving = false;
  categorySaving = false;
  subcategorySaving = false;
  amenitySaving = false;

  activePanel: 'tags' | 'categories' | 'subcategories' | 'amenities' = 'tags';
  tagSearch = '';
  categorySearch = '';
  subcategorySearch = '';
  amenitySearch = '';
  subcategoryCategoryFilter: number | 'all' = 'all';

  constructor(
    private propertyService: PropertyService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.loadTags();
    this.loadCategories();
    this.loadSubcategories();
    this.loadAmenities();
  }

  loadTags(): void {
    this.propertyService.getAdminTags().subscribe({
      next: (tags) => this.tags = tags,
      error: () => this.toastr.error('Failed to load tags')
    });
  }

  loadCategories(): void {
    this.propertyService.getAdminCategories().subscribe({
      next: (categories) => this.categories = categories,
      error: () => this.toastr.error('Failed to load categories')
    });
  }

  loadSubcategories(): void {
    this.propertyService.getAdminSubcategories().subscribe({
      next: (subs) => this.subcategoryList = subs,
      error: () => this.toastr.error('Failed to load sub categories')
    });
  }

  loadAmenities(): void {
    this.propertyService.getAdminAmenities().subscribe({
      next: (amenities) => this.amenities = amenities,
      error: () => this.toastr.error('Failed to load amenities')
    });
  }

  switchPanel(panel: 'tags' | 'categories' | 'subcategories' | 'amenities'): void {
    this.activePanel = panel;
    setTimeout(() => {
      document.getElementById(`${panel}-panel`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 0);
  }

  get filteredTags(): Tag[] {
    const term = this.tagSearch.trim().toLowerCase();
    return this.tags.filter(tag => {
      if (!term) return true;
      return tag.name.toLowerCase().includes(term) ||
        (tag.description || '').toLowerCase().includes(term);
    });
  }

  get filteredCategories(): CategoryOption[] {
    const term = this.categorySearch.trim().toLowerCase();
    return this.categories.filter(category => {
      if (!term) return true;
      return category.name.toLowerCase().includes(term) ||
        (category.description || '').toLowerCase().includes(term);
    });
  }

  get filteredSubcategories(): SubCategoryOption[] {
    const term = this.subcategorySearch.trim().toLowerCase();
    return this.subcategoryList.filter(sub => {
      if (this.subcategoryCategoryFilter !== 'all' && sub.category !== this.subcategoryCategoryFilter) {
        return false;
      }
      if (!term) return true;
      const categoryName = this.getCategoryName(sub.category).toLowerCase();
      return sub.name.toLowerCase().includes(term) ||
        (sub.description || '').toLowerCase().includes(term) ||
        categoryName.includes(term);
    });
  }

  get activeTags(): number {
    return this.tags.filter(tag => tag.is_active !== false).length;
  }

  get activeCategories(): number {
    return this.categories.filter(cat => cat.is_active !== false).length;
  }

  get activeSubcategories(): number {
    return this.subcategoryList.filter(sub => sub.is_active !== false).length;
  }

  get activeAmenities(): number {
    return this.amenities.filter(amenity => amenity.is_active !== false).length;
  }

  get filteredAmenities(): Amenity[] {
    const term = this.amenitySearch.trim().toLowerCase();
    return this.amenities.filter(amenity => {
      if (!term) return true;
      return amenity.name.toLowerCase().includes(term) ||
        (amenity.description || '').toLowerCase().includes(term) ||
        (amenity.icon || '').toLowerCase().includes(term);
    });
  }

  saveTag(): void {
    if (!this.tagDraft.name || !this.tagDraft.name.trim()) return;
    this.tagSaving = true;
    const payload = { ...this.tagDraft };
    const request = this.editingTagId
      ? this.propertyService.updateTag(this.editingTagId, payload)
      : this.propertyService.createTag(payload);

    request.subscribe({
      next: () => {
        this.toastr.success(`Tag ${this.editingTagId ? 'updated' : 'created'} successfully`);
        this.resetTagForm();
        this.loadTags();
      },
      error: (error) => this.toastr.error(this.extractErrorMessage(error) || 'Failed to save tag'),
      complete: () => this.tagSaving = false
    });
  }

  editTag(tag: Tag): void {
    this.editingTagId = tag.id;
    this.tagDraft = { ...tag };
  }

  deleteTag(tag: Tag): void {
    if (!confirm(`Delete tag "${tag.name}"?`)) return;
    this.propertyService.deleteTag(tag.id).subscribe({
      next: () => {
        this.toastr.success('Tag deleted');
        this.loadTags();
      },
      error: () => this.toastr.error('Failed to delete tag')
    });
  }

  resetTagForm(): void {
    this.tagDraft = this.defaultTag();
    this.editingTagId = null;
  }

  saveCategory(): void {
    if (!this.categoryDraft.name || !this.categoryDraft.name.trim()) return;
    this.categorySaving = true;
    const payload = { ...this.categoryDraft };
    const request = this.editingCategoryId
      ? this.propertyService.updateCategory(this.editingCategoryId, payload)
      : this.propertyService.createCategory(payload);

    request.subscribe({
      next: () => {
        this.toastr.success(`Category ${this.editingCategoryId ? 'updated' : 'created'} successfully`);
        this.resetCategoryForm();
        this.loadCategories();
      },
      error: (error) => this.toastr.error(this.extractErrorMessage(error) || 'Failed to save category'),
      complete: () => this.categorySaving = false
    });
  }

  editCategory(category: CategoryOption): void {
    this.editingCategoryId = category.id;
    this.categoryDraft = {
      id: category.id,
      name: category.name,
      description: category.description,
      priority: category.priority,
      is_active: category.is_active
    };
  }

  deleteCategory(category: CategoryOption): void {
    if (!confirm(`Delete category "${category.name}"? Related properties will lose this reference.`)) return;
    this.propertyService.deleteCategory(category.id).subscribe({
      next: () => {
        this.toastr.success('Category deleted');
        this.loadCategories();
      },
      error: () => this.toastr.error('Failed to delete category')
    });
  }

  resetCategoryForm(): void {
    this.categoryDraft = this.defaultCategory();
    this.editingCategoryId = null;
  }

  saveSubcategory(): void {
    if (!this.subcategoryDraft.name || !this.subcategoryDraft.name.trim() || !this.subcategoryDraft.category) return;
    this.subcategorySaving = true;
    const payload = { ...this.subcategoryDraft };
    const request = this.editingSubcategoryId
      ? this.propertyService.updateSubcategory(this.editingSubcategoryId, payload)
      : this.propertyService.createSubcategory(payload);

    request.subscribe({
      next: () => {
        this.toastr.success(`Sub category ${this.editingSubcategoryId ? 'updated' : 'created'} successfully`);
        this.resetSubcategoryForm();
        this.loadCategories();
        this.loadSubcategories();
      },
      error: (error) => this.toastr.error(this.extractErrorMessage(error) || 'Failed to save sub category'),
      complete: () => this.subcategorySaving = false
    });
  }

  editSubcategory(subcategory: SubCategoryOption): void {
    this.editingSubcategoryId = subcategory.id;
    this.subcategoryDraft = {
      id: subcategory.id,
      name: subcategory.name,
      category: subcategory.category,
      description: subcategory.description,
      priority: subcategory.priority,
      is_active: subcategory.is_active
    };
  }

  deleteSubcategory(subcategory: SubCategoryOption): void {
    if (!confirm(`Delete sub category "${subcategory.name}"?`)) return;
    this.propertyService.deleteSubcategory(subcategory.id).subscribe({
      next: () => {
        this.toastr.success('Sub category deleted');
        this.loadCategories();
        this.loadSubcategories();
      },
      error: () => this.toastr.error('Failed to delete sub category')
    });
  }

  resetSubcategoryForm(): void {
    this.subcategoryDraft = this.defaultSubcategory();
    this.editingSubcategoryId = null;
  }

  getCategoryName(categoryId?: number): string {
    if (!categoryId) {
      return 'Unknown';
    }
    const category = this.categories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Unknown';
  }


  private defaultTag(): Partial<Tag> {
    return { name: '', description: '', is_active: true };
  }

  private defaultCategory(): Partial<CategoryOption> {
    return { name: '', description: '', priority: 0, is_active: true };
  }

  private defaultSubcategory(): Partial<SubCategoryOption> {
    return { name: '', category: undefined, description: '', priority: 0, is_active: true };
  }

  private defaultAmenity(): Partial<Amenity> {
    return { name: '', description: '', icon: '', priority: 0, is_active: true };
  }

  saveAmenity(): void {
    if (!this.amenityDraft.name || !this.amenityDraft.name.trim()) return;
    this.amenitySaving = true;
    const payload = { ...this.amenityDraft };
    const request = this.editingAmenityId
      ? this.propertyService.updateAmenity(this.editingAmenityId, payload)
      : this.propertyService.createAmenity(payload);

    request.subscribe({
      next: () => {
        this.toastr.success(`Amenity ${this.editingAmenityId ? 'updated' : 'created'} successfully`);
        this.resetAmenityForm();
        this.loadAmenities();
      },
      error: (error) => this.toastr.error(this.extractErrorMessage(error) || 'Failed to save amenity'),
      complete: () => this.amenitySaving = false
    });
  }

  editAmenity(amenity: Amenity): void {
    this.editingAmenityId = amenity.id;
    this.amenityDraft = { ...amenity };
  }

  deleteAmenity(amenity: Amenity): void {
    if (!confirm(`Delete amenity "${amenity.name}"?`)) return;
    this.propertyService.deleteAmenity(amenity.id).subscribe({
      next: () => {
        this.toastr.success('Amenity deleted');
        this.loadAmenities();
      },
      error: () => this.toastr.error('Failed to delete amenity')
    });
  }

  resetAmenityForm(): void {
    this.amenityDraft = this.defaultAmenity();
    this.editingAmenityId = null;
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

