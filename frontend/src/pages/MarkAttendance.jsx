import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Filter,
  CheckCircle2,
  XCircle,
  Save,
  CheckCheck,
  RotateCcw,
  AlertCircle,
  Users,
  Search,
  Sparkles,
} from 'lucide-react';
import { attendanceService } from '../services/api';
import Loader from '../components/Loader';
import Notification from '../components/Notification';
import {
  DEPARTMENTS_WITH_ALL,
  SEMESTERS_WITH_ALL,
} from '../constants/academic';

const getTodayString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const MarkAttendance = () => {
  const [date, setDate] = useState(getTodayString());
  const [department, setDepartment] = useState('All');
  const [semester, setSemester] = useState('All');
  const [search, setSearch] = useState('');

  const [students, setStudents] = useState([]);
  const [attendanceState, setAttendanceState] = useState({}); // { [studentId]: 'Present' | 'Absent' }
  const [initialServerState, setInitialServerState] = useState({}); // Baseline from database
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState(null);

  // Fetch daily attendance sheet
  const fetchAttendanceSheet = async () => {
    try {
      setLoading(true);
      const params = { date };
      if (department !== 'All') params.department = department;
      if (semester !== 'All') params.semester = semester;

      const res = await attendanceService.getDaily(params);
      if (res.data && res.data.success) {
        setStudents(res.data.data);

        // Populate local attendance state with existing status (if already saved)
        const initialStatus = {};
        res.data.data.forEach((student) => {
          if (student.status) {
            initialStatus[student._id] = student.status;
          }
        });
        setAttendanceState(initialStatus);
        setInitialServerState(initialStatus);
      }
    } catch (err) {
      console.error('Error fetching attendance sheet:', err);
      setNotification({
        type: 'error',
        message: err.response?.data?.message || 'Failed to fetch attendance data for selected filters.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceSheet();
  }, [date, department, semester]);

  // Set single student status
  const handleSetStatus = (studentId, status) => {
    setAttendanceState((prev) => ({
      ...prev,
      [studentId]: status,
    }));
  };

  // Mark all present
  const handleMarkAllPresent = () => {
    const updated = { ...attendanceState };
    filteredStudents.forEach((student) => {
      updated[student._id] = 'Present';
    });
    setAttendanceState(updated);
    setNotification({
      type: 'info',
      message: 'Marked all currently filtered students as Present.',
    });
  };

  // Mark all absent
  const handleMarkAllAbsent = () => {
    const updated = { ...attendanceState };
    filteredStudents.forEach((student) => {
      updated[student._id] = 'Absent';
    });
    setAttendanceState(updated);
    setNotification({
      type: 'info',
      message: 'Marked all currently filtered students as Absent.',
    });
  };

  // Reset to initial server loaded state
  const handleReset = () => {
    setAttendanceState({ ...initialServerState });
    setNotification({
      type: 'info',
      message: 'Reverted attendance selections to the saved database state.',
    });
  };

  // Save attendance to backend
  const handleSaveAttendance = async () => {
    const records = [];
    filteredStudents.forEach((student) => {
      const status = attendanceState[student._id];
      if (status) {
        records.push({
          studentId: student._id,
          status,
        });
      }
    });

    if (records.length === 0) {
      setNotification({
        type: 'error',
        message: 'No student attendance marked yet. Please select Present or Absent before saving.',
      });
      return;
    }

    try {
      setSaving(true);
      const payload = {
        date,
        records,
      };

      const res = await attendanceService.save(payload);
      if (res.data && res.data.success) {
        setNotification({
          type: 'success',
          message: `Attendance for ${records.length} students on ${date} saved to database!`,
        });
        // Re-fetch sheet to refresh state
        fetchAttendanceSheet();
      }
    } catch (err) {
      console.error('Failed to save attendance:', err);
      setNotification({
        type: 'error',
        message: err.response?.data?.message || 'Failed to save attendance records to database.',
      });
    } finally {
      setSaving(false);
    }
  };

  // Filter students by local search
  const filteredStudents = students.filter((stu) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return stu.name.toLowerCase().includes(q) || stu.enrollmentNo.toLowerCase().includes(q);
  });

  // Calculate live counts
  const presentCount = filteredStudents.filter((s) => attendanceState[s._id] === 'Present').length;
  const absentCount = filteredStudents.filter((s) => attendanceState[s._id] === 'Absent').length;
  const unmarkedCount = filteredStudents.length - (presentCount + absentCount);

  return (
    <div className="space-y-6">
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Header and Controls */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Daily Attendance Marking</h2>
            <p className="text-sm text-slate-500 mt-1">
              Select date, department, and semester to log or edit student attendance.
            </p>
          </div>
          {/* Save button */}
          <button
            onClick={handleSaveAttendance}
            disabled={saving || loading || filteredStudents.length === 0}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-sm shadow-blue-500/20 transition disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving to Database...' : 'Save Attendance'}
          </button>
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
          {/* Date Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              Attendance Date
            </label>
            <input
              type="date"
              value={date}
              max={getTodayString()}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium cursor-pointer"
            />
          </div>

          {/* Department Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Department
            </label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium cursor-pointer"
            >
              {DEPARTMENTS_WITH_ALL.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>

          {/* Semester Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Semester
            </label>
            <select
              value={semester}
              onChange={(e) => setSemester(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium cursor-pointer"
            >
              {SEMESTERS_WITH_ALL.map((sem) => (
                <option key={sem} value={sem}>
                  {sem === 'All' ? 'All Semesters' : `Semester ${sem}`}
                </option>
              ))}
            </select>
          </div>

          {/* Quick Search */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Search className="w-3.5 h-3.5 text-slate-500" />
              Search Student
            </label>
            <input
              type="text"
              placeholder="Search in view..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Summary Metrics & Batch Action Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Real-time counters */}
        <div className="flex items-center gap-3 sm:gap-6 flex-wrap text-sm">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
            <span className="text-slate-500 font-medium">Students in view:</span>
            <span className="font-bold text-slate-900">{filteredStudents.length}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-emerald-700 font-medium">Present:</span>
            <span className="font-bold text-emerald-800">{presentCount}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span className="text-rose-700 font-medium">Absent:</span>
            <span className="font-bold text-rose-800">{absentCount}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span className="text-amber-700 font-medium">Unmarked:</span>
            <span className="font-bold text-amber-800">{unmarkedCount}</span>
          </div>
        </div>

        {/* Batch buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleMarkAllPresent}
            disabled={filteredStudents.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition disabled:opacity-50 cursor-pointer"
          >
            <CheckCheck className="w-3.5 h-3.5" />
            Mark All Present
          </button>
          <button
            type="button"
            onClick={handleMarkAllAbsent}
            disabled={filteredStudents.length === 0}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition disabled:opacity-50 cursor-pointer"
          >
            <XCircle className="w-3.5 h-3.5" />
            Mark All Absent
          </button>
          <button
            type="button"
            onClick={handleReset}
            disabled={filteredStudents.length === 0}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200 transition disabled:opacity-50 cursor-pointer"
            title="Reset selections"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Attendance Student Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <Loader message="Loading students for selected filters..." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">#</th>
                  <th className="py-3.5 px-4">Student Details</th>
                  <th className="py-3.5 px-4">Enrollment No</th>
                  <th className="py-3.5 px-4">Dept & Sem</th>
                  <th className="py-3.5 px-4 sm:px-6 text-center">Attendance Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student, idx) => {
                    const status = attendanceState[student._id];
                    const isPresent = status === 'Present';
                    const isAbsent = status === 'Absent';

                    return (
                      <tr
                        key={student._id}
                        className={`transition ${
                          isPresent
                            ? 'bg-emerald-50/20'
                            : isAbsent
                            ? 'bg-rose-50/20'
                            : 'hover:bg-slate-50/60'
                        }`}
                      >
                        <td className="py-3.5 px-4 sm:px-6 text-xs text-slate-400 font-mono">
                          {idx + 1}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-slate-900">{student.name}</div>
                          <div className="text-xs text-slate-400">{student.email}</div>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-xs font-medium text-slate-700">
                          {student.enrollmentNo}
                        </td>
                        <td className="py-3.5 px-4 text-xs text-slate-600">
                          <div>{student.department}</div>
                          <div className="text-slate-400">Sem {student.semester}</div>
                        </td>
                        <td className="py-3.5 px-4 sm:px-6 text-center">
                          <div className="inline-flex items-center gap-2 p-1 bg-slate-100 rounded-xl">
                            {/* Present Toggle */}
                            <button
                              type="button"
                              onClick={() => handleSetStatus(student._id, 'Present')}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                                isPresent
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50'
                              }`}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Present</span>
                            </button>

                            {/* Absent Toggle */}
                            <button
                              type="button"
                              onClick={() => handleSetStatus(student._id, 'Absent')}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                                isAbsent
                                  ? 'bg-rose-600 text-white shadow-xs'
                                  : 'text-slate-600 hover:text-rose-700 hover:bg-rose-50'
                              }`}
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Absent</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-12 text-slate-400">
                      <Users className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                      <p className="text-base font-semibold text-slate-700">No students match filter criteria</p>
                      <p className="text-xs text-slate-400 mt-1">
                        Select a different department or semester, or register new students.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Bottom Save Bar */}
        <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-xs text-slate-500">
            {unmarkedCount > 0 ? (
              <span className="text-amber-600 font-medium">
                Warning: {unmarkedCount} student(s) still unmarked.
              </span>
            ) : (
              <span className="text-emerald-600 font-medium">
                All {filteredStudents.length} students have been marked for {date}.
              </span>
            )}
          </p>

          <button
            onClick={handleSaveAttendance}
            disabled={saving || loading || filteredStudents.length === 0}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-sm shadow-blue-500/20 transition disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving to MongoDB...' : 'Save Attendance'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MarkAttendance;
