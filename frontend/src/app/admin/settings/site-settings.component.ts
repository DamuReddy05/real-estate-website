import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ContactService } from '../../core/services/contact.service';
import { SiteSettings, SiteSettingsUpdate } from '../../core/models/contact.model';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-site-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="settings-shell">
      <div class="hero-card">
        <p class="eyebrow">Admin Panel</p>
        <h1>Site Settings</h1>
        <p class="lead">Manage contact information and social media links displayed across the website.</p>
      </div>

      <form class="settings-form" (ngSubmit)="saveSettings()" #settingsForm="ngForm">
        <!-- Contact Information Section -->
        <div class="section-card">
          <div class="section-header">
            <h2><i class="fas fa-address-card"></i> Contact Information</h2>
            <p>These details appear on the contact page and footer.</p>
          </div>

          <div class="form-grid">
            <div class="form-group full-width">
              <label>Address *</label>
              <textarea
                name="contact_address"
                [(ngModel)]="settings.contact_address"
                required
                rows="3"
                placeholder="e.g., 123 Real Estate Street, Hyderabad, Telangana 500001"
              ></textarea>
            </div>

            <div class="form-group">
              <label>Phone Number *</label>
              <input
                type="text"
                name="contact_phone"
                [(ngModel)]="settings.contact_phone"
                required
                placeholder="e.g., +91 12345 67890"
              />
            </div>

            <div class="form-group">
              <label>Email Address *</label>
              <input
                type="email"
                name="contact_email"
                [(ngModel)]="settings.contact_email"
                required
                placeholder="e.g., contact@realestatehub.com"
              />
            </div>

            <div class="form-group full-width">
              <label>Working Hours</label>
              <input
                type="text"
                name="working_hours"
                [(ngModel)]="settings.working_hours"
                placeholder="e.g., Mon - Sat: 9:00 AM - 7:00 PM"
              />
            </div>
          </div>
        </div>

        <!-- Social Media Links Section -->
        <div class="section-card">
          <div class="section-header">
            <h2><i class="fas fa-share-alt"></i> Social Media Links</h2>
            <p>Add your social media profiles. Links will appear in the footer and contact page.</p>
          </div>

          <div class="form-grid">
            <div class="form-group">
              <label>
                <i class="fab fa-facebook"></i> Facebook URL
              </label>
              <input
                type="url"
                name="facebook_url"
                [(ngModel)]="settings.facebook_url"
                placeholder="https://facebook.com/yourpage"
              />
            </div>

            <div class="form-group">
              <label>
                <i class="fab fa-twitter"></i> Twitter/X URL
              </label>
              <input
                type="url"
                name="twitter_url"
                [(ngModel)]="settings.twitter_url"
                placeholder="https://twitter.com/yourhandle"
              />
            </div>

            <div class="form-group">
              <label>
                <i class="fab fa-instagram"></i> Instagram URL
              </label>
              <input
                type="url"
                name="instagram_url"
                [(ngModel)]="settings.instagram_url"
                placeholder="https://instagram.com/yourhandle"
              />
            </div>

            <div class="form-group">
              <label>
                <i class="fab fa-linkedin"></i> LinkedIn URL
              </label>
              <input
                type="url"
                name="linkedin_url"
                [(ngModel)]="settings.linkedin_url"
                placeholder="https://linkedin.com/company/yourcompany"
              />
            </div>
          </div>
        </div>

        <!-- Form Actions -->
        <div class="form-actions">
          <button type="button" class="btn-secondary" (click)="resetForm()" [disabled]="saving">
            Reset
          </button>
          <button type="submit" class="btn-primary" [disabled]="saving || settingsForm.invalid">
            <i class="fas fa-save" *ngIf="!saving"></i>
            <i class="fas fa-spinner fa-spin" *ngIf="saving"></i>
            {{ saving ? 'Saving...' : 'Save Settings' }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [`
    .settings-shell {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      padding: 2rem;
    }

    .hero-card {
      background: linear-gradient(120deg, #172554, #1e40af);
      border-radius: 24px;
      padding: 2rem;
      color: #fff;
      box-shadow: 0 20px 45px rgba(15, 23, 42, 0.25);
    }

    .eyebrow {
      text-transform: uppercase;
      letter-spacing: 0.25em;
      font-size: 0.75rem;
      opacity: 0.8;
      margin: 0;
    }

    .hero-card h1 {
      margin: 0.3rem 0;
      font-size: 2.2rem;
    }

    .hero-card .lead {
      margin: 0;
      opacity: 0.85;
    }

    .settings-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .section-card {
      background: #fff;
      border-radius: 20px;
      padding: 2rem;
      box-shadow: 0 15px 40px rgba(15, 23, 42, 0.08);
    }

    .section-header {
      margin-bottom: 1.5rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid #e2e8f0;
    }

    .section-header h2 {
      margin: 0 0 0.5rem 0;
      font-size: 1.5rem;
      color: #0f172a;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .section-header h2 i {
      color: #2563eb;
    }

    .section-header p {
      margin: 0;
      color: #64748b;
      font-size: 0.9rem;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-group.full-width {
      grid-column: 1 / -1;
    }

    .form-group label {
      font-size: 0.9rem;
      font-weight: 600;
      color: #475569;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .form-group label i {
      color: #2563eb;
      font-size: 1.1rem;
    }

    .form-group input,
    .form-group textarea {
      width: 100%;
      border-radius: 12px;
      border: 1px solid #d7def7;
      padding: 0.75rem 1rem;
      font-size: 0.95rem;
      font-family: inherit;
      box-sizing: border-box;
      transition: all 0.2s ease;
    }

    .form-group input:focus,
    .form-group textarea:focus {
      outline: none;
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    }

    .form-group textarea {
      resize: vertical;
      min-height: 80px;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 1rem;
    }

    .btn-primary,
    .btn-secondary {
      padding: 0.75rem 2rem;
      border-radius: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      border: none;
      font-size: 1rem;
    }

    .btn-primary {
      background: #2563eb;
      color: #fff;
    }

    .btn-primary:hover:not(:disabled) {
      background: #1e40af;
      transform: translateY(-1px);
    }

    .btn-primary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-secondary {
      background: #f1f5f9;
      color: #475569;
    }

    .btn-secondary:hover:not(:disabled) {
      background: #e2e8f0;
    }

    .btn-secondary:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    @media (max-width: 768px) {
      .settings-shell {
        padding: 1rem;
      }

      .form-grid {
        grid-template-columns: 1fr;
      }

      .form-actions {
        flex-direction: column;
      }

      .btn-primary,
      .btn-secondary {
        width: 100%;
        justify-content: center;
      }
    }
  `]
})
export class SiteSettingsComponent implements OnInit {
  settings: SiteSettingsUpdate = {
    contact_address: '',
    contact_phone: '',
    contact_email: '',
    working_hours: '',
    facebook_url: '',
    twitter_url: '',
    instagram_url: '',
    linkedin_url: ''
  };

