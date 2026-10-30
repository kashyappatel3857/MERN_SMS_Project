const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student ID is required'],
    },
    date: {
      type: String, // Stored as YYYY-MM-DD
      required: [true, 'Attendance date is required'],
      match: [/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'],
    },
    status: {
      type: String,
      enum: {
        values: ['Present', 'Absent'],
        message: 'Status must be either Present or Absent',
      },
      required: [true, 'Attendance status is required'],
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate attendance records for the same student on the same date
attendanceSchema.index({ studentId: 1, date: 1 }, { unique: true });
attendanceSchema.index({ date: 1, status: 1 });

const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = Attendance;

