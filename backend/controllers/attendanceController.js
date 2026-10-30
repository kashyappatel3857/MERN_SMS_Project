const Attendance = require('../models/Attendance');
const Student = require('../models/Student');

// Helper to format date as YYYY-MM-DD in local/server time
const getTodayFormatted = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// @desc    Save or update attendance (single or batch)
// @route   POST /api/attendance
// @access  Public
const saveAttendance = async (req, res, next) => {
  try {
    const { date, records, studentId, status } = req.body;

    // Batch save (array of records from attendance marking page)
    if (records && Array.isArray(records)) {
      if (!date) {
        return res.status(400).json({
          success: false,
          message: 'Date is required for batch attendance submission.',
        });
      }

      if (records.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No student attendance records provided.',
        });
      }

      // Prepare bulk operations with upsert to prevent duplicates and allow editing
      const bulkOps = records.map((record) => {
        if (!record.studentId || !record.status) {
          throw new Error('Each record must contain studentId and status (Present or Absent)');
        }
        if (!['Present', 'Absent'].includes(record.status)) {
          throw new Error(`Invalid status "${record.status}". Allowed values: Present, Absent`);
        }
        return {
          updateOne: {
            filter: { studentId: record.studentId, date },
            update: {
              $set: {
                studentId: record.studentId,
                date,
                status: record.status,
              },
            },
            upsert: true,
          },
        };
      });

      const result = await Attendance.bulkWrite(bulkOps);

      return res.status(200).json({
        success: true,
        message: 'Attendance saved successfully.',
        data: {
          date,
          matchedCount: result.matchedCount,
          modifiedCount: result.modifiedCount,
          upsertedCount: result.upsertedCount,
          totalRecords: records.length,
        },
      });
    }

    // Single record save
    if (!studentId || !date || !status) {
      return res.status(400).json({
        success: false,
        message: 'Please provide studentId, date (YYYY-MM-DD), and status (Present or Absent).',
      });
    }

    if (!['Present', 'Absent'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be either Present or Absent.',
      });
    }

    const attendance = await Attendance.findOneAndUpdate(
      { studentId, date },
      { studentId, date, status },
      { new: true, upsert: true, runValidators: true }
    ).populate('studentId', 'name enrollmentNo department semester');

    return res.status(200).json({
      success: true,
      message: 'Attendance recorded successfully.',
      data: attendance,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get attendance records with filters
// @route   GET /api/attendance
// @access  Public
const getAttendance = async (req, res, next) => {
  try {
    const { date, studentId, status, department, semester, sortBy = 'date', order = 'desc' } = req.query;

    const query = {};

    if (date) query.date = date;
    if (studentId) query.studentId = studentId;
    if (status && status !== 'All') query.status = status;

    let studentFilter = {};
    if (department && department !== 'All') studentFilter.department = department;
    if (semester && semester !== 'All') studentFilter.semester = semester;

    let targetStudentIds = null;
    if (Object.keys(studentFilter).length > 0) {
      const students = await Student.find(studentFilter).select('_id');
      targetStudentIds = students.map((s) => s._id);
      query.studentId = query.studentId ? query.studentId : { $in: targetStudentIds };
    }

    const sortOrder = order === 'asc' ? 1 : -1;
    const records = await Attendance.find(query)
      .populate('studentId', 'name enrollmentNo department semester email phone')
      .sort({ [sortBy]: sortOrder });

    res.status(200).json({
      success: true,
      count: records.length,
      data: records,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update single attendance record by ID
// @route   PUT /api/attendance/:id
// @access  Public
const updateAttendanceById = async (req, res, next) => {
  try {
    const { status } = req.body;

    if (!status || !['Present', 'Absent'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be either Present or Absent.',
      });
    }

    const attendance = await Attendance.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate('studentId', 'name enrollmentNo department semester');

    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Attendance status updated successfully',
      data: attendance,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get daily attendance sheet (all students for selected date, department, semester)
// @route   GET /api/attendance/daily
// @access  Public
const getDailyAttendance = async (req, res, next) => {
  try {
    const targetDate = req.query.date || getTodayFormatted();
    const { department, semester, search } = req.query;

    const studentFilter = {};
    if (department && department !== 'All') studentFilter.department = department;
    if (semester && semester !== 'All') studentFilter.semester = semester.toString();

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      studentFilter.$or = [{ name: searchRegex }, { enrollmentNo: searchRegex }];
    }

    // Fetch all matching students
    const students = await Student.find(studentFilter).sort({ enrollmentNo: 1 });

    if (students.length === 0) {
      return res.status(200).json({
        success: true,
        date: targetDate,
        summary: {
          totalStudents: 0,
          presentCount: 0,
          absentCount: 0,
          unmarkedCount: 0,
        },
        data: [],
      });
    }

    const studentIds = students.map((s) => s._id);

    // Fetch attendance for these students on target date
    const attendanceRecords = await Attendance.find({
      date: targetDate,
      studentId: { $in: studentIds },
    });

    const attendanceMap = new Map();
    attendanceRecords.forEach((rec) => {
      attendanceMap.set(rec.studentId.toString(), {
        _id: rec._id,
        status: rec.status,
      });
    });

    let presentCount = 0;
    let absentCount = 0;
    let unmarkedCount = 0;

    const combinedList = students.map((student) => {
      const attendance = attendanceMap.get(student._id.toString());
      const status = attendance ? attendance.status : null;

      if (status === 'Present') presentCount++;
      else if (status === 'Absent') absentCount++;
      else unmarkedCount++;

      return {
        _id: student._id,
        attendanceId: attendance ? attendance._id : null,
        name: student.name,
        enrollmentNo: student.enrollmentNo,
        email: student.email,
        phone: student.phone,
        department: student.department,
        semester: student.semester,
        status: status, // 'Present', 'Absent', or null
      };
    });

    res.status(200).json({
      success: true,
      date: targetDate,
      summary: {
        totalStudents: students.length,
        presentCount,
        absentCount,
        unmarkedCount,
      },
      data: combinedList,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get monthly attendance overview
// @route   GET /api/attendance/monthly
// @access  Public
const getMonthlyAttendance = async (req, res, next) => {
  try {
    const today = getTodayFormatted();
    const currentMonthPrefix = today.substring(0, 7); // 'YYYY-MM'
    const targetMonth = req.query.month || currentMonthPrefix; // 'YYYY-MM'

    const { department, semester } = req.query;

    const studentFilter = {};
    if (department && department !== 'All') studentFilter.department = department;
    if (semester && semester !== 'All') studentFilter.semester = semester.toString();

    const students = await Student.find(studentFilter).select('_id name enrollmentNo department semester');
    const studentIds = students.map((s) => s._id);

    // Regex for date starting with targetMonth (e.g. ^2026-10)
    const monthRegex = new RegExp(`^${targetMonth}`);

    const records = await Attendance.find({
      date: { $regex: monthRegex },
      studentId: { $in: studentIds },
    }).populate('studentId', 'name enrollmentNo department semester');

    // Aggregate daily stats in the month
    const dailyMap = {};
    records.forEach((rec) => {
      if (!dailyMap[rec.date]) {
        dailyMap[rec.date] = { date: rec.date, present: 0, absent: 0, total: 0 };
      }
      if (rec.status === 'Present') dailyMap[rec.date].present++;
      if (rec.status === 'Absent') dailyMap[rec.date].absent++;
      dailyMap[rec.date].total++;
    });

    const dailyBreakdown = Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date));

    res.status(200).json({
      success: true,
      month: targetMonth,
      totalRecords: records.length,
      dailyBreakdown,
      data: records,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  saveAttendance,
  getAttendance,
  updateAttendanceById,
  getDailyAttendance,
  getMonthlyAttendance,
};

