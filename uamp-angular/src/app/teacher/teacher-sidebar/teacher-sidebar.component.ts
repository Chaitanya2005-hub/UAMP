import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-teacher-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <aside class="teacher-sidebar">
      <div class="sidebar-header">
        <div class="logo">👨‍🏫 UAMP Teacher</div>
        <div class="subtitle">Faculty Portal</div>
      </div>

      <nav class="sidebar-nav">
        <a
          routerLink="/teacher/scheduled-exams"
          routerLinkActive="active"
          class="nav-item"
        >
          <span class="nav-icon">📅</span>
          <span class="nav-text">Scheduled Exams</span>
        </a>

        <a
          routerLink="/teacher/question-paper"
          routerLinkActive="active"
          class="nav-item"
        >
          <span class="nav-icon">📝</span>
          <span class="nav-text">Question Papers</span>
        </a>

        <a
          routerLink="/teacher/monitoring"
          routerLinkActive="active"
          class="nav-item"
        >
          <span class="nav-icon">📹</span>
          <span class="nav-text">Monitoring</span>
        </a>
      </nav>

      <div class="sidebar-footer">
        <a routerLink="/auth/login" class="logout-btn">
          <span class="nav-icon">🚪</span>
          <span class="nav-text">Logout</span>
        </a>
      </div>
    </aside>
  `,
  styles: [`
    .teacher-sidebar {
      position: fixed;
      top: 0;
      left: 0;
      width: 280px;
      height: 100vh;
      background: rgba(15, 23, 42, 0.95);
      border-right: 1px solid rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
      display: flex;
      flex-direction: column;
      z-index: 1000;
    }

    .sidebar-header {
      padding: 24px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .logo {
      font-size: 1.5rem;
      font-weight: 700;
      color: #e6ebf5;
      margin-bottom: 4px;
    }

    .subtitle {
      font-size: 0.75rem;
      color: #94a3b8;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .sidebar-nav {
      flex: 1;
      padding: 16px 12px;
      overflow-y: auto;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      border-radius: 8px;
      color: #94a3b8;
      text-decoration: none;
      transition: all 0.2s ease;
      margin-bottom: 4px;
    }

    .nav-item:hover {
      background: rgba(255, 255, 255, 0.05);
      color: #e6ebf5;
    }

    .nav-item.active {
      background: rgba(99, 102, 241, 0.2);
      color: #6366f1;
      font-weight: 500;
    }

    .nav-icon {
      font-size: 1.25rem;
    }

    .nav-text {
      font-size: 0.875rem;
      font-weight: 500;
    }

    .sidebar-footer {
      padding: 16px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }

    .logout-btn {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      border-radius: 8px;
      color: #f87171;
      text-decoration: none;
      transition: all 0.2s ease;
    }

    .logout-btn:hover {
      background: rgba(248, 113, 113, 0.1);
    }

    @media (max-width: 768px) {
      .teacher-sidebar {
        width: 240px;
      }

      .sidebar-header {
        padding: 16px;
      }

      .logo {
        font-size: 1.25rem;
      }

      .nav-text {
        display: none;
      }

      .nav-item {
        justify-content: center;
        padding: 12px;
      }
    }
  `]
})
export class TeacherSidebarComponent implements OnInit {
  constructor(private router: Router) {}

  ngOnInit(): void {}
}