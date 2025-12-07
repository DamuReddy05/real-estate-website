import { Routes } from '@angular/router';
import { authGuard } from '../core/guards/auth.guard';

export const adminRoutes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login.component').then(m => m.LoginComponent)
  },
  {
    path: '',
    loadComponent: () => import('./layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'properties',
        loadComponent: () => import('./properties/properties.component').then(m => m.PropertiesComponent)
      },
      {
        path: 'properties/create',
        loadComponent: () => import('./properties/property-form/property-form.component').then(m => m.PropertyFormComponent)
      },
      {
        path: 'properties/edit/:id',
        loadComponent: () => import('./properties/property-form/property-form.component').then(m => m.PropertyFormComponent)
      },
      {
        path: 'contact',
        loadComponent: () => import('./messages/messages.component').then(m => m.AdminMessagesComponent)
      },
      {
        path: 'messages',
        loadComponent: () => import('./messages/messages.component').then(m => m.AdminMessagesComponent)
      },
      {
        path: 'taxonomy',
        loadComponent: () => import('./taxonomy/taxonomy.component').then(m => m.TaxonomyComponent)
      },
      {
        path: 'locations',
        loadComponent: () => import('./locations/location-manager.component').then(m => m.LocationManagerComponent)
      },
      {
        path: 'settings',
        loadComponent: () => import('./settings/site-settings.component').then(m => m.SiteSettingsComponent)
      },
      {
        path: 'banners',
        loadComponent: () => import('./banners/banner-manager.component').then(m => m.BannerManagerComponent)
      },
      {
        path: 'users',
        loadComponent: () => import('./users/user-management.component').then(m => m.UserManagementComponent)
      },
      {
        path: 'amenities',
        loadComponent: () => import('./amenities/amenities-management.component').then(m => m.AmenitiesManagementComponent)
      }
    ]
  }
];
