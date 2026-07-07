const Feedback = require('../models/Feedback');

// @desc      Get feedbacks
// @route     GET /api/feedback
// @access    Private
exports.getFeedbacks = async (req, res) => {
  try {
    let query;

    if (req.user.role === 'admin' || req.user.role === 'employer') {
      query = Feedback.find();
    } else if (req.user.role === 'manager') {
      query = Feedback.find({ givenBy: req.user.id });
    } else if (req.user.role === 'employee') {
      query = Feedback.find({ givenTo: req.user.id });
    }

    const feedbacks = await query
      .populate('givenBy', 'name email role')
      .populate('givenTo', 'name email role')
      .populate('taskId', 'title')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: feedbacks.length,
      data: feedbacks,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// @desc      Create feedback
// @route     POST /api/feedback
// @access    Private/Manager
exports.createFeedback = async (req, res) => {
  try {
    req.body.givenBy = req.user.id;

    const feedback = await Feedback.create(req.body);
    const populated = await feedback.populate([
      { path: 'givenBy', select: 'name email role' },
      { path: 'givenTo', select: 'name email role' },
      { path: 'taskId', select: 'title' },
    ]);

    res.status(201).json({ success: true, data: populated });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc      Employee replies to feedback
// @route     PUT /api/feedback/:id/reply
// @access    Private/Employee
exports.replyFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({ success: false, error: 'Feedback not found' });
    }

    // Only the employee who received the feedback can reply
    if (feedback.givenTo.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Not authorized to reply to this feedback' });
    }

    feedback.employeeReply = req.body.reply;
    feedback.repliedAt = new Date();
    await feedback.save();

    const populated = await feedback.populate([
      { path: 'givenBy', select: 'name email role' },
      { path: 'givenTo', select: 'name email role' },
      { path: 'taskId', select: 'title' },
    ]);

    res.status(200).json({ success: true, data: populated });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// @desc      Delete feedback
// @route     DELETE /api/feedback/:id
// @access    Private/Manager/Admin
exports.deleteFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);

    if (!feedback) {
      return res.status(404).json({ success: false, error: 'Feedback not found' });
    }

    if (req.user.role === 'manager' && feedback.givenBy.toString() !== req.user.id) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    await Feedback.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};
