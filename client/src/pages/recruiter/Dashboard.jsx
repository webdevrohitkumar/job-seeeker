import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { recruiterAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const statusLabel = {
  applied: 'Applied',
  reviewing: 'Reviewing',
  shortlisted: 'Shortlisted',
  interview_scheduled: 'Interview',
  rejected: 'Rejected',
  selected: 'Selected'
};

const statusBadge = {
  applied: 'badge-info',
  reviewing: 'badge-warning',
  shortlisted: 'badge-success',
  interview_scheduled: 'badge-success',
  rejected: 'badge-error',
  selected: 'badge-success'
};

const MetricCard = ({ title, value, detail, tone, children }) => (
  <div className="bg-white rounded-xl shadow-sm p-4 sm:p-5">
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
  </div>
);

const RecruiterDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({});
  const [recentJobs, setRecentJobs] = useState([]);
  const [recentApplicants, setRecentApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setError('');
      const response = await recruiterAPI.getDashboardStats();
      const data = response.data.data || response.data;

      setStats(data.stats || {});
      setRecentJobs(data.recentJobs || []);
      setRecentApplicants(data.recentApplicants || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load recruiter dashboard');
    } finally {
      setLoading(false);
    }
  };

  const pipeline = useMemo(() => {
    const counts = recentApplicants.reduce((acc, application) => {
      acc[application.status] = (acc[application.status] || 0) + 1;
      return acc;
    }, {});

    return ['applied', 'reviewing', 'shortlisted', 'interview_scheduled', 'selected'].map((status) => ({
      status,
      label: statusLabel[status],
      count: counts[status] || 0
    }));
  }, [recentApplicants]);

  const totalJobs = stats.totalJobs || 0;
  const activeJobs = stats.activeJobs || 0;
  const totalApplicants = stats.totalApplicants || stats.totalApplications || 0;
  const pendingReview = stats.pendingReview || 0;
  const activeRate = totalJobs ? Math.round((activeJobs / totalJobs) * 100) : 0;

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
            <p className="text-sm font-medium text-primary-600">Recruiter Workspace</p>
            <h1 className="text-2xl font-bold text-gray-900 mt-1">
              Welcome back, {user?.name || 'Recruiter'}
            </h1>
            <p className="text-gray-600 mt-2">
              Track open roles, review applicants, and keep your hiring pipeline moving.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/recruiter/post-job" className="btn-primary inline-flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Post Job
            </Link>
            <Link to="/recruiter/manage-jobs" className="btn-outline inline-flex items-center">
              Manage Jobs
            </Link>
          </div>
        </div>
      </section>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <MetricCard title="Total Jobs" value={totalJobs} detail={`${activeRate}% active`} tone="bg-blue-100 text-blue-700">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </MetricCard>
        <MetricCard title="Active Jobs" value={activeJobs} detail="Visible to candidates" tone="bg-green-100 text-green-700">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </MetricCard>
        <MetricCard title="Applicants" value={totalApplicants} detail="Across all roles" tone="bg-indigo-100 text-indigo-700">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </MetricCard>
        <MetricCard title="Pending Review" value={pendingReview} detail="Needs action" tone="bg-amber-100 text-amber-700">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </MetricCard>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 xl:col-span-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Recent Job Postings</h2>
              <p className="text-sm text-gray-500">Your latest roles and applicant counts</p>
            </div>
            <Link to="/recruiter/manage-jobs" className="text-sm text-primary-600 hover:text-primary-700">
              View all
            </Link>
          </div>

          {recentJobs.length ? (
            <div className="divide-y divide-gray-100">
              {recentJobs.slice(0, 5).map((job) => (
                <div key={job._id} className="py-4 first:pt-0 last:pb-0 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <Link to={`/recruiter/jobs/${job._id}/applicants`} className="font-semibold text-gray-900 hover:text-primary-600">
                      {job.title}
                    </Link>
                    <p className="text-sm text-gray-500 mt-1">
                      {job.company} · {job.location || 'Location not set'} · {job.jobType || 'Role type not set'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600">{job.applicationCount || job.applicationsCount || job.applications || 0} applicants</span>
                    <span className={`badge ${job.status === 'active' ? 'badge-success' : job.status === 'draft' ? 'badge-warning' : 'badge-error'}`}>
                      {job.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-gray-50 rounded-lg">
              <p className="font-medium text-gray-900">No job postings yet</p>
              <p className="text-sm text-gray-500 mt-1">Create your first job to start receiving applicants.</p>
              <Link to="/recruiter/post-job" className="btn-primary inline-flex mt-4">Post a Job</Link>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Pipeline Snapshot</h2>
          <p className="text-sm text-gray-500 mb-5">Based on latest applicant activity</p>
          <div className="space-y-4">
            {pipeline.map((item) => (
              <div key={item.status}>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600">{item.label}</span>
                  <span className="font-semibold text-gray-900">{item.count}</span>
                </div>
                <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full bg-primary-600"
                    style={{ width: `${recentApplicants.length ? (item.count / recentApplicants.length) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Recent Applicants</h2>
            <p className="text-sm text-gray-500">Candidates who need your attention</p>
          </div>
        </div>

        {recentApplicants.length ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {recentApplicants.slice(0, 6).map((application) => (
              <Link
                key={application._id}
                to={`/recruiter/jobs/${application.job?._id}/applicants`}
                className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-semibold shrink-0">
                      {application.user?.name?.charAt(0) || 'U'}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{application.user?.name || 'Unknown Applicant'}</p>
                      <p className="text-sm text-gray-500 truncate">{application.job?.title || 'Job deleted'}</p>
                    </div>
                  </div>
                  <span className={`badge ${statusBadge[application.status] || 'badge-info'} shrink-0`}>
                    {statusLabel[application.status] || application.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="font-medium text-gray-900">No applicants yet</p>
            <p className="text-sm text-gray-500 mt-1">Applicants will appear here as candidates apply.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default RecruiterDashboard;
