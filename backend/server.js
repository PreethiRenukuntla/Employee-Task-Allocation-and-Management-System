const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());

// Enable CORS
app.use(cors());

// Set security headers
app.use(helmet());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Route files
const auth = require('./routes/authRoutes');
const users = require('./routes/userRoutes');
const tasks = require('./routes/taskRoutes');
const feedback = require('./routes/feedbackRoutes');

// Mount Routes
app.use('/api/auth', auth);
app.use('/api/users', users);
app.use('/api/tasks', tasks);
app.use('/api/feedback', feedback);

app.get('/', (req, res) => {
  res.send('API is running...');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`));
