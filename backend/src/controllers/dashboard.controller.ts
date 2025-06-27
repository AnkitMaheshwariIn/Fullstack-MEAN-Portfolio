import Dashboard from '../models/Dashboard';
import User from '../models/User';
import Team from '../models/Team';
import Report from '../models/Report';
import { Request, Response } from 'express';
import { logger } from '../utils/logger';
import { socketHandler } from '../utils/socketHandler';

interface CreateDashboardRequest {
  name: string;
  description?: string;
  widgets: Array<{
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
  }>;
  team: string;
  sharedWith: string[];
  metadata?: Record<string, any>;
}

interface UpdateDashboardRequest {
  name?: string;
  description?: string;
  widgets?: Array<{
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
  }>;
  sharedWith?: string[];
  metadata?: Record<string, any>;
}

export const createDashboard = async (req: Request, res: Response) => {
  try {
    const { name, description, widgets, team, sharedWith, metadata }: CreateDashboardRequest = req.body;
    const userId = req.user?.id;

    // Validate permissions
    const user = await User.findById(userId);
    if (!user) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Create dashboard
    const dashboard = new Dashboard({
      name,
      description,
      widgets,
      team,
      createdBy: userId,
      sharedWith,
      metadata
    });

    await dashboard.save();

    // Notify shared users
    if (sharedWith && sharedWith.length > 0) {
      const sharedUsers = await User.find({ _id: { $in: sharedWith } });
      sharedUsers.forEach(user => {
        socketHandler.io.emit('notification:create', {
          userId: user._id,
          message: `New dashboard shared: ${dashboard.name}`,
          type: 'info'
        });
      });
    }

    res.status(201).json(dashboard);
  } catch (error) {
    logger.error('Create dashboard error:', error);
    res.status(500).json({ message: 'Failed to create dashboard' });
  }
};

export const getDashboard = async (req: Request, res: Response) => {
  try {
    const dashboard = await Dashboard.findById(req.params.id)
      .populate('createdBy', 'firstName lastName')
      .populate('team', 'name')
      .populate('sharedWith', 'firstName lastName');

    if (!dashboard) {
      return res.status(404).json({ message: 'Dashboard not found' });
    }

    // Check permissions
    const userId = req.user?.id;
    if (userId !== dashboard.createdBy.toString() && 
        !dashboard.sharedWith.includes(userId)) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Get related data for widgets
    const widgetData = await Promise.all(
      dashboard.widgets.map(async (widget) => {
        if (widget.type === 'chart') {
          // Example: Get report data for chart
          const reports = await Report.find({
            team: dashboard.team,
            status: 'completed'
          }).limit(10);
          return {
            ...widget,
            data: {
              ...widget.data,
              reports
            }
          };
        }
        return widget;
      })
    );

    res.json({
      ...dashboard.toObject(),
      widgets: widgetData
    });
  } catch (error) {
    logger.error('Get dashboard error:', error);
    res.status(500).json({ message: 'Failed to fetch dashboard' });
  }
};

export const updateDashboard = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const updateData: UpdateDashboardRequest = req.body;

    // Validate permissions
    const dashboard = await Dashboard.findById(id);
    if (!dashboard) {
      return res.status(404).json({ message: 'Dashboard not found' });
    }

    if (dashboard.createdBy.toString() !== userId && !req.user?.isAdmin) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const updatedDashboard = await Dashboard.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('createdBy', 'firstName lastName')
      .populate('team', 'name')
      .populate('sharedWith', 'firstName lastName');

    if (!updatedDashboard) {
      return res.status(404).json({ message: 'Dashboard not found' });
    }

    // Notify shared users if sharedWith changes
    if (updateData.sharedWith) {
      socketHandler.io.emit('dashboard:updated', {
        dashboardId: updatedDashboard._id,
        changes: updateData
      });
    }

    res.json(updatedDashboard);
  } catch (error) {
    logger.error('Update dashboard error:', error);
    res.status(500).json({ message: 'Failed to update dashboard' });
  }
};

export const deleteDashboard = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    // Validate permissions
    const dashboard = await Dashboard.findById(id);
    if (!dashboard) {
      return res.status(404).json({ message: 'Dashboard not found' });
    }

    if (dashboard.createdBy.toString() !== userId && !req.user?.isAdmin) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    await Dashboard.findByIdAndDelete(id);

    // Notify shared users
    socketHandler.io.emit('dashboard:deleted', {
      dashboardId: id
    });

    res.json({ message: 'Dashboard deleted successfully' });
  } catch (error) {
    logger.error('Delete dashboard error:', error);
    res.status(500).json({ message: 'Failed to delete dashboard' });
  }
};

export const getDashboards = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, search = '', team } = req.query;
    const userId = req.user?.id;

    // Build query based on permissions
    const query = {
      $or: [
        { createdBy: userId },
        { sharedWith: userId }
      ]
    };

    if (search) {
      query['$or'].push({
        name: { $regex: search, $options: 'i' },
        description: { $regex: search, $options: 'i' }
      });
    }

    if (team) {
      query['team'] = team;
    }

    const dashboards = await Dashboard.find(query)
      .populate('createdBy', 'firstName lastName')
      .populate('team', 'name')
      .populate('sharedWith', 'firstName lastName')
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Dashboard.countDocuments(query);

    res.json({
      dashboards,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      totalItems: total
    });
  } catch (error) {
    logger.error('Get dashboards error:', error);
    res.status(500).json({ message: 'Failed to fetch dashboards' });
  }
};
