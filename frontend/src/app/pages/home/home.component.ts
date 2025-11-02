import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { PropertyService } from '../../core/services/property.service';
import { Property } from '../../core/models/property.model';
import { HeaderComponent } from '../../shared/header/header.component';
import { LocationService } from '../../core/services/location.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HeaderComponent],
  template: `
    <!-- Shared Header Component -->
    <app-header></app-header>

    <!-- HERO SECTION -->
    <section class="hero">
      <!-- Animated Real Estate Background -->
      <div class="real-estate-bg">
        <div class="property-icon property-1">
          <i class="fas fa-home"></i>
        </div>
        <div class="property-icon property-2">
          <i class="fas fa-building"></i>
        </div>
        <div class="property-icon property-3">
          <i class="fas fa-home"></i>
        </div>
        <div class="property-icon property-4">
          <i class="fas fa-city"></i>
        </div>
        <div class="property-icon property-5">
          <i class="fas fa-store"></i>
        </div>
        <div class="property-icon property-6">
          <i class="fas fa-warehouse"></i>
        </div>
        
        <div class="connection-line line-1"></div>
        <div class="connection-line line-2"></div>
        <div class="connection-line line-3"></div>
        
        <div class="activity-dot dot-1"></div>
        <div class="activity-dot dot-2"></div>
        <div class="activity-dot dot-3"></div>
        <div class="activity-dot dot-4"></div>
      </div>

      <div class="container">
        <div class="hero-content">
          <!-- Left Content -->
          <div class="hero-left">
            <div class="badge">
              <i class="fas fa-shield-check"></i>
              <span>Trusted by 10,000+ Users</span>
            </div>
            
            <h1>Find Your Perfect Property in {{ selectedCity }}</h1>
            
            <p class="subtitle">
              Search from {{ propertyStats?.total_properties || '15' }}+ verified properties in {{ selectedCity }}. 
              Zero brokerage. Direct from owners.
            </p>

            <!-- Key Features -->
            <div class="features">
              <div class="feature">
                <i class="fas fa-check-circle"></i>
                <span>100% Verified</span>
              </div>
              <div class="feature">
                <i class="fas fa-shield-alt"></i>
                <span>Direct Owners</span>
              </div>
              <div class="feature">
                <i class="fas fa-tag"></i>
                <span>Zero Commission</span>
              </div>
            </div>

            <!-- CTA Buttons -->
            <div class="cta-buttons">
              <button class="btn-primary" (click)="navigateToBuy()">
                <i class="fas fa-home"></i>
                <span>
                  <strong>Buy Property</strong>
                  <small>{{ propertyStats?.for_sale || '10' }} available</small>
                </span>
              </button>
              
              <button class="btn-secondary" routerLink="/rent">
                <i class="fas fa-key"></i>
                <span>
                  <strong>Rent Property</strong>
                  <small>{{ propertyStats?.for_rent || '5' }} available</small>
                </span>
              </button>
            </div>
          </div>

          <!-- Right Content -->
          <div class="hero-right">
            <div class="stats-card">
              <div class="stat">
                <div class="stat-value">{{ propertyStats?.for_sale || '10' }}</div>
                <div class="stat-label">For Sale</div>
              </div>
              <div class="stat">
                <div class="stat-value">{{ propertyStats?.for_rent || '5' }}</div>
                <div class="stat-label">For Rent</div>
              </div>
              <div class="stat">
                <div class="stat-value">50+</div>
                <div class="stat-label">Locations</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- WHY CHOOSE US SECTION -->
    <section class="why-choose-us">
      <div class="container">
        <div class="section-header">
          <h2>Why RealEstateHub?</h2>
          <p>Your trusted partner in finding the perfect property</p>
          </div>
        
        <div class="benefits-grid">
          <div class="benefit-card">
            <div class="benefit-icon">
              <i class="fas fa-shield-check"></i>
          </div>
            <h3>100% Verified</h3>
            <p>All properties are verified by our expert team to ensure authenticity and legal compliance</p>
          </div>

          <div class="benefit-card">
            <div class="benefit-icon">
              <i class="fas fa-handshake"></i>
          </div>
            <h3>Zero Brokerage</h3>
            <p>Direct connection between buyers and sellers. Save thousands on brokerage fees</p>
        </div>

          <div class="benefit-card">
            <div class="benefit-icon">
              <i class="fas fa-headset"></i>
          </div>
            <h3>24/7 Support</h3>
            <p>Round-the-clock customer support to answer all your property-related queries</p>
          </div>
        </div>
      </div>
    </section>

    <!-- FEATURED PROPERTIES -->
    <section class="featured-properties" *ngIf="properties.length > 0">
      <div class="container">
        <div class="section-header">
        <h2>Featured Properties</h2>
          <p>Handpicked properties just for you</p>
        </div>
        
        <div class="properties-grid">
          <div class="property-card" *ngFor="let property of properties" routerLink="/property/{{ property.id }}">
            <div class="property-image">
              <img [src]="property.primary_image || '/assets/placeholder-house.jpg'" [alt]="property.title">
            </div>
            <div class="property-info">
              <h3>{{ property.title }}</h3>
              <p class="location">{{ property.location }}</p>
              <div class="property-details">
                <span><i class="fas fa-bed"></i> {{ property.bedrooms || 'N/A' }}</span>
                <span><i class="fas fa-bath"></i> {{ property.bathrooms || 'N/A' }}</span>
                <span><i class="fas fa-ruler-combined"></i> {{ property.area || 'N/A' }} sq ft</span>
              </div>
              <div class="property-price">
                <span class="price">₹{{ property.price | number }}</span>
                <span class="type">{{ property.type }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- HOW IT WORKS -->
    <section class="how-it-works">
      <div class="container">
        <div class="section-header">
          <h2>How It Works</h2>
          <p>Simple steps to find your perfect property</p>
          </div>
        
        <div class="steps-grid">
          <div class="step-card">
            <div class="step-number">1</div>
            <div class="step-icon">
              <i class="fas fa-search"></i>
          </div>
            <h3>Search Properties</h3>
            <p>Use our advanced filters to find properties that match your exact requirements and budget</p>
          </div>

          <div class="step-card">
            <div class="step-number">2</div>
            <div class="step-icon">
              <i class="fas fa-heart"></i>
          </div>
            <h3>Shortlist Favorites</h3>
            <p>Save properties you like and compare them side by side to make the best choice</p>
        </div>

          <div class="step-card">
            <div class="step-number">3</div>
            <div class="step-icon">
              <i class="fas fa-phone"></i>
              </div>
            <h3>Contact Owner</h3>
            <p>Get direct contact with property owners via call, WhatsApp, or schedule visits</p>
            </div>

          <div class="step-card">
            <div class="step-number">4</div>
            <div class="step-icon">
              <i class="fas fa-key"></i>
              </div>
            <h3>Move In</h3>
            <p>Complete the deal with our legal support and move into your dream property</p>
            </div>
              </div>
            </div>
    </section>

    <!-- CTA SECTION -->
    <section class="cta-section">
      <div class="container">
        <div class="cta-content">
          <h2>Ready to Find Your Dream Property?</h2>
          <p>Join thousands of happy customers who found their perfect home with us</p>
          <div class="cta-buttons">
            <button class="btn-cta-primary" routerLink="/buy">
              <i class="fas fa-home"></i> Start Buying
            </button>
            <button class="btn-cta-secondary" routerLink="/rent">
              <i class="fas fa-key"></i> Find Rentals
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- FOOTER -->
    <footer class="footer">
      <div class="container">
        <div class="footer-grid">
          <!-- About Column -->
          <div class="footer-column">
            <div class="footer-brand">
              <i class="fas fa-home"></i>
              <span>RealEstateHub</span>
            </div>
            <p class="footer-description">
              Your trusted partner in real estate. Find, buy, rent, and invest in properties with confidence and ease.
            </p>
            <div class="social-links">
              <a href="#" aria-label="Facebook"><i class="fab fa-facebook"></i></a>
              <a href="#" aria-label="Twitter"><i class="fab fa-twitter"></i></a>
              <a href="#" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
              <a href="#" aria-label="LinkedIn"><i class="fab fa-linkedin"></i></a>
            </div>
          </div>

          <!-- Quick Links -->
          <div class="footer-column">
            <h4>Quick Links</h4>
            <ul>
              <li><a routerLink="/">Home</a></li>
              <li><a routerLink="/buy">Buy Property</a></li>
              <li><a routerLink="/rent">Rent Property</a></li>
              <li><a routerLink="/contact">Contact Us</a></li>
            </ul>
          </div>

          <!-- Property Types -->
          <div class="footer-column">
            <h4>Property Types</h4>
            <ul>
              <li><a routerLink="/buy" [queryParams]="{category: 'flat'}">Apartments</a></li>
              <li><a routerLink="/buy" [queryParams]="{category: 'house'}">Houses</a></li>
              <li><a routerLink="/buy" [queryParams]="{category: 'villa'}">Villas</a></li>
              <li><a routerLink="/buy" [queryParams]="{category: 'plot'}">Plots</a></li>
            </ul>
          </div>

          <!-- Contact Info -->
          <div class="footer-column">
            <h4>Get In Touch</h4>
            <ul class="contact-info">
              <li>
                <i class="fas fa-phone"></i>
                <span>+91 98765 43210</span>
              </li>
              <li>
                <i class="fas fa-envelope"></i>
                <span>contact&#64;realestatehub.com</span>
              </li>
              <li>
                <i class="fas fa-map-marker-alt"></i>
                <span>Hyderabad, Telangana</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div class="footer-bottom">
          <p>&copy; 2024 RealEstateHub. All rights reserved.</p>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    /* ========== CLEAN HERO SECTION ========== */
    .hero {
      background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
      padding: 3rem 0;
      color: white;
      position: relative;
      overflow: hidden;
    }

    /* Real Estate Background Animation */
    .real-estate-bg {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
      z-index: 0;
    }

    .property-icon {
      position: absolute;
      font-size: 4rem;
      color: rgba(255, 255, 255, 0.15);
      opacity: 1;
      text-shadow: 0 0 20px rgba(255, 255, 255, 0.2);
    }

    .property-1 {
      top: 15%;
      left: 10%;
      animation: floatProperty 8s ease-in-out infinite;
    }

    .property-2 {
      top: 25%;
      right: 15%;
      animation: floatProperty 10s ease-in-out infinite 1s;
    }

    .property-3 {
      bottom: 30%;
      left: 20%;
      animation: floatProperty 12s ease-in-out infinite 2s;
    }

    .property-4 {
      top: 50%;
      right: 25%;
      animation: floatProperty 9s ease-in-out infinite 1.5s;
    }

    .property-5 {
      bottom: 20%;
      right: 10%;
      animation: floatProperty 11s ease-in-out infinite 0.5s;
    }

    .property-6 {
      top: 70%;
      left: 60%;
      animation: floatProperty 13s ease-in-out infinite 2.5s;
    }

    @keyframes floatProperty {
      0%, 100% {
        transform: translate(0, 0) rotate(0deg) scale(1);
        opacity: 1;
      }
      25% {
        transform: translate(30px, -20px) rotate(5deg) scale(1.1);
        opacity: 0.8;
      }
      50% {
        transform: translate(10px, 30px) rotate(-5deg) scale(0.9);
        opacity: 0.6;
      }
      75% {
        transform: translate(-20px, 10px) rotate(3deg) scale(1.05);
        opacity: 0.9;
      }
    }

    /* Connection Lines - Representing Transactions */
    .connection-line {
      position: absolute;
      height: 3px;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
      transform-origin: left center;
      box-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
    }

    .line-1 {
      top: 20%;
      left: 15%;
      width: 200px;
      animation: drawLine 4s ease-in-out infinite;
    }

    .line-2 {
      top: 60%;
      right: 20%;
      width: 250px;
      animation: drawLine 5s ease-in-out infinite 1s;
    }

    .line-3 {
      bottom: 25%;
      left: 25%;
      width: 180px;
      animation: drawLine 6s ease-in-out infinite 2s;
    }

    @keyframes drawLine {
      0% {
        transform: scaleX(0);
        opacity: 0;
      }
      30% {
        transform: scaleX(1);
        opacity: 1;
      }
      70% {
        transform: scaleX(1);
        opacity: 1;
      }
      100% {
        transform: scaleX(0);
        opacity: 0;
      }
    }

    /* Activity Dots - Representing User Activity */
    .activity-dot {
      position: absolute;
      width: 16px;
      height: 16px;
      background: rgba(251, 191, 36, 0.9);
      border-radius: 50%;
      box-shadow: 0 0 30px rgba(251, 191, 36, 0.8), 0 0 60px rgba(251, 191, 36, 0.4);
    }

    .dot-1 {
      top: 30%;
      left: 25%;
      animation: pulse-dot 3s ease-in-out infinite;
    }

    .dot-2 {
      top: 55%;
      right: 30%;
      animation: pulse-dot 3s ease-in-out infinite 0.5s;
    }

    .dot-3 {
      bottom: 35%;
      left: 40%;
      animation: pulse-dot 3s ease-in-out infinite 1s;
    }

    .dot-4 {
      top: 40%;
      right: 15%;
      animation: pulse-dot 3s ease-in-out infinite 1.5s;
    }

    @keyframes pulse-dot {
      0% {
        transform: scale(1);
        opacity: 1;
      }
      50% {
        transform: scale(3);
        opacity: 0.3;
      }
      100% {
        transform: scale(1);
        opacity: 1;
      }
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 2rem;
      position: relative;
      z-index: 1;
    }

    .hero-content {
      display: grid;
      grid-template-columns: 1.5fr 1fr;
      gap: 4rem;
      align-items: center;
      min-height: 400px;
    }

    .hero-left {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      animation: slideInLeft 0.8s ease-out;
    }

    @keyframes slideInLeft {
      from {
        opacity: 0;
        transform: translateX(-30px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    .badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      background: rgba(255, 255, 255, 0.2);
      backdrop-filter: blur(10px);
      padding: 0.5rem 1rem;
      border-radius: 50px;
      width: fit-content;
      font-size: 0.85rem;
      font-weight: 600;
      border: 1px solid rgba(255, 255, 255, 0.3);
      animation: fadeIn 1s ease-out 0.2s both;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .badge i {
      color: #fbbf24;
      animation: pulse 2s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }

    h1 {
      font-size: 3rem;
      font-weight: 900;
      line-height: 1.1;
      margin: 0;
      animation: fadeIn 1s ease-out 0.3s both;
    }

    .subtitle {
      font-size: 1.1rem;
      opacity: 0.95;
      line-height: 1.6;
      margin: 0;
      animation: fadeIn 1s ease-out 0.4s both;
    }

    .features {
      display: flex;
      gap: 2rem;
      flex-wrap: wrap;
      animation: fadeIn 1s ease-out 0.5s both;
    }

    .feature {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 1rem;
      font-weight: 500;
      transition: transform 0.3s ease;
    }

    .feature:hover {
      transform: translateX(5px);
    }

    .feature i {
      color: #10b981;
      font-size: 1.2rem;
      animation: bounce 2s ease-in-out infinite;
    }

    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-3px); }
    }

    .cta-buttons {
      display: flex;
      gap: 1rem;
      margin-top: 1rem;
      animation: fadeIn 1s ease-out 0.6s both;
    }

    .btn-primary,
    .btn-secondary {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.2rem 2rem;
      border-radius: 12px;
      border: none;
      font-size: 1rem;
      cursor: pointer;
      transition: all 0.3s ease;
      font-family: inherit;
    }

    .btn-primary {
      background: white;
      color: #1e40af;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
      flex: 1;
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
    }

    .btn-primary i {
      font-size: 1.5rem;
      color: #3b82f6;
    }

    .btn-secondary {
      background: rgba(255, 255, 255, 0.15);
      color: white;
      border: 2px solid rgba(255, 255, 255, 0.3);
      flex: 1;
    }

    .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.25);
      transform: translateY(-2px);
    }

    .btn-secondary i {
      font-size: 1.5rem;
    }

    .btn-primary span,
    .btn-secondary span {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 0.2rem;
    }

    .btn-primary strong,
    .btn-secondary strong {
      font-size: 1.1rem;
      font-weight: 700;
    }

    .btn-primary small,
    .btn-secondary small {
      font-size: 0.85rem;
      opacity: 0.8;
      font-weight: 500;
    }

    .hero-right {
      display: flex;
      justify-content: center;
      align-items: center;
      animation: slideInRight 0.8s ease-out;
    }

    @keyframes slideInRight {
      from {
        opacity: 0;
        transform: translateX(30px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    .stats-card {
      background: rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(20px);
      padding: 2.5rem 2rem;
      border-radius: 24px;
      border: 2px solid rgba(255, 255, 255, 0.25);
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
      display: flex;
      flex-direction: column;
      gap: 2rem;
      width: 100%;
      transition: transform 0.3s ease;
    }

    .stats-card:hover {
      transform: translateY(-5px);
    }

    .stat {
      text-align: center;
      animation: fadeIn 1s ease-out both;
    }

    .stat:nth-child(1) {
      animation-delay: 0.7s;
    }

    .stat:nth-child(2) {
      animation-delay: 0.8s;
    }

    .stat:nth-child(3) {
      animation-delay: 0.9s;
    }

    .stat-value {
      font-size: 2.5rem;
      font-weight: 900;
      color: #fbbf24;
      margin-bottom: 0.5rem;
      text-shadow: 0 2px 10px rgba(251, 191, 36, 0.3);
      animation: countUp 1s ease-out;
    }

    @keyframes countUp {
      from {
        opacity: 0;
        transform: scale(0.5);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }

    .stat-label {
      font-size: 0.9rem;
      font-weight: 600;
      opacity: 0.9;
      text-transform: uppercase;
      letter-spacing: 1px;
    }


    /* ========== WHY CHOOSE US SECTION ========== */
    .why-choose-us {
      padding: 4rem 0;
      background: #f9fafb;
    }

    .section-header {
      text-align: center;
      margin-bottom: 3rem;
    }

    .section-header h2 {
      font-size: 2.5rem;
      color: #1e293b;
      margin-bottom: 0.5rem;
    }

    .section-header p {
      font-size: 1.1rem;
      color: #64748b;
    }

    .benefits-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
        gap: 2rem;
      }

    .benefit-card {
      background: white;
      padding: 2rem;
      border-radius: 15px;
      text-align: center;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      transition: transform 0.3s ease;
    }

    .benefit-card:hover {
      transform: translateY(-5px);
    }

    .benefit-icon {
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, #3b82f6, #2563eb);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1.5rem;
      font-size: 2rem;
      color: white;
    }

    .benefit-card h3 {
        font-size: 1.5rem;
      color: #1e293b;
      margin-bottom: 1rem;
    }

    .benefit-card p {
      color: #64748b;
      line-height: 1.6;
    }

    /* ========== FEATURED PROPERTIES ========== */
    .featured-properties {
      padding: 4rem 0;
      background: white;
    }

    .properties-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 2rem;
    }

    .property-card {
      background: white;
      border-radius: 15px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
      cursor: pointer;
      transition: all 0.3s ease;
    }

    .property-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
    }

    .property-image {
      width: 100%;
      height: 200px;
      overflow: hidden;
    }

    .property-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.3s ease;
    }

    .property-card:hover .property-image img {
      transform: scale(1.1);
    }

    .property-info {
        padding: 1.5rem;
      }

    .property-info h3 {
      font-size: 1.25rem;
      color: #1e293b;
      margin-bottom: 0.5rem;
    }

    .location {
      color: #64748b;
      font-size: 0.9rem;
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      gap: 0.3rem;
    }

    .property-details {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #e5e7eb;
    }

    .property-details span {
      font-size: 0.85rem;
      color: #64748b;
      display: flex;
      align-items: center;
      gap: 0.3rem;
    }

    .property-price {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .price {
      font-size: 1.5rem;
      font-weight: 700;
      color: #3b82f6;
    }

    .type {
      background: #dbeafe;
      color: #2563eb;
      padding: 0.3rem 0.8rem;
      border-radius: 20px;
        font-size: 0.75rem;
      font-weight: 600;
    }

    /* ========== HOW IT WORKS ========== */
    .how-it-works {
      padding: 4rem 0;
      background: #f9fafb;
    }

    .steps-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 2rem;
    }

    .step-card {
      background: white;
      padding: 2rem;
      border-radius: 15px;
      text-align: center;
      position: relative;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    }

    .step-number {
      position: absolute;
      top: -15px;
      left: 50%;
      transform: translateX(-50%);
      width: 40px;
      height: 40px;
      background: linear-gradient(135deg, #3b82f6, #2563eb);
      color: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 1.2rem;
    }

    .step-icon {
      width: 70px;
      height: 70px;
      background: #dbeafe;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 1.5rem auto 1rem;
      font-size: 1.8rem;
      color: #3b82f6;
    }

    .step-card h3 {
      font-size: 1.25rem;
      color: #1e293b;
      margin-bottom: 0.8rem;
    }

    .step-card p {
      color: #64748b;
      line-height: 1.6;
      font-size: 0.9rem;
    }

    /* ========== CTA SECTION ========== */
    .cta-section {
      padding: 4rem 0;
      background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #3b82f6 100%);
      color: white;
    }

    .cta-content {
      text-align: center;
    }

    .cta-content h2 {
      font-size: 2.5rem;
      margin-bottom: 1rem;
    }

    .cta-content p {
      font-size: 1.2rem;
      margin-bottom: 2rem;
      opacity: 0.9;
    }

    .cta-buttons {
      display: flex;
      gap: 1rem;
      justify-content: center;
    }

    .btn-cta-primary,
    .btn-cta-secondary {
      padding: 1rem 2rem;
      font-size: 1.1rem;
      font-weight: 600;
      border: none;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .btn-cta-primary {
      background: white;
      color: #2563eb;
    }

    .btn-cta-primary:hover {
      transform: translateY(-3px);
      box-shadow: 0 10px 30px rgba(255, 255, 255, 0.3);
    }

    .btn-cta-secondary {
      background: rgba(255, 255, 255, 0.1);
      color: white;
      border: 2px solid white;
    }

    .btn-cta-secondary:hover {
      background: white;
      color: #2563eb;
      transform: translateY(-3px);
    }

    /* ========== FOOTER ========== */
    .footer {
      background: #1e293b;
      color: white;
      padding: 3rem 0 1rem;
    }

    .footer-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 2rem;
      margin-bottom: 2rem;
    }

    .footer-column h4 {
      font-size: 1.2rem;
      margin-bottom: 1rem;
      color: white;
    }

    .footer-brand {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 1.5rem;
      font-weight: 700;
      margin-bottom: 1rem;
    }

    .footer-brand i {
      color: #3b82f6;
    }

    .footer-description {
      color: #94a3b8;
      line-height: 1.6;
      margin-bottom: 1rem;
    }

    .social-links {
      display: flex;
      gap: 1rem;
    }

    .social-links a {
      width: 40px;
      height: 40px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      text-decoration: none;
      transition: all 0.3s ease;
    }

    .social-links a:hover {
      background: #3b82f6;
      transform: translateY(-3px);
    }

    .footer-column ul {
      list-style: none;
      padding: 0;
    }

    .footer-column ul li {
      margin-bottom: 0.8rem;
    }

    .footer-column ul li a {
      color: #94a3b8;
      text-decoration: none;
      transition: color 0.3s ease;
    }

    .footer-column ul li a:hover {
      color: #3b82f6;
    }

    .contact-info li {
      display: flex;
      align-items: center;
      gap: 0.8rem;
      color: #94a3b8;
      margin-bottom: 1rem;
    }

    .contact-info i {
      color: #3b82f6;
      width: 20px;
    }

    .footer-bottom {
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      padding-top: 1.5rem;
      text-align: center;
      color: #94a3b8;
    }

    /* ========== RESPONSIVE DESIGN ========== */
    @media (max-width: 768px) {
      .hero {
        padding: 2rem 0;
      }

      .hero-content {
        grid-template-columns: 1fr;
        gap: 2rem;
        min-height: auto;
      }

      h1 {
        font-size: 2rem;
      }

      .subtitle {
        font-size: 1rem;
      }

      .features {
        gap: 1rem;
      }

      .cta-buttons {
        flex-direction: column;
      }

      .btn-primary,
      .btn-secondary {
        width: 100%;
      }

      .stats-card {
        padding: 2rem 1.5rem;
        gap: 1.5rem;
      }

      .stat-value {
        font-size: 2rem;
      }

      .stat-label {
        font-size: 0.85rem;
      }

      .benefits-grid,
      .properties-grid,
      .steps-grid,
      .footer-grid {
        grid-template-columns: 1fr;
      }

      .section-header h2,
      .cta-content h2 {
        font-size: 2rem;
      }
    }
  `]
})
export class HomeComponent implements OnInit {
  properties: Property[] = [];
  propertyStats: any = null;
  selectedCity: string = 'Hyderabad';

