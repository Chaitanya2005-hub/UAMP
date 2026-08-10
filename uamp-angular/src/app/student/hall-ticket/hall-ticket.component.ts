import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-hall-ticket',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container">
      <div class="page-header">
        <h1>🎟 Hall Ticket</h1>
        <p>Download your exam hall ticket</p>
      </div>
      <div class="glass-panel" style="padding: 32px;">
        <div class="hall-ticket-content">
          <p *ngIf="loading()">Loading hall ticket...</p>
          <p *ngIf="error()" class="error">{{error()}}</p>
          <div *ngIf="!loading() && !error() && !hallTicketBlob()" class="no-ticket">
            <p>No hall ticket available for this exam.</p>
          </div>
          <div *ngIf="hallTicketBlob()" class="ticket-actions">
            <p>Your hall ticket is ready for download.</p>
            <button (click)="downloadTicket()" class="btn btn-primary">
              📥 Download Hall Ticket (PDF)
            </button>
            <button (click)="printTicket()" class="btn btn-secondary" style="margin-left: 10px;">
              🖨 Print Hall Ticket
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .glass-panel {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      backdrop-filter: blur(10px);
    }

    .hall-ticket-content {
      text-align: center;
      padding: 24px 0;
    }

    .ticket-actions p {
      color: var(--uamp-text-muted);
      margin-bottom: 24px;
    }

    .error {
      color: #ef4444;
      margin-bottom: 16px;
    }

    .no-ticket p {
      color: var(--uamp-text-muted);
    }

    .btn-primary {
      background: linear-gradient(135deg, var(--uamp-accent-primary), var(--uamp-accent-secondary));
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
    }

    .btn-secondary {
      background: #6b7280;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 6px;
      cursor: pointer;
    }

    .btn-secondary:hover {
      background: #4b5563;
    }
  `]
})
export class HallTicketComponent implements OnInit {
  hallTicketBlob = signal<Blob | null>(null);
  loading = signal(true);
  error = signal('');

  constructor(
    private route: ActivatedRoute,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    const examId = this.route.snapshot.paramMap.get('examId');
    if (examId) {
      // Get auth token
      const token = localStorage.getItem('auth_token');

      this.http.get(`${environment.apiBaseUrl}/hall-tickets/${examId}/pdf`, {
        responseType: 'blob',
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        }
      }).subscribe({
        next: (blob) => {
          this.hallTicketBlob.set(blob);
          this.loading.set(false);
        },
        error: (err) => {
          this.error.set('Failed to load hall ticket. Please try again.');
          this.loading.set(false);
          console.error('Hall ticket error:', err);
        }
      });
    } else {
      this.error.set('Invalid exam ID');
      this.loading.set(false);
    }
  }

  downloadTicket(): void {
    const blob = this.hallTicketBlob();
    const examId = this.route.snapshot.paramMap.get('examId');
    if (blob) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `hall-ticket-${examId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }

  printTicket(): void {
    const blob = this.hallTicketBlob();
    if (blob) {
      const url = URL.createObjectURL(blob);
      const printWindow = window.open(url, '_blank');
      if (printWindow) {
        // The browser's PDF viewer will handle printing
        setTimeout(() => {
          printWindow.print();
        }, 1000);
      }
    }
  }
}
