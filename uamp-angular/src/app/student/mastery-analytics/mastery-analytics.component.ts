import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RadarChartComponent } from '../../shared/components/radar-chart/radar-chart.component';
import { environment } from '../../../environments/environment';
import { BloomMasteryPoint } from '../../core/models/exam.model';

@Component({
  selector: 'app-mastery-analytics',
  standalone: true,
  imports: [CommonModule, RadarChartComponent],
  template: `
    <div class="mastery-analytics-container">
      <div class="page-header">
        <h1>📊 Bloom's Taxonomy Mastery Analytics</h1>
        <p>Understand your cognitive strengths and areas for improvement</p>
      </div>

      <div class="analytics-content" *ngIf="!loading()">
        <div class="radar-section">
          <div class="glass-panel">
            <h3>Mastery Radar Chart</h3>
            <div class="radar-wrapper">
              <app-radar-chart
                [data]="masteryData()"
                [size]="400"
              ></app-radar-chart>
            </div>
            <div class="radar-legend">
              <div class="legend-item">
                <div class="legend-dot good"></div>
                <span>Strong (60%+)</span>
              </div>
              <div class="legend-item">
                <div class="legend-dot weak"></div>
                <span>Needs Improvement (&lt;60%)</span>
              </div>
            </div>
          </div>
        </div>

        <div class="details-section">
          <div class="glass-panel">
            <h3>Detailed Breakdown</h3>
            <div class="mastery-grid">
              <div
                *ngFor="let point of masteryData()"
                class="mastery-item"
                [class.weak]="point.masteryPct < 60"
              >
                <div class="mastery-header">
                  <span class="mastery-axis">{{ point.axis }}</span>
                  <span class="mastery-score" [class.weak]="point.masteryPct < 60">
                    {{ point.masteryPct.toFixed(1) }}%
                  </span>
                </div>
                <div class="mastery-bar">
                  <div
                    class="mastery-fill"
                    [style.width.%]="point.masteryPct"
                    [class.weak]="point.masteryPct < 60"
                  ></div>
                </div>
                <div class="mastery-meta">
                  <span>{{ point.questionCount }} questions attempted</span>
                </div>
                <div class="mastery-suggestion" *ngIf="point.masteryPct < 60">
                  💡 Focus on {{ point.axis.toLowerCase() }} skills through practice exercises
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="recommendations-section" *ngIf="hasWeakAreas()">
          <div class="glass-panel">
            <h3>🎯 Personalized Recommendations</h3>
            <div class="recommendations-list">
              <div
                *ngFor="let weakArea of weakAreas()"
                class="recommendation-item"
              >
                <div class="recommendation-icon">📚</div>
                <div class="recommendation-content">
                  <h4>{{ weakArea.axis }} Mastery</h4>
                  <p>Your current score is {{ weakArea.masteryPct.toFixed(1) }}%. We recommend focusing on exercises that develop {{ weakArea.axis.toLowerCase() }} thinking skills.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div *ngIf="loading()" class="loading">
        <p>Loading mastery analytics...</p>
      </div>

      <div *ngIf="error()" class="error">
        <p>{{ error() }}</p>
      </div>
    </div>
  `,
  styles: [`
    .mastery-analytics-container {
      padding: 2rem;
      max-width: 1400px;
      margin: 0 auto;
    }

    .page-header {
      margin-bottom: 2rem;
    }

    .page-header h1 {
      margin: 0 0 0.5rem 0;
      color: #e6ebf5;
      font-size: 2rem;
    }

    .page-header p {
      margin: 0;
      color: #94a3b8;
    }

    .analytics-content {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
    }

    .radar-section {
      grid-column: 1 / -1;
    }

    .glass-panel {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 1.5rem;
      backdrop-filter: blur(10px);
    }

    .glass-panel h3 {
      margin: 0 0 1.5rem 0;
      color: #e6ebf5;
      font-size: 1.25rem;
    }

    .radar-wrapper {
      display: flex;
      justify-content: center;
      margin-bottom: 1.5rem;
    }

    .radar-legend {
      display: flex;
      justify-content: center;
      gap: 2rem;
    }

    .legend-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #94a3b8;
      font-size: 0.875rem;
    }

    .legend-dot {
      width: 12px;
      height: 12px;
      border-radius: 50%;
    }

    .legend-dot.good {
      background: #6366f1;
    }

    .legend-dot.weak {
      background: #f59e0b;
    }

    .mastery-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .mastery-item {
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 8px;
      padding: 1rem;
    }

    .mastery-item.weak {
      border-color: rgba(245, 158, 11, 0.3);
      background: rgba(245, 158, 11, 0.05);
    }

    .mastery-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
    }

    .mastery-axis {
      color: #e6ebf5;
      font-weight: 500;
      font-size: 0.875rem;
    }

    .mastery-score {
      color: #34d399;
      font-weight: 600;
      font-size: 1rem;
    }

    .mastery-score.weak {
      color: #f59e0b;
    }

    .mastery-bar {
      height: 8px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 0.5rem;
    }

    .mastery-fill {
      height: 100%;
      background: linear-gradient(90deg, #6366f1, #8b5cf6);
      border-radius: 4px;
      transition: width 0.5s ease;
    }

    .mastery-fill.weak {
      background: linear-gradient(90deg, #f59e0b, #f97316);
    }

    .mastery-meta {
      color: #94a3b8;
      font-size: 0.75rem;
    }

    .mastery-suggestion {
      margin-top: 0.75rem;
      padding: 0.5rem;
      background: rgba(245, 158, 11, 0.1);
      border-radius: 4px;
      color: #f59e0b;
      font-size: 0.75rem;
    }

    .recommendations-section {
      grid-column: 1 / -1;
    }

    .recommendations-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .recommendation-item {
      display: flex;
      gap: 1rem;
      padding: 1rem;
      background: rgba(255, 255, 255, 0.03);
      border-radius: 8px;
    }

    .recommendation-icon {
      font-size: 1.5rem;
    }

    .recommendation-content h4 {
      margin: 0 0 0.5rem 0;
      color: #e6ebf5;
      font-size: 1rem;
    }

    .recommendation-content p {
      margin: 0;
      color: #94a3b8;
      font-size: 0.875rem;
    }

    .loading, .error {
      text-align: center;
      padding: 4rem;
      color: #94a3b8;
    }

    .error {
      color: #ef4444;
    }

    @media (max-width: 768px) {
      .analytics-content {
        grid-template-columns: 1fr;
      }

      .mastery-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class MasteryAnalyticsComponent implements OnInit {
  masteryData = signal<BloomMasteryPoint[]>([]);
  loading = signal(true);
  error = signal('');

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadMasteryData();
  }

  loadMasteryData(): void {
    const token = localStorage.getItem('auth_token');
    this.http.get<any[]>(`${environment.apiBaseUrl}/student/bloom-mastery`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).subscribe({
      next: (data) => {
        const mappedData = this.mapBloomData(data);
        this.masteryData.set(mappedData);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load mastery analytics. Please try again.');
        this.loading.set(false);
        console.error('Failed to load mastery data:', err);
      }
    });
  }

  mapBloomData(data: any[]): BloomMasteryPoint[] {
    const bloomLevels: Array<'Remember' | 'Understand' | 'Apply' | 'Analyze' | 'Evaluate' | 'Create'> = ['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create'];
    return bloomLevels.map(level => {
      const levelData = data.find(d => d.bloom_level?.toLowerCase() === level.toLowerCase());
      return {
        axis: level,
        masteryPct: levelData?.avg_score || 0,
        questionCount: levelData?.question_count || 0
      };
    });
  }

  hasWeakAreas(): boolean {
    return this.masteryData().some(point => point.masteryPct < 60);
  }

  weakAreas(): BloomMasteryPoint[] {
    return this.masteryData().filter(point => point.masteryPct < 60);
  }
}