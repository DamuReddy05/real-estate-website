import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { PropertyService } from '../../core/services/property.service';
import { CityOption, PincodeRecord } from '../../core/models/property.model';

@Component({
  selector: 'app-location-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="location-shell">
      <header class="hero-card">
        <div>
          <p class="eyebrow">Operational Cities</p>
          <h1>Manage Cities & Pincodes</h1>
          <p class="lead">Control where listings are allowed. Toggle cities, restrict pincodes, and keep the platform compliant.</p>
        </div>
      </header>

      <div class="insight-grid">
        <div class="insight-card">
          <p class="label">Active Cities</p>
          <p class="value">{{ activeCities }}</p>
          <small>{{ cities.length }} total</small>
        </div>
        <div class="insight-card">
          <p class="label">Total Pincodes</p>
          <p class="value">{{ pincodes.length }}</p>
          <small>{{ activePincodes }} active</small>
        </div>
      </div>

      <section class="panel-grid">
        <form class="editor-card" (ngSubmit)="saveCity()" #cityForm="ngForm">
          <div class="editor-header">
            <div>
              <h2>{{ editingCityId ? 'Edit City' : 'Add City' }}</h2>
              <p>Only active cities appear in the public posting form.</p>
            </div>
            <button type="button" class="btn-text" *ngIf="editingCityId" (click)="resetCityForm()">Cancel edit</button>
          </div>

          <label>City Name *</label>
          <input type="text" name="cityName" [(ngModel)]="cityDraft.name" required placeholder="e.g., Ananthapur">

          <label>State *</label>
          <input type="text" name="cityState" [(ngModel)]="cityDraft.state" required placeholder="e.g., Andhra Pradesh">

          <label>Status</label>
          <select name="cityStatus" [(ngModel)]="cityDraft.is_active">
            <option [ngValue]="true">Active</option>
            <option [ngValue]="false">Inactive</option>
          </select>

          <div class="form-actions">
            <button class="btn-primary" type="submit" [disabled]="citySaving || !cityDraft.name?.trim() || !cityDraft.state?.trim()">
              {{ editingCityId ? 'Update City' : 'Add City' }}
            </button>
          </div>
        </form>

        <div class="table-card">
          <div class="table-toolbar">
            <div class="toolbar-left">
              <i class="fas fa-search"></i>
              <input type="text" placeholder="Search cities..." [(ngModel)]="citySearch" name="citySearch" [ngModelOptions]="{standalone: true}">
            </div>
          </div>

          <div class="cards-grid" *ngIf="filteredCities.length; else emptyCities">
            <div class="entity-card" *ngFor="let city of filteredCities">
              <div class="card-head">
                <div>
                  <p class="card-title">{{ city.name }}</p>
                  <p class="card-subtitle">{{ city.state }} • {{ city.property_count || 0 }} listings</p>
                </div>
                <label class="switch">
                  <input type="checkbox" [checked]="city.is_active" (change)="toggleCityStatus(city, $event)">
                  <span></span>
                </label>
              </div>
              <p class="card-body">{{ city.total_pincodes || 0 }} pincodes configured</p>
              <div class="card-actions">
                <button class="btn-ghost" type="button" (click)="editCity(city)">Edit</button>
                <button class="btn-danger" type="button" (click)="deleteCity(city)">Delete</button>
              </div>
            </div>
          </div>
          <ng-template #emptyCities>
            <p class="empty-state">No cities configured yet.</p>
          </ng-template>
        </div>
      </section>

      <section class="panel-grid">
        <form class="editor-card" (ngSubmit)="savePincode()" #pincodeForm="ngForm">
          <div class="editor-header">
            <div>
              <h2>{{ editingPincodeId ? 'Edit Pincode' : 'Add Pincode' }}</h2>
              <p>Pincodes must be enabled per city before listings are allowed.</p>
            </div>
            <button type="button" class="btn-text" *ngIf="editingPincodeId" (click)="resetPincodeForm()">Cancel edit</button>
          </div>

          <label>City *</label>
          <select name="pincodeCity" [(ngModel)]="pincodeDraft.city_ref" required>
            <option [ngValue]="null">Select city</option>
            <option *ngFor="let city of cities" [ngValue]="city.id">{{ city.name }}</option>
          </select>

          <label>Pincode *</label>
          <input type="text" name="pincodeValue" [(ngModel)]="pincodeDraft.pincode" required maxlength="6" placeholder="6-digit pincode">

          <label>Area/Locality</label>
          <input type="text" name="pincodeArea" [(ngModel)]="pincodeDraft.area" placeholder="Optional locality name">

          <label>Status</label>
          <select name="pincodeStatus" [(ngModel)]="pincodeDraft.is_active">
            <option [ngValue]="true">Active</option>
            <option [ngValue]="false">Inactive</option>
          </select>

          <div class="form-actions">
            <button class="btn-primary" type="submit" [disabled]="pincodeSaving || !pincodeDraft.pincode || !pincodeDraft.city_ref">
              {{ editingPincodeId ? 'Update Pincode' : 'Add Pincode' }}
            </button>
          </div>
        </form>

        <div class="table-card">
          <div class="table-toolbar">
            <div class="toolbar-left">
              <i class="fas fa-search"></i>
              <input type="text" placeholder="Search pincodes..." [(ngModel)]="pincodeSearch" name="pincodeSearch" [ngModelOptions]="{standalone: true}">
            </div>
            <div class="toolbar-right">
              <select [(ngModel)]="pincodeCityFilter" name="pincodeCityFilter" [ngModelOptions]="{standalone: true}" (change)="loadPincodes()">
                <option [ngValue]="null">All cities</option>
                <option *ngFor="let city of cities" [ngValue]="city.id">{{ city.name }}</option>
              </select>
            </div>
          </div>

          <div class="cards-grid" *ngIf="filteredPincodes.length; else emptyPincodes">
            <div class="entity-card" *ngFor="let pin of filteredPincodes">
              <div class="card-head">
                <div>
                  <p class="card-title">{{ pin.pincode }}</p>
                  <p class="card-subtitle">{{ pin.city }} • {{ pin.area || 'No area' }}</p>
                </div>
                <label class="switch">
                  <input type="checkbox" [checked]="pin.is_active" (change)="togglePincodeStatus(pin, $event)">
                  <span></span>
                </label>
              </div>
              <div class="card-actions">
                <button class="btn-ghost" type="button" (click)="editPincode(pin)">Edit</button>
                <button class="btn-danger" type="button" (click)="deletePincode(pin)">Delete</button>
              </div>
            </div>
          </div>
          <ng-template #emptyPincodes>
            <p class="empty-state">No pincodes configured.</p>
          </ng-template>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .location-shell {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      padding: 2rem;
    }
    .hero-card {
      background: linear-gradient(120deg, #0f172a, #1d4ed8);
      border-radius: 24px;
      padding: 2rem;
      color: white;
      box-shadow: 0 20px 45px rgba(15, 23, 42, 0.3);
    }
    .eyebrow {
      letter-spacing: 0.2em;
      text-transform: uppercase;
      opacity: 0.7;
      font-size: 0.75rem;
    }
    .hero-card h1 {
      margin: 0.4rem 0;
    }
    .lead {
      margin: 0;
      opacity: 0.85;
    }
    .insight-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }
    .insight-card {
      background: #fff;
      border-radius: 18px;
      padding: 1rem 1.25rem;
      box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08);
    }
    .label {
      margin: 0;
      color: #64748b;
      font-size: 0.85rem;
    }
    .value {
      margin: 0.2rem 0;
      font-size: 2rem;
      font-weight: 700;
      color: #0f172a;
    }
    .panel-grid {
      display: grid;
      grid-template-columns: minmax(320px, 420px) minmax(0, 1fr);
      gap: 1.5rem;
      align-items: flex-start;
    }
    .editor-card, .table-card {
      background: #fff;
      border-radius: 20px;
      padding: 1.5rem;
      box-shadow: 0 15px 40px rgba(15, 23, 42, 0.08);
    }
    .editor-header {
      display: flex;
      justify-content: space-between;
      gap: 0.5rem;
      margin-bottom: 0.5rem;
    }
    .editor-card label {
      font-size: 0.85rem;
      color: #475569;
      margin-top: 0.9rem;
    }
    .editor-card input,
    .editor-card select {
      width: 100%;
      border-radius: 12px;
      border: 1px solid #d7def7;
      padding: 0.6rem 0.8rem;
      font-size: 0.95rem;
    }
    .form-actions {
      display: flex;
      justify-content: flex-end;
      margin-top: 1.25rem;
    }
    .btn-primary {
      background: #2563eb;
      color: #fff;
      border: none;
      border-radius: 12px;
      padding: 0.65rem 1.6rem;
      font-weight: 600;
      cursor: pointer;
    }
    .btn-text {
      border: none;
      background: transparent;
      color: #2563eb;
      cursor: pointer;
    }
    .table-card {
      display: flex;
      flex-direction: column;
      gap: 0.8rem;
    }
    .table-toolbar {
      display: flex;
      justify-content: space-between;
      gap: 1rem;
      flex-wrap: wrap;
    }
    .toolbar-left {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      border: 1px solid #d7def7;
      border-radius: 12px;
      padding: 0.4rem 0.8rem;
      flex: 1;
    }
    .toolbar-left input {
      border: none;
      outline: none;
      flex: 1;
    }
    .toolbar-right select {
      border-radius: 10px;
      border: 1px solid #d7def7;
      padding: 0.4rem 0.8rem;
    }
    .cards-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 1rem;
    }
    .entity-card {
      border: 1px solid #e2e8f0;
      border-radius: 18px;
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.8rem;
      min-height: 150px;
    }
    .card-head {
      display: flex;
      justify-content: space-between;
      gap: 0.5rem;
    }
    .card-title {
      margin: 0;
      font-weight: 600;
      color: #0f172a;
    }
    .card-subtitle {
      margin: 0.2rem 0 0;
      color: #94a3b8;
      font-size: 0.85rem;
    }
    .card-body {
      margin: 0;
      color: #475569;
    }
    .card-actions {
      display: flex;
      justify-content: flex-end;
      gap: 0.4rem;
    }
    .btn-ghost,
    .btn-danger {
      border: none;
      background: transparent;
      cursor: pointer;
      padding: 0.3rem 0.6rem;
      border-radius: 8px;
      font-weight: 600;
    }
    .btn-ghost {
      color: #2563eb;
    }
    .btn-danger {
      color: #dc2626;
    }
    .switch {
      position: relative;
      display: inline-block;
      width: 40px;
      height: 22px;
    }
    .switch input {
      opacity: 0;
      width: 0;
      height: 0;
    }
    .switch span {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: #e2e8f0;
      border-radius: 999px;
      transition: 0.2s;
    }
    .switch span:before {
      position: absolute;
      content: "";
      height: 16px;
      width: 16px;
      left: 3px;
      bottom: 3px;
      background-color: white;
      border-radius: 50%;
      transition: 0.2s;
    }
    .switch input:checked + span {
      background-color: #2563eb;
    }
    .switch input:checked + span:before {
      transform: translateX(18px);
    }
    .empty-state {
      text-align: center;
      color: #94a3b8;
      padding: 1.5rem 0;
    }
    @media (max-width: 1024px) {
      .panel-grid {
        grid-template-columns: 1fr;
      }
    }
    @media (max-width: 768px) {
      .location-shell {
        padding: 1.25rem;
      }
    }
  `]
})
export class LocationManagerComponent implements OnInit {
  cities: CityOption[] = [];
  pincodes: PincodeRecord[] = [];

  cityDraft: Partial<CityOption> = this.defaultCity();
  pincodeDraft: { city_ref: number | null; pincode: string; area?: string; is_active: boolean } = this.defaultPincode();

  editingCityId: number | null = null;
  editingPincodeId: number | null = null;

  citySearch = '';
  pincodeSearch = '';
  pincodeCityFilter: number | null = null;

  citySaving = false;
  pincodeSaving = false;

  constructor(
    private propertyService: PropertyService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadCities();
    this.loadPincodes();
  }

  get activeCities(): number {
    return this.cities.filter(city => city.is_active).length;
  }

  get activePincodes(): number {
    return this.pincodes.filter(pin => pin.is_active).length;
  }

  get filteredCities(): CityOption[] {
    const term = this.citySearch.trim().toLowerCase();
    return this.cities.filter(city =>
      !term ||
      city.name.toLowerCase().includes(term) ||
      city.state.toLowerCase().includes(term)
    );
  }

  get filteredPincodes(): PincodeRecord[] {
    const term = this.pincodeSearch.trim().toLowerCase();
    return this.pincodes.filter(pin => {
      if (this.pincodeCityFilter && pin.city_id !== this.pincodeCityFilter) {
        return false;
      }
      return !term ||
        pin.pincode.includes(term) ||
        pin.city.toLowerCase().includes(term) ||
        (pin.area || '').toLowerCase().includes(term);
    });
  }

  loadCities(): void {
    this.propertyService.getAdminCities().subscribe({
      next: (cities) => this.cities = cities,
      error: () => this.toastr.error('Failed to load cities')
    });
  }

  loadPincodes(): void {
    this.propertyService.getAdminPincodes(this.pincodeCityFilter || undefined).subscribe({
      next: (pins) => this.pincodes = pins,
      error: () => this.toastr.error('Failed to load pincodes')
    });
  }

  saveCity(): void {
    if (!this.cityDraft.name || !this.cityDraft.state) return;
    this.citySaving = true;
    const payload = { ...this.cityDraft };
    const request = this.editingCityId
      ? this.propertyService.updateCity(this.editingCityId, payload)
      : this.propertyService.createCity(payload);

    request.subscribe({
      next: () => {
        this.toastr.success(`City ${this.editingCityId ? 'updated' : 'created'} successfully`);
        this.resetCityForm();
        this.loadCities();
      },
      error: (error) => this.toastr.error(this.extractErrorMessage(error) || 'Failed to save city'),
      complete: () => this.citySaving = false
    });
  }

  editCity(city: CityOption): void {
    this.editingCityId = city.id;
    this.cityDraft = {
      name: city.name,
      state: city.state,
      is_active: city.is_active
    };
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  toggleCityStatus(city: CityOption, event: Event): void {
    const is_active = !!(event.target as HTMLInputElement)?.checked;
    this.propertyService.updateCity(city.id, { is_active }).subscribe({
      next: () => {
        city.is_active = is_active;
        this.toastr.success(`${city.name} ${is_active ? 'activated' : 'deactivated'}`);
      },
      error: () => {
        this.toastr.error('Failed to update city status');
        this.loadCities();
      }
    });
  }

  deleteCity(city: CityOption): void {
    if (!confirm(`Delete city "${city.name}"? Listings using this city will fail validation.`)) return;
    this.propertyService.deleteCity(city.id).subscribe({
      next: () => {
        this.toastr.success('City deleted');
        this.loadCities();
        this.loadPincodes();
      },
      error: () => this.toastr.error('Failed to delete city')
    });
  }

  resetCityForm(): void {
    this.cityDraft = this.defaultCity();
    this.editingCityId = null;
    this.citySaving = false;
  }

  savePincode(): void {
    if (!this.pincodeDraft.city_ref || !this.pincodeDraft.pincode) return;
    this.pincodeSaving = true;
    const payload = {
      city_ref: this.pincodeDraft.city_ref ?? undefined,
      pincode: this.pincodeDraft.pincode,
      area: this.pincodeDraft.area,
      is_active: this.pincodeDraft.is_active
    };
    const request = this.editingPincodeId
      ? this.propertyService.updatePincode(this.editingPincodeId, payload)
      : this.propertyService.createPincode({ ...payload, city_ref: this.pincodeDraft.city_ref! });

    request.subscribe({
      next: () => {
        this.toastr.success(`Pincode ${this.editingPincodeId ? 'updated' : 'created'} successfully`);
        this.resetPincodeForm();
        this.loadPincodes();
        this.loadCities();
      },
      error: (error) => this.toastr.error(this.extractErrorMessage(error) || 'Failed to save pincode'),
      complete: () => this.pincodeSaving = false
    });
  }

  editPincode(pin: PincodeRecord): void {
    this.editingPincodeId = pin.id;
    this.pincodeDraft = {
      city_ref: pin.city_id || null,
      pincode: pin.pincode,
      area: pin.area,
      is_active: pin.is_active
    };
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  }

  togglePincodeStatus(pin: PincodeRecord, event: Event): void {
    const is_active = !!(event.target as HTMLInputElement)?.checked;
    this.propertyService.updatePincode(pin.id, { is_active }).subscribe({
      next: () => {
        pin.is_active = is_active;
        this.toastr.success(`Pincode ${pin.pincode} ${is_active ? 'activated' : 'deactivated'}`);
      },
      error: () => {
        this.toastr.error('Failed to update pincode status');
        this.loadPincodes();
      }
    });
  }

  deletePincode(pin: PincodeRecord): void {
    if (!confirm(`Delete pincode ${pin.pincode}? Listings using it will be blocked.`)) return;
    this.propertyService.deletePincode(pin.id).subscribe({
      next: () => {
        this.toastr.success('Pincode deleted');
        this.loadPincodes();
        this.loadCities();
      },
      error: () => this.toastr.error('Failed to delete pincode')
    });
  }

  resetPincodeForm(): void {
    this.pincodeDraft = this.defaultPincode();
    this.editingPincodeId = null;
    this.pincodeSaving = false;
  }

  private defaultCity(): Partial<CityOption> {
    return { name: '', state: '', is_active: true };
  }

  private defaultPincode() {
    return { city_ref: null, pincode: '', area: '', is_active: true };
  }

  private extractErrorMessage(error: any): string | null {
    if (!error) return null;
    if (error.error) {
      if (typeof error.error === 'string') {
        return error.error;
      }
      if (typeof error.error === 'object') {
        const firstKey = Object.keys(error.error)[0];
        const value = error.error[firstKey];
        if (Array.isArray(value)) {
          return value[0];
        }
        if (typeof value === 'string') {
          return value;
        }
      }
    }
    if (error.message) return error.message;
    return null;
  }
}

