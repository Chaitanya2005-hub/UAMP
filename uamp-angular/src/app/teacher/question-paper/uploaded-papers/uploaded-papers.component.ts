import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-uploaded-papers', standalone: true, imports: [CommonModule, RouterLink],
  template: `
    <div class="container papers-page"><div class="page-header"><div><h1>Uploaded Papers</h1><p>Question papers you have uploaded or created.</p></div><a routerLink="/teacher/question-paper/upload" class="btn btn-primary">Upload new paper</a></div>
    <section class="glass-panel papers" *ngIf="!loading; else loadingState">
      <div *ngFor="let paper of papers" class="paper">
        <div><h3>{{paper.title}}</h3><p>{{paper.courseCode}} — {{paper.courseTitle}}</p><small>{{paper.questionCount}} questions · {{paper.sourceMethod.replace('_', ' ')}} · {{paper.createdAt | date:'mediumDate'}}</small></div>
        <span class="badge" [class.approved]="paper.status === 'approved'">{{paper.status}}</span>
      </div>
      <div class="empty" *ngIf="!papers.length">No papers yet. Upload a CSV or create questions with the builder.</div>
    </section>
    <ng-template #loadingState><p class="loading">Loading your papers…</p></ng-template>
  `,
  styles: [`.papers-page{padding-bottom:40px}.page-header{display:flex;justify-content:space-between;align-items:center}.papers{padding:8px 24px}.paper{display:flex;justify-content:space-between;gap:20px;padding:18px 0;border-bottom:1px solid var(--uamp-glass-border)}.paper:last-child{border:0}.paper h3{margin:0 0 6px}.paper p,.paper small,.loading,.empty{color:var(--uamp-text-muted)}.badge{height:max-content;text-transform:capitalize}.approved{background:rgba(52,211,153,.18);color:#34d399}.empty{padding:32px;text-align:center}@media(max-width:600px){.page-header{align-items:flex-start;gap:12px}.paper{flex-direction:column}}`]
})
export class UploadedPapersComponent implements OnInit {
  papers: any[] = []; loading = true;
  constructor(private http: HttpClient) {}
  ngOnInit(): void { this.http.get<any[]>('/api/question-papers/mine').subscribe({ next: papers => { this.papers = papers; this.loading = false; }, error: () => this.loading = false }); }
}
