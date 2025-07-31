const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Staff = sequelize.define('Staff', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    employeeId: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [2, 50]
      }
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [2, 50]
      }
    },
    middleName: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        len: [1, 50]
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [10, 15]
      }
    },
    dateOfBirth: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    nationality: {
      type: DataTypes.STRING,
      allowNull: false
    },
    passportNumber: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true
    },
    position: {
      type: DataTypes.STRING,
      allowNull: false
    },
    department: {
      type: DataTypes.ENUM('consular', 'administrative', 'political', 'economic', 'cultural', 'security', 'technical', 'other'),
      allowNull: false
    },
    jobTitle: {
      type: DataTypes.STRING,
      allowNull: false
    },
    employmentType: {
      type: DataTypes.ENUM('full_time', 'part_time', 'contract', 'temporary', 'intern'),
      allowNull: false
    },
    hireDate: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    contractEndDate: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    salary: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    supervisorId: {
      type: DataTypes.UUID,
      allowNull: true
    },
    workSchedule: {
      type: DataTypes.TEXT, // JSON string for work schedule
      allowNull: true
    },
    officeLocation: {
      type: DataTypes.STRING,
      allowNull: true
    },
    officePhone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    emergencyContact: {
      type: DataTypes.STRING,
      allowNull: true
    },
    emergencyPhone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    city: {
      type: DataTypes.STRING,
      allowNull: false
    },
    country: {
      type: DataTypes.STRING,
      allowNull: false
    },
    postalCode: {
      type: DataTypes.STRING,
      allowNull: true
    },
    education: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    skills: {
      type: DataTypes.TEXT, // JSON string of skills
      allowNull: true
    },
    languages: {
      type: DataTypes.TEXT, // JSON string of languages and proficiency
      allowNull: true
    },
    certifications: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    performanceRating: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: true,
      validate: {
        min: 0,
        max: 5
      }
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    isOnLeave: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    leaveStartDate: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    leaveEndDate: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    leaveType: {
      type: DataTypes.ENUM('annual', 'sick', 'maternity', 'paternity', 'unpaid', 'other'),
      allowNull: true
    },
    lastPerformanceReview: {
      type: DataTypes.DATE,
      allowNull: true
    },
    nextPerformanceReview: {
      type: DataTypes.DATE,
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
      beforeCreate: (staff) => {
        // Generate employee ID
        const date = new Date();
        const year = date.getFullYear();
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        staff.employeeId = `EMP-${year}-${random}`;
      },
      beforeUpdate: (staff) => {
        staff.updatedAt = new Date();
      }
    }
  });

  return Staff;
}; 