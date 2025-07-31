const express = require('express');
const { body, validationResult, query } = require('express-validator');
const { VisaApplication, User, Citizen } = require('../models');

const router = express.Router();

// Middleware to validate JWT token (import from auth.js)
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

// Create new visa application
router.post('/apply', authenticateToken, [
  body('visaType').isIn(['tourist', 'business', 'student', 'work', 'family', 'transit', 'diplomatic']),
  body('purposeOfVisit').notEmpty(),
  body('intendedEntryDate').isISO8601(),
  body('intendedExitDate').isISO8601(),
  body('intendedDuration').isInt({ min: 1 }),
  body('destinationAddress').notEmpty(),
  body('destinationCity').notEmpty(),
  body('financialSupport').isIn(['self', 'sponsor', 'organization', 'other']),
  body('feeAmount').isFloat({ min: 0 }),
  body('totalAmount').isFloat({ min: 0 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      visaType,
      purposeOfVisit,
      intendedEntryDate,
      intendedExitDate,
      intendedDuration,
      destinationAddress,
      destinationCity,
      sponsorName,
      sponsorPhone,
      sponsorEmail,
      sponsorAddress,
      financialSupport,
      bankStatement,
      employmentLetter,
      invitationLetter,
      travelInsurance,
      flightReservation,
      hotelReservation,
      previousVisits,
      criminalRecord,
      criminalRecordDetails,
      healthDeclaration,
      healthConditions,
      priority,
      feeAmount,
      processingFee,
      totalAmount,
      isUrgent,
      urgentReason,
      notes
    } = req.body;

    // Create visa application
    const visaApplication = await VisaApplication.create({
      applicantId: req.user.userId,
      visaType,
      purposeOfVisit,
      intendedEntryDate,
      intendedExitDate,
      intendedDuration,
      destinationAddress,
      destinationCity,
      sponsorName,
      sponsorPhone,
      sponsorEmail,
      sponsorAddress,
      financialSupport,
      bankStatement,
      employmentLetter,
      invitationLetter,
      travelInsurance,
      flightReservation,
      hotelReservation,
      previousVisits,
      criminalRecord,
      criminalRecordDetails,
      healthDeclaration,
      healthConditions,
      priority,
      feeAmount,
      processingFee,
      totalAmount,
      isUrgent,
      urgentReason,
      notes
    });

    res.status(201).json({
      message: 'Visa application submitted successfully',
      application: visaApplication
    });
  } catch (error) {
    console.error('Visa application error:', error);
    res.status(500).json({ error: 'Failed to submit visa application' });
  }
});

// Get all visa applications for the current user
router.get('/my-applications', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, status, visaType } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = { applicantId: req.user.userId };
    if (status) whereClause.status = status;
    if (visaType) whereClause.visaType = visaType;

    const applications = await VisaApplication.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      applications: applications.rows,
      total: applications.count,
      page: parseInt(page),
      totalPages: Math.ceil(applications.count / limit)
    });
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// Get specific visa application
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const application = await VisaApplication.findOne({
      where: {
        id: req.params.id,
        applicantId: req.user.userId
      }
    });

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    res.json({ application });
  } catch (error) {
    console.error('Get application error:', error);
    res.status(500).json({ error: 'Failed to fetch application' });
  }
});

// Update visa application
router.put('/:id', authenticateToken, [
  body('purposeOfVisit').optional().notEmpty(),
  body('intendedEntryDate').optional().isISO8601(),
  body('intendedExitDate').optional().isISO8601(),
  body('intendedDuration').optional().isInt({ min: 1 }),
  body('destinationAddress').optional().notEmpty(),
  body('destinationCity').optional().notEmpty()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const application = await VisaApplication.findOne({
      where: {
        id: req.params.id,
        applicantId: req.user.userId
      }
    });

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Only allow updates if application is pending
    if (application.status !== 'pending') {
      return res.status(400).json({ error: 'Cannot update application that is not pending' });
    }

    const allowedFields = [
      'purposeOfVisit', 'intendedEntryDate', 'intendedExitDate', 'intendedDuration',
      'destinationAddress', 'destinationCity', 'sponsorName', 'sponsorPhone',
      'sponsorEmail', 'sponsorAddress', 'previousVisits', 'criminalRecordDetails',
      'healthConditions', 'urgentReason', 'notes'
    ];

    const updateData = {};
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    await application.update(updateData);

    res.json({
      message: 'Application updated successfully',
      application
    });
  } catch (error) {
    console.error('Update application error:', error);
    res.status(500).json({ error: 'Failed to update application' });
  }
});

