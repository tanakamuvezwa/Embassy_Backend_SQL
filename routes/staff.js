const express = require('express');
const { body, validationResult } = require('express-validator');
const { Staff, User } = require('../models');

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

// Register new staff member (admin only)
router.post('/register', authenticateToken, [
  body('firstName').isLength({ min: 2, max: 50 }),
  body('lastName').isLength({ min: 2, max: 50 }),
  body('email').isEmail().normalizeEmail(),
  body('phone').isLength({ min: 10, max: 15 }),
  body('dateOfBirth').isISO8601(),
  body('nationality').notEmpty(),
  body('position').notEmpty(),
  body('department').isIn(['consular', 'administrative', 'political', 'economic', 'cultural', 'security', 'technical', 'other']),
  body('jobTitle').notEmpty(),
  body('employmentType').isIn(['full_time', 'part_time', 'contract', 'temporary', 'intern']),
  body('hireDate').isISO8601(),
  body('address').notEmpty(),
  body('city').notEmpty(),
  body('country').notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if user is admin
    const user = await User.findByPk(req.user.userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const {
      firstName,
      lastName,
      middleName,
      email,
      phone,
      dateOfBirth,
      nationality,
      passportNumber,
      position,
      department,
      jobTitle,
      employmentType,
      hireDate,
      contractEndDate,
      salary,
      supervisorId,
      workSchedule,
      officeLocation,
      officePhone,
      emergencyContact,
      emergencyPhone,
      address,
      city,
      country,
      postalCode,
      education,
      skills,
      languages,
      certifications
    } = req.body;

    // Check if staff member already exists
    const existingStaff = await Staff.findOne({ where: { email } });
    if (existingStaff) {
      return res.status(400).json({ error: 'Staff member with this email already exists' });
    }

    // Create new staff member
    const staff = await Staff.create({
      firstName,
      lastName,
      middleName,
      email,
      phone,
      dateOfBirth,
      nationality,
      passportNumber,
      position,
      department,
      jobTitle,
      employmentType,
      hireDate,
      contractEndDate,
      salary,
      supervisorId,
      workSchedule,
      officeLocation,
      officePhone,
      emergencyContact,
      emergencyPhone,
      address,
      city,
      country,
      postalCode,
      education,
      skills,
      languages,
      certifications
    });

    res.status(201).json({
      message: 'Staff member registered successfully',
      staff
    });
  } catch (error) {
    console.error('Staff registration error:', error);
    res.status(500).json({ error: 'Failed to register staff member' });
  }
});

// Get all staff members
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, department, employmentType, isActive } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (department) whereClause.department = department;
    if (employmentType) whereClause.employmentType = employmentType;
    if (isActive !== undefined) whereClause.isActive = isActive === 'true';

    const staff = await Staff.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['lastName', 'ASC'], ['firstName', 'ASC']]
    });

    res.json({
      staff: staff.rows,
      total: staff.count,
      page: parseInt(page),
      totalPages: Math.ceil(staff.count / limit)
    });
  } catch (error) {
    console.error('Get staff error:', error);
    res.status(500).json({ error: 'Failed to fetch staff members' });
  }
});

// Get specific staff member
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const staff = await Staff.findByPk(req.params.id);
    if (!staff) {
      return res.status(404).json({ error: 'Staff member not found' });
    }

    res.json({ staff });
  } catch (error) {
    console.error('Get staff member error:', error);
    res.status(500).json({ error: 'Failed to fetch staff member' });
  }
});

// Update staff member
router.put('/:id', authenticateToken, [
  body('firstName').optional().isLength({ min: 2, max: 50 }),
  body('lastName').optional().isLength({ min: 2, max: 50 }),
  body('phone').optional().isLength({ min: 10, max: 15 }),
  body('email').optional().isEmail(),
  body('address').optional().notEmpty(),
  body('city').optional().notEmpty(),
  body('country').optional().notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const staff = await Staff.findByPk(req.params.id);
    if (!staff) {
      return res.status(404).json({ error: 'Staff member not found' });
    }

    const allowedFields = [
      'firstName', 'lastName', 'middleName', 'phone', 'email',
      'address', 'city', 'country', 'postalCode', 'emergencyContact',
      'emergencyPhone', 'officeLocation', 'officePhone', 'workSchedule',
      'education', 'skills', 'languages', 'certifications', 'notes'
    ];

    const updateData = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    await staff.update(updateData);

    res.json({
      message: 'Staff member updated successfully',
      staff
    });
  } catch (error) {
    console.error('Update staff error:', error);
    res.status(500).json({ error: 'Failed to update staff member' });
  }
});

