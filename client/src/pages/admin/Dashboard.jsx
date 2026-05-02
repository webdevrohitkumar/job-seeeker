import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { jobAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const MetricCard = ({ title, value, detail, to, tone, children }) => {
  const CardTag = to ? Link : 'div';

  return (
    <CardTag to={to} className="bg-white rounded-xl shadow-sm p-4 sm:p-5 card-hover block">
      <div className="flex items-start justify-between gap-3 sm:gap-4">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {detail && <p className="text-sm text-gray-500 mt-1">{detail}</p>}
        </div>
        <div className={`w-11 h-11 rounded-lg flex items-center justify-center ${tone}`}>
          {children}
        </div>
      </div>
    </CardTag>
  );
};

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({});
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentJobs, setRecentJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setError('');
      const response = await jobAPI.getDashboardStats();
      const data = response.data.data || response.data;

      setStats(data.stats || {});
      setRecentUsers(data.recentUsers || []);
      setRecentJobs(data.recentJobs || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load admin dashboard');
    } finally {
      setLoading(false);
    }
  };

  const platformHealth = useMemo(() => {
    const totalJobs = stats.totalJobs || 0;
    const activeJobs = stats.activeJobs || 0;
    const totalRecruiters = stats.totalRecruiters || 0;
    const pendingRecruiters = stats.pendingRecruiters || 0;

    return [
      {
        label: 'Active job ratio',
        value: totalJobs ? Math.round((activeJobs / totalJobs) * 100) : 0,
        color: 'bg-green-600'
      },
      {
        label: 'Recruiter approval rate',
        value: totalRecruiters ? Math.round(((totalRecruiters - pendingRecruiters) / totalRecruiters) * 100) : 100,
        color: 'bg-blue-600'
      },
      {
        label: 'Applications per job',
        value: totalJobs ? Math.min(100, Math.round(((stats.totalApplications || 0) / totalJobs) * 10)) : 0,
        color: 'bg-indigo-600',
        suffix: ''
      }
    ];
  }, [stats]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn space-y-6">
      <section className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-primary-600">Admin Console</p>
            <h1 className="text-2xl font-bold text-gray-900 mt-1">
              Welcome back, {user?.name || 'Admin'}
            </h1>
            <p className="text-gray-600 mt-2">
              Monitor users, recruiters, jobs, applications, and platform health from one place.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/admin/users" className="btn-primary inline-flex items-center">Manage Users</Link>
            <Link to="/admin/jobs" className="btn-outline inline-flex items-center">Manage Jobs</Link>
          </div>
        </div>
      </section>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-4">
        <div className="xl:col-span-2">
          <MetricCard title="Job Seekers" value={stats.totalUsers || 0} detail={`${stats.recentUsers || 0} new recently`} to="/admin/users" tone="bg-blue-100 text-blue-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1z" />
            </svg>
          </MetricCard>
        </div>
        <div className="xl:col-span-2">
          <MetricCard title="Recruiters" value={stats.totalRecruiters || 0} detail={`${stats.pendingRecruiters || 0} pending approval`} to="/admin/users" tone="bg-indigo-100 text-indigo-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
            </svg>
          </MetricCard>
        </div>
        <div className="xl:col-span-2">
          <MetricCard title="Applications" value={stats.totalApplications || 0} detail="All submitted applications" to="/admin/analytics" tone="bg-amber-100 text-amber-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414" />
            </svg>
          </MetricCard>
        </div>
        <div className="xl:col-span-3">
          <MetricCard title="Total Jobs" value={stats.totalJobs || 0} detail={`${stats.recentJobs || 0} posted recently`} to="/admin/jobs" tone="bg-green-100 text-green-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </MetricCard>
        </div>
        <div className="xl:col-span-3">
          <MetricCard title="Active Jobs" value={stats.activeJobs || 0} detail="Currently visible listings" to="/admin/jobs" tone="bg-teal-100 text-teal-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </MetricCard>
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Platform Health</h2>
          <p className="text-sm text-gray-500 mb-5">Operational ratios from live data</p>
          <div className="space-y-5">
            {platformHealth.map((item) => (
              <div key={item.label}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600">{item.label}</span>
                  <span className="font-semibold text-gray-900">{item.value}{item.suffix === '' ? '' : '%'}</span>
                </div>
                <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div className={`h-full ${item.color}`} style={{ width: `${Math.min(100, item.value)}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 xl:col-span-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Recent Jobs</h2>
              <p className="text-sm text-gray-500">Latest job posts across the platform</p>
            </div>
            <Link to="/admin/jobs" className="text-sm text-primary-600 hover:text-primary-700">View all</Link>
          </div>

          {recentJobs.length ? (
            <div className="divide-y divide-gray-100">
              {recentJobs.slice(0, 5).map((job) => (
                <div key={job._id} className="py-4 first:pt-0 last:pb-0 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <p className="font-semibold text-gray-900">{job.title}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {job.company} · {job.recruiter?.name || 'Unknown recruiter'}
                    </p>
                  </div>
                  <span className={`badge ${job.status === 'active' ? 'badge-success' : job.status === 'draft' ? 'badge-warning' : 'badge-error'}`}>
                    {job.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <p className="font-medium text-gray-900">No jobs yet</p>
              <p className="text-sm text-gray-500 mt-1">Recruiter job posts will appear here.</p>
            </div>
          )}
        </div>
      </section>

      <section className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Recent Users</h2>
            <p className="text-sm text-gray-500">Newest job seekers on the platform</p>
          </div>
          <Link to="/admin/users" className="text-sm text-primary-600 hover:text-primary-700">View all</Link>
        </div>

        {recentUsers.length ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {recentUsers.slice(0, 6).map((recentUser) => (
              <div key={recentUser._id} className="p-4 bg-gray-50 rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold shrink-0">
                    {recentUser.name?.charAt(0) || 'U'}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{recentUser.name}</p>
                    <p className="text-sm text-gray-500 truncate">{recentUser.email}</p>
                  </div>
                </div>
                <span className="badge badge-success shrink-0">user</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="font-medium text-gray-900">No recent users</p>
            <p className="text-sm text-gray-500 mt-1">New users will show up here.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default AdminDashboard;
