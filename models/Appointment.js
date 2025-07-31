const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Appointment = sequelize.define('Appointment', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    appointmentNumber: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    appointmentType: {
      type: DataTypes.ENUM('visa_interview', 'document_submission', 'passport_collection', 'consultation', 'emergency', 'other'),
      allowNull: false
    },
    scheduledDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    duration: {
      type: DataTypes.INTEGER, // in minutes
      defaultValue: 30
    },
    status: {
      type: DataTypes.ENUM('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show'),
      defaultValue: 'scheduled'
    },
    priority: {
      type: DataTypes.ENUM('low', 'normal', 'high', 'urgent'),
      defaultValue: 'normal'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    cancellationReason: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    reminderSent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    reminderDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    confirmedBy: {
      type: DataTypes.UUID,
      allowNull: true
    },
    confirmedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    completedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    outcome: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    followUpRequired: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    followUpDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    documentsRequired: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    specialRequirements: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    interpreterRequired: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    interpreterLanguage: {
      type: DataTypes.STRING,
      allowNull: true
    },
    accessibilityNeeds: {
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
      beforeCreate: (appointment) => {
        // Generate appointment number
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        appointment.appointmentNumber = `APT-${year}${month}-${random}`;
      },
      beforeUpdate: (appointment) => {
        appointment.updatedAt = new Date();
      }
    }
  });

  return Appointment;
}; 