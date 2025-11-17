import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { PropertyService } from '../../core/services/property.service';
import { LocationService } from '../../core/services/location.service';
import { Property, PropertyFilters } from '../../core/models/property.model';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { HeaderComponent } from '../../shared/header/header.component';
import { PropertyDetailComponent } from '../property-detail/property-detail.component';

@Component({
  selector: 'app-rent',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HeaderComponent, PropertyDetailComponent],
  template: `
    <!-- Shared Header Component -->
    <app-header></app-header>

    <!-- RENT PAGE - CLEAN PROFESSIONAL BANNER -->
    <header class="rent-banner">
      <div class="rent-banner-content">
        <div class="rent-badge">
          <i class="fas fa-home"></i> For Rent
        </div>
        <h1>Find Your Perfect Rental Home in {{ selectedCity }}</h1>
        <p class="rent-subtitle">
          {{ totalProperties }} verified rental properties in {{ selectedCity }} • Zero Brokerage • Flexible Terms
        </p>
        <div class="rent-stats">
          <div class="stat-item">
            <i class="fas fa-key"></i>
            <span>Ready to Move</span>
          </div>
          <div class="stat-item">
            <i class="fas fa-rupee-sign"></i>
            <span>₹8K - ₹50K/month</span>
          </div>
          <div class="stat-item">
            <i class="fas fa-handshake"></i>
            <span>Direct Owners</span>
          </div>
        </div>
        <button class="btn-search-rent" (click)="scrollToSearch()">
          <i class="fas fa-search"></i> Browse Rentals
        </button>
      </div>
    </header>

    <!-- Search with Rental-Specific Filters -->
    <section class="search-section" [class.compact]="isFiltersCompact">
      <div class="container">
        <!-- Compact Filters (Shown when scrolled) -->
        <div class="compact-filters-row" *ngIf="isFiltersCompact">
          <div class="compact-city-badge">
            <i class="fas fa-map-marker-alt"></i>
            <span>{{ selectedCity }}</span>
          </div>
          <div class="compact-filter">
            <i class="fas fa-search"></i>
            <input 
              type="text" 
              placeholder="Search location..."
              [(ngModel)]="searchQuery"
              (input)="applyFilters()"
            >
          </div>
          <div class="compact-filter">
            <select [(ngModel)]="budgetRange" (change)="applyFilters()">
              <option value="">Any Budget</option>
              <option value="0-10">< ₹10K</option>
              <option value="10-20">₹10-20K</option>
              <option value="20-30">₹20-30K</option>
              <option value="30-50">₹30-50K</option>
              <option value="50+">₹50K+</option>
            </select>
          </div>
          <div class="compact-filter">
            <select [(ngModel)]="selectedBedrooms" (change)="applyFilters()">
              <option value="">Any BHK</option>
              <option value="1">1 BHK</option>
              <option value="2">2 BHK</option>
              <option value="3">3 BHK</option>
              <option value="4">4 BHK</option>
            </select>
          </div>
          <div class="compact-filter">
            <select [(ngModel)]="furnishingType" (change)="applyFilters()">
              <option value="">Any Furnishing</option>
              <option value="furnished">Furnished</option>
              <option value="semi">Semi-Furnished</option>
              <option value="unfurnished">Unfurnished</option>
            </select>
          </div>
          <div class="compact-filter compact-sort">
            <select [(ngModel)]="sortBy" (change)="sortProperties()">
              <option value="recent">Recently Added</option>
              <option value="price-low">Rent: Low to High</option>
              <option value="price-high">Rent: High to Low</option>
              <option value="popular">Most Viewed</option>
            </select>
          </div>
          <button class="btn-reset-compact" (click)="resetFilters()">
            <i class="fas fa-redo"></i>
          </button>
        </div>

        <!-- Full Filters (Shown by default) -->
        <div class="search-card" *ngIf="!isFiltersCompact">
          <div class="filter-header">
            <h3><i class="fas fa-search"></i> Find Rental Properties</h3>
            <div class="current-location">
              <i class="fas fa-map-marker-alt"></i>
              <span>Searching in: <strong>{{ selectedCity }}</strong></span>
            </div>
          </div>
          <div class="search-grid">
            <div class="search-group">
              <label>Location</label>
              <div class="input-with-icon">
                <i class="fas fa-map-marker-alt"></i>
                <input 
                  type="text" 
                  placeholder="Area, locality, landmark..." 
                  [(ngModel)]="searchQuery"
                  (input)="applyFilters()"
                >
              </div>
            </div>
            <div class="search-group">
              <label>Monthly Budget</label>
              <div class="input-with-icon">
                <i class="fas fa-rupee-sign"></i>
                <select [(ngModel)]="budgetRange" (change)="applyFilters()">
                  <option value="">Any Budget</option>
                  <option value="0-10">Under ₹10,000</option>
                  <option value="10-20">₹10,000 - 20,000</option>
                  <option value="20-30">₹20,000 - 30,000</option>
                  <option value="30-50">₹30,000 - 50,000</option>
                  <option value="50+">Above ₹50,000</option>
                </select>
              </div>
            </div>
            <div class="search-group">
              <label>Furnishing Status</label>
              <div class="furnishing-options">
                <button 
                  class="furnish-btn"
                  [class.active]="furnishingType === 'furnished'"
                  (click)="setFurnishing('furnished')"
                >
                  <i class="fas fa-couch"></i> Furnished
                </button>
                <button 
                  class="furnish-btn"
                  [class.active]="furnishingType === 'semi'"
                  (click)="setFurnishing('semi')"
                >
                  <i class="fas fa-home"></i> Semi-Furnished
                </button>
                <button 
                  class="furnish-btn"
                  [class.active]="furnishingType === 'unfurnished'"
                  (click)="setFurnishing('unfurnished')"
                >
                  <i class="fas fa-door-open"></i> Unfurnished
                </button>
              </div>
            </div>
            <div class="search-group">
              <label>Bedrooms</label>
              <div class="bhk-selector">
                <button 
                  *ngFor="let bhk of ['1', '2', '3', '4']"
                  class="bhk-btn"
                  [class.active]="selectedBedrooms === bhk"
                  (click)="selectBedrooms(bhk)"
                >{{ bhk }} BHK</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Property Listings -->
    <section class="properties-section">
      <div class="container">
        <div class="section-header">
          <div>
            <h2>Available Rentals</h2>
            <p>{{ filteredProperties.length }} properties ready to move in</p>
          </div>
          <div class="sort-options">
            <select [(ngModel)]="sortBy" (change)="sortProperties()">
              <option value="recent">Newest Listings</option>
              <option value="price-low">Rent: Low to High</option>
              <option value="price-high">Rent: High to Low</option>
              <option value="popular">Most Viewed</option>
            </select>
          </div>
        </div>

        <div class="rental-grid" *ngIf="!loading && filteredProperties.length > 0">
          <div class="rental-card" *ngFor="let property of filteredProperties; let i = index">
            <!-- Image Carousel -->
            <div class="rental-image-carousel">
              <div class="carousel-container" (click)="viewProperty(property.id)">
                <div class="carousel-image">
                  <div class="image-placeholder" *ngIf="!property.images || property.images.length === 0">
                    {{ getPropertyIcon(property.category) }}
                  </div>
                  <img 
                    *ngIf="property.images && property.images.length > 0" 
                    [src]="property.images[getPropertyImageIndex(i)].image" 
                    [alt]="property.title"
                  >
                </div>
                <!-- Carousel Navigation -->
                <button 
                  class="carousel-nav carousel-prev" 
                  *ngIf="property.images && property.images.length > 1"
                  (click)="previousImage(i); $event.stopPropagation()"
                >
                  <i class="fas fa-chevron-left"></i>
                </button>
                <button 
                  class="carousel-nav carousel-next" 
                  *ngIf="property.images && property.images.length > 1"
                  (click)="nextImage(i); $event.stopPropagation()"
                >
                  <i class="fas fa-chevron-right"></i>
                </button>
                <!-- Image Dots -->
                <div class="image-dots" *ngIf="property.images && property.images.length > 1">
                  <span 
                    *ngFor="let img of property.images; let dotIndex = index"
                    class="dot"
                    [class.active]="dotIndex === getPropertyImageIndex(i)"
                    (click)="goToImage(i, dotIndex); $event.stopPropagation()"
                  ></span>
                </div>
              </div>
              <div class="rental-badge">For Rent</div>
              <button class="save-btn" (click)="toggleFavorite(property.id, $event)">
                <i class="fas fa-heart" [class.saved]="isFavorite(property.id)"></i>
              </button>
            </div>
            <div class="rental-info">
              <div class="property-type">{{ getCategoryName(property.category) }}</div>
              <h3 (click)="viewProperty(property.id)">{{ property.title }}</h3>
              <p class="location">
                <i class="fas fa-map-marker-alt"></i>
                {{ property.location }}, {{ property.city }}
              </p>
              <div class="rental-details">
                <span *ngIf="property.bedrooms && property.bedrooms !== 'N/A'">
                  <i class="fas fa-bed"></i> {{ property.bedrooms }} BHK
                </span>
                <span *ngIf="property.bathrooms && property.bathrooms !== 'N/A'">
                  <i class="fas fa-bath"></i> {{ property.bathrooms }}
                </span>
                <span><i class="fas fa-ruler"></i> {{ property.carpet_area }} sq ft</span>
              </div>
              <div class="rental-pricing">
                <span class="rent-amount">₹{{ formatRent(property.price) }}</span>
                <button class="btn-view" (click)="viewProperty(property.id)">
                  View <i class="fas fa-arrow-right"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Loading -->
        <div *ngIf="loading" class="skeleton-grid">
          <div class="skeleton-card" *ngFor="let i of [1,2,3,4,5,6]">
            <div class="skeleton-image"></div>
            <div class="skeleton-title"></div>
            <div class="skeleton-text"></div>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="!loading && filteredProperties.length === 0" class="empty-state">
          <i class="fas fa-home"></i>
          <h3>No Rentals Available</h3>
          <p>Try different search criteria</p>
          <button class="btn btn-primary" (click)="resetFilters()">Reset Filters</button>
        </div>
      </div>
    </section>

    <!-- Rental Guide - Tenant Tips -->
    <section class="rental-guide">
      <div class="container">
        <h2><i class="fas fa-book-reader"></i> Tenant's Guide</h2>
        <div class="guide-grid">
          <div class="guide-card">
            <i class="fas fa-file-signature"></i>
            <h4>Rental Agreement Must-Haves</h4>
            <ul>
              <li>11-month duration (to avoid registration > 1 year)</li>
              <li>Security deposit clause (max 10 months rent)</li>
              <li>Notice period (usually 1-2 months)</li>
              <li>Maintenance responsibilities</li>
              <li>Lock-in period terms</li>
            </ul>
          </div>
          <div class="guide-card">
            <i class="fas fa-shield-alt"></i>
            <h4>Tenant Rights</h4>
            <ul>
              <li>Right to peaceful possession</li>
              <li>Can't be evicted without notice</li>
              <li>Deposit refund within 45 days</li>
              <li>Request for repairs</li>
              <li>Privacy rights</li>
            </ul>
          </div>
          <div class="guide-card">
            <i class="fas fa-clipboard-check"></i>
            <h4>Before Moving In</h4>
            <ul>
              <li>Check all electrical fittings</li>
              <li>Test water supply & pressure</li>
              <li>Inspect for damages/leaks</li>
              <li>Verify all amenities work</li>
              <li>Take photos/videos as proof</li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- Property Detail Modal -->
    <app-property-detail 
      *ngIf="selectedPropertyId"
      [propertyId]="selectedPropertyId"
      [isModalMode]="true"
      (closeModalEvent)="closePropertyModal()"
    ></app-property-detail>
  `,
  styles: [`
    /* ========== RENT PAGE - CLEAN PROFESSIONAL BANNER ========== */
    .rent-banner {
      position: relative;
      background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #3b82f6 100%);
      min-height: 280px;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      padding: 2.5rem 2rem;
      max-width: 1400px;
      margin: 0 auto;
      border-radius: 0 0 16px 16px;
    }

    .rent-banner::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="rgba(255,255,255,0.05)" d="M0,96L48,112C96,128,192,160,288,165.3C384,171,480,149,576,133.3C672,117,768,107,864,112C960,117,1056,139,1152,138.7C1248,139,1344,117,1392,106.7L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path></svg>');
      background-size: cover;
      background-position: bottom;
      opacity: 0.6;
    }

    .rent-banner-content {
      position: relative;
      z-index: 2;
      max-width: 800px;
      width: 100%;
      text-align: center;
      color: white;
    }

    .rent-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(10px);
      padding: 0.5rem 1.25rem;
      border-radius: 30px;
      font-size: 0.9rem;
      font-weight: 600;
      margin-bottom: 1.5rem;
      border: 1px solid rgba(255, 255, 255, 0.3);
    }

    .rent-banner h1 {
      font-size: 2.5rem;
      font-weight: 800;
      line-height: 1.2;
      margin-bottom: 1rem;
      color: white;
    }

    .rent-subtitle {
      font-size: 1.05rem;
      margin-bottom: 2rem;
      opacity: 0.95;
      color: rgba(255, 255, 255, 0.95);
    }

    .rent-stats {
      display: flex;
      justify-content: center;
      gap: 2rem;
      margin-bottom: 2rem;
      flex-wrap: wrap;
    }

    .stat-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(10px);
      padding: 0.65rem 1.25rem;
      border-radius: 30px;
      font-size: 0.9rem;
      font-weight: 500;
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .stat-item i {
      font-size: 1rem;
    }

    .btn-search-rent {
      padding: 0.85rem 2rem;
      background: white;
      color: #2563eb;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 0.6rem;
      transition: all 0.2s ease;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    }

    .btn-search-rent:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
      background: #f8fafc;
    }

    @media (max-width: 768px) {
      .rent-banner {
        min-height: 240px;
        padding: 2rem 1.5rem;
      }

      .rent-banner h1 {
        font-size: 2rem;
      }

      .rent-stats {
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
      }
    }

    .rent-wave-bg {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 200px;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="rgba(255,255,255,0.1)" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path></svg>');
      background-size: cover;
      opacity: 0.3;
    }

    .floating-keys {
      position: absolute;
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
    }

    .key {
      position: absolute;
      font-size: 4rem;
      opacity: 0.15;
      animation: floatKeys 20s infinite ease-in-out;
    }

    .key-1 {
      top: 15%;
      left: 10%;
      animation-delay: 0s;
    }

    .key-2 {
      top: 70%;
      left: 15%;
      animation-delay: 5s;
    }

    .key-3 {
      top: 25%;
      right: 12%;
      animation-delay: 10s;
    }

    .key-4 {
      top: 65%;
      right: 18%;
      animation-delay: 15s;
    }

    @keyframes floatKeys {
      0%, 100% { transform: translateY(0) rotate(0deg); }
      25% { transform: translateY(-40px) rotate(15deg); }
      50% { transform: translateY(20px) rotate(-10deg); }
      75% { transform: translateY(-30px) rotate(20deg); }
    }

    .rent-content-center {
      position: relative;
      z-index: 2;
      max-width: 900px;
      width: 100%;
      text-align: center;
      color: white;
    }

    .breadcrumb-rent {
      font-size: 0.9rem;
      margin-bottom: 2rem;
      opacity: 0.9;
    }

    .breadcrumb-rent a {
      color: white;
      text-decoration: none;
      font-weight: 500;
      transition: opacity 0.3s;
    }

    .breadcrumb-rent a:hover {
      opacity: 0.8;
    }

    .divider {
      margin: 0 0.75rem;
      opacity: 0.5;
    }

    .current-page {
      font-weight: 600;
    }

    .rent-icon-large {
      margin: 0 auto 2rem;
      display: flex;
      justify-content: center;
    }

    .icon-circle-rent {
      width: 90px;
      height: 90px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(10px);
      border: 2px solid rgba(255, 255, 255, 0.3);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2.5rem;
      color: white;
      animation: iconPulse 3s ease-in-out infinite;
      box-shadow: 0 15px 45px rgba(0, 0, 0, 0.3);
    }

    @keyframes iconPulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.05); }
    }

    .rent-title {
      font-size: 3rem;
      font-weight: 900;
      line-height: 1.1;
      margin-bottom: 1rem;
      color: white;
      text-shadow: 0 3px 15px rgba(0, 0, 0, 0.3);
    }

    .pre-title {
      display: block;
      font-size: 1.3rem;
      font-weight: 600;
      opacity: 0.9;
      margin-bottom: 0.4rem;
    }

    .rent-description {
      font-size: 1.05rem;
      line-height: 1.6;
      margin-bottom: 2rem;
      color: rgba(255, 255, 255, 0.95);
    }

    .rent-features-cards {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .feature-card-rent {
      background: rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 12px;
      padding: 1.25rem 0.75rem;
      transition: all 0.3s ease;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
    }

    .feature-card-rent:hover {
      transform: translateY(-8px);
      background: rgba(255, 255, 255, 0.25);
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
    }

    .feature-icon-rent {
      width: 60px;
      height: 60px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.75rem;
      flex-shrink: 0;
    }

    .feature-icon-rent.green {
      background: rgba(255, 255, 255, 0.25);
      color: white;
    }

    .feature-text-rent {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 0.3rem;
    }

    .feature-text-rent strong {
      font-size: 1rem;
      font-weight: 700;
      color: white;
    }

    .feature-text-rent span {
      font-size: 0.85rem;
      color: rgba(255, 255, 255, 0.85);
    }

    .rent-cta-section {
      display: flex;
      gap: 1.25rem;
      justify-content: center;
      margin-bottom: 3rem;
    }

    .btn-rent-primary {
      padding: 1.25rem 2.5rem;
      background: white;
      color: #2563eb;
      border: none;
      border-radius: 50px;
      font-size: 1.1rem;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      transition: all 0.3s ease;
      box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
    }

    .btn-rent-primary:hover {
      transform: translateY(-3px) scale(1.02);
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);
    }

    .btn-rent-secondary {
      padding: 1.25rem 2.5rem;
      background: transparent;
      color: white;
      border: 2px solid white;
      border-radius: 50px;
      font-size: 1.1rem;
      font-weight: 700;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      transition: all 0.3s ease;
    }

    .btn-rent-secondary:hover {
      background: rgba(255, 255, 255, 0.15);
      transform: translateY(-3px);
    }

    .rent-trust-badges {
      display: flex;
      gap: 3rem;
      justify-content: center;
      padding-top: 2rem;
      border-top: 1px solid rgba(255, 255, 255, 0.2);
    }

    .trust-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      color: white;
      font-size: 0.95rem;
      font-weight: 500;
    }

    .trust-item i {
      font-size: 1.5rem;
      opacity: 0.9;
    }

    /* Responsive */
    @media (max-width: 1024px) {
      .rent-features-cards {
        grid-template-columns: repeat(2, 1fr);
      }

      .rent-title {
        font-size: 3rem;
      }

      .rent-cta-section {
        flex-direction: column;
        align-items: center;
      }

      .btn-rent-primary,
      .btn-rent-secondary {
        width: 100%;
        max-width: 400px;
        justify-content: center;
      }
    }

    @media (max-width: 768px) {
      .rent-features-cards {
        grid-template-columns: 1fr;
      }

      .rent-title {
        font-size: 2.5rem;
      }

      .pre-title {
        font-size: 1.5rem;
      }

      .rent-trust-badges {
        flex-direction: column;
        gap: 1rem;
      }
    }

    /* OLD Header Styles (keep for compatibility) */
    .rent-header {
      position: relative;
      background: linear-gradient(135deg, #2563eb 0%, #3b82f6 50%, #34d399 100%);
      color: white;
      padding: 5rem 0 4rem;
      overflow: hidden;
    }

    .header-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="rgba(255,255,255,0.1)" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,138.7C960,139,1056,117,1152,106.7C1248,96,1344,96,1392,96L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path></svg>');
      background-size: cover;
      background-position: bottom;
    }

    .container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 2rem;
      position: relative;
      z-index: 1;
    }

    .header-content {
      text-align: center;
    }

    .breadcrumb {
      margin-bottom: 1rem;
      font-size: 0.9rem;
    }

    .breadcrumb a {
      color: white;
      text-decoration: none;
    }

    h1 {
      font-size: 3.5rem;
      font-weight: 800;
      margin-bottom: 1rem;
    }

    .tagline {
      font-size: 1.3rem;
      margin-bottom: 2rem;
      opacity: 0.95;
    }

    .rental-benefits {
      display: flex;
      justify-content: center;
      gap: 3rem;
      flex-wrap: wrap;
    }

    .benefit-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 1.1rem;
      font-weight: 500;
    }

    .benefit-item i {
      font-size: 1.5rem;
      color: #fbbf24;
    }

    /* Affordability Calculator */
    .affordability-section {
      padding: 4rem 0;
      background: #eff6ff;
    }

    .calculator-card {
      background: white;
      border-radius: 20px;
      padding: 3rem;
      box-shadow: 0 10px 40px rgba(5, 150, 105, 0.1);
    }

    .calculator-header {
      text-align: center;
      margin-bottom: 2.5rem;
    }

    .calculator-header h2 {
      color: #1e293b;
      font-size: 2rem;
      margin-bottom: 0.5rem;
    }

    .calculator-header p {
      color: #64748b;
      font-size: 1.1rem;
    }

    .calc-inputs {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
      margin-bottom: 2rem;
    }

    .input-group {
      display: flex;
      flex-direction: column;
    }

    .input-group label {
      font-weight: 600;
      color: #475569;
      margin-bottom: 0.5rem;
      font-size: 0.95rem;
    }

    .input-group input {
      padding: 0.875rem;
      border: 2px solid #e2e8f0;
      border-radius: 10px;
      font-size: 1.1rem;
      transition: all 0.3s ease;
    }

    .input-group input:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
    }

    .calc-result {
      background: linear-gradient(135deg, #3b82f6, #2563eb);
      padding: 2rem;
      border-radius: 16px;
      color: white;
      text-align: center;
    }

    .result-label {
      display: block;
      font-size: 1rem;
      margin-bottom: 0.75rem;
      opacity: 0.9;
    }

    .result-value {
      display: block;
      font-size: 3rem;
      font-weight: 800;
      color: #fbbf24;
    }

    .result-details {
      margin-top: 1rem;
      opacity: 0.9;
    }

    /* Search Section */
    .search-section {
      padding: 3rem 0;
      background: #f8fafc;
      position: sticky;
      top: 66px;
      z-index: 999;
      transition: all 0.3s ease;
    }

    .search-section.compact {
      padding: 1rem 0;
      background: white;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }

    /* Compact Filters Row */
    .compact-filters-row {
      display: flex;
      gap: 0.75rem;
      align-items: center;
      flex-wrap: wrap;
    }

    .compact-city-badge {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: #eff6ff;
      padding: 0.6rem 1rem;
      border-radius: 8px;
      border: 1px solid #bfdbfe;
      font-weight: 600;
      color: #1e293b;
      font-size: 0.9rem;
      white-space: nowrap;
    }

    .compact-city-badge i {
      color: #3b82f6;
      font-size: 1rem;
    }

    .compact-filter {
      flex: 1;
      min-width: 150px;
      position: relative;
    }

    .compact-filter input,
    .compact-filter select {
      width: 100%;
      padding: 0.65rem 1rem;
      border: 1.5px solid #e5e7eb;
      border-radius: 8px;
      font-size: 0.9rem;
      background: white;
      transition: all 0.2s ease;
    }

    .compact-filter input:focus,
    .compact-filter select:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
    }

    .compact-filter i {
      position: absolute;
      left: 1rem;
      top: 50%;
      transform: translateY(-50%);
      color: #3b82f6;
      pointer-events: none;
    }

    .compact-filter input {
      padding-left: 2.5rem;
    }

    .compact-sort {
      min-width: 180px;
    }

    .btn-reset-compact {
      padding: 0.65rem 1rem;
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .btn-reset-compact:hover {
      background: #2563eb;
      transform: translateY(-1px);
    }

    .search-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 2px 12px rgba(0,0,0,0.08);
      border: 1px solid #e5e7eb;
    }

    .filter-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .filter-header h3 {
      margin: 0;
    }

    .current-location {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: #eff6ff;
      padding: 0.5rem 1rem;
      border-radius: 8px;
      border: 1px solid #bfdbfe;
    }

    .current-location i {
      color: #3b82f6;
      font-size: 1rem;
    }

    .current-location span {
      color: #1e293b;
      font-size: 0.9rem;
    }

    .current-location strong {
      color: #3b82f6;
      font-weight: 700;
    }

    .search-card h3 {
      color: #1e293b;
      font-size: 1.3rem;
      margin-bottom: 1.5rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .search-card h3 i {
      color: #3b82f6;
    }

    .search-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1.25rem;
    }

    .search-group {
      display: flex;
      flex-direction: column;
    }

    .search-group label {
      display: block;
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 0.6rem;
      font-size: 0.9rem;
    }

    .input-with-icon {
      position: relative;
    }

    .input-with-icon i {
      position: absolute;
      left: 1rem;
      top: 50%;
      transform: translateY(-50%);
      color: #3b82f6;
      font-size: 1rem;
      pointer-events: none;
      z-index: 1;
    }

    .input-with-icon input,
    .input-with-icon select {
      width: 100%;
      padding: 0.75rem 1rem;
      padding-left: 2.75rem;
      border: 1.5px solid #e5e7eb;
      border-radius: 8px;
      font-size: 0.95rem;
      background: white;
      transition: all 0.2s ease;
    }

    .input-with-icon input:focus,
    .input-with-icon select:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
    }

    .furnishing-options, .bhk-selector {
      display: flex;
      gap: 0.65rem;
      flex-wrap: wrap;
    }

    .furnish-btn, .bhk-btn {
      flex: 1;
      min-width: 100px;
      padding: 0.7rem 1rem;
      border: 1.5px solid #e5e7eb;
      background: white;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
      font-weight: 500;
      color: #64748b;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.4rem;
      font-size: 0.9rem;
    }

    .furnish-btn:hover, .bhk-btn:hover {
      border-color: #3b82f6;
      color: #3b82f6;
      background: #eff6ff;
      transform: translateY(-1px);
    }

    .furnish-btn.active, .bhk-btn.active {
      background: #3b82f6;
      border-color: #3b82f6;
      color: white;
      box-shadow: 0 2px 8px rgba(16, 185, 129, 0.2);
    }

    .furnish-btn i, .bhk-btn i {
      font-size: 0.95rem;
    }

    /* Security Deposit Calculator */
    .deposit-calculator {
      padding: 3rem 0;
      background: white;
    }

    .deposit-card {
      background: #f8fafc;
      border-radius: 16px;
      padding: 2.5rem;
      border: 2px solid #e2e8f0;
    }

    .deposit-card h3 {
      color: #1e293b;
      font-size: 1.5rem;
      margin-bottom: 0.5rem;
    }

    .deposit-card > p {
      color: #64748b;
      margin-bottom: 2rem;
    }

    .deposit-grid {
      display: grid;
      grid-template-columns: 1fr 1.5fr;
      gap: 2rem;
      align-items: center;
    }

    .deposit-breakdown {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    }

    .deposit-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 0;
      border-bottom: 1px solid #f1f5f9;
      color: #475569;
    }

    .deposit-item.total {
      border-bottom: none;
      padding-top: 1rem;
      margin-top: 0.5rem;
      border-top: 2px solid #e2e8f0;
      font-weight: 700;
      color: #1e293b;
    }

    .deposit-item .amount {
      font-weight: 700;
      color: #3b82f6;
      font-size: 1.1rem;
    }

    .deposit-item.total .amount {
      font-size: 1.5rem;
    }

    /* Properties Grid */
    .properties-section {
      padding: 3rem 0;
      background: white;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .section-header h2 {
      color: #1e293b;
      font-size: 2rem;
      margin-bottom: 0.25rem;
    }

    .section-header p {
      color: #64748b;
    }

    .sort-options select {
      padding: 0.5rem 1rem;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      cursor: pointer;
    }

    .rental-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 1.5rem;
    }

    .rental-card {
      background: white;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 2px 12px rgba(0,0,0,0.06);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      border: 1px solid #f1f5f9;
      display: flex;
      flex-direction: column;
      cursor: pointer;
    }

    .rental-card:hover {
      box-shadow: 0 8px 24px rgba(59, 130, 246, 0.12);
      transform: translateY(-4px);
      border-color: #bfdbfe;
    }

    /* ========== IMAGE CAROUSEL STYLES ========== */
    .rental-image-carousel {
      position: relative;
      height: 280px;
      overflow: hidden;
    }

    .carousel-container {
      position: relative;
      width: 100%;
      height: 100%;
      cursor: pointer;
    }

    .carousel-image {
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 50%, #93c5fd 100%);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .carousel-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }

    .carousel-container:hover .carousel-image img {
      transform: scale(1.05);
    }

    .image-placeholder {
      font-size: 4rem;
      filter: drop-shadow(0 4px 8px rgba(0,0,0,0.1));
    }

    /* Carousel Navigation */
    .carousel-nav {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.9);
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: all 0.3s;
      z-index: 10;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    }

    .rental-image-carousel:hover .carousel-nav {
      opacity: 1;
    }

    .carousel-prev {
      left: 8px;
    }

    .carousel-next {
      right: 8px;
    }

    .carousel-nav:hover {
      background: white;
      transform: translateY(-50%) scale(1.1);
    }

    .carousel-nav i {
      color: #3b82f6;
      font-size: 0.85rem;
    }

    /* Image Dots */
    .image-dots {
      position: absolute;
      bottom: 12px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 6px;
      z-index: 10;
      padding: 6px 12px;
      background: rgba(0, 0, 0, 0.3);
      border-radius: 20px;
      backdrop-filter: blur(4px);
    }

    .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.5);
      cursor: pointer;
      transition: all 0.3s;
    }

    .dot:hover {
      background: rgba(255, 255, 255, 0.8);
      transform: scale(1.2);
    }

    .dot.active {
      background: white;
      width: 24px;
      border-radius: 4px;
    }

    .rental-badge {
      position: absolute;
      top: 1rem;
      left: 1rem;
      background: #3b82f6;
      color: white;
      padding: 0.4rem 1rem;
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
    }

    .save-btn {
      position: absolute;
      top: 1rem;
      right: 1rem;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: none;
      background: rgba(255,255,255,0.9);
      color: #64748b;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s ease;
    }

    .save-btn i.saved {
      color: #ef4444;
    }

    .rental-info {
      padding: 0.75rem;
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .property-type {
      display: inline-block;
      padding: 0.25rem 0.6rem;
      background: linear-gradient(135deg, #eff6ff, #dbeafe);
      color: #1e40af;
      border-radius: 6px;
      font-size: 0.65rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      width: fit-content;
      border: 1px solid #bfdbfe;
    }

    .rental-info h3 {
      font-size: 0.95rem;
      color: #0f172a;
      margin: 0;
      line-height: 1.3;
      font-weight: 600;
      cursor: pointer;
      transition: color 0.3s;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }

    .rental-info h3:hover {
      color: #3b82f6;
    }

    .location {
      color: #64748b;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 0.3rem;
      font-size: 0.75rem;
    }

    .location i {
      color: #3b82f6;
    }

    .rental-details {
      display: flex;
      gap: 0.5rem;
      padding: 0.35rem 0;
      border-top: 1px solid #f1f5f9;
      margin: 0.25rem 0;
    }

    .rental-details span {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      color: #475569;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .rental-details i {
      color: #3b82f6;
      font-size: 0.8rem;
    }

    .rental-pricing {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: auto;
      padding-top: 0.25rem;
    }

    .rent-amount {
      font-size: 1.1rem;
      font-weight: 700;
      background: linear-gradient(135deg, #3b82f6, #1e40af);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .btn-view {
      padding: 0.5rem 1rem;
      background: linear-gradient(135deg, #3b82f6, #2563eb);
      color: white;
      border: none;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
      display: flex;
      align-items: center;
      gap: 0.3rem;
      box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
      font-size: 0.75rem;
    }

    .btn-view:hover {
      background: linear-gradient(135deg, #2563eb, #1e40af);
      transform: translateX(4px);
      box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
    }

    /* Rental Guide */
    .rental-guide {
      padding: 4rem 0;
      background: #f8fafc;
    }

    .rental-guide h2 {
      text-align: center;
      font-size: 2.5rem;
      color: #1e293b;
      margin-bottom: 3rem;
    }

    .guide-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 2rem;
    }

    .guide-card {
      background: white;
      padding: 1.25rem;
      border-radius: 10px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
      border: 1px solid #e5e7eb;
    }

    .guide-card i {
      font-size: 2rem;
      color: #3b82f6;
      margin-bottom: 0.75rem;
    }

    .guide-card h4 {
      color: #1e293b;
      font-size: 1.2rem;
      margin-bottom: 1rem;
    }

    .guide-card ul {
      list-style: none;
      padding: 0;
    }

    .guide-card li {
      padding: 0.5rem 0;
      color: #475569;
      font-size: 0.95rem;
      border-bottom: 1px solid #f1f5f9;
    }

    .guide-card li:last-child {
      border-bottom: none;
    }

    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
    }

    .empty-state i {
      font-size: 4rem;
      color: #cbd5e1;
      margin-bottom: 1rem;
    }

    .skeleton-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 2rem;
    }

    @media (max-width: 768px) {
      h1 { font-size: 2.2rem; }
      .rental-benefits { gap: 1.5rem; }
      .calc-inputs { grid-template-columns: 1fr; }
      .deposit-grid { grid-template-columns: 1fr; }
      .search-grid { grid-template-columns: 1fr; }
      .rental-grid { grid-template-columns: 1fr; }
      .furnishing-options { flex-direction: column; }
    }
  `]
})
export class RentComponent implements OnInit {
  properties: Property[] = [];
  filteredProperties: Property[] = [];
  propertyImageIndices: { [key: number]: number} = {};
  isFiltersCompact = false;
  loading = false;
  searchQuery = '';
  selectedBedrooms = '';
  budgetRange = '';
  furnishingType = '';
  sortBy = 'recent';
  totalProperties = 0;
  selectedCity = 'Hyderabad';
  
