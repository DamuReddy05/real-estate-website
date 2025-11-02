export interface Property {
  id: number;
  title: string;
  category: 'flat' | 'house' | 'plot' | 'commercial';
  type: 'For Sale' | 'For Rent';
  price: string;
  location: string;
  area: number;
  bedrooms: string;
  bathrooms: string;
  city: string;
  state: string;
  pincode?: string;
  description?: string;
  amenities?: string;
  amenities_list?: string[];
  owner_name?: string;
  owner_phone?: string;
  owner_email?: string;
  status: 'active' | 'inactive' | 'sold' | 'rented';
  created_by: number;
  created_by_name: string;
  created_at: string;
  updated_at: string;
  images: PropertyImage[];
  primary_image?: string;
  view_count?: number;
}

export interface PropertyImage {
  id: number;
  image: string;
  image_url?: string;
  caption?: string;
  is_primary: boolean;
  created_at: string;
}

export interface PropertyImageUploadResponse {
  id: number;
  image: string;
  image_url: string;
  caption: string;
  is_primary: boolean;
  message: string;
}

export interface PropertyStats {
  total_properties: number;
  for_sale: number;
  for_rent: number;
  plots: number;
  active_properties: number;
  inactive_properties: number;
}

export interface PropertyFilters {
  search?: string;
  category?: string;
  type?: string;
  status?: string;
  city?: string;
  state?: string;
  min_area?: number;
  max_area?: number;
  bedrooms?: string;
  bathrooms?: string;
  amenities?: string;
}

export interface CreatePropertyRequest {
  title: string;
  category: string;
  type: string;
  price: string;
  location: string;
  area: number;
  bedrooms: string;
  bathrooms: string;
  city: string;
  state: string;
  pincode?: string;
  description?: string;
  amenities?: string;
  owner_name?: string;
  owner_phone?: string;
  owner_email?: string;
  status?: string;
}
