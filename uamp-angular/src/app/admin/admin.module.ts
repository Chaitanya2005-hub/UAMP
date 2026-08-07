import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { ApprovalsComponent } from './approvals/approvals.component';
import { LiveAuditDashboardComponent } from './live-audit-dashboard/live-audit-dashboard.component';
import { InterventionControlsComponent } from './intervention-controls/intervention-controls.component';
import { AuditTrailComponent } from './audit-trail/audit-trail.component';

import { GlassPanelComponent } from '../shared/components/glass-panel/glass-panel.component';
import { ModalComponent } from '../shared/components/modal/modal.component';
import { RadarChartComponent } from '../shared/components/radar-chart/radar-chart.component';
import { ButtonComponent } from '../shared/components/button/button.component';
import { CardComponent } from '../shared/components/card/card.component';
import { InputComponent } from '../shared/components/input/input.component';

import { BloomLevelLabelPipe } from '../shared/pipes/bloom-level-label.pipe';
import { CountdownPipe } from '../shared/pipes/countdown.pipe';

import { adminRoutes } from './admin.routes';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild(adminRoutes),
    GlassPanelComponent,
    ModalComponent,
    RadarChartComponent,
    ButtonComponent,
    CardComponent,
    InputComponent,
    BloomLevelLabelPipe,
    CountdownPipe
  ]
})
export class AdminModule {}