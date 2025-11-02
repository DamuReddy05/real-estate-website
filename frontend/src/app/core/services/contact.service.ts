import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { 
  ContactMessage, 
  CreateContactMessageRequest, 
  ContactStats 
} from '../models/contact.model';

@Injectable({
  providedIn: 'root'
})
export class ContactService {

  constructor(private apiService: ApiService) {}

  // Submit contact message (public)
  submitContactMessage(message: CreateContactMessageRequest): Observable<any> {
    return this.apiService.post('/contact/', message);
  }

  // Admin: Get all contact messages
  getContactMessages(): Observable<ContactMessage[]> {
    return this.apiService.get<any>('/contact/admin/').pipe(
      map((response: any) => {
        // Handle paginated response format {count, results}
        if (response && response.results) {
          console.log('📦 Paginated response received, extracting results');
          return response.results;
        }
        // Handle simple array format
        if (Array.isArray(response)) {
          console.log('📦 Array response received');
          return response;
        }
        console.warn('⚠️ Unexpected response format:', response);
        return [];
      })
    );
  }

  // Admin: Get contact message by ID
  getContactMessage(id: number): Observable<ContactMessage> {
    return this.apiService.get<ContactMessage>(`/contact/admin/${id}/`);
  }

  // Admin: Update contact message
  updateContactMessage(id: number, message: Partial<ContactMessage>): Observable<ContactMessage> {
    return this.apiService.put<ContactMessage>(`/contact/admin/${id}/`, message);
  }

  // Admin: Delete contact message
  deleteContactMessage(id: number): Observable<any> {
    return this.apiService.delete(`/contact/admin/${id}/`);
  }

  // Admin: Get contact statistics
  getContactStats(): Observable<ContactStats> {
    return this.apiService.get<ContactStats>('/contact/admin/stats/');
  }

  // Helper methods
  getStatusDisplayName(status: string): string {
    const statusMap: { [key: string]: string } = {
      'new': 'New',
      'read': 'Read',
      'replied': 'Replied',
      'closed': 'Closed'
    };
    return statusMap[status] || status;
  }

  getStatusColor(status: string): string {
    const colorMap: { [key: string]: string } = {
      'new': 'danger',
      'read': 'warning',
      'replied': 'info',
      'closed': 'success'
    };
    return colorMap[status] || 'secondary';
  }
}
