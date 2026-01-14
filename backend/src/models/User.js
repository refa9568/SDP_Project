const pool = require('../../database/database');
const bcrypt = require('bcryptjs');

class User {
  static async findByServiceNumber(service_number) {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM users WHERE service_number = ?',
        [service_number]
      );
      return rows[0] || null;
    } catch (error) {
      throw new Error(`Error finding user: ${error.message}`);
    }
  }

  static async findById(user_id) {
    try {
      const [rows] = await pool.query(
        'SELECT user_id, service_number, name, rank, role, company FROM users WHERE user_id = ?',
        [user_id]
      );
      return rows[0] || null;
    } catch (error) {
      throw new Error(`Error finding user by ID: ${error.message}`);
    }
  }

  static async getAllUsers() {
    try {
      const [rows] = await pool.query(
        'SELECT user_id, service_number, name, rank, role, company FROM users ORDER BY name'
      );
      return rows;
    } catch (error) {
      throw new Error(`Error fetching users: ${error.message}`);
    }
  }

  static async updateUser(user_id, updates) {
    try {
      const fields = [];
      const values = [];
      
      Object.keys(updates).forEach(key => {
        if (key !== 'user_id' && updates[key] !== undefined) {
          fields.push(`${key} = ?`);
          values.push(updates[key]);
        }
      });

      if (fields.length === 0) {
        throw new Error('No fields to update');
      }

      values.push(user_id);
      const query = `UPDATE users SET ${fields.join(', ')} WHERE user_id = ?`;
      
      const [result] = await pool.query(query, values);
      return result.affectedRows > 0;
    } catch (error) {
      throw new Error(`Error updating user: ${error.message}`);
    }
  }

  static async validatePassword(plainPassword, storedPassword) {
    // Use bcrypt to compare password
    try {
      return await bcrypt.compare(plainPassword, storedPassword);
    } catch (error) {
      console.error('Password validation error:', error);
      return false;
    }
  }

  static async createUser(userData) {
    try {
      const [result] = await pool.query(
        `INSERT INTO users (service_number, name, rank, role, company, email, phone, password_hash)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userData.service_number,
          userData.name,
          userData.rank,
          userData.role,
          userData.company,
          userData.email,
          userData.phone,
          userData.password_hash
        ]
      );
      return result.insertId;
    } catch (error) {
      throw new Error(`Error creating user: ${error.message}`);
    }
  }
}

module.exports = User;
