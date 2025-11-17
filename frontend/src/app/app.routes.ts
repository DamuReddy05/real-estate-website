import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'buy',
    loadComponent: () => import('./pages/buy/buy.component').then(m => m.BuyComponent)
  },
  {
    path: 'rent',
    loadComponent: () => import('./pages/rent/rent.component').then(m => m.RentComponent)
  },
  {
    path: 'plot',
    loadComponent: () => import('./pages/plot/plot.component').then(m => m.PlotComponent)
  },
  {
    path: 'contact',
    loadComponent: () => import('./pages/contact/contact.component').then(m => m.ContactComponent)
  },
  {
    path: 'property/:id',
    loadComponent: () => import('./pages/property-detail/property-detail.component').then(m => m.PropertyDetailComponent)
  },
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.routes').then(m => m.adminRoutes)
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/auth/customer-login/customer-login.component').then(m => m.CustomerLoginComponent)
  },
  {
    path: 'auth/callback',
    loadComponent: () => import('./pages/auth/auth-callback/auth-callback.component').then(m => m.AuthCallbackComponent)
  },
  {
    path: 'auth/phone',
    loadComponent: () => import('./pages/auth/phone-verification/phone-verification.component').then(m => m.PhoneVerificationComponent)
  },
  {
    path: 'customer/properties',
    loadComponent: () => import('./pages/customer/manage-properties/manage-properties.component').then(m => m.ManagePropertiesComponent)
  },
  {
    path: 'customer/properties/create',
    loadComponent: () => import('./pages/customer/property-form/customer-property-form.component').then(m => m.CustomerPropertyFormComponent)
  },
  {
    path: 'customer/properties/edit/:id',
    loadComponent: () => import('./pages/customer/property-form/customer-property-form.component').then(m => m.CustomerPropertyFormComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
