import { TestBed } from '@angular/core/testing';
import { ReportWorkerService } from './report-worker.service';
import { ReportData, ReportResult } from '../interfaces/report.interface';
import { of, throwError } from 'rxjs';
import { Subject } from 'rxjs';

describe('ReportWorkerService', () => {
  let service: ReportWorkerService;
  let mockWorker: Worker;
  let mockMessageSubject: Subject<any>;
  let mockErrorSubject: Subject<any>;

  beforeEach(() => {
    // Mock Worker
    mockWorker = {
      postMessage: jest.fn(),
      terminate: jest.fn(),
      onmessage: null,
      onerror: null,
      onmessageerror: null
    } as unknown as Worker;

    // Mock Subjects
    mockMessageSubject = new Subject<any>();
    mockErrorSubject = new Subject<any>();

    // Mock service
    service = new ReportWorkerService();
    service['worker'] = mockWorker;
    service['messageSubject'] = mockMessageSubject;
    service['errorSubject'] = mockErrorSubject;
    service['workerInitialized'] = true;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('initializeWorker', () => {
    it('should initialize worker when Web Workers are supported', () => {
      // Mock Worker constructor
      const mockWorkerConstructor = jest.fn().mockImplementation(() => mockWorker);
      global.Worker = mockWorkerConstructor;

      service.initializeWorker();

      expect(mockWorkerConstructor).toHaveBeenCalledWith('./workers/report.worker.js');
      expect(service['workerInitialized']).toBe(true);
    });

    it('should not initialize worker when Web Workers are not supported', () => {
      // Delete Worker from global scope
      delete (global as any).Worker;

      service.initializeWorker();

      expect(service['workerInitialized']).toBe(false);
    });
  });

  describe('sendMessage', () => {
    it('should send message to worker when initialized', (done) => {
      const testData: ReportData = {
        id: 'test-id',
        title: 'Test Report',
        type: 'project',
        startDate: '2025-01-01',
        endDate: '2025-12-31',
        metrics: []
      };

      service.sendMessage(testData).subscribe({
        next: () => {
          expect(mockWorker.postMessage).toHaveBeenCalledWith(testData);
          done();
        },
        error: fail
      });
    });

    it('should throw error when worker is not initialized', (done) => {
      service['workerInitialized'] = false;

      service.sendMessage({} as ReportData).subscribe({
        next: fail,
        error: (error) => {
          expect(error.message).toBe('Worker is not initialized');
          done();
        }
      });
    });
  });

  describe('getMessage', () => {
    it('should return messages from worker', () => {
      const testResult: ReportResult = {
        success: true,
        timestamp: new Date().toISOString(),
        processedData: {
          summary: [],
          details: [],
          insights: []
        }
      };

      mockMessageSubject.next(testResult);

      service.getMessage().subscribe(result => {
        expect(result).toEqual(testResult);
      });
    });
  });

  describe('getErrors', () => {
    it('should return worker errors', () => {
      const testError = new Error('Worker error');

      mockErrorSubject.next(testError);

      service.getErrors().subscribe(error => {
        expect(error).toEqual(testError);
      });
    });
  });

  describe('terminate', () => {
    it('should terminate worker', () => {
      service.terminate();
      expect(mockWorker.terminate).toHaveBeenCalled();
      expect(service['workerInitialized']).toBe(false);
    });

    it('should handle worker termination error', () => {
      const testError = new Error('Termination error');
      mockWorker.terminate = jest.fn().mockImplementation(() => {
        throw testError;
      });

      service.terminate();
      expect(mockErrorSubject.next).toHaveBeenCalledWith(testError);
    });
  });

  describe('ngOnDestroy', () => {
    it('should clean up subscriptions and terminate worker', () => {
      const mockComplete = jest.fn();
      service['messageSubject'].complete = mockComplete;
      service['errorSubject'].complete = mockComplete;

      service.ngOnDestroy();

      expect(mockComplete).toHaveBeenCalledTimes(2);
      expect(mockWorker.terminate).toHaveBeenCalled();
    });
  });
});