  originalSettings: SiteSettingsUpdate = { ...this.settings };
  saving = false;

  constructor(
    private contactService: ContactService,
    private toastr: ToastrService,
    private spinner: NgxSpinnerService
  ) {}

  ngOnInit(): void {
    this.loadSettings();
  }

  loadSettings(): void {
    this.spinner.show();
    this.contactService.getAdminSiteSettings().subscribe({
      next: (settings) => {
        this.settings = {
          contact_address: settings.contact_address || '',
          contact_phone: settings.contact_phone || '',
          contact_email: settings.contact_email || '',
          working_hours: settings.working_hours || '',
          facebook_url: settings.facebook_url || '',
          twitter_url: settings.twitter_url || '',
          instagram_url: settings.instagram_url || '',
          linkedin_url: settings.linkedin_url || ''
        };
        this.originalSettings = { ...this.settings };
        this.spinner.hide();
      },
      error: (err) => {
        console.error('Error loading site settings:', err);
        this.toastr.error('Failed to load site settings.', 'Error');
        this.spinner.hide();
      }
    });
  }

  saveSettings(): void {
    if (this.saving) return;

    this.saving = true;
    this.spinner.show();

    this.contactService.updateSiteSettings(this.settings).subscribe({
      next: (updated) => {
        this.settings = {
          contact_address: updated.contact_address || '',
          contact_phone: updated.contact_phone || '',
          contact_email: updated.contact_email || '',
          working_hours: updated.working_hours || '',
          facebook_url: updated.facebook_url || '',
          twitter_url: updated.twitter_url || '',
          instagram_url: updated.instagram_url || '',
          linkedin_url: updated.linkedin_url || ''
        };
        this.originalSettings = { ...this.settings };
        this.toastr.success('Site settings updated successfully!', 'Success');
        this.saving = false;
        this.spinner.hide();
      },
      error: (err) => {
        console.error('Error updating site settings:', err);
        const message = err.error?.detail || 'Failed to update site settings.';
        this.toastr.error(message, 'Error');
        this.saving = false;
        this.spinner.hide();
      }
    });
  }

  resetForm(): void {
    this.settings = { ...this.originalSettings };
  }
}

