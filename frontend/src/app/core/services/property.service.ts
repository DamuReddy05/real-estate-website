import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import {
  Property,
  PropertyStats,
  PropertyFilters,
  CreatePropertyRequest,
  PropertyImage,
  PropertyImageUploadResponse,
  PropertyEnquiry,
  CreatePropertyEnquiryRequest,
  CustomerPropertyStats,
  Tag,
  CategoryOption,
  SubCategoryOption,
  CityOption,
  PincodeRecord,
  Amenity,
  Banner
} from '../models/property.model';

// Response interface for paginated API
interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

@Injectable({
  providedIn: 'root'
})
export class PropertyService {

  constructor(private apiService: ApiService) {}

  // Get all active properties (public, paginated response)
  getProperties(filters?: PropertyFilters): Observable<PaginatedResponse<Property>> {
    return this.apiService.get<PaginatedResponse<Property>>('/properties/', filters);
  }

  // Get property by ID (public)
  getProperty(id: number): Observable<Property> {
    return this.apiService.get<Property>(`/properties/${id}/`);
  }

  // Search properties (public)
  searchProperties(query: string, filters?: PropertyFilters): Observable<Property[]> {
    const params = { q: query, ...filters };
    return this.apiService.get<PaginatedResponse<Property>>('/properties/search/', params)
      .pipe(map(response => response.results || []));
  }

  // Admin: Get all properties (including inactive)
  getAdminProperties(filters?: PropertyFilters): Observable<Property[]> {
    return this.apiService.get<PaginatedResponse<Property>>('/properties/admin/', filters)
      .pipe(map(response => response.results || []));
  }

  // Admin: Get single property by ID
  getAdminProperty(id: number): Observable<Property> {
    return this.apiService.get<Property>(`/properties/admin/${id}/`);
  }

  // Admin: Create property
  createProperty(property: CreatePropertyRequest): Observable<Property> {
    return this.apiService.post<Property>('/properties/admin/create/', property);
  }

  // Admin: Update property
  updateProperty(id: number, property: Partial<CreatePropertyRequest>): Observable<Property> {
    return this.apiService.put<Property>(`/properties/admin/${id}/`, property);
  }

  // Admin: Delete property
  deleteProperty(id: number): Observable<any> {
    return this.apiService.delete(`/properties/admin/${id}/`);
  }

  // Admin: Toggle property status
  togglePropertyStatus(id: number): Observable<Property> {
    return this.apiService.post<Property>(`/properties/admin/${id}/toggle-status/`, {});
  }

  // Admin: Get property statistics
  getPropertyStats(): Observable<PropertyStats> {
    return this.apiService.get<PropertyStats>('/properties/admin/stats/');
  }

  getCustomerPropertyStats(): Observable<CustomerPropertyStats> {
    return this.apiService.get<CustomerPropertyStats>('/properties/customer/my-properties/stats/');
  }

  // Admin: Get all property enquiries
  getAdminPropertyEnquiries(): Observable<PropertyEnquiry[]> {
    return this.apiService.get<PropertyEnquiry[]>('/properties/admin/enquiries/');
  }

  // Admin: Update property enquiry (using PATCH for partial updates)
  updatePropertyEnquiry(id: number, payload: Partial<PropertyEnquiry>): Observable<PropertyEnquiry> {
    return this.apiService.patch<PropertyEnquiry>(`/properties/admin/enquiries/${id}/`, payload);
  }

  getPublicPropertyStats(): Observable<PropertyStats> {
    return this.apiService.get<PropertyStats>('/properties/stats/');
  }

  // Get tab-specific statistics
  getTabSpecificStats(tabType: string): Observable<any> {
    return this.apiService.get<any>(`/properties/stats/${tabType}/`);
  }

  // Get all available cities
  getCities(): Observable<CityOption[]> {
    return this.apiService.get<CityOption[] | { results: CityOption[] }>('/properties/cities/')
      .pipe(map(response => this.normalizeList(response)));
  }

  // Lookup pincode to get city and state
  lookupPincode(pincode: string): Observable<{ pincode: string; city: string; state: string; area: string; found: boolean; message?: string }> {
    return this.apiService.get<{ pincode: string; city: string; state: string; area: string; found: boolean; message?: string }>(`/properties/pincode/${pincode}/`);
  }

  // Track property view
  trackPropertyView(id: number): Observable<{ view_count: number }> {
    return this.apiService.post<{ view_count: number }>(`/properties/${id}/track-view/`, {});
  }

  getMyProperties(): Observable<Property[]> {
    return this.apiService.get<PaginatedResponse<Property>>('/properties/customer/my-properties/')
      .pipe(map(response => response.results || []));
  }

  // Customer: Create property
  createCustomerProperty(property: CreatePropertyRequest): Observable<Property> {
    return this.apiService.post<Property>('/properties/customer/my-properties/create/', property);
  }

  // Customer: Get property by ID
  getCustomerProperty(id: number): Observable<Property> {
    return this.apiService.get<Property>(`/properties/customer/my-properties/${id}/`);
  }

