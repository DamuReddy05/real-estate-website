import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { PropertyService } from '../../core/services/property.service';
import { LocationService } from '../../core/services/location.service';
import { Property, PropertyFilters, Banner } from '../../core/models/property.model';
import { HeaderComponent } from '../../shared/header/header.component';
import { PropertyDetailComponent } from '../property-detail/property-detail.component';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-buy',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HeaderComponent, PropertyDetailComponent],
  template: `
    <!-- Shared Header Component -->
    <app-header></app-header>

    <!-- BUY PAGE - UNIQUE SPLIT SCREEN BANNER -->
    <header class="buy-split-banner">
      <!-- LEFT SIDE: Blue with Animated House Illustration -->
      <div class="buy-left-visual" 
           [style.background-image]="hasBuyBanner() ? 'url(' + getBuyBannerImage() + ')' : null"
           [class.has-banner]="hasBuyBanner()">
        <div class="animated-house-container">
          <div class="house-structure">
            <div class="roof-top"></div>
            <div class="chimney-smoke">
              <div class="smoke-puff puff-1"></div>
              <div class="smoke-puff puff-2"></div>
              <div class="smoke-puff puff-3"></div>
        </div>
            <div class="house-walls">
              <div class="window-left">
                <div class="window-cross"></div>
      </div>
              <div class="window-right">
                <div class="window-cross"></div>
              </div>
              <div class="house-door">
                <div class="door-handle"></div>
              </div>
            </div>
          </div>
          <div class="house-shadow"></div>
        </div>
        
        <div class="floating-emojis">
          <div class="emoji emoji-1">🏠</div>
          <div class="emoji emoji-2">🔑</div>
          <div class="emoji emoji-3">💰</div>
        </div>
        
        <div class="property-count-badge-large">
          <div class="badge-number">{{ totalProperties }}</div>
          <div class="badge-text">Properties<br/>For Sale</div>
        </div>
      </div>
      
      <!-- RIGHT SIDE: White with Content -->
      <div class="buy-right-content">
        <div class="verified-badge-top">
          <i class="fas fa-shield-check"></i>
          <span>100% Verified Listings</span>
        </div>
        
        <h1 class="super-large-title">
          Buy Your<br/>
          <span class="gradient-text">Dream Home</span>
        </h1>
        
        <p class="description-text">
          Own a piece of your future. Browse verified properties<br/>
          with zero brokerage and direct owner contact.
        </p>
        
        <div class="stats-mini-grid">
          <div class="mini-stat">
            <div class="mini-stat-icon blue-bg">
              <i class="fas fa-building"></i>
            </div>
            <div class="mini-stat-text">
              <strong>2-4 BHK</strong>
              <span>Available</span>
            </div>
          </div>
          <div class="mini-stat">
            <div class="mini-stat-icon blue-bg">
              <i class="fas fa-rupee-sign"></i>
            </div>
            <div class="mini-stat-text">
              <strong>₹25L-1Cr</strong>
              <span>Price Range</span>
            </div>
          </div>
          <div class="mini-stat">
            <div class="mini-stat-icon blue-bg">
              <i class="fas fa-calculator"></i>
            </div>
            <div class="mini-stat-text">
              <strong>EMI From</strong>
              <span>₹15K/month</span>
            </div>
          </div>
        </div>
        
        <div class="action-buttons-row">
          <button class="btn-browse-buy" (click)="scrollToProperties()">
            <i class="fas fa-search"></i>
            <span>Browse Properties</span>
          </button>
          <button class="btn-calculate-buy" (click)="scrollToCalculator()">
            <i class="fas fa-calculator"></i>
            <span>Calculate EMI</span>
          </button>
        </div>
      </div>
    </header>

    <!-- SECTION 1: Search & Filters -->
    <section class="search-section" id="searchSection" [class.compact]="isFiltersCompact">
      <div class="container">
        <div class="search-card">
          <!-- Full View (Initial) -->
          <div class="full-view" *ngIf="!isFiltersCompact">
            <div class="filter-header">
              <h3><i class="fas fa-search"></i> Find Your Perfect Home</h3>
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
                    placeholder="City, locality, project..." 
                  [(ngModel)]="searchQuery"
                    (input)="onSearchChange()"
                >
              </div>
              </div>
              <div class="search-group">
                <label>Property Type</label>
                <div class="input-with-icon">
                <i class="fas fa-building"></i>
                  <select [(ngModel)]="searchFilters.category" (change)="applyFilters()">
                  <option value="">All Types</option>
                  <option value="flat">Flat/Apartment</option>
                    <option value="house">Independent House</option>
                    <option value="villa">Villa</option>
                    <option value="plot">Plot/Land</option>
                    <option value="commercial">Commercial Space</option>
                </select>
              </div>
              </div>
              <div class="search-group">
                <label>Budget Range</label>
                <div class="input-with-icon">
                  <i class="fas fa-rupee-sign"></i>
                  <select [(ngModel)]="budgetRange" (change)="applyFilters()">
                    <option value="">Any Budget</option>
                    <option value="0-25">Under ₹25 Lakh</option>
                    <option value="25-50">₹25-50 Lakh</option>
                    <option value="50-75">₹50-75 Lakh</option>
                    <option value="75-100">₹75 Lakh - 1 Cr</option>
                    <option value="100+">Above ₹1 Cr</option>
                </select>
              </div>
            </div>
              <div class="search-group">
                <label>Bedrooms</label>
                <div class="input-with-icon">
                  <i class="fas fa-bed"></i>
                  <select [(ngModel)]="selectedBedrooms" (change)="applyFilters()">
                    <option value="">Any BHK</option>
                    <option value="1">1 BHK</option>
                    <option value="2">2 BHK</option>
                    <option value="3">3 BHK</option>
                    <option value="4">4+ BHK</option>
                  </select>
                </div>
              </div>
            </div>
            <div class="search-actions">
              <button class="btn btn-primary" (click)="applyFilters()">
                <i class="fas fa-search"></i> Search Properties
            </button>
              <button class="btn btn-outline" (click)="resetFilters()">
                <i class="fas fa-redo"></i> Reset
            </button>
            </div>
          </div>

          <!-- Compact View (When Scrolling) -->
          <div class="compact-view" *ngIf="isFiltersCompact">
            <div class="compact-filters-row">
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
                  (input)="onSearchChange()"
                >
              </div>
              <div class="compact-filter">
                <select [(ngModel)]="searchFilters.category" (change)="applyFilters()">
                  <option value="">All Types</option>
                  <option value="flat">Flat/Apartment</option>
                  <option value="house">House</option>
                  <option value="villa">Villa</option>
                  <option value="plot">Plot</option>
                  <option value="commercial">Commercial</option>
                </select>
              </div>
              <div class="compact-filter">
                <select [(ngModel)]="budgetRange" (change)="applyFilters()">
                  <option value="">Any Budget</option>
                  <option value="0-25">< ₹25L</option>
                  <option value="25-50">₹25-50L</option>
                  <option value="50-75">₹50-75L</option>
                  <option value="75-100">₹75L-1Cr</option>
                  <option value="100+">> ₹1Cr</option>
                </select>
              </div>
              <div class="compact-filter">
                <select [(ngModel)]="selectedBedrooms" (change)="applyFilters()">
                  <option value="">Any BHK</option>
                  <option value="1">1 BHK</option>
                  <option value="2">2 BHK</option>
                  <option value="3">3 BHK</option>
                  <option value="4">4+ BHK</option>
                </select>
              </div>
            <div class="compact-filter compact-sort">
              <select [(ngModel)]="sortBy" (change)="sortProperties()">
                <option value="recent">Recent</option>
                <option value="price-low">Price ↑</option>
                <option value="price-high">Price ↓</option>
                <option value="area-large">Area ↓</option>
              </select>
            </div>
            <button class="compact-reset" (click)="resetFilters()" title="Reset Filters">
              <i class="fas fa-redo"></i>
            </button>
          </div>
        </div>
        </div>
      </div>
    </section>

    <!-- SECTION 2: Properties Grid -->
    <section class="properties-section" id="propertiesSection">
      <div class="container">
        <div class="section-header">
          <div>
            <h2>Properties for Sale in {{ selectedCity }}</h2>
            <p class="subtitle">{{ filteredProperties.length }} properties available</p>
        </div>
          <div class="sort-options" *ngIf="!isFiltersCompact">
            <label>Sort by:</label>
            <select [(ngModel)]="sortBy" (change)="sortProperties()">
              <option value="recent">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="area-large">Area: Largest First</option>
            </select>
          </div>
            </div>

        <div class="property-grid" *ngIf="!loading && filteredProperties.length > 0">
          <div class="property-card" *ngFor="let property of filteredProperties; let i = index">
            <div class="card-image-carousel">
              <div class="carousel-container" (click)="viewProperty(property.id)">
                <!-- Image Display -->
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
              <button class="favorite-btn" (click)="toggleFavorite(property.id, $event)">
                <i class="fas fa-heart" [class.active]="isFavorite(property.id)"></i>
              </button>
            </div>
            <div class="card-content">
              <span class="property-category">{{ getCategoryName(property.category) }}</span>
              <h3 (click)="viewProperty(property.id)">{{ property.title }}</h3>
              <p class="location">
                <i class="fas fa-map-marker-alt"></i>
                {{ property.location }}, {{ property.city }}
              </p>
              <div class="specs">
                <span class="spec" *ngIf="property.bedrooms"><i class="fas fa-bed"></i> {{ property.bedrooms }} BHK</span>
                <span class="spec" *ngIf="property.bedrooms"><i class="fas fa-bath"></i> {{ property.bathrooms }}</span>
                <span class="spec"><i class="fas fa-vector-square"></i> {{ property.carpet_area }} sq ft</span>
              </div>
              <div class="price-row">
                <div class="price">₹{{ formatPrice(property.price) }}</div>
                <button class="btn-view" (click)="viewProperty(property.id)">
                  View <i class="fas fa-arrow-right"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Loading State -->
        <div *ngIf="loading" class="skeleton-grid">
          <div class="skeleton-card" *ngFor="let i of [1,2,3,4,5,6]">
            <div class="skeleton-image"></div>
            <div class="skeleton-title"></div>
            <div class="skeleton-text"></div>
            <div class="skeleton-text skeleton-short"></div>
            <div class="skeleton-button"></div>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="!loading && filteredProperties.length === 0" class="empty-state">
          <i class="fas fa-search"></i>
          <h3>No properties found</h3>
          <p>Try different filters or search criteria</p>
          <button class="btn btn-primary" (click)="resetFilters()">
            <i class="fas fa-redo"></i> Reset Filters
          </button>
          </div>

        <!-- Load More Indicator -->
        <div *ngIf="loadingMore" class="load-more-indicator">
          <div class="spinner"></div>
          <p>Loading more properties...</p>
        </div>

        <!-- End of Results (Hidden) -->
      </div>
    </section>

    <!-- SECTION 3: EMI Calculator -->
    <section class="loan-calculator" id="calculatorSection">
      <div class="container">
        <div class="calculator-card">
          <h2><i class="fas fa-calculator"></i> Home Loan EMI Calculator</h2>
          <p class="subtitle">Calculate your monthly EMI and plan your finances</p>
          
          <div class="calculator-grid">
            <div class="calculator-inputs">
              <div class="input-group">
                <label>Loan Amount (₹)</label>
                <input 
                  type="number" 
                  [(ngModel)]="loanCalculator.amount"
                  (input)="calculateLoan()"
                  placeholder="e.g., 5000000"
                >
              </div>
              <div class="input-group">
                <label>Interest Rate (% per year)</label>
                <input 
                  type="number" 
                  [(ngModel)]="loanCalculator.rate"
                  (input)="calculateLoan()"
                  step="0.1"
                  placeholder="e.g., 8.5"
                >
              </div>
              <div class="input-group">
                <label>Loan Tenure (Years)</label>
                <input 
                  type="number" 
                  [(ngModel)]="loanCalculator.years"
                  (input)="calculateLoan()"
                  placeholder="e.g., 20"
                >
              </div>
            </div>
            
            <div class="calculator-result" *ngIf="loanCalculator.emi > 0">
              <div class="emi-display">
                <span class="emi-label">Monthly EMI</span>
                <span class="emi-amount">₹{{ loanCalculator.emi | number:'1.0-0' }}</span>
              </div>
              <div class="loan-breakdown">
                <div class="breakdown-item">
                  <span class="breakdown-label">Principal Amount</span>
                  <span class="breakdown-value">₹{{ loanCalculator.amount | number:'1.0-0' }}</span>
                </div>
                <div class="breakdown-item">
                  <span class="breakdown-label">Total Interest</span>
                  <span class="breakdown-value">₹{{ loanCalculator.totalInterest | number:'1.0-0' }}</span>
                </div>
                <div class="breakdown-item">
                  <span class="breakdown-label">Total Payment</span>
                  <span class="breakdown-value">₹{{ loanCalculator.totalAmount | number:'1.0-0' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- SECTION 4: Home Buying Tips (2x2 Grid) -->
    <section class="buying-tips">
      <div class="container">
        <h2><i class="fas fa-lightbulb"></i> Home Buying Tips</h2>
        <p class="subtitle">Essential advice for first-time home buyers</p>
        <div class="tips-grid">
          <div class="tip-card">
            <i class="fas fa-percentage"></i>
            <h4>Compare Home Loan Rates</h4>
            <p>Shop around for the best interest rates. Even 0.5% difference can save lakhs over loan tenure.</p>
          </div>
          <div class="tip-card">
            <i class="fas fa-search-location"></i>
            <h4>Check Neighborhood</h4>
            <p>Visit at different times. Check schools, hospitals, markets, and transportation nearby.</p>
          </div>
          <div class="tip-card">
            <i class="fas fa-file-contract"></i>
            <h4>Verify Legal Documents</h4>
            <p>Check title deed, encumbrance certificate, approved building plan, and tax receipts.</p>
          </div>
          <div class="tip-card">
            <i class="fas fa-hard-hat"></i>
            <h4>Professional Inspection</h4>
            <p>Check for water seepage, cracks, electrical issues. Consider hiring a professional inspector.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- SECTION 5: Buying Journey -->
    <section class="buying-journey">
      <div class="container">
        <h2><i class="fas fa-road"></i> Your Home Buying Journey</h2>
        <p class="subtitle">A step-by-step guide to becoming a homeowner</p>
        <div class="journey-steps">
          <div class="journey-step">
            <div class="step-number">1</div>
            <h3>Search & Shortlist</h3>
            <p>Browse properties, compare prices, save favorites</p>
          </div>
          <div class="journey-step">
            <div class="step-number">2</div>
            <h3>Site Visits</h3>
            <p>Visit shortlisted properties, check documentation</p>
          </div>
          <div class="journey-step">
            <div class="step-number">3</div>
            <h3>Home Loan</h3>
            <p>Apply for loan, get pre-approval, calculate EMI</p>
          </div>
          <div class="journey-step">
            <div class="step-number">4</div>
            <h3>Legal Check</h3>
            <p>Verify documents, clear title, no disputes</p>
          </div>
          <div class="journey-step">
            <div class="step-number">5</div>
            <h3>Own Your Home</h3>
            <p>Complete payment, register, move in!</p>
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
    /* ========== VARIABLES ========== */
    :host {
      --primary-blue: #3b82f6;
      --dark-blue: #1e40af;
      --light-blue: #eff6ff;
      --text-dark: #1e293b;
      --text-gray: #64748b;
      --border-gray: #e5e7eb;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    .container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 2rem;
    }

    /* ========== BANNER ========== */
    .buy-split-banner {
      max-width: 1400px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: 40% 60%;
      min-height: 420px;
      overflow: hidden;
      box-shadow: 0 4px 15px rgba(0,0,0,0.08);
      border-radius: 0 0 20px 20px;
    }

    .buy-left-visual {
      background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 30%, #2563eb 70%, #3b82f6 100%);
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
      
      // Overlay for better content visibility when banner image is used
      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(135deg, rgba(30, 58, 138, 0.85) 0%, rgba(30, 64, 175, 0.85) 30%, rgba(37, 99, 235, 0.85) 70%, rgba(59, 130, 246, 0.85) 100%);
        z-index: 0;
      }
      
      &.has-banner::before {
        background: rgba(15, 23, 42, 0.6); // Darker overlay when banner image is present
      }
      
      // Ensure content is above the overlay
      > * {
        position: relative;
        z-index: 1;
      }
    }

    .animated-house-container {
      transform: scale(0.7);
      animation: houseFloat 4s ease-in-out infinite;
    }

    @keyframes houseFloat {
      0%, 100% { transform: scale(0.7) translateY(0); }
      50% { transform: scale(0.7) translateY(-10px); }
    }

    .house-structure {
      width: 200px;
      height: 200px;
      position: relative;
    }

    .roof-top {
      width: 0;
      height: 0;
      border-left: 120px solid transparent;
      border-right: 120px solid transparent;
      border-bottom: 80px solid #f59e0b;
      position: absolute;
      top: 0;
      left: 50%;
      transform: translateX(-50%);
    }

    .house-walls {
      width: 180px;
      height: 140px;
      background: #fbbf24;
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      border-radius: 0 0 8px 8px;
    }

    .window-left, .window-right {
      width: 40px;
      height: 40px;
      background: #1e3a8a;
      position: absolute;
      top: 20px;
      border-radius: 4px;
    }

    .window-left { left: 20px; }
    .window-right { right: 20px; }

    .house-door {
      width: 50px;
      height: 80px;
      background: #92400e;
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      border-radius: 8px 8px 0 0;
    }

    .chimney-smoke {
      position: absolute;
      top: -20px;
      right: 40px;
    }

    .smoke-puff {
      width: 20px;
      height: 20px;
      background: rgba(255,255,255,0.6);
      border-radius: 50%;
      position: absolute;
      animation: smoke 3s infinite;
    }

    .puff-1 { animation-delay: 0s; }
    .puff-2 { animation-delay: 1s; }
    .puff-3 { animation-delay: 2s; }

    @keyframes smoke {
      0% { transform: translateY(0) scale(0.5); opacity: 0; }
      50% { opacity: 0.6; }
      100% { transform: translateY(-40px) scale(1); opacity: 0; }
    }

    .floating-emojis {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
    }

    .emoji {
      position: absolute;
      font-size: 2rem;
      animation: float 6s ease-in-out infinite;
    }

    .emoji-1 {
      top: 10%;
      left: 10%;
      animation-delay: 0s;
    }

    .emoji-2 {
      top: 60%;
      left: 15%;
      animation-delay: 2s;
    }

    .emoji-3 {
      top: 30%;
      right: 15%;
      animation-delay: 4s;
    }

    @keyframes float {
      0%, 100% { transform: translateY(0) rotate(0deg); }
      50% { transform: translateY(-20px) rotate(5deg); }
    }

    .property-count-badge-large {
      position: absolute;
      bottom: 2rem;
      right: 2rem;
      background: rgba(255,255,255,0.95);
      padding: 1rem 1.5rem;
      border-radius: 12px;
      text-align: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    }

    .badge-number {
      font-size: 2.5rem;
      font-weight: 700;
      color: var(--primary-blue);
      line-height: 1;
    }

    .badge-text {
      font-size: 0.9rem;
      color: var(--text-gray);
      font-weight: 600;
      margin-top: 0.5rem;
    }

    .buy-right-content {
      background: white;
      padding: 3rem;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }

    .verified-badge-top {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: #dcfce7;
      color: #166534;
      padding: 0.5rem 1rem;
      border-radius: 8px;
      font-size: 0.9rem;
      font-weight: 600;
      width: fit-content;
      margin-bottom: 1.5rem;
    }

    .super-large-title {
      font-size: 3.5rem;
      font-weight: 700;
      color: var(--text-dark);
      line-height: 1.1;
      margin-bottom: 1rem;
    }

    .gradient-text {
      background: linear-gradient(135deg, #3b82f6, #1e40af);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .description-text {
      font-size: 1.1rem;
      color: var(--text-gray);
      margin-bottom: 2rem;
      line-height: 1.6;
    }

    .stats-mini-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .mini-stat {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .mini-stat-icon {
      width: 50px;
      height: 50px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
    }

    .blue-bg {
      background: var(--light-blue);
      color: var(--primary-blue);
    }

    .mini-stat-text {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .mini-stat-text strong {
      font-size: 1rem;
      color: var(--text-dark);
    }

    .mini-stat-text span {
      font-size: 0.85rem;
      color: var(--text-gray);
    }

    .action-buttons-row {
      display: flex;
      gap: 1rem;
    }

    .btn-browse-buy,
    .btn-calculate-buy {
      padding: 1rem 1.5rem;
      border: none;
      border-radius: 12px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.3s;
    }

    .btn-browse-buy {
      background: var(--primary-blue);
      color: white;
      flex: 1;
    }

    .btn-browse-buy:hover {
      background: var(--dark-blue);
      transform: translateY(-2px);
    }

    .btn-calculate-buy {
      background: white;
      color: var(--primary-blue);
      border: 2px solid var(--primary-blue);
    }

    .btn-calculate-buy:hover {
      background: var(--light-blue);
    }

    /* ========== SECTIONS ========== */
    section {
      padding: 4rem 0;
    }

    section h2 {
      font-size: 2.2rem;
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 0.5rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    section h2 i {
      font-size: 2rem;
      background: linear-gradient(135deg, #3b82f6, #2563eb);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }

    .subtitle {
      color: #64748b;
      font-size: 1rem;
      font-weight: 400;
      margin-bottom: 2.5rem;
      line-height: 1.6;
    }

    /* ========== SEARCH SECTION (Creative & Modern + Sticky) ========== */
    .search-section {
      position: sticky;
      top: 66px;
      z-index: 999;
      background: white;
      padding: 1.5rem 0;
      box-shadow: 0 4px 12px rgba(0,0,0,0.05);
      margin-bottom: 2rem;
      transition: all 0.3s ease;
    }

    .search-section.compact {
      padding: 0.75rem 0;
      box-shadow: 0 2px 8px rgba(0,0,0,0.08);
      top: 66px;
    }

    .search-card {
      background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
      padding: 2rem;
      border-radius: 24px;
      box-shadow: 0 8px 32px rgba(59, 130, 246, 0.08);
      border: 1px solid rgba(59, 130, 246, 0.1);
      position: relative;
      overflow: hidden;
      transition: all 0.3s ease;
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

    .search-section.compact .search-card {
      padding: 0.75rem 1.5rem;
      border-radius: 12px;
      box-shadow: 0 2px 12px rgba(59, 130, 246, 0.06);
    }

    .search-card::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -10%;
      width: 300px;
      height: 300px;
      background: radial-gradient(circle, rgba(59, 130, 246, 0.05) 0%, transparent 70%);
      border-radius: 50%;
      pointer-events: none;
    }

    .search-card h3 {
      font-size: 1.6rem;
      font-weight: 600;
      background: linear-gradient(135deg, #3b82f6, #1e40af);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 2rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      position: relative;
    }

    .search-card h3 i {
      background: linear-gradient(135deg, #3b82f6, #2563eb);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .search-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
      position: relative;
    }

    .search-group label {
      display: block;
      font-weight: 500;
      color: #64748b;
      margin-bottom: 0.5rem;
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
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
      font-size: 1.1rem;
      z-index: 1;
    }

    .input-with-icon input,
    .input-with-icon select {
      width: 100%;
      padding: 1rem 1rem 1rem 2.75rem;
      border: 2px solid #e5e7eb;
      border-radius: 12px;
      font-size: 0.95rem;
      transition: all 0.3s;
      background: white;
    }

    .input-with-icon input:focus,
    .input-with-icon select:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
      transform: translateY(-2px);
    }

    .bedroom-selector {
      display: flex;
      gap: 0.5rem;
    }

    .bhk-btn {
      flex: 1;
      padding: 0.75rem;
      border: 2px solid #e5e7eb;
      background: white;
      border-radius: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
      font-size: 0.9rem;
      position: relative;
      overflow: hidden;
    }

    .bhk-btn::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.1), transparent);
      transition: left 0.5s;
    }

    .bhk-btn:hover::before {
      left: 100%;
    }

    .bhk-btn.active {
      background: linear-gradient(135deg, #3b82f6, #2563eb);
      color: white;
      border-color: #2563eb;
      transform: scale(1.05);
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    }

    .bhk-btn:hover {
      border-color: #3b82f6;
      transform: translateY(-2px);
    }

    .search-actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      position: relative;
    }

    /* Compact View Styles - Redesigned */
    .compact-view {
      animation: slideIn 0.3s ease;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

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

    .compact-filter i {
      position: absolute;
      left: 1rem;
      top: 50%;
      transform: translateY(-50%);
      color: #3b82f6;
      pointer-events: none;
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
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .compact-filter input {
      padding-left: 2.5rem;
    }

    .compact-sort {
      min-width: 180px;
    }

    .compact-reset {
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

    .compact-reset:hover {
      background: #2563eb;
      transform: translateY(-1px);
    }

    .compact-reset:hover {
      background: linear-gradient(135deg, #ef4444, #dc2626);
      color: white;
      transform: rotate(90deg);
    }

    .btn {
      padding: 1rem 2.5rem;
      border: none;
      border-radius: 12px;
      font-size: 0.95rem;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
    }

    .btn::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 0;
      height: 0;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.3);
      transform: translate(-50%, -50%);
      transition: width 0.6s, height 0.6s;
    }

    .btn:hover::before {
      width: 300px;
      height: 300px;
    }

    .btn-primary {
      background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
      color: white;
      box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);
    }

    .btn-primary:hover {
      background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
      transform: translateY(-3px);
      box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
    }

    .btn-outline {
      background: white;
      color: #3b82f6;
      border: 2px solid #3b82f6;
      box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1);
    }

    .btn-outline:hover {
      background: linear-gradient(135deg, #eff6ff, #dbeafe);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
    }

    /* ========== PROPERTIES SECTION ========== */
    .properties-section {
      background: #f8fafc;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 2.5rem;
    }

    .section-header h2 {
      font-size: 2rem;
      font-weight: 600;
    }

    .sort-options {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      background: white;
      padding: 0.75rem 1.25rem;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.06);
    }

    .sort-options label {
      font-weight: 500;
      color: #64748b;
      font-size: 0.9rem;
    }

    .sort-options select {
      padding: 0.5rem 1rem;
      border: 2px solid #e5e7eb;
      border-radius: 8px;
      font-size: 0.95rem;
      cursor: pointer;
      background: white;
      color: #1e293b;
      font-weight: 500;
      transition: all 0.3s;
    }

    .sort-options select:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .property-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 1.5rem;
    }

    .property-card {
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

    .property-card:hover {
      box-shadow: 0 8px 24px rgba(59, 130, 246, 0.12);
      transform: translateY(-4px);
      border-color: #bfdbfe;
    }

    /* ========== IMAGE CAROUSEL (MAXIMIZED) ========== */
    .card-image-carousel {
      position: relative;
      height: 280px;
      overflow: hidden;
    }

    .carousel-container {
      width: 100%;
      height: 100%;
      position: relative;
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
      transition: transform 0.3s;
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

    .card-image-carousel:hover .carousel-nav {
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

    .favorite-btn {
      position: absolute;
      top: 0.75rem;
      right: 0.75rem;
      width: 36px;
      height: 36px;
      border-radius: 50%;
      border: none;
      background: rgba(255,255,255,0.95);
      color: #94a3b8;
      cursor: pointer;
      transition: all 0.3s;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      backdrop-filter: blur(8px);
    }

    .favorite-btn:hover {
      transform: scale(1.15);
      background: white;
    }

    .favorite-btn i.active {
      color: #ef4444;
    }

    .card-content {
      padding: 0.75rem;
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .property-category {
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

    .card-content h3 {
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

    .card-content h3:hover {
      color: var(--primary-blue);
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

    .specs {
      display: flex;
      gap: 0.5rem;
      padding: 0.35rem 0;
      border-top: 1px solid #f1f5f9;
      margin: 0.25rem 0;
    }

    .spec {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      color: #475569;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .spec i {
      color: #3b82f6;
      font-size: 0.8rem;
    }

    .price-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: auto;
      padding-top: 0.25rem;
    }

    .price {
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

    /* Loading & Empty States */
    .skeleton-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 2rem;
    }

    .skeleton-card {
      background: white;
      border-radius: 16px;
      overflow: hidden;
      padding: 1.5rem;
    }

    .skeleton-image {
      width: 100%;
      height: 220px;
      background: linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: 8px;
      margin-bottom: 1rem;
    }

    .skeleton-title,
    .skeleton-text,
    .skeleton-button {
      background: linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: 4px;
      margin-bottom: 0.5rem;
    }

    .skeleton-title {
      height: 24px;
      width: 80%;
    }

    .skeleton-text {
      height: 16px;
      width: 100%;
    }

    .skeleton-short {
      width: 60%;
    }

    .skeleton-button {
      height: 40px;
      width: 120px;
      margin-top: 1rem;
    }

    @keyframes shimmer {
      0% { background-position: -200% 0; }
      100% { background-position: 200% 0; }
    }

    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
    }

    .empty-state i {
      font-size: 4rem;
      color: var(--text-gray);
      margin-bottom: 1rem;
    }

    .empty-state h3 {
      font-size: 1.5rem;
      color: var(--text-dark);
      margin-bottom: 0.5rem;
    }

    .empty-state p {
      color: var(--text-gray);
      margin-bottom: 2rem;
    }

    /* Load More Indicator */
    .load-more-indicator {
      text-align: center;
      padding: 3rem 2rem;
    }

    .spinner {
      width: 50px;
      height: 50px;
      margin: 0 auto 1rem;
      border: 4px solid #e5e7eb;
      border-top-color: #3b82f6;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .load-more-indicator p {
      color: #64748b;
      font-size: 1rem;
      font-weight: 500;
    }

    /* End of Results */
    .end-of-results {
      text-align: center;
      padding: 3rem 2rem;
      background: linear-gradient(135deg, #f0fdf4, #dcfce7);
      border-radius: 16px;
      margin-top: 2rem;
    }

    .end-of-results i {
      font-size: 3rem;
      color: #10b981;
      margin-bottom: 1rem;
    }

    .end-of-results p {
      color: #065f46;
      font-weight: 600;
      font-size: 1.1rem;
    }

    /* ========== EMI CALCULATOR (Creative Design) ========== */
    .loan-calculator {
      position: relative;
    }

    .calculator-card {
      background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #3b82f6 100%);
      padding: 2rem;
      border-radius: 16px;
      box-shadow: 0 8px 24px rgba(30, 58, 138, 0.2);
      position: relative;
      overflow: hidden;
    }

    .calculator-card::before {
      content: '';
      position: absolute;
      top: -100px;
      left: -100px;
      width: 300px;
      height: 300px;
      background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
      border-radius: 50%;
    }

    .calculator-card::after {
      content: '';
      position: absolute;
      bottom: -150px;
      right: -150px;
      width: 400px;
      height: 400px;
      background: radial-gradient(circle, rgba(255, 255, 255, 0.08) 0%, transparent 70%);
      border-radius: 50%;
    }

    .calculator-card h2 {
      color: white;
      position: relative;
      z-index: 1;
      font-size: 1.5rem;
    }

    .calculator-card h2 i {
      color: rgba(255, 255, 255, 0.9);
    }

    .calculator-card .subtitle {
      color: rgba(255, 255, 255, 0.8);
      position: relative;
      z-index: 1;
      font-size: 0.9rem;
      margin-bottom: 1.5rem;
    }

    .calculator-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
      margin-top: 1.5rem;
      position: relative;
      z-index: 1;
    }

    .calculator-inputs {
      background: rgba(255, 255, 255, 0.1);
      padding: 1.25rem;
      border-radius: 12px;
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
    }

    .input-group {
      margin-bottom: 1rem;
    }

    .input-group label {
      display: block;
      font-weight: 500;
      color: white;
      margin-bottom: 0.5rem;
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .input-group input {
      width: 100%;
      padding: 0.65rem;
      border: 2px solid rgba(255, 255, 255, 0.2);
      border-radius: 8px;
      font-size: 0.9rem;
      transition: all 0.3s;
      background: rgba(255, 255, 255, 0.95);
      color: #1e293b;
      font-weight: 500;
    }

    .input-group input:focus {
      outline: none;
      border-color: white;
      background: white;
      box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.2);
      transform: translateY(-2px);
    }

    .input-group input::placeholder {
      color: #94a3b8;
    }

    .calculator-result {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 6px 24px rgba(0, 0, 0, 0.15);
      position: relative;
      overflow: hidden;
    }

    .calculator-result::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 5px;
      background: linear-gradient(90deg, #3b82f6, #2563eb, #1e40af);
    }

    .emi-display {
      text-align: center;
      margin-bottom: 1.25rem;
      padding-bottom: 1.25rem;
      border-bottom: 2px solid #e5e7eb;
      position: relative;
    }

    .emi-display::after {
      content: '💰';
      position: absolute;
      top: -10px;
      right: 20px;
      font-size: 2.5rem;
      opacity: 0.1;
    }

    .emi-label {
      display: block;
      font-size: 0.9rem;
      color: #64748b;
      margin-bottom: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 1px;
      font-weight: 600;
    }

    .emi-amount {
      display: block;
      font-size: 2rem;
      font-weight: 700;
      background: linear-gradient(135deg, #3b82f6, #1e40af);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      line-height: 1.2;
    }

    .loan-breakdown {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .breakdown-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.65rem 1rem;
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      border-radius: 8px;
      border-left: 3px solid #3b82f6;
      transition: all 0.3s;
    }

    .breakdown-item:hover {
      transform: translateX(5px);
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
    }

    .breakdown-label {
      color: #64748b;
      font-weight: 500;
      font-size: 0.9rem;
    }

    .breakdown-value {
      color: #0f172a;
      font-weight: 700;
      font-size: 1.1rem;
    }

    /* ========== BUYING TIPS (1x4 Grid) ========== */
    .buying-tips {
      background: #f8fafc;
    }

    .tips-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.5rem;
    }

    .tip-card {
      background: white;
      padding: 2rem 1.5rem;
      border-radius: 16px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
      transition: all 0.3s;
      text-align: center;
    }

    .tip-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.12);
    }

    .tip-card i {
      font-size: 2.5rem;
      color: var(--primary-blue);
      margin-bottom: 1rem;
      display: block;
    }

    .tip-card h4 {
      font-size: 1.1rem;
      color: var(--text-dark);
      margin-bottom: 0.75rem;
      line-height: 1.3;
    }

    .tip-card p {
      color: var(--text-gray);
      line-height: 1.6;
      font-size: 0.95rem;
    }

    /* ========== BUYING JOURNEY ========== */
    .journey-steps {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 2rem;
    }

    .journey-step {
      background: white;
      padding: 2rem;
      border-radius: 16px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
      text-align: center;
      transition: all 0.3s;
    }

    .journey-step:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.12);
    }

    .step-number {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: var(--primary-blue);
      color: white;
      font-size: 1.5rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1rem;
    }

    .journey-step h3 {
      font-size: 1.1rem;
      color: var(--text-dark);
      margin-bottom: 0.5rem;
    }

    .journey-step p {
      color: var(--text-gray);
      font-size: 0.95rem;
      line-height: 1.5;
    }

    /* ========== RESPONSIVE ========== */
    @media (max-width: 1024px) {
      .buy-split-banner {
        grid-template-columns: 1fr;
        min-height: auto;
      }

      .buy-left-visual {
        min-height: 300px;
      }

      .calculator-grid {
        grid-template-columns: 1fr;
      }

      .tips-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .property-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 2rem;
      }
    }

    @media (max-width: 768px) {
      .navbar-container {
        padding: 0.75rem 1rem;
      }

      .nav-links {
        gap: 1rem;
        font-size: 0.9rem;
      }

      .super-large-title {
        font-size: 2.5rem;
      }

      .stats-mini-grid {
        grid-template-columns: 1fr;
        gap: 1rem;
      }

      .action-buttons-row {
        flex-direction: column;
      }

      .property-grid {
        grid-template-columns: 1fr;
      }

      .journey-steps {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class BuyComponent implements OnInit, OnDestroy {
  // Constants for template
  bedValue1 = '1';
  bedValue2 = '2';
  bedValue3 = '3';
  bedValue4 = '4';

  // Data
  properties: Property[] = [];
  filteredProperties: Property[] = [];
  totalProperties = 0;
  loading = false;
  loadingMore = false;
  
  // Modal
  selectedPropertyId: number | null = null;

  // Pagination
  currentPage = 1;
  pageSize = 12;
  hasMore = true;
  totalPages = 1;

  // Search & Filters
  searchQuery = '';
  searchFilters: PropertyFilters = {
    type: 'For Sale',
    category: ''
  };
  selectedBedrooms = '';
  budgetRange = '';
  sortBy = 'recent';
  selectedCity = 'Hyderabad';

  // Compact filters on scroll
  isFiltersCompact = false;

  // Favorites
  favorites: number[] = [];

  // Image Carousel - Track current image index for each property
  propertyImageIndices: { [key: number]: number } = {};

  // Loan Calculator
  loanCalculator = {
    amount: 5000000,
    rate: 8.5,
    years: 20,
    emi: 0,
    totalInterest: 0,
    totalAmount: 0
  };

  // Banners
  buyBanners: Banner[] = [];

  constructor(
    private propertyService: PropertyService,
    private router: Router,
    private locationService: LocationService
  ) {}

  ngOnInit() {
    // Subscribe to location changes from header
    this.locationService.selectedCity$.subscribe(city => {
      this.selectedCity = city;
      // Reload properties when city changes
      this.currentPage = 1;
      this.properties = [];
      this.loadProperties();
    });

    this.loadFavorites();
    this.calculateLoan();
    this.setupScrollListener();
    this.loadBanners();
    
    // Check if user came from home page banner
    const shouldScrollToSearch = localStorage.getItem('buyPageScrollToSearch');
    if (shouldScrollToSearch === 'true') {
      localStorage.removeItem('buyPageScrollToSearch');
      // Scroll to search section (just below banner) after a short delay
      setTimeout(() => {
        const searchSection = document.getElementById('searchSection');
        if (searchSection) {
          searchSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 300);
    }
  }

  loadBanners(): void {
    this.propertyService.getBanners('buy_banner').subscribe({
      next: (banners) => {
        this.buyBanners = banners.filter(b => b.is_active).map(b => ({
          ...b,
          image_source: b.image_source?.startsWith('/') ? environment.apiUrl + b.image_source : b.image_source
        }));
      },
      error: (error) => {
        console.error('Error loading buy banners:', error);
        this.buyBanners = [];
      }
    });
  }

  getBuyBannerImage(): string | null {
    if (this.buyBanners.length > 0 && this.buyBanners[0].image_source) {
      return this.buyBanners[0].image_source;
    }
    return null;
  }

  hasBuyBanner(): boolean {
    return this.buyBanners.length > 0 && !!this.getBuyBannerImage();
  }

  ngOnDestroy() {
    // Clean up scroll listener to prevent memory leaks
    window.removeEventListener('scroll', this.scrollHandler);
  }

  private scrollHandler = () => {
    // Compact filters when scrolled down
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    this.isFiltersCompact = scrollTop > 200;
    
    // Load more properties when near bottom
    if (this.isNearBottom() && !this.loading && !this.loadingMore && this.hasMore) {
      this.loadMoreProperties();
    }
  };

  setupScrollListener() {
    // Remove existing listener to prevent duplicates
    window.removeEventListener('scroll', this.scrollHandler);
    // Add new listener
    window.addEventListener('scroll', this.scrollHandler);
  }

  isNearBottom(): boolean {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    
    // Trigger when user is 300px from bottom
    return (scrollTop + windowHeight >= documentHeight - 300);
  }

  loadProperties(resetList = true) {
    if (resetList) {
    this.loading = true;
      this.currentPage = 1;
      this.filteredProperties = [];
    } else {
      this.loadingMore = true;
    }

    const filters = this.buildFilters();
    
    this.propertyService.getProperties(filters).subscribe({
      next: (response) => {
        const properties = (response && response.results) ? response.results : [];
        const count = (response && typeof response.count === 'number') ? response.count : properties.length;
        
        if (resetList) {
          this.filteredProperties = properties;
        } else {
          this.filteredProperties = [...this.filteredProperties, ...properties];
        }
        
        this.totalProperties = count;
        this.totalPages = Math.ceil(count / this.pageSize);
        this.hasMore = this.currentPage < this.totalPages;
        
        this.loading = false;
        this.loadingMore = false;
      },
      error: (error) => {
        console.error('Failed to load properties:', error);
        if (!resetList && error?.status === 404) {
          // We've reached beyond the last page – stop requesting more
          this.hasMore = false;
          this.currentPage = Math.max(this.currentPage - 1, 1);
        }
        this.loading = false;
        this.loadingMore = false;
      }
    });
  }

  loadMoreProperties() {
    // Guard against multiple simultaneous requests
    if (this.hasMore && !this.loadingMore && !this.loading) {
      this.currentPage++;
      this.loadProperties(false);
    }
  }

  buildFilters(): any {
    const filters: any = {
      type: 'For Sale',
      page: this.currentPage,
      page_size: this.pageSize
    };

    // Add city filter from header location selector
    if (this.selectedCity && this.selectedCity !== 'All Cities') {
      filters.city = this.selectedCity;
    }

    if (this.searchQuery) {
      filters.search = this.searchQuery;
    }

    if (this.searchFilters.category) {
      filters.category = this.searchFilters.category;
    }

    if (this.selectedBedrooms) {
      filters.bedrooms = this.selectedBedrooms;
    }

    if (this.budgetRange && this.budgetRange !== '') {
      const [min, max] = this.budgetRange.split('-');
      if (min && parseInt(min) > 0) {
        filters.min_price = parseInt(min) * 100000; // Lakh to rupees
      }
      if (min === '100') {
        filters.min_price = 10000000; // 1 Cr+
      }
      if (max && max !== '+') {
        filters.max_price = parseInt(max) * 100000;
      }
    }

    // Handle sorting
    if (this.sortBy === 'price-low') {
      filters.ordering = 'price';
    } else if (this.sortBy === 'price-high') {
      filters.ordering = '-price';
    } else if (this.sortBy === 'area-large') {
      filters.ordering = '-area';
    } else {
      filters.ordering = '-created_at';
    }

    return filters;
  }

  loadFavorites() {
    const saved = localStorage.getItem('favorites');
    if (saved) {
      this.favorites = JSON.parse(saved);
    }
  }

  onSearchChange() {
    // Debounce search - reload from backend
    this.applyFilters();
  }

  selectBedrooms(bedrooms: string) {
    this.selectedBedrooms = this.selectedBedrooms === bedrooms ? '' : bedrooms;
    this.applyFilters();
  }

  applyFilters() {
    // Load properties from backend with filters
    this.loadProperties(true);
    // Scroll to property listings
    setTimeout(() => {
      const propertiesSection = document.querySelector('.properties-section');
      if (propertiesSection) {
        propertiesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }

  resetFilters() {
    this.searchQuery = '';
    this.searchFilters = { type: 'For Sale' };
    this.selectedBedrooms = '';
    this.budgetRange = '';
    this.sortBy = 'recent';
    this.loadProperties(true);
    // Scroll to property listings
    setTimeout(() => {
      const propertiesSection = document.querySelector('.properties-section');
      if (propertiesSection) {
        propertiesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }

  sortProperties() {
    // Sorting is now handled by backend via buildFilters()
    this.loadProperties(true);
    // Scroll to property listings
    setTimeout(() => {
      const propertiesSection = document.querySelector('.properties-section');
      if (propertiesSection) {
        propertiesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  }

  extractNumericPrice(price: string): number {
    const match = price.match(/[\d.]+/);
    if (!match) return 0;
    const num = parseFloat(match[0]);
    if (price.includes('Cr')) return num * 10000000;
    if (price.includes('Lakh')) return num * 100000;
    return num;
  }

  calculateLoan() {
    const P = this.loanCalculator.amount;
    const r = this.loanCalculator.rate / 12 / 100;
    const n = this.loanCalculator.years * 12;

    if (P > 0 && r > 0 && n > 0) {
      const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      this.loanCalculator.emi = Math.round(emi);
      this.loanCalculator.totalAmount = Math.round(emi * n);
      this.loanCalculator.totalInterest = this.loanCalculator.totalAmount - P;
    }
  }

  toggleFavorite(propertyId: number, event: Event) {
    event.stopPropagation();
    const index = this.favorites.indexOf(propertyId);
    if (index > -1) {
      this.favorites.splice(index, 1);
    } else {
      this.favorites.push(propertyId);
    }
    localStorage.setItem('favorites', JSON.stringify(this.favorites));
  }

  isFavorite(propertyId: number): boolean {
    return this.favorites.includes(propertyId);
  }

  viewProperty(propertyId: number) {
    // Open property detail in modal instead of navigating
    this.selectedPropertyId = propertyId;
  }

  closePropertyModal() {
    this.selectedPropertyId = null;
  }

  getPropertyIcon(category?: string): string {
    const icons: any = {
      flat: '🏢',
      house: '🏠',
      villa: '🏡',
      plot: '📐',
      commercial: '🏬',
      penthouse: '🌆'
    };
    if (!category) {
      return '🏠';
    }
    return icons[category] || '🏠';
  }

  getCategoryName(category?: string): string {
    const names: any = {
      flat: 'Apartment',
      house: 'House',
      villa: 'Villa',
      plot: 'Plot',
      commercial: 'Commercial',
      penthouse: 'Penthouse'
    };
    if (!category) {
      return 'General';
    }
    return names[category] || category;
  }

  scrollToProperties() {
    document.getElementById('propertiesSection')?.scrollIntoView({ behavior: 'smooth' });
  }

  scrollToCalculator() {
    document.getElementById('calculatorSection')?.scrollIntoView({ behavior: 'smooth' });
  }

  // Image Carousel Methods
  getPropertyImageIndex(propertyIndex: number): number {
    return this.propertyImageIndices[propertyIndex] || 0;
  }

  nextImage(propertyIndex: number): void {
    const property = this.filteredProperties[propertyIndex];
    if (!property || !property.images || property.images.length === 0) return;
    
    const currentIndex = this.propertyImageIndices[propertyIndex] || 0;
    const nextIndex = (currentIndex + 1) % property.images.length;
    this.propertyImageIndices[propertyIndex] = nextIndex;
  }

  previousImage(propertyIndex: number): void {
    const property = this.filteredProperties[propertyIndex];
    if (!property || !property.images || property.images.length === 0) return;
    
    const currentIndex = this.propertyImageIndices[propertyIndex] || 0;
    const prevIndex = currentIndex === 0 ? property.images.length - 1 : currentIndex - 1;
    this.propertyImageIndices[propertyIndex] = prevIndex;
  }

  goToImage(propertyIndex: number, imageIndex: number): void {
    this.propertyImageIndices[propertyIndex] = imageIndex;
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

