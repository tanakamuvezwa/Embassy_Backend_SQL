const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/auth');
const visaRoutes = require('./routes/visa');
const citizenRoutes = require('./routes/citizen');
const appointmentRoutes = require('./routes/appointment');
const documentRoutes = require('./routes/document');
const staffRoutes = require('./routes/staff');

// Import database
const { sequelize } = require('./models');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/visa', visaRoutes);
app.use('/api/citizen', citizenRoutes);
app.use('/api/appointment', appointmentRoutes);
app.use('/api/document', documentRoutes);
app.use('/api/staff', staffRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Embassy of Equatorial Guinea Backend is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Serve the main HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'Embassy.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: 'The requested endpoint does not exist'
  });
});

// Database sync and server start
async function startServer() {
  try {
    await sequelize.sync({ alter: true });
    console.log('Database synchronized successfully');
    
    app.listen(PORT, () => {
      console.log(`🚀 Embassy Backend Server running on port ${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🌐 Frontend: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer(); 