-- ============================================
-- ParadeOps Sample Data (MySQL/MariaDB)
-- Development and Testing Data
-- ============================================

-- Note: This file should be run AFTER schema.sql
-- USE parade_ops;

-- ============================================
-- Sample Users
-- Password: '1234' hashed with bcrypt (cost 10)
-- Hash: $2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi
-- ============================================

INSERT INTO users (username, password_hash, role, email) VALUES
('co', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'commanding_officer', 'co@paradeops.mil'),
('coycomd', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'coy_comd', 'coycomd@paradeops.mil'),
('adjt', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'adjutant', 'adjutant@paradeops.mil'),
('bsm', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'bsm', 'bsm@paradeops.mil'),
('soldier', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'soldier', 'soldier@paradeops.mil');

-- ============================================
-- Sample Soldiers
-- ============================================

INSERT INTO soldiers (user_id, service_number, rank, full_name, company_id, annual_leave_balance, casual_leave_balance, recreational_leave_balance, current_status) VALUES
(5, '001', 'WO', 'Arman Silva', 2, 45, 10, 30, 'present'),
(NULL, '002', 'Sgt', 'Kamal Perera', 2, 40, 8, 25, 'present'),
(NULL, '003', 'Cpl', 'Nimal Fernando', 2, 38, 9, 28, 'on_leave'),
(NULL, '004', 'LCpl', 'Sunil Jayawardena', 1, 42, 10, 30, 'present'),
(NULL, '005', 'Pte', 'Rohan Bandara', 1, 45, 10, 30, 'on_duty'),
(NULL, '006', 'WO', 'Chaminda Wickramasinghe', 3, 35, 7, 20, 'present'),
(NULL, '007', 'Sgt', 'Prasanna Rajapaksa', 3, 40, 8, 25, 'present'),
(NULL, '008', 'Cpl', 'Asanka Gunasekara', 4, 43, 9, 28, 'present'),
(NULL, '009', 'LCpl', 'Dinesh Jayasuriya', 4, 41, 8, 26, 'on_leave'),
(NULL, '010', 'Pte', 'Saman Kumara', 4, 45, 10, 30, 'present'),
(NULL, '011', 'WO', 'Thilina Herath', 1, 38, 9, 27, 'present'),
(NULL, '012', 'Sgt', 'Chatura Wijesinghe', 1, 42, 10, 30, 'awol'),
(NULL, '013', 'Cpl', 'Mahesh Pathirana', 2, 44, 10, 29, 'on_duty'),
(NULL, '014', 'LCpl', 'Lakshan Perera', 3, 40, 8, 25, 'present'),
(NULL, '015', 'Pte', 'Tharindu Silva', 3, 45, 10, 30, 'present');

-- ============================================
-- Sample Leave Requests
-- ============================================

INSERT INTO leave_requests (soldier_id, leave_type, start_date, end_date, days_requested, reason, address_on_leave, contact_number, status, created_at) VALUES
(1, 'annual', '2026-01-20', '2026-01-25', 5, 'Family wedding ceremony', '123 Main Street, Colombo', '+94771234567', 'pending', '2026-01-10 08:30:00'),
(3, 'annual', '2026-01-15', '2026-01-17', 2, 'Personal matters', '45 Beach Road, Galle', '+94772345678', 'approved_co', '2026-01-08 10:00:00'),
(9, 'casual', '2026-01-18', '2026-01-19', 1, 'Medical appointment', '78 Hospital Road, Kandy', '+94773456789', 'approved_adjutant', '2026-01-09 14:20:00');

-- ============================================
-- Sample Attendance Records (Last 7 days)
-- ============================================

INSERT INTO attendance_records (soldier_id, attendance_date, morning_pt, office, afternoon_games, roll_call, recorded_by) VALUES
-- Yesterday's attendance
(1, DATE_SUB(CURDATE(), INTERVAL 1 DAY), 'present', 'present', 'absent', 'present', 2),
(2, DATE_SUB(CURDATE(), INTERVAL 1 DAY), 'present', 'present', 'present', 'present', 2),
(4, DATE_SUB(CURDATE(), INTERVAL 1 DAY), 'present', 'present', 'present', 'present', 2),
(5, DATE_SUB(CURDATE(), INTERVAL 1 DAY), 'excused', 'excused', 'excused', 'present', 2),

-- Today's attendance
(1, CURDATE(), 'present', 'present', 'absent', 'present', 2),
(2, CURDATE(), 'present', 'present', 'present', 'present', 2),
(4, CURDATE(), 'present', 'present', 'present', 'present', 2),
(5, CURDATE(), 'excused', 'excused', 'excused', 'present', 2);

