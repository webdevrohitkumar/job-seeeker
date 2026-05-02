import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { aiAPI } from '../../services/api';

const JobRecommendations = () => {
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const response = await aiAPI.getResumeReport();
      setRecommendations(response.data.data.report);
      setError('');
    } catch (err) {
      console.error('Failed to fetch recommendations:', err);
      setError('Please upload your resume to get AI-powered recommendations.');
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-6 border border-slate-200">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">AI Career Recommendations</h1>
        <p className="text-gray-600">Personalized growth path based on your resume and skills</p>
      </div>

      {error ? (
        <div className="bg-white rounded-xl shadow-sm p-8 sm:p-12 text-center border border-slate-200">
          <div className="w-16 h-16 rounded-2xl bg-cyan-100 text-cyan-600 mx-auto mb-5 flex items-center justify-center">
            <svg className="w-9 h-9" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Resume Required</h3>
          <p className="text-gray-500 max-w-xl mx-auto mb-6">
            {error}
          </p>
          <Link to="/dashboard/resume" className="bg-cyan-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-cyan-600 transition-colors">
            Upload Resume
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Recommended Roles */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <svg className="w-6 h-6 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              Target Roles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommendations?.atsAnalysis?.keywordsFound?.slice(0, 4).map((role, idx) => (
                <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-cyan-300 transition-all">
                  <p className="font-bold text-slate-900">{recommendations.predictedRole || 'Specialist'}</p>
                  <p className="text-sm text-slate-500">Based on: {role}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Skill Gap Analysis */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <svg className="w-6 h-6 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Recommended Skills to Learn
            </h2>
            <div className="flex flex-wrap gap-3">
              {recommendations?.atsAnalysis?.keywordsMissing?.length > 0 ? (
                recommendations.atsAnalysis.keywordsMissing.map((skill, idx) => (
                  <span key={idx} className="px-4 py-2 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-sm font-semibold">
                    {skill}
                  </span>
                ))
              ) : (
                <p className="text-slate-500">No major skill gaps identified! Keep it up.</p>
              )}
            </div>
          </div>

          {/* Suggested Learning Path */}
          <div className="bg-slate-900 rounded-xl shadow-lg p-6 text-white border border-slate-800">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Next Career Moves
            </h2>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-cyan-500 flex-shrink-0 flex items-center justify-center font-bold text-slate-900">1</div>
                <div>
                  <p className="font-bold">Optimize Resume</p>
                  <p className="text-slate-400 text-sm">Focus on adding keywords like {recommendations?.atsAnalysis?.keywordsMissing?.[0] || 'more specific tech skills'}.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-cyan-500 flex-shrink-0 flex items-center justify-center font-bold text-slate-900">2</div>
                <div>
                  <p className="font-bold">Build Project Portfolio</p>
                  <p className="text-slate-400 text-sm">Create a GitHub repository showcasing your skills in {recommendations?.parsedData?.skills?.[0] || 'development'}.</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 rounded-full bg-cyan-500 flex-shrink-0 flex items-center justify-center font-bold text-slate-900">3</div>
                <div>
                  <p className="font-bold">Negotiate Better</p>
                  <p className="text-slate-400 text-sm">You are eligible for roles with average packages around {formatINR(800000)} based on your current profile.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobRecommendations;
