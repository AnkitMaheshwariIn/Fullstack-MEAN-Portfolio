import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { SocketService } from '../../core/services/socket.service';
import { map } from 'rxjs/operators';

export interface Report {
  id: string;
  title: string;
  description?: string;
  type: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  progress: number;
  data: Record<string, any>;
  team: string;
  createdBy: string;
  assignedTo: string[];
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReportExport {
  format: 'excel' | 'csv' | 'pdf';
  filename: string;
  data: any;
}

@Injectable({
  providedIn: 'root'
})
export class ReportService {
  private apiUrl = `${environment.apiUrl}/api/reports`;
  private reportStatusSubject = new BehaviorSubject<{
    reportId: string;
    status: string;
    progress: number;
  } | null>(null);

  constructor(
    private http: HttpClient,
    private socketService: SocketService
  ) {
    // Listen for report status updates
    this.socketService.listenForEvent('report:status').subscribe(status => {
      this.reportStatusSubject.next(status);
    });
  }

  // Create report
  createReport(reportData: Partial<Report>): Observable<Report> {
    return this.http.post<Report>(this.apiUrl, reportData);
  }

  // Get report by ID
  getReport(id: string): Observable<Report> {
    return this.http.get<Report>(`${this.apiUrl}/${id}`);
  }

  // Update report
  updateReport(id: string, reportData: Partial<Report>): Observable<Report> {
    return this.http.put<Report>(`${this.apiUrl}/${id}`, reportData);
  }

  // Delete report
  deleteReport(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // Get all reports with pagination
  getReports(
    page: number = 1,
    limit: number = 10,
    search?: string,
    type?: string,
    status?: string,
    team?: string
  ): Observable<{
    reports: Report[];
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

    if (type) {
      params.append('type', type);
    }

    if (status) {
      params.append('status', status);
    }

    if (team) {
      params.append('team', team);
    }

    return this.http.get(`${this.apiUrl}?${params.toString()}`).pipe(
      map((response: any) => response)
    );
  }

  // Export report
  exportReport(id: string, format: 'excel' | 'csv' | 'pdf'): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${id}/export`, {
      responseType: 'blob',
      params: { format }
    });
  }

  // Listen for report status updates
  getReportStatusUpdates(): Observable<{
    reportId: string;
    status: string;
    progress: number;
  }> {
    return this.reportStatusSubject.asObservable();
  }
}
