import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { LocationService } from '../../core/services/location.service';
import { PropertyService } from '../../core/services/property.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <!-- Navigation Header - Consistent Across All Pages -->
    <nav class="app-navbar">
      <div class="navbar-container">
        <!-- Enhanced Location Selector with Search (EXTREME LEFT) -->
        <div class="location-wrapper">
          <div class="location-selector" (click)="toggleLocationDropdown()">
            <div class="location-display">
              <i class="fas fa-map-marker-alt"></i>
              <span class="city-name">{{ selectedCity }}</span>
              <i class="fas fa-chevron-down dropdown-icon" [class.open]="isLocationDropdownOpen"></i>
            </div>
          </div>
          
          <div class="location-dropdown" *ngIf="isLocationDropdownOpen">
            <div class="location-search">
              <i class="fas fa-search"></i>
              <input 
                type="text" 
                [(ngModel)]="citySearch" 
                (input)="filterCities()"
                placeholder="Search city..."
                (click)="$event.stopPropagation()"
              />
            </div>
            <div class="location-detect" (click)="detectLocation()">
              <i class="fas fa-location-crosshairs"></i>
              <span>Detect my location</span>
            </div>
            <div class="cities-list">
              <div 
                class="city-item" 
                *ngFor="let city of filteredCities"
                (click)="selectCity(city.city)"
                [class.selected]="city.city === selectedCity"
              >
                <i class="fas fa-map-marker-alt"></i>
                <span class="city-name">{{ city.city }}</span>
                <span class="property-count">{{ city.count }} properties</span>
              </div>
              <div class="no-results" *ngIf="filteredCities.length === 0">
                <i class="fas fa-search"></i>
                <p>No cities found</p>
              </div>
            </div>
          </div>
        </div>

        <div class="nav-brand">
          <h2 routerLink="/" (click)="scrollToTop()"><i class="fas fa-home"></i> RealEstateHub</h2>
        </div>

        <ul class="nav-links">
          <li><a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" (click)="scrollToTop()">Home</a></li>
          <li><a routerLink="/buy" routerLinkActive="active">Buy</a></li>
          <li><a routerLink="/rent" routerLinkActive="active">Rent</a></li>
          <li><a routerLink="/contact" routerLinkActive="active">Contact</a></li>
        </ul>
        <div class="nav-actions">
          <button class="btn-admin" routerLink="/admin/login">
            <i class="fas fa-user-shield"></i> Admin
          </button>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    /* ========== CONSISTENT HEADER (SINGLE SOURCE OF TRUTH) ========== */
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
      color: #3b82f6;
      cursor: pointer;
    }

    /* Enhanced Location Selector (EXTREME LEFT WITH 80PX MARGIN) */
    .location-wrapper {
      position: relative;
      margin-left: 80px;
      margin-right: 2rem;
    }

    .location-selector {
      background: white;
      border: 2px solid #e5e7eb;
      padding: 0.5rem 1rem;
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.3s ease;
      min-width: 180px;
    }

    .location-selector:hover {
      border-color: #3b82f6;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
    }

    .location-display {
      display: flex;
      align-items: center;
      gap: 0.6rem;
    }

    .location-display > i:first-child {
      color: #3b82f6;
      font-size: 1.1rem;
      flex-shrink: 0;
    }

    .city-name {
      font-size: 0.95rem;
      color: #1e293b;
      font-weight: 600;
    }

    .dropdown-icon {
      font-size: 0.75rem;
      color: #64748b;
      transition: transform 0.3s ease;
      flex-shrink: 0;
    }

    .dropdown-icon.open {
      transform: rotate(180deg);
      color: #3b82f6;
    }

    .location-dropdown {
      position: absolute;
      top: calc(100% + 0.5rem);
      left: 0;
      background: white;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
      min-width: 320px;
      max-height: 400px;
      overflow: hidden;
      z-index: 1001;
      animation: slideDown 0.3s ease-out;
    }

    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-10px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .location-search {
      padding: 1rem;
      border-bottom: 1px solid #e5e7eb;
      display: flex;
      align-items: center;
      gap: 0.8rem;
      background: #f9fafb;
    }

    .location-search i {
      color: #64748b;
      font-size: 1rem;
    }

    .location-search input {
      flex: 1;
      border: none;
      background: transparent;
      outline: none;
      font-size: 0.95rem;
      color: #1e293b;
    }

    .location-search input::placeholder {
      color: #94a3b8;
    }

    .location-detect {
      padding: 0.8rem 1rem;
      border-bottom: 1px solid #e5e7eb;
      display: flex;
      align-items: center;
      gap: 0.8rem;
      cursor: pointer;
      transition: all 0.2s ease;
      background: white;
    }

    .location-detect:hover {
      background: #eff6ff;
    }

    .location-detect i {
      color: #3b82f6;
      font-size: 1rem;
      animation: ping 2s ease-in-out infinite;
    }

    @keyframes ping {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }

    .location-detect span {
      color: #3b82f6;
      font-weight: 600;
      font-size: 0.9rem;
    }

    .cities-list {
      max-height: 250px;
      overflow-y: auto;
    }

    .city-item {
      padding: 0.9rem 1rem;
      display: flex;
      align-items: center;
      gap: 0.8rem;
      cursor: pointer;
      transition: all 0.2s ease;
      border-bottom: 1px solid #f1f5f9;
    }

    .city-item:hover {
      background: #f9fafb;
    }

    .city-item.selected {
      background: #eff6ff;
      border-left: 3px solid #3b82f6;
    }

    .city-item i {
      color: #3b82f6;
      font-size: 0.9rem;
    }

    .city-item .city-name {
      flex: 1;
      color: #1e293b;
      font-weight: 500;
      font-size: 0.9rem;
    }

    .property-count {
      color: #64748b;
      font-size: 0.8rem;
      background: #f1f5f9;
      padding: 0.2rem 0.6rem;
      border-radius: 12px;
    }

    .no-results {
      padding: 2rem;
      text-align: center;
      color: #94a3b8;
    }

    .no-results i {
      font-size: 2rem;
      margin-bottom: 0.5rem;
      opacity: 0.5;
    }

    .no-results p {
      margin: 0;
      font-size: 0.9rem;
    }

    /* Scrollbar for cities list */
    .cities-list::-webkit-scrollbar {
      width: 6px;
    }

    .cities-list::-webkit-scrollbar-track {
      background: #f1f5f9;
    }

    .cities-list::-webkit-scrollbar-thumb {
      background: #cbd5e1;
      border-radius: 10px;
    }

    .cities-list::-webkit-scrollbar-thumb:hover {
      background: #94a3b8;
    }

    .nav-links {
      display: flex;
      gap: 2rem;
      list-style: none;
      margin: 0;
      padding: 0;
      margin-left: auto;
      margin-right: 2rem;
    }

    .nav-actions {
      flex-shrink: 0;
    }

    .nav-links a {
      text-decoration: none;
      color: #1e293b;
      font-weight: 500;
      transition: color 0.3s;
    }

    .nav-links a:hover,
    .nav-links a.active {
      color: #3b82f6;
    }

    .btn-admin {
      padding: 0.5rem 1.5rem;
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 500;
      transition: background 0.3s;
    }

    .btn-admin:hover {
      background: #2563eb;
    }

    /* Responsive */
    @media (max-width: 1024px) {
      .nav-links {
        gap: 1.5rem;
      }
    }

    @media (max-width: 768px) {
      .navbar-container {
        padding: 0.75rem 1rem;
        flex-wrap: wrap;
      }

      .location-wrapper {
        margin-right: 1rem;
        flex-shrink: 0;
      }

      .location-selector {
        padding: 0.4rem 0.8rem;
        min-width: 140px;
      }

      .location-display > i:first-child {
        font-size: 1.1rem;
      }

      .location-label {
        font-size: 0.65rem;
      }

      .city-name {
        font-size: 0.85rem;
      }

      .location-dropdown {
        min-width: 280px;
      }

      .nav-brand h2 {
        font-size: 1.2rem;
      }

      .nav-links {
        order: 3;
        width: 100%;
        justify-content: space-around;
        margin-top: 0.5rem;
        padding-top: 0.5rem;
        border-top: 1px solid #f1f5f9;
        gap: 1rem;
        font-size: 0.85rem;
      }

      .btn-admin {
        padding: 0.4rem 1rem;
        font-size: 0.85rem;
      }
    }
  `]
})
export class HeaderComponent implements OnInit {
  cities: { city: string; count: number }[] = [];
  filteredCities: { city: string; count: number }[] = [];
  selectedCity: string = 'Hyderabad';
  citySearch: string = '';
  isLocationDropdownOpen: boolean = false;

  constructor(
    private router: Router,
    private locationService: LocationService,
    private propertyService: PropertyService
  ) {
    // Close dropdown when clicking outside
    if (typeof document !== 'undefined') {
      document.addEventListener('click', (event) => {
        const target = event.target as HTMLElement;
        if (!target.closest('.location-wrapper')) {
          this.isLocationDropdownOpen = false;
        }
      });
    }
  }

  ngOnInit() {
    // Try to detect user's location on init
    this.detectUserLocation();
    
    // Load cities from backend
    this.propertyService.getCities().subscribe({
      next: (cities) => {
        this.cities = cities;
        this.filteredCities = cities;
      },
      error: (error) => {
        console.error('Error loading cities:', error);
        // Fallback to default city
        this.cities = [{ city: 'Hyderabad', count: 0 }];
        this.filteredCities = this.cities;
      }
    });

    // Subscribe to location changes
    this.locationService.selectedCity$.subscribe(city => {
      this.selectedCity = city;
    });
  }

  toggleLocationDropdown() {
    this.isLocationDropdownOpen = !this.isLocationDropdownOpen;
    if (this.isLocationDropdownOpen) {
      this.citySearch = '';
      this.filteredCities = this.cities;
    }
  }

  filterCities() {
    if (!this.citySearch.trim()) {
      this.filteredCities = this.cities;
      return;
    }
    
    const search = this.citySearch.toLowerCase();
    this.filteredCities = this.cities.filter(city => 
      city.city.toLowerCase().includes(search)
    );
  }

  selectCity(city: string) {
    this.selectedCity = city;
    this.locationService.setCity(city);
    this.isLocationDropdownOpen = false;
    this.citySearch = '';
  }

  detectLocation() {
    // Try to detect user's location using browser geolocation API
    this.detectUserLocation();
  }

  detectUserLocation() {
    // Try IP-based geolocation first (more reliable)
    fetch('https://ipapi.co/json/')
      .then(response => response.json())
      .then(data => {
        const detectedCity = data.city || 'Hyderabad';
        console.log('Detected city from IP:', detectedCity);
        
        // Check if detected city is in our list
        const cityExists = this.cities.find(c => 
          c.city.toLowerCase() === detectedCity.toLowerCase()
        );
        
        if (cityExists) {
          this.selectCity(cityExists.city);
        } else {
          // If detected city not in list, check for major nearby cities
          const indianCities = ['Hyderabad', 'Bangalore', 'Mumbai', 'Delhi', 'Chennai', 'Pune'];
          const nearbyCity = this.cities.find(c => 
            indianCities.includes(c.city)
          );
          if (nearbyCity) {
            this.selectCity(nearbyCity.city);
          }
        }
      })
      .catch(error => {
        console.log('IP location failed, trying browser geolocation');
        // Fallback to browser geolocation
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              console.log('Browser location:', position.coords);
              // Keep default city if geocoding not implemented
            },
            (error) => {
              console.log('All location detection failed, using default');
            }
          );
        }
      });
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

