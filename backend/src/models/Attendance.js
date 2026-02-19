const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  date: {
    type: String,   // 'YYYY-MM-DD'
    required: true
  },
  service_number: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  rank: {
    type: String,
    required: true
  },
  company: {
    type: String,
    default: ''
  },
  // Each activity: blank, present, or absent
  morning_pt: {
    type: String,
    enum: ['', 'present', 'absent'],
    default: ''
  },
  office: {
    type: String,
    enum: ['', 'present', 'absent'],
    default: ''
  },
  games: {
    type: String,
    enum: ['', 'present', 'absent'],
    default: ''
  },
  roll_call: {
    type: String,
    enum: ['', 'present', 'absent'],
    default: ''
  },
  leave: {
    type: String,
    enum: ['', 'annual', 'sick', 'casual', 'compassionate', 'yes'],
    default: ''
  },
  awol: {
    type: String,
    enum: ['', 'yes'],
    default: ''
  },
  last_updated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'soldier_attendance'
});

// Unique per soldier per date
attendanceSchema.index({ service_number: 1, date: 1 }, { unique: true });
// Fast lookup by date
attendanceSchema.index({ date: 1 });

module.exports = mongoose.model('Attendance', attendanceSchema);
