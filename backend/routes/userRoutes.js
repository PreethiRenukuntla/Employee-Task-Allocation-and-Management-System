const express = require('express');
const {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  assignEmployeeToManager,
  getPerformanceStats,
  getUnassignedEmployees,
} = require('../controllers/userController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.use(protect);

router.get('/performance', authorize('admin', 'employer', 'manager'), getPerformanceStats);
router.get('/unassigned', authorize('manager', 'admin'), getUnassignedEmployees);

router
  .route('/')
  .get(authorize('admin', 'employer', 'manager'), getUsers)
  .post(authorize('admin'), createUser);

router
  .route('/:id')
  .put(authorize('admin'), updateUser)
  .delete(authorize('admin'), deleteUser);

router.put('/:id/assign', authorize('manager', 'admin'), assignEmployeeToManager);

module.exports = router;
