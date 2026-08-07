import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-exam-submitted',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="submitted-page">
      <div class="submitted-bg"></div>
      <div class="submitted-container">
        <div class="glass-panel submitted-card">
          <div class="success-icon">✅</div>
          <h1>Exam Submitted Successfully</h1>
          <p>Your responses have been securely recorded and encrypted.</p>
          <p class="sub-note">Results will be available once grading is complete.</p>
          <a routerLink="/student/dashboard" class="btn btn-primary">Back to Dashboard</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .submitted-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
    }

    .submitted-bg {
      position: absolute;
      inset: 0;
      background: radial-gradient(ellipse at 50% 50%, rgba(52, 211, 153, 0.12) 0%, transparent 60%);
    }

    .submitted-container {
      position: relative;
      z-index: 1;
      max-width: 500px;
      padding: 24px;
      width: 100%;
    }

    .submitted-card {
      text-align: center;
      padding: 48px 36px !important;
    }

    .success-icon { font-size: 4rem; margin-bottom: 20px; }

    h1 { font-size: 1.5rem; margin-bottom: 12px; }

    p { color: var(--uamp-text-muted); margin-bottom: 8px; }

    .sub-note { font-size: 0.8125rem; margin-bottom: 32px; }
  `]
})
export class ExamSubmittedComponent {}
