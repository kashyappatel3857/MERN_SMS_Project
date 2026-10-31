import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Search,
  Filter,
  UserPlus,
  Edit2,
  Trash2,
  Eye,
  AlertTriangle,
  RefreshCw,
  Mail,
  Phone,
  GraduationCap,
} from 'lucide-react';
import { studentService, reportService } from '../services/api';
import Loader from '../components/Loader';
import Modal from '../components/Modal';
import Notification from '../components/Notification';
import {
  DEPARTMENTS,
  SEMESTERS,
  DEPARTMENTS_WITH_ALL,
  SEMESTERS_WITH_ALL,
} from '../constants/academic';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [selectedSem, setSelectedSem] = useState('All');
  const [notification, setNotification] = useState(null);

  // Edit Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    enrollmentNo: '',
    email: '',
    phone: '',
    department: 'Computer Science',
    semester: '1',
  });
  const [editSubmitting, setEditSubmitting] = useState(false);

  // Delete Modal State
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  // View Attendance Modal State
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewingStudentReport, setViewingStudentReport] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search.trim()) params.search = search.trim();
      if (selectedDept !== 'All') params.department = selectedDept;
      if (selectedSem !== 'All') params.semester = selectedSem;

      const res = await studentService.getAll(params);
      if (res.data && res.data.success) {
        setStudents(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching students:', err);
      setNotification({
        type: 'error',
        message: err.response?.data?.message || 'Failed to fetch students.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Debounce search slightly or fetch on change
    const timer = setTimeout(() => {
      fetchStudents();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, selectedDept, selectedSem]);

  // Open Edit Modal
  const handleOpenEdit = (student) => {
    setEditingStudent(student);
    setEditForm({
      name: student.name,
      enrollmentNo: student.enrollmentNo,
      email: student.email,
      phone: student.phone,
      department: student.department,
      semester: (student.semester ?? '').toString(),
    });
    setEditModalOpen(true);
  };

  // Submit Edit Form
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    try {
      setEditSubmitting(true);
      const res = await studentService.update(editingStudent._id, editForm);
      if (res.data && res.data.success) {
        setNotification({
          type: 'success',
          message: 'Student details updated successfully!',
        });
        setEditModalOpen(false);
        fetchStudents();
      }
    } catch (err) {
      setNotification({
        type: 'error',
        message: err.response?.data?.message || 'Failed to update student details.',
      });
    } finally {
      setEditSubmitting(false);
    }
  };

  // Open Delete Modal
  const handleOpenDelete = (student) => {
    setStudentToDelete(student);
    setDeleteModalOpen(true);
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    try {
      setDeleteSubmitting(true);
      const res = await studentService.delete(studentToDelete._id);
      if (res.data && res.data.success) {
        setNotification({
          type: 'success',
          message: 'Student and attendance records deleted successfully!',
        });
        setDeleteModalOpen(false);
        setStudentToDelete(null);
        fetchStudents();
      }
    } catch (err) {
      setNotification({
        type: 'error',
        message: err.response?.data?.message || 'Failed to delete student.',
      });
    } finally {
      setDeleteSubmitting(false);
    }
  };

  // View Student Attendance Details
  const handleViewReport = async (student) => {
    try {
      setViewingStudentReport(null); // Clear stale previous student record
      setViewLoading(true);
      setViewModalOpen(true);
      const res = await reportService.getStudentReport(student._id);
      if (res.data && res.data.success) {
        setViewingStudentReport(res.data.data);
      }
    } catch (err) {
      setNotification({
        type: 'error',
        message: err.response?.data?.message || 'Failed to load student attendance details.',
      });
    } finally {
      setViewLoading(false);
    }
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
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Student Directory</h2>
          <p className="text-sm text-slate-500 mt-1">
            Manage student registrations, academic info, and individual records.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchStudents}
            className="p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-600 transition cursor-pointer"
            title="Refresh student list"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Link
            to="/students/add"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm shadow-blue-500/20 transition cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            Add New Student
          </Link>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search input */}
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
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Filter className="w-3.5 h-3.5" />
            <span>Filters:</span>
          </div>

          {/* Department Filter */}
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
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
            value={selectedSem}
            onChange={(e) => setSelectedSem(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium cursor-pointer"
          >
            {SEMESTERS_WITH_ALL.map((sem) => (
              <option key={sem} value={sem}>
                {sem === 'All' ? 'Semester: All' : `Sem: ${sem}`}
              </option>
            ))}
          </select>

          {(search || selectedDept !== 'All' || selectedSem !== 'All') && (
            <button
              onClick={() => {
                setSearch('');
                setSelectedDept('All');
                setSelectedSem('All');
              }}
              className="text-xs text-rose-600 hover:text-rose-700 font-medium px-2 py-1 underline cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading && students.length === 0 ? (
          <Loader message="Loading students..." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">Student Name</th>
                  <th className="py-3.5 px-4">Enrollment No</th>
                  <th className="py-3.5 px-4">Department & Sem</th>
                  <th className="py-3.5 px-4 hidden md:table-cell">Contact Details</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.length > 0 ? (
                  students.map((stu) => (
                    <tr key={stu._id} className="hover:bg-slate-50/60 transition group">
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="font-semibold text-slate-900">{stu.name}</div>
                        <div className="text-xs text-slate-400 md:hidden">{stu.email}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-block px-2.5 py-1 bg-blue-50 text-blue-700 font-mono text-xs font-semibold rounded-md border border-blue-100">
                          {stu.enrollmentNo}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-slate-800 font-medium text-xs sm:text-sm">
                          {stu.department}
                        </div>
                        <div className="text-xs text-slate-400">Semester {stu.semester}</div>
                      </td>
                      <td className="py-3.5 px-4 hidden md:table-cell">
                        <div className="flex items-center gap-1.5 text-xs text-slate-600">
                          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{stu.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                          <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{stu.phone}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleViewReport(stu)}
                            title="View Attendance Report"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(stu)}
                            title="Edit Student Details"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition cursor-pointer"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenDelete(stu)}
                            title="Delete Student"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-12 text-slate-400">
                      <Users className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                      <p className="text-base font-semibold text-slate-700">No students found</p>
                      <p className="text-xs text-slate-400 mt-1">
                        Try modifying your search or add a new student.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing <strong className="text-slate-800">{students.length}</strong> students
          </span>
          <span className="font-mono">Total Database Records</span>
        </div>
      </div>

      {/* Edit Student Modal */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Edit Student Details"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Full Name *
            </label>
            <input
              type="text"
              required
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Enrollment Number (Unique) *
            </label>
            <input
              type="text"
              required
              value={editForm.enrollmentNo}
              onChange={(e) =>
                setEditForm({ ...editForm, enrollmentNo: e.target.value.toUpperCase() })
              }
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Department *
              </label>
              <select
                required
                value={editForm.department}
                onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
              >
                {DEPARTMENTS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Semester *
              </label>
              <select
                required
                value={editForm.semester}
                onChange={(e) => setEditForm({ ...editForm, semester: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
              >
                {SEMESTERS.map((s) => (
                  <option key={s} value={s}>
                    Semester {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Email Address *
            </label>
            <input
              type="email"
              required
              value={editForm.email}
              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Phone Number *
            </label>
            <input
              type="tel"
              required
              value={editForm.phone}
              onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setEditModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={editSubmitting}
              className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              {editSubmitting ? 'Saving Changes...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirm Student Deletion"
        maxWidth="max-w-sm"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-rose-600 bg-rose-50 p-3.5 rounded-xl border border-rose-100">
            <AlertTriangle className="w-6 h-6 shrink-0" />
            <p className="text-xs font-medium">
              This action cannot be undone. All attendance records associated with this student will also be removed.
            </p>
          </div>

          <p className="text-sm text-slate-600">
            Are you sure you want to permanently delete student{' '}
            <strong className="text-slate-900">{studentToDelete?.name}</strong> (
            <span className="font-mono text-xs">{studentToDelete?.enrollmentNo}</span>)?
          </p>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setDeleteModalOpen(false)}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirmDelete}
              disabled={deleteSubmitting}
              className="px-4 py-2 text-sm font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition disabled:opacity-50 cursor-pointer"
            >
              {deleteSubmitting ? 'Deleting...' : 'Yes, Delete'}
            </button>
          </div>
        </div>
      </Modal>

      {/* View Individual Student Attendance Report Modal */}
      <Modal
        isOpen={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        title="Student Attendance Record"
        maxWidth="max-w-xl"
      >
        {viewLoading ? (
          <Loader message="Fetching attendance history..." />
        ) : viewingStudentReport ? (
          <div className="space-y-4">
            {/* Student Bio */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900 text-base">
                  {viewingStudentReport.student.name}
                </h4>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  Enrollment: {viewingStudentReport.student.enrollmentNo}
                </p>
                <p className="text-xs text-slate-500">
                  {viewingStudentReport.student.department} • Semester {viewingStudentReport.student.semester}
                </p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-blue-600">
                  {viewingStudentReport.attendancePercentage}%
                </span>
                <p className="text-[11px] font-semibold uppercase text-slate-500 tracking-wider">
                  Attendance
                </p>
              </div>
            </div>

            {/* Attendance Stats Cards */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl bg-slate-100 text-slate-800">
                <span className="block font-bold text-lg">{viewingStudentReport.totalMarkedDays}</span>
                <span className="text-xs text-slate-500">Total Marked</span>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800">
                <span className="block font-bold text-lg">{viewingStudentReport.totalPresentDays}</span>
                <span className="text-xs text-emerald-600">Present</span>
              </div>
              <div className="p-3 rounded-xl bg-rose-50 text-rose-800">
                <span className="block font-bold text-lg">{viewingStudentReport.totalAbsentDays}</span>
                <span className="text-xs text-rose-600">Absent</span>
              </div>
            </div>

            {/* Attendance History Table */}
            <div>
              <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                Detailed Date Log
              </h5>
              <div className="max-h-56 overflow-y-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-semibold sticky top-0 border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {viewingStudentReport.history.length > 0 ? (
                      viewingStudentReport.history.map((h) => (
                        <tr key={h._id}>
                          <td className="py-2 px-3 font-mono text-slate-700">{h.date}</td>
                          <td className="py-2 px-3 text-right">
                            <span
                              className={`inline-block px-2 py-0.5 rounded-full font-semibold text-[11px] ${
                                h.status === 'Present'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {h.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="2" className="text-center py-4 text-slate-400">
                          No marked attendance logs for this student yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="text-right pt-2">
              <button
                onClick={() => setViewModalOpen(false)}
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

export default Students;
