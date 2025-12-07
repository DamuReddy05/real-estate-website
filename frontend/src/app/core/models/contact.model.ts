export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: 'new' | 'read' | 'replied' | 'closed';
  created_at: string;
  updated_at: string;
  enquiry_type?: 'contact_message' | 'property_enquiry';
}

export interface CreateContactMessageRequest {
  name: string;
  email: string;
  phone: string;
  message: string;
}

export interface ContactStats {
  total_messages: number;
  new_messages: number;
  read_messages: number;
  replied_messages: number;
  closed_messages: number;
}

export interface SiteSettings {
  id?: number;
  contact_address?: string;
  contact_phone?: string;
  contact_email?: string;
  working_hours?: string;
  facebook_url?: string;
  twitter_url?: string;
  instagram_url?: string;
  linkedin_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SiteSettingsUpdate {
  contact_address?: string;
  contact_phone?: string;
  contact_email?: string;
  working_hours?: string;
  facebook_url?: string;
  twitter_url?: string;
  instagram_url?: string;
  linkedin_url?: string;
}
