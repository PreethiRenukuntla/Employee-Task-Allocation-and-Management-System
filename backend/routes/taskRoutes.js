const express = require('express');
const {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
  getTaskStats,
} = require('../controllers/taskController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/stats', getTaskStats);

router
  .route('/')
  .get(getTasks)
  .post(authorize('manager', 'admin'), createTask);

router
  .route('/:id')
  .get(getTask)
  .put(updateTask)
  .delete(authorize('manager', 'admin'), deleteTask);

module.exports = router;
