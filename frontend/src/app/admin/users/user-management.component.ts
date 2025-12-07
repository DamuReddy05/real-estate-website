import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { ApiService } from '../../core/services/api.service';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="user-management-shell">
      <header class="hero-card">
        <div>
          <p class="eyebrow">User Administration</p>
          <h1>User Management</h1>
          <p class="lead">Manage all users (admins and customers), view their details, and control access.</p>
        </div>
      </header>

      <div class="insight-grid">
        <div class="insight-card">
          <p class="label">Total Users</p>
          <p class="value">{{ users.length }}</p>
          <small>{{ activeUsers }} active</small>
        </div>
        <div class="insight-card">
          <p class="label">Admins</p>
          <p class="value">{{ getUsersByRole('admin').length }}</p>
          <small>{{ getActiveUsersByRole('admin') }} active</small>
        </div>
        <div class="insight-card">
          <p class="label">Customers</p>
          <p class="value">{{ getUsersByRole('customer').length }}</p>
          <small>{{ getActiveUsersByRole('customer') }} active</small>
        </div>
      </div>

      <div class="table-card">
        <div class="table-toolbar">
          <div class="toolbar-left">
            <i class="fas fa-search"></i>
            <input type="text" placeholder="Search users by name, email, phone..." 
              [(ngModel)]="searchQuery"
              name="searchQuery"
              [ngModelOptions]="{standalone: true}"
              (input)="filterUsers()">
          </div>
          <div class="toolbar-right">
            <select [(ngModel)]="roleFilter" 
              name="roleFilter"
              [ngModelOptions]="{standalone: true}"
              (change)="filterUsers()"
              class="filter-select">
              <option value="">All Roles</option>
              <option value="admin">Admins</option>
              <option value="customer">Customers</option>
            </select>
          </div>
        </div>

        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Role</th>
                <th>Auth Provider</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let user of filteredUsers" [class.inactive]="!user.is_active">
                <td>
                  <div class="user-cell">
                    <div class="avatar">
                      {{ getUserInitials(user) }}
                    </div>
                    <div class="user-info">
                      <div class="user-name">{{ getUserDisplayName(user) }}</div>
                      <div class="user-username">{{ '@' + user.username }}</div>
                    </div>
                  </div>
                </td>
                <td>{{ user.email }}</td>
                <td>{{ user.phone || '-' }}</td>
                <td>
                  <span class="role-badge" [class.admin]="user.role === 'admin'">
                    {{ user.role === 'admin' ? 'Admin' : 'Customer' }}
                  </span>
                </td>
                <td>
                  <span class="auth-badge">
                    <i [class]="user.auth_provider === 'google' ? 'fab fa-google' : 'fas fa-key'"></i>
                    {{ user.auth_provider === 'google' ? 'Google' : 'Password' }}
                  </span>
                </td>
                <td>
                  <span class="status-badge" [class.active]="user.is_active">
                    {{ user.is_active ? 'Active' : 'Inactive' }}
                  </span>
                </td>
                <td>{{ formatDate(user.created_at) }}</td>
                <td>
                  <div class="action-buttons">
                    <button class="btn-action btn-edit" 
                      (click)="openEditModal(user)"
                      title="Edit user">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-action btn-toggle" 
                      (click)="toggleUserStatus(user)"
                      [title]="user.is_active ? 'Deactivate user' : 'Activate user'">
                      <i [class]="user.is_active ? 'fas fa-ban' : 'fas fa-check'"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="empty-state" *ngIf="filteredUsers.length === 0">
          <i class="fas fa-users"></i>
          <p>No users found</p>
        </div>
      </div>
    </div>

    <!-- Edit User Modal -->
    <div class="modal-overlay" *ngIf="showEditModal" (click)="closeEditModal()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2><i class="fas fa-user-edit"></i> Edit User</h2>
          <button class="btn-close" (click)="closeEditModal()">
            <i class="fas fa-times"></i>
          </button>
        </div>
        <div class="modal-body" *ngIf="selectedUser">
          <div class="form-group">
            <label>Username</label>
            <input type="text" [(ngModel)]="selectedUser.username" [readonly]="true" class="form-control">
          </div>
          <div class="form-group">
            <label>Email</label>
            <input type="email" [(ngModel)]="selectedUser.email" class="form-control">
          </div>
          <div class="form-group">
            <label>Phone</label>
            <input type="text" [(ngModel)]="selectedUser.phone" class="form-control">
          </div>
          <div class="form-group">
            <label>First Name</label>
            <input type="text" [(ngModel)]="selectedUser.first_name" class="form-control">
          </div>
          <div class="form-group">
            <label>Last Name</label>
            <input type="text" [(ngModel)]="selectedUser.last_name" class="form-control">
          </div>
          <div class="form-group">
            <label>Role</label>
            <select [(ngModel)]="selectedUser.role" class="form-control">
              <option value="admin">Admin</option>
              <option value="customer">Customer</option>
            </select>
          </div>
          <div class="form-group">
            <label>
              <input type="checkbox" [(ngModel)]="selectedUser.is_active">
              Active (User can login)
            </label>
            <small class="help-text">Inactive users cannot login. They will see admin contact information when trying to login.</small>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" (click)="closeEditModal()">Cancel</button>
          <button class="btn btn-primary" (click)="saveUser()" [disabled]="saving">
            <i class="fas fa-save"></i> {{ saving ? 'Saving...' : 'Save Changes' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .user-management-shell {
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
    }
    .hero-card h1 {
      margin: 0.3rem 0;
      font-size: 2.2rem;
    }
    .hero-card .lead {
      margin: 0;
      opacity: 0.85;
    }
    .insight-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 1rem;
    }
    .insight-card {
      background: #fff;
      border-radius: 18px;
      padding: 1.2rem;
      box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08);
    }
    .insight-card .label {
      margin: 0;
      color: #64748b;
      font-size: 0.85rem;
    }
    .insight-card .value {
      margin: 0.2rem 0;
      font-size: 1.8rem;
      font-weight: 700;
      color: #0f172a;
    }
    .insight-card small {
      color: #94a3b8;
    }
    .table-card {
      background: #fff;
      border-radius: 20px;
      padding: 1.5rem;
      box-shadow: 0 15px 40px rgba(15, 23, 42, 0.08);
    }
    .table-toolbar {
      display: flex;
      justify-content: space-between;
      gap: 1rem;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
    }
    .toolbar-left {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex: 1;
      border: 1px solid #d7def7;
      border-radius: 12px;
      padding: 0.4rem 0.8rem;
      min-width: 300px;
    }
    .toolbar-left input {
      border: none;
      flex: 1;
      font-size: 0.95rem;
      outline: none;
    }
    .toolbar-right {
      display: flex;
      gap: 0.5rem;
    }
    .filter-select {
      border-radius: 8px;
      border: 1px solid #d7def7;
      padding: 0.5rem 1rem;
      font-size: 0.95rem;
      cursor: pointer;
    }
    .table-container {
      overflow-x: auto;
    }
    .data-table {
      width: 100%;
      border-collapse: collapse;
    }
    .data-table thead {
      background: #f8fafc;
    }
    .data-table th {
      padding: 1rem;
      text-align: left;
      font-weight: 600;
      color: #475569;
      font-size: 0.875rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      border-bottom: 2px solid #e2e8f0;
    }
    .data-table td {
      padding: 1rem;
      border-bottom: 1px solid #e2e8f0;
    }
    .data-table tbody tr {
      transition: background 0.2s;
    }
    .data-table tbody tr:hover {
      background: #f8fafc;
    }
    .data-table tbody tr.inactive {
      opacity: 0.6;
    }
    .user-cell {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: linear-gradient(135deg, #3b82f6, #2563eb);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      flex-shrink: 0;
    }
    .user-info {
      display: flex;
      flex-direction: column;
    }
    .user-name {
      font-weight: 600;
      color: #1e293b;
    }
    .user-username {
      font-size: 0.85rem;
      color: #94a3b8;
    }
    .role-badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
      background: #e2e8f0;
      color: #475569;
    }
    .role-badge.admin {
      background: #dbeafe;
      color: #1e40af;
    }
    .auth-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      color: #64748b;
    }
    .status-badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
      background: #fee2e2;
      color: #991b1b;
    }
    .status-badge.active {
      background: #d1fae5;
      color: #065f46;
    }
    .action-buttons {
      display: flex;
      gap: 0.5rem;
    }
    .btn-action {
      width: 36px;
      height: 36px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;
    }
    .btn-toggle {
      background: #f1f5f9;
      color: #64748b;
    }
    .btn-toggle:hover {
      background: #e2e8f0;
      color: #475569;
    }
    .btn-edit {
      background: #dbeafe;
      color: #1e40af;
    }
    .btn-edit:hover {
      background: #bfdbfe;
      color: #1e3a8a;
    }
    /* Modal */
    .modal-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      animation: fadeIn 0.2s;
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    .modal-content {
      background: white;
      border-radius: 16px;
      width: 90%;
      max-width: 600px;
      max-height: 90vh;
      overflow-y: auto;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      animation: slideUp 0.3s;
    }
    @keyframes slideUp {
      from {
        transform: translateY(20px);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem 2rem;
      border-bottom: 1px solid #e2e8f0;
    }
    .modal-header h2 {
      margin: 0;
      color: #1e293b;
      font-size: 1.5rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .btn-close {
      background: none;
      border: none;
      font-size: 1.5rem;
      color: #64748b;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 8px;
      transition: all 0.2s;
    }
    .btn-close:hover {
      background: #f1f5f9;
      color: #1e293b;
    }
    .modal-body {
      padding: 2rem;
    }
    .form-group {
      margin-bottom: 1.5rem;
    }
    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      color: #475569;
      font-weight: 600;
      font-size: 0.9rem;
    }
    .form-group input[type="checkbox"] {
      margin-right: 0.5rem;
    }
    .form-control {
      width: 100%;
      padding: 0.75rem 1rem;
      border: 2px solid #e2e8f0;
      border-radius: 8px;
      font-size: 0.95rem;
      transition: all 0.2s;
    }
    .form-control:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
    }
    .form-control[readonly] {
      background: #f8fafc;
      cursor: not-allowed;
    }
    .help-text {
      display: block;
      margin-top: 0.25rem;
      color: #64748b;
      font-size: 0.85rem;
    }
    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      padding: 1.5rem 2rem;
      border-top: 1px solid #e2e8f0;
    }
    .btn {
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      border: none;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .btn-primary {
      background: #3b82f6;
      color: white;
    }
    .btn-primary:hover:not(:disabled) {
      background: #2563eb;
    }
    .btn-secondary {
      background: #e2e8f0;
      color: #475569;
    }
    .btn-secondary:hover {
      background: #cbd5e1;
    }
    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
      color: #94a3b8;
    }
    .empty-state i {
      font-size: 4rem;
      margin-bottom: 1rem;
      opacity: 0.5;
    }
    @media (max-width: 768px) {
      .user-management-shell {
        padding: 1rem;
      }
      .table-container {
        overflow-x: scroll;
      }
    }
  `]
})
export class UserManagementComponent implements OnInit {
  users: User[] = [];
  filteredUsers: User[] = [];
  searchQuery = '';
  roleFilter = '';
  loading = false;
  showEditModal = false;
  selectedUser: User | null = null;
  saving = false;

  constructor(
    private apiService: ApiService,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    const params: any = {};
    if (this.roleFilter) {
      params.role = this.roleFilter;
    }
    if (this.searchQuery) {
      params.search = this.searchQuery;
    }

    this.apiService.get<User[]>('/auth/admin/users/', params).subscribe({
      next: (users) => {
        this.users = users;
        this.filterUsers();
        this.loading = false;
      },
      error: (error) => {
        this.toastr.error('Failed to load users', 'Error');
        this.loading = false;
      }
    });
  }

  filterUsers(): void {
    let filtered = [...this.users];
    
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(user =>
        user.username.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        (user.first_name && user.first_name.toLowerCase().includes(query)) ||
        (user.last_name && user.last_name.toLowerCase().includes(query)) ||
        (user.phone && user.phone.toLowerCase().includes(query))
      );
    }

    if (this.roleFilter) {
      filtered = filtered.filter(user => user.role === this.roleFilter);
    }

    this.filteredUsers = filtered;
  }

  toggleUserStatus(user: User): void {
    const action = user.is_active ? 'deactivate' : 'activate';
    if (!confirm(`Are you sure you want to ${action} ${user.email}?`)) {
      return;
    }

    this.apiService.post<User>(`/auth/admin/users/${user.id}/toggle-status/`, {}).subscribe({
      next: (updatedUser) => {
        const index = this.users.findIndex(u => u.id === user.id);
        if (index !== -1) {
          this.users[index] = updatedUser;
        }
        this.filterUsers();
        this.toastr.success(`User ${action}d successfully`, 'Success');
      },
      error: () => {
        this.toastr.error(`Failed to ${action} user`, 'Error');
      }
    });
  }

  getUsersByRole(role: string): User[] {
    return this.users.filter(u => u.role === role);
  }

  getActiveUsersByRole(role: string): number {
    return this.users.filter(u => u.role === role && u.is_active).length;
  }

  get activeUsers(): number {
    return this.users.filter(u => u.is_active).length;
  }

  getUserDisplayName(user: User): string {
    if (user.first_name || user.last_name) {
      return `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.username;
    }
    return user.username;
  }

  getUserInitials(user: User): string {
    const name = this.getUserDisplayName(user);
    const parts = name.split(' ');
    if (parts.length > 1) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  formatDate(dateString: string): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  }

  openEditModal(user: User): void {
    this.selectedUser = { ...user };
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.selectedUser = null;
  }

  saveUser(): void {
    if (!this.selectedUser) return;
    
    this.saving = true;
    this.apiService.put<User>(`/auth/admin/users/${this.selectedUser.id}/`, {
      email: this.selectedUser.email,
      phone: this.selectedUser.phone,
      first_name: this.selectedUser.first_name,
      last_name: this.selectedUser.last_name,
      role: this.selectedUser.role,
      is_active: this.selectedUser.is_active
    }).subscribe({
      next: (updatedUser) => {
        const index = this.users.findIndex(u => u.id === updatedUser.id);
        if (index !== -1) {
          this.users[index] = updatedUser;
        }
        this.filterUsers();
        this.closeEditModal();
        this.toastr.success('User updated successfully', 'Success');
        this.saving = false;
      },
      error: (error) => {
        console.error('Error updating user:', error);
        this.toastr.error(error?.error?.detail || 'Failed to update user', 'Error');
        this.saving = false;
      }
    });
  }
}


