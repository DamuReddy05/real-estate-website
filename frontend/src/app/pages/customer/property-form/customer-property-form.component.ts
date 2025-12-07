import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { PropertyService } from '../../../core/services/property.service';
import { CreatePropertyRequest, Tag, CategoryOption, SubCategoryOption, CityOption, Amenity } from '../../../core/models/property.model';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { HeaderComponent } from '../../../shared/header/header.component';

@Component({
  selector: 'app-customer-property-form',
  standalone: true,
  imports: [CommonModule, FormsModule, HeaderComponent],
  template: `
    <app-header></app-header>

    <div class="container">
      <div class="page-header">
        <h1><i class="fas fa-home"></i> {{ isEdit ? 'Edit Property' : 'Post Your Property' }}</h1>
        <p>{{ isEdit ? 'Update your property details' : 'Fill in the details below to list your property' }}</p>
      </div>
      
      <form (ngSubmit)="onSubmit()" #propertyForm="ngForm">
        <!-- Property Images Section - Available during creation -->
        <div class="form-section">
          <h2><i class="fas fa-images"></i> Property Images</h2>
          <p class="section-hint">Upload images of your property. The first image will be set as primary.</p>
          
          <div class="image-upload-container">
            <div class="uploaded-images" *ngIf="pendingImages.length > 0 || existingImages.length > 0">
              <!-- Pending images (during creation) -->
              <div class="image-item pending" *ngFor="let image of pendingImages; let i = index">
                <img [src]="image.preview" [alt]="'Image ' + (i + 1)" />
                <div class="image-actions">
                  <span class="image-name">{{ image.file.name }}</span>
                  <button 
                    type="button" 
                    class="btn-delete" 
                    (click)="removePendingImage(i)"
                    [disabled]="uploadingImage"
                  >
                    <i class="fas fa-times"></i>
                  </button>
                </div>
                <div class="upload-progress" *ngIf="image.uploading">
                  <div class="progress-bar" [style.width.%]="image.progress"></div>
                  <span>Uploading {{ image.progress }}%</span>
                </div>
              </div>
              
              <!-- Existing images (during edit) -->
              <div class="image-item" *ngFor="let image of existingImages">
                <img [src]="image.image" [alt]="image.caption || 'Property image'">
                <div class="image-actions">
                  <span class="image-caption" *ngIf="image.caption">{{ image.caption }}</span>
                  <span class="primary-badge" *ngIf="image.is_primary">Primary</span>
                  <button 
                    type="button" 
                    class="btn-delete" 
                    (click)="deleteImage(image.id)"
                    [disabled]="loading"
                  >
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>
            
            <div class="upload-area">
              <input 
                type="file" 
                #fileInput 
                accept="image/*" 
                multiple
                (change)="onFileSelected($event)" 
                style="display: none"
              >
              <button 
                type="button" 
                class="btn btn-upload" 
                (click)="fileInput.click()"
                [disabled]="uploadingImage || (pendingImages.length + existingImages.length >= 10)"
              >
                <i class="fas fa-cloud-upload-alt"></i>
                {{ uploadingImage ? 'Uploading...' : 'Select Images' }}
              </button>
              <p class="upload-hint">
                Upload up to 10 images (JPG, PNG, WebP - max 10MB each)
                <span *ngIf="pendingImages.length + existingImages.length > 0">
                  ({{ pendingImages.length + existingImages.length }}/10)
                </span>
              </p>
            </div>
          </div>
        </div>

        <!-- Basic Information -->
        <div class="form-section">
          <h2><i class="fas fa-info-circle"></i> Basic Information</h2>
          <div class="form-grid">
            <div class="form-group">
              <label for="title">Property Title *</label>
              <input 
                type="text" 
                id="title"
                name="title"
                [(ngModel)]="propertyData.title" 
                required 
                placeholder="e.g., Luxury 3BHK Apartment"
              >
            </div>
            
            <div class="form-group">
              <label for="category">Category *</label>
              <select 
                id="category" 
                name="category" 
                [(ngModel)]="propertyData.category" 
                (change)="onCategoryChange()" 
                required
              >
                <option value="">Select Category</option>
                <option *ngFor="let category of categories" [value]="category.slug">
                  {{ category.name }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label for="subcategory">Sub Category</label>
              <select 
                id="subcategory" 
                name="subcategory" 
                [(ngModel)]="propertyData.subcategory"
                [disabled]="filteredSubcategories.length === 0"
              >
                <option value="">{{ filteredSubcategories.length ? 'Select Sub Category' : 'No sub categories' }}</option>
                <option *ngFor="let sub of filteredSubcategories" [value]="sub.slug">
                  {{ sub.name }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label for="type">Property Type *</label>
              <select id="type" name="type" [(ngModel)]="propertyData.type" required>
                <option value="">Select Type</option>
                <option value="For Sale">For Sale</option>
                <option value="For Rent">For Rent</option>
              </select>
            </div>

            <div class="form-group">
              <label for="price">Price (₹) *</label>
              <input 
                type="number" 
                id="price"
                name="price"
                [(ngModel)]="propertyData.price" 
                required 
                min="0"
                placeholder="e.g., 25000000 (for ₹2.5 Cr)"
              >
              <small class="field-hint">Enter price in rupees (integer). Example: 25000000 for ₹2.5 Cr</small>
            </div>
          </div>
        </div>

        <!-- Location Details -->
        <div class="form-section">
          <h2><i class="fas fa-map-marker-alt"></i> Location Details</h2>
          <div class="form-grid">
            <div class="form-group">
              <label for="location">Location *</label>
              <input 
                type="text" 
                id="location"
                name="location"
                [(ngModel)]="propertyData.location" 
                required 
                placeholder="e.g., Bandra West"
              >
            </div>

            <div class="form-group">
              <label for="city">City *</label>
              <div class="city-input-group">
                <select 
                  id="city"
                  name="city"
                  [(ngModel)]="propertyData.city" 
                  required
                  (change)="handleCityChange()"
                >
                  <option value="">Select City</option>
                  <option *ngFor="let city of cities" [value]="city.name">
                    {{ city.name }} ({{ city.state }}) {{ city.is_active ? '' : '(inactive)' }}
                  </option>
                </select>
                <button 
                  type="button" 
                  class="btn-lookup"
                  (click)="onPincodeEnter()"
                  [disabled]="lookingUpPincode || !propertyData.pincode || propertyData.pincode.length !== 6"
                  title="Lookup pincode for selected city"
                >
                  <i class="fas fa-search"></i>
                  {{ lookingUpPincode ? 'Looking up...' : 'Lookup' }}
                </button>
              </div>
              <small class="field-hint" *ngIf="allowedPincodes.length">
                Allowed pincodes: {{ allowedPincodes.join(', ') }}
              </small>
              <small class="field-hint warning" *ngIf="!allowedPincodes.length && propertyData.city">
                No pincodes enabled for this city yet. Contact admin to add them.
              </small>
            </div>

            <div class="form-group">
              <label for="pincode">Pincode *</label>
              <input 
                type="text" 
                id="pincode"
                name="pincode"
                [(ngModel)]="propertyData.pincode" 
                required
                maxlength="6"
                pattern="[0-9]{6}"
                placeholder="Enter 6-digit pincode"
                (blur)="onPincodeEnter()"
              >
              <small class="hint" *ngIf="pincodeNotFound">
                <i class="fas fa-info-circle"></i> Pincode not found. 
                <a href="#" (click)="showAddPincodeHelp($event)">Add it manually</a> or contact admin.
              </small>
            </div>

            <div class="form-group">
              <label for="state">State *</label>
              <input 
                type="text" 
                id="state"
                name="state"
                [(ngModel)]="propertyData.state" 
                required
                readonly
                placeholder="Auto-filled from city selection"
              >
            </div>
          </div>
        </div>

        <!-- Property Details -->
        <div class="form-section">
          <h2><i class="fas fa-home"></i> Property Details</h2>
          <div class="form-grid">
            <div class="form-group">
              <label for="carpet_area">Carpet Area (sq ft) *</label>
              <input 
                type="number" 
                id="carpet_area"
                name="carpet_area"
                [(ngModel)]="propertyData.carpet_area" 
                required 
                min="1"
                placeholder="e.g., 1500"
              >
            </div>

            <div class="form-group">
              <label for="buildup_area">Buildup Area (sq ft)</label>
              <input 
                type="number" 
                id="buildup_area"
                name="buildup_area"
                [(ngModel)]="propertyData.buildup_area" 
                min="1"
                placeholder="e.g., 1800"
              >
            </div>

            <div class="form-group">
              <label for="length">Length (ft)</label>
              <input 
                type="number" 
                id="length"
                name="length"
                [(ngModel)]="propertyData.length" 
                step="0.01"
                min="0"
                placeholder="e.g., 50.5"
              >
            </div>

            <div class="form-group">
              <label for="width">Width (ft)</label>
              <input 
                type="number" 
                id="width"
                name="width"
                [(ngModel)]="propertyData.width" 
                step="0.01"
                min="0"
                placeholder="e.g., 30.5"
              >
            </div>

            <div class="form-group">
              <label for="height">Height (ft)</label>
              <input 
                type="number" 
                id="height"
                name="height"
                [(ngModel)]="propertyData.height" 
                step="0.01"
                min="0"
                placeholder="e.g., 10.5 (for buildings)"
              >
            </div>

            <div class="form-group">
              <label for="bedrooms">Bedrooms</label>
              <select id="bedrooms" name="bedrooms" [(ngModel)]="propertyData.bedrooms">
                <option value="N/A">N/A (for plots)</option>
                <option value="1">1 BHK</option>
                <option value="2">2 BHK</option>
                <option value="3">3 BHK</option>
                <option value="4">4 BHK</option>
                <option value="5">5+ BHK</option>
              </select>
            </div>

            <div class="form-group">
              <label for="bathrooms">Bathrooms</label>
              <select id="bathrooms" name="bathrooms" [(ngModel)]="propertyData.bathrooms">
                <option value="N/A">N/A (for plots)</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4+</option>
              </select>
            </div>

            <div class="form-group full-width">
              <label for="description">Description</label>
              <textarea 
                id="description"
                name="description"
                [(ngModel)]="propertyData.description" 
                rows="5" 
                placeholder="Describe the property, amenities, nearby facilities, unique features..."
              ></textarea>
            </div>

            <div class="form-group full-width">
              <label>Amenities</label>
              <div class="amenity-selector">
                <div class="amenity-search">
                  <input 
                    type="text" 
                    [(ngModel)]="amenitySearchQuery"
                    placeholder="Search amenities..."
                    class="amenity-search-input"
                  >
                  <i class="fas fa-search"></i>
                </div>
                <div class="amenity-list">
                  <label *ngFor="let amenity of filteredAmenities" class="amenity-item">
                    <input 
                      type="checkbox" 
                      [checked]="isAmenitySelected(amenity.id)"
                      (change)="toggleAmenity(amenity.id)"
                    >
                    <span class="amenity-name">
                      <i *ngIf="amenity.icon" [class]="amenity.icon"></i>
                      {{ amenity.name }}
                    </span>
                    <small *ngIf="amenity.description" class="amenity-desc">{{ amenity.description }}</small>
                  </label>
                  <p *ngIf="filteredAmenities.length === 0" class="no-amenities">No amenities found</p>
                </div>
                <div class="selected-amenities" *ngIf="selectedAmenityIds.length > 0">
                  <strong>Selected:</strong>
                  <span *ngFor="let id of selectedAmenityIds" class="selected-amenity-badge">
                    {{ getAmenityName(id) }}
                    <button type="button" (click)="toggleAmenity(id)" class="remove-amenity">×</button>
                  </span>
                </div>
              </div>
            </div>

            <div class="form-group full-width" *ngIf="availableTags.length">
              <label>Tags</label>
              <div class="tag-grid">
                <label *ngFor="let tag of availableTags">
                  <input 
                    type="checkbox" 
                    [value]="tag.id" 
                    [checked]="selectedTagIds.includes(tag.id)"
                    (change)="toggleTag(tag.id, $event)"
                  >
                  <span>{{ tag.name }}</span>
                </label>
              </div>
              <small class="field-hint">Select approvals or attributes that apply to this listing</small>
            </div>
          </div>
        </div>

        <!-- Owner Information -->
        <div class="form-section">
          <h2><i class="fas fa-user"></i> Owner Information</h2>
          <div class="info-message">
            <i class="fas fa-info-circle"></i>
            <div>
              <strong>Note:</strong> The phone number and email provided below will <strong>NOT</strong> be visible to customers on the property listing page. 
              Only our admin contact information will be displayed to customers for inquiries. 
              This protects your privacy while ensuring all inquiries are properly managed.
            </div>
          </div>
          <div class="form-grid">
            <div class="form-group">
              <label for="ownerName">Owner Name</label>
              <input 
                type="text" 
                id="ownerName"
                name="ownerName"
                [(ngModel)]="propertyData.owner_name" 
                placeholder="Property owner name"
              >
            </div>

            <div class="form-group">
              <label for="ownerPhone">Owner Phone</label>
              <input 
                type="tel" 
                id="ownerPhone"
                name="ownerPhone"
                [(ngModel)]="propertyData.owner_phone" 
                placeholder="+91 98765 43210"
                pattern="[+]?[0-9]{10,15}"
              >
            </div>

            <div class="form-group">
              <label for="ownerEmail">Owner Email</label>
              <input 
                type="email" 
                id="ownerEmail"
                name="ownerEmail"
                [(ngModel)]="propertyData.owner_email" 
                placeholder="owner@example.com"
              >
            </div>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="form-actions">
          <button 
            type="submit" 
            class="btn btn-primary"
            [disabled]="propertyForm.invalid || loading || uploadingImage"
          >
            <i class="fas fa-save"></i> 
            {{ loading ? 'Saving...' : (isEdit ? 'Update Property' : 'Create Property') }}
          </button>
          <button type="button" class="btn btn-outline" (click)="goBack()">
            <i class="fas fa-arrow-left"></i> Cancel
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
      background: #f8fafc;
      min-height: calc(100vh - 66px);
    }

    .page-header {
      background: white;
      border-radius: 16px;
      padding: 2rem;
      margin-bottom: 2rem;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }

    .page-header h1 {
      color: #1e293b;
      margin: 0 0 0.5rem 0;
      font-size: 2rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .page-header h1 i {
      color: #2563eb;
    }

    .page-header p {
      margin: 0;
      color: #64748b;
      font-size: 1rem;
    }

    .form-section {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      margin-bottom: 2rem;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }

    .form-section h2 {
      color: #1e293b;
      font-size: 1.25rem;
      margin-bottom: 0.5rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .form-section h2 i {
      color: #2563eb;
    }

    .section-hint {
      color: #64748b;
      font-size: 0.9rem;
      margin-bottom: 1rem;
    }
    
    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
    }
    
    .form-group {
      display: flex;
      flex-direction: column;
    }
    
    .form-group.full-width {
      grid-column: 1 / -1;
    }
    
    .form-group label {
      font-weight: 600;
      margin-bottom: 0.5rem;
      color: #1e293b;
      font-size: 0.875rem;
    }
    
    .form-group input,
    .form-group select,
    .form-group textarea {
      padding: 0.75rem;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      font-size: 1rem;
      transition: all 0.3s ease;
      font-family: inherit;
    }
    
    .form-group input:focus,
    .form-group select:focus,
    .form-group textarea:focus {
      outline: none;
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    }

    .form-group textarea {
      resize: vertical;
      min-height: 100px;
    }

    .tag-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 0.6rem;
    }

    .tag-grid label {
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      padding: 0.4rem 0.8rem;
      border-radius: 999px;
      border: 1px solid #cbd5f5;
      cursor: pointer;
      font-size: 0.85rem;
      background: #f8fafc;
    }

    .tag-grid input {
      width: auto;
      margin: 0;
    }

    .pincode-input-group {
      display: flex;
      gap: 0.5rem;
    }

    .pincode-input-group input {
      flex: 1;
    }

    .city-input-group {
      display: flex;
      gap: 0.5rem;
    }

    .city-input-group select {
      flex: 1;
    }

    .btn-lookup {
      padding: 0.75rem 1.5rem;
      background: linear-gradient(135deg, #3b82f6, #2563eb);
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      transition: all 0.3s ease;
      white-space: nowrap;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .btn-lookup:hover:not(:disabled) {
      background: linear-gradient(135deg, #2563eb, #1e40af);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
    }

    .btn-lookup:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .hint {
      font-size: 0.75rem;
      color: #f59e0b;
      display: block;
      margin-top: 0.5rem;
    }

    .hint a {
      color: #3b82f6;
      text-decoration: underline;
      font-weight: 600;
    }

    .field-hint {
      font-size: 0.75rem;
      color: #64748b;
      margin-top: 0.25rem;
    }

    .field-hint.warning {
      color: #b45309;
    }

    .info-message {
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      border-radius: 8px;
      padding: 1rem;
      margin-bottom: 1.5rem;
      display: flex;
      gap: 1rem;
      align-items: flex-start;
    }

    .info-message i {
      color: #2563eb;
      font-size: 1.25rem;
      margin-top: 0.1rem;
      flex-shrink: 0;
    }

    .info-message div {
      color: #1e40af;
      font-size: 0.9rem;
      line-height: 1.6;
    }

    .info-message strong {
      font-weight: 600;
    }

    .form-group input[readonly] {
      background: #f1f5f9;
      cursor: not-allowed;
    }

    /* Amenity Selector Styles */
    .amenity-selector {
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      background: white;
    }

    .amenity-search {
      position: relative;
      padding: 0.75rem;
      border-bottom: 1px solid #e2e8f0;
    }

    .amenity-search-input {
      width: 100%;
      padding: 0.5rem 2rem 0.5rem 0.75rem;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      font-size: 0.9rem;
    }

    .amenity-search i {
      position: absolute;
      right: 1.5rem;
      top: 50%;
      transform: translateY(-50%);
      color: #64748b;
    }

    .amenity-list {
      max-height: 300px;
      overflow-y: auto;
      padding: 0.5rem;
    }

    .amenity-item {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      padding: 0.75rem;
      border-radius: 6px;
      cursor: pointer;
      transition: background 0.2s ease;
    }

    .amenity-item:hover {
      background: #f8fafc;
    }

    .amenity-item input[type="checkbox"] {
      margin-top: 0.2rem;
      cursor: pointer;
    }

    .amenity-name {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 500;
      color: #1e293b;
    }

    .amenity-name i {
      color: #3b82f6;
      font-size: 1rem;
    }

    .amenity-desc {
      display: block;
      color: #64748b;
      font-size: 0.85rem;
      margin-top: 0.25rem;
    }

    .no-amenities {
      padding: 1rem;
      text-align: center;
      color: #94a3b8;
      font-size: 0.9rem;
    }

    .selected-amenities {
      padding: 0.75rem;
      border-top: 1px solid #e2e8f0;
      background: #f8fafc;
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      align-items: center;
    }

    .selected-amenities strong {
      color: #1e293b;
      font-size: 0.85rem;
    }

    .selected-amenity-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.3rem 0.6rem;
      background: #2563eb;
      color: white;
      border-radius: 999px;
      font-size: 0.8rem;
      font-weight: 500;
    }

    .remove-amenity {
      background: rgba(255, 255, 255, 0.3);
      border: none;
      color: white;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.9rem;
      line-height: 1;
      padding: 0;
    }

    .remove-amenity:hover {
      background: rgba(255, 255, 255, 0.5);
    }

    /* Image Upload Styles */
    .image-upload-container {
      margin-top: 1rem;
    }

    .uploaded-images {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .image-item {
      position: relative;
      border-radius: 8px;
      overflow: hidden;
      border: 2px solid #e2e8f0;
      transition: all 0.3s ease;
    }

    .image-item.pending {
      border-color: #fbbf24;
      border-style: dashed;
    }

    .image-item:hover {
      border-color: #2563eb;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }

    .image-item img {
      width: 100%;
      height: 200px;
      object-fit: cover;
      display: block;
    }

    .image-actions {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
      padding: 1rem 0.75rem 0.75rem;
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .image-caption,
    .image-name {
      font-size: 0.75rem;
      color: white;
      flex: 1;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .primary-badge {
      background: #10b981;
      color: white;
      padding: 0.2rem 0.5rem;
      border-radius: 4px;
      font-size: 0.7rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .btn-delete {
      background: #ef4444;
      color: white;
      border: none;
      padding: 0.4rem 0.6rem;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.875rem;
      transition: background 0.3s ease;
    }

    .btn-delete:hover:not(:disabled) {
      background: #dc2626;
    }

    .upload-progress {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: rgba(0, 0, 0, 0.7);
      padding: 0.5rem;
      color: white;
      font-size: 0.75rem;
      text-align: center;
    }

    .progress-bar {
      height: 4px;
      background: #2563eb;
      transition: width 0.3s ease;
      margin-bottom: 0.25rem;
    }

    .upload-area {
      border: 2px dashed #cbd5e1;
      border-radius: 12px;
      padding: 2rem;
      text-align: center;
      background: #f8fafc;
      transition: all 0.3s ease;
    }

    .upload-area:hover {
      border-color: #2563eb;
      background: #eff6ff;
    }

    .btn-upload {
      background: #2563eb;
      color: white;
      border: none;
      padding: 0.75rem 2rem;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }

    .btn-upload:hover:not(:disabled) {
      background: #1d4ed8;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
    }

    .btn-upload:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .upload-hint {
      margin-top: 1rem;
      font-size: 0.875rem;
      color: #64748b;
    }
    
    .form-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-start;
      padding: 2rem;
      background: white;
      border-radius: 12px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    }
    
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0.875rem 2rem;
      font-size: 1rem;
      font-weight: 600;
      border: 1px solid transparent;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      gap: 0.5rem;
    }
    
    .btn-primary {
      background-color: #2563eb;
      color: white;
      box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);
    }
    
    .btn-primary:hover:not(:disabled) {
      background-color: #1d4ed8;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
    }
    
    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }
    
    .btn-outline {
      background-color: transparent;
      border-color: #e2e8f0;
      color: #1e293b;
    }
    
    .btn-outline:hover {
      background-color: #f8fafc;
      border-color: #2563eb;
      color: #2563eb;
    }

    @media (max-width: 768px) {
      .container {
        padding: 1rem;
      }

      .form-section {
        padding: 1.5rem;
      }

      .form-grid {
        grid-template-columns: 1fr;
      }

      .uploaded-images {
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      }

      .form-actions {
        flex-direction: column;
      }

      .btn {
        width: 100%;
        justify-content: center;
      }
    }
  `]
})
export class CustomerPropertyFormComponent implements OnInit {
  propertyData: CreatePropertyRequest = {
    title: '',
    category: '',
    subcategory: '',
    type: '',
    price: 0,
    location: '',
    carpet_area: 0,
    buildup_area: 0,
    length: undefined,
    width: undefined,
    height: undefined,
    bedrooms: 'N/A',
    bathrooms: 'N/A',
    city: '',
    state: '',
    pincode: '',
    description: '',
    amenity_ids: [],
    owner_name: '',
    owner_phone: '',
    owner_email: ''
  };
  
