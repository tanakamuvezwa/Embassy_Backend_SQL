const { Sequelize } = require('sequelize');
require('dotenv').config();

// Create connection without database name first
const sequelize = new Sequelize({
  dialect: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  logging: false
});

async function setupDatabase() {
  try {
    // Test connection
    await sequelize.authenticate();
    console.log('✅ MySQL connection established successfully.');

    // Create database if it doesn't exist
    const dbName = process.env.DB_NAME || 'embassy_db';
    await sequelize.query(`CREATE DATABASE IF NOT EXISTS ${dbName} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`);
    console.log(`✅ Database '${dbName}' created or already exists.`);

    // Close connection
    await sequelize.close();
    console.log('✅ Database setup completed successfully!');
    
    console.log('\n📋 Next steps:');
    console.log('1. Open MySQL Workbench v6');
    console.log('2. Connect to your MySQL server');
    console.log('3. You should see the "embassy_db" database');
    console.log('4. Run your application with: node server.js');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    console.log('\n🔧 Troubleshooting:');
    console.log('1. Make sure MySQL server is running');
    console.log('2. Check your MySQL credentials in .env file');
    console.log('3. Ensure MySQL user has CREATE DATABASE privileges');
  }
}

setupDatabase(); 