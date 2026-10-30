const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Student = require('./models/Student');
const Attendance = require('./models/Attendance');
const connectDB = require('./config/db');

dotenv.config();

const sampleStudents = [
  {
    name: 'Aarav Sharma',
    enrollmentNo: 'CS2024001',
    email: 'aarav.sharma@example.com',
    phone: '9876543210',
    department: 'Computer Science',
    semester: '6',
  },
  {
    name: 'Ananya Verma',
    enrollmentNo: 'CS2024002',
    email: 'ananya.verma@example.com',
    phone: '9876543211',
    department: 'Computer Science',
    semester: '6',
  },
  {
    name: 'Rohan Gupta',
    enrollmentNo: 'CS2024003',
    email: 'rohan.gupta@example.com',
    phone: '9876543212',
    department: 'Computer Science',
    semester: '4',
  },
  {
    name: 'Ishita Patel',
    enrollmentNo: 'IT2024001',
    email: 'ishita.patel@example.com',
    phone: '9876543213',
    department: 'Information Technology',
    semester: '6',
  },
  {
    name: 'Kabir Mehta',
    enrollmentNo: 'IT2024002',
    email: 'kabir.mehta@example.com',
    phone: '9876543214',
    department: 'Information Technology',
    semester: '6',
  },
  {
    name: 'Pooja Nair',
    enrollmentNo: 'IT2024003',
    email: 'pooja.nair@example.com',
    phone: '9876543215',
    department: 'Information Technology',
    semester: '4',
  },
  {
    name: 'Siddharth Joshi',
    enrollmentNo: 'EC2024001',
    email: 'siddharth.joshi@example.com',
    phone: '9876543216',
    department: 'Electronics',
    semester: '6',
  },
  {
    name: 'Diya Reddy',
    enrollmentNo: 'EC2024002',
    email: 'diya.reddy@example.com',
    phone: '9876543217',
    department: 'Electronics',
    semester: '4',
  },
  {
    name: 'Vikram Singh',
    enrollmentNo: 'ME2024001',
    email: 'vikram.singh@example.com',
    phone: '9876543218',
    department: 'Mechanical',
    semester: '6',
  },
  {
    name: 'Sneha Kulkarni',
    enrollmentNo: 'CV2024001',
    email: 'sneha.kulkarni@example.com',
    phone: '9876543219',
    department: 'Civil',
    semester: '4',
  },
];

const seedData = async () => {
  try {
    await connectDB();

    console.log('Clearing existing data...');
    await Attendance.deleteMany();
    await Student.deleteMany();

    console.log('Inserting sample students...');
    const createdStudents = await Student.insertMany(sampleStudents);
    console.log(`Successfully added ${createdStudents.length} students.`);

    // Generate dates for the past 5 days including today
    const dates = [];
    for (let i = 4; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      dates.push(`${y}-${m}-${day}`);
    }

    const attendanceRecords = [];
    dates.forEach((date, dateIdx) => {
      createdStudents.forEach((student, stuIdx) => {
        // Deterministic realistic attendance (approx 80% present)
        const isAbsent = (stuIdx + dateIdx) % 5 === 0;
        attendanceRecords.push({
          studentId: student._id,
          date,
          status: isAbsent ? 'Absent' : 'Present',
        });
      });
    });

    console.log(`Inserting ${attendanceRecords.length} attendance records...`);
    await Attendance.insertMany(attendanceRecords);

    console.log('Data Seeding Completed Successfully!');
    process.exit(0);
  } catch (error) {
    console.error(`Error during seeding: ${error.message}`);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await connectDB();
    await Attendance.deleteMany();
    await Student.deleteMany();
    console.log('Data Destroyed Successfully!');
    process.exit(0);
  } catch (error) {
    console.error(`Error destroying data: ${error.message}`);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  seedData();
}

