/**
 * Node.js + Express Backend Example
 * Alternative to PHP backend
 * 
 * Installation:
 * 1. npm init -y
 * 2. npm install express mysql2 bcrypt jsonwebtoken cors dotenv
 * 3. Create .env file with database credentials
 * 4. Run: node server.js
 */

const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Serve static HTML files

// Database connection pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'parade_ops',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ success: false, error: 'Access token required' });
    }
    
    jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
        if (err) {
            return res.status(403).json({ success: false, error: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

// ============================================
// Authentication Routes
// ============================================

/**
 * POST /api/login
 * Login endpoint
 */
app.post('/api/login', async (req, res) => {
    try {
        const { username, password, role } = req.body;
        
        // Validate input
        if (!username || !password || !role) {
            return res.status(400).json({
                success: false,
                error: 'Username, password, and role are required'
            });
        }
        
        // Get user from database
        const [users] = await pool.query(
            'SELECT * FROM users WHERE username = ? AND role = ? AND is_active = 1',
            [username, role]
        );
        
        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }
        
        const user = users[0];
        
        // Verify password
        const validPassword = await bcrypt.compare(password, user.password_hash);
        
        if (!validPassword) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }
        
        // Update last login
        await pool.query(
            'UPDATE users SET last_login = NOW() WHERE user_id = ?',
            [user.user_id]
        );
        
        // Generate JWT token
        const token = jwt.sign(
            { 
                user_id: user.user_id, 
                username: user.username, 
                role: user.role 
            },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '8h' }
        );
        
        // Get soldier data if role is soldier
        let soldierData = null;
        if (role === 'soldier') {
            const [soldiers] = await pool.query(`
                SELECT s.*, c.company_name 
                FROM soldiers s
                JOIN companies c ON s.company_id = c.company_id
                WHERE s.user_id = ?
            `, [user.user_id]);
            
            soldierData = soldiers[0] || null;
        }
        
        // Log login
        await pool.query(
            'INSERT INTO audit_log (user_id, action, ip_address) VALUES (?, ?, ?)',
            [user.user_id, 'login', req.ip]
        );
        
        // Dashboard URLs
        const dashboards = {
            'commanding_officer': 'frontend/CO/CO_dashboard.html',
            'coy_comd': 'frontend/coy_commander/coy_dashboard.html',
            'adjutant': 'frontend/adjutant/adjt_dashboard.html',
            'bsm': 'frontend/bsm/bsm-dashboard.html',
            'soldier': 'frontend/soldier/soldier_dashboard.html'
        };
        
        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                user_id: user.user_id,
                username: user.username,
                role: user.role,
                email: user.email
            },
            soldier: soldierData,
            dashboard: dashboards[role]
        });
        
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            error: 'An error occurred during login'
        });
    }
});

// ============================================
// Leave Request Routes
// ============================================

/**
 * GET /api/leave-requests
 * Get leave requests based on user role
 */
app.get('/api/leave-requests', authenticateToken, async (req, res) => {
    try {
        const { role, user_id } = req.user;
        
        let query = `
            SELECT 
                lr.*,
                s.service_number,
                s.full_name as soldier_name,
                s.rank,
                c.company_name
            FROM leave_requests lr
            JOIN soldiers s ON lr.soldier_id = s.soldier_id
            JOIN companies c ON s.company_id = c.company_id
        `;
        
        let params = [];
        
        // Filter based on role
        if (role === 'soldier') {
            query += ' WHERE s.user_id = ?';
            params.push(user_id);
        } else if (role === 'coy_comd') {
            query += " WHERE lr.status IN ('pending', 'approved_coy_comd')";
        } else if (role === 'adjutant') {
            query += " WHERE lr.status IN ('approved_coy_comd', 'approved_adjutant')";
        } else if (role === 'bsm') {
            query += " WHERE lr.status IN ('approved_adjutant', 'approved_bsm')";
        }
        
        query += ' ORDER BY lr.created_at DESC';
        
        const [requests] = await pool.query(query, params);
        
        res.json({
            success: true,
            data: requests,
            count: requests.length
        });
        
    } catch (error) {
        console.error('Get leave requests error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve leave requests'
        });
    }
});

/**
 * POST /api/leave-requests
 * Create new leave request
 */
