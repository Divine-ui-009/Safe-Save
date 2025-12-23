// backend/src/controllers/groupController.js
import Group from '../models/Group.js';
import User from '../models/User.js';
import { AppError } from '../middleware/errorHandler.js';

// @desc    Create a group
// @route   POST /api/groups
// @access  Private
export const createGroup = async (req, res, next) => {
  try {
    const { name, savingsGoal } = req.body;

    // Check if user is already in a group
    if (req.user.group) {
      throw new AppError('You are already in a group', 400);
    }

    // Create group
    const group = await Group.create({
      name,
      admin: req.user.id,
      members: [req.user.id],
      savingsGoal
    });

    // Add group to user
    await User.findByIdAndUpdate(req.user.id, { 
      group: group._id,
      role: 'group_admin' 
    });

    res.status(201).json({
      success: true,
      data: group
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all groups
// @route   GET /api/groups
// @access  Private/Admin
export const getGroups = async (req, res, next) => {
  try {
    const groups = await Group.find().populate('admin', 'name email');
    res.status(200).json({
      success: true,
      count: groups.length,
      data: groups
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single group
// @route   GET /api/groups/:id
// @access  Private
export const getGroup = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('admin', 'name email')
      .populate('members', 'name email phone');

    if (!group) {
      throw new AppError(`No group with the id of ${req.params.id}`, 404);
    }

    // Make sure user is group member or admin
    if (
      group.members.some(member => member._id.toString() === req.user.id) ||
      req.user.role === 'admin'
    ) {
      res.status(200).json({
        success: true,
        data: group
      });
    } else {
      throw new AppError('Not authorized to access this group', 401);
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Update group
// @route   PUT /api/groups/:id
// @access  Private/GroupAdmin
export const updateGroup = async (req, res, next) => {
  try {
    let group = await Group.findById(req.params.id);

    if (!group) {
      throw new AppError(`No group with the id of ${req.params.id}`, 404);
    }

    // Make sure user is group admin
    if (group.admin.toString() !== req.user.id && req.user.role !== 'admin') {
      throw new AppError(
        `User ${req.user.id} is not authorized to update this group`,
        401
      );
    }

    group = await Group.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: group
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete group
// @route   DELETE /api/groups/:id
// @access  Private/GroupAdmin
export const deleteGroup = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id);

    if (!group) {
      throw new AppError(`No group with the id of ${req.params.id}`, 404);
    }

    // Make sure user is group admin
    if (group.admin.toString() !== req.user.id && req.user.role !== 'admin') {
      throw new AppError(
        `User ${req.user.id} is not authorized to delete this group`,
        401
      );
    }

    // Remove group from all members
    await User.updateMany(
      { group: group._id },
      { $unset: { group: '' } }
    );

    await group.remove();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Join a group
// @route   POST /api/groups/join
// @access  Private
export const joinGroup = async (req, res, next) => {
  try {
    const { code } = req.body;

    if (!code) {
      throw new AppError('Please provide a group code', 400);
    }

    // Check if user is already in a group
    if (req.user.group) {
      throw new AppError('You are already in a group', 400);
    }

    // Find group by code
    const group = await Group.findOne({ code: code.toUpperCase() });

    if (!group) {
      throw new AppError('Invalid group code', 404);
    }

    // Add user to group
    if (!group.members.includes(req.user.id)) {
      group.members.push(req.user.id);
      await group.save();
    }

    // Add group to user
    await User.findByIdAndUpdate(req.user.id, { group: group._id });

    res.status(200).json({
      success: true,
      data: group
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Leave a group
// @route   PUT /api/groups/leave
// @access  Private
export const leaveGroup = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user.group) {
      throw new AppError('You are not in any group', 400);
    }

    const group = await Group.findById(user.group);

    if (!group) {
      // If group doesn't exist, just remove the group reference
      user.group = undefined;
      await user.save();
      throw new AppError('Group not found', 404);
    }

    // If user is the admin, delete the group
    if (group.admin.toString() === req.user.id) {
      // Remove group from all members
      await User.updateMany(
        { group: group._id },
        { $unset: { group: '' } }
      );
      await group.remove();
    } else {
      // Remove user from group
      group.members = group.members.filter(
        member => member.toString() !== req.user.id
      );
      await group.save();
    }

    // Remove group from user
    user.group = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};