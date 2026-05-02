import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { jobAPI, applicationAPI, userAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { formatSalaryRange } from '../utils/currency';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, isJobSeeker } = useAuth();
  
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchJob();
  }, [id]);

  const fetchJob = async () => {
    setLoading(true);
    try {
      const response = await jobAPI.getJob(id);
      setJob(response.data.data.job);
      
      if (isAuthenticated && isJobSeeker) {
        // Check if already applied
        const appliedJobs = await userAPI.getAppliedJobs();
        const applied = appliedJobs.data.data.jobs.some(j => j._id === id);
        setHasApplied(applied);
        
        // Check if saved
        const savedJobs = await userAPI.getSavedJobs();
        const saved = savedJobs.data.data.jobs.some(j => j._id === id);
        setIsSaved(saved);
      }
    } catch (err) {
      console.error('Failed to fetch job:', err);
    }
    setLoading(false);
  };

  const handleApply = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (!isJobSeeker) {
      setError('Only job seekers can apply for jobs');
      return;
    }

    setShowApplyModal(true);
  };

  const submitApplication = async () => {
    setApplying(true);
    setError('');

    try {
      await applicationAPI.applyForJob(id, { coverLetter });
      setHasApplied(true);
      setShowApplyModal(false);
      alert('Application submitted successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit application');
    }

    setApplying(false);
  };

  const handleSaveJob = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    try {
      if (isSaved) {
        await userAPI.unsaveJob(id);
      } else {
        await userAPI.saveJob(id);
      }
      setIsSaved(!isSaved);
    } catch (err) {
      console.error('Failed to save job:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Job not found</h2>
        <Link to="/jobs" className="btn-primary">Browse Jobs</Link>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link to="/jobs" className="inline-flex items-center text-gray-600 hover:text-primary-600 mb-6">
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Jobs
        </Link>

        {/* Job Header */}
        <div className="bg-white rounded-xl shadow-sm p-5 sm:p-8 mb-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{job.title}</h1>
              <p className="text-xl text-gray-600 mb-4">{job.company}</p>
              
              <div className="flex flex-wrap gap-4 text-gray-500 mb-6">
                <span className="flex items-center">
                  <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {job.location}
                </span>
                <span className="flex items-center">
                  <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {job.jobType}
                </span>
                <span className="flex items-center">
                  <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {formatSalaryRange(job.salary)}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                {job.isRemote && <span className="badge badge-info">Remote</span>}
                {job.experienceLevel && (
                  <span className="badge badge-success">{job.experienceLevel}</span>
                )}
              </div>
            </div>

            <div className="mt-4 md:mt-0 flex flex-col gap-2">
              {isJobSeeker && (
                <>
                  <button
                    onClick={handleApply}
                    disabled={hasApplied}
                    className={`btn-primary py-3 ${hasApplied ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {hasApplied ? 'Applied' : 'Apply Now'}
                  </button>
                  <button
                    onClick={handleSaveJob}
                    className={`btn-outline py-2 ${isSaved ? 'bg-primary-50 border-primary-500 text-primary-600' : ''}`}
                  >
                    {isSaved ? 'Saved' : 'Save Job'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Job Details */}
        <div className="bg-white rounded-xl shadow-sm p-5 sm:p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Job Description</h2>
          <div className="prose max-w-none text-gray-600 whitespace-pre-line">
            {job.description}
          </div>

          {/* Requirements */}
          {job.requirements && job.requirements.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Requirements</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                {job.requirements.map((req, index) => (
                  <li key={index}>{req}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Skills */}
          {job.skills && job.skills.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Required Skills</h2>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Benefits */}
          {job.benefits && job.benefits.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Benefits</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-600">
                {job.benefits.map((benefit, index) => (
                  <li key={index}>{benefit}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Posted Info */}
          <div className="mt-8 pt-6 border-t text-sm text-gray-500">
            <p>Posted: {new Date(job.createdAt).toLocaleDateString()}</p>
            <p>Applications: {job.applicationsCount || 0}</p>
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-5 sm:p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold mb-4">Apply for {job.title}</h3>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cover Letter (Optional)
              </label>
              <textarea
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                rows={6}
                className="input-field"
                placeholder="Tell the employer why you're a great fit..."
              ></textarea>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowApplyModal(false)}
                className="flex-1 btn-outline"
              >
                Cancel
              </button>
              <button
                onClick={submitApplication}
                disabled={applying}
                className="flex-1 btn-primary disabled:opacity-50"
              >
                {applying ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDetails;
