export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: 'new' | 'read' | 'replied' | 'closed';
  created_at: string;
  updated_at: string;
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
