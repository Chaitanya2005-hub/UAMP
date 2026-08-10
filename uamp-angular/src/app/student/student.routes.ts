import { Routes } from '@angular/router';
import { examTimeWindowGuard } from '../core/guards/exam-time-window.guard';

export const studentRoutes: Routes = [
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'mastery',
    loadComponent: () => import('./mastery-analytics/mastery-analytics.component').then(m => m.MasteryAnalyticsComponent)
  },
  {
    path: 'exam/:examId/lobby',
    loadComponent: () => import('./exam/exam-lobby/exam-lobby.component').then(m => m.ExamLobbyComponent)
  },
  {
    path: 'exam/:examId/runner',
    loadComponent: () => import('./exam/exam-runner/exam-runner.component').then(m => m.ExamRunnerComponent),
    canActivate: [examTimeWindowGuard]
  },
  {
    path: 'exam/:examId/submitted',
    loadComponent: () => import('./exam/exam-submitted/exam-submitted.component').then(m => m.ExamSubmittedComponent)
  },
  {
    path: 'hall-ticket/:examId',
    loadComponent: () => import('./hall-ticket/hall-ticket.component').then(m => m.HallTicketComponent)
  },
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
];
