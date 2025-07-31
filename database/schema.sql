-- Embassy of Equatorial Guinea Database Schema
-- For MySQL Workbench v6

-- Create database
CREATE DATABASE IF NOT EXISTS embassy_db 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE embassy_db;

-- Users table
CREATE TABLE IF NOT EXISTS Users (
    id CHAR(36) PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    phone VARCHAR(15),
    nationality VARCHAR(100) NOT NULL,
    passport_number VARCHAR(50) UNIQUE,
    date_of_birth DATE NOT NULL,
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20),
    role ENUM('applicant', 'staff', 'admin') DEFAULT 'applicant',
    is_active BOOLEAN DEFAULT TRUE,
    last_login DATETIME,
    email_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255),
    reset_password_token VARCHAR(255),
    reset_password_expires DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_passport (passport_number),
    INDEX idx_role (role)
);

-- Citizens table
CREATE TABLE IF NOT EXISTS Citizens (
    id CHAR(36) PRIMARY KEY,
    passport_number VARCHAR(50) NOT NULL UNIQUE,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    middle_name VARCHAR(50),
    date_of_birth DATE NOT NULL,
    place_of_birth VARCHAR(100),
    nationality VARCHAR(100) NOT NULL,
    gender ENUM('male', 'female', 'other'),
    marital_status ENUM('single', 'married', 'divorced', 'widowed'),
    address TEXT,
    city VARCHAR(100),
    country VARCHAR(100) NOT NULL,
    phone VARCHAR(15),
    email VARCHAR(255),
    emergency_contact_name VARCHAR(100),
    emergency_contact_phone VARCHAR(15),
    emergency_contact_relationship VARCHAR(50),
    occupation VARCHAR(100),
    employer VARCHAR(100),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_passport (passport_number),
    INDEX idx_nationality (nationality)
);

-- Visa Applications table
CREATE TABLE IF NOT EXISTS VisaApplications (
    id CHAR(36) PRIMARY KEY,
    application_number VARCHAR(50) NOT NULL UNIQUE,
    visa_type ENUM('tourist', 'business', 'student', 'work', 'family', 'transit', 'diplomatic') NOT NULL,
    purpose_of_visit TEXT NOT NULL,
    intended_entry_date DATE NOT NULL,
    intended_exit_date DATE NOT NULL,
    intended_duration INT NOT NULL,
    destination_address TEXT NOT NULL,
    destination_city VARCHAR(100) NOT NULL,
    sponsor_name VARCHAR(100),
    sponsor_phone VARCHAR(15),
    sponsor_email VARCHAR(255),
    sponsor_address TEXT,
    financial_support ENUM('self', 'sponsor', 'organization', 'other') NOT NULL,
    bank_statement BOOLEAN DEFAULT FALSE,
    employment_letter BOOLEAN DEFAULT FALSE,
    invitation_letter BOOLEAN DEFAULT FALSE,
    travel_insurance BOOLEAN DEFAULT FALSE,
    flight_reservation BOOLEAN DEFAULT FALSE,
    hotel_reservation BOOLEAN DEFAULT FALSE,
    previous_visits TEXT,
    criminal_record BOOLEAN DEFAULT FALSE,
    criminal_record_details TEXT,
    health_declaration BOOLEAN DEFAULT FALSE,
    health_conditions TEXT,
    status ENUM('pending', 'under_review', 'approved', 'rejected', 'cancelled') DEFAULT 'pending',
    priority ENUM('normal', 'urgent', 'express') DEFAULT 'normal',
    fee_amount DECIMAL(10,2) NOT NULL,
    fee_paid BOOLEAN DEFAULT FALSE,
    payment_method ENUM('cash', 'card', 'bank_transfer', 'online'),
    payment_date DATETIME,
    processing_fee DECIMAL(10,2) DEFAULT 0.00,
    total_amount DECIMAL(10,2) NOT NULL,
    assigned_to CHAR(36),
    review_date DATETIME,
    decision_date DATETIME,
    decision_notes TEXT,
    visa_number VARCHAR(50) UNIQUE,
    visa_issue_date DATETIME,
    visa_expiry_date DATETIME,
    entry_permitted INT,
    duration_of_stay INT,
    is_urgent BOOLEAN DEFAULT FALSE,
    urgent_reason TEXT,
    documents_submitted BOOLEAN DEFAULT FALSE,
    documents_verified BOOLEAN DEFAULT FALSE,
    interview_required BOOLEAN DEFAULT FALSE,
    interview_date DATETIME,
    interview_location VARCHAR(255),
    interview_notes TEXT,
    notes TEXT,
    applicant_id CHAR(36),
    citizen_id CHAR(36),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (applicant_id) REFERENCES Users(id) ON DELETE SET NULL,
    FOREIGN KEY (citizen_id) REFERENCES Citizens(id) ON DELETE SET NULL,
    INDEX idx_application_number (application_number),
    INDEX idx_status (status),
    INDEX idx_visa_type (visa_type),
    INDEX idx_applicant (applicant_id)
);

