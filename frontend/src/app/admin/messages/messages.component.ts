import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ContactService } from '../../core/services/contact.service';
import { PropertyService } from '../../core/services/property.service';
import { ContactMessage } from '../../core/models/contact.model';
import { PropertyEnquiry } from '../../core/models/property.model';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import * as XLSX from 'xlsx';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-admin-messages',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="messages-container">
      <!-- Header -->
      <div class="header-section">
        <h1><i class="fas fa-envelope"></i> Contact Messages</h1>
        <div class="header-actions">
          <button class="btn-export" (click)="exportToExcel()" [disabled]="filteredMessages.length === 0">
            <i class="fas fa-file-excel"></i>
            Export to Excel
          </button>
          <button class="btn-refresh" (click)="loadMessages()" [disabled]="loading">
            <i class="fas fa-sync-alt" [class.spinning]="loading"></i>
            Refresh
          </button>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="stats-grid">
        <div class="stat-card new">
          <i class="fas fa-envelope"></i>
          <div class="stat-content">
            <h3>{{ getMessageCount('new') }}</h3>
            <p>New Messages</p>
          </div>
        </div>
        <div class="stat-card read">
          <i class="fas fa-envelope-open"></i>
          <div class="stat-content">
            <h3>{{ getMessageCount('read') }}</h3>
            <p>Read</p>
          </div>
        </div>
        <div class="stat-card replied">
          <i class="fas fa-reply"></i>
          <div class="stat-content">
            <h3>{{ getMessageCount('replied') }}</h3>
            <p>Replied</p>
          </div>
        </div>
        <div class="stat-card closed">
          <i class="fas fa-check-circle"></i>
          <div class="stat-content">
            <h3>{{ getMessageCount('closed') }}</h3>
            <p>Closed</p>
          </div>
        </div>
        <div class="stat-card" style="border-left-color: #3b82f6;">
          <i class="fas fa-building"></i>
          <div class="stat-content">
            <h3>{{ getPropertyEnquiryCount() }}</h3>
            <p>Property Enquiries</p>
          </div>
        </div>
        <div class="stat-card" style="border-left-color: #8b5cf6;">
          <i class="fas fa-envelope-open-text"></i>
          <div class="stat-content">
            <h3>{{ getContactMessageCount() }}</h3>
            <p>Contact Messages</p>
          </div>
        </div>
      </div>

      <!-- Filters -->
      <div class="filters-section">
        <div class="filter-group">
          <input 
            type="text" 
            placeholder="🔍 Search by name, email, phone, message..." 
            [(ngModel)]="searchQuery"
            (input)="filterMessages()"
            class="search-input"
          >
        </div>
        <div class="filter-group">
          <select [(ngModel)]="typeFilter" (change)="filterMessages()" class="filter-select">
            <option value="">All Types</option>
            <option value="contact_message">📧 Contact Messages</option>
            <option value="property_enquiry">🏠 Property Enquiries</option>
          </select>
        </div>
        <div class="filter-group">
          <select [(ngModel)]="statusFilter" (change)="filterMessages()" class="filter-select">
            <option value="">All Status</option>
            <option value="new">🔴 New</option>
            <option value="read">🟡 Read</option>
            <option value="replied">🔵 Replied</option>
            <option value="closed">🟢 Closed</option>
          </select>
        </div>
        <div class="filter-group">
          <select [(ngModel)]="sortBy" (change)="sortMessages()" class="filter-select">
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="name">Name (A-Z)</option>
          </select>
        </div>
      </div>

      <!-- Messages List -->
      <div class="messages-list" *ngIf="filteredMessages.length > 0">
        <div class="message-card" *ngFor="let message of filteredMessages" [class.unread]="message.status === 'new'">
          <!-- Status Badge (Top Right) -->
          <div class="status-badge" [ngClass]="'status-' + message.status">
            <i [class]="getStatusIcon(message.status)"></i>
            {{ getStatusLabel(message.status) }}
          </div>

          <!-- Message Header -->
          <div class="message-header">
              <div class="user-info">
                <div class="avatar">
                  {{ getMessageName(message).charAt(0).toUpperCase() }}
                </div>
                <div class="user-details">
                  <h3>{{ getMessageName(message) }}</h3>
                  <div class="contact-details">
                    <span *ngIf="getMessageEmail(message)"><i class="fas fa-envelope"></i> {{ getMessageEmail(message) }}</span>
                    <span *ngIf="getMessagePhone(message)"><i class="fas fa-phone"></i> {{ getMessagePhone(message) }}</span>
                  </div>
                </div>
              </div>
            <div class="message-date">
              <i class="fas fa-clock"></i>
              {{ formatDate(message.created_at) }}
            </div>
          </div>

          <!-- Property Info (for property enquiries) -->
          <div class="property-info" *ngIf="isPropertyEnquiry(message)">
            <div class="property-badge" *ngIf="getPropertyTitle(message)">
              <i class="fas fa-building"></i>
              <div>
                <strong>{{ getPropertyTitle(message) }}</strong>
                <small>{{ getPropertyLocation(message) }}</small>
              </div>
            </div>
          </div>

          <!-- Message Content -->
          <div class="message-body">
            <p>{{ message.message }}</p>
          </div>

          <!-- Actions -->
          <div class="message-actions">
            <button 
              class="btn btn-primary"
              (click)="markAsRead(message)"
              *ngIf="message.status === 'new'"
            >
              <i class="fas fa-eye"></i> Mark as Read
            </button>
            <button 
              class="btn btn-success"
              (click)="markAsReplied(message)"
              *ngIf="message.status === 'read'"
            >
              <i class="fas fa-reply"></i> Mark as Replied
            </button>
            <button 
              class="btn btn-secondary"
              (click)="markAsClosed(message)"
              *ngIf="message.status === 'replied'"
            >
              <i class="fas fa-check"></i> Close
            </button>
            <button 
              class="btn btn-outline"
              (click)="reopenMessage(message)"
              *ngIf="message.status === 'closed'"
            >
              <i class="fas fa-redo"></i> Reopen
            </button>
            <a 
              *ngIf="getMessageEmail(message)"
              [href]="'mailto:' + getMessageEmail(message) + '?subject=Re: Contact from RealEstateHub&body=Hi ' + getMessageName(message) + ',%0D%0A%0D%0AThank you for contacting us.%0D%0A%0D%0A'"
              class="btn btn-outline"
              target="_blank"
            >
              <i class="fas fa-envelope"></i> Reply via Email
            </a>
            <a 
              *ngIf="getMessagePhone(message)"
              [href]="'tel:' + getMessagePhone(message)"
              class="btn btn-outline"
            >
              <i class="fas fa-phone"></i> Call
            </a>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div class="loading-state" *ngIf="loading">
        <div class="spinner"></div>
        <p>Loading messages...</p>
      </div>

      <!-- Empty State -->
      <div class="empty-state" *ngIf="filteredMessages.length === 0 && messages.length === 0 && !loading">
        <i class="fas fa-inbox"></i>
        <h3>No Messages Yet</h3>
        <p>Contact messages will appear here when users submit the contact form.</p>
      </div>

      <!-- No Results State -->
      <div class="empty-state" *ngIf="filteredMessages.length === 0 && messages.length > 0 && !loading">
        <i class="fas fa-search"></i>
        <h3>No Messages Found</h3>
        <p>No messages match your current filters.</p>
        <button class="btn btn-primary" (click)="clearFilters()">
          <i class="fas fa-times"></i> Clear Filters
        </button>
      </div>
    </div>
  `,
  styles: [`
    .messages-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 2rem;
    }

    /* Header */
    .header-section {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }
    .header-actions {
      display: flex;
      gap: 1rem;
      align-items: center;
    }
    .btn-export {
      padding: 0.75rem 1.5rem;
      background: linear-gradient(135deg, #10b981, #059669);
      border: none;
      border-radius: 10px;
      cursor: pointer;
      font-weight: 600;
      color: white;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.3s ease;
    }
    .btn-export:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
    }
    .btn-export:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .header-section h1 {
      margin: 0;
      color: #1e293b;
      font-size: 2rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .header-actions {
      display: flex;
      gap: 1rem;
      align-items: center;
    }
    .btn-export {
      padding: 0.75rem 1.5rem;
      background: linear-gradient(135deg, #10b981, #059669);
      border: none;
      border-radius: 10px;
      cursor: pointer;
      font-weight: 600;
      color: white;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.3s ease;
    }
    .btn-export:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
    }
    .btn-export:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-refresh {
      padding: 0.75rem 1.5rem;
      background: white;
      border: 2px solid #e5e7eb;
      border-radius: 10px;
      cursor: pointer;
      font-weight: 600;
      color: #1e293b;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.3s ease;
    }

    .btn-refresh:hover:not(:disabled) {
      border-color: #3b82f6;
      color: #3b82f6;
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
    }

    .btn-refresh:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .spinning {
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Stats Grid */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .stat-card {
      background: white;
      padding: 1.5rem;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      display: flex;
      align-items: center;
      gap: 1rem;
      border-left: 4px solid;
      transition: all 0.3s ease;
    }

    .stat-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
    }

    .stat-card.new { border-left-color: #ef4444; }
    .stat-card.read { border-left-color: #f59e0b; }
    .stat-card.replied { border-left-color: #3b82f6; }
    .stat-card.closed { border-left-color: #10b981; }

    .stat-card i {
      font-size: 2.5rem;
      opacity: 0.2;
    }

    .stat-card.new i { color: #ef4444; }
    .stat-card.read i { color: #f59e0b; }
    .stat-card.replied i { color: #3b82f6; }
    .stat-card.closed i { color: #10b981; }

    .stat-content h3 {
      margin: 0;
      font-size: 2rem;
      color: #1e293b;
      font-weight: 700;
    }

    .stat-content p {
      margin: 0.25rem 0 0 0;
      color: #64748b;
      font-size: 0.875rem;
    }

    /* Filters */
    .filters-section {
      display: flex;
      gap: 1rem;
      margin-bottom: 2rem;
      flex-wrap: wrap;
    }

    .filter-group {
      flex: 1;
      min-width: 200px;
    }

    .search-input,
    .filter-select {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 2px solid #e5e7eb;
      border-radius: 10px;
      font-size: 0.95rem;
      transition: all 0.3s ease;
    }

    .search-input:focus,
    .filter-select:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    /* Messages List */
    .messages-list {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .message-card {
      background: white;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      border: 2px solid #e5e7eb;
      position: relative;
      transition: all 0.3s ease;
    }

    .message-card:hover {
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
      transform: translateY(-2px);
    }

    .message-card.unread {
      border-left: 4px solid #ef4444;
      background: linear-gradient(to right, #fef2f2 0%, white 100%);
    }

    /* Status Badge */
    .status-badge {
      position: absolute;
      top: 1rem;
      right: 1rem;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .status-new {
      background: linear-gradient(135deg, #fee2e2, #fecaca);
      color: #991b1b;
      box-shadow: 0 2px 8px rgba(239, 68, 68, 0.2);
    }

    .status-read {
      background: linear-gradient(135deg, #fef3c7, #fde68a);
      color: #92400e;
      box-shadow: 0 2px 8px rgba(245, 158, 11, 0.2);
    }

    .status-replied {
      background: linear-gradient(135deg, #dbeafe, #bfdbfe);
      color: #1e40af;
      box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
    }

    .status-closed {
      background: linear-gradient(135deg, #d1fae5, #a7f3d0);
      color: #065f46;
      box-shadow: 0 2px 8px rgba(16, 185, 129, 0.2);
    }

    /* Message Header */
    .message-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1.5rem;
      padding-right: 120px; /* Make room for status badge */
    }

    .user-info {
      display: flex;
      gap: 1rem;
      align-items: flex-start;
    }

    .avatar {
      width: 50px;
      height: 50px;
      border-radius: 50%;
      background: linear-gradient(135deg, #3b82f6, #2563eb);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      font-weight: 700;
      flex-shrink: 0;
    }

    .user-details h3 {
      margin: 0 0 0.5rem 0;
      color: #1e293b;
      font-size: 1.25rem;
      font-weight: 600;
    }

    .contact-details {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .contact-details span {
      color: #64748b;
      font-size: 0.875rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .contact-details i {
      color: #3b82f6;
      width: 16px;
    }

    .message-date {
      color: #94a3b8;
      font-size: 0.875rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .message-date i {
      color: #cbd5e1;
    }

    /* Property Info */
    .property-info {
      margin-bottom: 1rem;
    }

    .property-badge {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem;
      background: linear-gradient(135deg, #eff6ff, #dbeafe);
      border: 1px solid #bfdbfe;
      border-radius: 10px;
      border-left: 4px solid #3b82f6;
    }

    .property-badge i {
      color: #3b82f6;
      font-size: 1.5rem;
    }

    .property-badge strong {
      display: block;
      color: #1e293b;
      font-size: 1rem;
      margin-bottom: 0.25rem;
    }

    .property-badge small {
      display: block;
      color: #64748b;
      font-size: 0.875rem;
    }

    /* Message Body */
    .message-body {
      background: #f8fafc;
      padding: 1.5rem;
      border-radius: 10px;
      margin-bottom: 1.5rem;
      border-left: 3px solid #e5e7eb;
    }

    .message-body p {
      margin: 0;
      color: #334155;
      line-height: 1.7;
      white-space: pre-wrap;
    }

    /* Actions */
    .message-actions {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0.625rem 1.25rem;
      font-size: 0.875rem;
      font-weight: 600;
      border: 2px solid transparent;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      gap: 0.5rem;
      text-decoration: none;
    }

    .btn-primary {
      background: linear-gradient(135deg, #3b82f6, #2563eb);
      color: white;
      border-color: transparent;
    }

    .btn-primary:hover {
      background: linear-gradient(135deg, #2563eb, #1e40af);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    }

    .btn-success {
      background: linear-gradient(135deg, #10b981, #059669);
      color: white;
      border-color: transparent;
    }

    .btn-success:hover {
      background: linear-gradient(135deg, #059669, #047857);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
    }

    .btn-secondary {
      background: linear-gradient(135deg, #64748b, #475569);
      color: white;
      border-color: transparent;
    }

    .btn-secondary:hover {
      background: linear-gradient(135deg, #475569, #334155);
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(100, 116, 139, 0.3);
    }

    .btn-outline {
      background: white;
      border-color: #e5e7eb;
      color: #475569;
    }

    .btn-outline:hover {
      border-color: #3b82f6;
      color: #3b82f6;
      background: #f8fafc;
    }

    /* Loading State */
    .loading-state {
      text-align: center;
      padding: 4rem 2rem;
    }

    .spinner {
      width: 50px;
      height: 50px;
      border: 4px solid #e5e7eb;
      border-top-color: #3b82f6;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 1rem;
    }

    .loading-state p {
      color: #64748b;
      font-size: 1rem;
    }

    /* Empty State */
    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      background: white;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    }

    .empty-state i {
      font-size: 4rem;
      color: #cbd5e1;
      margin-bottom: 1rem;
    }

    .empty-state h3 {
      margin: 0 0 0.5rem 0;
      color: #475569;
      font-size: 1.5rem;
    }

    .empty-state p {
      margin: 0 0 1.5rem 0;
      color: #94a3b8;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .messages-container {
        padding: 1rem;
      }

      .header-section {
        flex-direction: column;
        gap: 1rem;
        align-items: flex-start;
      }

      .stats-grid {
        grid-template-columns: 1fr 1fr;
      }

      .filters-section {
        flex-direction: column;
      }

      .message-header {
        flex-direction: column;
        gap: 1rem;
        padding-right: 0;
      }

      .status-badge {
        position: static;
        align-self: flex-start;
        margin-bottom: 1rem;
      }

      .message-actions {
        flex-direction: column;
      }

      .message-actions .btn {
        width: 100%;
      }
    }
  `]
})
export class AdminMessagesComponent implements OnInit {
  messages: (ContactMessage | PropertyEnquiry)[] = [];
  filteredMessages: (ContactMessage | PropertyEnquiry)[] = [];
  loading = false;
  searchQuery = '';
  statusFilter = '';
  typeFilter = '';
  sortBy = 'newest';

  constructor(
    private contactService: ContactService,
    private propertyService: PropertyService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService
  ) {}

  ngOnInit() {
    console.log('🔄 AdminMessagesComponent initialized');
    this.loadMessages();
  }

  loadMessages() {
    console.log('🔄 Loading messages... loading state:', this.loading);
    this.loading = true;
    this.messages = [];
    this.filteredMessages = [];
    this.spinner.show();

    // Load both contact messages and property enquiries
    forkJoin({
      contactMessages: this.contactService.getContactMessages(),
      propertyEnquiries: this.propertyService.getAdminPropertyEnquiries()
    }).subscribe({
      next: (results) => {
        console.log('✅ Messages loaded successfully');
        console.log('📧 Contact messages:', results.contactMessages?.length || 0);
        console.log('🏠 Property enquiries:', results.propertyEnquiries?.length || 0);
        
        // Normalize property enquiries to match contact message format for display
        const normalizedEnquiries: any[] = (results.propertyEnquiries || []).map((enquiry: PropertyEnquiry) => ({
          ...enquiry,
          enquiry_type: 'property_enquiry',
          // Map property enquiry status to contact message status format
          status: enquiry.status === 'contacted' ? 'read' : 
                  enquiry.status === 'scheduled' ? 'replied' : 
                  enquiry.status === 'closed' ? 'closed' : 'new'
        }));
        
        // Combine both types of messages
        const contactMsgs = Array.isArray(results.contactMessages) ? results.contactMessages : [];
        this.messages = [...contactMsgs, ...normalizedEnquiries];
        this.filteredMessages = [...this.messages];
        this.sortMessages();
        
        setTimeout(() => {
          this.loading = false;
          this.spinner.hide();
          console.log('✅ Loading complete. Total messages:', this.filteredMessages.length);
        }, 100);
      },
      error: (error) => {
        console.error('❌ Error loading messages:', error);
        
        this.messages = [];
        this.filteredMessages = [];
        
        setTimeout(() => {
          this.loading = false;
          this.spinner.hide();
        }, 100);
        
        let errorMessage = 'Failed to load messages';
        if (error.status === 401) {
          errorMessage = 'Authentication failed. Please login again.';
        } else if (error.error?.detail) {
          errorMessage = error.error.detail;
        }
        
        this.toastr.error(errorMessage, 'Error', { timeOut: 5000 });
      }
    });
  }

  filterMessages() {
    let filtered = [...this.messages];

    // Type filter (contact message vs property enquiry)
    if (this.typeFilter) {
      filtered = filtered.filter(message => message.enquiry_type === this.typeFilter);
    }

    // Search filter
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(message => {
        const name = this.getMessageName(message).toLowerCase();
        const email = (this.getMessageEmail(message) || '').toLowerCase();
        const phone = (this.getMessagePhone(message) || '').toLowerCase();
        const msg = (message.message || '').toLowerCase();
        const propTitle = (this.getPropertyTitle(message) || '').toLowerCase();
        const propLocation = (this.getPropertyLocation(message) || '').toLowerCase();
        
        return name.includes(query) ||
               email.includes(query) ||
               phone.includes(query) ||
               msg.includes(query) ||
               propTitle.includes(query) ||
               propLocation.includes(query);
      });
    }

    // Status filter
    if (this.statusFilter) {
      filtered = filtered.filter(message => message.status === this.statusFilter);
    }

    this.filteredMessages = filtered;
    this.sortMessages();
  }

  sortMessages() {
    if (this.sortBy === 'newest') {
      this.filteredMessages.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    } else if (this.sortBy === 'oldest') {
      this.filteredMessages.sort((a, b) => 
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      );
    } else if (this.sortBy === 'name') {
      this.filteredMessages.sort((a, b) => 
        this.getMessageName(a).localeCompare(this.getMessageName(b))
      );
    }
  }

  getMessageCount(status: string): number {
    return this.messages.filter(m => m.status === status).length;
  }

  getPropertyEnquiryCount(): number {
    return this.messages.filter(m => m.enquiry_type === 'property_enquiry').length;
  }

  getContactMessageCount(): number {
    return this.messages.filter(m => m.enquiry_type === 'contact_message' || !m.enquiry_type).length;
  }

  getStatusLabel(status: string): string {
    const labels: any = {
      'new': 'New',
      'read': 'Read',
      'replied': 'Replied',
      'closed': 'Closed'
    };
    return labels[status] || status;
  }

  getStatusIcon(status: string): string {
    const icons: any = {
      'new': 'fas fa-circle',
      'read': 'fas fa-envelope-open',
      'replied': 'fas fa-reply',
      'closed': 'fas fa-check-circle'
    };
    return icons[status] || 'fas fa-envelope';
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString('en-IN', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  markAsRead(message: ContactMessage | PropertyEnquiry) {
    this.updateStatus(message, 'read');
  }

  markAsReplied(message: ContactMessage | PropertyEnquiry) {
    this.updateStatus(message, 'replied');
  }

  markAsClosed(message: ContactMessage | PropertyEnquiry) {
    this.updateStatus(message, 'closed');
  }

  reopenMessage(message: ContactMessage | PropertyEnquiry) {
    this.updateStatus(message, 'read');
  }

  updateStatus(message: ContactMessage | PropertyEnquiry, newStatus: string) {
    this.spinner.show();
    
    // Map contact message status back to property enquiry status if needed
    if (message.enquiry_type === 'property_enquiry') {
      // Map display status to PropertyEnquiry status
      let actualStatus: 'new' | 'contacted' | 'scheduled' | 'closed';
      if (newStatus === 'read') {
        actualStatus = 'contacted';
      } else if (newStatus === 'replied') {
        actualStatus = 'scheduled';
      } else if (newStatus === 'closed') {
        actualStatus = 'closed';
      } else {
        actualStatus = 'new';
      }
      
      // Update property enquiry status via API - use PATCH to only update status
      this.propertyService.updatePropertyEnquiry(message.id, { status: actualStatus }).subscribe({
        next: (updatedEnquiry) => {
          // Reload messages to get the updated data
          this.loadMessages();
          this.toastr.success(`Message marked as ${this.getStatusLabel(newStatus)}`, 'Status Updated');
        },
        error: (error) => {
          console.error('Error updating enquiry status:', error);
          console.error('Error details:', error.error);
          const errorMsg = error.error?.detail || error.error?.message || error.error?.status?.[0] || 'Failed to update message status';
          this.toastr.error(errorMsg, 'Error');
          this.spinner.hide();
        }
      });
      return;
    }
    
    this.contactService.updateContactMessage(message.id, { status: newStatus as any }).subscribe({
      next: (updatedMessage) => {
        message.status = newStatus as any;
        this.toastr.success(`Message marked as ${this.getStatusLabel(newStatus)}`, 'Status Updated');
        this.spinner.hide();
        this.filterMessages(); // Re-apply filters to update counts
      },
      error: (error) => {
        console.error('Error updating message status:', error);
        this.toastr.error('Failed to update message status', 'Error');
        this.spinner.hide();
      }
    });
  }

  clearFilters() {
    this.searchQuery = '';
    this.statusFilter = '';
    this.typeFilter = '';
    this.sortBy = 'newest';
    this.filterMessages();
  }

  exportToExcel(): void {
    if (this.filteredMessages.length === 0) {
      this.toastr.warning('No messages to export', 'Warning');
      return;
    }

    // Prepare data for Excel
    const excelData = this.filteredMessages.map(message => ({
      'Name': message.name,
      'Email': message.email,
      'Phone': message.phone || '-',
      'Message': message.message,
      'Status': this.getStatusLabel(message.status),
      'Created Date': this.formatDateForExcel(message.created_at),
      'Updated Date': message.updated_at ? this.formatDateForExcel(message.updated_at) : '-'
    }));

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    
    // Set column widths
    const columnWidths = [
      { wch: 20 }, // Name
      { wch: 30 }, // Email
      { wch: 15 }, // Phone
      { wch: 50 }, // Message
      { wch: 12 }, // Status
      { wch: 20 }, // Created Date
      { wch: 20 }  // Updated Date
    ];
    worksheet['!cols'] = columnWidths;

    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Contact Messages');

    // Generate filename with current date
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0];
    const filename = `contact_messages_${dateStr}.xlsx`;

    // Write file
    XLSX.writeFile(workbook, filename);
    
    this.toastr.success(`Exported ${this.filteredMessages.length} messages to Excel`, 'Export Successful');
  }

  formatDateForExcel(dateString: string): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }

  // Helper methods for safe property access
  getMessageName(message: ContactMessage | PropertyEnquiry): string {
    return message.name || 'Unknown User';
  }

  getMessageEmail(message: ContactMessage | PropertyEnquiry): string | undefined {
    return message.email;
  }

  getMessagePhone(message: ContactMessage | PropertyEnquiry): string | undefined {
    return message.phone;
  }

  getPropertyTitle(message: ContactMessage | PropertyEnquiry): string | undefined {
    return (message as any).property_title;
  }

  getPropertyLocation(message: ContactMessage | PropertyEnquiry): string | undefined {
    return (message as any).property_location;
  }

  isPropertyEnquiry(message: ContactMessage | PropertyEnquiry): boolean {
    return message.enquiry_type === 'property_enquiry';
  }
}

