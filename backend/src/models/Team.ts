import mongoose, { Schema, Document } from 'mongoose';
import User from './User';

export interface ITeam extends Document {
  name: string;
  description: string;
  members: mongoose.Types.ObjectId[];
  leader: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const teamSchema = new Schema({
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
  members: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  leader: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'archived'],
    default: 'active'
  },
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

// Virtual for team members count
teamSchema.virtual('memberCount').get(function() {
  return this.members.length;
});

// Virtual for team leader name
teamSchema.virtual('leaderName').get(async function() {
  const leader = await User.findById(this.leader);
  return leader ? `${leader.firstName} ${leader.lastName}` : 'Unknown';
});

// Pre-save middleware to validate team leader
teamSchema.pre('save', async function(next) {
  try {
    const leader = await User.findById(this.leader);
    if (!leader) {
      throw new Error('Team leader must be a valid user');
    }
    next();
  } catch (error) {
    next(error);
  }
});

// Post-save middleware to update user teams
teamSchema.post('save', async function(doc) {
  try {
    await User.findByIdAndUpdate(doc.leader, {
      $addToSet: { teams: doc._id }
    });

    await Promise.all(
      doc.members.map(memberId =>
        User.findByIdAndUpdate(memberId, {
          $addToSet: { teams: doc._id }
        })
      )
    );
  } catch (error) {
    console.error('Error updating user teams:', error);
  }
});

// Post-remove middleware to remove team from users
teamSchema.post('remove', async function(doc) {
  try {
    await User.findByIdAndUpdate(doc.leader, {
      $pull: { teams: doc._id }
    });

    await Promise.all(
      doc.members.map(memberId =>
        User.findByIdAndUpdate(memberId, {
          $pull: { teams: doc._id }
        })
      )
    );
  } catch (error) {
    console.error('Error removing team from users:', error);
  }
});

const Team = mongoose.model<ITeam>('Team', teamSchema);
export default Team;
