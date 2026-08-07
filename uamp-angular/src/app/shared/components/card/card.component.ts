import { Component, Input, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class]="classes" [class.clickable]="clickable" (click)="handleClick()">
      <div class="card-header" *ngIf="header || hasHeaderContent">
        <ng-content select="[card-header], [cardHeader]"></ng-content>
        <h3 *ngIf="header && !hasHeaderContent">{{ header }}</h3>
      </div>
      
      <div class="card-body">
        <ng-content></ng-content>
      </div>
      
      <div class="card-footer" *ngIf="footer || hasFooterContent">
        <ng-content select="[card-footer], [cardFooter]"></ng-content>
        <div *ngIf="footer && !hasFooterContent">{{ footer }}</div>
      </div>
    </div>
  `,
  styles: [`
    .card {
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.14);
      border-radius: 14px;
      padding: 1.5rem;
      transition: all 0.15s ease;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
    }

    .card:hover {
      background: rgba(255, 255, 255, 0.08);
    }

    .card.clickable {
      cursor: pointer;
    }

    .card.clickable:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
    }

    .card-header {
      margin-bottom: 1rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }

    .card-header h3 {
      margin: 0;
      color: #e6ebf5;
      font-size: 1.25rem;
      font-weight: 600;
    }

    .card-body {
      color: #94a3b8;
      line-height: 1.6;
    }

    .card-footer {
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      color: #94a3b8;
      font-size: 0.875rem;
    }

    /* Variants */
    .card.glass {
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.14);
      backdrop-filter: blur(18px) saturate(140%);
    }

    .card.elevated {
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.37);
    }

    .card.outlined {
      background: transparent;
      border: 2px solid rgba(255, 255, 255, 0.14);
    }

    .card.flat {
      box-shadow: none;
      border: none;
      background: rgba(255, 255, 255, 0.04);
    }
  `]
})
export class CardComponent {
  @Input() header?: string;
  @Input() footer?: string;
  @Input() variant: 'default' | 'glass' | 'elevated' | 'outlined' | 'flat' = 'default';
  @Input() clickable = false;

  @HostBinding('class') get hostClasses() {
    return `card card-${this.variant}`;
  }

  get classes(): string {
    return `card card-${this.variant}`;
  }

  hasHeaderContent = false;
  hasFooterContent = false;

  ngAfterContentChecked(): void {
    // Check if header content exists
    this.hasHeaderContent = false;
    this.hasFooterContent = false;
  }

  handleClick(): void {
    if (this.clickable) {
      // Emit click event or handle navigation
      console.log('Card clicked');
    }
  }
}