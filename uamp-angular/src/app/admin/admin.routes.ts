import { Routes } from '@angular/router';

export const adminRoutes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () => import('./admin-dashboard/admin-dashboard.component').then(m => m.AdminDashboardComponent)
  },
  {
    path: 'exams',
    loadComponent: () => import('./manage-exams/manage-exams.component').then(m => m.ManageExamsComponent)
  },
  {
    path: 'permissions',
    loadComponent: () => import('./permission-management/permission-management.component').then(m => m.PermissionManagementComponent)
  },
  {
    path: 'approvals',
    loadComponent: () => import('./approvals/approvals.component').then(m => m.ApprovalsComponent)
  },
  {
    path: 'schedule',
    loadComponent: () => import('../teacher/exam-schedule/exam-schedule.component').then(m => m.ExamScheduleComponent)
  },
  {
    path: 'live-audit',
    loadComponent: () => import('./live-audit-dashboard/live-audit-dashboard.component').then(m => m.LiveAuditDashboardComponent)
  },
  {
    path: 'live-proctoring',
    loadComponent: () => import('../teacher/monitoring/live-proctoring/live-proctoring.component').then(m => m.LiveProctoringComponent)
  },
  {
    path: 'intervention',
    loadComponent: () => import('./intervention-controls/intervention-controls.component').then(m => m.InterventionControlsComponent)
  },
  {
    path: 'audit-trail',
    loadComponent: () => import('./audit-trail/audit-trail.component').then(m => m.AuditTrailComponent)
  },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
];