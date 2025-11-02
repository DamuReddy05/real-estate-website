import { Component } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ContactService } from '../../core/services/contact.service';
import { CreateContactMessageRequest } from '../../core/models/contact.model';
import { ToastrService } from 'ngx-toastr';
import { HeaderComponent } from '../../shared/header/header.component';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, HeaderComponent],
  template: `
    <!-- Shared Header Component -->
    <app-header></app-header>

    <!-- Contact Page -->
    <div class="contact-page">
      <div class="contact-container">
        <!-- Header Section -->
        <div class="contact-header">
          <h1><i class="fas fa-envelope"></i> Get In Touch</h1>
          <p>Have questions? We're here to help. Send us a message and we'll respond as soon as possible.</p>
        </div>

        <!-- Contact Form -->
        <div class="contact-content">
          <div class="contact-form-card">
            <form (ngSubmit)="submitForm()" #contactForm="ngForm">
              <div class="form-row">
                <div class="form-group">
                  <label for="name">
                    <i class="fas fa-user"></i> Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    [(ngModel)]="formData.name"
                    required
                    placeholder="Enter your full name"
                  >
                </div>
                <div class="form-group">
                  <label for="email">
                    <i class="fas fa-envelope"></i> Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    [(ngModel)]="formData.email"
                    required
                    email
                    placeholder="your@email.com"
                  >
                </div>
              </div>

              <div class="form-group">
                <label for="phone">
                  <i class="fas fa-phone"></i> Phone Number *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  [(ngModel)]="formData.phone"
                  required
                  placeholder="+91 XXXXX XXXXX"
                >
              </div>

              <div class="form-group">
                <label for="message">
                  <i class="fas fa-comment-dots"></i> Your Message *
                </label>
                <textarea
                  id="message"
                  name="message"
                  [(ngModel)]="formData.message"
                  required
                  rows="6"
                  placeholder="Tell us how we can help you..."
                ></textarea>
              </div>

              <div class="form-actions">
                <button type="submit" class="btn btn-primary" [disabled]="!contactForm.form.valid || submitting">
                  <i class="fas fa-paper-plane" *ngIf="!submitting"></i>
                  <i class="fas fa-spinner fa-spin" *ngIf="submitting"></i>
                  {{ submitting ? 'Sending...' : 'Send Message' }}
                </button>
                <button type="button" class="btn btn-outline" (click)="goBack()">
                  <i class="fas fa-arrow-left"></i> Back
                </button>
              </div>
            </form>
          </div>

          <!-- Contact Info -->
          <div class="contact-info-card">
            <h3><i class="fas fa-info-circle"></i> Contact Information</h3>
            <div class="info-items">
              <div class="info-item">
                <div class="info-icon">
                  <i class="fas fa-map-marker-alt"></i>
                </div>
                <div class="info-text">
                  <strong>Address</strong>
                  <span>123 Real Estate Street, Hyderabad, Telangana 500001</span>
                </div>
              </div>
              <div class="info-item">
                <div class="info-icon">
                  <i class="fas fa-phone"></i>
                </div>
                <div class="info-text">
                  <strong>Phone</strong>
                  <span>+91 12345 67890</span>
                </div>
              </div>
              <div class="info-item">
                <div class="info-icon">
                  <i class="fas fa-envelope"></i>
                </div>
                <div class="info-text">
                  <strong>Email</strong>
                  <span>contact&#64;realestatehub.com</span>
                </div>
              </div>
              <div class="info-item">
                <div class="info-icon">
                  <i class="fas fa-clock"></i>
                </div>
                <div class="info-text">
                  <strong>Working Hours</strong>
                  <span>Mon - Sat: 9:00 AM - 7:00 PM</span>
                </div>
              </div>
            </div>

            <div class="social-links">
              <h4>Follow Us</h4>
              <div class="social-icons">
                <a href="#" class="social-icon"><i class="fab fa-facebook"></i></a>
                <a href="#" class="social-icon"><i class="fab fa-twitter"></i></a>
                <a href="#" class="social-icon"><i class="fab fa-instagram"></i></a>
                <a href="#" class="social-icon"><i class="fab fa-linkedin"></i></a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* ========== CONSISTENT NAVBAR ========== */
    .app-navbar {
      background: white;
      box-shadow: 0 2px 10px rgba(0,0,0,0.08);
      position: sticky;
      top: 0;
      z-index: 1000;
    }

    .navbar-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 1rem 2rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .nav-brand h2 {
      margin: 0;
      color: #1e293b;
      font-size: 1.5rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .nav-brand i {
      color: #3b82f6;
    }

    .nav-links {
      display: flex;
      gap: 2rem;
      list-style: none;
      margin: 0;
      padding: 0;
    }

    .nav-links a {
      text-decoration: none;
      color: #64748b;
      font-weight: 500;
      transition: color 0.2s;
      padding: 0.5rem 0;
      border-bottom: 2px solid transparent;
    }

    .nav-links a:hover {
      color: #3b82f6;
    }

    .nav-links a.active {
      color: #3b82f6;
      border-bottom-color: #3b82f6;
    }

    .btn-admin {
      padding: 0.6rem 1.25rem;
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 500;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.2s;
    }

    .btn-admin:hover {
      background: #2563eb;
      transform: translateY(-1px);
    }

    /* ========== CONTACT PAGE ========== */
    .contact-page {
      min-height: calc(100vh - 66px);
      background: linear-gradient(to bottom, #f8fafc 0%, white 100%);
      padding: 3rem 0;
    }

    .contact-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 2rem;
    }

    .contact-header {
      text-align: center;
      margin-bottom: 3rem;
    }

    .contact-header h1 {
      font-size: 2.5rem;
      color: #1e293b;
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1rem;
    }

    .contact-header h1 i {
      color: #3b82f6;
    }

    .contact-header p {
      font-size: 1.1rem;
      color: #64748b;
      max-width: 600px;
      margin: 0 auto;
    }

    .contact-content {
      display: grid;
      grid-template-columns: 1.5fr 1fr;
      gap: 2rem;
    }

    .contact-form-card {
      background: white;
      border-radius: 16px;
      padding: 2.5rem;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
      border: 1px solid #e5e7eb;
    }

    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1.5rem;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-group label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 0.6rem;
      font-size: 0.95rem;
    }

    .form-group label i {
      color: #3b82f6;
      font-size: 0.9rem;
    }

    .form-group input,
    .form-group textarea {
      width: 100%;
      padding: 0.85rem 1rem;
      border: 1.5px solid #e5e7eb;
      border-radius: 8px;
      font-size: 0.95rem;
      font-family: inherit;
      transition: all 0.2s ease;
    }

    .form-group input:focus,
    .form-group textarea:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }

    .form-group textarea {
      resize: vertical;
      min-height: 150px;
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      margin-top: 2rem;
    }

    .btn {
      padding: 0.85rem 2rem;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 0.6rem;
      justify-content: center;
    }

    .btn-primary {
      background: #3b82f6;
      color: white;
      flex: 1;
    }

    .btn-primary:hover:not(:disabled) {
      background: #2563eb;
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(59, 130, 246, 0.3);
    }

    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-outline {
      background: white;
      color: #64748b;
      border: 1.5px solid #e5e7eb;
    }

    .btn-outline:hover {
      border-color: #3b82f6;
      color: #3b82f6;
      background: #eff6ff;
    }

    /* Contact Info Card */
    .contact-info-card {
      background: white;
      border-radius: 16px;
      padding: 2.5rem;
      box-shadow: 0 4px 20px rgba(0,0,0,0.08);
      border: 1px solid #e5e7eb;
      height: fit-content;
    }

    .contact-info-card h3 {
      color: #1e293b;
      font-size: 1.3rem;
      margin-bottom: 2rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .contact-info-card h3 i {
      color: #3b82f6;
    }

    .info-items {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      margin-bottom: 2.5rem;
    }

    .info-item {
      display: flex;
      gap: 1rem;
    }

    .info-icon {
      width: 45px;
      height: 45px;
      background: #eff6ff;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .info-icon i {
      color: #3b82f6;
      font-size: 1.1rem;
    }

    .info-text {
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
    }

    .info-text strong {
      color: #1e293b;
      font-size: 0.95rem;
    }

    .info-text span {
      color: #64748b;
      font-size: 0.9rem;
    }

    .social-links {
      padding-top: 2rem;
      border-top: 1px solid #e5e7eb;
    }

    .social-links h4 {
      color: #1e293b;
      font-size: 1.1rem;
      margin-bottom: 1rem;
    }

    .social-icons {
      display: flex;
      gap: 1rem;
    }

    .social-icon {
      width: 45px;
      height: 45px;
      background: #eff6ff;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #3b82f6;
      font-size: 1.2rem;
      transition: all 0.2s ease;
      text-decoration: none;
    }

    .social-icon:hover {
      background: #3b82f6;
      color: white;
      transform: translateY(-2px);
    }

    /* Responsive */
    @media (max-width: 968px) {
      .contact-content {
        grid-template-columns: 1fr;
      }

      .form-row {
        grid-template-columns: 1fr;
      }

      .navbar-container {
        flex-direction: column;
        gap: 1rem;
      }

      .nav-links {
        gap: 1rem;
      }
    }

    @media (max-width: 640px) {
      .contact-header h1 {
        font-size: 2rem;
        flex-direction: column;
        gap: 0.5rem;
      }

      .contact-form-card,
      .contact-info-card {
        padding: 1.5rem;
      }

      .form-actions {
        flex-direction: column;
      }

      .nav-links {
        display: none;
      }
    }
  `]
})
export class ContactComponent {
  formData: CreateContactMessageRequest = {
    name: '',
    email: '',
    phone: '',
    message: ''
  };

  submitting = false;

  constructor(
    private contactService: ContactService,
    private toastr: ToastrService,
    private location: Location
  ) {}

  submitForm() {
    if (this.submitting) return;

    this.submitting = true;
    this.contactService.submitContactMessage(this.formData).subscribe({
      next: () => {
        this.toastr.success('Thank you! We will get back to you soon.', 'Message Sent');
        this.resetForm();
        this.submitting = false;
      },
      error: (error) => {
        console.error('Error submitting contact form:', error);
        this.toastr.error('Failed to send message. Please try again.', 'Error');
        this.submitting = false;
      }
    });
  }

  resetForm() {
    this.formData = {
      name: '',
      email: '',
      phone: '',
      message: ''
    };
  }

  goBack() {
    this.location.back();
  }
}

