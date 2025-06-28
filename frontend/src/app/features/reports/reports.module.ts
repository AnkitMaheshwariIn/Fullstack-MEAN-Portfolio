import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ReportComponent } from './report.component';

const routes: Routes = [
  {
    path: '',
    component: ReportComponent
  }
];

@NgModule({
  declarations: [ReportComponent],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes),
    MatCardModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatRadioModule,
    MatProgressSpinnerModule
  ],
  exports: [RouterModule]
})
export class ReportsModule { }
