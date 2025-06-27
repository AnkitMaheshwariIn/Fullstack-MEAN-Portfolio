import mongoose, { Schema, Document } from 'mongoose';
import User from './User';
import Team from './Team';

export interface IReport extends Document {
  title: string;
  description: string;
  type: string;
  status: string;
  progress: number;
  data: Record<string, any>;
  team: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  assignedTo: mongoose.Types.ObjectId[];
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const reportSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  type: {
    type: String,
    enum: ['financial', 'performance', 'operational', 'custom'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'failed'],
    default: 'pending'
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  data: {
    type: Map,
    of: Schema.Types.Mixed
  },
  team: {
    type: Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedTo: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  metadata: {
    type: Map,
    of: Schema.Types.Mixed
  },
  errors: [{
    message: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: (doc, ret) => {
      delete ret.__v;
      return ret;
    }
  }
});

// Virtual for team name
teamSchema.virtual('teamName').get(async function() {
  const team = await Team.findById(this.team);
  return team ? team.name : 'Unknown';
});

// Virtual for creator name
teamSchema.virtual('creatorName').get(async function() {
  const creator = await User.findById(this.createdBy);
  return creator ? `${creator.firstName} ${creator.lastName}` : 'Unknown';
});

// Pre-save middleware to validate assigned users
reportSchema.pre('save', async function(next) {
  try {
    // Validate team exists
    const team = await Team.findById(this.team);
    if (!team) {
      throw new Error('Team does not exist');
    }

    // Validate creator exists
    const creator = await User.findById(this.createdBy);
    if (!creator) {
      throw new Error('Creator does not exist');
    }

    // Validate assigned users exist and belong to team
    if (this.assignedTo && this.assignedTo.length > 0) {
      const assignedUsers = await User.find({ _id: { $in: this.assignedTo } });
      if (assignedUsers.length !== this.assignedTo.length) {
        throw new Error('Some assigned users do not exist');
      }

      // Check if all assigned users belong to the team
      const teamMembers = await Team.findById(this.team)
        .populate('members')
        .select('members');

      const validMembers = teamMembers?.members.map(m => m._id.toString()) || [];
      const invalidMembers = this.assignedTo.filter(userId => 
        !validMembers.includes(userId.toString())
      );

      if (invalidMembers.length > 0) {
        throw new Error('Some assigned users are not in the team');
      }
    }

    next();
  } catch (error) {
    next(error);
  }
});

// Post-save middleware to notify assigned users
reportSchema.post('save', async function(doc) {
  try {
    // Notify assigned users
    if (doc.assignedTo && doc.assignedTo.length > 0) {
      const assignedUsers = await User.find({ _id: { $in: doc.assignedTo } });
      assignedUsers.forEach(user => {
        socketHandler.io.emit('notification:create', {
          userId: user._id,
          message: `New report assigned: ${doc.title}`,
          type: 'info'
        });
      });
    }
  } catch (error) {
    console.error('Error notifying assigned users:', error);
  }
});

const Report = mongoose.model<IReport>('Report', reportSchema);
export default Report;
