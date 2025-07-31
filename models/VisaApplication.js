const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const VisaApplication = sequelize.define('VisaApplication', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    applicationNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    visaType: {
      type: DataTypes.ENUM('tourist', 'business', 'student', 'work', 'family', 'transit', 'diplomatic'),
      allowNull: false
    },
    purposeOfVisit: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    intendedEntryDate: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    intendedExitDate: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    intendedDuration: {
      type: DataTypes.INTEGER, // in days
      allowNull: false
    },
    destinationAddress: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    destinationCity: {
      type: DataTypes.STRING,
      allowNull: false
    },
    sponsorName: {
      type: DataTypes.STRING,
      allowNull: true
    },
    sponsorPhone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    sponsorEmail: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: true
      }
    },
    sponsorAddress: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    financialSupport: {
      type: DataTypes.ENUM('self', 'sponsor', 'organization', 'other'),
      allowNull: false
    },
    bankStatement: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    employmentLetter: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    invitationLetter: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    travelInsurance: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    flightReservation: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    hotelReservation: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    previousVisits: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    criminalRecord: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    criminalRecordDetails: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    healthDeclaration: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    healthConditions: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('pending', 'under_review', 'approved', 'rejected', 'cancelled'),
      defaultValue: 'pending'
    },
    priority: {
      type: DataTypes.ENUM('normal', 'urgent', 'express'),
      defaultValue: 'normal'
    },
    feeAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    feePaid: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    paymentMethod: {
      type: DataTypes.ENUM('cash', 'card', 'bank_transfer', 'online'),
      allowNull: true
    },
    paymentDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    processingFee: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.00
    },
    totalAmount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    assignedTo: {
      type: DataTypes.UUID,
      allowNull: true
    },
    reviewDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    decisionDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    decisionNotes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    visaNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true
    },
    visaIssueDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    visaExpiryDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    entryPermitted: {
      type: DataTypes.INTEGER, // number of entries allowed
      allowNull: true
    },
    durationOfStay: {
      type: DataTypes.INTEGER, // in days
      allowNull: true
    },
    isUrgent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    urgentReason: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    documentsSubmitted: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    documentsVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    interviewRequired: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    interviewDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    interviewLocation: {
      type: DataTypes.STRING,
      allowNull: true
    },
    interviewNotes: {
      type: DataTypes.TEXT,
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
      beforeCreate: (application) => {
        // Generate application number
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        application.applicationNumber = `VISA-${year}${month}-${random}`;
      },
      beforeUpdate: (application) => {
        application.updatedAt = new Date();
      }
    }
  });

  return VisaApplication;
}; 