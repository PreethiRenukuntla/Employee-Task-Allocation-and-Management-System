const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Task = require('./models/Task');
const Feedback = require('./models/Feedback');

dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  try {
    // Find a manager
    const manager = await User.findOne({ role: 'manager' });
    if (!manager) {
      console.log('No manager found to assign tasks from!');
      process.exit(1);
    }

    // Find all employees
    const employees = await User.find({ role: 'employee' });

    for (const emp of employees) {
      // Check if employee has tasks
      const taskCount = await Task.countDocuments({ assignedTo: emp._id });
      if (taskCount === 0) {
        console.log('Assigning tasks to new employee: ' + emp.name);
        
        const task1 = await Task.create({
          title: 'Onboarding & System Setup',
          description: 'Get familiar with TaskFlow and set up your local development environment.',
          assignedTo: emp._id,
          assignedBy: manager._id,
          status: 'completed',
          priority: 'high',
          deadline: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          workUpdate: 'Setup complete, tools installed.'
        });

        const task2 = await Task.create({
          title: 'Review Recent PRs',
          description: 'Look through the latest pull requests and familiarize yourself with code standards.',
          assignedTo: emp._id,
          assignedBy: manager._id,
          status: 'in-progress',
          priority: 'medium',
          deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
        });

        const task3 = await Task.create({
          title: 'Fix UI Bug on Dashboard',
          description: 'There is a minor alignment issue on the mobile dashboard. Please fix it.',
          assignedTo: emp._id,
          assignedBy: manager._id,
          status: 'pending',
          priority: 'low',
          deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
        });

        await Feedback.create({
          givenBy: manager._id,
          givenTo: emp._id,
          taskId: task1._id,
          message: 'Great job getting set up so quickly! Welcome to the team.',
          rating: 4
        });
      }
    }
    
    console.log('Successfully assigned tasks to all empty users!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
});
