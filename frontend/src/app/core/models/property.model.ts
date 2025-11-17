export interface Tag {
  id: number;
  name: string;
  slug: string;
  description?: string;
  is_active?: boolean;
}

export interface Property {
  id: number;
  title: string;
  category?: string;
  subcategory?: string;
  type: 'For Sale' | 'For Rent';
  price: number; // Changed to number
  location: string;
  carpet_area: number; // Changed from area
  buildup_area?: number; // New field
  length?: number; // New field
  width?: number; // New field
  height?: number; // New field
  bedrooms: string;
  bathrooms: string;
  city: string;
  state: string;
  pincode?: string;
  description?: string;
  amenities?: Amenity[]; // Changed from string to Amenity array
  amenities_list?: string[];
  owner_name?: string;
  owner_phone?: string;
  owner_phone_full?: string | null;
  owner_phone_masked?: string | null;
  owner_email?: string;
  status: 'active' | 'inactive' | 'sold' | 'rented';
  created_by: number;
  created_by_name: string;
  created_at: string;
  updated_at: string;
  images: PropertyImage[];
  primary_image?: string;
  view_count?: number;
  tags?: Tag[];
  is_phone_approved?: boolean;
  enquiries_count?: number;
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

export interface Amenity {
  id: number;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  is_active?: boolean;
}

export interface CreatePropertyRequest {
  title: string;
  category: string;
  subcategory?: string;
  type: string;
  price: number; // Changed to number
  location: string;
  carpet_area: number; // Changed from area
  buildup_area?: number; // New field
  length?: number; // New field
  width?: number; // New field
  height?: number; // New field
  bedrooms: string;
  bathrooms: string;
  city: string;
  state: string;
  pincode?: string;
  description?: string;
  amenity_ids?: number[]; // Changed from amenities string
  owner_name?: string;
  owner_phone?: string;
  owner_email?: string;
  status?: string;
  tag_ids?: number[];
}

export interface PropertyEnquiry {
  id: number;
  property: number;
  property_title: string;
  property_location: string;
  property_primary_image?: string | null;
  status: 'new' | 'contacted' | 'scheduled' | 'closed';
  message: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePropertyEnquiryRequest {
  name?: string;
  email?: string;
  phone?: string;
  message: string;
}

export interface CustomerPropertyStats {
  total_properties: number;
  active_properties: number;
  inactive_properties: number;
  pending_phone_approval: number;
  enquiries_received: number;
  enquiries_sent: number;
}

export interface SubCategoryOption {
  id: number;
  name: string;
  slug: string;
  description?: string;
  priority: number;
  is_active: boolean;
  category?: number;
}

export interface CityOption {
  id: number;
  name: string;
  state: string;
  is_active: boolean;
  property_count?: number;
  total_pincodes?: number;
  pincodes?: string[];
}

export interface PincodeRecord {
  id: number;
  pincode: string;
  city: string;
  city_id?: number;
  state: string;
  area?: string;
  is_active: boolean;
}

export interface CategoryOption {
  id: number;
  name: string;
  slug: string;
  description?: string;
  priority: number;
  is_active: boolean;
  subcategories?: SubCategoryOption[];
}
