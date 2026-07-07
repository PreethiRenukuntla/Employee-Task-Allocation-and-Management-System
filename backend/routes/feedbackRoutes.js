const express = require('express');
const {
  getFeedbacks,
  createFeedback,
  replyFeedback,
  deleteFeedback,
} = require('../controllers/feedbackController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router
  .route('/')
  .get(getFeedbacks)
  .post(authorize('manager', 'admin'), createFeedback);

router.put('/:id/reply', authorize('employee'), replyFeedback);

router.delete('/:id', authorize('manager', 'admin'), deleteFeedback);

module.exports = router;
