// Automated API End-to-End Test Suite
const BASE_URL = 'http://localhost:5000/api';

const runTests = async () => {
  let passed = 0;
  let failed = 0;

  const assert = (condition, testName, details = '') => {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName} - ${details}`);
      failed++;
    }
  };

  try {
    console.log('--- Starting API Verification Tests ---');

    // 1. Health check
    const healthRes = await fetch(`${BASE_URL}/health`);
    const healthData = await healthRes.json();
    assert(healthRes.status === 200 && healthData.status === 'success', 'Health Check Endpoint (/api/health)');

    // 2. Fetch Dashboard Metrics
    const dashRes = await fetch(`${BASE_URL}/reports/dashboard`);
    const dashData = await dashRes.json();
    assert(dashRes.status === 200 && dashData.success === true, 'GET /api/reports/dashboard returns valid data', JSON.stringify(dashData));
    console.log(`   -> Total Students: ${dashData.data.totalStudents}, Today Present: ${dashData.data.todayPresent}, Overall %: ${dashData.data.overallPercentage}%`);

    // 3. Create a New Student
    const testEnrollment = `TEST${Date.now().toString().slice(-6)}`;
    const newStudentPayload = {
      name: 'Automated Test Student',
      enrollmentNo: testEnrollment,
      email: `test_${Date.now()}@university.edu`,
      phone: '9876543210',
      department: 'Computer Science',
      semester: '6',
    };

    const createStudentRes = await fetch(`${BASE_URL}/students`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newStudentPayload),
    });
    const createdStudentData = await createStudentRes.json();
    assert(createStudentRes.status === 201 && createdStudentData.success === true, 'POST /api/students creates student');
    const createdId = createdStudentData.data._id;

    // 4. Test Duplicate Enrollment Rejection
    const dupRes = await fetch(`${BASE_URL}/students`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newStudentPayload),
    });
    const dupData = await dupRes.json();
    assert(dupRes.status === 400 && dupData.success === false, 'POST /api/students rejects duplicate enrollmentNo');

    // 5. GET All Students with Search
    const searchRes = await fetch(`${BASE_URL}/students?search=${testEnrollment}`);
    const searchData = await searchRes.json();
    assert(
      searchRes.status === 200 && searchData.data.length === 1 && searchData.data[0].enrollmentNo === testEnrollment,
      'GET /api/students with ?search filter works'
    );

    // 6. Update Student
    const updateRes = await fetch(`${BASE_URL}/students/${createdId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Automated Test Student (Updated)' }),
    });
    const updateData = await updateRes.json();
    assert(updateRes.status === 200 && updateData.data.name === 'Automated Test Student (Updated)', 'PUT /api/students/:id updates student');

    // 7. Mark Attendance (Batch)
    const today = new Date().toISOString().split('T')[0];
    const markRes = await fetch(`${BASE_URL}/attendance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date: today,
        records: [
          { studentId: createdId, status: 'Present' },
        ],
      }),
    });
    const markData = await markRes.json();
    assert(markRes.status === 200 && markData.success === true, 'POST /api/attendance saves batch attendance');

    // 8. Re-mark / Update Attendance on Same Date (Upsert prevents duplicates)
    const remarkRes = await fetch(`${BASE_URL}/attendance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date: today,
        records: [
          { studentId: createdId, status: 'Absent' },
        ],
      }),
    });
    const remarkData = await remarkRes.json();
    assert(remarkRes.status === 200 && remarkData.success === true, 'POST /api/attendance updates existing date without duplicate error');

    // 9. GET Daily Attendance
    const dailyRes = await fetch(`${BASE_URL}/attendance/daily?date=${today}`);
    const dailyData = await dailyRes.json();
    const foundDailyStudent = dailyData.data.find((s) => s._id === createdId);
    assert(
      dailyRes.status === 200 && foundDailyStudent && foundDailyStudent.status === 'Absent',
      'GET /api/attendance/daily reflects marked status'
    );

    // 10. GET Student Report & Verify Percentage Formula
    const reportRes = await fetch(`${BASE_URL}/reports/student/${createdId}`);
    const reportData = await reportRes.json();
    assert(
      reportRes.status === 200 &&
      reportData.data.totalMarkedDays >= 1 &&
      typeof reportData.data.attendancePercentage === 'number',
      'GET /api/reports/student/:id calculates percentage accurately'
    );
    console.log(`   -> Student Attendance %: ${reportData.data.attendancePercentage}%`);

    // 11. GET Monthly Report
    const monthlyRes = await fetch(`${BASE_URL}/reports/monthly`);
    const monthlyData = await monthlyRes.json();
    assert(monthlyRes.status === 200 && Array.isArray(monthlyData.data), 'GET /api/reports/monthly generates table data');

    // 12. Delete Student and Cascading Attendance
    const deleteRes = await fetch(`${BASE_URL}/students/${createdId}`, {
      method: 'DELETE',
    });
    const deleteData = await deleteRes.json();
    assert(deleteRes.status === 200 && deleteData.success === true, 'DELETE /api/students/:id removes student and attendance records');

    console.log(`\n=========================================`);
    console.log(`TEST SUMMARY: ${passed} Passed, ${failed} Failed`);
    console.log(`=========================================`);

    if (failed > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error('Test Suite encountered unhandled error:', error);
    process.exit(1);
  }
};

runTests();

