const express = require('express');
const { body, validationResult } = require('express-validator');
const { Citizen } = require('../models');

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

// Register new citizen
router.post('/register', authenticateToken, [
  body('nationalId').notEmpty(),
  body('firstName').isLength({ min: 2, max: 50 }),
  body('lastName').isLength({ min: 2, max: 50 }),
  body('dateOfBirth').isISO8601(),
  body('placeOfBirth').notEmpty(),
  body('gender').isIn(['male', 'female', 'other']),
  body('maritalStatus').isIn(['single', 'married', 'divorced', 'widowed']),
  body('address').notEmpty(),
  body('city').notEmpty(),
  body('province').notEmpty(),
  body('phone').isLength({ min: 10, max: 15 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      nationalId,
      firstName,
      lastName,
      middleName,
      dateOfBirth,
      placeOfBirth,
      gender,
      maritalStatus,
      passportNumber,
      passportIssueDate,
      passportExpiryDate,
      address,
      city,
      province,
      postalCode,
      phone,
      email,
      emergencyContact,
      emergencyPhone,
      occupation,
      employer,
      education,
      bloodType
    } = req.body;

    // Check if citizen already exists
    const existingCitizen = await Citizen.findOne({ where: { nationalId } });
    if (existingCitizen) {
      return res.status(400).json({ error: 'Citizen with this National ID already exists' });
    }

    // Create new citizen
    const citizen = await Citizen.create({
      nationalId,
      firstName,
      lastName,
      middleName,
      dateOfBirth,
      placeOfBirth,
      gender,
      maritalStatus,
      passportNumber,
      passportIssueDate,
      passportExpiryDate,
      address,
      city,
      province,
      postalCode,
      phone,
      email,
      emergencyContact,
      emergencyPhone,
      occupation,
      employer,
      education,
      bloodType
    });

    res.status(201).json({
      message: 'Citizen registered successfully',
      citizen
    });
  } catch (error) {
    console.error('Citizen registration error:', error);
    res.status(500).json({ error: 'Failed to register citizen' });
  }
});

// Get all citizens (admin/staff only)
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, search, city, province } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (search) {
      whereClause[require('sequelize').Op.or] = [
        { firstName: { [require('sequelize').Op.like]: `%${search}%` } },
        { lastName: { [require('sequelize').Op.like]: `%${search}%` } },
        { nationalId: { [require('sequelize').Op.like]: `%${search}%` } },
        { passportNumber: { [require('sequelize').Op.like]: `%${search}%` } }
      ];
    }
    if (city) whereClause.city = city;
    if (province) whereClause.province = province;

    const citizens = await Citizen.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      citizens: citizens.rows,
      total: citizens.count,
      page: parseInt(page),
      totalPages: Math.ceil(citizens.count / limit)
    });
  } catch (error) {
    console.error('Get citizens error:', error);
    res.status(500).json({ error: 'Failed to fetch citizens' });
  }
});

// Get specific citizen
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const citizen = await Citizen.findByPk(req.params.id);
    if (!citizen) {
      return res.status(404).json({ error: 'Citizen not found' });
    }

    res.json({ citizen });
  } catch (error) {
    console.error('Get citizen error:', error);
    res.status(500).json({ error: 'Failed to fetch citizen' });
  }
});

// Update citizen
router.put('/:id', authenticateToken, [
  body('firstName').optional().isLength({ min: 2, max: 50 }),
  body('lastName').optional().isLength({ min: 2, max: 50 }),
  body('phone').optional().isLength({ min: 10, max: 15 }),
  body('email').optional().isEmail(),
  body('address').optional().notEmpty(),
  body('city').optional().notEmpty(),
  body('province').optional().notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const citizen = await Citizen.findByPk(req.params.id);
    if (!citizen) {
      return res.status(404).json({ error: 'Citizen not found' });
    }

    const allowedFields = [
      'firstName', 'lastName', 'middleName', 'phone', 'email',
      'address', 'city', 'province', 'postalCode', 'emergencyContact',
      'emergencyPhone', 'occupation', 'employer', 'notes'
    ];

    const updateData = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    await citizen.update(updateData);

    res.json({
      message: 'Citizen updated successfully',
      citizen
    });
  } catch (error) {
    console.error('Update citizen error:', error);
    res.status(500).json({ error: 'Failed to update citizen' });
  }
});

