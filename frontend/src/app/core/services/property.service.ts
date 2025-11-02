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
  PropertyImageUploadResponse
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

  // Get all active properties (public)
  getProperties(filters?: PropertyFilters): Observable<Property[]> {
    return this.apiService.get<PaginatedResponse<Property>>('/properties/', filters)
      .pipe(map(response => response.results || []));
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

  getPublicPropertyStats(): Observable<PropertyStats> {
    return this.apiService.get<PropertyStats>('/properties/stats/');
  }

  // Get tab-specific statistics
  getTabSpecificStats(tabType: string): Observable<any> {
    return this.apiService.get<any>(`/properties/stats/${tabType}/`);
  }

  // Get all available cities
  getCities(): Observable<{ city: string; count: number }[]> {
    return this.apiService.get<{ city: string; count: number }[]>('/properties/cities/');
  }

  // Lookup pincode to get city and state
  lookupPincode(pincode: string): Observable<{ pincode: string; city: string; state: string; area: string; found: boolean; message?: string }> {
    return this.apiService.get<{ pincode: string; city: string; state: string; area: string; found: boolean; message?: string }>(`/properties/pincode/${pincode}/`);
  }

  // Track property view
  trackPropertyView(id: number): Observable<{ view_count: number }> {
    return this.apiService.post<{ view_count: number }>(`/properties/${id}/track-view/`, {});
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
  getCategoryDisplayName(category: string): string {
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
}
