import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { userAPI } from '../../services/api';

const SavedJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  const fetchSavedJobs = async () => {
    try {
      const response = await userAPI.getSavedJobs();
      setJobs(response.data.data.jobs);
    } catch (err) {
      console.error('Failed to fetch saved jobs:', err);
    }
    setLoading(false);
  };

  const handleUnsave = async (jobId, e) => {
    e.preventDefault();
    try {
      await userAPI.unsaveJob(jobId);
      setJobs(jobs.filter(j => j._id !== jobId));
    } catch (err) {
      console.error('Failed to unsave job:', err);
    }
  };

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
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Saved Jobs</h1>
        <p className="text-gray-600">Jobs you've bookmarked for later</p>
      </div>

      {jobs.length > 0 ? (
        <div className="space-y-4">
          {jobs.map((job) => (
            <Link
              key={job._id}
              to={`/jobs/${job._id}`}
              className="block bg-white rounded-xl shadow-sm p-4 sm:p-6 card-hover"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {job.title}
                  </h3>
                  <p className="text-gray-600 mb-2">{job.company}</p>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-3">
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      {job.location}
                    </span>
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {job.jobType}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {job.skills?.slice(0, 5).map((skill, index) => (
                      <span
                        key={index}
                        className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <button
                  onClick={(e) => handleUnsave(job._id, e)}
                  className="ml-4 p-2 text-gray-400 hover:text-red-500"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                </button>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm p-6 sm:p-12 text-center">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No saved jobs yet</h3>
          <p className="text-gray-500 mb-4">Start browsing and save jobs you're interested in</p>
          <Link to="/jobs" className="btn-primary">Browse Jobs</Link>
        </div>
      )}
    </div>
  );
};

export default SavedJobs;
