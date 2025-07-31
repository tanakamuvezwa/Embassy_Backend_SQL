const express = require('express');
const { body, validationResult } = require('express-validator');
const { Appointment, User, Staff } = require('../models');

const router = express.Router();

// Middleware to validate JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  const jwt = require('jsonwebtoken');
  const JWT_SECRET = process.env.JWT_SECRET || 'embassy-secret-key-2024';

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Create new appointment
router.post('/schedule', authenticateToken, [
  body('appointmentType').isIn(['visa_interview', 'document_submission', 'passport_collection', 'consultation', 'emergency', 'other']),
  body('scheduledDate').isISO8601(),
  body('duration').optional().isInt({ min: 15, max: 180 }),
  body('notes').optional()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      appointmentType,
      scheduledDate,
      duration = 30,
      priority = 'normal',
      notes,
      specialRequirements,
      interpreterRequired,
      interpreterLanguage,
      accessibilityNeeds
    } = req.body;

    // Check if the time slot is available
    const existingAppointment = await Appointment.findOne({
      where: {
        scheduledDate: new Date(scheduledDate),
        status: { [require('sequelize').Op.notIn]: ['cancelled', 'no_show'] }
      }
    });

    if (existingAppointment) {
      return res.status(400).json({ error: 'Time slot is not available' });
    }

    // Create appointment
    const appointment = await Appointment.create({
      userId: req.user.userId,
      appointmentType,
      scheduledDate: new Date(scheduledDate),
      duration,
      priority,
      notes,
      specialRequirements,
      interpreterRequired,
      interpreterLanguage,
      accessibilityNeeds
    });

    res.status(201).json({
      message: 'Appointment scheduled successfully',
      appointment
    });
  } catch (error) {
    console.error('Schedule appointment error:', error);
    res.status(500).json({ error: 'Failed to schedule appointment' });
  }
});

// Get user's appointments
router.get('/my-appointments', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, appointmentType } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = { userId: req.user.userId };
    if (status) whereClause.status = status;
    if (appointmentType) whereClause.appointmentType = appointmentType;

    const appointments = await Appointment.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['scheduledDate', 'ASC']]
    });

    res.json({
      appointments: appointments.rows,
      total: appointments.count,
      page: parseInt(page),
      totalPages: Math.ceil(appointments.count / limit)
    });
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

// Get specific appointment
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const appointment = await Appointment.findOne({
      where: {
        id: req.params.id,
        userId: req.user.userId
      }
    });

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    res.json({ appointment });
  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({ error: 'Failed to fetch appointment' });
  }
});

// Update appointment
router.put('/:id', authenticateToken, [
  body('scheduledDate').optional().isISO8601(),
  body('notes').optional()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const appointment = await Appointment.findOne({
      where: {
        id: req.params.id,
        userId: req.user.userId
      }
    });

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    // Only allow updates if appointment is scheduled
    if (appointment.status !== 'scheduled') {
      return res.status(400).json({ error: 'Cannot update appointment that is not scheduled' });
    }

    const allowedFields = ['scheduledDate', 'notes', 'specialRequirements'];
    const updateData = {};
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    await appointment.update(updateData);

    res.json({
      message: 'Appointment updated successfully',
      appointment
    });
  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({ error: 'Failed to update appointment' });
  }
});

// Cancel appointment
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const appointment = await Appointment.findOne({
      where: {
        id: req.params.id,
        userId: req.user.userId
      }
    });

    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    if (appointment.status === 'cancelled') {
      return res.status(400).json({ error: 'Appointment is already cancelled' });
    }

    await appointment.update({
      status: 'cancelled',
      cancellationReason: req.body.reason || 'Cancelled by user'
    });

    res.json({ message: 'Appointment cancelled successfully' });
  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({ error: 'Failed to cancel appointment' });
  }
});

// Admin routes
// Get all appointments (admin/staff only)
router.get('/admin/all', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId);
    if (!user || (user.role !== 'staff' && user.role !== 'admin')) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { page = 1, limit = 20, status, appointmentType, date } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (status) whereClause.status = status;
    if (appointmentType) whereClause.appointmentType = appointmentType;
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      whereClause.scheduledDate = {
        [require('sequelize').Op.between]: [startDate, endDate]
      };
    }

    const appointments = await Appointment.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['scheduledDate', 'ASC']]
    });

    res.json({
      appointments: appointments.rows,
      total: appointments.count,
      page: parseInt(page),
      totalPages: Math.ceil(appointments.count / limit)
    });
  } catch (error) {
    console.error('Admin get appointments error:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

// Update appointment status (admin only)
router.put('/admin/:id/status', authenticateToken, [
  body('status').isIn(['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show']),
  body('notes').optional()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await User.findByPk(req.user.userId);
    if (!user || (user.role !== 'staff' && user.role !== 'admin')) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { status, notes } = req.body;

    const appointment = await Appointment.findByPk(req.params.id);
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    const updateData = { status, notes };
    
    if (status === 'confirmed') {
      updateData.confirmedBy = req.user.userId;
      updateData.confirmedAt = new Date();
    } else if (status === 'completed') {
      updateData.completedAt = new Date();
    }

    await appointment.update(updateData);

    res.json({
      message: 'Appointment status updated successfully',
      appointment
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ error: 'Failed to update appointment status' });
  }
});

// Get available time slots
router.get('/available-slots', authenticateToken, async (req, res) => {
  try {
    const { date, duration = 30 } = req.query;
    
    if (!date) {
      return res.status(400).json({ error: 'Date is required' });
    }

    const selectedDate = new Date(date);
    const startOfDay = new Date(selectedDate);
    startOfDay.setHours(9, 0, 0, 0); // Embassy opens at 9 AM
    
    const endOfDay = new Date(selectedDate);
    endOfDay.setHours(17, 0, 0, 0); // Embassy closes at 5 PM

    // Get booked appointments for the day
    const bookedAppointments = await Appointment.findAll({
      where: {
        scheduledDate: {
          [require('sequelize').Op.between]: [startOfDay, endOfDay]
        },
        status: { [require('sequelize').Op.notIn]: ['cancelled', 'no_show'] }
      },
      order: [['scheduledDate', 'ASC']]
    });

    // Generate available time slots
    const availableSlots = [];
    const slotDuration = parseInt(duration);
    let currentTime = new Date(startOfDay);

    while (currentTime < endOfDay) {
      const slotEnd = new Date(currentTime.getTime() + slotDuration * 60000);
      
      // Check if this slot conflicts with any booked appointment
      const isAvailable = !bookedAppointments.some(appointment => {
        const appointmentStart = new Date(appointment.scheduledDate);
        const appointmentEnd = new Date(appointmentStart.getTime() + appointment.duration * 60000);
        
        return (currentTime < appointmentEnd && slotEnd > appointmentStart);
      });

      if (isAvailable) {
        availableSlots.push({
          startTime: currentTime.toISOString(),
          endTime: slotEnd.toISOString(),
          duration: slotDuration
        });
      }

      currentTime = new Date(currentTime.getTime() + slotDuration * 60000);
    }

    res.json({ availableSlots });
  } catch (error) {
    console.error('Get available slots error:', error);
    res.status(500).json({ error: 'Failed to get available slots' });
  }
});

module.exports = router; 