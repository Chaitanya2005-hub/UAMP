import { Routes } from '@angular/router';

export const adminRoutes: Routes = [
  { 
    path: 'approvals', 
    loadComponent: () => import('./approvals/approvals.component').then(m => m.ApprovalsComponent)
  },
  { 
    path: 'exams', 
    loadComponent: () => import('./manage-exams/manage-exams.component').then(m => m.ManageExamsComponent)
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
    path: 'intervention', 
    loadComponent: () => import('./intervention-controls/intervention-controls.component').then(m => m.InterventionControlsComponent)
  },
  { 
    path: 'audit-trail', 
    loadComponent: () => import('./audit-trail/audit-trail.component').then(m => m.AuditTrailComponent)
  },
  { path: '', redirectTo: 'approvals', pathMatch: 'full' }
];