  // Customer: Update property
  updateCustomerProperty(id: number, property: Partial<CreatePropertyRequest>): Observable<Property> {
    return this.apiService.put<Property>(`/properties/customer/my-properties/${id}/`, property);
  }

  // Customer: Delete property
  deleteCustomerProperty(id: number): Observable<any> {
    return this.apiService.delete(`/properties/customer/my-properties/${id}/`);
  }

  // Customer: Upload property image
  uploadCustomerPropertyImage(propertyId: number, file: File, caption?: string, isPrimary?: boolean): Observable<PropertyImageUploadResponse> {
    const additionalData: any = {};
    if (caption) additionalData.caption = caption;
    if (isPrimary !== undefined) additionalData.is_primary = isPrimary;
    
    return this.apiService.uploadFile<PropertyImageUploadResponse>(`/properties/customer/${propertyId}/images/`, file, additionalData);
  }

  getMyEnquiries(): Observable<PropertyEnquiry[]> {
    return this.apiService.get<PaginatedResponse<PropertyEnquiry>>('/properties/customer/my-enquiries/')
      .pipe(map(response => response.results || []));
  }

  getTags(): Observable<Tag[]> {
    return this.apiService.get<Tag[] | { results: Tag[] }>('/properties/tags/')
      .pipe(map(response => this.normalizeList(response)));
  }

  // Get all amenities (public)
  getAmenities(): Observable<Amenity[]> {
    return this.apiService.get<Amenity[] | { results: Amenity[] }>('/properties/amenities/')
      .pipe(map(response => this.normalizeList(response)));
  }

  getAdminTags(): Observable<Tag[]> {
    return this.apiService.get<Tag[] | { results: Tag[] }>('/properties/admin/tags/')
      .pipe(map(response => this.normalizeList(response)));
  }

  createTag(payload: Partial<Tag>): Observable<Tag> {
    return this.apiService.post<Tag>('/properties/admin/tags/', payload);
  }

  updateTag(id: number, payload: Partial<Tag>): Observable<Tag> {
    return this.apiService.put<Tag>(`/properties/admin/tags/${id}/`, payload);
  }

  deleteTag(id: number): Observable<void> {
    return this.apiService.delete<void>(`/properties/admin/tags/${id}/`);
  }

  getCategories(): Observable<CategoryOption[]> {
    return this.apiService.get<CategoryOption[] | { results: CategoryOption[] }>('/properties/categories/')
      .pipe(map(response => this.normalizeList(response)));
  }

  getAdminCategories(): Observable<CategoryOption[]> {
    return this.apiService.get<CategoryOption[] | { results: CategoryOption[] }>('/properties/admin/categories/')
      .pipe(map(response => this.normalizeList(response)));
  }

  createCategory(payload: Partial<CategoryOption>): Observable<CategoryOption> {
    return this.apiService.post<CategoryOption>('/properties/admin/categories/', payload);
  }

  updateCategory(id: number, payload: Partial<CategoryOption>): Observable<CategoryOption> {
    return this.apiService.put<CategoryOption>(`/properties/admin/categories/${id}/`, payload);
  }

  deleteCategory(id: number): Observable<void> {
    return this.apiService.delete<void>(`/properties/admin/categories/${id}/`);
  }

  getAdminSubcategories(categoryId?: number): Observable<SubCategoryOption[]> {
    const params = categoryId ? { category: categoryId } : undefined;
    return this.apiService.get<SubCategoryOption[] | { results: SubCategoryOption[] }>('/properties/admin/subcategories/', params)
      .pipe(map(response => this.normalizeList(response)));
  }

  createSubcategory(payload: Partial<SubCategoryOption>): Observable<SubCategoryOption> {
    return this.apiService.post<SubCategoryOption>('/properties/admin/subcategories/', payload);
  }

  updateSubcategory(id: number, payload: Partial<SubCategoryOption>): Observable<SubCategoryOption> {
    return this.apiService.put<SubCategoryOption>(`/properties/admin/subcategories/${id}/`, payload);
  }

  deleteSubcategory(id: number): Observable<void> {
    return this.apiService.delete<void>(`/properties/admin/subcategories/${id}/`);
  }

  createPropertyEnquiry(propertyId: number, payload: CreatePropertyEnquiryRequest): Observable<PropertyEnquiry> {
    return this.apiService.post<PropertyEnquiry>(`/properties/${propertyId}/enquiries/`, payload);
  }

  // Admin Cities / Pincodes
  getAdminCities(): Observable<CityOption[]> {
    return this.apiService.get<CityOption[] | { results: CityOption[] }>('/properties/admin/cities/')
      .pipe(map(response => this.normalizeList(response)));
  }

  createCity(payload: Partial<CityOption>): Observable<CityOption> {
    return this.apiService.post<CityOption>('/properties/admin/cities/', payload);
  }

  updateCity(id: number, payload: Partial<CityOption>): Observable<CityOption> {
    return this.apiService.put<CityOption>(`/properties/admin/cities/${id}/`, payload);
  }

