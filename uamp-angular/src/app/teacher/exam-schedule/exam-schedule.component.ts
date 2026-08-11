import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../core/services/auth.service';
import { finalize, timeout } from 'rxjs';

@Component({
  selector: 'app-exam-schedule', standalone: true, imports: [CommonModule, FormsModule],
  template: `
    <div class="container schedule-page"><div class="page-header"><h1>Exam Schedule</h1><p>Create an exam timetable and assign eligible students.</p></div>
      <form class="glass-panel schedule-form" (ngSubmit)="save()">
        <label>Exam title<input class="form-input" name="title" [(ngModel)]="form.title" required></label>
        <label>Course<select class="form-input" name="course" [(ngModel)]="form.courseId" required><option value="">Select course</option><option *ngFor="let course of courses" [value]="course.id">{{course.code}} — {{course.title}}</option></select></label>
        <label>Duration (minutes)<input class="form-input" type="number" name="duration" [(ngModel)]="form.durationMinutes" min="1" required></label>
        <label>Start<input class="form-input" type="datetime-local" name="start" [(ngModel)]="form.scheduledStart" required></label>
        <label>End<input class="form-input" type="datetime-local" name="end" [(ngModel)]="form.scheduledEnd" required></label>
        <label>Question paper deadline<input class="form-input" type="datetime-local" name="deadline" [(ngModel)]="form.questionPaperDeadline" required></label>
        <label>Tab-switch limit<input class="form-input" type="number" name="limit" [(ngModel)]="form.tabSwitchLimit" min="0"></label>
        <label class="check"><input type="checkbox" name="proctor" [(ngModel)]="form.proctoringEnabled"> Enable proctoring</label>
        <section class="students">
          <div class="students-header">
            <h3>Assign students</h3>
            <button type="button" class="btn btn-secondary btn-sm" (click)="selectAll()">
              {{ allSelected() ? 'Deselect All' : 'Select All' }}
            </button>
          </div>
          <label class="check" *ngFor="let student of students"><input type="checkbox" [checked]="selected.has(student.id)" (change)="toggle(student.id)">{{student.fullName}} <small>{{student.enrollmentNumber}}</small></label>
        </section>
        <p class="form-error" *ngIf="error">{{error}}</p><p class="success" *ngIf="success">Timetable saved and students assigned.</p>
        <button class="btn btn-primary" [disabled]="saving">{{saving ? 'Publishing timetable…' : 'Publish timetable'}}</button>
      </form>
    </div>`,
  styles: [`.schedule-page{padding-bottom:48px}.schedule-form{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px;padding:28px}.schedule-form label{display:flex;flex-direction:column;gap:7px;color:var(--uamp-text-muted);font-size:.85rem}.check{flex-direction:row!important;align-items:center}.students{grid-column:1/-1;display:grid;gap:10px}.students-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px}.students-header h3{color:var(--uamp-text-primary);margin:0}.students small{color:var(--uamp-text-muted)}.success{color:var(--uamp-accent-success)}.btn-sm{padding:6px 12px;font-size:0.8rem}@media(max-width:700px){.schedule-form{grid-template-columns:1fr}.students-header{flex-direction:column;align-items:flex-start;gap:10px}}`]
})
export class ExamScheduleComponent implements OnInit {
  courses:any[]=[]; students:any[]=[]; selected=new Set<string>(); saving=false; error=''; success='';
  form={title:'',courseId:'',durationMinutes:90,scheduledStart:'',scheduledEnd:'',questionPaperDeadline:'',tabSwitchLimit:3,proctoringEnabled:true};
  constructor(private http:HttpClient, private auth:AuthService) {}
  ngOnInit(){ this.http.get<any[]>('/api/scheduling/courses').subscribe(x=>this.courses=x); this.http.get<any[]>('/api/scheduling/students').subscribe(x=>this.students=x); }
  toggle(id:string){ this.selected.has(id)?this.selected.delete(id):this.selected.add(id); }
  selectAll(): void {
    if (this.allSelected()) {
      this.selected.clear();
    } else {
      this.students.forEach(student => this.selected.add(student.id));
    }
  }
  allSelected(): boolean {
    return this.students.length > 0 && this.selected.size === this.students.length;
  }
  save(){ this.error=''; this.success=''; if(new Date(this.form.scheduledEnd)<=new Date(this.form.scheduledStart)){this.error='End time must be after the start time.';return;} if(new Date(this.form.questionPaperDeadline)>new Date(this.form.scheduledStart)){this.error='Paper deadline must be on or before the exam start.';return;} if(!this.selected.size){this.error='Select at least one student.';return;} this.saving=true; this.http.post('/api/scheduling/exams',{...this.form,studentIds:[...this.selected],createdBy:this.auth.user()?.id}).pipe(timeout(30000), finalize(()=>this.saving=false)).subscribe({next:()=>{this.success=`Timetable saved and ${this.selected.size} students notified. Upload the question paper before its deadline.`},error:e=>{this.error=e.name==='TimeoutError'?'Saving timed out. Confirm the backend is running, then try again.':(e.error?.error||'Could not save timetable.')}}); }
}
