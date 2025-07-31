# Embassy Backend - MySQL Workbench v6 Setup Guide

## Prerequisites

1. **MySQL Server** installed and running
2. **MySQL Workbench v6** installed
3. **Node.js** and **npm** installed

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Configure Environment Variables

Create a `.env` file in the root directory with the following content:

```env
# Database Configuration for MySQL Workbench v6
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=embassy_db

# Server Configuration
PORT=3000
NODE_ENV=development

# JWT Secret
JWT_SECRET=your_jwt_secret_key_here
```

## Step 3: Setup Database

### Option A: Using the Setup Script
```bash
node scripts/setup-database.js
```

### Option B: Using MySQL Workbench v6

1. **Open MySQL Workbench v6**
2. **Connect to your MySQL server**
3. **Open the SQL schema file**: `database/schema.sql`
4. **Execute the schema** to create the database and tables

## Step 4: Verify Database Setup

In MySQL Workbench v6:
1. Refresh the schema navigator
2. You should see the `embassy_db` database
3. Expand it to see all tables:
   - Users
   - Citizens
   - VisaApplications
   - Appointments
   - Documents
   - Staff
   - Notifications

## Step 5: Run the Application

```bash
npm start
```

The server will start on `http://localhost:3000`

## Database Schema Overview

### Tables Created:

1. **Users** - User accounts and authentication
2. **Citizens** - Citizen information and records
3. **VisaApplications** - Visa application processing
4. **Appointments** - Appointment scheduling
5. **Documents** - Document management
6. **Staff** - Staff member information
7. **Notifications** - System notifications

### Key Features:

- **UUID Primary Keys** for all tables
- **Foreign Key Relationships** between tables
- **Indexes** for optimal query performance
- **ENUM types** for status fields
- **Timestamps** for audit trails
- **UTF8MB4** character set for international support

## API Endpoints

Once running, you can access:

- **Health Check**: `http://localhost:3000/api/health`
- **Authentication**: `http://localhost:3000/api/auth`
- **Visa Applications**: `http://localhost:3000/api/visa`
- **Citizens**: `http://localhost:3000/api/citizen`
- **Appointments**: `http://localhost:3000/api/appointment`
- **Documents**: `http://localhost:3000/api/document`
- **Staff**: `http://localhost:3000/api/staff`

## Troubleshooting

### Common Issues:

1. **Connection Refused**
   - Ensure MySQL server is running
   - Check port 3306 is not blocked

2. **Access Denied**
   - Verify MySQL username and password
   - Ensure user has CREATE DATABASE privileges

3. **Database Not Found**
   - Run the setup script again
   - Check database name in .env file

4. **Tables Not Created**
   - Ensure schema.sql was executed completely
   - Check for SQL syntax errors

### Useful MySQL Workbench v6 Commands:

```sql
-- Check if database exists
SHOW DATABASES;

-- Use the database
USE embassy_db;

-- Show all tables
SHOW TABLES;

-- Check table structure
DESCRIBE Users;

-- View sample data
SELECT * FROM Users LIMIT 5;
```

## Development Tips

1. **Enable SQL Logging**: Set `NODE_ENV=development` in .env
2. **Use MySQL Workbench v6** for database management
3. **Backup regularly** using MySQL Workbench export feature
4. **Monitor performance** using MySQL Workbench performance reports

## Support

For issues with:
- **MySQL Workbench v6**: Check MySQL documentation
- **Database Schema**: Review `database/schema.sql`
- **Application**: Check server logs and API responses 