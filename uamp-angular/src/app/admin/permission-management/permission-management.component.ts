import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environment';

export interface UserPermission {
  permission_code: string;
  granted_by: string;
  created_at: string;
}

export interface AvailablePermission {
  code: string;
  name: string;
  description: string;
}

@Component({
  selector: 'app-permission-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="permission-management">
      <div class="page-header">
        <h1>🔐 Permission Management</h1>
        <p>Manage fine-grained permissions for users</p>
      </div>

      <div class="user-selector">
        <label>Select User:</label>
        <select [(ngModel)]="selectedUserId" (change)="loadUserPermissions()" class="user-select">
          <option value="">-- Select a user --</option>
          <option *ngFor="let user of users()" [value]="user.id">
            {{ user.full_name }} ({{ user.email }})
          </option>
        </select>
      </div>

      <div *ngIf="selectedUserId" class="permissions-content">
        <div class="current-permissions glass-panel">
          <h3>Current Permissions</h3>
          <div *ngIf="userPermissions().length > 0" class="permissions-list">
            <div *ngFor="let perm of userPermissions()" class="permission-item">
              <div class="permission-info">
                <span class="permission-code">{{ perm.permission_code }}</span>
                <span class="permission-meta">
                  Granted by: {{ perm.granted_by }} | {{ formatDate(perm.created_at) }}
                </span>
              </div>
              <button
                (click)="removePermission(perm.permission_code)"
                class="remove-btn"
              >
                Remove
              </button>
            </div>
          </div>
          <div *ngIf="userPermissions().length === 0" class="no-permissions">
            <p>No custom permissions assigned</p>
          </div>
        </div>

        <div class="available-permissions glass-panel">
          <h3>Available Permissions</h3>
          <div class="permissions-grid">
            <div
              *ngFor="let perm of availablePermissions()"
              class="permission-card"
              [class.assigned]="hasPermission(perm.code)"
            >
              <div class="permission-card-header">
                <span class="permission-name">{{ perm.name }}</span>
                <span class="permission-code-badge">{{ perm.code }}</span>
              </div>
              <p class="permission-description">{{ perm.description }}</p>
              <button
                (click)="togglePermission(perm.code)"
                [class.add-btn]="!hasPermission(perm.code)"
                [class.remove-btn]="hasPermission(perm.code)"
              >
                {{ hasPermission(perm.code) ? 'Remove' : 'Add' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div *ngIf="loading()" class="loading">
        <p>Loading permissions...</p>
      </div>

      <div *ngIf="error()" class="error">
        <p>{{ error() }}</p>
      </div>
    </div>
  `,
  styles: [`
    .permission-management {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .page-header {
      margin-bottom: 2rem;
    }

    .page-header h1 {
      margin: 0 0 0.5rem 0;
      color: #e6ebf5;
      font-size: 2rem;
    }

    .page-header p {
      margin: 0;
      color: #94a3b8;
    }

    .user-selector {
      margin-bottom: 2rem;
    }

    .user-selector label {
      display: block;
      color: #94a3b8;
      font-size: 0.875rem;
      margin-bottom: 8px;
    }

    .user-select {
      width: 100%;
      max-width: 400px;
      padding: 10px 12px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 6px;
      color: #e6ebf5;
      font-size: 0.875rem;
    }

    .permissions-content {
      display: grid;
      grid-template-columns: 1fr 2fr;
      gap: 2rem;
    }

    .glass-panel {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 1.5rem;
      backdrop-filter: blur(10px);
    }

    .glass-panel h3 {
      margin: 0 0 1rem 0;
      color: #e6ebf5;
      font-size: 1.25rem;
    }

    .permissions-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .permission-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem;
      background: rgba(255, 255, 255, 0.03);
      border-radius: 6px;
    }

    .permission-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .permission-code {
      color: #e6ebf5;
      font-weight: 500;
      font-size: 0.875rem;
    }

    .permission-meta {
      color: #94a3b8;
      font-size: 0.75rem;
    }

    .remove-btn {
      background: rgba(239, 68, 68, 0.2);
      color: #ef4444;
      border: none;
      padding: 6px 12px;
      border-radius: 4px;
      font-size: 0.75rem;
      cursor: pointer;
    }

    .permissions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 1rem;
    }

    .permission-card {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 8px;
      padding: 1rem;
      transition: all 0.2s ease;
    }

    .permission-card.assigned {
      border-color: rgba(99, 102, 241, 0.3);
      background: rgba(99, 102, 241, 0.05);
    }

    .permission-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .permission-name {
      color: #e6ebf5;
      font-weight: 500;
      font-size: 0.875rem;
    }

    .permission-code-badge {
      background: rgba(99, 102, 241, 0.2);
      color: #6366f1;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 0.7rem;
    }

    .permission-description {
      color: #94a3b8;
      font-size: 0.75rem;
      margin-bottom: 1rem;
      line-height: 1.4;
    }

    .add-btn {
      background: rgba(99, 102, 241, 0.2);
      color: #6366f1;
      border: none;
      padding: 6px 12px;
      border-radius: 4px;
      font-size: 0.75rem;
      cursor: pointer;
      width: 100%;
    }

    .add-btn:hover {
      background: rgba(99, 102, 241, 0.3);
    }

    .no-permissions {
      text-align: center;
      padding: 2rem;
      color: #94a3b8;
    }

    .loading, .error {
      text-align: center;
      padding: 4rem;
      color: #94a3b8;
    }

    .error {
      color: #ef4444;
    }

    @media (max-width: 768px) {
      .permissions-content {
        grid-template-columns: 1fr;
      }

      .permissions-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class PermissionManagementComponent implements OnInit {
  users = signal<any[]>([]);
  selectedUserId = signal('');
  userPermissions = signal<UserPermission[]>([]);
  availablePermissions = signal<AvailablePermission[]>([
    { code: 'exam:force_submit', name: 'Force Submit Exam', description: 'Ability to force submit any exam attempt' },
    { code: 'proctoring:view_all', name: 'View All Proctoring', description: 'View proctoring feeds for all exams' },
    { code: 'exam:schedule_any', name: 'Schedule Any Exam', description: 'Schedule exams for any course' },
    { code: 'grade:override', name: 'Override Grades', description: 'Override any grade regardless of permissions' },
    { code: 'user:impersonate', name: 'Impersonate Users', description: 'Impersonate any user in the system' },
    { code: 'audit:delete', name: 'Delete Audit Logs', description: 'Delete audit log entries' }
  ]);
  loading = signal(false);
  error = signal('');

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    const token = localStorage.getItem('auth_token');
    this.http.get<any[]>(`${environment.apiBaseUrl}/users`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).subscribe({
      next: (data) => {
        this.users.set(data);
      },
      error: (err) => {
        this.error.set('Failed to load users');
        console.error('Failed to load users:', err);
      }
    });
  }

  loadUserPermissions(): void {
    if (!this.selectedUserId()) return;

    this.loading.set(true);
    const token = localStorage.getItem('auth_token');

    this.http.get<UserPermission[]>(`${environment.apiBaseUrl}/users/${this.selectedUserId()}/permissions`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).subscribe({
      next: (data) => {
        this.userPermissions.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load permissions');
        this.loading.set(false);
        console.error('Failed to load permissions:', err);
      }
    });
  }

  hasPermission(code: string): boolean {
    return this.userPermissions().some(perm => perm.permission_code === code);
  }

  addPermission(code: string): void {
    if (!this.selectedUserId()) return;

    const token = localStorage.getItem('auth_token');
    this.loading.set(true);

    this.http.post(`${environment.apiBaseUrl}/users/${this.selectedUserId()}/permissions`, {
      permission_code: code
    }, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).subscribe({
      next: () => {
        this.loadUserPermissions();
      },
      error: (err) => {
        this.error.set('Failed to add permission');
        this.loading.set(false);
        console.error('Failed to add permission:', err);
      }
    });
  }

  removePermission(code: string): void {
    if (!this.selectedUserId()) return;

    const token = localStorage.getItem('auth_token');
    this.loading.set(true);

    this.http.delete(`${environment.apiBaseUrl}/users/${this.selectedUserId()}/permissions/${code}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).subscribe({
      next: () => {
        this.loadUserPermissions();
      },
      error: (err) => {
        this.error.set('Failed to remove permission');
        this.loading.set(false);
        console.error('Failed to remove permission:', err);
      }
    });
  }

  togglePermission(code: string): void {
    if (this.hasPermission(code)) {
      this.removePermission(code);
    } else {
      this.addPermission(code);
    }
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleString();
  }
}