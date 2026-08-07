import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { GlassPanelComponent } from '../../shared/components/glass-panel/glass-panel.component';
import { ExamService } from '../services/exam.service';

@Component({
  selector: 'app-hall-ticket',
  standalone: true,
  imports: [CommonModule, GlassPanelComponent],
  template: `
    <div class="container">
      <div class="page-header">
        <h1>🎟 Hall Ticket</h1>
        <p>Download your exam hall ticket</p>
      </div>
      <app-glass-panel [hoverable]="false" padding="32px">
        <div class="hall-ticket-content">
          <p *ngIf="!pdfUrl()">Loading hall ticket...</p>
          <div *ngIf="pdfUrl()" class="ticket-actions">
            <p>Your hall ticket is ready for download.</p>
            <a [href]="pdfUrl()" download="hall-ticket.pdf" class="btn btn-primary">
              📥 Download Hall Ticket PDF
            </a>
          </div>
        </div>
      </app-glass-panel>
    </div>
  `,
  styles: [`
    .hall-ticket-content {
      text-align: center;
      padding: 24px 0;
    }

    .ticket-actions p {
      color: var(--uamp-text-muted);
      margin-bottom: 24px;
    }
  `]
})
export class HallTicketComponent implements OnInit {
  pdfUrl = signal<string | null>(null);

  constructor(
    private route: ActivatedRoute,
    private examService: ExamService
  ) {}

  ngOnInit(): void {
    const slotId = this.route.snapshot.paramMap.get('slotId');
    if (slotId) {
      this.examService.getHallTicket(slotId).subscribe({
        next: (blob) => {
          this.pdfUrl.set(URL.createObjectURL(blob));
        },
      });
    }
  }
}
