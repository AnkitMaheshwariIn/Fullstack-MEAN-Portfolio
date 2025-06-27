import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';

// PrimeNG modules
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { MenuModule } from 'primeng/menu';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { ChartModule } from 'primeng/chart';
import { FileUploadModule } from 'primeng/fileupload';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { PanelModule } from 'primeng/panel';
import { TabViewModule } from 'primeng/tabview';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { MultiSelectModule } from 'primeng/multiselect';
import { SplitButtonModule } from 'primeng/splitbutton';
import { OverlayPanelModule } from 'primeng/overlaypanel';

// Ngx-Charts
import { NgxChartsModule } from '@swimlane/ngx-charts';

// Custom components
import { LoadingSpinnerComponent } from './components/loading-spinner/loading-spinner.component';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';
import { ErrorDialogComponent } from './components/error-dialog/error-dialog.component';
import { SuccessDialogComponent } from './components/success-dialog/success-dialog.component';
import { LoadingOverlayComponent } from './components/loading-overlay/loading-overlay.component';

@NgModule({
  declarations: [
    LoadingSpinnerComponent,
    ConfirmDialogComponent,
    ErrorDialogComponent,
    SuccessDialogComponent,
    LoadingOverlayComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    HttpClientModule,
    
    // PrimeNG
    ButtonModule,
    CardModule,
    InputTextModule,
    TableModule,
    ToastModule,
    ToolbarModule,
    MenuModule,
    DialogModule,
    DropdownModule,
    CalendarModule,
    ChartModule,
    FileUploadModule,
    ProgressSpinnerModule,
    PanelModule,
    TabViewModule,
    InputTextareaModule,
    InputNumberModule,
    MultiSelectModule,
    SplitButtonModule,
    OverlayPanelModule,
    
    // Ngx-Charts
    NgxChartsModule
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    
    // PrimeNG
    ButtonModule,
    CardModule,
    InputTextModule,
    TableModule,
    ToastModule,
    ToolbarModule,
    MenuModule,
    DialogModule,
    DropdownModule,
    CalendarModule,
    ChartModule,
    FileUploadModule,
    ProgressSpinnerModule,
    PanelModule,
    TabViewModule,
    InputTextareaModule,
    InputNumberModule,
    MultiSelectModule,
    SplitButtonModule,
    OverlayPanelModule,
    
    // Ngx-Charts
    NgxChartsModule,
    
    // Custom components
    LoadingSpinnerComponent,
    ConfirmDialogComponent,
    ErrorDialogComponent,
    SuccessDialogComponent,
    LoadingOverlayComponent
  ]
})
export class SharedModule { }
