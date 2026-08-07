import { Component, Input, ElementRef, OnChanges, SimpleChanges, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BloomMasteryPoint } from '../../../core/models';

@Component({
  selector: 'app-radar-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="radar-container">
      <svg #radarSvg [attr.width]="size" [attr.height]="size" [attr.viewBox]="'0 0 ' + size + ' ' + size">
        <!-- Grid levels -->
        <g *ngFor="let level of gridLevels" class="radar-grid">
          <polygon
            [attr.points]="getGridPoints(level)"
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            stroke-width="1"
          />
        </g>

        <!-- Axis lines -->
        <g *ngFor="let point of data; let i = index" class="radar-axis">
          <line
            [attr.x1]="center"
            [attr.y1]="center"
            [attr.x2]="getAxisEndpoint(i).x"
            [attr.y2]="getAxisEndpoint(i).y"
            stroke="rgba(255,255,255,0.06)"
            stroke-width="1"
          />
          <!-- Labels -->
          <text
            [attr.x]="getLabelPosition(i).x"
            [attr.y]="getLabelPosition(i).y"
            fill="var(--uamp-text-muted)"
            font-size="11"
            font-family="var(--uamp-font-body)"
            text-anchor="middle"
            dominant-baseline="middle"
          >
            {{ point.axis }}
          </text>
        </g>

        <!-- Data polygon -->
        <polygon
          [attr.points]="getDataPoints()"
          fill="rgba(99, 102, 241, 0.2)"
          stroke="var(--uamp-accent-primary)"
          stroke-width="2"
          class="radar-data"
        />

        <!-- Data points -->
        <g *ngFor="let point of data; let i = index">
          <circle
            [attr.cx]="getDataPoint(i).x"
            [attr.cy]="getDataPoint(i).y"
            r="4"
            [attr.fill]="point.masteryPct < 60 ? 'var(--uamp-accent-warning)' : 'var(--uamp-accent-primary)'"
            stroke="var(--uamp-bg-base)"
            stroke-width="2"
            class="radar-dot"
          />
          <!-- Weak-area glow -->
          <circle
            *ngIf="point.masteryPct < 60"
            [attr.cx]="getDataPoint(i).x"
            [attr.cy]="getDataPoint(i).y"
            r="8"
            fill="var(--uamp-accent-warning)"
            opacity="0.25"
            filter="blur(3px)"
          />
        </g>
      </svg>
    </div>
  `,
  styles: [`
    .radar-container {
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .radar-data {
      transition: all 500ms var(--uamp-ease-emphasized);
    }

    .radar-dot {
      transition: all 300ms var(--uamp-ease-standard);
      cursor: pointer;
    }

    .radar-dot:hover {
      r: 6;
    }
  `]
})
export class RadarChartComponent implements OnChanges {
  @Input() data: BloomMasteryPoint[] = [];
  @Input() size = 300;

  center = 150;
  radius = 110;
  gridLevels = [0.2, 0.4, 0.6, 0.8, 1.0];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['size']) {
      this.center = this.size / 2;
      this.radius = (this.size / 2) - 40;
    }
  }

  getGridPoints(level: number): string {
    if (!this.data.length) return '';
    const points = this.data.map((_, i) => {
      const angle = (Math.PI * 2 * i) / this.data.length - Math.PI / 2;
      const r = this.radius * level;
      return `${this.center + r * Math.cos(angle)},${this.center + r * Math.sin(angle)}`;
    });
    return points.join(' ');
  }

  getAxisEndpoint(index: number): { x: number; y: number } {
    const angle = (Math.PI * 2 * index) / this.data.length - Math.PI / 2;
    return {
      x: this.center + this.radius * Math.cos(angle),
      y: this.center + this.radius * Math.sin(angle),
    };
  }

  getLabelPosition(index: number): { x: number; y: number } {
    const angle = (Math.PI * 2 * index) / this.data.length - Math.PI / 2;
    const labelR = this.radius + 24;
    return {
      x: this.center + labelR * Math.cos(angle),
      y: this.center + labelR * Math.sin(angle),
    };
  }

  getDataPoint(index: number): { x: number; y: number } {
    const point = this.data[index];
    const angle = (Math.PI * 2 * index) / this.data.length - Math.PI / 2;
    const r = this.radius * (point.masteryPct / 100);
    return {
      x: this.center + r * Math.cos(angle),
      y: this.center + r * Math.sin(angle),
    };
  }

  getDataPoints(): string {
    if (!this.data.length) return '';
    return this.data.map((_, i) => {
      const pt = this.getDataPoint(i);
      return `${pt.x},${pt.y}`;
    }).join(' ');
  }
}
