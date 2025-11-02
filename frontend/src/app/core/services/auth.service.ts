import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { ApiService } from './api.service';
import { User, LoginRequest, LoginResponse, ChangePasswordRequest } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private apiService: ApiService) {
    this.loadUserFromStorage();
  }

  // Login
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.apiService.post<LoginResponse>('/auth/login/', credentials)
      .pipe(
        tap(response => {
          this.setTokens(response.access, response.refresh);
          this.setCurrentUser(response.user);
        })
      );
  }

  // Logout
  logout(): Observable<any> {
    const refreshToken = this.getRefreshToken();
    return this.apiService.post('/auth/logout/', { refresh: refreshToken })
      .pipe(
        tap(() => {
          this.clearAuthData();
        })
      );
  }

  // Get current user info
  getCurrentUser(): Observable<User> {
    return this.apiService.get<User>('/auth/user-info/');
  }

  // Update user profile
  updateProfile(userData: Partial<User>): Observable<User> {
    return this.apiService.put<User>('/auth/profile/', userData)
      .pipe(
        tap(user => {
          this.setCurrentUser(user);
        })
      );
  }

  // Change password
  changePassword(passwordData: ChangePasswordRequest): Observable<any> {
    return this.apiService.post('/auth/change-password/', passwordData);
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = this.getAccessToken();
    return !!token && !this.isTokenExpired(token);
  }

  // Get access token
  getAccessToken(): string | null {
    return localStorage.getItem('access_token');
  }

  // Get refresh token
  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  // Set tokens
  private setTokens(accessToken: string, refreshToken: string): void {
    console.log('Storing tokens:', {
      access: accessToken.substring(0, 20) + '...',
      refresh: refreshToken.substring(0, 20) + '...'
    });
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
  }

  // Set current user
  private setCurrentUser(user: User): void {
    this.currentUserSubject.next(user);
    localStorage.setItem('current_user', JSON.stringify(user));
  }

  // Load user from storage
  private loadUserFromStorage(): void {
    const userStr = localStorage.getItem('current_user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        this.currentUserSubject.next(user);
      } catch (error) {
        console.error('Error parsing user from storage:', error);
        this.clearAuthData();
      }
    }
  }

  // Clear authentication data
  private clearAuthData(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('current_user');
    this.currentUserSubject.next(null);
  }

  // Check if token is expired
  private isTokenExpired(token: string): boolean {
    try {
      if (!token || token.split('.').length !== 3) {
        return true;
      }
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      console.error('Error parsing token:', error);
      return true;
    }
  }

  // Get current user value
  getCurrentUserValue(): User | null {
    return this.currentUserSubject.value;
  }
}
