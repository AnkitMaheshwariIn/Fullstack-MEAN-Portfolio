export interface ReportData {
  id: string;
  title: string;
  type: 'project' | 'team' | 'performance';
  startDate: string;
  endDate: string;
  metrics: Metric[];
  filters?: {
    team?: string[];
    project?: string[];
    status?: string[];
  };
}

export interface Metric {
  name: string;
  value: number;
  unit?: string;
  category: string;
}

export interface ReportResult {
  success: boolean;
  timestamp: string;
  processedData: {
    summary: Metric[];
    details: any[];
    insights: string[];
  };
  errors?: string[];
}
