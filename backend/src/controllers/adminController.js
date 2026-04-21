const User = require('../models/User');
const Task = require('../models/Task');
const { sendSuccess, sendError, sendPaginated } = require('../utils/apiResponse');
const logger = require('../utils/logger');

/**
 * @route   GET /api/v1/admin/users
 * @access  Admin
 */
const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, role, search, isActive } = req.query;

    const query = {};
    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [users, total] = await Promise.all([
      User.find(query).select('-refreshToken').sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      User.countDocuments(query),
    ]);

    return sendPaginated(res, 'Users retrieved', users, page, limit, total);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/v1/admin/users/:id
 * @access  Admin
 */
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-refreshToken').populate('taskCount');
    if (!user) return sendError(res, 404, 'User not found');
    return sendSuccess(res, 200, 'User retrieved', user);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/v1/admin/users/:id/role
 * @access  Admin
 */
const updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return sendError(res, 400, 'Role must be user or admin');
    }

    if (req.params.id === req.user._id.toString()) {
      return sendError(res, 400, 'Admins cannot change their own role');
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, runValidators: true }
    );
    if (!user) return sendError(res, 404, 'User not found');

    logger.info(`Admin ${req.user._id} changed role of user ${req.params.id} to ${role}`);
    return sendSuccess(res, 200, 'User role updated', { id: user._id, role: user.role });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/v1/admin/users/:id/status
 * @access  Admin
 */
const toggleUserStatus = async (req, res, next) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return sendError(res, 400, 'Cannot deactivate your own account');
    }

    const user = await User.findById(req.params.id);
    if (!user) return sendError(res, 404, 'User not found');

    user.isActive = !user.isActive;
    await user.save({ validateBeforeSave: false });

    logger.info(`Admin ${req.user._id} toggled status of user ${req.params.id} to ${user.isActive}`);
    return sendSuccess(res, 200, `User ${user.isActive ? 'activated' : 'deactivated'}`, {
      id: user._id,
      isActive: user.isActive,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/v1/admin/users/:id
 * @access  Admin
 */
const deleteUser = async (req, res, next) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return sendError(res, 400, 'Cannot delete your own account');
    }

    const user = await User.findById(req.params.id);
    if (!user) return sendError(res, 404, 'User not found');

    await Task.deleteMany({ createdBy: user._id });
    await user.deleteOne();

    logger.info(`Admin ${req.user._id} deleted user ${req.params.id}`);
    return sendSuccess(res, 200, 'User and their tasks deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/v1/admin/tasks
 * @access  Admin
 */
const getAllTasks = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, priority, userId } = req.query;
    const query = {};
    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (userId) query.createdBy = userId;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [tasks, total] = await Promise.all([
      Task.find(query)
        .populate('createdBy', 'name email')
        .populate('assignedTo', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Task.countDocuments(query),
    ]);

    return sendPaginated(res, 'All tasks retrieved', tasks, page, limit, total);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/v1/admin/stats
 * @access  Admin
 */
const getPlatformStats = async (req, res, next) => {
  try {
    const [userStats, taskStats] = await Promise.all([
      User.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            admins: { $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] } },
            active: { $sum: { $cond: ['$isActive', 1, 0] } },
          },
        },
      ]),
      Task.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const taskByStatus = {};
    taskStats.forEach((s) => { taskByStatus[s._id] = s.count; });

    return sendSuccess(res, 200, 'Platform statistics', {
      users: userStats[0] || { total: 0, admins: 0, active: 0 },
      tasks: taskByStatus,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers, getUserById, updateUserRole, toggleUserStatus,
  deleteUser, getAllTasks, getPlatformStats,
};
