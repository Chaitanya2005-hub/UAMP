import { Routes } from '@angular/router';

export const teacherRoutes: Routes = [
  { path: 'schedule', loadComponent: () => import('./exam-schedule/exam-schedule.component').then(m => m.ExamScheduleComponent) },
  {
    path: 'question-paper',
    children: [
      { 
        path: 'upload', 
        loadComponent: () => import('./question-paper/upload-parser/upload-parser.component').then(m => m.UploadParserComponent)
      },
      { 
        path: 'mcq-builder', 
        loadComponent: () => import('./question-paper/mcq-builder/mcq-builder.component').then(m => m.McqBuilderComponent)
      },
      { 
        path: 'ai-generator', 
        loadComponent: () => import('./question-paper/ai-generator/ai-generator.component').then(m => m.AiGeneratorComponent)
      },
      { path: '', redirectTo: 'upload', pathMatch: 'full' }
    ]
  },
  {
    path: 'monitoring',
    children: [
      { 
        path: 'live-proctoring', 
        loadComponent: () => import('./monitoring/live-proctoring/live-proctoring.component').then(m => m.LiveProctoringComponent)
      },
      { 
        path: 'incident-timeline', 
        loadComponent: () => import('./monitoring/incident-timeline/incident-timeline.component').then(m => m.IncidentTimelineComponent)
      },
      { path: '', redirectTo: 'live-proctoring', pathMatch: 'full' }
    ]
  },
  { path: '', redirectTo: 'question-paper/upload', pathMatch: 'full' }
];
