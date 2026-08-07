import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { GlassPanelComponent } from '../shared/components/glass-panel/glass-panel.component';
import { ModalComponent } from '../shared/components/modal/modal.component';
import { RadarChartComponent } from '../shared/components/radar-chart/radar-chart.component';
import { ButtonComponent } from '../shared/components/button/button.component';
import { CardComponent } from '../shared/components/card/card.component';
import { InputComponent } from '../shared/components/input/input.component';

import { BloomLevelLabelPipe } from '../shared/pipes/bloom-level-label.pipe';
import { CountdownPipe } from '../shared/pipes/countdown.pipe';

import { studentRoutes } from './student.routes';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(studentRoutes),
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
export class StudentModule {}