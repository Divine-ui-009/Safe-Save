import mongoose from 'mongoose';

const groupSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a group name'],
      unique: true,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    savingsGoal: {
      type: Number,
      default: 0,
    },
    currentSavings: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Generate a random 6-character alphanumeric code for the group
const generateGroupCode = () => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

// Generate and set the group code before saving if not provided
groupSchema.pre('save', function (next) {
  if (!this.code) {
    this.code = generateGroupCode();
  }
  next();
});

export default mongoose.model('Group', groupSchema);
