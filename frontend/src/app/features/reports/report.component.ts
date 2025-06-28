import { Component, OnInit, OnDestroy } from '@angular/core';
import { ReportWorkerService } from '../../core/workers/report-worker.service';
import { ReportData, ReportResult, Metric } from '../../core/interfaces/report.interface';
import { Subscription } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
  selector: 'app-reports',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss']
})
export class ReportComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private workerSubscription: Subscription | null = null;

  reportType: 'project' | 'team' | 'performance' = 'project';
  isLoading = false;
  reportResult: ReportResult | null = null;
  error: string | null = null;

  constructor(private reportWorkerService: ReportWorkerService) {}

  ngOnInit(): void {
    // Initialize worker if not already initialized
    if (!this.reportWorkerService.isInitialized()) {
      this.reportWorkerService.initializeWorker();
    }

    // Subscribe to worker messages
    this.workerSubscription = this.reportWorkerService.getMessage()
      .pipe(takeUntil(this.destroy$))
      .subscribe((result: ReportResult) => {
        this.isLoading = false;
        this.reportResult = result;
        this.error = null;
      });

    // Subscribe to worker errors
    this.reportWorkerService.getErrors()
      .pipe(takeUntil(this.destroy$))
      .subscribe((error: any) => {
        this.isLoading = false;
        this.error = error.message || 'An error occurred while processing the report';
        this.reportResult = null;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.workerSubscription) {
      this.workerSubscription.unsubscribe();
    }
    this.reportWorkerService.terminate();
  }

  generateReport(): void {
    if (!this.reportWorkerService.isInitialized()) {
      this.error = 'Worker service is not initialized';
      return;
    }

    this.isLoading = true;
    this.error = null;
    this.reportResult = null;

    const reportData: ReportData = {
      id: Math.random().toString(36).substring(2),
      title: 'Sample Report',
      type: this.reportType,
      startDate: '2025-01-01',
      endDate: '2025-12-31',
      metrics: this.getSampleMetrics()
    };

    this.reportWorkerService.sendMessage(reportData);
  }

  private getSampleMetrics(): Metric[] {
    const metrics: Metric[] = [];
    
    switch (this.reportType) {
      case 'project':
        metrics.push(
          { name: 'hours', value: 800, category: 'time' },
          { name: 'completed_tasks', value: 45, category: 'tasks' },
          { name: 'total_tasks', value: 50, category: 'tasks' },
          { name: 'actual_cost', value: 12000, category: 'budget' },
          { name: 'budget', value: 15000, category: 'budget' }
        );
        break;

      case 'team':
        metrics.push(
          { name: 'performance', value: 85, category: 'performance' },
          { name: 'utilization', value: 75, category: 'utilization' },
          { name: 'efficiency', value: 90, category: 'efficiency' },
          { name: 'hours', value: 1600, category: 'time' },
          { name: 'members', value: 5, category: 'team' }
        );
        break;

      case 'performance':
        metrics.push(
          { name: 'score', value: 92, category: 'performance' },
          { name: 'productivity', value: 88, category: 'productivity' },
          { name: 'quality', value: 95, category: 'quality' },
          { name: 'tasks_completed', value: 100, category: 'tasks' },
          { name: 'tasks_total', value: 110, category: 'tasks' }
        );
        break;
    }

    return metrics;
  }
}
