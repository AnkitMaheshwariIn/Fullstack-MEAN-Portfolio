import { Injectable } from '@nestjs/common';
import { BullQueueService } from '../queue/bull-queue.service';
import { ReportProcessingJob } from './jobs/report-processing.job';
import { ImageProcessingJob } from './jobs/image-processing.job';

@Injectable()
export class BackgroundProcessingService {
  constructor(
    private readonly queueService: BullQueueService
  ) {}

  // Process reports in the background
  async processReport(data: any): Promise<void> {
    await this.queueService.addJob('report-processing', new ReportProcessingJob(data));
  }

  // Process images in the background
  async processImage(imageData: Buffer): Promise<void> {
    await this.queueService.addJob('image-processing', new ImageProcessingJob(imageData));
  }

  // Generate Excel files in the background
  async generateExcelFile(data: any): Promise<void> {
    await this.queueService.addJob('excel-generation', data);
  }

  // Handle background processing errors
  async handleError(job: any, error: Error): Promise<void> {
    console.error(`Background job failed: ${job.name}`, error);
    // Implement retry logic or error handling strategy
  }
}
