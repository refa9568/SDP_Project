const Attendance = require('../models/Attendance');
const User = require('../models/User');

// Helper: today's date string YYYY-MM-DD
function todayStr() {
  return new Date().toISOString().split('T')[0];
}

// -------------------------------------------------------
// POST /api/attendance/init-date
// Auto-create blank records for ALL soldiers for a given date
// Body: { date }  (optional — defaults to today)
// -------------------------------------------------------
exports.initDate = async (req, res) => {
  try {
    const date = req.body.date || todayStr();

    const soldiers = await User.find({ role: 'soldier' })
      .select('service_number name rank company')
      .sort({ service_number: 1 });

    const ops = soldiers.map(s => ({
      updateOne: {
        filter: { service_number: s.service_number, date },
        update: {
          $setOnInsert: {
            service_number: s.service_number,
            date,
            name: s.name,
            rank: s.rank,
            company: s.company || '',
            morning_pt: '',
            office: '',
            games: '',
            roll_call: '',
            leave: '',
            awol: ''
          }
        },
        upsert: true
      }
    }));

    const result = await Attendance.bulkWrite(ops);
    const created = result.upsertedCount || 0;
    const existed = soldiers.length - created;

    res.json({ success: true, date, total: soldiers.length, created, existed });
  } catch (err) {
    console.error('initDate error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// -------------------------------------------------------
// POST /api/attendance/mark
// BSM marks attendance for a soldier on a specific date
// Body: { service_number, date, morning_pt, office, games, roll_call, leave, awol }
// -------------------------------------------------------
exports.markAttendance = async (req, res) => {
  try {
    const { service_number, date, morning_pt, office, games, roll_call, leave, awol } = req.body;
    const targetDate = date || todayStr();

    if (!service_number) {
      return res.status(400).json({ success: false, message: 'service_number required' });
    }

    const soldier = await User.findOne({ service_number });
    if (!soldier) {
      return res.status(404).json({ success: false, message: 'Soldier not found' });
    }

    const updateFields = {
      name: soldier.name,
      rank: soldier.rank,
      company: soldier.company || '',
      last_updated: new Date()
    };

    if (morning_pt !== undefined) updateFields.morning_pt = morning_pt;
    if (office !== undefined) updateFields.office = office;
    if (games !== undefined) updateFields.games = games;
    if (roll_call !== undefined) updateFields.roll_call = roll_call;
    if (leave !== undefined) updateFields.leave = leave;
    if (awol !== undefined) updateFields.awol = awol;

    const updated = await Attendance.findOneAndUpdate(
      { service_number, date: targetDate },
      { $set: updateFields },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    res.json({ success: true, record: updated });
  } catch (err) {
    console.error('markAttendance error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// -------------------------------------------------------
// GET /api/attendance
// Fetch all records for a date (default: today)
// Query: ?date=YYYY-MM-DD&company=BHQ
// -------------------------------------------------------
exports.getAttendance = async (req, res) => {
  try {
    const date = req.query.date || todayStr();
    const filter = { date };
    if (req.query.company) filter.company = req.query.company;

    const records = await Attendance.find(filter).sort({ service_number: 1 });
    res.json({ success: true, date, records });
  } catch (err) {
    console.error('getAttendance error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// -------------------------------------------------------
// GET /api/attendance/dates
// Returns all unique dates that have records (newest first)
// -------------------------------------------------------
exports.getDates = async (req, res) => {
  try {
    const dates = await Attendance.distinct('date');
    dates.sort((a, b) => b.localeCompare(a));
    res.json({ success: true, dates });
  } catch (err) {
    console.error('getDates error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// -------------------------------------------------------
// GET /api/attendance/summary
// Count stats for a date
// Query: ?date=YYYY-MM-DD
// -------------------------------------------------------
exports.getAttendanceSummary = async (req, res) => {
  try {
    const date = req.query.date || todayStr();
    const records = await Attendance.find({ date });

    const summary = {
      date,
      total: records.length,
      morning_pt: { present: 0, absent: 0 },
      office: { present: 0, absent: 0 },
      games: { present: 0, absent: 0 },
      roll_call: { present: 0, absent: 0 },
      leave: 0,
      awol: 0
    };

    records.forEach(r => {
      ['morning_pt', 'office', 'games', 'roll_call'].forEach(act => {
        if (r[act] === 'present') summary[act].present++;
        if (r[act] === 'absent') summary[act].absent++;
      });
      if (r.leave) summary.leave++;
      if (r.awol === 'yes') summary.awol++;
    });

    res.json({ success: true, summary });
  } catch (err) {
    console.error('getAttendanceSummary error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// -------------------------------------------------------
// GET /api/attendance/soldiers
// List all soldiers (for dropdown / BSM view)
// -------------------------------------------------------
exports.getSoldiers = async (req, res) => {
  try {
    const soldiers = await User.find({ role: 'soldier' })
      .select('service_number name rank company')
      .sort({ service_number: 1 });
    res.json({ success: true, soldiers });
  } catch (err) {
    console.error('getSoldiers error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// -------------------------------------------------------
// GET /api/attendance/:service_number
// Get a specific soldier's record for a date
// Query: ?date=YYYY-MM-DD
// -------------------------------------------------------
exports.getSoldierAttendance = async (req, res) => {
  try {
    const { service_number } = req.params;
    const date = req.query.date || todayStr();
    const record = await Attendance.findOne({ service_number, date });

    res.json({
      success: true,
      record: record || {
        service_number, date,
        morning_pt: '', office: '', games: '', roll_call: '', leave: '', awol: ''
      }
    });
  } catch (err) {
    console.error('getSoldierAttendance error:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};
