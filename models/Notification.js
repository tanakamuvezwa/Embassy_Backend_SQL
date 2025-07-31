const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Notification = sequelize.define('Notification', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('info', 'success', 'warning', 'error', 'urgent'),
      defaultValue: 'info'
    },
    category: {
      type: DataTypes.ENUM('visa', 'appointment', 'document', 'system', 'security', 'general'),
      allowNull: false
    },
    priority: {
      type: DataTypes.ENUM('low', 'normal', 'high', 'urgent'),
      defaultValue: 'normal'
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    readAt: {
      type: DataTypes.DATE,
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
    scheduledFor: {
      type: DataTypes.DATE,
      allowNull: true
    },
    sentAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    deliveryMethod: {
      type: DataTypes.ENUM('email', 'sms', 'push', 'in_app'),
      defaultValue: 'in_app'
    },
    emailSent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    smsSent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    pushSent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    relatedEntityType: {
      type: DataTypes.STRING,
      allowNull: true
    },
    relatedEntityId: {
      type: DataTypes.UUID,
      allowNull: true
    },
    actionUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    actionText: {
      type: DataTypes.STRING,
      allowNull: true
    },
    metadata: {
      type: DataTypes.TEXT, // JSON string for additional data
      allowNull: true
    },
    expiresAt: {
      type: DataTypes.DATE,
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
      beforeUpdate: (notification) => {
        notification.updatedAt = new Date();
      }
    }
  });

  return Notification;
}; 