  // Modal
  selectedPropertyId: number | null = null;

  searchFilters: PropertyFilters = {
    type: 'For Rent'
  };

  rentalCalculator = {
    monthlyIncome: 80000,
    monthlyExpenses: 30000,
    affordableRent: 0
  };

  depositCalculator = {
    monthlyRent: 25000,
    months: 3,
    securityDeposit: 0,
    totalDeposit: 0
  };

  rentBudget = {
    rent: 30,
    utilities: 12,
    maintenance: 8
  };

  constructor(
    private propertyService: PropertyService,
    private router: Router,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService,
    private locationService: LocationService
  ) {}

  ngOnInit() {
    // Subscribe to location changes from header
    this.locationService.selectedCity$.subscribe(city => {
      this.selectedCity = city;
      // Reload properties when city changes
      this.properties = [];
      this.loadProperties();
    });

    this.setupScrollListener();
  }

  setupScrollListener() {
    window.addEventListener('scroll', () => {
      const scrollPosition = window.scrollY;
      const searchSection = document.querySelector('.search-section');
      if (searchSection) {
        const searchSectionTop = searchSection.getBoundingClientRect().top + window.scrollY;
        this.isFiltersCompact = scrollPosition > searchSectionTop - 70;
      }
    });
  }

  loadProperties() {
    this.loading = true;
    
    // Add city filter from header location selector
    const filters: any = { ...this.searchFilters };
    if (this.selectedCity && this.selectedCity !== 'All Cities') {
      filters.city = this.selectedCity;
    }
    
    this.propertyService.getProperties(filters).subscribe({
      next: (response) => {
        const properties = (response && response.results) ? response.results : [];
        this.properties = properties.filter(p => p.type === 'For Rent');
        this.totalProperties = this.properties.length;
        this.filteredProperties = [...this.properties];
        this.sortProperties();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error:', error);
        this.toastr.error('Failed to load properties');
        this.loading = false;
      }
    });
  }

