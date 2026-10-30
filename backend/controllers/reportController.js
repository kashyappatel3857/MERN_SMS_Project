const Student = require('../models/Student');
const Attendance = require('../models/Attendance');

const getTodayFormatted = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// @desc    Get dashboard metrics & summary
// @route   GET /api/reports/dashboard
// @access  Public
const getDashboardMetrics = async (req, res, next) => {
  try {
    const today = getTodayFormatted();

    // 1. Total Students
    const totalStudents = await Student.countDocuments();

    // 2. Today's Present and Absent
    const todayPresent = await Attendance.countDocuments({
      date: today,
      status: 'Present',
    });

    const todayAbsent = await Attendance.countDocuments({
      date: today,
      status: 'Absent',
    });

    // 3. Overall all-time Attendance Percentage
    const totalMarkedAllTime = await Attendance.countDocuments();
    const totalPresentAllTime = await Attendance.countDocuments({ status: 'Present' });
    const overallPercentage =
      totalMarkedAllTime > 0
        ? Number(((totalPresentAllTime / totalMarkedAllTime) * 100).toFixed(2))
        : 0;

    // Today's percentage among students marked today
    const totalMarkedToday = todayPresent + todayAbsent;
    const todayPercentage =
      totalMarkedToday > 0
        ? Number(((todayPresent / totalMarkedToday) * 100).toFixed(2))
        : 0;

    // 4. Recent Attendance Records (latest 6 records)
    const recentRecords = await Attendance.find()
      .populate('studentId', 'name enrollmentNo department semester')
      .sort({ createdAt: -1 })
      .limit(6);

    // 5. Department Breakdown
    const departmentStats = await Student.aggregate([
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // 6. Last 7 Days trend for chart
    const past7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      past7Days.push(`${y}-${m}-${day}`);
    }

    const attendancePast7Days = await Attendance.find({
      date: { $in: past7Days },
    });

    const trendMap = {};
    past7Days.forEach((dateStr) => {
      // short label like "Oct 25"
      const parts = dateStr.split('-');
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const label = `${monthNames[parseInt(parts[1], 10) - 1]} ${parts[2]}`;
      trendMap[dateStr] = { date: dateStr, label, present: 0, absent: 0 };
    });

    attendancePast7Days.forEach((item) => {
      if (trendMap[item.date]) {
        if (item.status === 'Present') trendMap[item.date].present++;
        if (item.status === 'Absent') trendMap[item.date].absent++;
      }
    });

    const weeklyTrend = Object.values(trendMap);

    res.status(200).json({
      success: true,
      data: {
        totalStudents,
        todayPresent,
        todayAbsent,
        totalMarkedToday,
        todayPercentage,
        overallPercentage,
        todayDate: today,
        recentRecords,
        departmentStats,
        weeklyTrend,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get individual student's attendance report
// @route   GET /api/reports/student/:id
// @access  Public
const getStudentReport = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    const records = await Attendance.find({ studentId: req.params.id }).sort({ date: -1 });

    const totalMarkedDays = records.length;
    const totalPresentDays = records.filter((r) => r.status === 'Present').length;
    const totalAbsentDays = records.filter((r) => r.status === 'Absent').length;

    const percentage =
      totalMarkedDays > 0
        ? Number(((totalPresentDays / totalMarkedDays) * 100).toFixed(2))
        : 0;

    res.status(200).json({
      success: true,
      data: {
        student,
        totalMarkedDays,
        totalPresentDays,
        totalAbsentDays,
        attendancePercentage: percentage,
        history: records,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get monthly / comprehensive attendance reports with search & filters
// @route   GET /api/reports/monthly
// @access  Public
const getMonthlyReport = async (req, res, next) => {
  try {
    const { month, department, semester, search } = req.query;

    const studentQuery = {};

    if (department && department !== 'All') studentQuery.department = department;
    if (semester && semester !== 'All') studentQuery.semester = semester.toString();

    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      studentQuery.$or = [{ name: searchRegex }, { enrollmentNo: searchRegex }];
    }

    const students = await Student.find(studentQuery).sort({ enrollmentNo: 1 });

    if (students.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: [],
      });
    }

    const studentIds = students.map((s) => s._id);

    // Attendance query
    const attendanceQuery = {
      studentId: { $in: studentIds },
    };

    if (month && month !== 'All') {
      // month is 'YYYY-MM'
      attendanceQuery.date = { $regex: new RegExp(`^${month}`) };
    }

    const allRecords = await Attendance.find(attendanceQuery);

    // Group records by studentId
    const studentStatsMap = new Map();
    allRecords.forEach((rec) => {
      const sid = rec.studentId.toString();
      if (!studentStatsMap.has(sid)) {
        studentStatsMap.set(sid, { present: 0, absent: 0, total: 0 });
      }
      const item = studentStatsMap.get(sid);
      if (rec.status === 'Present') item.present++;
      if (rec.status === 'Absent') item.absent++;
      item.total++;
    });

    const reportData = students.map((stu) => {
      const stats = studentStatsMap.get(stu._id.toString()) || { present: 0, absent: 0, total: 0 };
      const percentage =
        stats.total > 0
          ? Number(((stats.present / stats.total) * 100).toFixed(2))
          : 0;

      return {
        _id: stu._id,
        name: stu.name,
        enrollmentNo: stu.enrollmentNo,
        email: stu.email,
        phone: stu.phone,
        department: stu.department,
        semester: stu.semester,
        totalMarkedDays: stats.total,
        totalPresentDays: stats.present,
        totalAbsentDays: stats.absent,
        attendancePercentage: percentage,
      };
    });

    res.status(200).json({
      success: true,
      month: month || 'All-Time',
      count: reportData.length,
      data: reportData,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardMetrics,
  getStudentReport,
  getMonthlyReport,
};

