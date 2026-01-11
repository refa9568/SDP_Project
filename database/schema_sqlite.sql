-- ============================================
-- ParadeOps Database Schema (SQLite)
-- Military Personnel Management System
-- ============================================

-- SQLite version of the schema
-- Differences from MySQL: 
-- - No ENUM types (using CHECK constraints instead)
-- - AUTO_INCREMENT replaced with AUTOINCREMENT
-- - Timestamp handling is different

-- ============================================
-- Table: users
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('commanding_officer', 'coy_comd', 'adjutant', 'bsm', 'soldier')),
    email TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    last_login TEXT,
    is_active INTEGER DEFAULT 1
);

CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);

-- ============================================
-- Table: companies
-- ============================================
CREATE TABLE IF NOT EXISTS companies (
    company_id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_name TEXT NOT NULL,
    company_code TEXT UNIQUE NOT NULL,
    total_strength INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX idx_companies_code ON companies(company_code);

-- ============================================
-- Table: soldiers
-- ============================================
CREATE TABLE IF NOT EXISTS soldiers (
    soldier_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE,
    service_number TEXT UNIQUE NOT NULL,
    rank TEXT NOT NULL,
    full_name TEXT NOT NULL,
    company_id INTEGER NOT NULL,
    date_of_birth TEXT,
    date_of_enlistment TEXT,
    phone TEXT,
    emergency_contact TEXT,
    emergency_phone TEXT,
    
    annual_leave_balance INTEGER DEFAULT 45,
    casual_leave_balance INTEGER DEFAULT 10,
    recreational_leave_balance INTEGER DEFAULT 30,
    medical_leave_balance INTEGER DEFAULT 30,
    
    current_status TEXT DEFAULT 'present' CHECK(current_status IN ('present', 'on_leave', 'on_duty', 'awol', 'medical')),
    
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL,
    FOREIGN KEY (company_id) REFERENCES companies(company_id) ON DELETE RESTRICT
);

CREATE INDEX idx_soldiers_service_number ON soldiers(service_number);
CREATE INDEX idx_soldiers_company ON soldiers(company_id);
CREATE INDEX idx_soldiers_status ON soldiers(current_status);

-- ============================================
-- Table: leave_requests
-- ============================================
CREATE TABLE IF NOT EXISTS leave_requests (
    request_id INTEGER PRIMARY KEY AUTOINCREMENT,
    soldier_id INTEGER NOT NULL,
    leave_type TEXT NOT NULL CHECK(leave_type IN ('annual', 'casual', 'recreational', 'medical', 'emergency')),
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,
    days_requested INTEGER NOT NULL,
    reason TEXT,
    address_on_leave TEXT,
    contact_number TEXT,
    
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'approved_coy_comd', 'approved_adjutant', 'approved_bsm', 'approved_co', 'rejected')),
    
    coy_comd_approved_by INTEGER,
    coy_comd_approved_at TEXT,
    coy_comd_remarks TEXT,
    
    adjutant_approved_by INTEGER,
    adjutant_approved_at TEXT,
    adjutant_remarks TEXT,
    
    bsm_approved_by INTEGER,
    bsm_approved_at TEXT,
    bsm_remarks TEXT,
    
    co_approved_by INTEGER,
    co_approved_at TEXT,
    co_remarks TEXT,
    
    rejection_reason TEXT,
    rejected_by INTEGER,
    rejected_at TEXT,
    
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    
    FOREIGN KEY (soldier_id) REFERENCES soldiers(soldier_id) ON DELETE CASCADE
);

CREATE INDEX idx_leave_soldier ON leave_requests(soldier_id);
CREATE INDEX idx_leave_status ON leave_requests(status);
CREATE INDEX idx_leave_dates ON leave_requests(start_date, end_date);

-- ============================================
-- Table: attendance_records
-- ============================================
CREATE TABLE IF NOT EXISTS attendance_records (
    attendance_id INTEGER PRIMARY KEY AUTOINCREMENT,
    soldier_id INTEGER NOT NULL,
    attendance_date TEXT NOT NULL,
    morning_pt TEXT DEFAULT 'present' CHECK(morning_pt IN ('present', 'absent', 'excused')),
    office TEXT DEFAULT 'present' CHECK(office IN ('present', 'absent', 'excused')),
    afternoon_games TEXT DEFAULT 'present' CHECK(afternoon_games IN ('present', 'absent', 'excused')),
    roll_call TEXT DEFAULT 'present' CHECK(roll_call IN ('present', 'absent', 'excused')),
    remarks TEXT,
    recorded_by INTEGER,
    created_at TEXT DEFAULT (datetime('now')),
    
    FOREIGN KEY (soldier_id) REFERENCES soldiers(soldier_id) ON DELETE CASCADE,
    UNIQUE(soldier_id, attendance_date)
);