// Search citizens by National ID
router.get('/search/national-id/:nationalId', authenticateToken, async (req, res) => {
  try {
    const citizen = await Citizen.findOne({
      where: { nationalId: req.params.nationalId }
    });

    if (!citizen) {
      return res.status(404).json({ error: 'Citizen not found' });
    }

    res.json({ citizen });
  } catch (error) {
    console.error('Search citizen error:', error);
    res.status(500).json({ error: 'Failed to search citizen' });
  }
});

// Search citizens by passport number
router.get('/search/passport/:passportNumber', authenticateToken, async (req, res) => {
  try {
    const citizen = await Citizen.findOne({
      where: { passportNumber: req.params.passportNumber }
    });

    if (!citizen) {
      return res.status(404).json({ error: 'Citizen not found' });
    }

    res.json({ citizen });
  } catch (error) {
    console.error('Search citizen error:', error);
    res.status(500).json({ error: 'Failed to search citizen' });
  }
});

// Get citizens by city
router.get('/city/:city', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const citizens = await Citizen.findAndCountAll({
      where: { city: req.params.city },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['lastName', 'ASC'], ['firstName', 'ASC']]
    });

    res.json({
      citizens: citizens.rows,
      total: citizens.count,
      page: parseInt(page),
      totalPages: Math.ceil(citizens.count / limit)
    });
  } catch (error) {
    console.error('Get citizens by city error:', error);
    res.status(500).json({ error: 'Failed to fetch citizens' });
  }
});

// Get citizens by province
router.get('/province/:province', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const citizens = await Citizen.findAndCountAll({
      where: { province: req.params.province },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['lastName', 'ASC'], ['firstName', 'ASC']]
    });

    res.json({
      citizens: citizens.rows,
      total: citizens.count,
      page: parseInt(page),
      totalPages: Math.ceil(citizens.count / limit)
    });
  } catch (error) {
    console.error('Get citizens by province error:', error);
    res.status(500).json({ error: 'Failed to fetch citizens' });
  }
});

// Get statistics
router.get('/stats/overview', authenticateToken, async (req, res) => {
  try {
    const totalCitizens = await Citizen.count();
    const activeCitizens = await Citizen.count({ where: { isActive: true } });
    const maleCitizens = await Citizen.count({ where: { gender: 'male' } });
    const femaleCitizens = await Citizen.count({ where: { gender: 'female' } });

    // Get citizens by province
    const citizensByProvince = await Citizen.findAll({
      attributes: [
        'province',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
      ],
      group: ['province'],
      order: [[require('sequelize').fn('COUNT', require('sequelize').col('id')), 'DESC']]
    });

    // Get citizens by city
    const citizensByCity = await Citizen.findAll({
      attributes: [
        'city',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
      ],
      group: ['city'],
      order: [[require('sequelize').fn('COUNT', require('sequelize').col('id')), 'DESC']],
      limit: 10
    });

    res.json({
      totalCitizens,
      activeCitizens,
      maleCitizens,
      femaleCitizens,
      citizensByProvince,
      citizensByCity
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Export citizens data
router.get('/export/csv', authenticateToken, async (req, res) => {
  try {
    const citizens = await Citizen.findAll({
      order: [['lastName', 'ASC'], ['firstName', 'ASC']]
    });

    // Convert to CSV format
    const csvHeader = 'National ID,First Name,Last Name,Middle Name,Date of Birth,Place of Birth,Gender,Marital Status,Passport Number,Address,City,Province,Phone,Email,Occupation,Registration Date\n';
    
    const csvData = citizens.map(citizen => {
      return [
        citizen.nationalId,
        citizen.firstName,
        citizen.lastName,
        citizen.middleName || '',
        citizen.dateOfBirth,
        citizen.placeOfBirth,
        citizen.gender,
        citizen.maritalStatus,
        citizen.passportNumber || '',
        citizen.address,
        citizen.city,
        citizen.province,
        citizen.phone,
        citizen.email || '',
        citizen.occupation || '',
        citizen.registrationDate
      ].map(field => `"${field}"`).join(',');
    }).join('\n');

    const csv = csvHeader + csvData;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=citizens.csv');
    res.send(csv);
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Failed to export data' });
  }
});

module.exports = router; 