const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Document = sequelize.define('Document', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    documentNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    documentType: {
      type: DataTypes.ENUM('passport', 'visa', 'birth_certificate', 'marriage_certificate', 'death_certificate', 'police_clearance', 'medical_certificate', 'bank_statement', 'employment_letter', 'invitation_letter', 'travel_insurance', 'flight_reservation', 'hotel_reservation', 'other'),
      allowNull: false
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    fileName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    originalFileName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    filePath: {
      type: DataTypes.STRING,
      allowNull: false
    },
    fileSize: {
      type: DataTypes.INTEGER, // in bytes
      allowNull: false
    },
    mimeType: {
      type: DataTypes.STRING,
      allowNull: false
    },
    fileExtension: {
      type: DataTypes.STRING,
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pending', 'verified', 'rejected', 'expired'),
      defaultValue: 'pending'
    },
    verificationDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    verifiedBy: {
      type: DataTypes.UUID,
      allowNull: true
    },
    verificationNotes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    expiryDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    isRequired: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    isConfidential: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    tags: {
      type: DataTypes.TEXT, // JSON string of tags
      allowNull: true
    },
    version: {
      type: DataTypes.INTEGER,
      defaultValue: 1
    },
    previousVersion: {
      type: DataTypes.UUID,
      allowNull: true
    },
    checksum: {
      type: DataTypes.STRING,
      allowNull: true
    },
    isArchived: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    archivedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    archivedBy: {
      type: DataTypes.UUID,
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    hooks: {
      beforeCreate: (document) => {
        // Generate document number
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        document.documentNumber = `DOC-${year}${month}-${random}`;
      },
      beforeUpdate: (document) => {
        document.updatedAt = new Date();
      }
    }
  });

  return Document;
}; 