app.post('/api/leave-requests', authenticateToken, async (req, res) => {
    try {
        const { soldier_id, leave_type, start_date, end_date, days_requested, reason, address_on_leave, contact_number } = req.body;
        
        // Validate required fields
        if (!soldier_id || !leave_type || !start_date || !end_date || !days_requested || !reason) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields'
            });
        }
        
        const [result] = await pool.query(`
            INSERT INTO leave_requests 
            (soldier_id, leave_type, start_date, end_date, days_requested, reason, address_on_leave, contact_number)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [soldier_id, leave_type, start_date, end_date, days_requested, reason, address_on_leave || '', contact_number || '']);
        
        // Log action
        await pool.query(
            'INSERT INTO audit_log (user_id, action, table_name, record_id) VALUES (?, ?, ?, ?)',
            [req.user.user_id, 'create_leave_request', 'leave_requests', result.insertId]
        );
        
        res.status(201).json({
            success: true,
            message: 'Leave request submitted successfully',
            request_id: result.insertId
        });
        
    } catch (error) {
        console.error('Create leave request error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to create leave request'
        });
    }
});

/**
 * PUT /api/leave-requests/:id
 * Update leave request status (approve/reject)
 */
app.put('/api/leave-requests/:id', authenticateToken, async (req, res) => {
    try {
        const requestId = req.params.id;
        const { action, remarks } = req.body; // action: 'approve' or 'reject'
        const { role, user_id } = req.user;
        
        // Whitelist approach for security - only predefined field names allowed
        const approvalFields = {
            'coy_comd': {
                status: 'approved_coy_comd',
                approver: 'coy_comd_approved_by',
                time: 'coy_comd_approved_at',
                remarks: 'coy_comd_remarks'
            },
            'adjutant': {
                status: 'approved_adjutant',
                approver: 'adjutant_approved_by',
                time: 'adjutant_approved_at',
                remarks: 'adjutant_remarks'
            },
            'bsm': {
                status: 'approved_bsm',
                approver: 'bsm_approved_by',
                time: 'bsm_approved_at',
                remarks: 'bsm_remarks'
            },
            'commanding_officer': {
                status: 'approved_co',
                approver: 'co_approved_by',
                time: 'co_approved_at',
                remarks: 'co_remarks'
            }
        };
        
        let query, params;
        
        if (action === 'approve') {
            // Validate role exists in whitelist
            if (!approvalFields[role]) {
                return res.status(403).json({
                    success: false,
                    error: 'Invalid user role for approval'
                });
            }
            
            const fields = approvalFields[role];
            
            // Now safe to use these validated field names in query
            query = `
                UPDATE leave_requests 
                SET status = ?,
                    ${fields.approver} = ?,
                    ${fields.time} = NOW(),
                    ${fields.remarks} = ?
                WHERE request_id = ?
            `;
            params = [fields.status, user_id, remarks || '', requestId];
            
        } else {
            query = `
                UPDATE leave_requests 
                SET status = 'rejected',
                    rejected_by = ?,
                    rejected_at = NOW(),
                    rejection_reason = ?
                WHERE request_id = ?
            `;
            params = [user_id, remarks || '', requestId];
        }
        
        await pool.query(query, params);
        
        // Log action
        await pool.query(
            'INSERT INTO audit_log (user_id, action, table_name, record_id) VALUES (?, ?, ?, ?)',
            [user_id, action + '_leave', 'leave_requests', requestId]
        );
        
        res.json({
            success: true,
            message: `Leave request ${action === 'approve' ? 'approved' : 'rejected'} successfully`
        });
        
    } catch (error) {
        console.error('Update leave request error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to update leave request'
        });
    }
});

// ============================================
// Company/Parade State Routes
// ============================================

/**
 * GET /api/parade-state
 * Get daily parade state
 */
app.get('/api/parade-state', authenticateToken, async (req, res) => {
    try {
        const date = req.query.date || new Date().toISOString().split('T')[0];
        
        const [paradeState] = await pool.query(`
            SELECT 
                dps.*,
                c.company_name,
                c.company_code
            FROM daily_parade_state dps
            JOIN companies c ON dps.company_id = c.company_id
            WHERE dps.report_date = ?
            ORDER BY c.company_name
        `, [date]);
        
        res.json({
            success: true,
            data: paradeState
        });
        
    } catch (error) {
        console.error('Get parade state error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve parade state'
        });
    }
});

// ============================================
// Start Server
// ============================================

app.listen(PORT, () => {
    console.log(`ParadeOps API Server running on port ${PORT}`);
    console.log(`Access at: http://localhost:${PORT}`);
});

// Handle graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, closing server...');
    await pool.end();
    process.exit(0);
});
