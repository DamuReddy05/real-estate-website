import { Component, OnInit, OnDestroy, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { PropertyService } from '../../core/services/property.service';
import { AuthService } from '../../core/services/auth.service';
import { Property, Amenity } from '../../core/models/property.model';
import { User } from '../../core/models/user.model';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-property-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <!-- Modal Overlay (only shown in modal mode) -->
    <div class="modal-overlay" *ngIf="isModalMode" (click)="closeModal()"></div>
    
    <!-- Modal Container -->
    <div class="property-detail-container" [class.modal-mode]="isModalMode" *ngIf="!loading; else loadingTemplate">
      <!-- Header -->
      <header class="header">
        <nav class="navbar">
          <div class="nav-brand" [routerLink]="isModalMode ? null : '/'" [class.clickable]="!isModalMode">
            <i class="fas fa-home"></i>
            <h2>RealEstateHub</h2>
          </div>
          <div class="nav-buttons">
            <button class="btn btn-icon" (click)="toggleFavorite()" [class.favorited]="isFavorite" [title]="isFavorite ? 'Remove from favorites' : 'Add to favorites'">
              <i class="fas fa-heart"></i>
            </button>
            <button class="btn btn-icon" (click)="shareProperty()" title="Share property">
              <i class="fas fa-share-alt"></i>
            </button>
            <button class="btn btn-outline" (click)="goBack()" *ngIf="!isModalMode">
              <i class="fas fa-arrow-left"></i> Back
            </button>
            <button class="btn btn-outline" (click)="closeModal()" *ngIf="isModalMode">
              <i class="fas fa-times"></i> Close
            </button>
          </div>
        </nav>
      </header>

      <!-- Property Detail -->
      <div class="property-detail" *ngIf="property">
        <!-- Left Column: Images and Info -->
        <div class="left-column">
          <!-- Image Gallery -->
          <div class="image-gallery">
            <div class="main-image" (click)="openLightbox()">
              <img [src]="getMainImage()" [alt]="property.title" *ngIf="getMainImage()">
              <div class="no-image" *ngIf="!getMainImage()">
                <div class="category-icon">{{ getPropertyIcon(property.category) }}</div>
                <p>No photos available</p>
              </div>
              <!-- Carousel Navigation -->
              <button 
                class="main-carousel-nav main-carousel-prev" 
                *ngIf="property.images && property.images.length > 1"
                (click)="previousImage(); $event.stopPropagation()"
              >
                <i class="fas fa-chevron-left"></i>
              </button>
              <button 
                class="main-carousel-nav main-carousel-next" 
                *ngIf="property.images && property.images.length > 1"
                (click)="nextImage(); $event.stopPropagation()"
              >
                <i class="fas fa-chevron-right"></i>
              </button>
              <div class="image-overlay" *ngIf="getMainImage()">
                <i class="fas fa-search-plus"></i>
                <span>Click to view full gallery</span>
              </div>
              <!-- Image Dots for Main View -->
              <div class="main-image-dots" *ngIf="property.images && property.images.length > 1">
                <span 
                  *ngFor="let img of property.images; let i = index"
                  class="dot"
                  [class.active]="i === selectedImageIndex"
                  (click)="selectImage(i); $event.stopPropagation()"
                ></span>
              </div>
            </div>
            <div class="thumbnail-gallery" *ngIf="property.images && property.images.length > 1">
              <div 
                class="thumbnail" 
                *ngFor="let image of property.images.slice(0, 6); let i = index"
                [class.active]="i === selectedImageIndex"
                (click)="selectImage(i)"
              >
                <img [src]="image.image" [alt]="image.caption || property.title">
              </div>
              <div class="thumbnail more" *ngIf="property.images.length > 6" (click)="openLightbox()">
                <span>+{{ property.images.length - 6 }} more</span>
              </div>
            </div>
          </div>

          <!-- Property Description -->
          <div class="card">
            <h3><i class="fas fa-align-left"></i> About This Property</h3>
            <p class="description">{{ property.description || 'No description available' }}</p>
          </div>

          <!-- Property Features -->
          <div class="card">
            <h3><i class="fas fa-list-check"></i> Property Features</h3>
            <div class="features-grid">
              <div class="feature-item">
                <i class="fas fa-ruler-combined"></i>
                <div>
                  <span class="feature-label">Super Built-up Area</span>
                  <span class="feature-value">{{ property.carpet_area }} sq ft</span>
                </div>
              </div>
              <div class="feature-item" *ngIf="property.bedrooms !== 'N/A'">
                <i class="fas fa-bed"></i>
                <div>
                  <span class="feature-label">Bedrooms</span>
                  <span class="feature-value">{{ property.bedrooms }} BHK</span>
                </div>
              </div>
              <div class="feature-item" *ngIf="property.bathrooms !== 'N/A'">
                <i class="fas fa-bath"></i>
                <div>
                  <span class="feature-label">Bathrooms</span>
                  <span class="feature-value">{{ property.bathrooms }}</span>
                </div>
              </div>
              <div class="feature-item">
                <i class="fas fa-building"></i>
                <div>
                  <span class="feature-label">Property Type</span>
                  <span class="feature-value">{{ getCategoryDisplayName(property.category) }}</span>
                </div>
              </div>
              <div class="feature-item">
                <i class="fas fa-tag"></i>
                <div>
                  <span class="feature-label">Listed For</span>
                  <span class="feature-value">{{ property.type }}</span>
                </div>
              </div>
              <div class="feature-item">
                <i class="fas fa-calendar"></i>
                <div>
                  <span class="feature-label">Listed On</span>
                  <span class="feature-value">{{ property.created_at | date:'mediumDate' }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Amenities -->
          <div class="card" *ngIf="property.amenities">
            <h3><i class="fas fa-star"></i> Amenities</h3>
            <div class="amenities-grid" *ngIf="property.amenities.length > 0; else noAmenities">
              <div class="amenity-item" *ngFor="let amenity of property.amenities">
                <div class="amenity-icon-wrapper">
                  <i [class]="amenity.icon || 'fas fa-check-circle'"></i>
                </div>
                <div class="amenity-content">
                  <span class="amenity-name">{{ amenity.name }}</span>
                  <small class="amenity-desc" *ngIf="amenity.description">{{ amenity.description }}</small>
                </div>
              </div>
            </div>
            <ng-template #noAmenities>
              <div class="empty-amenities">
                <i class="fas fa-info-circle"></i>
                <p>No amenities listed for this property.</p>
              </div>
            </ng-template>
          </div>

          <!-- Location -->
          <div class="card">
            <h3><i class="fas fa-map-marker-alt"></i> Location</h3>
            <div class="location-info">
              <div class="location-item">
                <i class="fas fa-map-pin"></i>
                <div>
                  <span class="location-label">Address</span>
                  <span class="location-value">{{ property.location }}, {{ property.city }}</span>
                </div>
              </div>
              <div class="location-item">
                <i class="fas fa-city"></i>
                <div>
                  <span class="location-label">City</span>
                  <span class="location-value">{{ property.city }}, {{ property.state }}</span>
                </div>
              </div>
              <div class="location-item" *ngIf="property.pincode">
                <i class="fas fa-mail-bulk"></i>
                <div>
                  <span class="location-label">Pincode</span>
                  <span class="location-value">{{ property.pincode }}</span>
                </div>
              </div>
            </div>
            <!-- Map Placeholder -->
            <div class="map-placeholder">
              <i class="fas fa-map"></i>
              <p>Map view coming soon</p>
              <small>{{ property.location }}, {{ property.city }}, {{ property.state }}</small>
            </div>
          </div>
        </div>

        <!-- Right Column: Price and Actions -->
        <div class="right-column">
          <!-- Price Card -->
          <div class="price-card sticky">
            <div class="price-header">
              <div class="price-main">
                <span class="price-label">Price</span>
                <h2 class="price-value">₹{{ formatPrice(property.price) }}</h2>
              </div>
              <div class="property-badges">
                <span class="badge badge-primary">{{ property.type }}</span>
                <span class="badge badge-success" *ngIf="property.status === 'active'">Available</span>
              </div>
              <div class="tag-list" *ngIf="property.tags?.length">
                <span class="tag" *ngFor="let tag of property.tags">{{ tag.name }}</span>
              </div>
            </div>

            <!-- EMI Calculator -->
            <div class="emi-calculator" *ngIf="property.type === 'For Sale' && property.price < 10000000">
              <h4><i class="fas fa-calculator"></i> EMI Calculator</h4>
              <div class="calculator-inputs">
                <div class="input-group">
                  <label>Loan Amount (₹)</label>
                  <input type="number" [(ngModel)]="emiData.loanAmount" (input)="calculateEMI()" placeholder="e.g., 5000000">
                </div>
                <div class="input-group">
                  <label>Interest Rate (%)</label>
                  <input type="number" [(ngModel)]="emiData.interestRate" (input)="calculateEMI()" placeholder="e.g., 8.5" step="0.1">
                </div>
                <div class="input-group">
                  <label>Loan Tenure (Years)</label>
                  <input type="number" [(ngModel)]="emiData.tenure" (input)="calculateEMI()" placeholder="e.g., 20">
                </div>
              </div>
              <div class="emi-result" *ngIf="emiResult > 0">
                <div class="emi-amount">
                  <span class="emi-label">Monthly EMI</span>
                  <span class="emi-value">₹{{ emiResult | number:'1.0-0' }}</span>
                </div>
                <div class="emi-details">
                  <small>Principal: ₹{{ emiData.loanAmount | number:'1.0-0' }}</small>
                  <small>Total Interest: ₹{{ getTotalInterest() | number:'1.0-0' }}</small>
                  <small>Total Amount: ₹{{ getTotalAmount() | number:'1.0-0' }}</small>
                </div>
              </div>
            </div>

            <!-- Owner Information -->
            <div class="owner-section" *ngIf="property.owner_name">
              <h4><i class="fas fa-user-tie"></i> Property Owner</h4>
              <div class="owner-info">
                <div class="owner-name">
                  <i class="fas fa-user"></i>
                  <span>{{ property.owner_name }}</span>
                </div>
                <div class="owner-contact" *ngIf="property.owner_phone">
                  <i class="fas fa-phone"></i>
                  <ng-container *ngIf="property.owner_phone_full; else maskedPhone">
                    <a [href]="'tel:' + property.owner_phone_full">{{ property.owner_phone }}</a>
                  </ng-container>
                  <ng-template #maskedPhone>
                    <span>{{ property.owner_phone }}</span>
                    <small class="phone-note">Full number available after verification</small>
                  </ng-template>
                </div>
                <div class="owner-warning" *ngIf="property.owner_phone && !property.is_phone_approved">
                  <i class="fas fa-lock"></i>
                  <span>Phone verification pending. We'll alert you once the owner contact is approved.</span>
                </div>
                <div class="owner-contact" *ngIf="property.owner_email">
                  <i class="fas fa-envelope"></i>
                  <a [href]="'mailto:' + property.owner_email">{{ property.owner_email }}</a>
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="action-buttons">
              <button class="btn btn-primary btn-large" (click)="openContactModal()">
                <i class="fas fa-phone-alt"></i>
                Contact Owner
              </button>
              <button class="btn btn-outline" (click)="scheduleVisit()">
                <i class="fas fa-calendar-check"></i>
                Schedule Visit
              </button>
              <button class="btn btn-outline" (click)="getCallBack()">
                <i class="fas fa-headset"></i>
                Request Callback
              </button>
            </div>

            <!-- Quick Actions -->
            <div class="quick-actions">
              <button class="quick-btn" (click)="toggleFavorite()">
                <i class="fas fa-heart" [class.favorited]="isFavorite"></i>
                <span>{{ isFavorite ? 'Saved' : 'Save' }}</span>
              </button>
              <button class="quick-btn" (click)="shareProperty()">
                <i class="fas fa-share-alt"></i>
                <span>Share</span>
              </button>
              <button class="quick-btn" (click)="printProperty()">
                <i class="fas fa-print"></i>
                <span>Print</span>
              </button>
              <button class="quick-btn" (click)="reportProperty()">
                <i class="fas fa-flag"></i>
                <span>Report</span>
              </button>
            </div>

            <!-- Property ID & Views -->
            <div class="property-meta">
              <small>Property ID: #{{ property.id }}</small>
              <small>{{ getViewCount() }} views</small>
            </div>
          </div>

          <!-- Similar Properties -->
          <div class="similar-properties" *ngIf="similarProperties.length > 0">
            <h4><i class="fas fa-th-large"></i> Similar Properties</h4>
            <div class="similar-list">
              <div class="similar-card" *ngFor="let similar of similarProperties" (click)="viewProperty(similar.id)">
                <div class="similar-image">
                  <span class="category-icon-small">{{ getPropertyIcon(similar.category) }}</span>
                </div>
                <div class="similar-info">
                  <h5>{{ similar.title }}</h5>
                  <p>{{ similar.location }}</p>
                  <span class="similar-price">{{ similar.price }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Contact Modal -->
    <div class="modal" *ngIf="showContactModal" (click)="closeContactModal()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3><i class="fas fa-envelope"></i> Contact Property Owner</h3>
          <button class="btn-close" (click)="closeContactModal()">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body">
          <form (ngSubmit)="submitContactForm()" #contactForm="ngForm">
            <div class="form-group">
              <label>Your Name *</label>
              <input 
                type="text" 
                name="name"
                [(ngModel)]="contactData.name" 
                required 
                placeholder="Enter your full name"
              >
            </div>
            <div class="form-group">
              <label>Your Email *</label>
              <input 
                type="email" 
                name="email"
                [(ngModel)]="contactData.email" 
                required 
                placeholder="your.email@example.com"
              >
            </div>
            <div class="form-group">
              <label>Your Phone *</label>
              <input 
                type="tel" 
                name="phone"
                [(ngModel)]="contactData.phone" 
                required 
                placeholder="+91 98765 43210"
              >
            </div>
            <div class="form-group">
              <label>Message *</label>
              <textarea 
                name="message"
                [(ngModel)]="contactData.message" 
                required 
                rows="4"
                placeholder="I'm interested in this property. Please provide more details..."
              ></textarea>
            </div>
            <button 
              type="submit" 
              class="btn btn-primary btn-block"
              [disabled]="contactForm.invalid || submitting"
            >
              <i class="fas fa-paper-plane"></i>
              {{ submitting ? 'Sending...' : 'Send Message' }}
            </button>
          </form>
        </div>
      </div>
    </div>

    <!-- Image Lightbox -->
    <div class="lightbox" *ngIf="showLightbox" (click)="closeLightbox()">
      <button class="lightbox-close" (click)="closeLightbox()">
        <i class="fas fa-times"></i>
      </button>
      <button class="lightbox-prev" (click)="previousImage(); $event.stopPropagation()" *ngIf="hasMultipleImages()">
        <i class="fas fa-chevron-left"></i>
      </button>
      <button class="lightbox-next" (click)="nextImage(); $event.stopPropagation()" *ngIf="hasMultipleImages()">
        <i class="fas fa-chevron-right"></i>
      </button>
      <div class="lightbox-content" (click)="$event.stopPropagation()">
        <img [src]="getMainImage()" [alt]="property?.title || ''">
        <div class="lightbox-caption" *ngIf="getCurrentImageCaption()">
          {{ getCurrentImageCaption() }}
        </div>
        <!-- Image Dots -->
        <div class="lightbox-dots" *ngIf="hasMultipleImages()">
          <span 
            *ngFor="let img of property?.images; let i = index"
            class="dot"
            [class.active]="i === selectedImageIndex"
            (click)="selectImage(i); $event.stopPropagation()"
          ></span>
        </div>
      </div>
    </div>

    <ng-template #loadingTemplate>
      <div class="loading-container">
        <div class="loading-spinner"></div>
        <p>Loading property details...</p>
      </div>
    </ng-template>
  `,
  styles: [`
    .property-detail-container {
      min-height: 100vh;
      background: #f8fafc;
    }

    .header {
      background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
      position: sticky;
      top: 0;
      z-index: 100;
      border-bottom: 1px solid #e2e8f0;
    }

    .navbar {
      max-width: 1400px;
      margin: 0 auto;
      padding: 1.25rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .nav-brand {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .nav-brand.clickable:hover {
      opacity: 0.8;
      transform: translateX(-2px);
    }

    .nav-brand i {
      color: #2563eb;
      font-size: 1.5rem;
    }

    .nav-brand h2 {
      margin: 0;
      color: #1e293b;
      font-size: 1.5rem;
      font-weight: 700;
      background: linear-gradient(135deg, #2563eb, #1d4ed8);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .nav-buttons {
      display: flex;
      gap: 0.75rem;
      align-items: center;
    }

    .btn-icon {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      border: 2px solid #e2e8f0;
      background: white;
      color: #64748b;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.1rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    }

    .btn-icon:hover {
      border-color: #2563eb;
      color: #2563eb;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
    }

    .btn-icon.favorited {
      color: #ef4444;
      background: linear-gradient(135deg, #fee2e2, #fecaca);
      border-color: #ef4444;
      box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2);
    }

    .btn-icon.favorited i {
      animation: heartbeat 0.3s ease;
    }

    .btn-outline {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.6rem 1.25rem;
      border-radius: 10px;
      border: 2px solid #e2e8f0;
      background: white;
      color: #475569;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 0.95rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    }

    .btn-outline:hover {
      border-color: #2563eb;
      color: #2563eb;
      background: #eff6ff;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.2);
    }

    @keyframes heartbeat {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.2); }
    }

    .property-detail {
      max-width: 1400px;
      margin: 2rem auto;
      padding: 0 2rem;
      display: grid;
      grid-template-columns: 1fr 400px;
      gap: 2rem;
      align-items: start;
    }

    .left-column, .right-column {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    /* Image Gallery */
    .image-gallery {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .main-image {
      width: 100%;
      height: 500px;
      border-radius: 16px;
      overflow: hidden;
      background: #e2e8f0;
      position: relative;
      cursor: pointer;
      box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    }

    .main-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }

    .main-image:hover img {
      transform: scale(1.05);
    }

    /* Main Image Carousel Navigation */
    .main-carousel-nav {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.95);
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: all 0.3s;
      z-index: 10;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .main-image:hover .main-carousel-nav {
      opacity: 1;
    }

    .main-carousel-prev {
      left: 16px;
    }

    .main-carousel-next {
      right: 16px;
    }

    .main-carousel-nav:hover {
      background: white;
      transform: translateY(-50%) scale(1.1);
    }

    .main-carousel-nav i {
      color: #3b82f6;
      font-size: 1.2rem;
    }

    /* Main Image Dots */
    .main-image-dots {
      position: absolute;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 8px;
      z-index: 10;
      padding: 8px 16px;
      background: rgba(0, 0, 0, 0.5);
      border-radius: 24px;
      backdrop-filter: blur(10px);
    }

    .main-image-dots .dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.5);
      cursor: pointer;
      transition: all 0.3s;
    }

    .main-image-dots .dot:hover {
      background: rgba(255, 255, 255, 0.8);
      transform: scale(1.2);
    }

    .main-image-dots .dot.active {
      background: white;
      width: 32px;
      border-radius: 5px;
    }

    .no-image {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: #64748b;
    }

    .category-icon {
      font-size: 6rem;
      margin-bottom: 1rem;
    }

    .image-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.3s ease;
      color: white;
      gap: 0.5rem;
    }

    .main-image:hover .image-overlay {
      opacity: 1;
    }

    .image-overlay i {
      font-size: 2.5rem;
    }

    .image-count {
      position: absolute;
      bottom: 1rem;
      right: 1rem;
      background: rgba(0,0,0,0.7);
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-size: 0.875rem;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .thumbnail-gallery {
      display: flex;
      gap: 0.75rem;
      overflow-x: auto;
      padding-bottom: 0.5rem;
    }

    .thumbnail-gallery::-webkit-scrollbar {
      height: 6px;
    }

    .thumbnail-gallery::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 3px;
    }

    .thumbnail {
      min-width: 100px;
      height: 100px;
      border-radius: 8px;
      overflow: hidden;
      cursor: pointer;
      border: 3px solid transparent;
      transition: all 0.3s ease;
      flex-shrink: 0;
    }

    .thumbnail:hover {
      border-color: #94a3b8;
      transform: translateY(-2px);
    }

    .thumbnail.active {
      border-color: #2563eb;
      box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.2);
    }

    .thumbnail img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .thumbnail.more {
      background: #e2e8f0;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #64748b;
      font-weight: 600;
      font-size: 0.875rem;
    }

    /* Cards */
    .card {
      background: white;
      border-radius: 16px;
      padding: 2rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
      border: 1px solid #e2e8f0;
    }

    .card h3, .card h4 {
      margin: 0 0 1.5rem 0;
      color: #1e293b;
      font-size: 1.25rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .card h3 i, .card h4 i {
      color: #2563eb;
    }

    .description {
      line-height: 1.7;
      color: #475569;
      margin: 0;
    }

    /* Features Grid */
    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 1rem;
    }

    .feature-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: #f8fafc;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
      transition: all 0.3s ease;
    }

    .feature-item:hover {
      background: #eff6ff;
      border-color: #bfdbfe;
      transform: translateY(-2px);
    }

    .feature-item i {
      color: #2563eb;
      font-size: 1.5rem;
      width: 30px;
      text-align: center;
    }

    .feature-item div {
      display: flex;
      flex-direction: column;
    }

    .feature-label {
      font-size: 0.75rem;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .feature-value {
      font-weight: 600;
      color: #1e293b;
      font-size: 1rem;
    }

    /* Amenities */
    .amenities-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 1rem;
    }

    .amenity-item {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      padding: 1rem;
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      transition: all 0.3s ease;
      cursor: default;
    }

    .amenity-item:hover {
      background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
      border-color: #3b82f6;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
    }

    .amenity-icon-wrapper {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: linear-gradient(135deg, #10b981, #059669);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      box-shadow: 0 2px 8px rgba(16, 185, 129, 0.2);
    }

    .amenity-icon-wrapper i {
      color: white;
      font-size: 1.2rem;
    }

    .amenity-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .amenity-name {
      font-weight: 600;
      color: #1e293b;
      font-size: 0.95rem;
      line-height: 1.4;
    }

    .amenity-desc {
      color: #64748b;
      font-size: 0.8rem;
      line-height: 1.3;
      margin: 0;
    }

    .empty-amenities {
      text-align: center;
      padding: 2rem;
      color: #94a3b8;
    }

    .empty-amenities i {
      font-size: 2rem;
      margin-bottom: 0.5rem;
      opacity: 0.5;
    }

    .empty-amenities p {
      margin: 0;
      font-size: 0.9rem;
    }

    /* Location */
    .location-info {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .location-item {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .location-item i {
      color: #2563eb;
      font-size: 1.25rem;
      width: 24px;
      text-align: center;
    }

    .location-item div {
      display: flex;
      flex-direction: column;
    }

    .location-label {
      font-size: 0.75rem;
      color: #64748b;
      text-transform: uppercase;
    }

    .location-value {
      font-weight: 600;
      color: #1e293b;
    }

    .map-placeholder {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 12px;
      padding: 3rem;
      text-align: center;
      color: white;
    }

    .map-placeholder i {
      font-size: 3rem;
      margin-bottom: 1rem;
      opacity: 0.9;
    }

    .map-placeholder p {
      margin: 0.5rem 0;
      font-size: 1.1rem;
      font-weight: 600;
    }

    .map-placeholder small {
      opacity: 0.9;
      font-size: 0.875rem;
    }

    /* Price Card */
    .price-card {
      background: white;
      border-radius: 16px;
      padding: 2rem;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
      border: 1px solid #e2e8f0;
    }

    .price-card.sticky {
      position: sticky;
      top: 100px;
    }

    .price-header {
      margin-bottom: 2rem;
      padding-bottom: 1.5rem;
      border-bottom: 2px solid #f1f5f9;
    }

    .price-main {
      margin-bottom: 1rem;
    }

    .price-label {
      font-size: 0.875rem;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .price-value {
      color: #2563eb;
      font-size: 2.5rem;
      font-weight: 800;
      margin: 0.5rem 0;
      line-height: 1;
    }

    .property-badges {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .tag-list {
      display: flex;
      flex-wrap: wrap;
      gap: 0.4rem;
      margin-top: 0.75rem;
    }

    .tag-list .tag {
      background: #eef2ff;
      color: #3730a3;
      border-radius: 999px;
      padding: 0.2rem 0.75rem;
      font-size: 0.8rem;
      font-weight: 600;
    }

    .badge {
      padding: 0.4rem 0.9rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.3px;
    }

    .badge-primary { background: #dbeafe; color: #1e40af; }
    .badge-secondary { background: #f1f5f9; color: #475569; }
    .badge-success { background: #d1fae5; color: #065f46; }

    /* EMI Calculator */
    .emi-calculator {
      background: #f8fafc;
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
      border: 1px solid #e2e8f0;
    }

    .emi-calculator h4 {
      margin: 0 0 1rem 0;
      font-size: 1rem;
      color: #1e293b;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .calculator-inputs {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 1rem;
    }

    .input-group {
      display: flex;
      flex-direction: column;
    }

    .input-group label {
      font-size: 0.75rem;
      color: #64748b;
      margin-bottom: 0.4rem;
      font-weight: 600;
    }

    .input-group input {
      padding: 0.6rem;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      font-size: 0.875rem;
      transition: border-color 0.3s ease;
    }

    .input-group input:focus {
      outline: none;
      border-color: #2563eb;
    }

    .emi-result {
      background: white;
      border-radius: 8px;
      padding: 1rem;
      border: 2px solid #2563eb;
    }

    .emi-amount {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid #e2e8f0;
      margin-bottom: 0.75rem;
    }

    .emi-label {
      font-size: 0.75rem;
      color: #64748b;
      text-transform: uppercase;
    }

    .emi-value {
      font-size: 2rem;
      font-weight: 800;
      color: #2563eb;
      line-height: 1.2;
    }

    .emi-details {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .emi-details small {
      color: #64748b;
      font-size: 0.75rem;
    }

    /* Owner Section */
    .owner-section {
      background: #f8fafc;
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
    }

    .owner-section h4 {
      margin: 0 0 1rem 0;
      font-size: 1rem;
      color: #1e293b;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .owner-info {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .owner-name, .owner-contact {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      color: #475569;
      font-size: 0.875rem;
    }

    .owner-contact i {
      color: #2563eb;
      width: 16px;
    }

    .owner-contact a {
      color: #2563eb;
      text-decoration: none;
      font-weight: 500;
    }

    .owner-contact a:hover {
      text-decoration: underline;
    }

    .phone-note {
      display: block;
      font-size: 0.8rem;
      color: #94a3b8;
      margin-top: 0.2rem;
    }

    .owner-warning {
      margin-top: 1rem;
      padding: 0.75rem 1rem;
      border-radius: 12px;
      background: #fff7ed;
      color: #9a3412;
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }

    .owner-warning i {
      color: #ea580c;
    }

    /* Action Buttons */
    .action-buttons {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      margin-bottom: 1.5rem;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0.75rem 1.5rem;
      font-size: 1rem;
      font-weight: 600;
      border: 1px solid transparent;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      gap: 0.75rem;
      text-decoration: none;
    }

    .btn-large {
      padding: 1rem 1.5rem;
      font-size: 1.1rem;
    }

    .btn-block {
      width: 100%;
    }

    .btn-primary {
      background: linear-gradient(135deg, #2563eb, #1d4ed8);
      color: white;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
    }

    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(37, 99, 235, 0.4);
    }

    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }

    .btn-outline {
      background: white;
      border-color: #e2e8f0;
      color: #1e293b;
    }

    .btn-outline:hover {
      background: #f8fafc;
      border-color: #2563eb;
      color: #2563eb;
    }

    /* Quick Actions */
    .quick-actions {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
      padding-bottom: 1.5rem;
      border-bottom: 1px solid #e2e8f0;
      margin-bottom: 1.5rem;
    }

    .quick-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.4rem;
      padding: 1rem 0.5rem;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      color: #475569;
      font-size: 0.875rem;
    }

    .quick-btn:hover {
      background: white;
      border-color: #2563eb;
      color: #2563eb;
      transform: translateY(-2px);
    }

    .quick-btn i {
      font-size: 1.25rem;
    }

    .quick-btn i.favorited {
      color: #ef4444;
    }

    /* Property Meta */
    .property-meta {
      display: flex;
      justify-content: space-between;
      font-size: 0.75rem;
      color: #94a3b8;
      padding-top: 1rem;
      border-top: 1px solid #f1f5f9;
    }

    /* Similar Properties */
    .similar-properties {
      background: white;
      border-radius: 16px;
      padding: 1.5rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
      border: 1px solid #e2e8f0;
    }

    .similar-properties h4 {
      margin: 0 0 1rem 0;
      font-size: 1rem;
      color: #1e293b;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .similar-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .similar-card {
      display: flex;
      gap: 1rem;
      padding: 0.75rem;
      background: #f8fafc;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      border: 1px solid transparent;
    }

    .similar-card:hover {
      background: white;
      border-color: #2563eb;
      transform: translateX(4px);
    }

    .similar-image {
      width: 60px;
      height: 60px;
      border-radius: 6px;
      background: #e2e8f0;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .category-icon-small {
      font-size: 1.5rem;
    }

    .similar-info {
      flex: 1;
      min-width: 0;
    }

    .similar-info h5 {
      margin: 0 0 0.25rem 0;
      font-size: 0.875rem;
      color: #1e293b;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .similar-info p {
      margin: 0 0 0.4rem 0;
      font-size: 0.75rem;
      color: #64748b;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .similar-price {
      font-size: 0.875rem;
      font-weight: 700;
      color: #2563eb;
    }

    /* Contact Modal */
    .modal {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 1rem;
      animation: fadeIn 0.3s ease;
    }

    .modal-content {
      background: white;
      border-radius: 16px;
      max-width: 500px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
      animation: slideUp 0.3s ease;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem 2rem;
      border-bottom: 1px solid #e2e8f0;
    }

    .modal-header h3 {
      margin: 0;
      font-size: 1.25rem;
      color: #1e293b;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .btn-close {
      background: none;
      border: none;
      font-size: 1.5rem;
      color: #64748b;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 50%;
      transition: all 0.3s ease;
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .btn-close:hover {
      background: #f1f5f9;
      color: #1e293b;
    }

    .modal-body {
      padding: 2rem;
    }

    .form-group {
      margin-bottom: 1.25rem;
    }

    .form-group label {
      display: block;
      font-size: 0.875rem;
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 0.5rem;
    }

    .form-group input,
    .form-group textarea {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      font-size: 1rem;
      transition: all 0.3s ease;
      font-family: inherit;
    }

    .form-group input:focus,
    .form-group textarea:focus {
      outline: none;
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    }

    .form-group textarea {
      resize: vertical;
    }

    /* Lightbox */
    .lightbox {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.95);
      z-index: 2000;
      display: flex;
      align-items: center;
      justify-content: center;
      animation: fadeIn 0.3s ease;
    }

    .lightbox-close {
      position: absolute;
      top: 2rem;
      right: 2rem;
      background: rgba(255,255,255,0.2);
      border: none;
      color: white;
      font-size: 2rem;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      backdrop-filter: blur(10px);
    }

    .lightbox-close:hover {
      background: rgba(255,255,255,0.3);
      transform: rotate(90deg);
    }

    .lightbox-prev, .lightbox-next {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      background: rgba(255,255,255,0.2);
      border: none;
      color: white;
      font-size: 2rem;
      width: 50px;
      height: 50px;
      border-radius: 50%;
      cursor: pointer;
      transition: all 0.3s ease;
      backdrop-filter: blur(10px);
    }

    .lightbox-prev {
      left: 2rem;
    }

    .lightbox-next {
      right: 2rem;
    }

    .lightbox-prev:hover, .lightbox-next:hover {
      background: rgba(255,255,255,0.3);
      transform: translateY(-50%) scale(1.1);
    }

    .lightbox-content {
      max-width: 90vw;
      max-height: 90vh;
      position: relative;
    }

    .lightbox-content img {
      max-width: 100%;
      max-height: 90vh;
      border-radius: 8px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.5);
    }

    .lightbox-caption {
      position: absolute;
      bottom: 2rem;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0,0,0,0.7);
      color: white;
      padding: 0.75rem 1.5rem;
      border-radius: 20px;
      font-size: 0.875rem;
      backdrop-filter: blur(10px);
    }

    /* Lightbox Dots */
    .lightbox-dots {
      position: absolute;
      top: 2rem;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 8px;
      z-index: 10;
      padding: 8px 16px;
      background: rgba(0, 0, 0, 0.5);
      border-radius: 24px;
      backdrop-filter: blur(10px);
    }

    .lightbox-dots .dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.5);
      cursor: pointer;
      transition: all 0.3s;
    }

    .lightbox-dots .dot:hover {
      background: rgba(255, 255, 255, 0.8);
      transform: scale(1.2);
    }

    .lightbox-dots .dot.active {
      background: white;
      width: 32px;
      border-radius: 5px;
    }

    /* Animations */
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideUp {
      from { transform: translateY(30px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }

    /* Loading */
    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 60vh;
      gap: 1.5rem;
      color: #64748b;
    }

    .loading-spinner {
      width: 4rem;
      height: 4rem;
      border: 4px solid #e2e8f0;
      border-radius: 50%;
      border-top-color: #2563eb;
      animation: spin 0.8s linear infinite;
    }

    /* Responsive */
    @media (max-width: 1024px) {
      .property-detail {
        grid-template-columns: 1fr;
      }

      .price-card.sticky {
        position: static;
      }

      .navbar {
        padding: 1rem 1.5rem;
      }

      .nav-brand h2 {
        font-size: 1.3rem;
      }
    }

    @media (max-width: 768px) {
      .property-detail {
        padding: 0 1rem;
        gap: 1.5rem;
      }

      .main-image {
        height: 300px;
      }

      .features-grid {
        grid-template-columns: 1fr;
      }

      .amenities-grid {
        grid-template-columns: 1fr;
      }

      .price-value {
        font-size: 2rem;
      }

      .quick-actions {
        grid-template-columns: 1fr 1fr;
      }

      .lightbox-prev {
        left: 1rem;
      }

      .lightbox-next {
        right: 1rem;
      }

      .lightbox-close {
        top: 1rem;
        right: 1rem;
      }
    }

    @media (max-width: 480px) {
      .navbar {
        padding: 1rem;
      }

      .nav-brand h2 {
        font-size: 1.2rem;
      }

      .card {
        padding: 1.5rem;
      }

      .main-image {
        height: 250px;
      }

      .thumbnail {
        min-width: 80px;
        height: 80px;
      }
    }

    /* ===========================
       MODAL STYLES
    =========================== */
    
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.75);
      backdrop-filter: blur(4px);
      z-index: 9998;
      animation: fadeIn 0.3s ease;
    }

    .property-detail-container.modal-mode {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 95%;
      max-width: 1400px;
      max-height: 95vh;
      overflow-y: auto;
      background: white;
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      z-index: 9999;
      animation: slideUp 0.3s ease;
    }

    .clickable {
      cursor: pointer;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translate(-50%, -45%);
      }
      to {
        opacity: 1;
        transform: translate(-50%, -50%);
      }
    }

    /* Modal Mode: Adjust scrolling */
    .property-detail-container.modal-mode {
      padding-bottom: 2rem;
    }

    /* Responsive Modal */
    @media (max-width: 768px) {
      .property-detail-container.modal-mode {
        width: 100%;
        max-width: 100%;
        height: 100%;
        max-height: 100%;
        border-radius: 0;
        top: 0;
        left: 0;
        transform: none;
      }
    }
  `]
})
export class PropertyDetailComponent implements OnInit, OnDestroy {
  @Input() propertyId?: number; // For modal mode
  @Input() isModalMode = false; // Whether component is used as modal
  @Output() closeModalEvent = new EventEmitter<void>(); // Emit when modal closes
  
  property: Property | null = null;
  loading = false;
  selectedImageIndex = 0;
  isFavorite = false;
  showContactModal = false;
  showLightbox = false;
  submitting = false;
  similarProperties: any[] = [];
  
  // EMI Calculator
  emiData = {
    loanAmount: 0,
    interestRate: 8.5,
    tenure: 20
  };
  emiResult = 0;
  
  // Contact Form
  contactData = {
    name: '',
    email: '',
    phone: '',
    message: ''
  };
  isAuthenticated = false;
  currentUser: User | null = null;

  constructor(
    private propertyService: PropertyService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService
  ) {}

  ngOnInit() {
    this.isAuthenticated = this.authService.isAuthenticated();
    this.currentUser = this.authService.getCurrentUserValue();
    this.prefillContactData();
    // Modal mode: use @Input propertyId
    if (this.isModalMode && this.propertyId) {
      this.loadProperty(this.propertyId.toString());
      this.checkIfFavorite(this.propertyId.toString());
      this.addToRecentlyViewed(this.propertyId.toString());
      this.trackView(this.propertyId.toString());
      // Disable body scroll when modal opens
      document.body.style.overflow = 'hidden';
    } 
    // Route mode: use route params
    else {
      this.route.params.subscribe(params => {
        const propertyId = params['id'];
        if (propertyId) {
          this.loadProperty(propertyId);
          this.checkIfFavorite(propertyId);
          this.addToRecentlyViewed(propertyId);
          this.trackView(propertyId);
        }
      });
    }
  }

  ngOnDestroy() {
    // Re-enable body scroll when modal closes
    if (this.isModalMode) {
      document.body.style.overflow = 'auto';
    }
  }

  closeModal() {
    if (this.isModalMode) {
      document.body.style.overflow = 'auto';
      this.closeModalEvent.emit();
    }
  }

  goBack() {
    if (!this.isModalMode) {
      this.router.navigate(['/']);
    }
  }

  trackView(id: string) {
    // Track property view (fire and forget)
    this.propertyService.trackPropertyView(+id).subscribe({
      next: (response) => {
        console.log(`Property view tracked. Total views: ${response.view_count}`);
      },
      error: (error) => {
        console.error('Error tracking view:', error);
      }
    });
  }

  loadProperty(id: string) {
    this.loading = true;
    this.spinner.show();

    this.propertyService.getProperty(+id).subscribe({
      next: (property: Property) => {
        // Ensure amenities is always an array
        if (!property.amenities || !Array.isArray(property.amenities)) {
          property.amenities = [];
        }
        this.property = property;
        console.log('Loaded property:', property);
        console.log('Property amenities:', property.amenities);
        console.log('Amenities count:', property.amenities.length);
        this.loading = false;
        this.spinner.hide();
        
        // Pre-fill contact message
        this.contactData.message = `Hi, I'm interested in ${property.title} at ${property.location}. Please provide more details.`;
        
        // Load similar properties
        this.loadSimilarProperties(property);
      },
      error: (error: any) => {
        console.error('Error loading property:', error);
        this.loading = false;
        this.spinner.hide();
        this.toastr.error('Property not found');
        if (!this.isModalMode) {
          this.router.navigate(['/']);
        }
      }
    });
  }

  loadSimilarProperties(currentProperty: Property) {
    this.propertyService.getProperties({
      category: currentProperty.category,
      type: currentProperty.type
    }).subscribe({
      next: (response) => {
        const list = response?.results ?? [];
        this.similarProperties = list
          .filter((p: Property) => p.id !== currentProperty.id)
          .slice(0, 4);
      },
      error: (error) => console.error('Error loading similar properties:', error)
    });
  }

  getMainImage(): string | null {
    if (!this.property?.images || this.property.images.length === 0) {
      return null;
    }
    // Try to get primary image first
    const primaryImage = this.property.images.find(img => img.is_primary);
    if (primaryImage) {
      return primaryImage.image;
    }
    // Otherwise use selected index
    return this.property.images[this.selectedImageIndex]?.image || null;
  }

  getCurrentImageCaption(): string | null {
    if (!this.property?.images || this.property.images.length === 0) {
      return null;
    }
    return this.property.images[this.selectedImageIndex]?.caption || null;
  }

  selectImage(index: number) {
    this.selectedImageIndex = index;
  }

  previousImage() {
    if (this.property?.images && this.property.images.length > 0) {
      this.selectedImageIndex = (this.selectedImageIndex - 1 + this.property.images.length) % this.property.images.length;
    }
  }

  nextImage() {
    if (this.property?.images && this.property.images.length > 0) {
      this.selectedImageIndex = (this.selectedImageIndex + 1) % this.property.images.length;
    }
  }

  openLightbox() {
    if (this.getMainImage()) {
      this.showLightbox = true;
      document.body.style.overflow = 'hidden';
    }
  }

  closeLightbox() {
    this.showLightbox = false;
    document.body.style.overflow = 'auto';
  }

  getCategoryDisplayName(category?: string): string {
    const categoryMap: { [key: string]: string } = {
      'flat': 'Flat/Apartment',
      'house': 'House/Villa',
      'plot': 'Plot',
      'commercial': 'Commercial'
    };
    if (!category) {
      return 'General';
    }
    return categoryMap[category] || category;
  }

  getPropertyIcon(category?: string): string {
    const iconMap: { [key: string]: string } = {
      'flat': '🏢',
      'house': '🏠',
      'plot': '🗺️',
      'commercial': '🏪'
    };
    if (!category) {
      return '🏠';
    }
    return iconMap[category] || '🏠';
  }

  getAmenitiesList(): Amenity[] {
    if (!this.property?.amenities) return [];
    return this.property.amenities || [];
  }

  // Favorites
  toggleFavorite() {
    if (!this.property) return;
    
    const favorites = this.getFavorites();
    const index = favorites.indexOf(this.property.id);
    
    if (index > -1) {
      favorites.splice(index, 1);
      this.isFavorite = false;
      this.toastr.info('Removed from favorites');
    } else {
      favorites.push(this.property.id);
      this.isFavorite = true;
      this.toastr.success('Added to favorites!');
    }
    
    localStorage.setItem('favoriteProperties', JSON.stringify(favorites));
  }

  checkIfFavorite(propertyId: string) {
    const favorites = this.getFavorites();
    this.isFavorite = favorites.includes(+propertyId);
  }

  getFavorites(): number[] {
    const favorites = localStorage.getItem('favoriteProperties');
    return favorites ? JSON.parse(favorites) : [];
  }

  // Recently Viewed
  addToRecentlyViewed(propertyId: string) {
    const recent = this.getRecentlyViewed();
    const id = +propertyId;
    
    // Remove if already exists
    const filtered = recent.filter(r => r !== id);
    
    // Add to front
    filtered.unshift(id);
    
    // Keep only last 10
    const updated = filtered.slice(0, 10);
    
    localStorage.setItem('recentlyViewed', JSON.stringify(updated));
  }

  getRecentlyViewed(): number[] {
    const recent = localStorage.getItem('recentlyViewed');
    return recent ? JSON.parse(recent) : [];
  }

  getViewCount(): string {
    // Simulate view count (in production, track on backend)
    return `${Math.floor(Math.random() * 500) + 100}`;
  }

  // EMI Calculator
  calculateEMI() {
    const P = this.emiData.loanAmount;
    const r = this.emiData.interestRate / 12 / 100;
    const n = this.emiData.tenure * 12;
    
    if (P > 0 && r > 0 && n > 0) {
      this.emiResult = P * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
    } else {
      this.emiResult = 0;
    }
  }

  getTotalInterest(): number {
    return (this.emiResult * this.emiData.tenure * 12) - this.emiData.loanAmount;
  }

  getTotalAmount(): number {
    return this.emiResult * this.emiData.tenure * 12;
  }

  // Contact Modal
  openContactModal() {
    if (!this.isAuthenticated) {
      // For non-logged-in users, show modal
      this.toastr.info('Please login to contact the property owner.');
      this.router.navigate(['/login']);
      return;
    }
    
    // For logged-in users, send enquiry directly without modal
    if (this.isAuthenticated && this.currentUser) {
      this.contactOwnerDirectly();
      return;
    }
    
    this.prefillContactData();
    this.showContactModal = true;
    document.body.style.overflow = 'hidden';
  }

  contactOwnerDirectly() {
    if (this.submitting || !this.property) return;
    if (!this.currentUser) return;
    
    this.submitting = true;
    this.prefillContactData();
    
    const fullMessage = `${this.contactData.message}\n\nProperty: ${this.property?.title}\nLocation: ${this.property?.location}\nPrice: ₹${this.formatPrice(this.property?.price)}`;
    
    const payload = {
      name: this.contactData.name,
      email: this.contactData.email,
      phone: this.contactData.phone,
      message: fullMessage
    };
    
    this.propertyService.createPropertyEnquiry(this.property.id, payload).subscribe({
      next: () => {
        this.toastr.success('Your enquiry has been sent successfully! The owner will contact you soon.', 'Enquiry Sent');
        this.resetContactForm();
        this.submitting = false;
      },
      error: (error) => {
        console.error('Error submitting enquiry:', error);
        this.toastr.error(error?.error?.detail || 'Failed to send enquiry. Please try again.', 'Error');
        this.submitting = false;
      }
    });
  }

  closeContactModal() {
    this.showContactModal = false;
    document.body.style.overflow = 'auto';
  }

  submitContactForm() {
    if (this.submitting || !this.property) return;
    if (!this.ensureAuthenticated()) {
      return;
    }
    
    this.submitting = true;
    
    const fullMessage = `${this.contactData.message}\n\nProperty: ${this.property?.title}\nLocation: ${this.property?.location}\nPrice: ${this.property?.price}`;
    
    const payload = {
      name: this.contactData.name,
      email: this.contactData.email,
      phone: this.contactData.phone,
      message: fullMessage
    };
    
    this.propertyService.createPropertyEnquiry(this.property.id, payload).subscribe({
      next: () => {
        this.toastr.success('Your enquiry has been shared with the owner!', 'Success');
        this.closeContactModal();
        this.resetContactForm();
        this.submitting = false;
      },
      error: (error) => {
        console.error('Error submitting enquiry:', error);
        this.toastr.error(error?.error?.detail || 'Failed to send enquiry. Please try again.', 'Error');
        this.submitting = false;
      }
    });
  }

  resetContactForm() {
    this.contactData.message = '';
    this.prefillContactData();
  }

  private ensureAuthenticated(): boolean {
    if (!this.authService.isAuthenticated()) {
      this.toastr.info('Please login to contact the property owner.');
      this.router.navigate(['/login']);
      return false;
    }
    return true;
  }

  private prefillContactData(): void {
    if (!this.currentUser) {
      return;
    }
    const fullName = `${this.currentUser.first_name ?? ''} ${this.currentUser.last_name ?? ''}`.trim();
    this.contactData.name = fullName || this.currentUser.username;
    this.contactData.email = this.currentUser.email;
    if (this.currentUser.phone) {
      this.contactData.phone = this.currentUser.phone;
    }
  }

  // Actions
  scheduleVisit() {
    this.contactData.message = `I would like to schedule a visit to view ${this.property?.title} at ${this.property?.location}. Please let me know your available time slots.`;
    this.openContactModal();
  }

  getCallBack() {
    this.contactData.message = `Please call me back regarding ${this.property?.title}. I'm interested in learning more about this property.`;
    this.openContactModal();
  }

  shareProperty() {
    if (navigator.share) {
      navigator.share({
        title: this.property?.title,
        text: `Check out this property: ${this.property?.title} at ${this.property?.location}`,
        url: window.location.href
      }).catch(() => {
        this.copyToClipboard();
      });
    } else {
      this.copyToClipboard();
    }
  }

  copyToClipboard() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      this.toastr.success('Property link copied to clipboard!');
    }).catch(() => {
      this.toastr.warning('Unable to copy link');
    });
  }

  printProperty() {
    window.print();
  }

  reportProperty() {
    if (confirm('Do you want to report this property as inappropriate or misleading?')) {
      this.toastr.info('Thank you for your report. Our team will review it.');
      // In production, send report to backend
    }
  }

  viewProperty(id: number) {
    this.router.navigate(['/property', id]);
  }

  hasMultipleImages(): boolean {
    return !!(this.property?.images && this.property.images.length > 1);
  }

  getImageCount(): number {
    return this.property?.images?.length || 0;
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
