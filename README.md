# Embassy of Equatorial Guinea Backend System

A comprehensive backend database system for the Embassy of Equatorial Guinea in Turkey, built with Node.js, Express, and SQLite.

## Features

### 🔐 Authentication & Authorization
- User registration and login
- JWT-based authentication
- Role-based access control (applicant, staff, admin)
- Password reset functionality
- Email verification

### 🛂 Visa Management
- Visa application submission and tracking
- Multiple visa types (tourist, business, student, work, family, transit, diplomatic)
- Document upload and verification
- Payment processing
- Application status tracking
- Admin approval workflow

### 👥 Citizen Management
- Equatorial Guinea citizen registration
- Citizen database with comprehensive information
- Search and filtering capabilities
- Statistical reports
- Data export functionality

### 📅 Appointment Scheduling
- Online appointment booking
- Multiple appointment types
- Available time slot checking
- Appointment confirmation and reminders
- Staff assignment and management

### 📄 Document Management
- Secure file upload and storage
- Document type categorization
- Verification workflow
- Version control
- Download and sharing capabilities

### 👨‍💼 Staff Management
- Staff member registration and profiles
- Department and role management
- Leave management
- Performance tracking
- Work schedule management

### 🔔 Notification System
- Real-time notifications
- Email and SMS integration
- Appointment reminders
- Status updates
- System alerts

## Technology Stack

- **Backend**: Node.js, Express.js
- **Database**: SQLite with Sequelize ORM
- **Authentication**: JWT, bcryptjs
- **File Upload**: Multer
- **Validation**: Express-validator
- **Security**: Helmet, CORS
- **Email**: Nodemailer

## Installation

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Setup Instructions

1. **Clone or navigate to the project directory**
   ```bash
   cd "C:\Users\pc\Documents\Embassy Back end"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create environment file**
   Create a `.env` file in the root directory with the following variables:
   ```env
   PORT=3000
   NODE_ENV=development
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRES_IN=24h
   ```

4. **Initialize the database**
   The database will be automatically created when you start the server.

5. **Start the server**
   ```bash
   npm start
   ```

   For development with auto-restart:
   ```bash
   npm run dev
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/change-password` - Change password
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Visa Applications
- `POST /api/visa/apply` - Submit visa application
- `GET /api/visa/my-applications` - Get user's applications
- `GET /api/visa/:id` - Get specific application
- `PUT /api/visa/:id` - Update application
- `DELETE /api/visa/:id` - Cancel application
- `POST /api/visa/:id/pay` - Pay visa fee
- `GET /api/visa/:id/status` - Get application status

### Citizens
- `POST /api/citizen/register` - Register new citizen
- `GET /api/citizen` - Get all citizens
- `GET /api/citizen/:id` - Get specific citizen
- `PUT /api/citizen/:id` - Update citizen
- `GET /api/citizen/search/national-id/:nationalId` - Search by National ID
- `GET /api/citizen/search/passport/:passportNumber` - Search by passport

### Appointments
- `POST /api/appointment/schedule` - Schedule appointment
- `GET /api/appointment/my-appointments` - Get user's appointments
- `GET /api/appointment/:id` - Get specific appointment
- `PUT /api/appointment/:id` - Update appointment
- `DELETE /api/appointment/:id` - Cancel appointment
- `GET /api/appointment/available-slots` - Get available time slots

### Documents
- `POST /api/document/upload` - Upload document
- `GET /api/document/my-documents` - Get user's documents
- `GET /api/document/:id` - Get specific document
- `GET /api/document/:id/download` - Download document
- `PUT /api/document/:id` - Update document
- `DELETE /api/document/:id` - Delete document

### Staff
- `POST /api/staff/register` - Register new staff member
- `GET /api/staff` - Get all staff members
- `GET /api/staff/:id` - Get specific staff member
- `PUT /api/staff/:id` - Update staff member
- `GET /api/staff/department/:department` - Get staff by department
- `GET /api/staff/on-leave` - Get staff on leave

## Database Schema

### Users Table
- User authentication and profile information
- Role-based access control
- Contact and address details

### Citizens Table
- Equatorial Guinea citizen information
- National ID and passport details
- Personal and contact information

### VisaApplications Table
- Complete visa application data
- Status tracking and workflow
- Payment and document information

### Appointments Table
- Appointment scheduling and management
- Time slot availability
- Status tracking

### Documents Table
- File upload and storage information
- Document verification workflow
- Version control

### Staff Table
- Staff member profiles and information
- Department and role management
- Leave and performance tracking

### Notifications Table
- System notifications and alerts
- Email and SMS integration
- User-specific notifications

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for password security
- **Input Validation**: Express-validator for data validation
- **CORS Protection**: Cross-origin resource sharing protection
- **Helmet Security**: Security headers and protection
- **Rate Limiting**: API rate limiting for abuse prevention
- **File Upload Security**: Secure file upload with validation

## File Structure

```
Embassy Back end/
├── models/                 # Database models
│   ├── index.js           # Database configuration
│   ├── User.js            # User model
│   ├── Citizen.js         # Citizen model
│   ├── VisaApplication.js # Visa application model
│   ├── Appointment.js     # Appointment model
│   ├── Document.js        # Document model
│   ├── Staff.js           # Staff model
│   └── Notification.js    # Notification model
├── routes/                # API routes
│   ├── auth.js            # Authentication routes
│   ├── visa.js            # Visa application routes
│   ├── citizen.js         # Citizen management routes
│   ├── appointment.js     # Appointment routes
│   ├── document.js        # Document management routes
│   └── staff.js           # Staff management routes
├── uploads/               # File upload directory
├── database/              # SQLite database files
├── server.js              # Main server file
├── package.json           # Dependencies and scripts
├── Embassy.html           # Frontend interface
└── README.md              # This file
```

## Usage Examples

### Register a New User
```javascript
const response = await fetch('/api/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123',
    firstName: 'John',
    lastName: 'Doe',
    nationality: 'Turkey',
    dateOfBirth: '1990-01-01',
    country: 'Turkey'
  })
});
```

### Submit Visa Application
```javascript
const response = await fetch('/api/visa/apply', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
  },
  body: JSON.stringify({
    visaType: 'tourist',
    purposeOfVisit: 'Tourism',
    intendedEntryDate: '2024-06-01',
    intendedExitDate: '2024-06-15',
    intendedDuration: 14,
    destinationAddress: 'Hotel Address',
    destinationCity: 'Malabo',
    financialSupport: 'self',
    feeAmount: 100.00,
    totalAmount: 100.00
  })
});
```

## Development

### Running in Development Mode
```bash
npm run dev
```

### Database Migrations
The database will be automatically created and synchronized when the server starts.

### Testing
```bash
npm test
```

## Deployment

### Production Setup
1. Set `NODE_ENV=production` in environment variables
2. Use a strong JWT secret
3. Configure proper CORS settings
4. Set up SSL/TLS certificates
5. Configure proper file upload limits
6. Set up database backups

### Environment Variables for Production
```env
NODE_ENV=production
PORT=3000
JWT_SECRET=your-very-secure-jwt-secret
JWT_EXPIRES_IN=24h
CORS_ORIGIN=https://your-domain.com
MAX_FILE_SIZE=10485760
```

## Support

For technical support or questions about the Embassy of Equatorial Guinea backend system, please contact the development team.

## License

This project is developed for the Embassy of Equatorial Guinea in Turkey. All rights reserved.

---

**Embassy of Equatorial Guinea in Turkey**  
*Empowering diplomatic services through technology* 