const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Task = require('./models/Task');
const Feedback = require('./models/Feedback');

dotenv.config();

mongoose.connect(process.env.MONGO_URI);

const importData = async () => {
  try {
    await User.deleteMany();
    await Task.deleteMany();
    await Feedback.deleteMany();

    // ── Users ──────────────────────────────────────────────
    const admin = await User.create({
      name: 'System Admin',
      email: 'admin@system.com',
      password: 'password123',
      role: 'admin',
    });

    const employer = await User.create({
      name: 'John Employer',
      email: 'employer@company.com',
      password: 'password123',
      role: 'employer',
    });

    const manager = await User.create({
      name: 'Sarah Manager',
      email: 'manager@company.com',
      password: 'password123',
      role: 'manager',
      assignedEmployer: employer._id,
    });

    const employee1 = await User.create({
      name: 'Mike Employee',
      email: 'employee1@company.com',
      password: 'password123',
      role: 'employee',
      assignedManager: manager._id,
    });

    const employee2 = await User.create({
      name: 'Jane Employee',
      email: 'employee2@company.com',
      password: 'password123',
      role: 'employee',
      assignedManager: manager._id,
    });

    const employee3 = await User.create({
      name: 'Alex Developer',
      email: 'employee3@company.com',
      password: 'password123',
      role: 'employee',
      assignedManager: manager._id,
    });

    // ── Tasks ──────────────────────────────────────────────
    const task1 = await Task.create({
      title: 'Design Dashboard UI',
      description: 'Create high-fidelity wireframes for the new analytics dashboard with dark mode support.',
      assignedTo: employee1._id,
      assignedBy: manager._id,
      status: 'completed',
      priority: 'high',
      deadline: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      workUpdate: 'All wireframes completed and approved. Dark mode variants done.',
    });

    const task2 = await Task.create({
      title: 'Implement JWT Authentication',
      description: 'Build secure JWT-based authentication flow including refresh tokens and logout.',
      assignedTo: employee2._id,
      assignedBy: manager._id,
      status: 'in-progress',
      priority: 'high',
      deadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      workUpdate: 'Login and registration endpoints complete. Working on refresh token logic.',
    });

    const task3 = await Task.create({
      title: 'Write Unit Tests for API',
      description: 'Cover all REST endpoints with Jest unit tests, targeting 80%+ coverage.',
      assignedTo: employee3._id,
      assignedBy: manager._id,
      status: 'pending',
      priority: 'medium',
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    const task4 = await Task.create({
      title: 'Database Schema Optimization',
      description: 'Review and optimize MongoDB indexes for performance on high-traffic collections.',
      assignedTo: employee1._id,
      assignedBy: manager._id,
      status: 'in-progress',
      priority: 'medium',
      deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      workUpdate: 'Indexes analyzed. Writing migration script for compound indexes.',
    });

    const task5 = await Task.create({
      title: 'Mobile Responsive Layout',
      description: 'Ensure all dashboard pages are fully responsive on mobile and tablet breakpoints.',
      assignedTo: employee2._id,
      assignedBy: manager._id,
      status: 'completed',
      priority: 'high',
      deadline: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      workUpdate: 'All pages tested on iPhone SE, iPad, and Galaxy S21. Issues resolved.',
    });

    const task6 = await Task.create({
      title: 'Deploy to Staging Server',
      description: 'Configure CI/CD pipeline and deploy the application to the AWS staging environment.',
      assignedTo: employee3._id,
      assignedBy: manager._id,
      status: 'pending',
      priority: 'low',
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    });

    const task7 = await Task.create({
      title: 'Code Review & Documentation',
      description: 'Review all PRs for the sprint and update API documentation in Swagger.',
      assignedTo: employee1._id,
      assignedBy: manager._id,
      status: 'completed',
      priority: 'low',
      deadline: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
      workUpdate: 'All PRs reviewed. Swagger docs updated with new endpoints.',
    });

    // ── Feedback ──────────────────────────────────────────────
    await Feedback.create({
      givenBy: manager._id,
      givenTo: employee1._id,
      taskId: task1._id,
      message: 'Excellent work on the dashboard UI! The dark mode implementation was particularly impressive. Well structured and easy to iterate on.',
      rating: 5,
      employeeReply: 'Thank you! I focused on accessibility and making the components reusable for future pages.',
      repliedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    });

    await Feedback.create({
      givenBy: manager._id,
      givenTo: employee2._id,
      taskId: task5._id,
      message: 'Good work on the responsive layout. A few edge cases on very small screens need attention in the next sprint.',
      rating: 4,
      employeeReply: '',
    });

    await Feedback.create({
      givenBy: manager._id,
      givenTo: employee1._id,
      taskId: task7._id,
      message: 'The documentation and code review was thorough and detailed. Great attention to edge cases.',
      rating: 5,
    });

    await Feedback.create({
      givenBy: manager._id,
      givenTo: employee3._id,
      message: 'You are making good progress overall. Please ensure test cases cover error scenarios more thoroughly.',
      rating: 3,
    });

    console.log('✅ Data Imported Successfully!');
    console.log('');
    console.log('📋 Quick Login Credentials:');
    console.log('  Admin:    admin@system.com / password123');
    console.log('  Employer: employer@company.com / password123');
    console.log('  Manager:  manager@company.com / password123');
    console.log('  Employee: employee1@company.com / password123');
    process.exit();
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await User.deleteMany();
    await Task.deleteMany();
    await Feedback.deleteMany();

    console.log('✅ Data Destroyed!');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
