-- ============================================
-- ParadeOps Database Schema (MySQL/MariaDB)
-- Military Personnel Management System
-- ============================================

-- Create database (run this separately if needed)
-- CREATE DATABASE IF NOT EXISTS parade_ops CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE parade_ops;

-- ============================================
-- Table: users
-- Stores user authentication and role information
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,  -- Store hashed passwords using bcrypt/argon2
    role ENUM('commanding_officer', 'coy_comd', 'adjutant', 'bsm', 'soldier') NOT NULL,
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    is_active BOOLEAN DEFAULT TRUE,
    INDEX idx_username (username),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: companies
-- Stores company/unit information
-- ============================================
CREATE TABLE IF NOT EXISTS companies (
    company_id INT AUTO_INCREMENT PRIMARY KEY,
    company_name VARCHAR(50) NOT NULL,
    company_code VARCHAR(10) UNIQUE NOT NULL,  -- HQ, Radio, RR, BSC
    total_strength INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_company_code (company_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: soldiers
-- Stores soldier personal and service information
-- ============================================
CREATE TABLE IF NOT EXISTS soldiers (
    soldier_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE,  -- Links to users table if soldier has login access
    service_number VARCHAR(20) UNIQUE NOT NULL,
    rank VARCHAR(30) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    company_id INT NOT NULL,
    date_of_birth DATE,
    date_of_enlistment DATE,
    phone VARCHAR(20),
    emergency_contact VARCHAR(100),
    emergency_phone VARCHAR(20),
    
    -- Leave balances
    annual_leave_balance INT DEFAULT 45,
    casual_leave_balance INT DEFAULT 10,
    recreational_leave_balance INT DEFAULT 30,
    medical_leave_balance INT DEFAULT 30,
    
    -- Status
    current_status ENUM('present', 'on_leave', 'on_duty', 'awol', 'medical') DEFAULT 'present',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (company_id) REFERENCES companies(company_id) ON DELETE RESTRICT,
    INDEX idx_service_number (service_number),
    INDEX idx_company (company_id),
    INDEX idx_status (current_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: leave_requests
-- Stores all leave applications and approval workflow
-- ============================================
CREATE TABLE IF NOT EXISTS leave_requests (
    request_id INT AUTO_INCREMENT PRIMARY KEY,
    soldier_id INT NOT NULL,
    leave_type ENUM('annual', 'casual', 'recreational', 'medical', 'emergency') NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    days_requested INT NOT NULL,
    reason TEXT,
    address_on_leave TEXT,
    contact_number VARCHAR(20),
    
    -- Approval workflow
    status ENUM('pending', 'approved_coy_comd', 'approved_adjutant', 'approved_bsm', 'approved_co', 'rejected') DEFAULT 'pending',
    
    -- Approval details
    coy_comd_approved_by INT NULL,
    coy_comd_approved_at TIMESTAMP NULL,
    coy_comd_remarks TEXT,
    
    adjutant_approved_by INT NULL,
    adjutant_approved_at TIMESTAMP NULL,
    adjutant_remarks TEXT,
    
    bsm_approved_by INT NULL,
    bsm_approved_at TIMESTAMP NULL,
    bsm_remarks TEXT,
    
    co_approved_by INT NULL,
    co_approved_at TIMESTAMP NULL,
    co_remarks TEXT,
    
    rejection_reason TEXT,
    rejected_by INT NULL,
    rejected_at TIMESTAMP NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (soldier_id) REFERENCES soldiers(soldier_id) ON DELETE CASCADE,
    FOREIGN KEY (coy_comd_approved_by) REFERENCES users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (adjutant_approved_by) REFERENCES users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (bsm_approved_by) REFERENCES users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (co_approved_by) REFERENCES users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (rejected_by) REFERENCES users(user_id) ON DELETE SET NULL,
    
    INDEX idx_soldier (soldier_id),
    INDEX idx_status (status),
    INDEX idx_dates (start_date, end_date),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: attendance_records
-- Stores daily attendance records
-- ============================================
CREATE TABLE IF NOT EXISTS attendance_records (
    attendance_id INT AUTO_INCREMENT PRIMARY KEY,
    soldier_id INT NOT NULL,
    attendance_date DATE NOT NULL,
    morning_pt ENUM('present', 'absent', 'excused') DEFAULT 'present',
    office ENUM('present', 'absent', 'excused') DEFAULT 'present',
    afternoon_games ENUM('present', 'absent', 'excused') DEFAULT 'present',
    roll_call ENUM('present', 'absent', 'excused') DEFAULT 'present',
    remarks TEXT,
    recorded_by INT,  -- User who recorded the attendance
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (soldier_id) REFERENCES soldiers(soldier_id) ON DELETE CASCADE,
    FOREIGN KEY (recorded_by) REFERENCES users(user_id) ON DELETE SET NULL,
    UNIQUE KEY unique_soldier_date (soldier_id, attendance_date),
    INDEX idx_date (attendance_date),
    INDEX idx_soldier_date (soldier_id, attendance_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: daily_parade_state
-- Stores daily company strength reports
-- ============================================
CREATE TABLE IF NOT EXISTS daily_parade_state (
    parade_state_id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    report_date DATE NOT NULL,
    
    total_strength INT NOT NULL,
    present INT NOT NULL,
    on_leave INT DEFAULT 0,
    on_duty INT DEFAULT 0,
    awol INT DEFAULT 0,
    medical INT DEFAULT 0,
    other INT DEFAULT 0,
    
    remarks TEXT,
    submitted_by INT,  -- Company commander who submitted
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('draft', 'submitted', 'approved') DEFAULT 'submitted',
    
    FOREIGN KEY (company_id) REFERENCES companies(company_id) ON DELETE CASCADE,
    FOREIGN KEY (submitted_by) REFERENCES users(user_id) ON DELETE SET NULL,
    UNIQUE KEY unique_company_date (company_id, report_date),
    INDEX idx_report_date (report_date),
    INDEX idx_company_date (company_id, report_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: notices
-- Stores important notices and commitments
-- ============================================
CREATE TABLE IF NOT EXISTS notices (
    notice_id INT AUTO_INCREMENT PRIMARY KEY,
    sender_role ENUM('bsm', 'adjutant', 'co', 'coy_comd') NOT NULL,
    recipient_role ENUM('co', 'adjutant', 'bsm', 'coy_comd', 'all') NOT NULL,
    notice_type ENUM('next_day_commitment', 'urgent', 'information', 'directive') DEFAULT 'information',
    subject VARCHAR(200),
    content TEXT NOT NULL,
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_at TIMESTAMP NULL,
    expires_at TIMESTAMP NULL,
    
    INDEX idx_recipient (recipient_role),
    INDEX idx_created (created_at),
    INDEX idx_is_read (is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: duty_roster
-- Stores duty assignments
-- ============================================
CREATE TABLE IF NOT EXISTS duty_roster (
    duty_id INT AUTO_INCREMENT PRIMARY KEY,
    soldier_id INT NOT NULL,
    duty_type VARCHAR(50) NOT NULL,  -- Guard duty, Orderly, etc.
    duty_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    location VARCHAR(100),
    assigned_by INT,
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (soldier_id) REFERENCES soldiers(soldier_id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_by) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_soldier (soldier_id),
    INDEX idx_duty_date (duty_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: audit_log
-- Stores system audit trail for security and compliance
-- ============================================
CREATE TABLE IF NOT EXISTS audit_log (
    log_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(100) NOT NULL,  -- login, logout, approve_leave, create_report, etc.
    table_name VARCHAR(50),
    record_id INT,
    old_value TEXT,
    new_value TEXT,
    ip_address VARCHAR(45),
    user_agent VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_action (action),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Views for common queries
-- ============================================

-- View: Current battalion strength summary
CREATE OR REPLACE VIEW v_battalion_strength AS
SELECT 
    COUNT(*) as total_strength,
    SUM(CASE WHEN current_status = 'present' THEN 1 ELSE 0 END) as present,
    SUM(CASE WHEN current_status = 'on_leave' THEN 1 ELSE 0 END) as on_leave,
    SUM(CASE WHEN current_status = 'on_duty' THEN 1 ELSE 0 END) as on_duty,
    SUM(CASE WHEN current_status = 'awol' THEN 1 ELSE 0 END) as awol,
    SUM(CASE WHEN current_status = 'medical' THEN 1 ELSE 0 END) as medical
FROM soldiers;

-- View: Company strength summary
CREATE OR REPLACE VIEW v_company_strength AS
SELECT 
    c.company_id,
    c.company_name,
    c.company_code,
    COUNT(s.soldier_id) as total_strength,
    SUM(CASE WHEN s.current_status = 'present' THEN 1 ELSE 0 END) as present,
    SUM(CASE WHEN s.current_status = 'on_leave' THEN 1 ELSE 0 END) as on_leave,
    SUM(CASE WHEN s.current_status = 'on_duty' THEN 1 ELSE 0 END) as on_duty,
    SUM(CASE WHEN s.current_status = 'awol' THEN 1 ELSE 0 END) as awol,
    SUM(CASE WHEN s.current_status = 'medical' THEN 1 ELSE 0 END) as medical
FROM companies c
LEFT JOIN soldiers s ON c.company_id = s.company_id
GROUP BY c.company_id, c.company_name, c.company_code;

-- View: Pending leave requests
CREATE OR REPLACE VIEW v_pending_leaves AS
SELECT 
    lr.request_id,
    s.service_number,
    s.full_name,
    s.rank,
    c.company_name,
    lr.leave_type,
    lr.start_date,
    lr.end_date,
    lr.days_requested,
    lr.status,
    lr.created_at
FROM leave_requests lr
JOIN soldiers s ON lr.soldier_id = s.soldier_id
JOIN companies c ON s.company_id = c.company_id
WHERE lr.status IN ('pending', 'approved_coy_comd', 'approved_adjutant', 'approved_bsm')
ORDER BY lr.created_at;

-- ============================================
-- Initial Configuration Data
-- ============================================

-- Note: Run this after creating tables
-- For actual passwords, use proper password hashing (bcrypt/argon2)
-- These are just placeholders for development

-- Default companies
INSERT INTO companies (company_name, company_code, total_strength) VALUES
('Headquarters', 'HQ', 120),
('Radio Company', 'Radio', 115),
('Rifle Regiment', 'RR', 110),
('Base Support Company', 'BSC', 105);

-- ============================================
-- End of Schema
-- ============================================
