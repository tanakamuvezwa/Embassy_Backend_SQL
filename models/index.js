const { Sequelize } = require('sequelize');
const path = require('path');

// Create SQLite database (temporary for testing)
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../database/embassy.db'),
  logging: false,
  define: {
    timestamps: true,
    underscored: true,
    freezeTableName: true
  }
});

// Import model definitions
const UserModel = require('./User');
const CitizenModel = require('./Citizen');
const VisaApplicationModel = require('./VisaApplication');
const AppointmentModel = require('./Appointment');
const DocumentModel = require('./Document');
const StaffModel = require('./Staff');
const NotificationModel = require('./Notification');

// Initialize models
const User = UserModel(sequelize);
const Citizen = CitizenModel(sequelize);
const VisaApplication = VisaApplicationModel(sequelize);
const Appointment = AppointmentModel(sequelize);
const Document = DocumentModel(sequelize);
const Staff = StaffModel(sequelize);
const Notification = NotificationModel(sequelize);

// Define associations
User.hasMany(VisaApplication, { foreignKey: 'applicantId' });
VisaApplication.belongsTo(User, { foreignKey: 'applicantId' });

User.hasMany(Appointment, { foreignKey: 'userId' });
Appointment.belongsTo(User, { foreignKey: 'userId' });

Citizen.hasMany(VisaApplication, { foreignKey: 'citizenId' });
VisaApplication.belongsTo(Citizen, { foreignKey: 'citizenId' });

Staff.hasMany(Appointment, { foreignKey: 'staffId' });
Appointment.belongsTo(Staff, { foreignKey: 'staffId' });

User.hasMany(Document, { foreignKey: 'userId' });
Document.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Notification, { foreignKey: 'userId' });
Notification.belongsTo(User, { foreignKey: 'userId' });

module.exports = {
  sequelize,
  User,
  Citizen,
  VisaApplication,
  Appointment,
  Document,
  Staff,
  Notification
}; 