import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private selectedCitySubject = new BehaviorSubject<string>('Ananthapur');
  public selectedCity$ = this.selectedCitySubject.asObservable();

  constructor() {
    // Load saved city from localStorage
    const savedCity = localStorage.getItem('selectedCity');
    if (savedCity) {
      this.selectedCitySubject.next(savedCity);
    }
  }

  setCity(city: string): void {
    this.selectedCitySubject.next(city);
    localStorage.setItem('selectedCity', city);
  }

  getCity(): string {
    return this.selectedCitySubject.value;
  }

  clearCity(): void {
    this.selectedCitySubject.next('Ananthapur');
    localStorage.removeItem('selectedCity');
  }
}