// Cancel visa application
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const application = await VisaApplication.findOne({
      where: {
        id: req.params.id,
        applicantId: req.user.userId
      }
    });

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // Only allow cancellation if application is pending
    if (application.status !== 'pending') {
      return res.status(400).json({ error: 'Cannot cancel application that is not pending' });
    }

    await application.update({ status: 'cancelled' });

    res.json({ message: 'Application cancelled successfully' });
  } catch (error) {
    console.error('Cancel application error:', error);
    res.status(500).json({ error: 'Failed to cancel application' });
  }
});

// Pay visa fee
router.post('/:id/pay', authenticateToken, [
  body('paymentMethod').isIn(['cash', 'card', 'bank_transfer', 'online']),
  body('amount').isFloat({ min: 0 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { paymentMethod, amount } = req.body;

    const application = await VisaApplication.findOne({
      where: {
        id: req.params.id,
        applicantId: req.user.userId
      }
    });

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    if (application.feePaid) {
      return res.status(400).json({ error: 'Fee already paid' });
    }

    if (amount < application.totalAmount) {
      return res.status(400).json({ error: 'Insufficient payment amount' });
    }

    await application.update({
      feePaid: true,
      paymentMethod,
      paymentDate: new Date()
    });

    res.json({
      message: 'Payment processed successfully',
      application
    });
  } catch (error) {
    console.error('Payment error:', error);
    res.status(500).json({ error: 'Failed to process payment' });
  }
});

// Upload documents for visa application
router.post('/:id/documents', authenticateToken, async (req, res) => {
  try {
    const application = await VisaApplication.findOne({
      where: {
        id: req.params.id,
        applicantId: req.user.userId
      }
    });

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    // TODO: Implement file upload logic
    // For now, just mark documents as submitted
    await application.update({
      documentsSubmitted: true
    });

    res.json({
      message: 'Documents uploaded successfully',
      application
    });
  } catch (error) {
    console.error('Document upload error:', error);
    res.status(500).json({ error: 'Failed to upload documents' });
  }
});

// Get visa application status
router.get('/:id/status', authenticateToken, async (req, res) => {
  try {
    const application = await VisaApplication.findOne({
      where: {
        id: req.params.id,
        applicantId: req.user.userId
      },
      attributes: ['id', 'applicationNumber', 'status', 'priority', 'feePaid', 'documentsSubmitted', 'documentsVerified', 'interviewRequired', 'interviewDate', 'decisionDate', 'decisionNotes', 'visaNumber', 'visaIssueDate', 'visaExpiryDate', 'createdAt', 'updatedAt']
    });

    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    res.json({ application });
  } catch (error) {
    console.error('Get status error:', error);
    res.status(500).json({ error: 'Failed to fetch application status' });
  }
});

// Admin routes (for staff)
// Get all visa applications (admin only)
router.get('/admin/all', authenticateToken, async (req, res) => {
  try {
    // Check if user is staff or admin
    const user = await User.findByPk(req.user.userId);
    if (!user || (user.role !== 'staff' && user.role !== 'admin')) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { page = 1, limit = 20, status, visaType, priority } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (status) whereClause.status = status;
    if (visaType) whereClause.visaType = visaType;
    if (priority) whereClause.priority = priority;

    const applications = await VisaApplication.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'applicant',
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'nationality']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      applications: applications.rows,
      total: applications.count,
      page: parseInt(page),
      totalPages: Math.ceil(applications.count / limit)
    });
  } catch (error) {
    console.error('Admin get applications error:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// Update visa application status (admin only)
router.put('/admin/:id/status', authenticateToken, [
  body('status').isIn(['pending', 'under_review', 'approved', 'rejected', 'cancelled']),
  body('decisionNotes').optional()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if user is staff or admin
    const user = await User.findByPk(req.user.userId);
    if (!user || (user.role !== 'staff' && user.role !== 'admin')) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { status, decisionNotes } = req.body;

    const application = await VisaApplication.findByPk(req.params.id);
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }

    const updateData = {
      status,
      decisionNotes,
      decisionDate: new Date()
    };

    // If approved, generate visa number and dates
    if (status === 'approved') {
      const visaNumber = `VISA-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`;
      const visaIssueDate = new Date();
      const visaExpiryDate = new Date();
      visaExpiryDate.setFullYear(visaExpiryDate.getFullYear() + 1); // 1 year validity

      updateData.visaNumber = visaNumber;
      updateData.visaIssueDate = visaIssueDate;
      updateData.visaExpiryDate = visaExpiryDate;
      updateData.entryPermitted = 1; // Single entry by default
      updateData.durationOfStay = application.intendedDuration;
    }

    await application.update(updateData);

    res.json({
      message: 'Application status updated successfully',
      application
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ error: 'Failed to update application status' });
  }
});

module.exports = router; 