  isEdit = false;
  cities: CityOption[] = [];
  propertyId: number | null = null;
  loading = false;
  uploadingImage = false;
  existingImages: any[] = [];
  pendingImages: Array<{ file: File; preview: string; uploading?: boolean; progress?: number }> = [];
  lookingUpPincode = false;
  pincodeNotFound = false;
  availableTags: Tag[] = [];
  selectedTagIds: number[] = [];
  availableAmenities: Amenity[] = [];
  selectedAmenityIds: number[] = [];
  amenitySearchQuery = '';
  categories: CategoryOption[] = [];
  filteredSubcategories: SubCategoryOption[] = [];
  selectedCity: CityOption | null = null;
  allowedPincodes: string[] = [];

  constructor(
    private propertyService: PropertyService,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService
  ) {}

  ngOnInit() {
    this.loadCities();
    this.loadCategories();
    this.loadTags();
    this.loadAmenities();
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEdit = true;
        this.propertyId = +params['id'];
        this.loadProperty();
      }
    });
  }

  loadAmenities() {
    this.propertyService.getAmenities().subscribe({
      next: (amenities) => this.availableAmenities = amenities,
      error: () => this.toastr.error('Failed to load amenities')
    });
  }

  get filteredAmenities(): Amenity[] {
    if (!this.amenitySearchQuery) {
      return this.availableAmenities;
    }
    const query = this.amenitySearchQuery.toLowerCase();
    return this.availableAmenities.filter(a => 
      a.name.toLowerCase().includes(query) || 
      (a.description && a.description.toLowerCase().includes(query))
    );
  }

  toggleAmenity(amenityId: number) {
    const index = this.selectedAmenityIds.indexOf(amenityId);
    if (index > -1) {
      this.selectedAmenityIds.splice(index, 1);
    } else {
      this.selectedAmenityIds.push(amenityId);
    }
  }

  isAmenitySelected(amenityId: number): boolean {
    return this.selectedAmenityIds.includes(amenityId);
  }

  getAmenityName(amenityId: number): string {
    const amenity = this.availableAmenities.find(a => a.id === amenityId);
    return amenity?.name || '';
  }

  loadTags() {
    this.propertyService.getTags().subscribe({
      next: (tags) => this.availableTags = tags,
      error: () => this.toastr.error('Failed to load tags')
    });
  }

  loadCategories() {
    this.propertyService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        this.syncSubcategoryOptions();
      },
      error: () => this.toastr.error('Failed to load categories')
    });
  }

  loadCities() {
    this.propertyService.getCities().subscribe({
      next: (cities) => {
        this.cities = cities;
        if (!this.isEdit && !this.propertyData.city && this.cities.length) {
          // Set default to first active city
          const activeCity = this.cities.find(c => c.is_active) || this.cities[0];
          this.propertyData.city = activeCity.name;
          this.propertyData.state = activeCity.state;
        }
        this.ensureCityAvailability();
        this.syncSelectedCity();
      },
      error: (error) => {
        console.error('Error loading cities:', error);
        this.toastr.error('Failed to load cities', 'Error');
      }
    });
  }

  onPincodeEnter() {
    const pincode = this.propertyData.pincode?.trim();
    
    if (!pincode || pincode.length !== 6 || !/^\d{6}$/.test(pincode)) {
      if (pincode && pincode.length > 0) {
        this.toastr.warning('Please enter a valid 6-digit pincode', 'Invalid Pincode');
      }
      return;
    }

    if (this.allowedPincodes.length && !this.allowedPincodes.includes(pincode)) {
      this.toastr.error('This pincode is not enabled for the selected city. Please contact admin.', 'Pincode Restricted');
      return;
    }
    
    this.lookingUpPincode = true;
    this.pincodeNotFound = false;
    
    this.propertyService.lookupPincode(pincode).subscribe({
      next: (response) => {
        this.lookingUpPincode = false;
        if (response.found) {
          this.propertyData.city = response.city;
          this.propertyData.state = response.state;
          this.pincodeNotFound = false;
          this.ensureCityAvailability();
          this.syncSelectedCity();
          this.toastr.success(`Found: ${response.city}, ${response.state}`, 'Pincode Verified', { timeOut: 3000 });
        }
      },
      error: (error) => {
        this.lookingUpPincode = false;
        this.pincodeNotFound = true;
        const message = error.error?.message || 'Pincode not found in our database.';
        this.toastr.warning(message, 'Pincode Not Found', { timeOut: 5000 });
      }
    });
  }

  showAddPincodeHelp(event: Event) {
    event.preventDefault();
    this.pincodeNotFound = false;
    this.toastr.info(
      'Select the correct city/state and contact admin to add this pincode to the database.',
      'Add Pincode Manually',
      { timeOut: 8000 }
    );
  }

  loadProperty() {
    if (this.propertyId) {
      this.loading = true;
      this.spinner.show();
      
      this.propertyService.getCustomerProperty(this.propertyId).subscribe({
        next: (property) => {
          this.propertyData = {
            title: property.title,
            category: property.category || '',
            subcategory: property.subcategory || '',
            type: property.type,
            price: property.price,
            location: property.location,
            carpet_area: property.carpet_area,
            buildup_area: property.buildup_area,
            length: property.length,
            width: property.width,
            height: property.height,
            bedrooms: property.bedrooms,
            bathrooms: property.bathrooms,
            city: property.city,
            state: property.state,
            pincode: property.pincode || '',
            description: property.description || '',
            amenity_ids: property.amenities ? property.amenities.map((a: Amenity) => a.id) : [],
            owner_name: property.owner_name || '',
            owner_phone: property.owner_phone || '',
            owner_email: property.owner_email || ''
          };
          this.existingImages = property.images || [];
          this.selectedTagIds = property.tags ? property.tags.map((tag: Tag) => tag.id) : [];
          this.selectedAmenityIds = this.propertyData.amenity_ids || [];
          this.ensureCityAvailability();
          this.syncSelectedCity();
          this.syncSubcategoryOptions();
          this.loading = false;
          this.spinner.hide();
        },
        error: (error) => {
          console.error('Error loading property:', error);
          this.toastr.error('Error loading property data');
          this.loading = false;
          this.spinner.hide();
        }
      });
    }
  }

  onFileSelected(event: any) {
    const files: FileList = event.target.files;
    if (!files || files.length === 0) return;

    // Validate total file count
    if (files.length + this.pendingImages.length + this.existingImages.length > 10) {
      this.toastr.warning('Maximum 10 images allowed per property');
      return;
    }

    // Process each file
    Array.from(files).forEach((file: File) => {
      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        this.toastr.warning(`File ${file.name} is too large. Maximum size is 10MB`, 'File Too Large');
        return;
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        this.toastr.warning(`File ${file.name} has invalid type. Only JPG, PNG, and WebP are allowed.`, 'Invalid File Type');
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.pendingImages.push({
          file: file,
          preview: e.target.result,
          uploading: false,
          progress: 0
        });
      };
      reader.readAsDataURL(file);
    });

    // Clear the file input
    event.target.value = '';
  }

  removePendingImage(index: number) {
    this.pendingImages.splice(index, 1);
  }

  uploadImage(file: File, index: number): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.propertyId) {
        reject(new Error('Property ID not available'));
        return;
      }

      const pendingImage = this.pendingImages[index];
      if (!pendingImage) {
        reject(new Error('Pending image not found'));
        return;
      }

      pendingImage.uploading = true;
      pendingImage.progress = 0;

      // Simulate progress (in real implementation, you might track actual upload progress)
      const progressInterval = setInterval(() => {
        const pendingImage = this.pendingImages[index];
        if (pendingImage && pendingImage.progress !== undefined && pendingImage.progress < 90) {
          pendingImage.progress += 10;
        }
      }, 200);

      this.propertyService.uploadCustomerPropertyImage(
        this.propertyId,
        file,
        '',
        index === 0 && this.existingImages.length === 0 // First image is primary
      ).subscribe({
        next: (response) => {
          clearInterval(progressInterval);
          const pendingImage = this.pendingImages[index];
          if (pendingImage) {
            pendingImage.progress = 100;
            pendingImage.uploading = false;
          }
          
          const image = {
            id: response.id,
            image: response.image || response.image_url,
            caption: response.caption || '',
            is_primary: response.is_primary || false
          };
          this.existingImages.push(image);
          
          resolve();
        },
        error: (error) => {
          clearInterval(progressInterval);
          const pendingImage = this.pendingImages[index];
          if (pendingImage) {
            pendingImage.uploading = false;
          }
          console.error('Error uploading image:', error);
          
          let errorMessage = 'Error uploading image. Please try again.';
          if (error.error?.message) {
            errorMessage = error.error.message;
          } else if (error.error?.error) {
            errorMessage = error.error.error;
          }
          
          this.toastr.error(errorMessage, 'Upload Failed', { timeOut: 6000 });
          reject(error);
        }
      });
    });
  }

  deleteImage(imageId: number) {
    if (!confirm('Are you sure you want to delete this image?')) {
      return;
    }

    this.loading = true;
    this.spinner.show();

    this.propertyService.deletePropertyImage(imageId).subscribe({
      next: () => {
        this.existingImages = this.existingImages.filter(img => img.id !== imageId);
        this.toastr.success('Image deleted successfully!');
        this.loading = false;
        this.spinner.hide();
      },
      error: (error) => {
        console.error('Error deleting image:', error);
        this.toastr.error('Error deleting image. Please try again.');
        this.loading = false;
        this.spinner.hide();
      }
    });
  }

  async onSubmit() {
    if (this.loading) return;
    
    this.loading = true;
    this.spinner.show();

    this.propertyData.tag_ids = this.selectedTagIds;
    this.propertyData.amenity_ids = this.selectedAmenityIds;

    if (this.isEdit && this.propertyId) {
      // Update existing property
      this.propertyService.updateCustomerProperty(this.propertyId, this.propertyData).subscribe({
        next: async (response) => {
          // Upload any pending images
          if (this.pendingImages.length > 0) {
            this.uploadingImage = true;
            try {
              for (let i = 0; i < this.pendingImages.length; i++) {
                await this.uploadImage(this.pendingImages[i].file, i);
              }
              this.pendingImages = [];
            } catch (error) {
              // Error already handled in uploadImage
            }
            this.uploadingImage = false;
          }

          this.loading = false;
          this.spinner.hide();
          this.toastr.success('Property updated successfully!', 'Success');
          setTimeout(() => {
            this.router.navigate(['/customer/properties']);
          }, 1000);
        },
        error: (error) => {
          this.loading = false;
          this.spinner.hide();
          console.error('Error updating property:', error);

          if (this.handleLocationError(error)) {
            return;
          }
          
          let errorMessage = 'Error updating property. Please check all fields.';
          if (error.error?.message) {
            errorMessage = error.error.message;
          } else if (error.error?.error) {
            errorMessage = error.error.error;
          }
          
          this.toastr.error(errorMessage, 'Error', { timeOut: 5000 });
        }
      });
    } else {
      // Create new property
      this.propertyService.createCustomerProperty(this.propertyData).subscribe({
        next: async (response) => {
          this.propertyId = response.id;
          
          // Upload pending images after property is created
          if (this.pendingImages.length > 0) {
            this.uploadingImage = true;
            try {
              for (let i = 0; i < this.pendingImages.length; i++) {
                await this.uploadImage(this.pendingImages[i].file, i);
              }
              this.pendingImages = [];
            } catch (error) {
              // Error already handled in uploadImage
            }
            this.uploadingImage = false;
          }

          this.loading = false;
          this.spinner.hide();
          this.toastr.success('Property created successfully!', 'Success');
          setTimeout(() => {
            this.router.navigate(['/customer/properties']);
          }, 1000);
        },
        error: (error) => {
          this.loading = false;
          this.spinner.hide();
          console.error('Error creating property:', error);

          if (this.handleLocationError(error)) {
            return;
          }
          
          let errorMessage = 'Error creating property. Please check all fields.';
          if (error.error?.message) {
            errorMessage = error.error.message;
          } else if (error.error?.error) {
            errorMessage = error.error.error;
          }
          
          this.toastr.error(errorMessage, 'Error', { timeOut: 6000 });
        }
      });
    }
  }

  goBack() {
    this.router.navigate(['/customer/properties']);
  }

  toggleTag(tagId: number, event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      if (!this.selectedTagIds.includes(tagId)) {
        this.selectedTagIds.push(tagId);
      }
    } else {
      this.selectedTagIds = this.selectedTagIds.filter(id => id !== tagId);
    }
  }

  onCategoryChange() {
    this.syncSubcategoryOptions();
  }

  handleCityChange() {
    this.syncSelectedCity();
    this.propertyData.pincode = '';
  }

  private syncSelectedCity() {
    if (!this.propertyData.city) {
      this.selectedCity = null;
      this.allowedPincodes = [];
      return;
    }
    const match = this.cities.find(
      city => city.name.toLowerCase() === this.propertyData.city.toLowerCase()
    );
    this.selectedCity = match || null;
    if (this.selectedCity) {
      this.propertyData.state = this.selectedCity.state;
      this.allowedPincodes = this.selectedCity.pincodes || [];
    } else {
      this.allowedPincodes = [];
    }
  }

  private ensureCityAvailability() {
    if (!this.propertyData.city) return;
    const exists = this.cities.some(
      city => city.name.toLowerCase() === this.propertyData.city.toLowerCase()
    );
    if (!exists) {
      this.cities = [
        ...this.cities,
        {
          id: -1,
          name: this.propertyData.city,
          state: this.propertyData.state || '',
          is_active: false,
          pincodes: []
        }
      ];
    }
  }

  private handleLocationError(error: any): boolean {
    const code = error?.error?.error_code;
    if (!code) {
      return false;
    }
    const cityMsg = error?.error?.city?.[0];
    const pincodeMsg = error?.error?.pincode?.[0];
    if (code === 'city_not_supported') {
      alert(cityMsg || 'We are not live in this city yet. Please contact support.');
      return true;
    }
    if (code === 'city_inactive') {
      alert(cityMsg || 'This city is currently inactive. Please choose another active city.');
      return true;
    }
    if (code === 'pincode_not_allowed') {
      this.toastr.error(pincodeMsg || 'This pincode is not enabled for the selected city.', 'Pincode Restricted');
      return true;
    }
    return false;
  }

  private syncSubcategoryOptions() {
    if (!this.categories.length) {
      this.filteredSubcategories = [];
      return;
    }

    const selected = this.categories.find(cat => cat.slug === this.propertyData.category);
    this.filteredSubcategories = selected?.subcategories?.filter(sub => sub.is_active) || [];

    if (!this.filteredSubcategories.length) {
      this.propertyData.subcategory = '';
    } else {
      const exists = this.filteredSubcategories.some(sub => sub.slug === this.propertyData.subcategory);
      if (!exists) {
        this.propertyData.subcategory = '';
      }
    }
  }
}

