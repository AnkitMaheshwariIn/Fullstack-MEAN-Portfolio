import { Component, OnInit, OnDestroy } from '@angular/core';
import { ReportService } from './report.service';
import { Report } from './report.service';
import { Subscription } from 'rxjs';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { ReportCreateDialogComponent } from './dialogs/report-create-dialog/report-create-dialog.component';
import { ReportEditDialogComponent } from './dialogs/report-edit-dialog/report-edit-dialog.component';
import { ReportExportDialogComponent } from './dialogs/report-export-dialog/report-export-dialog.component';
import { FileDownloadService } from '../../shared/services/file-download.service';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss'],
  providers: [MessageService, ConfirmationService, DialogService]
})
export class ReportComponent implements OnInit, OnDestroy {
  reports: Report[] = [];
  totalRecords = 0;
  loading = true;
  selectedReport: Report | null = null;
  statusUpdatesSubscription: Subscription | null = null;

  constructor(
    private reportService: ReportService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private dialogService: DialogService,
    private fileDownloadService: FileDownloadService
  ) {}

  ngOnInit(): void {
    this.loadReports();
    this.subscribeToStatusUpdates();
  }

  ngOnDestroy(): void {
    if (this.statusUpdatesSubscription) {
      this.statusUpdatesSubscription.unsubscribe();
    }
  }

  loadReports(page: number = 1, search: string = ''): void {
    this.loading = true;
    this.reportService.getReports(page, 10, search).subscribe({
      next: (response) => {
        this.reports = response.reports;
        this.totalRecords = response.totalItems;
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load reports'
        });
        this.loading = false;
      }
    });
  }

  openCreateDialog(): void {
    const ref = this.dialogService.open(ReportCreateDialogComponent, {
      header: 'Create New Report',
      width: '70%',
      contentStyle: { 'max-height': '500px', overflow: 'auto' }
    });

    ref.onClose.subscribe((report: Report | undefined) => {
      if (report) {
        this.reports.unshift(report);
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Report created successfully'
        });
      }
    });
  }

  openEditDialog(report: Report): void {
    const ref = this.dialogService.open(ReportEditDialogComponent, {
      header: 'Edit Report',
      width: '70%',
      data: { report }
    });

    ref.onClose.subscribe((updatedReport: Report | undefined) => {
      if (updatedReport) {
        const index = this.reports.findIndex(r => r.id === updatedReport.id);
        if (index !== -1) {
          this.reports[index] = updatedReport;
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Report updated successfully'
          });
        }
      }
    });
  }

  openExportDialog(report: Report): void {
    const ref = this.dialogService.open(ReportExportDialogComponent, {
      header: 'Export Report',
      width: '40%',
      data: { report }
    });

    ref.onClose.subscribe(async (format: string | undefined) => {
      if (format) {
        try {
          const blob = await this.reportService.exportReport(report.id, format).toPromise();
          this.fileDownloadService.downloadFile(blob, `report-${report.title}.${format}`);
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Report exported successfully'
          });
        } catch (error) {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to export report'
          });
        }
      }
    });
  }

  deleteReport(report: Report): void {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this report?',
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.reportService.deleteReport(report.id).subscribe({
          next: () => {
            this.reports = this.reports.filter(r => r.id !== report.id);
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Report deleted successfully'
            });
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to delete report'
            });
          }
        });
      }
    });
  }

  private subscribeToStatusUpdates(): void {
    this.statusUpdatesSubscription = this.reportService.getReportStatusUpdates().subscribe({
      next: (update) => {
        if (update) {
          const report = this.reports.find(r => r.id === update.reportId);
          if (report) {
            report.status = update.status;
            report.progress = update.progress;
            this.messageService.add({
              severity: 'info',
              summary: 'Report Update',
              detail: `Report status changed to ${update.status}`
            });
          }
        }
      }
    });
  }
}
