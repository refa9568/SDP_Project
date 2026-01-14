const pool = require('../../database/database');

class Leave {
  static async findAll(filters = {}) {
    try {
      let query = `
        SELECT 
          l.leave_id,
          l.user_id,
          l.leave_type_id,
          l.start_date,
          l.end_date,
          l.days,
          l.reason,
          l.status,
          l.approved_by,
          l.created_at,
          l.updated_at,
          u.name,
          u.service_number,
          u.rank,
          u.unit,
          u.role,
          lt.type_name,
          lt.max_days,
          approver.name as approver_name
        FROM leaves l
        JOIN users u ON l.user_id = u.user_id
        JOIN leave_types lt ON l.leave_type_id = lt.leave_type_id
        LEFT JOIN users approver ON l.approved_by = approver.user_id
        WHERE 1=1
      `;
      
      const params = [];

      if (filters.user_id) {
        query += ' AND l.user_id = ?';
        params.push(filters.user_id);
      }

      if (filters.status) {
        query += ' AND l.status = ?';
        params.push(filters.status);
      }

      if (filters.unit) {
        query += ' AND u.unit = ?';
        params.push(filters.unit);
      }

      query += ' ORDER BY l.created_at DESC';

      const [rows] = await pool.query(query, params);
      return rows;
    } catch (error) {
      throw new Error(`Error fetching leaves: ${error.message}`);
    }
  }

  static async findById(leave_id) {
    try {
      const [rows] = await pool.query(
        `SELECT 
          l.*,
          u.name,
          u.service_number,
          u.rank,
          u.unit,
          lt.type_name,
          approver.name as approver_name
        FROM leaves l
        JOIN users u ON l.user_id = u.user_id
        JOIN leave_types lt ON l.leave_type_id = lt.leave_type_id
        LEFT JOIN users approver ON l.approved_by = approver.user_id
        WHERE l.leave_id = ?`,
        [leave_id]
      );
      return rows[0] || null;
    } catch (error) {
      throw new Error(`Error fetching leave: ${error.message}`);
    }
  }

  static async create(leaveData) {
    try {
      const [result] = await pool.query(
        `INSERT INTO leaves (user_id, leave_type_id, start_date, end_date, days, reason, status)
         VALUES (?, ?, ?, ?, ?, ?, 'pending')`,
        [
          leaveData.user_id,
          leaveData.leave_type_id,
          leaveData.start_date,
          leaveData.end_date,
          leaveData.days,
          leaveData.reason
        ]
      );
      return result.insertId;
    } catch (error) {
      throw new Error(`Error creating leave: ${error.message}`);
    }
  }

  static async approve(leave_id, approved_by) {
    try {
      const [result] = await pool.query(
        `UPDATE leaves 
         SET status = 'approved', approved_by = ?, updated_at = NOW()
         WHERE leave_id = ? AND status = 'pending'`,
        [approved_by, leave_id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error approving leave: ${error.message}`);
    }
  }

  static async reject(leave_id, approved_by, rejection_reason = null) {
    try {
      const [result] = await pool.query(
        `UPDATE leaves 
         SET status = 'rejected', approved_by = ?, rejection_reason = ?, updated_at = NOW()
         WHERE leave_id = ? AND status = 'pending'`,
        [approved_by, rejection_reason, leave_id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error rejecting leave: ${error.message}`);
    }
  }

  static async getLeaveTypes() {
    try {
      const [rows] = await pool.query('SELECT * FROM leave_types ORDER BY type_name');
      return rows;
    } catch (error) {
      throw new Error(`Error fetching leave types: ${error.message}`);
    }
  }

  static async getLeaveBalance(user_id) {
    try {
      const [rows] = await pool.query(
        `SELECT 
          lt.type_name,
          lt.max_days,
          COALESCE(SUM(CASE WHEN l.status = 'approved' THEN l.days ELSE 0 END), 0) as used_days,
          lt.max_days - COALESCE(SUM(CASE WHEN l.status = 'approved' THEN l.days ELSE 0 END), 0) as remaining_days
        FROM leave_types lt
        LEFT JOIN leaves l ON lt.leave_type_id = l.leave_type_id AND l.user_id = ?
        GROUP BY lt.leave_type_id, lt.type_name, lt.max_days`,
        [user_id]
      );
      return rows;
    } catch (error) {
      throw new Error(`Error fetching leave balance: ${error.message}`);
    }
  }

  static async delete(leave_id) {
    try {
      const [result] = await pool.query(
        'DELETE FROM leaves WHERE leave_id = ? AND status = "pending"',
        [leave_id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error deleting leave: ${error.message}`);
    }
  }
}

module.exports = Leave;