// Get staff by department
router.get('/department/:department', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const staff = await Staff.findAndCountAll({
      where: { department: req.params.department },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['lastName', 'ASC'], ['firstName', 'ASC']]
    });

    res.json({
      staff: staff.rows,
      total: staff.count,
      page: parseInt(page),
      totalPages: Math.ceil(staff.count / limit)
    });
  } catch (error) {
    console.error('Get staff by department error:', error);
    res.status(500).json({ error: 'Failed to fetch staff members' });
  }
});

// Get staff on leave
router.get('/on-leave', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const staff = await Staff.findAndCountAll({
      where: { isOnLeave: true },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['leaveStartDate', 'ASC']]
    });

    res.json({
      staff: staff.rows,
      total: staff.count,
      page: parseInt(page),
      totalPages: Math.ceil(staff.count / limit)
    });
  } catch (error) {
    console.error('Get staff on leave error:', error);
    res.status(500).json({ error: 'Failed to fetch staff on leave' });
  }
});

// Update leave status
router.put('/:id/leave', authenticateToken, [
  body('isOnLeave').isBoolean(),
  body('leaveStartDate').optional().isISO8601(),
  body('leaveEndDate').optional().isISO8601(),
  body('leaveType').optional().isIn(['annual', 'sick', 'maternity', 'paternity', 'unpaid', 'other'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const staff = await Staff.findByPk(req.params.id);
    if (!staff) {
      return res.status(404).json({ error: 'Staff member not found' });
    }

    const { isOnLeave, leaveStartDate, leaveEndDate, leaveType } = req.body;

    await staff.update({
      isOnLeave,
      leaveStartDate: leaveStartDate ? new Date(leaveStartDate) : null,
      leaveEndDate: leaveEndDate ? new Date(leaveEndDate) : null,
      leaveType
    });

    res.json({
      message: 'Leave status updated successfully',
      staff
    });
  } catch (error) {
    console.error('Update leave status error:', error);
    res.status(500).json({ error: 'Failed to update leave status' });
  }
});

// Get staff statistics
router.get('/stats/overview', authenticateToken, async (req, res) => {
  try {
    const totalStaff = await Staff.count();
    const activeStaff = await Staff.count({ where: { isActive: true } });
    const staffOnLeave = await Staff.count({ where: { isOnLeave: true } });

    // Get staff by department
    const staffByDepartment = await Staff.findAll({
      attributes: [
        'department',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
      ],
      group: ['department'],
      order: [[require('sequelize').fn('COUNT', require('sequelize').col('id')), 'DESC']]
    });

    // Get staff by employment type
    const staffByEmploymentType = await Staff.findAll({
      attributes: [
        'employmentType',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
      ],
      group: ['employmentType'],
      order: [[require('sequelize').fn('COUNT', require('sequelize').col('id')), 'DESC']]
    });

    // Get staff by nationality
    const staffByNationality = await Staff.findAll({
      attributes: [
        'nationality',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
      ],
      group: ['nationality'],
      order: [[require('sequelize').fn('COUNT', require('sequelize').col('id')), 'DESC']],
      limit: 10
    });

    res.json({
      totalStaff,
      activeStaff,
      staffOnLeave,
      staffByDepartment,
      staffByEmploymentType,
      staffByNationality
    });
  } catch (error) {
    console.error('Get staff stats error:', error);
    res.status(500).json({ error: 'Failed to fetch staff statistics' });
  }
});

// Export staff data
router.get('/export/csv', authenticateToken, async (req, res) => {
  try {
    const staff = await Staff.findAll({
      order: [['lastName', 'ASC'], ['firstName', 'ASC']]
    });

    // Convert to CSV format
    const csvHeader = 'Employee ID,First Name,Last Name,Middle Name,Email,Phone,Position,Department,Job Title,Employment Type,Hire Date,Nationality,Address,City,Country,Is Active,Is On Leave\n';
    
    const csvData = staff.map(member => {
      return [
        member.employeeId,
        member.firstName,
        member.lastName,
        member.middleName || '',
        member.email,
        member.phone,
        member.position,
        member.department,
        member.jobTitle,
        member.employmentType,
        member.hireDate,
        member.nationality,
        member.address,
        member.city,
        member.country,
        member.isActive ? 'Yes' : 'No',
        member.isOnLeave ? 'Yes' : 'No'
      ].map(field => `"${field}"`).join(',');
    }).join('\n');

    const csv = csvHeader + csvData;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=staff.csv');
    res.send(csv);
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Failed to export data' });
  }
});

module.exports = router; 