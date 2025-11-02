import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { PropertyService } from '../../../core/services/property.service';
import { CreatePropertyRequest } from '../../../core/models/property.model';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-property-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <h1>{{ isEdit ? 'Edit Property' : 'Add New Property' }}</h1>
      
      <form (ngSubmit)="onSubmit()" #propertyForm="ngForm">
        <!-- Property Images Section -->
        <div class="form-section" *ngIf="isEdit && propertyId">
          <h2><i class="fas fa-images"></i> Property Images</h2>
          <div class="image-upload-container">
            <div class="uploaded-images" *ngIf="existingImages.length > 0">
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
                [disabled]="uploadingImage"
              >
                <i class="fas fa-cloud-upload-alt"></i>
                {{ uploadingImage ? 'Uploading...' : 'Upload Images' }}
              </button>
              <p class="upload-hint">Upload up to 10 images (JPG, PNG, WebP - max 10MB each)</p>
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
              <select id="category" name="category" [(ngModel)]="propertyData.category" required>
                <option value="">Select Category</option>
                <option value="flat">Flat/Apartment</option>
                <option value="house">House/Villa</option>
                <option value="plot">Plot</option>
                <option value="commercial">Commercial</option>
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
              <label for="price">Price *</label>
              <input 
                type="text" 
                id="price"
                name="price"
                [(ngModel)]="propertyData.price" 
                required 
                placeholder="e.g., ₹2.5 Cr or ₹45,000/month"
              >
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
              <label for="pincode">Pincode *</label>
              <div class="pincode-input-group">
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
                <button 
                  type="button" 
                  class="btn-lookup"
                  (click)="onPincodeEnter()"
                  [disabled]="lookingUpPincode || !propertyData.pincode || propertyData.pincode.length !== 6"
                >
                  <i class="fas fa-search"></i>
                  {{ lookingUpPincode ? 'Looking up...' : 'Lookup' }}
                </button>
              </div>
              <small class="hint" *ngIf="pincodeNotFound">
                <i class="fas fa-info-circle"></i> Pincode not found. 
                <a href="#" (click)="showAddPincodeHelp($event)">Add it manually</a> or contact admin.
              </small>
            </div>

            <div class="form-group">
              <label for="city">City *</label>
              <input 
                type="text" 
                id="city"
                name="city"
                [(ngModel)]="propertyData.city" 
                required
                [readonly]="cityAutoFilled"
                placeholder="Auto-filled from pincode"
              >
            </div>

            <div class="form-group">
              <label for="state">State *</label>
              <input 
                type="text" 
                id="state"
                name="state"
                [(ngModel)]="propertyData.state" 
                required
                [readonly]="cityAutoFilled"
                placeholder="Auto-filled from pincode"
              >
            </div>

          </div>
        </div>

        <!-- Property Details -->
        <div class="form-section">
          <h2><i class="fas fa-home"></i> Property Details</h2>
          <div class="form-grid">
            <div class="form-group">
              <label for="area">Area (sq ft) *</label>
              <input 
                type="number" 
                id="area"
                name="area"
                [(ngModel)]="propertyData.area" 
                required 
                min="1"
                placeholder="e.g., 1500"
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
              <label for="amenities">Amenities (comma separated)</label>
              <input 
                type="text" 
                id="amenities"
                name="amenities"
                [(ngModel)]="propertyData.amenities" 
                placeholder="e.g., Parking, Gym, Swimming Pool, Security, Garden, Elevator"
              >
              <small class="field-hint">Separate multiple amenities with commas</small>
            </div>
          </div>
        </div>

        <!-- Owner Information -->
        <div class="form-section">
          <h2><i class="fas fa-user"></i> Owner Information</h2>
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
            [disabled]="propertyForm.invalid || loading"
          >
            <i class="fas fa-save"></i> 
            {{ loading ? 'Saving...' : (isEdit ? 'Update Property' : 'Create Property') }}
          </button>
          <button type="button" class="btn btn-outline" (click)="goBack()">
            <i class="fas fa-arrow-left"></i> Cancel
          </button>
        </div>
      </form>

      <!-- Success/Error Messages -->
      <div class="info-box" *ngIf="!isEdit">
        <i class="fas fa-info-circle"></i>
        <p>After creating the property, you'll be able to upload images from the edit page.</p>
      </div>
    </div>
  `,
  styles: [`
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
      background: #f8fafc;
      min-height: 100vh;
    }

    h1 {
      color: #1e293b;
      margin-bottom: 2rem;
      font-size: 2rem;
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
      margin-bottom: 1.5rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .form-section h2 i {
      color: #2563eb;
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

    /* Pincode Input Group */
    .pincode-input-group {
      display: flex;
      gap: 0.5rem;
    }

    .pincode-input-group input {
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

    .hint a:hover {
      color: #2563eb;
    }

    .form-group input[readonly] {
      background: #f1f5f9;
      cursor: not-allowed;
    }

    .field-hint {
      font-size: 0.75rem;
      color: #64748b;
      margin-top: 0.25rem;
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

    .image-caption {
      font-size: 0.75rem;
      color: white;
      flex: 1;
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

    .btn-delete:disabled {
      opacity: 0.6;
      cursor: not-allowed;
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

    .info-box {
      background: #eff6ff;
      border: 1px solid #bfdbfe;
      border-radius: 12px;
      padding: 1.5rem;
      margin-top: 2rem;
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .info-box i {
      color: #2563eb;
      font-size: 1.5rem;
    }

    .info-box p {
      margin: 0;
      color: #1e40af;
      font-size: 0.875rem;
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
export class PropertyFormComponent implements OnInit {
  propertyData: CreatePropertyRequest = {
    title: '',
    category: '',
    type: '',
    price: '',
    location: '',
    area: 0,
    bedrooms: 'N/A',
    bathrooms: 'N/A',
    city: '',
    state: '',
    pincode: '',
    description: '',
    amenities: '',
    owner_name: '',
    owner_phone: '',
    owner_email: ''
  };
  
  isEdit = false;
  cities: any[] = [];
  propertyId: number | null = null;
  loading = false;
  uploadingImage = false;
  existingImages: any[] = [];
  lookingUpPincode = false;
  pincodeNotFound = false;
  cityAutoFilled = false;

  constructor(
    private propertyService: PropertyService,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService
  ) {}

  ngOnInit() {
    this.loadCities();
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEdit = true;
        this.propertyId = +params['id'];
        this.loadProperty();
      }
    });
  }

  loadCities() {
    this.propertyService.getCities().subscribe({
      next: (cities) => {
        this.cities = cities;
      },
      error: (error) => {
        console.error('Error loading cities:', error);
        this.toastr.error('Failed to load cities', 'Error');
      }
    });
  }

  onPincodeEnter() {
    const pincode = this.propertyData.pincode?.trim();
    
    // Validate pincode format (6 digits)
    if (!pincode || pincode.length !== 6 || !/^\d{6}$/.test(pincode)) {
      if (pincode && pincode.length > 0) {
        this.toastr.warning('Please enter a valid 6-digit pincode', 'Invalid Pincode');
      }
      return;
    }
    
    this.lookingUpPincode = true;
    this.pincodeNotFound = false;
    this.cityAutoFilled = false;
    
    this.propertyService.lookupPincode(pincode).subscribe({
      next: (response) => {
        this.lookingUpPincode = false;
        if (response.found) {
          // Auto-fill city and state
          this.propertyData.city = response.city;
          this.propertyData.state = response.state;
          this.cityAutoFilled = true;
          this.pincodeNotFound = false;
          this.toastr.success(`Found: ${response.city}, ${response.state}`, 'Pincode Verified', { timeOut: 3000 });
        }
      },
      error: (error) => {
        this.lookingUpPincode = false;
        this.pincodeNotFound = true;
        this.cityAutoFilled = false;
        
        const message = error.error?.message || 'Pincode not found in our database.';
        this.toastr.warning(message, 'Pincode Not Found', { timeOut: 5000 });
      }
    });
  }

  showAddPincodeHelp(event: Event) {
    event.preventDefault();
    this.cityAutoFilled = false;
    this.pincodeNotFound = false;
    this.toastr.info(
      'Enter City and State manually, then contact admin to add this pincode to the database.',
      'Add Pincode Manually',
      { timeOut: 8000 }
    );
  }

  loadProperty() {
    if (this.propertyId) {
      this.loading = true;
      this.spinner.show();
      
      this.propertyService.getAdminProperties().subscribe({
        next: (properties) => {
          const property = properties.find(p => p.id === this.propertyId);
          if (property) {
            this.propertyData = {
              title: property.title,
              category: property.category,
              type: property.type,
              price: property.price,
              location: property.location,
              area: property.area,
              bedrooms: property.bedrooms,
              bathrooms: property.bathrooms,
              city: property.city,
              state: property.state,
              pincode: property.pincode || '',
              description: property.description || '',
              amenities: property.amenities || '',
              owner_name: property.owner_name || '',
              owner_phone: property.owner_phone || '',
              owner_email: property.owner_email || ''
            };
            this.existingImages = property.images || [];
          }
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

    if (!this.propertyId) {
      this.toastr.warning('Please save the property first before uploading images');
      return;
    }

    // Validate file count
    if (files.length + this.existingImages.length > 10) {
      this.toastr.warning('Maximum 10 images allowed per property');
      return;
    }

    // Upload each file
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

      this.uploadImage(file);
    });

    // Clear the file input
    event.target.value = '';
  }

  uploadImage(file: File) {
    if (!this.propertyId) return;

    this.uploadingImage = true;
    this.spinner.show();

    this.propertyService.uploadPropertyImage(this.propertyId, file).subscribe({
      next: (response) => {
        // Handle the new response format with message
        const image = {
          id: response.id,
          image: response.image || response.image_url,
          caption: response.caption || '',
          is_primary: response.is_primary || false
        };
        this.existingImages.push(image);
        
        // Show success message from backend
        const successMessage = response.message || 'Image uploaded successfully!';
        this.toastr.success(successMessage, 'Success');
        
        this.uploadingImage = false;
        this.spinner.hide();
      },
      error: (error) => {
        console.error('Error uploading image:', error);
        
        // Extract detailed error message from backend
        let errorMessage = 'Error uploading image. Please try again.';
        if (error.error?.message) {
          errorMessage = error.error.message;
        } else if (error.error?.error) {
          errorMessage = error.error.error;
        } else if (typeof error.error === 'string') {
          errorMessage = error.error;
        }
        
        this.toastr.error(errorMessage, 'Upload Failed', { timeOut: 6000 });
        this.uploadingImage = false;
        this.spinner.hide();
      }
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

  onSubmit() {
    if (this.loading) return;
    
    this.loading = true;
    this.spinner.show();

    if (this.isEdit && this.propertyId) {
      this.propertyService.updateProperty(this.propertyId, this.propertyData).subscribe({
        next: (response) => {
          this.loading = false;
          this.spinner.hide();
          this.toastr.success('Property updated successfully!', 'Success');
          // Auto-close and go back to properties list
          setTimeout(() => {
            this.router.navigate(['/admin/properties']);
          }, 1000);
        },
        error: (error) => {
          this.loading = false;
          this.spinner.hide();
          console.error('Error updating property:', error);
          
          // Show specific error message if available
          let errorMessage = 'Error updating property. Please check all fields.';
          if (error.error?.message) {
            errorMessage = error.error.message;
          } else if (error.error?.error) {
            errorMessage = error.error.error;
          } else if (typeof error.error === 'string') {
            errorMessage = error.error;
          }
          
          this.toastr.error(errorMessage, 'Error', { timeOut: 5000 });
        }
      });
    } else {
      this.propertyService.createProperty(this.propertyData).subscribe({
        next: (response) => {
          this.loading = false;
          this.spinner.hide();
          this.toastr.success('Property created successfully!', 'Success');
          
          // Auto-close and go back to properties list after 1 second
          setTimeout(() => {
            this.router.navigate(['/admin/properties']);
          }, 1000);
        },
        error: (error) => {
          this.loading = false;
          this.spinner.hide();
          console.error('Error creating property:', error);
          
          // Show specific error message if available
          let errorMessage = 'Error creating property. Please check all fields.';
          if (error.error?.message) {
            errorMessage = error.error.message;
          } else if (error.error?.error) {
            errorMessage = error.error.error;
          } else if (typeof error.error === 'string') {
            errorMessage = error.error;
          } else if (error.error) {
            // Try to extract field-specific errors
            const fieldErrors: string[] = [];
            Object.keys(error.error).forEach(field => {
              if (Array.isArray(error.error[field])) {
                error.error[field].forEach((msg: string) => {
                  fieldErrors.push(`${field}: ${msg}`);
                });
              }
            });
            if (fieldErrors.length > 0) {
              errorMessage = fieldErrors.join('. ');
            }
          }
          
          this.toastr.error(errorMessage, 'Error', { timeOut: 6000 });
        }
      });
    }
  }

  goBack() {
    this.router.navigate(['/admin/properties']);
  }
}