CREATE INDEX idx_attendance_date ON attendance_records(attendance_date);
CREATE INDEX idx_attendance_soldier_date ON attendance_records(soldier_id, attendance_date);

-- ============================================
-- Table: daily_parade_state
-- ============================================
CREATE TABLE IF NOT EXISTS daily_parade_state (
    parade_state_id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_id INTEGER NOT NULL,
    report_date TEXT NOT NULL,
    
    total_strength INTEGER NOT NULL,
    present INTEGER NOT NULL,
    on_leave INTEGER DEFAULT 0,
    on_duty INTEGER DEFAULT 0,
    awol INTEGER DEFAULT 0,
    medical INTEGER DEFAULT 0,
    other INTEGER DEFAULT 0,
    
    remarks TEXT,
    submitted_by INTEGER,
    submitted_at TEXT DEFAULT (datetime('now')),
    status TEXT DEFAULT 'submitted' CHECK(status IN ('draft', 'submitted', 'approved')),
    
    FOREIGN KEY (company_id) REFERENCES companies(company_id) ON DELETE CASCADE,
    UNIQUE(company_id, report_date)
);

CREATE INDEX idx_parade_report_date ON daily_parade_state(report_date);
CREATE INDEX idx_parade_company_date ON daily_parade_state(company_id, report_date);

-- ============================================
-- Table: notices
-- ============================================
CREATE TABLE IF NOT EXISTS notices (
    notice_id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_role TEXT NOT NULL CHECK(sender_role IN ('bsm', 'adjutant', 'co', 'coy_comd')),
    recipient_role TEXT NOT NULL CHECK(recipient_role IN ('co', 'adjutant', 'bsm', 'coy_comd', 'all')),
    notice_type TEXT DEFAULT 'information' CHECK(notice_type IN ('next_day_commitment', 'urgent', 'information', 'directive')),
    subject TEXT,
    content TEXT NOT NULL,
    priority TEXT DEFAULT 'medium' CHECK(priority IN ('low', 'medium', 'high', 'urgent')),
    is_read INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    read_at TEXT,
    expires_at TEXT
);

CREATE INDEX idx_notices_recipient ON notices(recipient_role);
CREATE INDEX idx_notices_created ON notices(created_at);
CREATE INDEX idx_notices_is_read ON notices(is_read);

-- ============================================
-- Table: duty_roster
-- ============================================
CREATE TABLE IF NOT EXISTS duty_roster (
    duty_id INTEGER PRIMARY KEY AUTOINCREMENT,
    soldier_id INTEGER NOT NULL,
    duty_type TEXT NOT NULL,
    duty_date TEXT NOT NULL,
    start_time TEXT,
    end_time TEXT,
    location TEXT,
    assigned_by INTEGER,
    remarks TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    
    FOREIGN KEY (soldier_id) REFERENCES soldiers(soldier_id) ON DELETE CASCADE
);

CREATE INDEX idx_duty_soldier ON duty_roster(soldier_id);
CREATE INDEX idx_duty_date ON duty_roster(duty_date);

-- ============================================
-- Table: audit_log
-- ============================================
CREATE TABLE IF NOT EXISTS audit_log (
    log_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    action TEXT NOT NULL,
    table_name TEXT,
    record_id INTEGER,
    old_value TEXT,
    new_value TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
);

CREATE INDEX idx_audit_user ON audit_log(user_id);
CREATE INDEX idx_audit_action ON audit_log(action);
CREATE INDEX idx_audit_created ON audit_log(created_at);

-- ============================================
-- Views
-- ============================================

-- Battalion strength summary
CREATE VIEW IF NOT EXISTS v_battalion_strength AS
SELECT 
    COUNT(*) as total_strength,
    SUM(CASE WHEN current_status = 'present' THEN 1 ELSE 0 END) as present,
    SUM(CASE WHEN current_status = 'on_leave' THEN 1 ELSE 0 END) as on_leave,
    SUM(CASE WHEN current_status = 'on_duty' THEN 1 ELSE 0 END) as on_duty,
    SUM(CASE WHEN current_status = 'awol' THEN 1 ELSE 0 END) as awol,
    SUM(CASE WHEN current_status = 'medical' THEN 1 ELSE 0 END) as medical
FROM soldiers;

-- Company strength summary
CREATE VIEW IF NOT EXISTS v_company_strength AS
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

-- Pending leave requests
CREATE VIEW IF NOT EXISTS v_pending_leaves AS
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
-- Initial Data
-- ============================================

INSERT INTO companies (company_name, company_code, total_strength) VALUES
('Headquarters', 'HQ', 120),
('Radio Company', 'Radio', 115),
('Rifle Regiment', 'RR', 110),
('Base Support Company', 'BSC', 105);
