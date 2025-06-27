import mongoose, { Schema, Document } from 'mongoose';
import User from './User';
import Team from './Team';
import Report from './Report';

export interface IDashboard extends Document {
  name: string;
  description: string;
  widgets: {
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
  }[];
  team: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  sharedWith: mongoose.Types.ObjectId[];
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const dashboardSchema = new Schema({
  name: {
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
  widgets: [{
    type: {
      type: String,
      enum: ['chart', 'table', 'metric', 'timeline', 'map'],
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true
    },
    data: {
      type: Map,
      of: Schema.Types.Mixed,
      required: true
    },
    config: {
      type: Map,
      of: Schema.Types.Mixed,
      required: true
    },
    position: {
      row: {
        type: Number,
        required: true
      },
      col: {
        type: Number,
        required: true
      },
      sizeX: {
        type: Number,
        required: true
      },
      sizeY: {
        type: Number,
        required: true
      }
    }
  }],
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
  sharedWith: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  metadata: {
    type: Map,
    of: Schema.Types.Mixed
  }
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
dashboardSchema.virtual('teamName').get(async function() {
  const team = await Team.findById(this.team);
  return team ? team.name : 'Unknown';
});

// Virtual for creator name
dashboardSchema.virtual('creatorName').get(async function() {
  const creator = await User.findById(this.createdBy);
  return creator ? `${creator.firstName} ${creator.lastName}` : 'Unknown';
});

// Pre-save middleware to validate shared users
dashboardSchema.pre('save', async function(next) {
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

    // Validate shared users exist and belong to team
    if (this.sharedWith && this.sharedWith.length > 0) {
      const sharedUsers = await User.find({ _id: { $in: this.sharedWith } });
      if (sharedUsers.length !== this.sharedWith.length) {
        throw new Error('Some shared users do not exist');
      }

      // Check if all shared users belong to the team
      const teamMembers = await Team.findById(this.team)
        .populate('members')
        .select('members');

      const validMembers = teamMembers?.members.map(m => m._id.toString()) || [];
      const invalidMembers = this.sharedWith.filter(userId => 
        !validMembers.includes(userId.toString())
      );

      if (invalidMembers.length > 0) {
        throw new Error('Some shared users are not in the team');
      }
    }

    next();
  } catch (error) {
    next(error);
  }
});

// Post-save middleware to notify shared users
dashboardSchema.post('save', async function(doc) {
  try {
    // Notify shared users
    if (doc.sharedWith && doc.sharedWith.length > 0) {
      const sharedUsers = await User.find({ _id: { $in: doc.sharedWith } });
      sharedUsers.forEach(user => {
        socketHandler.io.emit('notification:create', {
          userId: user._id,
          message: `New dashboard shared: ${doc.name}`,
          type: 'info'
        });
      });
    }
  } catch (error) {
    console.error('Error notifying shared users:', error);
  }
});

const Dashboard = mongoose.model<IDashboard>('Dashboard', dashboardSchema);
export default Dashboard;
