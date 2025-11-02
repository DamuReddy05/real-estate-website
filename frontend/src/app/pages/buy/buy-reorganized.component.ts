import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { PropertyService } from '../../core/services/property.service';
import { Property, PropertyFilters } from '../../core/models/property.model';

@Component({
  selector: 'app-buy',
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

    <!-- BUY PAGE - UNIQUE SPLIT SCREEN BANNER -->
    <header class="buy-split-banner">
      <!-- LEFT SIDE: Blue with Animated House Illustration -->
      <div class="buy-left-visual">
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
    <section class="search-section" id="searchSection">
      <div class="container">
        <div class="search-card">
          <h3><i class="fas fa-search"></i> Find Your Perfect Home</h3>
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
              <div class="bedroom-selector">
                <button 
                  class="bhk-btn"
                  [class.active]="selectedBedrooms === '1'"
                  (click)="selectBedrooms('1')"
                >1 BHK</button>
                <button 
                  class="bhk-btn"
                  [class.active]="selectedBedrooms === '2'"
                  (click)="selectBedrooms('2')"
                >2 BHK</button>
                <button 
                  class="bhk-btn"
                  [class.active]="selectedBedrooms === '3'"
                  (click)="selectBedrooms('3')"
                >3 BHK</button>
                <button 
                  class="bhk-btn"
                  [class.active]="selectedBedrooms === '4'"
                  (click)="selectBedrooms('4')"
                >4+ BHK</button>
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
      </div>
    </section>

    <!-- SECTION 2: Properties Grid -->
    <section class="properties-section" id="propertiesSection">
      <div class="container">
        <div class="section-header">
          <div>
            <h2>Properties for Sale in Hyderabad</h2>
            <p class="subtitle">{{ filteredProperties.length }} properties available</p>
          </div>
          <div class="sort-options">
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
          <div class="property-card" *ngFor="let property of filteredProperties">
            <div class="card-image" (click)="viewProperty(property.id)">
              <div class="image-placeholder">{{ getPropertyIcon(property.category) }}</div>
              <button class="favorite-btn" (click)="toggleFavorite(property.id, $event)">
                <i class="fas fa-heart" [class.active]="isFavorite(property.id)"></i>
              </button>
            </div>
            <div class="card-content">
              <div class="property-category">{{ getCategoryName(property.category) }}</div>
              <h3 (click)="viewProperty(property.id)">{{ property.title }}</h3>
              <p class="location">
                <i class="fas fa-map-marker-alt"></i>
                {{ property.location }}, {{ property.city }}
              </p>
              <div class="specs" *ngIf="property.bedrooms">
                <span class="spec"><i class="fas fa-bed"></i> {{ property.bedrooms }} BHK</span>
                <span class="spec"><i class="fas fa-bath"></i> {{ property.bathrooms }}</span>
                <span class="spec"><i class="fas fa-vector-square"></i> {{ property.area }} sq ft</span>
              </div>
              <div class="specs" *ngIf="!property.bedrooms">
                <span class="spec"><i class="fas fa-vector-square"></i> {{ property.area }} sq ft</span>
              </div>
              <div class="price-row">
                <div class="price">{{ property.price }}</div>
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

    /* ========== NAVBAR ========== */
    .app-navbar {
      background: white;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      position: sticky;
      top: 0;
      z-index: 1000;
      border-bottom: 1px solid var(--border-gray);
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
      color: var(--primary-blue);
      cursor: pointer;
    }

    .nav-links {
      display: flex;
      gap: 2rem;
      list-style: none;
    }

    .nav-links a {
      text-decoration: none;
      color: var(--text-dark);
      font-weight: 500;
      transition: color 0.3s;
    }

    .nav-links a:hover,
    .nav-links a.active {
      color: var(--primary-blue);
    }

    .btn-admin {
      padding: 0.5rem 1.5rem;
      background: var(--primary-blue);
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 500;
      transition: background 0.3s;
    }

    .btn-admin:hover {
      background: var(--dark-blue);
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
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
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
      font-size: 2.5rem;
      color: var(--text-dark);
      margin-bottom: 0.5rem;
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .subtitle {
      color: var(--text-gray);
      font-size: 1.1rem;
      margin-bottom: 2rem;
    }

    /* ========== SEARCH SECTION ========== */
    .search-card {
      background: white;
      padding: 2.5rem;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
    }

    .search-card h3 {
      font-size: 1.8rem;
      color: var(--text-dark);
      margin-bottom: 2rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .search-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 1.5rem;
    }

    .search-group label {
      display: block;
      font-weight: 600;
      color: var(--text-dark);
      margin-bottom: 0.5rem;
    }

    .input-with-icon {
      position: relative;
    }

    .input-with-icon i {
      position: absolute;
      left: 1rem;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-gray);
    }

    .input-with-icon input,
    .input-with-icon select {
      width: 100%;
      padding: 0.75rem 1rem 0.75rem 2.5rem;
      border: 2px solid var(--border-gray);
      border-radius: 8px;
      font-size: 1rem;
      transition: border-color 0.3s;
    }

    .input-with-icon input:focus,
    .input-with-icon select:focus {
      outline: none;
      border-color: var(--primary-blue);
    }

    .bedroom-selector {
      display: flex;
      gap: 0.5rem;
    }

    .bhk-btn {
      flex: 1;
      padding: 0.75rem;
      border: 2px solid var(--border-gray);
      background: white;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
    }

    .bhk-btn.active,
    .bhk-btn:hover {
      background: var(--primary-blue);
      color: white;
      border-color: var(--primary-blue);
    }

    .search-actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
    }

    .btn {
      padding: 0.75rem 2rem;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.3s;
    }

    .btn-primary {
      background: var(--primary-blue);
      color: white;
    }

    .btn-primary:hover {
      background: var(--dark-blue);
      transform: translateY(-2px);
    }

    .btn-outline {
      background: white;
      color: var(--primary-blue);
      border: 2px solid var(--primary-blue);
    }

    .btn-outline:hover {
      background: var(--light-blue);
    }

    /* ========== PROPERTIES SECTION ========== */
    .properties-section {
      background: #f8fafc;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .sort-options {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .sort-options label {
      font-weight: 600;
      color: var(--text-dark);
    }

    .sort-options select {
      padding: 0.5rem 1rem;
      border: 2px solid var(--border-gray);
      border-radius: 8px;
      font-size: 1rem;
      cursor: pointer;
    }

    .property-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
      gap: 2rem;
    }

    .property-card {
      background: white;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
      transition: all 0.3s;
      border: 1px solid var(--border-gray);
      display: flex;
      flex-direction: column;
      cursor: pointer;
    }

    .property-card:hover {
      box-shadow: 0 12px 35px rgba(59, 130, 246, 0.15);
      transform: translateY(-6px);
      border-color: var(--primary-blue);
    }

    .card-image {
      position: relative;
      height: 220px;
      background: linear-gradient(135deg, #3b82f6, #1e40af);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .image-placeholder {
      font-size: 4rem;
    }

    .favorite-btn {
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
      transition: all 0.3s;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    }

    .favorite-btn:hover {
      transform: scale(1.1);
    }

    .favorite-btn i.active {
      color: #ef4444;
    }

    .card-content {
      padding: 1.5rem;
      flex: 1;
      display: flex;
      flex-direction: column;
    }

    .property-category {
      display: inline-block;
      padding: 0.3rem 0.8rem;
      background: var(--light-blue);
      color: var(--primary-blue);
      border-radius: 6px;
      font-size: 0.8rem;
      font-weight: 600;
      text-transform: uppercase;
      margin-bottom: 0.75rem;
      width: fit-content;
    }

    .card-content h3 {
      font-size: 1.25rem;
      color: var(--text-dark);
      margin-bottom: 0.5rem;
    }

    .location {
      color: var(--text-gray);
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .specs {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid var(--border-gray);
    }

    .spec {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--text-gray);
      font-size: 0.9rem;
    }

    .price-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: auto;
    }

    .price {
      font-size: 1.5rem;
      font-weight: 700;
      color: var(--primary-blue);
    }

    .btn-view {
      padding: 0.5rem 1.5rem;
      background: var(--primary-blue);
      color: white;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .btn-view:hover {
      background: var(--dark-blue);
      transform: translateX(4px);
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

    /* ========== EMI CALCULATOR ========== */
    .calculator-card {
      background: white;
      padding: 3rem;
      border-radius: 16px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
    }

    .calculator-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 3rem;
      margin-top: 2rem;
    }

    .input-group {
      margin-bottom: 1.5rem;
    }

    .input-group label {
      display: block;
      font-weight: 600;
      color: var(--text-dark);
      margin-bottom: 0.5rem;
    }

    .input-group input {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 2px solid var(--border-gray);
      border-radius: 8px;
      font-size: 1rem;
      transition: border-color 0.3s;
    }

    .input-group input:focus {
      outline: none;
      border-color: var(--primary-blue);
    }

    .calculator-result {
      background: var(--light-blue);
      padding: 2rem;
      border-radius: 12px;
      border: 2px solid var(--primary-blue);
    }

    .emi-display {
      text-align: center;
      margin-bottom: 2rem;
      padding-bottom: 2rem;
      border-bottom: 2px solid var(--primary-blue);
    }

    .emi-label {
      display: block;
      font-size: 1rem;
      color: var(--text-gray);
      margin-bottom: 0.5rem;
    }

    .emi-amount {
      display: block;
      font-size: 2.5rem;
      font-weight: 700;
      color: var(--primary-blue);
    }

    .loan-breakdown {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .breakdown-item {
      display: flex;
      justify-content: space-between;
      padding: 0.75rem;
      background: white;
      border-radius: 8px;
    }

    .breakdown-label {
      color: var(--text-gray);
      font-weight: 500;
    }

    .breakdown-value {
      color: var(--text-dark);
      font-weight: 700;
    }

    /* ========== BUYING TIPS (2x2 Grid) ========== */
    .buying-tips {
      background: #f8fafc;
    }

    .tips-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 2rem;
    }

    .tip-card {
      background: white;
      padding: 2rem;
      border-radius: 16px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.08);
      transition: all 0.3s;
    }

    .tip-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0,0,0,0.12);
    }

    .tip-card i {
      font-size: 2.5rem;
      color: var(--primary-blue);
      margin-bottom: 1rem;
    }

    .tip-card h4 {
      font-size: 1.25rem;
      color: var(--text-dark);
      margin-bottom: 0.75rem;
    }

    .tip-card p {
      color: var(--text-gray);
      line-height: 1.6;
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
        grid-template-columns: 1fr;
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
export class BuyComponent implements OnInit {
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

  // Search & Filters
  searchQuery = '';
  searchFilters: PropertyFilters = {
    listing_type: 'sale'
  };
  selectedBedrooms = '';
  budgetRange = '';
  sortBy = 'recent';

  // Favorites
  favorites: number[] = [];

  // Loan Calculator
  loanCalculator = {
    amount: 5000000,
    rate: 8.5,
    years: 20,
    emi: 0,
    totalInterest: 0,
    totalAmount: 0
  };

  constructor(
    private propertyService: PropertyService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadProperties();
    this.loadFavorites();
    this.calculateLoan();
  }

  loadProperties() {
    this.loading = true;
    this.propertyService.getProperties({ listing_type: 'sale' }).subscribe({
      next: (properties) => {
        this.properties = properties;
        this.filteredProperties = properties;
        this.totalProperties = properties.length;
        this.loading = false;
      },
      error: (error) => {
        console.error('Failed to load properties:', error);
        this.loading = false;
      }
    });
  }

  loadFavorites() {
    const saved = localStorage.getItem('favorites');
    if (saved) {
      this.favorites = JSON.parse(saved);
    }
  }

  onSearchChange() {
    this.applyFilters();
  }

  selectBedrooms(bedrooms: string) {
    this.selectedBedrooms = this.selectedBedrooms === bedrooms ? '' : bedrooms;
    this.applyFilters();
  }

  applyFilters() {
    let filtered = [...this.properties];

    // Search query
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(query) ||
        p.location.toLowerCase().includes(query) ||
        p.city.toLowerCase().includes(query)
      );
    }

    // Category
    if (this.searchFilters.category) {
      filtered = filtered.filter(p => p.category === this.searchFilters.category);
    }

    // Bedrooms
    if (this.selectedBedrooms) {
      filtered = filtered.filter(p => p.bedrooms === parseInt(this.selectedBedrooms));
    }

    // Budget range
    if (this.budgetRange) {
      filtered = filtered.filter(p => {
        const price = this.extractNumericPrice(p.price);
        if (this.budgetRange === '0-25') return price < 2500000;
        if (this.budgetRange === '25-50') return price >= 2500000 && price < 5000000;
        if (this.budgetRange === '50-75') return price >= 5000000 && price < 7500000;
        if (this.budgetRange === '75-100') return price >= 7500000 && price < 10000000;
        if (this.budgetRange === '100+') return price >= 10000000;
        return true;
      });
    }

    this.filteredProperties = filtered;
    this.sortProperties();
  }

  resetFilters() {
    this.searchQuery = '';
    this.searchFilters = { listing_type: 'sale' };
    this.selectedBedrooms = '';
    this.budgetRange = '';
    this.sortBy = 'recent';
    this.filteredProperties = [...this.properties];
  }

  sortProperties() {
    if (this.sortBy === 'recent') {
      this.filteredProperties.sort((a, b) => b.id - a.id);
    } else if (this.sortBy === 'price-low') {
      this.filteredProperties.sort((a, b) =>
        this.extractNumericPrice(a.price) - this.extractNumericPrice(b.price)
      );
    } else if (this.sortBy === 'price-high') {
      this.filteredProperties.sort((a, b) =>
        this.extractNumericPrice(b.price) - this.extractNumericPrice(a.price)
      );
    } else if (this.sortBy === 'area-large') {
      this.filteredProperties.sort((a, b) => (b.area || 0) - (a.area || 0));
    }
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
    this.router.navigate(['/property', propertyId]);
  }

  getPropertyIcon(category: string): string {
    const icons: any = {
      flat: '🏢',
      house: '🏠',
      villa: '🏡',
      plot: '📐',
      commercial: '🏬',
      penthouse: '🌆'
    };
    return icons[category] || '🏠';
  }

  getCategoryName(category: string): string {
    const names: any = {
      flat: 'Apartment',
      house: 'Independent House',
      villa: 'Villa',
      plot: 'Plot',
      commercial: 'Commercial',
      penthouse: 'Penthouse'
    };
    return names[category] || category;
  }

  scrollToProperties() {
    document.getElementById('propertiesSection')?.scrollIntoView({ behavior: 'smooth' });
  }

  scrollToCalculator() {
    document.getElementById('calculatorSection')?.scrollIntoView({ behavior: 'smooth' });
  }
}


