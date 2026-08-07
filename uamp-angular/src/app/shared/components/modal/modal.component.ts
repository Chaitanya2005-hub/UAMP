import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-backdrop" *ngIf="isOpen" (click)="onBackdropClick($event)">
      <div class="modal-container glass-panel glass-panel--static" [ngStyle]="{ 'max-width': maxWidth }">
        <div class="modal-header" *ngIf="title">
          <h3>{{ title }}</h3>
          <button class="modal-close" (click)="close.emit()" aria-label="Close modal">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M15 5L5 15M5 5l10 10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <ng-content />
        </div>
        <div class="modal-footer" *ngIf="showFooter">
          <ng-content select="[modal-footer]" />
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      animation: fadeIn 200ms ease-out;
    }

    .modal-container {
      width: 90%;
      padding: 0 !important;
      animation: slideUp 280ms var(--uamp-ease-emphasized);
    }

    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px 24px;
      border-bottom: 1px solid var(--uamp-glass-border);

      h3 {
        font-family: var(--uamp-font-display);
        font-size: 1.125rem;
        font-weight: 600;
      }
    }

    .modal-close {
      background: none;
      border: none;
      color: var(--uamp-text-muted);
      cursor: pointer;
      padding: 4px;
      border-radius: 4px;
      transition: color 150ms, background 150ms;

      &:hover {
        color: var(--uamp-text-primary);
        background: rgba(255, 255, 255, 0.08);
      }
    }

    .modal-body {
      padding: 24px;
    }

    .modal-footer {
      padding: 16px 24px;
      border-top: 1px solid var(--uamp-glass-border);
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes slideUp {
      from { opacity: 0; transform: translateY(20px) scale(0.97); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
  `]
})
export class ModalComponent {
  @Input() isOpen = false;
  @Input() title = '';
  @Input() maxWidth = '560px';
  @Input() showFooter = true;
  @Output() close = new EventEmitter<void>();

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.close.emit();
    }
  }
}