  deleteCity(id: number): Observable<void> {
    return this.apiService.delete<void>(`/properties/admin/cities/${id}/`);
  }

  getAdminPincodes(cityId?: number): Observable<PincodeRecord[]> {
    const params = cityId ? { city: cityId } : undefined;
    return this.apiService.get<PincodeRecord[] | { results: PincodeRecord[] }>('/properties/admin/pincodes/', params)
      .pipe(map(response => this.normalizeList(response)));
  }

  createPincode(payload: { city_ref: number; pincode: string; area?: string; state?: string; is_active?: boolean }): Observable<PincodeRecord> {
    return this.apiService.post<PincodeRecord>('/properties/admin/pincodes/', payload);
  }

  updatePincode(id: number, payload: { city_ref?: number; pincode?: string; area?: string; state?: string; is_active?: boolean }): Observable<PincodeRecord> {
    return this.apiService.put<PincodeRecord>(`/properties/admin/pincodes/${id}/`, payload);
  }

  deletePincode(id: number): Observable<void> {
    return this.apiService.delete<void>(`/properties/admin/pincodes/${id}/`);
  }

  // Admin: Upload property image
  uploadPropertyImage(propertyId: number, file: File, caption?: string, isPrimary?: boolean): Observable<PropertyImageUploadResponse> {
    const additionalData: any = {};
    if (caption) additionalData.caption = caption;
    if (isPrimary !== undefined) additionalData.is_primary = isPrimary;
    
    return this.apiService.uploadFile<PropertyImageUploadResponse>(`/properties/admin/${propertyId}/images/`, file, additionalData);
  }

  // Admin: Delete property image
  deletePropertyImage(imageId: number): Observable<any> {
    return this.apiService.delete(`/properties/admin/images/${imageId}/`);
  }

  // Helper methods
  getCategoryDisplayName(category?: string): string {
    if (!category) {
      return 'General';
    }
    const categoryMap: { [key: string]: string } = {
      'flat': 'Flat/Apartment',
      'house': 'House/Villa',
      'plot': 'Plot',
      'commercial': 'Commercial'
    };
    return categoryMap[category] || category;
  }

  getTypeDisplayName(type: string): string {
    return type === 'For Sale' ? 'For Sale' : 'For Rent';
  }

  getStatusDisplayName(status: string): string {
    const statusMap: { [key: string]: string } = {
      'active': 'Active',
      'inactive': 'Inactive',
      'sold': 'Sold',
      'rented': 'Rented'
    };
    return statusMap[status] || status;
  }

  getStatusColor(status: string): string {
    const colorMap: { [key: string]: string } = {
      'active': 'success',
      'inactive': 'warning',
      'sold': 'info',
      'rented': 'primary'
    };
    return colorMap[status] || 'secondary';
  }

  // Admin: Amenities management
  getAdminAmenities(): Observable<Amenity[]> {
    return this.apiService.get<Amenity[] | { results: Amenity[] }>('/properties/admin/amenities/')
      .pipe(map(response => this.normalizeList(response)));
  }

  createAmenity(payload: Partial<Amenity>): Observable<Amenity> {
    return this.apiService.post<Amenity>('/properties/admin/amenities/', payload);
  }

  updateAmenity(id: number, payload: Partial<Amenity>): Observable<Amenity> {
    return this.apiService.put<Amenity>(`/properties/admin/amenities/${id}/`, payload);
  }

  deleteAmenity(id: number): Observable<void> {
    return this.apiService.delete<void>(`/properties/admin/amenities/${id}/`);
  }

  // Banner management
  getBanners(type?: string): Observable<Banner[]> {
    const params = type ? { type } : undefined;
    return this.apiService.get<Banner[] | { results: Banner[] }>('/properties/banners/', params)
      .pipe(map(response => this.normalizeList(response)));
  }

  getAdminBanners(): Observable<Banner[]> {
    return this.apiService.get<Banner[] | { results: Banner[] }>('/properties/admin/banners/')
      .pipe(map(response => this.normalizeList(response)));
  }

  createBanner(payload: Partial<Banner>): Observable<Banner> {
    return this.apiService.post<Banner>('/properties/admin/banners/', payload);
  }

  createBannerWithFormData(formData: FormData): Observable<Banner> {
    return this.apiService.post<Banner>('/properties/admin/banners/', formData);
  }

  updateBanner(id: number, payload: Partial<Banner>): Observable<Banner> {
    return this.apiService.put<Banner>(`/properties/admin/banners/${id}/`, payload);
  }

  updateBannerWithFormData(id: number, formData: FormData): Observable<Banner> {
    return this.apiService.patch<Banner>(`/properties/admin/banners/${id}/`, formData);
  }

  deleteBanner(id: number): Observable<void> {
    return this.apiService.delete<void>(`/properties/admin/banners/${id}/`);
  }

  private normalizeList<T>(response: T[] | { results: T[] } | null | undefined): T[] {
    if (Array.isArray(response)) {
      return response;
    }
    if (response && Array.isArray((response as any).results)) {
      return (response as any).results;
    }
    return [];
  }
}
