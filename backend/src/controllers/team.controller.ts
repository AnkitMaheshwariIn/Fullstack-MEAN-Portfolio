import Team from '../models/Team';
import User from '../models/User';
import { Request, Response } from 'express';
import { logger } from '../utils/logger';
import { socketHandler } from '../utils/socketHandler';

interface CreateTeamRequest {
  name: string;
  description?: string;
  members: string[];
  leader: string;
}

interface UpdateTeamRequest {
  name?: string;
  description?: string;
  members?: string[];
  status?: string;
  metadata?: Record<string, any>;
}

export const createTeam = async (req: Request, res: Response) => {
  try {
    const { name, description, members, leader }: CreateTeamRequest = req.body;

    // Validate members and leader
    const existingUsers = await User.find({ _id: { $in: [...members, leader] } });
    if (existingUsers.length !== members.length + 1) {
      return res.status(400).json({ message: 'Some users do not exist' });
    }

    // Create team
    const team = new Team({
      name,
      description,
      members,
      leader
    });

    await team.save();

    // Notify team members
    socketHandler.io.emit('team:created', {
      teamId: team._id,
      name: team.name,
      leader: team.leader
    });

    res.status(201).json(team);
  } catch (error) {
    logger.error('Create team error:', error);
    res.status(500).json({ message: 'Failed to create team' });
  }
};

export const getTeam = async (req: Request, res: Response) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('leader', 'firstName lastName')
      .populate('members', 'firstName lastName role');

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    res.json(team);
  } catch (error) {
    logger.error('Get team error:', error);
    res.status(500).json({ message: 'Failed to fetch team' });
  }
};

export const updateTeam = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updateData: UpdateTeamRequest = req.body;

    // Validate members if provided
    if (updateData.members) {
      const existingUsers = await User.find({ _id: { $in: updateData.members } });
      if (existingUsers.length !== updateData.members.length) {
        return res.status(400).json({ message: 'Some users do not exist' });
      }
    }

    const team = await Team.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('leader', 'firstName lastName')
      .populate('members', 'firstName lastName role');

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Notify team members
    socketHandler.io.emit('team:updated', {
      teamId: team._id,
      changes: updateData
    });

    res.json(team);
  } catch (error) {
    logger.error('Update team error:', error);
    res.status(500).json({ message: 'Failed to update team' });
  }
};

export const deleteTeam = async (req: Request, res: Response) => {
  try {
    const team = await Team.findByIdAndDelete(req.params.id);

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    // Notify team members
    socketHandler.io.emit('team:deleted', {
      teamId: team._id
    });

    res.json({ message: 'Team deleted successfully' });
  } catch (error) {
    logger.error('Delete team error:', error);
    res.status(500).json({ message: 'Failed to delete team' });
  }
};

export const getTeams = async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 10, search = '', status } = req.query;
    const query = {};

    if (search) {
      query['$or'] = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    if (status) {
      query['status'] = status;
    }

    const teams = await Team.find(query)
      .populate('leader', 'firstName lastName')
      .populate('members', 'firstName lastName role')
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const total = await Team.countDocuments(query);

    res.json({
      teams,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      totalItems: total
    });
  } catch (error) {
    logger.error('Get teams error:', error);
    res.status(500).json({ message: 'Failed to fetch teams' });
  }
};

export const getTeamMembers = async (req: Request, res: Response) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('members', 'firstName lastName email role')
      .populate('leader', 'firstName lastName email role');

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    res.json({
      members: team.members,
      leader: team.leader
    });
  } catch (error) {
    logger.error('Get team members error:', error);
    res.status(500).json({ message: 'Failed to fetch team members' });
  }
};
