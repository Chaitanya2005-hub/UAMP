import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';

import { authRoutes } from './auth.routes';

@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(authRoutes),
    ReactiveFormsModule,
    FormsModule
  ]
})
export class AuthModule {}