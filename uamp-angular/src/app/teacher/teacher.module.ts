import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { GlassPanelComponent } from '../shared/components/glass-panel/glass-panel.component';
import { ModalComponent } from '../shared/components/modal/modal.component';
import { RadarChartComponent } from '../shared/components/radar-chart/radar-chart.component';
import { ButtonComponent } from '../shared/components/button/button.component';
import { CardComponent } from '../shared/components/card/card.component';
import { InputComponent } from '../shared/components/input/input.component';

import { BloomLevelLabelPipe } from '../shared/pipes/bloom-level-label.pipe';
import { CountdownPipe } from '../shared/pipes/countdown.pipe';

import { teacherRoutes } from './teacher.routes';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild(teacherRoutes),
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
export class TeacherModule {}