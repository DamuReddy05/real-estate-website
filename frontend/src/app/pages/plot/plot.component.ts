import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { PropertyService } from '../../core/services/property.service';
import { Property, PropertyFilters } from '../../core/models/property.model';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-plot',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <!-- Navigation Header - Consistent Across All Pages -->
    <nav class="app-navbar">
      <div class="navbar-container">
        <div class="nav-brand">
          <h2 routerLink="/"><i class="fas fa-home"></i> RealEstateHub</h2>
        </div>
        <ul class="nav-links">
          <li><a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}">Home</a></li>
          <li><a routerLink="/buy" routerLinkActive="active">Buy</a></li>
          <li><a routerLink="/rent" routerLinkActive="active">Rent</a></li>
          <li><a routerLink="/plot" routerLinkActive="active">Plots</a></li>
        </ul>
        <div class="nav-actions">
          <button class="btn-admin" routerLink="/admin/login">
            <i class="fas fa-user-shield"></i> Admin
          </button>
        </div>
      </div>
    </nav>

    <!-- PLOT PAGE - UNIQUE ANGULAR GRID BANNER -->
    <header class="plot-angular-banner">
      <div class="plot-diagonal-bg"></div>
      <div class="grid-pattern-overlay"></div>
      
      <div class="plot-content-wrapper">
        <div class="plot-top-section">
          <div class="plot-icon-badge">
            <i class="fas fa-map-marked-alt"></i>
          </div>
        </div>
        
        <div class="plot-main-content">
          <div class="plot-title-section">
            <h1 class="plot-mega-title">
              Invest in<br/>
              <span class="land-highlight">Land & Plots</span>
            </h1>
            <div class="plot-count-inline">
              <div class="count-circle">{{ totalProperties }}</div>
              <span class="count-text">Plots Available</span>
            </div>
          </div>
          
          <p class="plot-tagline">
            Secure your future investment with prime land opportunities.<br/>
            High ROI potential across premium locations.
          </p>
          
          <div class="investment-features-grid">
            <div class="invest-feature">
              <i class="fas fa-chart-line"></i>
              <div class="feature-content-plot">
                <strong>High ROI</strong>
                <span>15-20% Returns</span>
              </div>
            </div>
            <div class="invest-feature">
              <i class="fas fa-certificate"></i>
              <div class="feature-content-plot">
                <strong>Clear Titles</strong>
                <span>DTCP Approved</span>
              </div>
            </div>
            <div class="invest-feature">
              <i class="fas fa-map-marked-alt"></i>
              <div class="feature-content-plot">
                <strong>Prime Locations</strong>
                <span>Growth Areas</span>
              </div>
            </div>
            <div class="invest-feature">
              <i class="fas fa-calculator"></i>
              <div class="feature-content-plot">
                <strong>ROI Calculator</strong>
                <span>Plan Investments</span>
              </div>
            </div>
          </div>
          
          <div class="plot-cta-buttons">
            <button class="btn-plot-primary" (click)="scrollToPlots()">
              <i class="fas fa-map"></i>
              <span>View All Plots</span>
            </button>
            <button class="btn-plot-secondary" (click)="scrollToROI()">
              <i class="fas fa-calculator-alt"></i>
              <span>Calculate ROI</span>
            </button>
          </div>
        </div>
        
        <div class="plot-visual-grid">
          <div class="grid-box box-1"></div>
          <div class="grid-box box-2"></div>
          <div class="grid-box box-3"></div>
          <div class="grid-box box-4"></div>
        </div>
      </div>
    </header>

    <!-- Land Investment Calculator - Unique -->
    <section class="investment-section">
      <div class="container">
        <div class="calculator-card">
          <h2><i class="fas fa-calculator-alt"></i> Land Investment ROI Calculator</h2>
          <p>Calculate potential returns on your land investment</p>
          <div class="calculator-grid">
            <div class="calc-inputs">
              <div class="input-row">
                <div class="input-group">
                  <label>Purchase Price (₹)</label>
                  <input 
                    type="number" 
                    [(ngModel)]="roiCalculator.purchasePrice"
                    (input)="calculateROI()"
                    placeholder="e.g., 5000000"
                  >
                </div>
                <div class="input-group">
                  <label>Expected Appreciation (%/year)</label>
                  <input 
                    type="number" 
                    [(ngModel)]="roiCalculator.appreciationRate"
                    (input)="calculateROI()"
                    placeholder="e.g., 15"
                    step="0.5"
                  >
                </div>
                <div class="input-group">
                  <label>Investment Period (Years)</label>
                  <input 
                    type="number" 
                    [(ngModel)]="roiCalculator.years"
                    (input)="calculateROI()"
                    placeholder="e.g., 5"
                  >
                </div>
              </div>
            </div>
            <div class="calc-result" *ngIf="roiCalculator.futureValue > 0">
              <div class="result-card">
                <div class="result-item">
                  <span class="result-label">Current Value</span>
                  <span class="result-value">₹{{ roiCalculator.purchasePrice | number:'1.0-0' }}</span>
                </div>
                <div class="result-item highlight">
                  <span class="result-label">Future Value</span>
                  <span class="result-value">₹{{ roiCalculator.futureValue | number:'1.0-0' }}</span>
                </div>
                <div class="result-item success">
                  <span class="result-label">Total Returns</span>
                  <span class="result-value">₹{{ roiCalculator.returns | number:'1.0-0' }}</span>
                </div>
                <div class="result-item">
                  <span class="result-label">ROI Percentage</span>
                  <span class="result-value">{{ roiCalculator.roiPercent | number:'1.1-1' }}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Area Converter Tool -->
    <section class="converter-section">
      <div class="container">
        <div class="converter-card">
          <h3><i class="fas fa-ruler-combined"></i> Land Area Converter</h3>
          <div class="converter-grid">
            <div class="input-group">
              <label>Square Feet (sq ft)</label>
              <input 
                type="number" 
                [(ngModel)]="areaConverter.sqft"
                (input)="convertFromSqft()"
                placeholder="e.g., 2000"
              >
            </div>
            <div class="result-box">
              <div class="conversion-result">
                <span class="conv-label">Square Meters</span>
                <span class="conv-value">{{ areaConverter.sqm | number:'1.2-2' }} m²</span>
              </div>
            </div>
            <div class="result-box">
              <div class="conversion-result">
                <span class="conv-label">Acres</span>
                <span class="conv-value">{{ areaConverter.acres | number:'1.4-4' }}</span>
              </div>
            </div>
            <div class="result-box">
              <div class="conversion-result">
                <span class="conv-label">Cents</span>
                <span class="conv-value">{{ areaConverter.cents | number:'1.2-2' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Search Section -->
    <section class="search-section">
      <div class="container">
        <div class="search-card">
          <h3>Find Land & Plots</h3>
          <div class="search-grid">
            <div class="search-group">
              <label>Location</label>
              <div class="input-with-icon">
                <i class="fas fa-map-marker-alt"></i>
                <input 
                  type="text" 
                  placeholder="City, area, highway..." 
                  [(ngModel)]="searchQuery"
                  (input)="applyFilters()"
                >
              </div>
            </div>
            <div class="search-group">
              <label>Plot Type</label>
              <div class="plot-type-selector">
                <button 
                  class="type-btn"
                  [class.active]="plotType === 'residential'"
                  (click)="setPlotType('residential')"
                >
                  <i class="fas fa-home"></i> Residential
                </button>
                <button 
                  class="type-btn"
                  [class.active]="plotType === 'commercial'"
                  (click)="setPlotType('commercial')"
                >
                  <i class="fas fa-building"></i> Commercial
                </button>
                <button 
                  class="type-btn"
                  [class.active]="plotType === 'agricultural'"
                  (click)="setPlotType('agricultural')"
                >
                  <i class="fas fa-tractor"></i> Agricultural
                </button>
              </div>
            </div>
            <div class="search-group">
              <label>Area Range (sq ft)</label>
              <div class="input-with-icon">
                <i class="fas fa-ruler"></i>
                <select [(ngModel)]="areaRange" (change)="applyFilters()">
                  <option value="">Any Size</option>
                  <option value="0-1000">Under 1,000</option>
                  <option value="1000-2000">1,000 - 2,000</option>
                  <option value="2000-5000">2,000 - 5,000</option>
                  <option value="5000+">Above 5,000</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Plot Listings -->
    <section class="plots-section">
      <div class="container">
        <div class="section-header">
          <div>
            <h2>Available Plots & Land</h2>
            <p>{{ filteredProperties.length }} plots for sale</p>
          </div>
          <div class="sort-options">
            <select [(ngModel)]="sortBy" (change)="sortProperties()">
              <option value="recent">Recently Listed</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="area-large">Largest Plot First</option>
            </select>
          </div>
        </div>

        <div class="plot-grid" *ngIf="!loading && filteredProperties.length > 0">
          <div class="plot-card" *ngFor="let property of filteredProperties">
            <div class="plot-visual" (click)="viewProperty(property.id)">
              <div class="plot-icon">🗺️</div>
              <div class="plot-size">{{ property.carpet_area }} sq ft</div>
              <button class="save-btn" (click)="toggleFavorite(property.id, $event)">
                <i class="fas fa-bookmark" [class.saved]="isFavorite(property.id)"></i>
              </button>
            </div>
            <div class="plot-info">
              <div class="plot-category">{{ getPlotCategory(property) }}</div>
              <h3 (click)="viewProperty(property.id)">{{ property.title }}</h3>
              <p class="location">
                <i class="fas fa-map-marker-alt"></i>
                {{ property.location }}, {{ property.city }}, {{ property.state }}
              </p>
              <div class="plot-specs">
                <div class="spec-item">
                  <i class="fas fa-vector-square"></i>
                  <div>
                    <span class="spec-label">Total Area</span>
                    <span class="spec-value">{{ property.carpet_area }} sq ft</span>
                  </div>
                </div>
                <div class="spec-item">
                  <i class="fas fa-ruler-horizontal"></i>
                  <div>
                    <span class="spec-label">Approx. Acres</span>
                    <span class="spec-value">{{ (property.carpet_area / 43560) | number:'1.2-2' }}</span>
                  </div>
                </div>
              </div>
              <div class="plot-highlights" *ngIf="property.amenities">
                <span class="highlight" *ngFor="let amenity of (property.amenities || []).slice(0, 3)">
                  <i class="fas fa-check"></i> {{ amenity.name }}
                </span>
              </div>
              <div class="plot-pricing">
                <div class="price-main">₹{{ formatPrice(property.price) }}</div>
                <div class="price-per-sqft">₹{{ getPricePerSqFt(property) }}/sq ft</div>
              </div>
              <div class="plot-actions">
                <button class="btn btn-primary" (click)="viewProperty(property.id)">
                  <i class="fas fa-eye"></i> View Plot
                </button>
                <button class="btn btn-outline" (click)="contactOwner(property, $event)">
                  <i class="fas fa-phone"></i> Contact
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
          <i class="fas fa-map"></i>
          <h3>No Plots Available</h3>
          <p>Try different location or size range</p>
          <button class="btn btn-primary" (click)="resetFilters()">Reset Filters</button>
        </div>
      </div>
    </section>

    <!-- Construction Cost Estimator -->
    <section class="construction-estimator">
      <div class="container">
        <div class="estimator-card">
          <h2><i class="fas fa-hard-hat"></i> Construction Cost Estimator</h2>
          <p>Estimate building costs for your plot</p>
          <div class="estimator-grid">
            <div class="estimator-inputs">
              <div class="input-group">
                <label>Built-up Area Needed (sq ft)</label>
                <input 
                  type="number" 
                  [(ngModel)]="constructionCalc.builtupArea"
                  (input)="calculateConstruction()"
                  placeholder="e.g., 1500"
                >
              </div>
              <div class="input-group">
                <label>Construction Quality</label>
                <select [(ngModel)]="constructionCalc.quality" (change)="calculateConstruction()">
                  <option value="basic">Basic (₹1,200/sq ft)</option>
                  <option value="standard">Standard (₹1,800/sq ft)</option>
                  <option value="premium">Premium (₹2,500/sq ft)</option>
                  <option value="luxury">Luxury (₹3,500/sq ft)</option>
                </select>
              </div>
            </div>
            <div class="estimator-result" *ngIf="constructionCalc.totalCost > 0">
              <div class="cost-breakdown">
                <div class="cost-item">
                  <span>Construction Cost</span>
                  <span>₹{{ constructionCalc.constructionCost | number:'1.0-0' }}</span>
                </div>
                <div class="cost-item">
                  <span>Architect & Plans (3%)</span>
                  <span>₹{{ constructionCalc.architectCost | number:'1.0-0' }}</span>
                </div>
                <div class="cost-item">
                  <span>Approvals & Permits (2%)</span>
                  <span>₹{{ constructionCalc.approvalCost | number:'1.0-0' }}</span>
                </div>
                <div class="cost-item">
                  <span>Contingency (5%)</span>
                  <span>₹{{ constructionCalc.contingency | number:'1.0-0' }}</span>
                </div>
                <div class="cost-item total">
                  <span>Total Estimated Cost</span>
                  <span>₹{{ constructionCalc.totalCost | number:'1.0-0' }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Plot Listings -->
    <section class="plots-listing">
      <div class="container">
        <div class="listing-header">
          <div>
            <h2>Land & Plots for Sale</h2>
            <p>{{ filteredProperties.length }} investment opportunities</p>
          </div>
          <div class="view-controls">
            <label>Sort:</label>
            <select [(ngModel)]="sortBy" (change)="sortProperties()">
              <option value="recent">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="area-large">Largest Area</option>
              <option value="best-value">Best Value (₹/sq ft)</option>
            </select>
          </div>
        </div>

        <div class="plots-grid" *ngIf="!loading && filteredProperties.length > 0">
          <div class="plot-card-large" *ngFor="let property of filteredProperties">
            <div class="plot-header">
              <div class="plot-visual-large" (click)="viewProperty(property.id)">
                <div class="plot-shape">
                  <div class="dimension">{{ property.carpet_area }} sq ft</div>
                  <div class="plot-type-badge">{{ getPlotUsage(property) }}</div>
                </div>
              </div>
              <button class="bookmark-btn" (click)="toggleFavorite(property.id, $event)">
                <i class="fas fa-bookmark" [class.saved]="isFavorite(property.id)"></i>
              </button>
            </div>
            <div class="plot-details">
              <div class="plot-title-section">
                <h3 (click)="viewProperty(property.id)">{{ property.title }}</h3>
                <div class="plot-location">
                  <i class="fas fa-map-marker-alt"></i>
                  {{ property.location }}, {{ property.city }}
                </div>
              </div>
              <div class="plot-measurements">
                <div class="measurement">
                  <i class="fas fa-chart-area"></i>
                  <div>
                    <span class="meas-label">Plot Area</span>
                    <span class="meas-value">{{ property.carpet_area }} sq ft</span>
                    <small>({{ (property.carpet_area / 43560) | number:'1.3-3' }} acres)</small>
                  </div>
                </div>
                <div class="measurement">
                  <i class="fas fa-rupee-sign"></i>
                  <div>
                    <span class="meas-label">Rate per sq ft</span>
                    <span class="meas-value">₹{{ getPricePerSqFt(property) }}</span>
                  </div>
                </div>
              </div>
              <div class="plot-features" *ngIf="property.amenities">
                <h4>Plot Features:</h4>
                <div class="features-list">
                  <span class="feature-tag" *ngFor="let feature of (property.amenities || []).slice(0, 4)">
                    <i class="fas fa-check-circle"></i> {{ feature.name }}
                  </span>
                </div>
              </div>
              <div class="plot-price-section">
                <div class="price-display">
                  <span class="price-label">Total Price</span>
                  <span class="price-value">₹{{ formatPrice(property.price) }}</span>
                </div>
                <div class="plot-cta">
                  <button class="btn btn-primary" (click)="viewProperty(property.id)">
                    <i class="fas fa-info-circle"></i> Full Details
                  </button>
                  <button class="btn btn-outline" (click)="contactOwner(property, $event)">
                    <i class="fas fa-phone-alt"></i> Enquire Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Loading -->
        <div *ngIf="loading" class="skeleton-grid">
          <div class="skeleton-card" *ngFor="let i of [1,2,3,4]">
            <div class="skeleton-image" style="height: 200px;"></div>
            <div class="skeleton-title"></div>
            <div class="skeleton-text"></div>
            <div class="skeleton-text" style="width: 70%;"></div>
          </div>
        </div>

        <!-- Empty State -->
        <div *ngIf="!loading && filteredProperties.length === 0" class="empty-state">
          <i class="fas fa-map-marked"></i>
          <h3>No Plots Found</h3>
          <p>Adjust your filters to see more options</p>
          <button class="btn btn-primary" (click)="resetFilters()">Show All Plots</button>
        </div>
      </div>
    </section>

    <!-- Legal Verification Checklist -->
    <section class="legal-guide">
      <div class="container">
        <h2><i class="fas fa-gavel"></i> Land Purchase Legal Checklist</h2>
        <div class="legal-grid">
          <div class="legal-category">
            <h4><i class="fas fa-file-contract"></i> Essential Documents</h4>
            <ul class="checklist">
              <li><i class="fas fa-check-square"></i> Original sale deed</li>
              <li><i class="fas fa-check-square"></i> Encumbrance certificate (30 years)</li>
              <li><i class="fas fa-check-square"></i> Property tax receipts</li>
              <li><i class="fas fa-check-square"></i> Approved layout plan</li>
              <li><i class="fas fa-check-square"></i> Conversion certificate (if agricultural)</li>
              <li><i class="fas fa-check-square"></i> NOC from local authority</li>
            </ul>
          </div>
          <div class="legal-category">
            <h4><i class="fas fa-search"></i> Verification Steps</h4>
            <ul class="checklist">
              <li><i class="fas fa-check-square"></i> Physical survey of plot boundaries</li>
              <li><i class="fas fa-check-square"></i> Revenue records verification</li>
              <li><i class="fas fa-check-square"></i> Check for legal disputes</li>
              <li><i class="fas fa-check-square"></i> Verify RERA approval (if applicable)</li>
              <li><i class="fas fa-check-square"></i> Soil testing for construction</li>
              <li><i class="fas fa-check-square"></i> Access road availability</li>
            </ul>
          </div>
          <div class="legal-category">
            <h4><i class="fas fa-lightbulb"></i> Investment Tips</h4>
            <ul class="checklist">
              <li><i class="fas fa-check-square"></i> Buy in developing areas for better returns</li>
              <li><i class="fas fa-check-square"></i> Check upcoming infrastructure projects</li>
              <li><i class="fas fa-check-square"></i> Verify water & electricity availability</li>
              <li><i class="fas fa-check-square"></i> Consider future development regulations</li>
              <li><i class="fas fa-check-square"></i> Compare prices in surrounding areas</li>
              <li><i class="fas fa-check-square"></i> Think long-term (5-10 years minimum)</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: [`
    /* ========== CONSISTENT NAVBAR (ALL PAGES) ========== */
    .app-navbar {
      background: white;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      position: sticky;
      top: 0;
      z-index: 1000;
      border-bottom: 1px solid #e5e7eb;
    }

    .navbar-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0.75rem 2rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .nav-brand h2 {
      margin: 0;
      font-size: 1.5rem;
      color: #2563eb;
      cursor: pointer;
      transition: color 0.3s;
    }

    .nav-brand h2:hover {
      color: #1e40af;
    }

    .nav-brand i {
      margin-right: 0.5rem;
    }

    .nav-links {
      display: flex;
      list-style: none;
      gap: 2.5rem;
      margin: 0;
      padding: 0;
    }

    .nav-links a {
      text-decoration: none;
      color: #475569;
      font-weight: 600;
      font-size: 0.95rem;
      transition: color 0.3s;
      padding: 0.5rem 0;
      border-bottom: 2px solid transparent;
    }

    .nav-links a:hover {
      color: #2563eb;
    }

    .nav-links a.active {
      color: #2563eb;
      border-bottom-color: #2563eb;
    }

    .btn-admin {
      background: #f1f5f9;
      color: #475569;
      border: none;
      padding: 0.6rem 1.25rem;
      border-radius: 8px;
      font-weight: 600;
      font-size: 0.9rem;
      cursor: pointer;
      transition: all 0.3s;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .btn-admin:hover {
      background: #2563eb;
      color: white;
    }

    @media (max-width: 768px) {
      .nav-links {
        display: none;
      }
    }

    /* ========== PLOT PAGE ANGULAR/GRID BANNER (COMFORTABLE SIZE) ========== */
    .plot-angular-banner {
      position: relative;
      background: linear-gradient(135deg, #92400e 0%, #b45309 30%, #d97706 70%, #f59e0b 100%);
      min-height: 400px;
      padding: 2.5rem 2rem;
      overflow: hidden;
      clip-path: polygon(0 0, 100% 0, 100% 88%, 0 100%);
      max-width: 1400px;
      margin: 0 auto;
    }

    .plot-diagonal-bg {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: repeating-linear-gradient(
        45deg,
        transparent,
        transparent 50px,
        rgba(255,255,255,0.03) 50px,
        rgba(255,255,255,0.03) 100px
      );
    }

    .grid-pattern-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-image: 
        linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px);
      background-size: 80px 80px;
      opacity: 0.3;
    }

    .plot-content-wrapper {
      position: relative;
      z-index: 2;
      max-width: 1200px;
      margin: 0 auto;
      color: white;
    }

    .plot-top-section {
      display: flex;
      justify-content: center;
      align-items: center;
      margin-bottom: 3rem;
    }

    .breadcrumb-plot {
      font-size: 0.95rem;
    }

    .breadcrumb-plot a {
      color: rgba(255,255,255,0.9);
      text-decoration: none;
      font-weight: 500;
      transition: color 0.3s;
    }

    .breadcrumb-plot a:hover {
      color: white;
    }

    .divider-plot {
      margin: 0 1rem;
      opacity: 0.5;
    }

    .active-plot {
      color: #fbbf24;
      font-weight: 700;
    }

    .plot-icon-badge {
      width: 80px;
      height: 80px;
      background: rgba(255,255,255,0.15);
      backdrop-filter: blur(10px);
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2.5rem;
      color: #fbbf24;
      box-shadow: 0 10px 30px rgba(0,0,0,0.3);
      animation: iconSpin 20s linear infinite;
    }

    @keyframes iconSpin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .plot-main-content {
      max-width: 800px;
      margin: 0 auto;
      text-align: center;
    }

    .plot-title-section {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 2rem;
      margin-bottom: 2rem;
      flex-wrap: wrap;
    }

    .plot-mega-title {
      font-size: 3.2rem;
      font-weight: 900;
      line-height: 1;
      color: white;
      margin: 0;
      letter-spacing: -0.02em;
    }

    .land-highlight {
      color: #fbbf24;
      display: block;
      text-shadow: 0 5px 25px rgba(251, 191, 36, 0.5);
    }

    .plot-count-inline {
      display: flex;
      align-items: center;
      gap: 1rem;
      background: rgba(255,255,255,0.15);
      backdrop-filter: blur(10px);
      padding: 1rem 2rem;
      border-radius: 50px;
      border: 2px solid rgba(255,255,255,0.2);
    }

    .count-circle {
      width: 60px;
      height: 60px;
      background: #fbbf24;
      color: #92400e;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.8rem;
      font-weight: 900;
      box-shadow: 0 5px 20px rgba(251, 191, 36, 0.4);
    }

    .count-text {
      font-size: 1.1rem;
      font-weight: 600;
      color: white;
    }

    .plot-tagline {
      font-size: 1.25rem;
      color: rgba(255,255,255,0.95);
      line-height: 1.7;
      margin-bottom: 3rem;
    }

    .investment-features-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1.5rem;
      margin-bottom: 3rem;
    }

    .invest-feature {
      background: rgba(255,255,255,0.1);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255,255,255,0.2);
      border-radius: 15px;
      padding: 1.75rem 1.25rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
      transition: all 0.3s;
    }

    .invest-feature:hover {
      background: rgba(255,255,255,0.2);
      transform: translateY(-8px) rotate(-2deg);
      box-shadow: 0 20px 40px rgba(0,0,0,0.3);
    }

    .invest-feature i {
      font-size: 2.5rem;
      color: #fbbf24;
    }

    .feature-content-plot {
      text-align: center;
    }

    .feature-content-plot strong {
      display: block;
      font-size: 1.05rem;
      font-weight: 700;
      color: white;
      margin-bottom: 0.4rem;
    }

    .feature-content-plot span {
      font-size: 0.9rem;
      color: rgba(255,255,255,0.85);
    }

    .plot-cta-buttons {
      display: flex;
      gap: 1.5rem;
      justify-content: center;
    }

    .btn-plot-primary,
    .btn-plot-secondary {
      padding: 1.5rem 3rem;
      border: none;
      border-radius: 50px;
      font-size: 1.1rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.3s;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .btn-plot-primary {
      background: #fbbf24;
      color: #92400e;
      box-shadow: 0 15px 40px rgba(251, 191, 36, 0.4);
    }

    .btn-plot-primary:hover {
      transform: translateY(-4px) scale(1.02);
      box-shadow: 0 20px 50px rgba(251, 191, 36, 0.5);
      background: #fcd34d;
    }

    .btn-plot-secondary {
      background: transparent;
      color: white;
      border: 3px solid #fbbf24;
    }

    .btn-plot-secondary:hover {
      background: rgba(251, 191, 36, 0.15);
      transform: translateY(-4px);
    }

    .plot-visual-grid {
      position: absolute;
      right: 5%;
      top: 50%;
      transform: translateY(-50%) rotate(15deg);
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      opacity: 0.2;
    }

    .grid-box {
      width: 100px;
      height: 100px;
      background: rgba(255,255,255,0.2);
      border: 3px solid rgba(255,255,255,0.4);
      border-radius: 10px;
      animation: gridPulse 4s infinite ease-in-out;
    }

    .box-1 { animation-delay: 0s; }
    .box-2 { animation-delay: 1s; }
    .box-3 { animation-delay: 2s; }
    .box-4 { animation-delay: 3s; }

    @keyframes gridPulse {
      0%, 100% { transform: scale(1); opacity: 0.2; }
      50% { transform: scale(1.1); opacity: 0.4; }
    }

    /* Responsive */
    @media (max-width: 1024px) {
      .plot-mega-title {
        font-size: 3rem;
      }

      .investment-features-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .plot-visual-grid {
        display: none;
      }
    }

    @media (max-width: 768px) {
      .plot-title-section {
        flex-direction: column;
        gap: 1.5rem;
      }

      .investment-features-grid {
        grid-template-columns: 1fr;
      }

      .plot-cta-buttons {
        flex-direction: column;
      }

      .btn-plot-primary,
      .btn-plot-secondary {
        width: 100%;
      }
    }

    /* OLD Header Styles */
    .plot-header {
      position: relative;
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%);
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
      max-width: 1200px;
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

    .investment-benefits {
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

    /* Investment Calculator */
    .investment-section {
      padding: 4rem 0;
      background: #fffbeb;
    }

    .calculator-card {
      background: white;
      border-radius: 20px;
      padding: 3rem;
      box-shadow: 0 10px 40px rgba(245, 158, 11, 0.15);
    }

    .calculator-card h2 {
      color: #1e293b;
      font-size: 2rem;
      margin-bottom: 0.5rem;
      text-align: center;
    }

    .calculator-card > p {
      color: #64748b;
      text-align: center;
      margin-bottom: 2.5rem;
    }

    .calculator-grid {
      display: grid;
      grid-template-columns: 1.2fr 1fr;
      gap: 3rem;
    }

    .input-row {
      display: grid;
      grid-template-columns: 1fr;
      gap: 1.5rem;
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

    .input-group input,
    .input-group select {
      padding: 0.875rem;
      border: 2px solid #e2e8f0;
      border-radius: 10px;
      font-size: 1rem;
      transition: all 0.3s ease;
    }

    .input-group input:focus,
    .input-group select:focus {
      outline: none;
      border-color: #f59e0b;
      box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
    }

    .calc-result {
      background: linear-gradient(135deg, #f59e0b, #d97706);
      padding: 2rem;
      border-radius: 16px;
      color: white;
    }

    .result-card {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .result-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 0;
      border-bottom: 1px solid rgba(255,255,255,0.2);
    }

    .result-item.highlight {
      background: rgba(255,255,255,0.1);
      padding: 1rem;
      border-radius: 8px;
      border-bottom: none;
      margin: 0.5rem 0;
    }

    .result-item.success {
      background: rgba(251, 191, 36, 0.2);
      padding: 1rem;
      border-radius: 8px;
      border-bottom: none;
    }

    .result-label {
      font-size: 0.9rem;
      opacity: 0.9;
    }

    .result-value {
      font-weight: 800;
      font-size: 1.3rem;
    }

    .result-item.highlight .result-value,
    .result-item.success .result-value {
      font-size: 1.6rem;
      color: #fbbf24;
    }

    /* Area Converter */
    .converter-section {
      padding: 3rem 0;
      background: white;
    }

    .converter-card {
      background: #f8fafc;
      border-radius: 16px;
      padding: 2rem;
      border: 2px solid #e2e8f0;
    }

    .converter-card h3 {
      color: #1e293b;
      font-size: 1.5rem;
      margin-bottom: 1.5rem;
      text-align: center;
    }

    .converter-grid {
      display: grid;
      grid-template-columns: 1.2fr repeat(3, 1fr);
      gap: 1.5rem;
      align-items: center;
    }

    .result-box {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
      text-align: center;
    }

    .conversion-result {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .conv-label {
      font-size: 0.85rem;
      color: #64748b;
      font-weight: 600;
    }

    .conv-value {
      font-size: 1.5rem;
      font-weight: 800;
      color: #f59e0b;
    }

    /* Search Section */
    .search-section {
      padding: 3rem 0;
      background: #f8fafc;
    }

    .search-card {
      background: white;
      border-radius: 16px;
      padding: 2rem;
      box-shadow: 0 4px 15px rgba(0,0,0,0.06);
    }

    .search-card h3 {
      color: #1e293b;
      font-size: 1.5rem;
      margin-bottom: 2rem;
    }

    .search-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
    }

    .search-group label {
      display: block;
      font-weight: 600;
      color: #475569;
      margin-bottom: 0.5rem;
    }

    .input-with-icon {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.875rem 1rem;
      border: 2px solid #e2e8f0;
      border-radius: 10px;
      transition: all 0.3s ease;
    }

    .input-with-icon:focus-within {
      border-color: #f59e0b;
      box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1);
    }

    .input-with-icon i {
      color: #f59e0b;
    }

    .input-with-icon input,
    .input-with-icon select {
      border: none;
      outline: none;
      flex: 1;
      font-size: 1rem;
    }

    .plot-type-selector {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.5rem;
    }

    .type-btn {
      padding: 0.875rem;
      border: 2px solid #e2e8f0;
      background: white;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      font-weight: 600;
      color: #64748b;
      font-size: 0.85rem;
    }

    .type-btn:hover {
      border-color: #f59e0b;
      color: #f59e0b;
    }

    .type-btn.active {
      background: #f59e0b;
      border-color: #f59e0b;
      color: white;
    }

    .type-btn i {
      font-size: 1.5rem;
    }

    /* Construction Estimator */
    .construction-estimator {
      padding: 4rem 0;
      background: white;
    }

    .estimator-card {
      background: linear-gradient(135deg, #fffbeb, #fef3c7);
      border-radius: 20px;
      padding: 3rem;
    }

    .estimator-card h2 {
      color: #1e293b;
      font-size: 2rem;
      margin-bottom: 0.5rem;
      text-align: center;
    }

    .estimator-card > p {
      color: #64748b;
      text-align: center;
      margin-bottom: 2.5rem;
    }

    .estimator-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
    }

    .estimator-result {
      background: white;
      padding: 2rem;
      border-radius: 16px;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    }

    .cost-breakdown {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .cost-item {
      display: flex;
      justify-content: space-between;
      padding: 0.75rem 0;
      border-bottom: 1px solid #f1f5f9;
      color: #475569;
    }

    .cost-item.total {
      border: none;
      padding-top: 1rem;
      margin-top: 0.5rem;
      border-top: 2px solid #f59e0b;
      font-weight: 800;
      font-size: 1.2rem;
      color: #1e293b;
    }

    .cost-item span:last-child {
      font-weight: 700;
      color: #f59e0b;
    }

    /* Plots Listing */
    .plots-listing {
      padding: 3rem 0;
      background: #f8fafc;
    }

    .listing-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      flex-wrap: wrap;
      gap: 1rem;
    }

    .listing-header h2 {
      color: #1e293b;
      font-size: 2rem;
    }

    .listing-header p {
      color: #64748b;
    }

    .view-controls {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .view-controls label {
      font-weight: 600;
      color: #64748b;
    }

    .view-controls select {
      padding: 0.5rem 1rem;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      cursor: pointer;
    }

    .plots-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
      gap: 2rem;
    }

    .plot-card-large {
      background: white;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 15px rgba(0,0,0,0.08);
      transition: all 0.3s ease;
      border: 2px solid #fef3c7;
    }

    .plot-card-large:hover {
      box-shadow: 0 8px 30px rgba(245, 158, 11, 0.2);
      transform: translateY(-4px);
      border-color: #f59e0b;
    }

    .plot-header {
      position: relative;
    }

    .plot-visual-large {
      height: 200px;
      background: linear-gradient(135deg, #fbbf24, #f59e0b);
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      position: relative;
    }

    .plot-shape {
      text-align: center;
      color: white;
    }

    .dimension {
      font-size: 2.5rem;
      font-weight: 800;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
    }

    .plot-type-badge {
      background: rgba(255,255,255,0.9);
      color: #b45309;
      padding: 0.4rem 1rem;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 600;
      margin-top: 0.5rem;
      display: inline-block;
    }

    .bookmark-btn {
      position: absolute;
      top: 1rem;
      right: 1rem;
      width: 44px;
      height: 44px;
      border-radius: 50%;
      border: none;
      background: rgba(255,255,255,0.9);
      color: #64748b;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.3rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    }

    .bookmark-btn i.saved {
      color: #f59e0b;
    }

    .plot-details {
      padding: 1.5rem;
    }

    .plot-title-section h3 {
      font-size: 1.3rem;
      color: #1e293b;
      margin-bottom: 0.5rem;
      cursor: pointer;
      font-weight: 700;
    }

    .plot-title-section h3:hover {
      color: #f59e0b;
    }

    .plot-location {
      color: #64748b;
      font-size: 0.9rem;
      margin-bottom: 1.25rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .plot-measurements {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .measurement {
      display: flex;
      gap: 1rem;
      padding: 1rem;
      background: #fffbeb;
      border-radius: 10px;
      align-items: flex-start;
    }

    .measurement i {
      font-size: 1.5rem;
      color: #f59e0b;
      margin-top: 0.25rem;
    }

    .measurement div {
      display: flex;
      flex-direction: column;
    }

    .meas-label {
      font-size: 0.8rem;
      color: #64748b;
      font-weight: 600;
    }

    .meas-value {
      font-size: 1.2rem;
      font-weight: 800;
      color: #1e293b;
    }

    .measurement small {
      color: #64748b;
      font-size: 0.75rem;
    }

    .plot-features {
      margin-bottom: 1.5rem;
    }

    .plot-features h4 {
      font-size: 0.9rem;
      color: #475569;
      margin-bottom: 0.75rem;
      font-weight: 600;
    }

    .features-list {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .feature-tag {
      padding: 0.4rem 0.8rem;
      background: #fef3c7;
      color: #92400e;
      border-radius: 6px;
      font-size: 0.8rem;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 0.3rem;
    }

    .feature-tag i {
      color: #f59e0b;
    }

    .plot-price-section {
      padding-top: 1.5rem;
      border-top: 2px solid #fef3c7;
    }

    .price-display {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.25rem;
    }

    .price-label {
      font-size: 0.9rem;
      color: #64748b;
      font-weight: 600;
    }

    .price-value {
      font-size: 1.8rem;
      font-weight: 800;
      color: #f59e0b;
    }

    .plot-cta {
      display: flex;
      gap: 0.75rem;
    }

    .btn {
      flex: 1;
      padding: 0.875rem;
      border-radius: 10px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      font-size: 0.95rem;
    }

    .btn-primary {
      background: #f59e0b;
      color: white;
      border: none;
      box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
    }

    .btn-primary:hover {
      background: #d97706;
      transform: translateY(-2px);
      box-shadow: 0 6px 16px rgba(245, 158, 11, 0.4);
    }

    .btn-outline {
      background: white;
      color: #f59e0b;
      border: 2px solid #f59e0b;
    }

    .btn-outline:hover {
      background: #fffbeb;
    }

    /* Legal Guide */
    .legal-guide {
      padding: 4rem 0;
      background: white;
    }

    .legal-guide h2 {
      text-align: center;
      font-size: 2.5rem;
      color: #1e293b;
      margin-bottom: 3rem;
    }

    .legal-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 2rem;
    }

    .legal-category {
      background: #f8fafc;
      padding: 2rem;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
    }

    .legal-category h4 {
      color: #1e293b;
      font-size: 1.2rem;
      margin-bottom: 1.5rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .legal-category h4 i {
      color: #f59e0b;
    }

    .checklist {
      list-style: none;
      padding: 0;
    }

    .checklist li {
      padding: 0.75rem 0;
      color: #475569;
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      border-bottom: 1px solid #e2e8f0;
      font-size: 0.95rem;
    }

    .checklist li:last-child {
      border-bottom: none;
    }

    .checklist i {
      color: #10b981;
      margin-top: 0.2rem;
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
      grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
      gap: 2rem;
    }

    @media (max-width: 1024px) {
      .calculator-grid, .estimator-grid { grid-template-columns: 1fr; }
      .converter-grid { grid-template-columns: 1fr; }
    }

    @media (max-width: 768px) {
      h1 { font-size: 2.2rem; }
      .investment-benefits { gap: 1.5rem; }
      .search-grid { grid-template-columns: 1fr; }
      .plot-type-selector { grid-template-columns: 1fr; }
      .plots-grid { grid-template-columns: 1fr; }
      .plot-measurements { grid-template-columns: 1fr; }
    }
  `]
})
export class PlotComponent implements OnInit {
  properties: Property[] = [];
  filteredProperties: Property[] = [];
  loading = false;
  searchQuery = '';
  plotType = '';
  areaRange = '';
  sortBy = 'recent';
  totalProperties = 0;

  searchFilters: PropertyFilters = {
    category: 'plot',
    type: 'For Sale'
  };

  // ROI Calculator
  roiCalculator = {
    purchasePrice: 5000000,
    appreciationRate: 15,
    years: 5,
    futureValue: 0,
    returns: 0,
    roiPercent: 0
  };

  // Construction Cost
  constructionCalc = {
    builtupArea: 1500,
    quality: 'standard',
    constructionCost: 0,
    architectCost: 0,
    approvalCost: 0,
    contingency: 0,
    totalCost: 0
  };

  // Area Converter
  areaConverter = {
    sqft: 2000,
    sqm: 0,
    acres: 0,
    cents: 0
  };

  constructor(
    private propertyService: PropertyService,
    private router: Router,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService
  ) {}

  ngOnInit() {
    this.loadProperties();
    this.calculateROI();
    this.calculateConstruction();
    this.convertFromSqft();
  }

  loadProperties() {
    this.loading = true;
    this.propertyService.getProperties(this.searchFilters).subscribe({
      next: (response) => {
        const list = response?.results ?? [];
        this.properties = list.filter((p: Property) => p.category === 'plot');
        this.totalProperties = this.properties.length;
        this.filteredProperties = [...this.properties];
        this.sortProperties();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error:', error);
        this.toastr.error('Failed to load plots');
        this.loading = false;
      }
    });
  }

  setPlotType(type: string) {
    this.plotType = this.plotType === type ? '' : type;
    this.applyFilters();
  }

  applyFilters() {
    let filtered = [...this.properties];

    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(query) ||
        p.location.toLowerCase().includes(query) ||
        p.city.toLowerCase().includes(query)
      );
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
          const priceA = typeof a.price === 'number' ? a.price : this.extractPrice(String(a.price));
          const priceB = typeof b.price === 'number' ? b.price : this.extractPrice(String(b.price));
          return this.sortBy === 'price-low' ? priceA - priceB : priceB - priceA;
        });
        break;
      case 'area-large':
        this.filteredProperties.sort((a, b) => b.carpet_area - a.carpet_area);
        break;
      case 'best-value':
        this.filteredProperties.sort((a, b) => {
          const priceA = typeof a.price === 'number' ? a.price : this.extractPrice(String(a.price));
          const priceB = typeof b.price === 'number' ? b.price : this.extractPrice(String(b.price));
          const valueA = priceA / a.carpet_area;
          const valueB = priceB / b.carpet_area;
          return valueA - valueB;
        });
        break;
    }
  }

  extractPrice(priceStr: string): number {
    const match = priceStr.match(/[\d.]+/);
    if (!match) return 0;
    const num = parseFloat(match[0]);
    if (priceStr.includes('Cr')) return num * 10000000;
    if (priceStr.includes('Lakh')) return num * 100000;
    return num;
  }

  resetFilters() {
    this.searchQuery = '';
    this.plotType = '';
    this.areaRange = '';
    this.applyFilters();
  }

  viewProperty(id: number) {
    this.router.navigate(['/property', id]);
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
      this.toastr.info('Removed from saved plots');
    } else {
      favorites.push(id);
      this.toastr.success('Plot saved!');
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

  getPlotCategory(property: Property): string {
    const amenityNames = property.amenities?.map(a => a.name.toLowerCase()).join(' ') || '';
    if (amenityNames.includes('commercial')) return 'Commercial Plot';
    if (amenityNames.includes('residential')) return 'Residential Plot';
    return 'Plot for Sale';
  }

  getPlotUsage(property: Property): string {
    const amenityNames = property.amenities?.map(a => a.name.toLowerCase()).join(' ') || '';
    if (amenityNames.includes('commercial')) return 'Commercial Use';
    if (amenityNames.includes('residential')) return 'Residential Use';
    return 'Multi-Purpose';
  }

  getPricePerSqFt(property: Property): string {
    const price = typeof property.price === 'number' ? property.price : this.extractPrice(String(property.price));
    if (price > 0 && property.carpet_area > 0) {
      return (price / property.carpet_area).toFixed(0);
    }
    return 'N/A';
  }

  // ROI Calculator
  calculateROI() {
    const P = this.roiCalculator.purchasePrice;
    const r = this.roiCalculator.appreciationRate / 100;
    const t = this.roiCalculator.years;
    
    this.roiCalculator.futureValue = P * Math.pow(1 + r, t);
    this.roiCalculator.returns = this.roiCalculator.futureValue - P;
    this.roiCalculator.roiPercent = (this.roiCalculator.returns / P) * 100;
  }

  // Construction Calculator
  calculateConstruction() {
    const rates: any = {
      basic: 1200,
      standard: 1800,
      premium: 2500,
      luxury: 3500
    };
    
    const rate = rates[this.constructionCalc.quality] || 1800;
    const base = this.constructionCalc.builtupArea * rate;
    
    this.constructionCalc.constructionCost = base;
    this.constructionCalc.architectCost = base * 0.03;
    this.constructionCalc.approvalCost = base * 0.02;
    this.constructionCalc.contingency = base * 0.05;
    this.constructionCalc.totalCost = base + this.constructionCalc.architectCost + 
                                       this.constructionCalc.approvalCost + 
                                       this.constructionCalc.contingency;
  }

  // Area Converter
  convertFromSqft() {
    this.areaConverter.sqm = this.areaConverter.sqft * 0.092903;
    this.areaConverter.acres = this.areaConverter.sqft / 43560;
    this.areaConverter.cents = this.areaConverter.acres * 100;
  }

  // Scroll methods for CTA buttons
  scrollToPlots() {
    const element = document.querySelector('.property-list');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  scrollToROI() {
    const element = document.querySelector('.investment-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

