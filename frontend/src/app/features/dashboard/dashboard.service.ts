import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SocketService } from '../../core/services/socket.service';
import { map } from 'rxjs/operators';

export interface Widget {
  type: string;
  title: string;
  data: Record<string, any>;
  config: Record<string, any>;
  position: {
    row: number;
    col: number;
    sizeX: number;
    sizeY: number;
  };
}

export interface Dashboard {
  id: string;
  name: string;
  description?: string;
  widgets: Widget[];
  team: string;
  createdBy: string;
  sharedWith: string[];
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = `${environment.apiUrl}/api/dashboards`;
  private dashboardUpdatesSubject = new BehaviorSubject<{
    dashboardId: string;
    changes: Record<string, any>;
  } | null>(null);

  constructor(
    private http: HttpClient,
    private socketService: SocketService
  ) {
    // Listen for dashboard updates
    this.socketService.listenForEvent('dashboard:updated').subscribe(update => {
      this.dashboardUpdatesSubject.next(update);
    });
  }

  // Create dashboard
  createDashboard(dashboardData: Partial<Dashboard>): Observable<Dashboard> {
    return this.http.post<Dashboard>(this.apiUrl, dashboardData);
  }

  // Get dashboard by ID
  getDashboard(id: string): Observable<Dashboard> {
    return this.http.get<Dashboard>(`${this.apiUrl}/${id}`);
  }

  // Update dashboard
  updateDashboard(id: string, dashboardData: Partial<Dashboard>): Observable<Dashboard> {
    return this.http.put<Dashboard>(`${this.apiUrl}/${id}`, dashboardData);
  }

  // Delete dashboard
  deleteDashboard(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Get all dashboards with pagination
  getDashboards(
    page: number = 1,
    limit: number = 10,
    search?: string,
    team?: string
  ): Observable<{
    dashboards: Dashboard[];
    totalPages: number;
    currentPage: number;
    totalItems: number;
  }> {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    if (search) {
      params.append('search', search);
    }

    if (team) {
      params.append('team', team);
    }

    return this.http.get(`${this.apiUrl}?${params.toString()}`).pipe(
      map((response: any) => response)
    );
  }

  // Listen for dashboard updates
  getDashboardUpdates(): Observable<{
    dashboardId: string;
    changes: Record<string, any>;
  }> {
    return this.dashboardUpdatesSubject.asObservable();
  }

  // Get widget data based on type
  getWidgetData(widget: Widget): Observable<any> {
    switch (widget.type) {
      case 'chart':
        return this.getChartWidgetData(widget);
      case 'table':
        return this.getTableWidgetData(widget);
      case 'metric':
        return this.getMetricWidgetData(widget);
      case 'timeline':
        return this.getTimelineWidgetData(widget);
      case 'map':
        return this.getMapWidgetData(widget);
      default:
        return new Observable(subscriber => {
          subscriber.next(widget.data);
          subscriber.complete();
        });
    }
  }

  private getChartWidgetData(widget: Widget): Observable<any> {
    // Implementation for chart widget data
    return new Observable(subscriber => {
      // Example: Get report data for chart
      this.http.get<any>(`${environment.apiUrl}/api/reports?status=completed&limit=10`).subscribe({
        next: (data) => {
          subscriber.next({
            ...widget.data,
            reports: data.reports
          });
          subscriber.complete();
        },
        error: (error) => {
          subscriber.error(error);
        }
      });
    });
  }

  private getTableWidgetData(widget: Widget): Observable<any> {
    // Implementation for table widget data
    return new Observable(subscriber => {
      subscriber.next(widget.data);
      subscriber.complete();
    });
  }

  private getMetricWidgetData(widget: Widget): Observable<any> {
    // Implementation for metric widget data
    return new Observable(subscriber => {
      subscriber.next(widget.data);
      subscriber.complete();
    });
  }

  private getTimelineWidgetData(widget: Widget): Observable<any> {
    // Implementation for timeline widget data
    return new Observable(subscriber => {
      subscriber.next(widget.data);
      subscriber.complete();
    });
  }

  private getMapWidgetData(widget: Widget): Observable<any> {
    // Implementation for map widget data
    return new Observable(subscriber => {
      subscriber.next(widget.data);
      subscriber.complete();
    });
  }
}
