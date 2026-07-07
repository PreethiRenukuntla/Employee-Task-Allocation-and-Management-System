const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema({
  givenBy: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  givenTo: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true,
  },
  taskId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Task',
    default: null,
  },
  message: {
    type: String,
    required: [true, 'Please add a feedback message'],
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: [true, 'Please provide a rating between 1 and 5'],
  },
  employeeReply: {
    type: String,
    default: '',
  },
  repliedAt: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Feedback', FeedbackSchema);