  constructor(
    private propertyService: PropertyService,
    private router: Router,
    private locationService: LocationService
  ) {}

  ngOnInit() {
    // Subscribe to location changes
    this.locationService.selectedCity$.subscribe(city => {
      this.selectedCity = city;
      this.loadStatistics();
      this.loadFeaturedProperties();
    });
  }

  loadStatistics() {
    // Get city-specific statistics
    const filters: any = {};
    if (this.selectedCity && this.selectedCity !== 'All Cities') {
      filters.city = this.selectedCity;
    }

    // Fetch all properties for the city to count them
    this.propertyService.getProperties(filters).subscribe({
      next: (response: any) => {
        const allProperties = response.results || [];
        
        // Calculate city-specific stats
        this.propertyStats = {
          total_properties: allProperties.length,
          for_sale: allProperties.filter((p: any) => p.type === 'For Sale').length,
          for_rent: allProperties.filter((p: any) => p.type === 'For Rent').length,
          plots: allProperties.filter((p: any) => p.category === 'plot').length
        };
      },
      error: (error) => {
        console.error('Error loading statistics:', error);
        // Fallback stats
        this.propertyStats = {
          total_properties: 0,
          for_sale: 0,
          for_rent: 0,
          plots: 0
        };
      }
    });
  }

  loadFeaturedProperties() {
    // Filter properties by selected city
    const filters: any = {};
    if (this.selectedCity && this.selectedCity !== 'All Cities') {
      filters.city = this.selectedCity;
    }
    
    this.propertyService.getProperties(filters).subscribe({
      next: (response: any) => {
        this.properties = response.results ? response.results.slice(0, 6) : [];
      },
      error: (error) => {
        console.error('Error loading properties:', error);
      }
    });
  }

  navigateToBuy() {
    // Store scroll state for buy page - scroll past banner to search section
    localStorage.setItem('buyPageScrollToSearch', 'true');
    this.router.navigate(['/buy']);
  }
}