import { Component, OnInit, OnDestroy } from '@angular/core';
import { DashboardService } from './dashboard.service';
import { Dashboard, Widget } from './dashboard.service';
import { Subscription } from 'rxjs';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { DashboardCreateDialogComponent } from './dialogs/dashboard-create-dialog/dashboard-create-dialog.component';
import { DashboardEditDialogComponent } from './dialogs/dashboard-edit-dialog/dashboard-edit-dialog.component';
import { WidgetDialogComponent } from './dialogs/widget-dialog/widget-dialog.component';
import { DashboardLayoutService } from './dashboard-layout.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  providers: [MessageService, ConfirmationService, DialogService]
})
export class DashboardComponent implements OnInit, OnDestroy {
  dashboards: Dashboard[] = [];
  totalRecords = 0;
  loading = true;
  selectedDashboard: Dashboard | null = null;
  dashboardUpdatesSubscription: Subscription | null = null;

  constructor(
    private dashboardService: DashboardService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private dialogService: DialogService,
    private dashboardLayoutService: DashboardLayoutService
  ) {}

  ngOnInit(): void {
    this.loadDashboards();
    this.subscribeToUpdates();
  }

  ngOnDestroy(): void {
    if (this.dashboardUpdatesSubscription) {
      this.dashboardUpdatesSubscription.unsubscribe();
    }
  }

  loadDashboards(page: number = 1, search: string = ''): void {
    this.loading = true;
    this.dashboardService.getDashboards(page, 10, search).subscribe({
      next: (response) => {
        this.dashboards = response.dashboards;
        this.totalRecords = response.totalItems;
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load dashboards'
        });
        this.loading = false;
      }
    });
  }

  openCreateDialog(): void {
    const ref = this.dialogService.open(DashboardCreateDialogComponent, {
      header: 'Create New Dashboard',
      width: '70%',
      contentStyle: { 'max-height': '500px', overflow: 'auto' }
    });

    ref.onClose.subscribe((dashboard: Dashboard | undefined) => {
      if (dashboard) {
        this.dashboards.unshift(dashboard);
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Dashboard created successfully'
        });
      }
    });
  }

  openEditDialog(dashboard: Dashboard): void {
    const ref = this.dialogService.open(DashboardEditDialogComponent, {
      header: 'Edit Dashboard',
      width: '70%',
      data: { dashboard }
    });

    ref.onClose.subscribe((updatedDashboard: Dashboard | undefined) => {
      if (updatedDashboard) {
        const index = this.dashboards.findIndex(d => d.id === updatedDashboard.id);
        if (index !== -1) {
          this.dashboards[index] = updatedDashboard;
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Dashboard updated successfully'
          });
        }
      }
    });
  }

  openWidgetDialog(dashboard: Dashboard, widget?: Widget): void {
    const ref = this.dialogService.open(WidgetDialogComponent, {
      header: widget ? 'Edit Widget' : 'Add Widget',
      width: '50%',
      data: { dashboard, widget }
    });

    ref.onClose.subscribe((updatedWidget: Widget | undefined) => {
      if (updatedWidget) {
        if (widget) {
          // Update existing widget
          const index = dashboard.widgets.findIndex(w => w === widget);
          if (index !== -1) {
            dashboard.widgets[index] = updatedWidget;
          }
        } else {
          // Add new widget
          dashboard.widgets.push(updatedWidget);
        }

        // Save dashboard changes
        this.dashboardService.updateDashboard(dashboard.id, {
          widgets: dashboard.widgets
        }).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Widget updated successfully'
            });
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to update widget'
            });
          }
        });
      }
    });
  }

  deleteDashboard(dashboard: Dashboard): void {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete this dashboard?',
      header: 'Delete Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.dashboardService.deleteDashboard(dashboard.id).subscribe({
          next: () => {
            this.dashboards = this.dashboards.filter(d => d.id !== dashboard.id);
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Dashboard deleted successfully'
            });
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to delete dashboard'
            });
          }
        });
      }
    });
  }

  private subscribeToUpdates(): void {
    this.dashboardUpdatesSubscription = this.dashboardService.getDashboardUpdates().subscribe({
      next: (update) => {
        if (update) {
          const dashboard = this.dashboards.find(d => d.id === update.dashboardId);
          if (dashboard) {
            // Update dashboard with changes
            Object.assign(dashboard, update.changes);
            this.messageService.add({
              severity: 'info',
              summary: 'Dashboard Updated',
              detail: 'Dashboard has been updated'
            });
          }
        }
      }
    });
  }

  // Dashboard layout methods
  onLayoutUpdate(layout: any): void {
    this.dashboardLayoutService.updateLayout(layout);
  }

  onDragStart(): void {
    this.dashboardLayoutService.setDragging(true);
  }

  onDragStop(): void {
    this.dashboardLayoutService.setDragging(false);
  }
}
