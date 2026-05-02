import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { userAPI } from '../../services/api';

const AppliedJobs = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchAppliedJobs();
  }, []);

  const fetchAppliedJobs = async () => {
    try {
      const response = await userAPI.getAppliedJobs();
      setApplications(response.data.data.applications);
    } catch (err) {
      console.error('Failed to fetch applied jobs:', err);
    }
    setLoading(false);
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      applied: { class: 'badge-info', label: 'Applied' },
      reviewing: { class: 'badge-warning', label: 'Reviewing' },
      shortlisted: { class: 'badge-success', label: 'Shortlisted' },
      interview_scheduled: { class: 'badge-success', label: 'Interview Scheduled' },
      rejected: { class: 'badge-error', label: 'Rejected' },
      selected: { class: 'badge-success', label: 'Selected' },
      withdrawn: { class: 'badge-error', label: 'Withdrawn' }
    };
    const config = statusConfig[status] || statusConfig.applied;
    return <span className={`badge ${config.class}`}>{config.label}</span>;
  };

  const filteredApplications = applications.filter(app => {
    if (filter === 'all') return true;
    return app.status === filter;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Applied Jobs</h1>
        <p className="text-gray-600">Track your job applications</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {['all', 'applied', 'reviewing', 'shortlisted', 'interview_scheduled', 'rejected', 'selected'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === status
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            {status === 'all' ? 'All' : status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </button>
        ))}
      </div>

      {filteredApplications.length > 0 ? (
        <div className="space-y-4">
          {filteredApplications.map((application) => (
            <div
              key={application._id}
              className="bg-white rounded-xl shadow-sm p-4 sm:p-6"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {application.job?.title}
                    </h3>
                    {getStatusBadge(application.status)}
                  </div>
                  <p className="text-gray-600 mb-2">{application.job?.company}</p>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <span>Applied: {new Date(application.appliedAt).toLocaleDateString()}</span>
                    {application.job?.location && <span>• {application.job.location}</span>}
                  </div>
                </div>

                <div className="mt-4 md:mt-0">
                  <Link
                    to={`/jobs/${application.job?._id}`}
                    className="btn-outline"
                  >
                    View Job
                  </Link>
                </div>
              </div>

              {/* Timeline */}
              {application.statusHistory?.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm text-gray-500 mb-2">Application Timeline</p>
                  <div className="flex flex-wrap gap-2">
                    {application.statusHistory.map((history, index) => (
                      <div key={index} className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {history.status.replace('_', ' ')}: {new Date(history.date).toLocaleDateString()}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-6 sm:p-12 text-center">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No applications yet</h3>
          <p className="text-gray-500 mb-4">Start applying for jobs to track your progress</p>
          <Link to="/jobs" className="btn-primary">Browse Jobs</Link>
        </div>
      )}
    </div>
  );
};

export default AppliedJobs;
