const User = require('../models/User');
const Task = require('../models/Task');
const Feedback = require('../models/Feedback');

// @desc      Get all users
// @route     GET /api/users
// @access    Private/Admin/Employer/Manager
exports.getUsers = async (req, res) => {
  try {
    let query;

    if (req.user.role === 'admin') {
      query = User.find();
    } else if (req.user.role === 'employer') {
      query = User.find({ role: { $in: ['manager', 'employee'] } });
    } else if (req.user.role === 'manager') {
      query = User.find({ role: 'employee', assignedManager: req.user.id });
    } else {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    const users = await query
      .populate('assignedManager', 'name email')
      .populate('assignedEmployer', 'name email');

    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc      Create user
// @route     POST /api/users
// @access    Private/Admin
exports.createUser = async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json({ success: true, data: user });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc      Update user
// @route     PUT /api/users/:id
// @access    Private/Admin
exports.updateUser = async (req, res) => {
  try {
    if (req.body.password) {
      delete req.body.password;
    }

    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    res.status(200).json({ success: true, data: user });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc      Delete user
// @route     DELETE /api/users/:id
// @access    Private/Admin
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc      Assign employee to manager's team
// @route     PUT /api/users/:id/assign
// @access    Private/Manager/Admin
exports.assignEmployeeToManager = async (req, res) => {
  try {
    const employee = await User.findById(req.params.id);

    if (!employee) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    if (employee.role !== 'employee') {
      return res.status(400).json({ success: false, error: 'Target user must be an employee' });
    }

    const { managerId, action } = req.body; // action: 'assign' | 'remove'
    const targetManagerId = req.user.role === 'manager' ? req.user.id : managerId;

    if (action === 'remove') {
      employee.assignedManager = null;
    } else {
      employee.assignedManager = targetManagerId;
    }

    await employee.save();

    res.status(200).json({ success: true, data: employee });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc      Get performance stats per user
// @route     GET /api/users/performance
// @access    Private/Admin/Employer/Manager
exports.getPerformanceStats = async (req, res) => {
  try {
    let userFilter = { role: 'employee' };

    if (req.user.role === 'manager') {
      userFilter.assignedManager = req.user._id;
    }

    const employees = await User.find(userFilter).select('name email role');

    const performanceData = await Promise.all(
      employees.map(async (emp) => {
        const tasks = await Task.find({ assignedTo: emp._id });
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter((t) => t.status === 'completed').length;
        const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        // On-time delivery
        const onTime = tasks.filter(
          (t) =>
            t.status === 'completed' &&
            t.completedAt &&
            new Date(t.completedAt) <= new Date(t.deadline)
        ).length;
        const onTimeRate = completedTasks > 0 ? Math.round((onTime / completedTasks) * 100) : 0;

        // Average feedback rating
        const feedbacks = await Feedback.find({ givenTo: emp._id });
        const avgRating =
          feedbacks.length > 0
            ? (feedbacks.reduce((acc, f) => acc + f.rating, 0) / feedbacks.length).toFixed(1)
            : 0;

        return {
          _id: emp._id,
          name: emp.name,
          email: emp.email,
          role: emp.role,
          totalTasks,
          completedTasks,
          completionRate,
          onTimeRate,
          avgRating: parseFloat(avgRating),
          feedbackCount: feedbacks.length,
        };
      })
    );

    res.status(200).json({ success: true, data: performanceData });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc      Get all unassigned employees (for adding to team)
// @route     GET /api/users/unassigned
// @access    Private/Manager
exports.getUnassignedEmployees = async (req, res) => {
  try {
    const employees = await User.find({
      role: 'employee',
      assignedManager: null,
    }).select('name email role');

    res.status(200).json({ success: true, data: employees });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
