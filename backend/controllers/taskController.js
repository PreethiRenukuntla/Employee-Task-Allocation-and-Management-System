const Task = require('../models/Task');
const User = require('../models/User');

// @desc      Get tasks
// @route     GET /api/tasks
// @access    Private
exports.getTasks = async (req, res) => {
  try {
    let query;

    if (req.user.role === 'admin' || req.user.role === 'employer') {
      query = Task.find();
    } else if (req.user.role === 'manager') {
      query = Task.find({ assignedBy: req.user.id });
    } else if (req.user.role === 'employee') {
      query = Task.find({ assignedTo: req.user.id });
    }

    const tasks = await query
      .populate('assignedTo', 'name email role')
      .populate('assignedBy', 'name email role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc      Get single task
// @route     GET /api/tasks/:id
// @access    Private
exports.getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email role')
      .populate('assignedBy', 'name email role');

    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }

    res.status(200).json({ success: true, data: task });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc      Create new task
// @route     POST /api/tasks
// @access    Private/Manager/Admin
exports.createTask = async (req, res) => {
  try {
    req.body.assignedBy = req.user.id;
    const task = await Task.create(req.body);
    const populated = await task.populate([
      { path: 'assignedTo', select: 'name email role' },
      { path: 'assignedBy', select: 'name email role' },
    ]);

    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc      Update task
// @route     PUT /api/tasks/:id
// @access    Private
exports.updateTask = async (req, res) => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }

    if (req.user.role === 'employee') {
      const allowed = {};
      if (req.body.status) allowed.status = req.body.status;
      if (req.body.workUpdate !== undefined) allowed.workUpdate = req.body.workUpdate;

      // Auto completedAt
      if (allowed.status === 'completed' && !task.completedAt) {
        allowed.completedAt = new Date();
      }

      task = await Task.findByIdAndUpdate(req.params.id, allowed, { new: true, runValidators: true });
      return res.status(200).json({ success: true, data: task });
    }

    if (req.user.role === 'manager' && task.assignedBy.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Not authorized to update this task' });
    }

    // Auto completedAt for non-employees
    if (req.body.status === 'completed' && !task.completedAt) {
      req.body.completedAt = new Date();
    }

    task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, data: task });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc      Delete task
// @route     DELETE /api/tasks/:id
// @access    Private/Manager/Admin
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, error: 'Task not found' });
    }

    await Task.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc      Get task statistics
// @route     GET /api/tasks/stats
// @access    Private
exports.getTaskStats = async (req, res) => {
  try {
    let matchQuery = {};

    if (req.user.role === 'manager') {
      matchQuery = { assignedBy: req.user._id };
    } else if (req.user.role === 'employee') {
      matchQuery = { assignedTo: req.user._id };
    }

    // Status distribution
    const statusStats = await Task.aggregate([
      { $match: matchQuery },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    // Tasks per employee (for managers/employers/admins)
    let perEmployee = [];
    if (req.user.role !== 'employee') {
      perEmployee = await Task.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: '$assignedTo',
            total: { $sum: 1 },
            completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] } },
            pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
            inProgress: { $sum: { $cond: [{ $eq: ['$status', 'in-progress'] }, 1, 0] } },
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'employee',
          },
        },
        { $unwind: '$employee' },
        {
          $project: {
            name: '$employee.name',
            total: 1,
            completed: 1,
            pending: 1,
            inProgress: 1,
          },
        },
      ]);
    }

    // Weekly completion trend (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const weeklyTrend = await Task.aggregate([
      {
        $match: {
          ...matchQuery,
          completedAt: { $gte: sevenDaysAgo },
          status: 'completed',
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$completedAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.status(200).json({
      success: true,
      data: { statusStats, perEmployee, weeklyTrend },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
