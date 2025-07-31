const express = require('express');
const { body, validationResult } = require('express-validator');
const { Document, User } = require('../models');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/documents');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image, PDF, and document files are allowed'));
    }
  }
});

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

// Upload document
router.post('/upload', authenticateToken, upload.single('document'), [
  body('documentType').isIn(['passport', 'visa', 'birth_certificate', 'marriage_certificate', 'death_certificate', 'police_clearance', 'medical_certificate', 'bank_statement', 'employment_letter', 'invitation_letter', 'travel_insurance', 'flight_reservation', 'hotel_reservation', 'other']),
  body('title').notEmpty(),
  body('description').optional()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const {
      documentType,
      title,
      description,
      isRequired = false,
      isConfidential = false,
      expiryDate,
      tags
    } = req.body;

    // Create document record
    const document = await Document.create({
      userId: req.user.userId,
      documentType,
      title,
      description,
      fileName: req.file.filename,
      originalFileName: req.file.originalname,
      filePath: req.file.path,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      fileExtension: path.extname(req.file.originalname),
      isRequired,
      isConfidential,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      tags: tags ? JSON.stringify(tags.split(',')) : null
    });

    res.status(201).json({
      message: 'Document uploaded successfully',
      document
    });
  } catch (error) {
    console.error('Document upload error:', error);
    res.status(500).json({ error: 'Failed to upload document' });
  }
});

// Get user's documents
router.get('/my-documents', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, documentType, status } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = { userId: req.user.userId };
    if (documentType) whereClause.documentType = documentType;
    if (status) whereClause.status = status;

    const documents = await Document.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      documents: documents.rows,
      total: documents.count,
      page: parseInt(page),
      totalPages: Math.ceil(documents.count / limit)
    });
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

// Get specific document
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const document = await Document.findOne({
      where: {
        id: req.params.id,
        userId: req.user.userId
      }
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.json({ document });
  } catch (error) {
    console.error('Get document error:', error);
    res.status(500).json({ error: 'Failed to fetch document' });
  }
});

// Download document
router.get('/:id/download', authenticateToken, async (req, res) => {
  try {
    const document = await Document.findOne({
      where: {
        id: req.params.id,
        userId: req.user.userId
      }
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    if (!fs.existsSync(document.filePath)) {
      return res.status(404).json({ error: 'File not found on server' });
    }

    res.download(document.filePath, document.originalFileName);
  } catch (error) {
    console.error('Download document error:', error);
    res.status(500).json({ error: 'Failed to download document' });
  }
});

// Update document
router.put('/:id', authenticateToken, [
  body('title').optional().notEmpty(),
  body('description').optional()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const document = await Document.findOne({
      where: {
        id: req.params.id,
        userId: req.user.userId
      }
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const allowedFields = ['title', 'description', 'tags'];
    const updateData = {};
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    await document.update(updateData);

    res.json({
      message: 'Document updated successfully',
      document
    });
  } catch (error) {
    console.error('Update document error:', error);
    res.status(500).json({ error: 'Failed to update document' });
  }
});

// Delete document
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const document = await Document.findOne({
      where: {
        id: req.params.id,
        userId: req.user.userId
      }
    });

    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Delete file from server
    if (fs.existsSync(document.filePath)) {
      fs.unlinkSync(document.filePath);
    }

    await document.destroy();

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({ error: 'Failed to delete document' });
  }
});

// Admin routes
// Get all documents (admin/staff only)
router.get('/admin/all', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId);
    if (!user || (user.role !== 'staff' && user.role !== 'admin')) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { page = 1, limit = 20, documentType, status, userId } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (documentType) whereClause.documentType = documentType;
    if (status) whereClause.status = status;
    if (userId) whereClause.userId = userId;

    const documents = await Document.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      documents: documents.rows,
      total: documents.count,
      page: parseInt(page),
      totalPages: Math.ceil(documents.count / limit)
    });
  } catch (error) {
    console.error('Admin get documents error:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

// Verify document (admin only)
router.put('/admin/:id/verify', authenticateToken, [
  body('status').isIn(['pending', 'verified', 'rejected', 'expired']),
  body('verificationNotes').optional()
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

    const { status, verificationNotes } = req.body;

    const document = await Document.findByPk(req.params.id);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    await document.update({
      status,
      verificationNotes,
      verificationDate: new Date(),
      verifiedBy: req.user.userId
    });

    res.json({
      message: 'Document verification updated successfully',
      document
    });
  } catch (error) {
    console.error('Verify document error:', error);
    res.status(500).json({ error: 'Failed to verify document' });
  }
});

module.exports = router; 