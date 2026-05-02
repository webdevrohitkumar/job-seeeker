import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { jobAPI, applicationAPI } from '../../services/api';

const JobApplicants = () => {
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewNotes, setInterviewNotes] = useState('');

  useEffect(() => {
    fetchData();
  }, [jobId]);

  const fetchData = async () => {
    try {
      const [jobResponse, applicantsResponse] = await Promise.all([
        jobAPI.getJob(jobId),
        jobAPI.getJobApplicants(jobId)
      ]);
      setJob(jobResponse.data.data.job);
      setApplicants(applicantsResponse.data.data.applicants);
    } catch (err) {
      console.error('Failed to fetch data:', err);
    }
    setLoading(false);
  };

  const handleStatusChange = async (applicantId, newStatus) => {
    try {
      await applicationAPI.updateApplicationStatus(applicantId, { status: newStatus });
      setApplicants(applicants.map(a => 
        a._id === applicantId ? { ...a, status: newStatus } : a
      ));
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleScheduleInterview = async (e) => {
    e.preventDefault();
    if (!selectedApplicant || !interviewDate) return;

    try {
      await applicationAPI.updateApplicationStatus(selectedApplicant._id, {
        status: 'interview_scheduled',
        interviewDate,
        interviewNotes
      });
      
      setApplicants(applicants.map(a => 
        a._id === selectedApplicant._id ? { ...a, status: 'interview_scheduled' } : a
      ));
      
      setShowModal(false);
      setInterviewDate('');
      setInterviewNotes('');
      setSelectedApplicant(null);
    } catch (err) {
      console.error('Failed to schedule interview:', err);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      applied: { class: 'badge-info', label: 'Applied' },
      reviewing: { class: 'badge-warning', label: 'Reviewing' },
      shortlisted: { class: 'badge-success', label: 'Shortlisted' },
      interview_scheduled: { class: 'badge-success', label: 'Interview Scheduled' },
      rejected: { class: 'badge-error', label: 'Rejected' },
      selected: { class: 'badge-success', label: 'Selected' }
    };
    const config = statusConfig[status] || statusConfig.applied;
    return <span className={`badge ${config.class}`}>{config.label}</span>;
  };

  const filteredApplicants = applicants.filter(app => {
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <Link to="/recruiter/manage-jobs" className="text-sm text-gray-500 hover:text-gray-700 mb-2 inline-flex items-center">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Jobs
            </Link>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{job?.title}</h1>
            <p className="text-gray-600">{job?.company} • {applicants.length} applicants</p>
          </div>
        </div>
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
            <span className="ml-2 text-xs">
              ({applicants.filter(a => status === 'all' || a.status === status).length})
            </span>
          </button>
        ))}
      </div>

      {filteredApplicants.length > 0 ? (
        <div className="space-y-4">
          {filteredApplicants.map((applicant) => (
            <div key={applicant._id} className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                      <span className="text-primary-600 font-semibold text-lg">
                        {applicant.user?.name?.charAt(0) || 'U'}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {applicant.user?.name || 'Unknown Applicant'}
                      </h3>
                      {getStatusBadge(applicant.status)}
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-3">
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {applicant.user?.email || 'No email'}
                    </span>
                    <span>Applied: {new Date(applicant.appliedAt).toLocaleDateString()}</span>
                  </div>

                  {applicant.coverLetter && (
                    <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                      {applicant.coverLetter}
                    </p>
                  )}

                  {applicant.user?.resume && (
                    <a
                      href={`/uploads/${applicant.user.resume}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary-600 hover:text-primary-700 flex items-center"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      View Resume
                    </a>
                  )}
                </div>

                <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
                  {applicant.status === 'applied' && (
                    <>
                      <button
                        onClick={() => handleStatusChange(applicant._id, 'reviewing')}
                        className="text-sm px-3 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200"
                      >
                        Start Review
                      </button>
                      <button
                        onClick={() => handleStatusChange(applicant._id, 'rejected')}
                        className="text-sm px-3 py-2 border border-red-300 rounded-lg text-red-600 hover:bg-red-50"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  
                  {applicant.status === 'reviewing' && (
                    <>
                      <button
                        onClick={() => {
                          setSelectedApplicant(applicant);
                          setShowModal(true);
                        }}
                        className="text-sm px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                      >
                        Schedule Interview
                      </button>
                      <button
                        onClick={() => handleStatusChange(applicant._id, 'shortlisted')}
                        className="text-sm px-3 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                      >
                        Shortlist
                      </button>
                      <button
                        onClick={() => handleStatusChange(applicant._id, 'rejected')}
                        className="text-sm px-3 py-2 border border-red-300 rounded-lg text-red-600 hover:bg-red-50"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  
                  {applicant.status === 'shortlisted' && (
                    <>
                      <button
                        onClick={() => {
                          setSelectedApplicant(applicant);
                          setShowModal(true);
                        }}
                        className="text-sm px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                      >
                        Schedule Interview
                      </button>
                      <button
                        onClick={() => handleStatusChange(applicant._id, 'selected')}
                        className="text-sm px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200"
                      >
                        Select
                      </button>
                    </>
                  )}
                  
                  {applicant.status === 'interview_scheduled' && (
                    <>
                      <button
                        onClick={() => handleStatusChange(applicant._id, 'selected')}
                        className="text-sm px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                      >
                        Select
                      </button>
                      <button
                        onClick={() => handleStatusChange(applicant._id, 'rejected')}
                        className="text-sm px-3 py-2 border border-red-300 rounded-lg text-red-600 hover:bg-red-50"
                      >
                        Reject
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-6 sm:p-12 text-center">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No applicants found</h3>
          <p className="text-gray-500">No applicants match the current filter</p>
        </div>
      )}

      {/* Interview Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-5 sm:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Schedule Interview
            </h2>
            <form onSubmit={handleScheduleInterview}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Interview Date & Time *
                </label>
                <input
                  type="datetime-local"
                  value={interviewDate}
                  onChange={(e) => setInterviewDate(e.target.value)}
                  required
                  className="input-field w-full"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={interviewNotes}
                  onChange={(e) => setInterviewNotes(e.target.value)}
                  rows={3}
                  className="input-field w-full"
                  placeholder="Add any notes for the candidate..."
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setSelectedApplicant(null);
                  }}
                  className="btn-outline"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobApplicants;
