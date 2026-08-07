import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="not-found-page">
      <div class="glass-panel not-found-card">
        <div class="not-found-icon">404</div>
        <h1>Page Not Found</h1>
        <p>The page you're looking for doesn't exist or has been moved.</p>
        <a routerLink="/auth/login" class="btn btn-primary">Go to Login</a>
      </div>
    </div>
  `,
  styles: [`
    .not-found-page {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      padding: 24px;
    }

    .not-found-card {
      text-align: center;
      padding: 48px;
      max-width: 480px;
    }

    .not-found-icon {
      font-family: var(--uamp-font-display);
      font-size: 5rem;
      font-weight: 700;
      background: linear-gradient(135deg, var(--uamp-accent-primary), var(--uamp-accent-secondary));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      margin-bottom: 16px;
    }

    h1 {
      font-size: 1.5rem;
      margin-bottom: 12px;
    }

    p {
      color: var(--uamp-text-muted);
      margin-bottom: 32px;
    }
  `]
})
export class NotFoundComponent {}