  selectBedrooms(count: string) {
    this.selectedBedrooms = this.selectedBedrooms === count ? '' : count;
    this.applyFilters();
  }

  setFurnishing(type: string) {
    this.furnishingType = this.furnishingType === type ? '' : type;
    this.applyFilters();
  }

  applyFilters() {
    // Scroll to property listings
    setTimeout(() => {
      const propertiesSection = document.querySelector('.properties-section');
      if (propertiesSection) {
        propertiesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
    let filtered = [...this.properties];

    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(query) ||
        p.location.toLowerCase().includes(query) ||
        p.city.toLowerCase().includes(query)
      );
    }

    if (this.selectedBedrooms) {
      filtered = filtered.filter(p => p.bedrooms === this.selectedBedrooms);
    }

    this.filteredProperties = filtered;
    this.sortProperties();
  }

  sortProperties() {
    switch (this.sortBy) {
      case 'recent':
        this.filteredProperties.sort((a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        break;
      case 'price-low':
      case 'price-high':
        this.filteredProperties.sort((a, b) => {
          const priceA = typeof a.price === 'number' ? a.price : this.extractRent(String(a.price));
          const priceB = typeof b.price === 'number' ? b.price : this.extractRent(String(b.price));
          return this.sortBy === 'price-low' ? priceA - priceB : priceB - priceA;
        });
        break;
    }
    // Scroll to property listings
    setTimeout(() => {
      const propertiesSection = document.querySelector('.properties-section');
      if (propertiesSection) {
        propertiesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }

  extractRent(priceStr: string): number {
    const match = priceStr.match(/[\d,]+/);
    if (!match) return 0;
    return parseInt(match[0].replace(/,/g, ''));
  }

  resetFilters() {
    // Scroll to property listings
    setTimeout(() => {
      const propertiesSection = document.querySelector('.properties-section');
      if (propertiesSection) {
        propertiesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
    this.searchQuery = '';
    this.selectedBedrooms = '';
    this.budgetRange = '';
    this.furnishingType = '';
    this.applyFilters();
  }

  viewProperty(id: number) {
    // Open property detail in modal instead of navigating
    this.selectedPropertyId = id;
  }

  closePropertyModal() {
    this.selectedPropertyId = null;
  }

  contactOwner(property: Property, event: Event) {
    event.stopPropagation();
    this.router.navigate(['/property', property.id]);
  }

  toggleFavorite(id: number, event: Event) {
    event.stopPropagation();
    const favorites = this.getFavorites();
    const index = favorites.indexOf(id);
    
    if (index > -1) {
      favorites.splice(index, 1);
      this.toastr.info('Removed from saved');
    } else {
      favorites.push(id);
      this.toastr.success('Saved property!');
    }
    
    localStorage.setItem('favoriteProperties', JSON.stringify(favorites));
  }

  isFavorite(id: number): boolean {
    return this.getFavorites().includes(id);
  }

  getFavorites(): number[] {
    const fav = localStorage.getItem('favoriteProperties');
    return fav ? JSON.parse(fav) : [];
  }

  getPropertyIcon(category?: string): string {
    const icons: any = {
      'flat': '🏢',
      'house': '🏠',
      'commercial': '🏪'
    };
    if (!category) {
      return '🏠';
    }
    return icons[category] || '🏠';
  }

  getCategoryName(category?: string): string {
    const names: any = {
      'flat': 'Apartment',
      'house': 'Independent House',
      'commercial': 'Commercial Space'
    };
    if (!category) {
      return 'General';
    }
    return names[category] || category;
  }

  getDepositAmount(rent: string): string {
    const monthly = this.extractRent(rent);
    return `₹${(monthly * 3).toLocaleString('en-IN')}`;
  }

  calculateAffordability() {
    const availableIncome = this.rentalCalculator.monthlyIncome - this.rentalCalculator.monthlyExpenses;
    this.rentalCalculator.affordableRent = Math.floor(availableIncome * 0.30);
  }

  calculateDeposit() {
    this.depositCalculator.securityDeposit = this.depositCalculator.monthlyRent * this.depositCalculator.months;
    this.depositCalculator.totalDeposit = this.depositCalculator.securityDeposit + this.depositCalculator.monthlyRent;
  }

  // Scroll methods for CTA buttons
  scrollToSearch() {
    const element = document.querySelector('.search-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  scrollToAffordability() {
    const element = document.querySelector('.affordability-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  // ========== IMAGE CAROUSEL METHODS ==========
  getPropertyImageIndex(propertyIndex: number): number {
    return this.propertyImageIndices[propertyIndex] || 0;
  }

  nextImage(propertyIndex: number): void {
    const property = this.filteredProperties[propertyIndex];
    if (!property.images || property.images.length <= 1) return;
    
    const currentIndex = this.getPropertyImageIndex(propertyIndex);
    this.propertyImageIndices[propertyIndex] = (currentIndex + 1) % property.images.length;
  }

  previousImage(propertyIndex: number): void {
    const property = this.filteredProperties[propertyIndex];
    if (!property.images || property.images.length <= 1) return;
    
    const currentIndex = this.getPropertyImageIndex(propertyIndex);
    this.propertyImageIndices[propertyIndex] = 
      currentIndex === 0 ? property.images.length - 1 : currentIndex - 1;
  }

  goToImage(propertyIndex: number, imageIndex: number): void {
    this.propertyImageIndices[propertyIndex] = imageIndex;
  }

  formatRent(price: number): string {
    if (!price || price === 0) return '0';
    if (price >= 100000) {
      return `${(price / 100000).toFixed(2)} L`;
    } else {
      return price.toLocaleString('en-IN');
    }
  }
}

