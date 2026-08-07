import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-glass-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="glass-panel"
      [class.glass-panel--static]="!hoverable"
      [ngStyle]="{ padding: padding }"
    >
      <ng-content />
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class GlassPanelComponent {
  @Input() hoverable = true;
  @Input() padding = '24px';
}
