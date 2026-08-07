import { Component, Input, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'warning';
type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-button, button[app-button]',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [class]="classes"
      [disabled]="disabled"
      [attr.type]="type"
      (click)="handleClick($event)">
      <ng-content></ng-content>
    </button>
  `,
  styles: [`
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      border-radius: 8px;
      font-weight: 500;
      font-size: 1rem;
      cursor: pointer;
      border: none;
      transition: all 0.15s ease;
      font-family: inherit;
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    /* Variants */
    .btn-primary {
      background: #6366f1;
      color: white;
    }

    .btn-primary:hover:not(:disabled) {
      background: #5558e3;
      transform: translateY(-1px);
    }

    .btn-secondary {
      background: rgba(255, 255, 255, 0.08);
      color: #e6ebf5;
      border: 1px solid rgba(255, 255, 255, 0.14);
    }

    .btn-secondary:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.12);
    }

    .btn-danger {
      background: rgba(248, 113, 113, 0.1);
      color: #f87171;
      border: 1px solid rgba(248, 113, 113, 0.3);
    }

    .btn-danger:hover:not(:disabled) {
      background: rgba(248, 113, 113, 0.2);
    }

    .btn-success {
      background: rgba(52, 211, 153, 0.1);
      color: #34d399;
      border: 1px solid rgba(52, 211, 153, 0.3);
    }

    .btn-success:hover:not(:disabled) {
      background: rgba(52, 211, 153, 0.2);
    }

    .btn-warning {
      background: rgba(251, 191, 36, 0.1);
      color: #fbbf24;
      border: 1px solid rgba(251, 191, 36, 0.3);
    }

    .btn-warning:hover:not(:disabled) {
      background: rgba(251, 191, 36, 0.2);
    }

    /* Sizes */
    .btn-sm {
      padding: 0.5rem 1rem;
      font-size: 0.875rem;
    }

    .btn-md {
      padding: 0.75rem 1.5rem;
      font-size: 1rem;
    }

    .btn-lg {
      padding: 1rem 2rem;
      font-size: 1.125rem;
    }

    .btn-block {
      width: 100%;
    }
  `]
})
export class ButtonComponent {
  @Input() variant: ButtonVariant = 'primary';
  @Input() size: ButtonSize = 'md';
  @Input() disabled = false;
  @Input() type: 'button' | 'submit' | 'reset' = 'button';
  @Input() block = false;

  @HostBinding('class.btn-block') get isBlock() { return this.block; }

  get classes(): string {
    const classes = ['btn'];
    classes.push(`btn-${this.variant}`);
    classes.push(`btn-${this.size}`);
    return classes.join(' ');
  }

  handleClick(event: Event): void {
    if (this.disabled) {
      event.preventDefault();
      event.stopPropagation();
    }
  }
}