-- ============================================
-- Sample Daily Parade State
-- ============================================

INSERT INTO daily_parade_state (company_id, report_date, total_strength, present, on_leave, on_duty, awol, submitted_by, status) VALUES
(1, CURDATE(), 120, 110, 10, 5, 1, 2, 'submitted'),
(2, CURDATE(), 115, 105, 10, 4, 0, 2, 'submitted'),
(3, CURDATE(), 110, 100, 10, 4, 1, 2, 'submitted'),
(4, CURDATE(), 105, 100, 5, 3, 1, 2, 'submitted'),

-- Previous day
(1, DATE_SUB(CURDATE(), INTERVAL 1 DAY), 120, 112, 8, 4, 0, 2, 'approved'),
(2, DATE_SUB(CURDATE(), INTERVAL 1 DAY), 115, 107, 8, 3, 0, 2, 'approved'),
(3, DATE_SUB(CURDATE(), INTERVAL 1 DAY), 110, 102, 8, 3, 0, 2, 'approved'),
(4, DATE_SUB(CURDATE(), INTERVAL 1 DAY), 105, 98, 7, 2, 0, 2, 'approved');

-- ============================================
-- Sample Notices
-- ============================================

INSERT INTO notices (sender_role, recipient_role, notice_type, subject, content, priority, created_at) VALUES
('bsm', 'co', 'next_day_commitment', 'Tomorrow''s Battalion Activities', 'Battalion PT at 0600 hrs. Guard mounting at 0800 hrs. Company commanders meeting at 1000 hrs.', 'high', NOW()),
('adjutant', 'co', 'information', 'Weekly Report Submission', 'All weekly reports have been compiled and are ready for review.', 'medium', DATE_SUB(NOW(), INTERVAL 2 HOUR)),
('bsm', 'adjutant', 'urgent', 'Equipment Inspection', 'Urgent equipment inspection required for all companies by 1500 hrs today.', 'urgent', DATE_SUB(NOW(), INTERVAL 1 HOUR));

-- ============================================
-- Sample Duty Roster
-- ============================================

INSERT INTO duty_roster (soldier_id, duty_type, duty_date, start_time, end_time, location, assigned_by) VALUES
(5, 'Guard Duty', CURDATE(), '08:00:00', '20:00:00', 'Main Gate', 2),
(13, 'Orderly Duty', CURDATE(), '06:00:00', '18:00:00', 'Battalion HQ', 2),
(5, 'Guard Duty', DATE_ADD(CURDATE(), INTERVAL 1 DAY), '08:00:00', '20:00:00', 'Main Gate', 2);

-- ============================================
-- Sample Audit Log
-- ============================================

INSERT INTO audit_log (user_id, action, table_name, record_id, ip_address) VALUES
(1, 'login', NULL, NULL, '192.168.1.100'),
(2, 'create_leave_request', 'leave_requests', 1, '192.168.1.101'),
(3, 'approve_leave', 'leave_requests', 2, '192.168.1.102'),
(4, 'submit_parade_state', 'daily_parade_state', 1, '192.168.1.103');

-- ============================================
-- Verify Data
-- ============================================

-- Uncomment to verify the data was inserted correctly:
-- SELECT 'Users:' as Info, COUNT(*) as Count FROM users
-- UNION ALL
-- SELECT 'Soldiers:', COUNT(*) FROM soldiers
-- UNION ALL
-- SELECT 'Leave Requests:', COUNT(*) FROM leave_requests
-- UNION ALL
-- SELECT 'Attendance Records:', COUNT(*) FROM attendance_records
-- UNION ALL
-- SELECT 'Parade States:', COUNT(*) FROM daily_parade_state
-- UNION ALL
-- SELECT 'Notices:', COUNT(*) FROM notices
-- UNION ALL
-- SELECT 'Duty Roster:', COUNT(*) FROM duty_roster;

-- ============================================
-- Test Queries
-- ============================================

-- View battalion strength
-- SELECT * FROM v_battalion_strength;

-- View company strength
-- SELECT * FROM v_company_strength;

-- View pending leaves
-- SELECT * FROM v_pending_leaves;

-- Get today's parade state
-- SELECT c.company_name, dps.* 
-- FROM daily_parade_state dps
-- JOIN companies c ON dps.company_id = c.company_id
-- WHERE dps.report_date = CURDATE();
