import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  UserCheck,
  UserX,
  Percent,
  TrendingUp,
  Clock,
  ArrowRight,
  ClipboardCheck,
  UserPlus,
  RefreshCw,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import StatCard from '../components/StatCard';
import Loader from '../components/Loader';
import Notification from '../components/Notification';
import { reportService } from '../services/api';

const COLORS = ['#10b981', '#ef4444', '#cbd5e1'];

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [notification, setNotification] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await reportService.getDashboard();
      if (res.data && res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard metrics:', err);
      setNotification({
        type: 'error',
        message: err.response?.data?.message || 'Failed to load dashboard metrics from backend.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading && !data) {
    return <Loader fullScreen message="Loading dashboard statistics..." />;
  }

  const {
    totalStudents = 0,
    todayPresent = 0,
    todayAbsent = 0,
    totalMarkedToday = 0,
    todayPercentage = 0,
    overallPercentage = 0,
    todayDate = '',
    recentRecords = [],
    weeklyTrend = [],
    departmentStats = [],
  } = data || {};

  const pieData = [
    { name: 'Present Today', value: todayPresent },
    { name: 'Absent Today', value: todayAbsent },
  ];

  // If none marked today, show placeholder in pie chart
  const hasTodayAttendance = todayPresent > 0 || todayAbsent > 0;
  const pieDisplayData = hasTodayAttendance
    ? pieData
    : [{ name: 'Not Marked Yet', value: totalStudents || 1 }];

  return (
    <div className="space-y-6">
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-800">Attendance Overview</h2>
          <p className="text-sm text-slate-500 mt-1">
            Real-time insights for today ({todayDate}) fetched from MongoDB.
          </p>
        </div>
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-sm font-medium transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <Link
            to="/attendance"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium shadow-sm shadow-blue-500/20 transition"
          >
            <ClipboardCheck className="w-4 h-4" />
            Mark Attendance
          </Link>
          <Link
            to="/students/add"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-sm font-medium transition"
          >
            <UserPlus className="w-4 h-4" />
            Add Student
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Total Students"
          value={totalStudents}
          icon={Users}
          color="blue"
          subtitle="Registered in system"
        />
        <StatCard
          title="Present Today"
          value={todayPresent}
          icon={UserCheck}
          color="emerald"
          subtitle={
            totalMarkedToday > 0
              ? `${todayPercentage}% of marked (${totalMarkedToday})`
              : 'No attendance marked today'
          }
        />
        <StatCard
          title="Absent Today"
          value={todayAbsent}
          icon={UserX}
          color="rose"
          subtitle={
            totalMarkedToday > 0
              ? `${(100 - todayPercentage).toFixed(1)}% of marked students`
              : 'No records today'
          }
        />
        <StatCard
          title="Overall Attendance"
          value={`${overallPercentage}%`}
          icon={Percent}
          color="indigo"
          subtitle="Cumulative all-time percentage"
        />
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Present vs Absent Today Pie Chart */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-800">Present vs Absent</h3>
              <p className="text-xs text-slate-500">Today's ratio breakdown</p>
            </div>
            <span className="text-xs font-medium px-2 py-1 rounded-md bg-slate-100 text-slate-600">
              {todayDate}
            </span>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            {hasTodayAttendance ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieDisplayData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    <Cell fill="#10b981" />
                    <Cell fill="#ef4444" />
                  </Pie>
                  <Tooltip
                    formatter={(val, name) => [`${val} students`, name]}
                    contentStyle={{ borderRadius: '12px', borderColor: '#e2e8f0' }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center p-6 text-slate-400">
                <p className="text-sm font-medium">No attendance recorded for today yet.</p>
                <Link
                  to="/attendance"
                  className="mt-3 inline-block text-xs text-blue-600 font-semibold hover:underline"
                >
                  Mark attendance for today &rarr;
                </Link>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-2 text-center text-xs">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-800">
              <span className="block font-bold text-lg">{todayPresent}</span>
              <span>Present Today</span>
            </div>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-800">
              <span className="block font-bold text-lg">{todayAbsent}</span>
              <span>Absent Today</span>
            </div>
          </div>
        </div>

        {/* Weekly Attendance Trend Bar Chart */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs lg:col-span-2 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-800">Weekly Attendance Overview</h3>
              <p className="text-xs text-slate-500">Student attendance trend over the past 7 days</p>
            </div>
            <span className="text-xs font-semibold px-2 py-1 rounded-md bg-blue-50 text-blue-700">
              Last 7 Days
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={weeklyTrend}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <XAxis dataKey="label" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', borderColor: '#e2e8f0' }}
                />
                <Legend verticalAlign="top" align="right" height={30} />
                <Bar dataKey="present" name="Present" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="absent" name="Absent" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Dynamic data computed from database records</span>
            <Link to="/reports" className="font-semibold text-blue-600 hover:underline flex items-center gap-1">
              View full reports <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Attendance Records & Department Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Attendance Table */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-800">Recent Attendance Records</h3>
              <p className="text-xs text-slate-500">Latest attendance submissions logged in system</p>
            </div>
            <Link
              to="/reports"
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              See all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[11px] font-semibold border-y border-slate-200">
                <tr>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Enrollment No</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentRecords.length > 0 ? (
                  recentRecords.map((item) => (
                    <tr key={item._id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3 px-4 font-medium text-slate-900">
                        {item.studentId?.name || 'Unknown Student'}
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-mono text-xs">
                        {item.studentId?.enrollmentNo || '—'}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {item.studentId?.department || '—'}
                      </td>
                      <td className="py-3 px-4 text-slate-600 text-xs">{item.date}</td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            item.status === 'Present'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-6 text-slate-400 text-sm">
                      No attendance records found. Start by marking attendance!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Department Distribution */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800 mb-1">Department Breakdown</h3>
            <p className="text-xs text-slate-500 mb-4">Total students enrolled per department</p>

            <div className="space-y-3">
              {departmentStats.length > 0 ? (
                departmentStats.map((dept) => {
                  const percent = totalStudents > 0 ? Math.round((dept.count / totalStudents) * 100) : 0;
                  return (
                    <div key={dept._id} className="space-y-1">
                      <div className="flex justify-between text-xs font-medium text-slate-700">
                        <span>{dept._id || 'Unassigned'}</span>
                        <span className="text-slate-500">
                          {dept.count} students ({percent}%)
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-slate-400 py-4 text-center">No students added yet.</p>
              )}
            </div>
          </div>

          <div className="pt-4 mt-6 border-t border-slate-100">
            <Link
              to="/students"
              className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center justify-between"
            >
              <span>Manage Student Directory</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

