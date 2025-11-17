import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { PropertyService } from '../../core/services/property.service';
import { Property, CategoryOption, SubCategoryOption, Tag } from '../../core/models/property.model';
import { HeaderComponent } from '../../shared/header/header.component';
import { LocationService } from '../../core/services/location.service';
import { AuthService } from '../../core/services/auth.service';
import { ContactService } from '../../core/services/contact.service';
import { SiteSettings } from '../../core/models/contact.model';

interface CarouselSection {
  key: string;
  title: string;
  subtitle: string;
  filters?: Record<string, any>;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HeaderComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy {
  properties: Property[] = [];
  selectedCity = 'Hyderabad';
  stats = {
    properties: '10,000+',
    customers: '5,000+',
    cities: '50+'
  };

  searchQuery = '';
  selectedBudget = '';
  
  // Multiselect filters
  availableCategories: CategoryOption[] = [];
  availableTags: Tag[] = [];
  selectedCategoryIds: number[] = [];
  selectedSubcategoryIds: number[] = [];
  selectedTagIds: number[] = [];
  
  // Budget options with "more" option
  budgetOptions = [
    { value: '', label: 'Any Budget' },
    { value: '0-25', label: 'Under ₹25 Lakh' },
    { value: '25-50', label: '₹25-50 Lakh' },
    { value: '50-75', label: '₹50-75 Lakh' },
    { value: '75-100', label: '₹75 Lakh - 1 Cr' },
    { value: '100-200', label: '₹1-2 Cr' },
    { value: '200+', label: 'Above ₹2 Cr' },
    { value: 'more', label: 'More Options...' }
  ];
  
  showAdvancedBudget = false;
  customMinBudget = '';
  customMaxBudget = '';
  showPropertyTypeDropdown = false;

  heroCategories = ['Luxury Homes', 'Affordable Housing', 'Plots', 'Commercial', 'Ready to Move', 'Under Construction'];
  serviceCards = [
    { icon: 'fa-building', title: 'Buy Flats', description: 'Find your perfect apartment with verified listings', route: '/buy', params: { category: 'flat' } },
    { icon: 'fa-home', title: 'Rent Flats', description: 'Browse verified rental properties', route: '/rent' },
    { icon: 'fa-map', title: 'Buy Plots', description: 'Invest in residential and commercial plots', route: '/buy', params: { category: 'plot' } },
    { icon: 'fa-chart-line', title: 'Sell Property', description: 'List your property and reach genuine buyers', route: '/customer/properties' }
  ];

  carouselSections: CarouselSection[] = [
    { key: 'featured', title: 'Featured', subtitle: 'Top picks recommended for you' },
    { key: 'underConstruction', title: 'Under Construction', subtitle: 'Projects nearing completion', filters: { status: 'inactive' } },
    { key: 'ready', title: 'Ready to Move', subtitle: 'Move-in ready properties', filters: { status: 'active' } },
    { key: 'resale', title: 'Resale', subtitle: 'Owner resale deals', filters: { status: 'sold' } },
    { key: 'prelaunch', title: 'Pre Launch', subtitle: 'Invest early in hot projects', filters: { status: 'inactive', type: 'For Sale' } },
    { key: 'commercial', title: 'Commercial', subtitle: 'Offices & retail spaces', filters: { category: 'commercial' } }
  ];

  carouselData: Record<string, Property[]> = {};
  carouselState: Record<string, { page: number; pageSize: number }> = {};
  siteSettings: SiteSettings = {};

  constructor(
    private propertyService: PropertyService,
    private router: Router,
    private locationService: LocationService,
    private authService: AuthService,
    private contactService: ContactService
  ) {}

  private clickOutsideHandler = (event: Event): void => {
    const target = event.target as HTMLElement;
    if (!target.closest('.multiselect-wrapper')) {
      this.showPropertyTypeDropdown = false;
    }
  };

  ngOnInit(): void {
    this.locationService.selectedCity$.subscribe(city => {
      this.selectedCity = city;
      this.loadProperties();
    });
    this.carousalDefaults();
    this.loadSiteSettings();
    this.loadFilterOptions();
    
    // Close dropdown when clicking outside
    setTimeout(() => {
      document.addEventListener('click', this.clickOutsideHandler);
    }, 0);
  }

  ngOnDestroy(): void {
    document.removeEventListener('click', this.clickOutsideHandler);
  }

  loadFilterOptions(): void {
    // Load categories
    this.propertyService.getCategories().subscribe({
      next: (categories) => {
        this.availableCategories = categories;
      },
      error: () => {
        this.availableCategories = [];
      }
    });

    // Load tags
    this.propertyService.getTags().subscribe({
      next: (tags) => {
        this.availableTags = tags.filter(tag => tag.is_active);
      },
      error: () => {
        this.availableTags = [];
      }
    });
  }

  getSelectedSubcategories(): SubCategoryOption[] {
    const subcategories: SubCategoryOption[] = [];
    this.selectedCategoryIds.forEach(catId => {
      const category = this.availableCategories.find(c => c.id === catId);
      if (category?.subcategories) {
        subcategories.push(...category.subcategories.filter(sub => sub.is_active));
      }
    });
    return subcategories;
  }

  toggleCategory(categoryId: number): void {
    const index = this.selectedCategoryIds.indexOf(categoryId);
    if (index > -1) {
      this.selectedCategoryIds.splice(index, 1);
      // Remove subcategories of this category
      const category = this.availableCategories.find(c => c.id === categoryId);
      if (category?.subcategories) {
        category.subcategories.forEach(sub => {
          const subIndex = this.selectedSubcategoryIds.indexOf(sub.id);
          if (subIndex > -1) {
            this.selectedSubcategoryIds.splice(subIndex, 1);
          }
        });
      }
    } else {
      this.selectedCategoryIds.push(categoryId);
    }
  }

  toggleSubcategory(subcategoryId: number): void {
    const index = this.selectedSubcategoryIds.indexOf(subcategoryId);
    if (index > -1) {
      this.selectedSubcategoryIds.splice(index, 1);
    } else {
      this.selectedSubcategoryIds.push(subcategoryId);
    }
  }

  toggleTag(tagId: number): void {
    const index = this.selectedTagIds.indexOf(tagId);
    if (index > -1) {
      this.selectedTagIds.splice(index, 1);
    } else {
      this.selectedTagIds.push(tagId);
    }
  }

  isCategorySelected(categoryId: number): boolean {
    return this.selectedCategoryIds.includes(categoryId);
  }

  isSubcategorySelected(subcategoryId: number): boolean {
    return this.selectedSubcategoryIds.includes(subcategoryId);
  }

  isTagSelected(tagId: number): boolean {
    return this.selectedTagIds.includes(tagId);
  }

  getCategoryName(categoryId: number): string {
    const category = this.availableCategories.find(c => c.id === categoryId);
    return category?.name || '';
  }

  getSubcategoryName(subcategoryId: number): string {
    for (const category of this.availableCategories) {
      const subcategory = category.subcategories?.find(s => s.id === subcategoryId);
      if (subcategory) return subcategory.name;
    }
    return '';
  }

  getTagName(tagId: number): string {
    const tag = this.availableTags.find(t => t.id === tagId);
    return tag?.name || '';
  }

  onBudgetChange(): void {
    if (this.selectedBudget === 'more') {
      this.showAdvancedBudget = true;
      this.selectedBudget = '';
    } else {
      this.showAdvancedBudget = false;
      this.customMinBudget = '';
      this.customMaxBudget = '';
    }
  }

  loadSiteSettings(): void {
    this.contactService.getSiteSettings().subscribe({
      next: (settings) => {
        this.siteSettings = settings;
      },
      error: () => {
        // Use defaults if API fails
        this.siteSettings = {
          contact_phone: '+91 98765 43210',
          contact_email: 'contact@realestatehub.com',
          contact_address: 'Hyderabad, Telangana'
        };
      }
    });
  }

  private carousalDefaults(): void {
    this.carouselSections.forEach(section => {
      this.carouselState[section.key] = { page: 0, pageSize: 4 };
      this.carouselData[section.key] = [];
    });
  }

  loadProperties(): void {
    const filters: any = {};
    if (this.selectedCity && this.selectedCity !== 'All Cities') {
      filters.city = this.selectedCity;
    }

    this.propertyService.getProperties(filters).subscribe({
      next: (response) => {
        const list = (response && response.results) ? response.results : [];
        this.properties = list;
        this.updateStats(list);
        this.prepareCarouselData(list);
      },
      error: () => {
        this.properties = [];
      }
    });
  }

  private updateStats(list: Property[]): void {
    this.stats = {
      properties: `${Math.max(list.length, 100)}+`,
      customers: '5,000+',
      cities: '50+'
    };
  }

  private prepareCarouselData(list: Property[]): void {
    if (!list.length) {
      this.carouselSections.forEach(section => (this.carouselData[section.key] = []));
      return;
    }

    const groups: Record<string, Property[]> = {
      featured: [...list],
      underConstruction: list.filter((_, idx) => idx % 2 === 0),
      ready: list.filter((_, idx) => idx % 2 === 1),
      resale: list.filter(p => p.status === 'inactive' || p.status === 'sold'),
      prelaunch: list.slice().reverse(),
      commercial: list.filter(p => p.category === 'commercial')
    };

    this.carouselSections.forEach(section => {
      const data = groups[section.key] && groups[section.key].length ? groups[section.key] : list;
      this.carouselData[section.key] = data.slice(0, 20);
      this.carouselState[section.key].page = 0;
    });
  }

  getCarouselItems(key: string): Property[] {
    const state = this.carouselState[key];
    const data = this.carouselData[key] || [];
    if (!state) {
      return data.slice(0, 4);
    }
    const start = state.page * state.pageSize;
    return data.slice(start, start + state.pageSize);
  }

  changeCarouselPage(key: string, direction: number): void {
    const state = this.carouselState[key];
    const data = this.carouselData[key] || [];
    if (!state || !data.length) {
      return;
    }
    const totalPages = Math.ceil(data.length / state.pageSize);
    state.page = Math.min(Math.max(state.page + direction, 0), totalPages - 1);
  }

  shouldShowViewAll(key: string): boolean {
    return (this.carouselData[key]?.length || 0) > 4;
  }

  viewAll(section: CarouselSection): void {
    const filters = section.filters ? { ...section.filters } : {};
    this.router.navigate(['/buy'], { queryParams: filters });
  }

  onSearch(): void {
    const queryParams: any = {};
    
    if (this.searchQuery) {
      queryParams.q = this.searchQuery;
    }

    // Add category filters
    if (this.selectedCategoryIds.length > 0) {
      const categorySlugs = this.selectedCategoryIds
        .map(id => this.availableCategories.find(c => c.id === id)?.slug)
        .filter(slug => slug) as string[];
      if (categorySlugs.length > 0) {
        queryParams.category = categorySlugs.join(',');
      }
    }

    // Add subcategory filters
    if (this.selectedSubcategoryIds.length > 0) {
      const subcategorySlugs: string[] = [];
      this.selectedSubcategoryIds.forEach(subId => {
        for (const category of this.availableCategories) {
          const subcategory = category.subcategories?.find(s => s.id === subId);
          if (subcategory?.slug) {
            subcategorySlugs.push(subcategory.slug);
            break;
          }
        }
      });
      if (subcategorySlugs.length > 0) {
        queryParams.subcategory = subcategorySlugs.join(',');
      }
    }

    // Add tag filters
    if (this.selectedTagIds.length > 0) {
      queryParams.tags = this.selectedTagIds.join(',');
    }

    // Handle budget
    if (this.showAdvancedBudget && this.customMinBudget && this.customMaxBudget) {
      const minVal = this.parseBudgetValue(this.customMinBudget);
      const maxVal = this.parseBudgetValue(this.customMaxBudget);
      if (minVal) queryParams.min_price = minVal;
      if (maxVal) queryParams.max_price = maxVal;
    } else if (this.selectedBudget && this.selectedBudget !== 'more') {
      const [min, max] = this.selectedBudget.split('-');
      if (min && parseInt(min) > 0) {
        queryParams.min_price = parseInt(min) * 100000; // Lakh to rupees
      }
      if (min === '200') {
        queryParams.min_price = 20000000; // 2 Cr+
      }
      if (max && max !== '+') {
        queryParams.max_price = parseInt(max) * 100000;
      }
      if (max === '+') {
        // Above 2 Cr - no max limit
        queryParams.min_price = 20000000;
      }
    }

    this.router.navigate(['/buy'], { queryParams });
  }

  private parseBudgetValue(value: string): number | null {
    if (!value) return null;
    const cleaned = value.replace(/₹|\s|,/g, '').toLowerCase();
    if (cleaned.endsWith('l') || cleaned.endsWith('lakh')) {
      const num = parseFloat(cleaned.replace(/[^0-9.]/g, ''));
      return Number.isFinite(num) ? num * 100000 : null;
    }
    if (cleaned.endsWith('cr') || cleaned.endsWith('crore')) {
      const num = parseFloat(cleaned.replace(/[^0-9.]/g, ''));
      return Number.isFinite(num) ? num * 10000000 : null;
    }
    const num = parseFloat(cleaned);
    return Number.isFinite(num) ? num : null;
  }

  handlePostProperty(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return;
    }
    this.router.navigate(['/customer/properties']);
  }

  handleFreePost(): void {
    this.handlePostProperty();
  }

  navigateTo(route: string, params?: any): void {
    if (params) {
      this.router.navigate([route], { queryParams: params });
    } else {
      this.router.navigate([route]);
    }
  }

  navigateToBuy(): void {
    this.router.navigate(['/buy']);
  }

  trackByProperty(_index: number, property: Property): number {
    return property.id;
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
