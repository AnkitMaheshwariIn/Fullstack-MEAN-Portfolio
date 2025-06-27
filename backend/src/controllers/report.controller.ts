import Report from '../models/Report';
import User from '../models/User';
import Team from '../models/Team';
import { Request, Response } from 'express';
import { logger } from '../utils/logger';
import { socketHandler } from '../utils/socketHandler';
import { Bull } from '@bull-board/api';
import { Queue } from 'bullmq';

interface CreateReportRequest {
  title: string;
  description?: string;
  type: string;
  data: Record<string, any>;
  team: string;
  assignedTo: string[];
  metadata?: Record<string, any>;
}

interface UpdateReportRequest {
  title?: string;
  description?: string;
  type?: string;
  data?: Record<string, any>;
  status?: string;
  progress?: number;
  metadata?: Record<string, any>;
}

// Initialize BullMQ queue
const reportQueue = new Queue('report-generation', {
  connection: {
    host: process.env.REDIS_HOST || 'localhost',
    port: Number(process.env.REDIS_PORT) || 6379
  }
});

// Processor for report generation
reportQueue.process(async (job) => {
  try {
    const { reportId } = job.data;
    const report = await Report.findById(reportId);
    
    if (!report) {
      throw new Error('Report not found');
    }

    // Simulate report generation (in real app, this would be actual processing)
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Update report status
    await Report.findByIdAndUpdate(reportId, {
      status: 'completed',
      progress: 100,
      data: {
        ...report.data,
        generatedAt: new Date(),
        summary: 'Report generated successfully'
      }
    });

    // Notify users
    socketHandler.io.emit('report:status', {
      reportId,
      status: 'completed',
      progress: 100
    });

    return { success: true };
  } catch (error) {
    logger.error('Report generation error:', error);
    throw error;
  }
});

export const createReport = async (req: Request, res: Response) => {
  try {
    const { title, description, type, data, team, assignedTo, metadata }: CreateReportRequest = req.body;
    const userId = req.user?.id;

    // Validate permissions
    const user = await User.findById(userId);
    if (!user) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Create report
    const report = new Report({
      title,
      description,
      type,
      data,
      team,
      createdBy: userId,
      assignedTo,
      metadata
    });

    await report.save();

    // Add to queue for generation
    await reportQueue.add('generate', { reportId: report._id });

    // Notify team members
    socketHandler.io.emit('report:created', {
      reportId: report._id,
      title: report.title,
      team: report.team
    });

    res.status(201).json(report);
  } catch (error) {
    logger.error('Create report error:', error);
    res.status(500).json({ message: 'Failed to create report' });
  }
};

export const getReport = async (req: Request, res: Response) => {
  try {
    const report = await Report.findById(req.params.id)
      .populate('createdBy', 'firstName lastName')
      .populate('team', 'name')
      .populate('assignedTo', 'firstName lastName');

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    res.json(report);
  } catch (error) {
    logger.error('Get report error:', error);
    res.status(500).json({ message: 'Failed to fetch report' });
  }
};

export const updateReport = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const updateData: UpdateReportRequest = req.body;

    // Validate permissions
    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    if (report.createdBy.toString() !== userId && !req.user?.isAdmin) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const updatedReport = await Report.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'firstName lastName')
      .populate('team', 'name')
      .populate('assignedTo', 'firstName lastName');

    if (!updatedReport) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Notify assigned users if status changes
    if (updateData.status) {
      socketHandler.io.emit('report:status', {
        reportId: updatedReport._id,
        status: updateData.status,
        progress: updateData.progress || 0
      });
    }

    res.json(updatedReport);
  } catch (error) {
    logger.error('Update report error:', error);
    res.status(500).json({ message: 'Failed to update report' });
  }
};

export const deleteReport = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    // Validate permissions
    const report = await Report.findById(id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    if (report.createdBy.toString() !== userId && !req.user?.isAdmin) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await Report.findByIdAndDelete(id);

    // Notify team members
    socketHandler.io.emit('report:deleted', {
      reportId: id
    });

    res.json({ message: 'Report deleted successfully' });
  } catch (error) {
    logger.error('Delete report error:', error);
    res.status(500).json({ message: 'Failed to delete report' });
  }
};

export const getReports = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, search = '', type, status, team } = req.query;
    const query = {};

    if (search) {
      query['$or'] = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (type) {
      query['type'] = type;
    }

    if (status) {
      query['status'] = status;
    }

    if (team) {
      query['team'] = team;
    }

    const reports = await Report.find(query)
      .populate('createdBy', 'firstName lastName')
      .populate('team', 'name')
      .populate('assignedTo', 'firstName lastName')
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Report.countDocuments(query);

    res.json({
      reports,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      totalItems: total
    });
  } catch (error) {
    logger.error('Get reports error:', error);
    res.status(500).json({ message: 'Failed to fetch reports' });
  }
};

export const exportReport = async (req: Request, res: Response) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    // Generate Excel/CSV export
    const exportData = {
      title: report.title,
      description: report.description,
      type: report.type,
      data: report.data,
      metadata: report.metadata,
      createdAt: report.createdAt,
      createdBy: report.createdBy,
      team: report.team
    };

    // In real implementation, use a library like xlsx or exceljs
    // Here we'll just send JSON for demonstration
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=report-export.json');
    res.json(exportData);
  } catch (error) {
    logger.error('Export report error:', error);
    res.status(500).json({ message: 'Failed to export report' });
  }
};
