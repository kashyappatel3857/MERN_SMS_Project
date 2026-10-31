import React, { useState, useEffect } from 'react';
import {
  FileBarChart2,
  Search,
  Filter,
  Calendar,
  Eye,
  Download,
  CheckCircle2,
  XCircle,
  Percent,
  RefreshCw,
  Award,
  AlertTriangle,
} from 'lucide-react';
import { reportService } from '../services/api';
import Loader from '../components/Loader';
import Modal from '../components/Modal';
import Notification from '../components/Notification';
import {
  DEPARTMENTS_WITH_ALL,
  SEMESTERS_WITH_ALL,
} from '../constants/academic';

const getCurrentMonthString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

const AttendanceReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(getCurrentMonthString());
  const [department, setDepartment] = useState('All');
  const [semester, setSemester] = useState('All');
  const [search, setSearch] = useState('');
  const [notification, setNotification] = useState(null);

  // Student history modal
  const [selectedStudentReport, setSelectedStudentReport] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const params = {};
      if (month) params.month = month;
      if (department !== 'All') params.department = department;
      if (semester !== 'All') params.semester = semester;
      if (search.trim()) params.search = search.trim();

      const res = await reportService.getMonthlyReport(params);
      if (res.data && res.data.success) {
        setReports(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching reports:', err);
      setNotification({
        type: 'error',
        message: err.response?.data?.message || 'Failed to generate attendance reports.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchReports();
    }, 250);
    return () => clearTimeout(timer);
  }, [month, department, semester, search]);

  const handleOpenStudentDetail = async (studentId) => {
    try {
      setSelectedStudentReport(null); // Clear previous student data to avoid flash of stale info
      setModalLoading(true);
      setModalOpen(true);
      const res = await reportService.getStudentReport(studentId);
      if (res.data && res.data.success) {
        setSelectedStudentReport(res.data.data);
      }
    } catch (err) {
      setNotification({
        type: 'error',
        message: 'Failed to load student attendance details.',
      });
    } finally {
      setModalLoading(false);
    }
  };

  // Helper for percentage badge color
  const getPercentageBadge = (pct) => {
    if (pct >= 75) {
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    } else if (pct >= 60) {
      return 'bg-amber-100 text-amber-800 border-amber-200';
    }
    return 'bg-rose-100 text-rose-800 border-rose-200';
  };

  // Print report
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Attendance Reports</h2>
          <p className="text-sm text-slate-500 mt-1">
            Student attendance analytics, present/absent days, and percentage metrics.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchReports}
            className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 transition cursor-pointer"
            title="Refresh reports"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-sm font-semibold transition cursor-pointer"
          >
            <Download className="w-4 h-4" />
            Print / Export
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by student name or enrollment number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Month selector */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-700">
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            <span>Month:</span>
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="bg-transparent focus:outline-hidden text-slate-800 font-semibold cursor-pointer"
            />
          </div>

          {/* Department Filter */}
          <select
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium cursor-pointer"
          >
            {DEPARTMENTS_WITH_ALL.map((dept) => (
              <option key={dept} value={dept}>
                Dept: {dept}
              </option>
            ))}
          </select>

          {/* Semester Filter */}
          <select
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium cursor-pointer"
          >
            {SEMESTERS_WITH_ALL.map((sem) => (
              <option key={sem} value={sem}>
                {sem === 'All' ? 'Semester: All' : `Sem: ${sem}`}
              </option>
            ))}
          </select>

          {/* Reset button */}
          {(department !== 'All' || semester !== 'All' || search) && (
            <button
              onClick={() => {
                setDepartment('All');
                setSemester('All');
                setSearch('');
              }}
              className="text-xs text-rose-600 hover:text-rose-700 font-medium px-2 py-1 underline cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <Loader message="Calculating attendance metrics..." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">Student Name</th>
                  <th className="py-3.5 px-4">Enrollment No</th>
                  <th className="py-3.5 px-4">Dept & Sem</th>
                  <th className="py-3.5 px-4 text-center">Present Days</th>
                  <th className="py-3.5 px-4 text-center">Absent Days</th>
                  <th className="py-3.5 px-4 text-center">Total Marked</th>
                  <th className="py-3.5 px-4 text-center">Attendance %</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reports.length > 0 ? (
                  reports.map((item) => (
                    <tr
                      key={item._id}
                      className="hover:bg-slate-50/60 transition group cursor-pointer"
                      onClick={() => handleOpenStudentDetail(item._id)}
                    >
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition">
                          {item.name}
                        </div>
                        <div className="text-xs text-slate-400">{item.email}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                          {item.enrollmentNo}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-600">
                        <div>{item.department}</div>
                        <div className="text-slate-400">Sem {item.semester}</div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="font-bold text-emerald-600">{item.totalPresentDays}</span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="font-bold text-rose-600">{item.totalAbsentDays}</span>
                      </td>
                      <td className="py-3.5 px-4 text-center font-semibold text-slate-700">
                        {item.totalMarkedDays}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getPercentageBadge(
                              item.attendancePercentage
                            )}`}
                          >
                            {item.attendancePercentage}%
                          </span>
                          {/* Mini Progress Bar */}
                          <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden mt-1.5">
                            <div
                              className={`h-full ${
                                item.attendancePercentage >= 75
                                  ? 'bg-emerald-500'
                                  : item.attendancePercentage >= 60
                                  ? 'bg-amber-500'
                                  : 'bg-rose-500'
                              }`}
                              style={{ width: `${item.attendancePercentage}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 text-right">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenStudentDetail(item._id);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                          title="View detailed log"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center py-12 text-slate-400">
                      <FileBarChart2 className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                      <p className="text-base font-semibold text-slate-700">No reports found</p>
                      <p className="text-xs text-slate-400 mt-1">
                        Try selecting another month or change your department filter.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div>
            <span>
              Formula:{' '}
              <code className="bg-slate-200/80 px-1.5 py-0.5 rounded-sm text-[11px] font-mono text-slate-700">
                Attendance % = (Present Days / Total Marked Days) × 100
              </code>
            </span>
          </div>
          <div>
            <span className="font-semibold text-slate-700">{reports.length}</span> students evaluated
          </div>
        </div>
      </div>

      {/* Student Attendance Detail Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Student Attendance Report"
        maxWidth="max-w-xl"
      >
        {modalLoading ? (
          <Loader message="Loading student log..." />
        ) : selectedStudentReport ? (
          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-base">
                  {selectedStudentReport.student.name}
                </h4>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  Enrollment: {selectedStudentReport.student.enrollmentNo}
                </p>
                <p className="text-xs text-slate-500">
                  {selectedStudentReport.student.department} • Semester{' '}
                  {selectedStudentReport.student.semester}
                </p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-blue-600">
                  {selectedStudentReport.attendancePercentage}%
                </span>
                <p className="text-[11px] font-semibold uppercase text-slate-500 tracking-wider">
                  Attendance
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl bg-slate-100 text-slate-800">
                <span className="block font-bold text-lg">{selectedStudentReport.totalMarkedDays}</span>
                <span className="text-xs text-slate-500">Total Days Marked</span>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800">
                <span className="block font-bold text-lg">{selectedStudentReport.totalPresentDays}</span>
                <span className="text-xs text-emerald-600">Present Days</span>
              </div>
              <div className="p-3 rounded-xl bg-rose-50 text-rose-800">
                <span className="block font-bold text-lg">{selectedStudentReport.totalAbsentDays}</span>
                <span className="text-xs text-rose-600">Absent Days</span>
              </div>
            </div>

            <div>
              <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                All Recorded Dates
              </h5>
              <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold sticky top-0 border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedStudentReport.history.length > 0 ? (
                      selectedStudentReport.history.map((record) => (
                        <tr key={record._id}>
                          <td className="py-2 px-3 font-mono text-slate-700">{record.date}</td>
                          <td className="py-2 px-3 text-right">
                            <span
                              className={`inline-block px-2.5 py-0.5 rounded-full font-semibold text-[11px] ${
                                record.status === 'Present'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {record.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="2" className="text-center py-4 text-slate-400">
                          No attendance marked yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="text-right pt-2">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
};

export default AttendanceReports;
