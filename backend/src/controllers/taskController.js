const Task = require('../models/Task');
const { sendSuccess, sendError, sendPaginated } = require('../utils/apiResponse');
const logger = require('../utils/logger');

/**
 * @route   GET /api/v1/tasks
 * @access  Private
 * Query params: page, limit, status, priority, search, sortBy, sortOrder
 */
const getTasks = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      priority,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      tags,
    } = req.query;

    const query = { createdBy: req.user._id };

    if (status) query.status = status;
    if (priority) query.priority = priority;
    if (tags) query.tags = { $in: tags.split(',') };
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [tasks, total] = await Promise.all([
      Task.find(query)
        .populate('assignedTo', 'name email')
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Task.countDocuments(query),
    ]);

    return sendPaginated(res, 'Tasks retrieved', tasks, page, limit, total);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/v1/tasks
 * @access  Private
 */
const createTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, dueDate, tags, assignedTo, isPublic } = req.body;

    const task = await Task.create({
      title,
      description,
      status,
      priority,
      dueDate,
      tags,
      assignedTo,
      isPublic,
      createdBy: req.user._id,
    });

    await task.populate('assignedTo', 'name email');

    logger.info(`Task created: ${task._id} by user: ${req.user._id}`);
    return sendSuccess(res, 201, 'Task created successfully', task);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/v1/tasks/:id
 * @access  Private
 */
const getTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email');

    if (!task) {
      return sendError(res, 404, 'Task not found');
    }

    // Check ownership
    if (
      req.user.role !== 'admin' &&
      task.createdBy._id.toString() !== req.user._id.toString() &&
      !task.isPublic
    ) {
      return sendError(res, 403, 'You are not authorized to access this task');
    }

    return sendSuccess(res, 200, 'Task retrieved', task);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/v1/tasks/:id
 * @access  Private
 */
const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return sendError(res, 404, 'Task not found');
    }

    if (req.user.role !== 'admin' && task.createdBy.toString() !== req.user._id.toString()) {
      return sendError(res, 403, 'You are not authorized to update this task');
    }

    const { title, description, status, priority, dueDate, tags, assignedTo, isPublic } = req.body;

    const updates = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (status !== undefined) updates.status = status;
    if (priority !== undefined) updates.priority = priority;
    if (dueDate !== undefined) updates.dueDate = dueDate;
    if (tags !== undefined) updates.tags = tags;
    if (assignedTo !== undefined) updates.assignedTo = assignedTo;
    if (isPublic !== undefined) updates.isPublic = isPublic;

    // Handle completedAt via pre-save hook
    Object.assign(task, updates);
    await task.save();
    await task.populate('assignedTo', 'name email');
    await task.populate('createdBy', 'name email');

    logger.info(`Task updated: ${task._id} by user: ${req.user._id}`);
    return sendSuccess(res, 200, 'Task updated successfully', task);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/v1/tasks/:id
 * @access  Private
 */
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return sendError(res, 404, 'Task not found');
    }

    if (req.user.role !== 'admin' && task.createdBy.toString() !== req.user._id.toString()) {
      return sendError(res, 403, 'You are not authorized to delete this task');
    }

    await task.deleteOne();

    logger.info(`Task deleted: ${req.params.id} by user: ${req.user._id}`);
    return sendSuccess(res, 200, 'Task deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/v1/tasks/stats
 * @access  Private
 */
const getTaskStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const stats = await Task.aggregate([
      { $match: { createdBy: userId } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          todo: { $sum: { $cond: [{ $eq: ['$status', 'todo'] }, 1, 0] } },
          in_progress: { $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] } },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
          archived: { $sum: { $cond: [{ $eq: ['$status', 'archived'] }, 1, 0] } },
          high_priority: { $sum: { $cond: [{ $in: ['$priority', ['high', 'urgent']] }, 1, 0] } },
          overdue: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $lt: ['$dueDate', new Date()] },
                    { $ne: ['$status', 'completed'] },
                    { $ne: ['$dueDate', null] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
    ]);

    const result = stats[0] || {
      total: 0, todo: 0, in_progress: 0, completed: 0, archived: 0,
      high_priority: 0, overdue: 0
    };
    delete result._id;

    return sendSuccess(res, 200, 'Task statistics retrieved', result);
  } catch (error) {
    next(error);
  }
};

module.exports = { getTasks, createTask, getTask, updateTask, deleteTask, getTaskStats };