-- Appointments table
CREATE TABLE IF NOT EXISTS Appointments (
    id CHAR(36) PRIMARY KEY,
    appointment_number VARCHAR(50) NOT NULL UNIQUE,
    appointment_type ENUM('visa_interview', 'document_submission', 'consultation', 'emergency') NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    duration INT DEFAULT 30,
    status ENUM('scheduled', 'confirmed', 'completed', 'cancelled', 'no_show') DEFAULT 'scheduled',
    notes TEXT,
    user_id CHAR(36),
    staff_id CHAR(36),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE SET NULL,
    INDEX idx_appointment_number (appointment_number),
    INDEX idx_appointment_date (appointment_date),
    INDEX idx_status (status),
    INDEX idx_user (user_id)
);

-- Documents table
CREATE TABLE IF NOT EXISTS Documents (
    id CHAR(36) PRIMARY KEY,
    document_type ENUM('passport', 'birth_certificate', 'marriage_certificate', 'police_clearance', 'medical_certificate', 'bank_statement', 'employment_letter', 'invitation_letter', 'other') NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INT,
    mime_type VARCHAR(100),
    upload_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    is_verified BOOLEAN DEFAULT FALSE,
    verification_date DATETIME,
    verified_by CHAR(36),
    notes TEXT,
    user_id CHAR(36),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    INDEX idx_document_type (document_type),
    INDEX idx_user (user_id),
    INDEX idx_verified (is_verified)
);

-- Staff table
CREATE TABLE IF NOT EXISTS Staff (
    id CHAR(36) PRIMARY KEY,
    employee_id VARCHAR(50) NOT NULL UNIQUE,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(15),
    position VARCHAR(100) NOT NULL,
    department VARCHAR(100),
    hire_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    user_id CHAR(36),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE SET NULL,
    INDEX idx_employee_id (employee_id),
    INDEX idx_email (email),
    INDEX idx_department (department)
);

-- Notifications table
CREATE TABLE IF NOT EXISTS Notifications (
    id CHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('info', 'success', 'warning', 'error') DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    read_at DATETIME,
    user_id CHAR(36),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_read (is_read),
    INDEX idx_type (type)
);

-- Insert sample data
INSERT INTO Users (id, email, password, first_name, last_name, nationality, date_of_birth, country, role) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'admin@embassy.gq', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK8i', 'Admin', 'User', 'Equatorial Guinea', '1990-01-01', 'Equatorial Guinea', 'admin');

INSERT INTO Staff (id, employee_id, first_name, last_name, email, position, department, hire_date, user_id) VALUES
('550e8400-e29b-41d4-a716-446655440002', 'EMP001', 'John', 'Doe', 'john.doe@embassy.gq', 'Visa Officer', 'Visa Department', '2023-01-15', '550e8400-e29b-41d4-a716-446655440001'); 