import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContactService } from '../../core/services/contact.service';
import { ContactMessage } from '../../core/models/contact.model';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <h1>Contact Messages</h1>
      
      <div class="filters">
        <input 
          type="text" 
          placeholder="Search messages..." 
          [(ngModel)]="searchQuery"
          (input)="filterMessages()"
          class="search-input"
        >
        <select [(ngModel)]="statusFilter" (change)="filterMessages()" class="filter-select">
          <option value="">All Status</option>
          <option value="new">New</option>
          <option value="read">Read</option>
          <option value="replied">Replied</option>
          <option value="closed">Closed</option>
        </select>
      </div>
      
      <div class="messages-list" *ngIf="!loading; else loadingTemplate">
        <div class="message-item" *ngFor="let message of filteredMessages">
          <div class="message-header">
            <div>
              <h3 class="message-name">{{ message.name }}</h3>
              <p class="message-email">{{ message.email }}</p>
            </div>
            <span class="message-badge" [ngClass]="'badge-' + contactService.getStatusColor(message.status)">
              {{ contactService.getStatusDisplayName(message.status) }}
            </span>
          </div>
          
          <div class="message-details">
            <div class="message-phone">
              <i class="fas fa-phone"></i>
              {{ message.phone }}
            </div>
            <div class="message-date">
              <i class="fas fa-calendar"></i>
              {{ message.created_at | date:'medium' }}
            </div>
          </div>
          
          <div class="message-content">
            <p>{{ message.message }}</p>
          </div>
          
          <div class="message-actions">
            <button 
              class="btn btn-outline" 
              (click)="updateStatus(message, 'read')"
              *ngIf="message.status === 'new'"
            >
              <i class="fas fa-eye"></i> Mark as Read
            </button>
            <button 
              class="btn btn-outline" 
              (click)="updateStatus(message, 'replied')"
              *ngIf="message.status === 'read'"
            >
              <i class="fas fa-reply"></i> Mark as Replied
            </button>
            <button 
              class="btn btn-outline" 
              (click)="updateStatus(message, 'closed')"
              *ngIf="message.status === 'replied'"
            >
              <i class="fas fa-check"></i> Close
            </button>
          </div>
        </div>
      </div>
      
      <ng-template #loadingTemplate>
        <div class="text-center p-5">
          <div class="loading"></div>
          <p>Loading messages...</p>
        </div>
      </ng-template>
      
      <div class="no-messages" *ngIf="!loading && messages.length === 0">
        <i class="fas fa-envelope"></i>
        <p>No contact messages found.</p>
      </div>
    </div>
  `,
  styles: [`
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    .filters {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
      flex-wrap: wrap;
    }

    .search-input,
    .filter-select {
      padding: 0.5rem 1rem;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      font-size: 0.875rem;
    }

    .search-input {
      min-width: 200px;
      flex: 1;
    }

    .filter-select {
      min-width: 150px;
    }
    
    .messages-list {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }
    
    .message-item {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      border: 1px solid #e2e8f0;
    }
    
    .message-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
    }
    
    .message-name {
      margin: 0 0 0.25rem 0;
      color: #1e293b;
      font-size: 1.25rem;
    }
    
    .message-email {
      margin: 0;
      color: #64748b;
      font-size: 0.875rem;
    }
    
    .message-badge {
      padding: 0.25rem 0.75rem;
      border-radius: 1rem;
      font-size: 0.75rem;
      font-weight: 500;
      text-transform: uppercase;
    }
    
    .badge-danger { background: #fee2e2; color: #991b1b; }
    .badge-warning { background: #fef3c7; color: #92400e; }
    .badge-info { background: #dbeafe; color: #1e40af; }
    .badge-success { background: #d1fae5; color: #065f46; }
    
    .message-details {
      display: flex;
      gap: 2rem;
      margin-bottom: 1rem;
      flex-wrap: wrap;
    }
    
    .message-phone,
    .message-date {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #64748b;
      font-size: 0.875rem;
    }
    
    .message-content {
      margin-bottom: 1.5rem;
    }
    
    .message-content p {
      margin: 0;
      color: #374151;
      line-height: 1.6;
    }
    
    .message-actions {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
    }
    
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
      font-weight: 500;
      border: 1px solid transparent;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.3s ease;
      gap: 0.5rem;
    }
    
    .btn-outline {
      background-color: transparent;
      border-color: #e2e8f0;
      color: #1e293b;
    }
    
    .btn-outline:hover {
      background-color: #f8fafc;
      border-color: #2563eb;
      color: #2563eb;
    }
    
    .loading {
      display: inline-block;
      width: 2rem;
      height: 2rem;
      border: 3px solid #e2e8f0;
      border-radius: 50%;
      border-top-color: #2563eb;
      animation: spin 1s ease-in-out infinite;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
    .no-messages {
      text-align: center;
      padding: 3rem;
      color: #64748b;
    }
    
    .no-messages i {
      font-size: 3rem;
      margin-bottom: 1rem;
      color: #d1d5db;
    }
  `]
})
export class ContactComponent implements OnInit {
  messages: ContactMessage[] = [];
  filteredMessages: ContactMessage[] = [];
  loading = false;
  searchQuery = '';
  statusFilter = '';

  constructor(
    public contactService: ContactService,
    private spinner: NgxSpinnerService
  ) {}

  ngOnInit() {
    this.loadMessages();
  }

  loadMessages() {
    this.loading = true;
    this.spinner.show();
    
    this.contactService.getContactMessages().subscribe({
      next: (messages) => {
        this.messages = messages;
        this.filterMessages();
        this.loading = false;
        this.spinner.hide();
      },
      error: (error) => {
        console.error('Error loading messages:', error);
        this.loading = false;
        this.spinner.hide();
      }
    });
  }

  filterMessages() {
    let filtered = [...this.messages];

    // Search filter
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(message => 
        message.name.toLowerCase().includes(query) ||
        message.email.toLowerCase().includes(query) ||
        message.message.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (this.statusFilter) {
      filtered = filtered.filter(message => message.status === this.statusFilter);
    }

    this.filteredMessages = filtered;
  }

  updateStatus(message: ContactMessage, newStatus: string) {
    this.contactService.updateContactMessage(message.id, { status: newStatus as any }).subscribe({
      next: (updatedMessage) => {
        message.status = newStatus as any;
        // Show success message
        console.log('Message status updated successfully');
      },
      error: (error) => {
        console.error('Error updating message status:', error);
      }
    });
  }
}
