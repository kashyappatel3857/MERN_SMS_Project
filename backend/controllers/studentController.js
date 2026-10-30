const Student = require('../models/Student');
const Attendance = require('../models/Attendance');

// @desc    Create new student
// @route   POST /api/students
// @access  Public
const createStudent = async (req, res, next) => {
  try {
    const { name, enrollmentNo, email, phone, department, semester } = req.body;

    if (!name || !enrollmentNo || !email || !phone || !department || !semester) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, enrollmentNo, email, phone, department, semester',
      });
    }

    const existingStudent = await Student.findOne({
      enrollmentNo: enrollmentNo.trim().toUpperCase(),
    });

    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: `Student with enrollment number ${enrollmentNo.toUpperCase()} already exists.`,
      });
    }

    const student = await Student.create({
      name: name.trim(),
      enrollmentNo: enrollmentNo.trim().toUpperCase(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      department: department.trim(),
      semester: semester.toString().trim(),
    });

    res.status(201).json({
      success: true,
      message: 'Student created successfully',
      data: student,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all students (with search and filters)
// @route   GET /api/students
// @access  Public
const getStudents = async (req, res, next) => {
  try {
    const { search, department, semester, sortBy = 'createdAt', order = 'desc' } = req.query;

    const query = {};

    // Search by name or enrollment number
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [{ name: searchRegex }, { enrollmentNo: searchRegex }];
    }

    // Filter by department
    if (department && department !== 'All') {
      query.department = department.trim();
    }

    // Filter by semester
    if (semester && semester !== 'All') {
      query.semester = semester.toString().trim();
    }

    const sortOrder = order === 'asc' ? 1 : -1;
    const sortCriteria = { [sortBy]: sortOrder };

    const students = await Student.find(query).sort(sortCriteria);

    res.status(200).json({
      success: true,
      count: students.length,
      data: students,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single student by ID
// @route   GET /api/students/:id
// @access  Public
const getStudentById = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    res.status(200).json({
      success: true,
      data: student,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update student details
// @route   PUT /api/students/:id
// @access  Public
const updateStudent = async (req, res, next) => {
  try {
    const { name, enrollmentNo, email, phone, department, semester } = req.body;

    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    // Check if new enrollmentNo conflicts with another student
    if (enrollmentNo && enrollmentNo.trim().toUpperCase() !== student.enrollmentNo) {
      const existing = await Student.findOne({
        enrollmentNo: enrollmentNo.trim().toUpperCase(),
        _id: { $ne: req.params.id },
      });

      if (existing) {
        return res.status(400).json({
          success: false,
          message: `Student with enrollment number ${enrollmentNo.toUpperCase()} already exists.`,
        });
      }
      student.enrollmentNo = enrollmentNo.trim().toUpperCase();
    }

    if (name) student.name = name.trim();
    if (email) student.email = email.trim().toLowerCase();
    if (phone) student.phone = phone.trim();
    if (department) student.department = department.trim();
    if (semester) student.semester = semester.toString().trim();

    const updatedStudent = await student.save();

    res.status(200).json({
      success: true,
      message: 'Student updated successfully',
      data: updatedStudent,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete student and associated attendance records
// @route   DELETE /api/students/:id
// @access  Public
const deleteStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found',
      });
    }

    // Remove student's attendance records to maintain integrity
    await Attendance.deleteMany({ studentId: student._id });

    // Remove student
    await Student.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Student and related attendance records deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
};

