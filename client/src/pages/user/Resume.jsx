import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { aiAPI, userAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import { formatINR } from '../../utils/currency';

const UserResume = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [resumeReport, setResumeReport] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [rolePrediction, setRolePrediction] = useState(null);
  const [salaryPrediction, setSalaryPrediction] = useState(null);
  const [loadingPredictions, setLoadingPredictions] = useState(false);
  const [currentResume, setCurrentResume] = useState(user?.resume || null);
  const [targetCompany, setTargetCompany] = useState('');

  useEffect(() => {
    setCurrentResume(user?.resume || null);
  }, [user?.resume?.url, user?.resume?.filename]);

  useEffect(() => {
    if (currentResume?.url) {
      fetchResumeReport();
    } else {
      setResumeReport(null);
      setRolePrediction(null);
      setSalaryPrediction(null);
    }
  }, [currentResume?.url]);

  const hasUploadedResume = Boolean(currentResume?.url);
  const hasResumeAnalysis = hasUploadedResume
    && resumeReport?.parsedData
    && Number.isFinite(Number(resumeReport?.atsScore));

  const fetchPredictions = async (skills, companyName = '') => {
    if (!skills || skills.length === 0) return;
    
    setLoadingPredictions(true);
    try {
      const [roleRes, salaryRes] = await Promise.all([
        aiAPI.getRolePrediction({ skills }),
        aiAPI.getSalaryPrediction({ skills, companyName })
      ]);
      
      if (roleRes.data.data) {
        setRolePrediction(roleRes.data.data);
      }
      if (salaryRes.data.data) {
        setSalaryPrediction(salaryRes.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch predictions:', err);
    }
    setLoadingPredictions(false);
  };

  const fetchResumeReport = async () => {
    if (!currentResume?.url) return;

    try {
      const response = await aiAPI.getResumeReport();
      const report = response.data.data.report;

      if (!report?.parsedData || !Number.isFinite(Number(report?.atsScore))) {
        setResumeReport(null);
        return;
      }

      setResumeReport(report);
      
      // Fetch predictions if skills are available
      if (report?.parsedData?.skills) {
        fetchPredictions(report.parsedData.skills);
      }
    } catch (err) {
      console.error('No resume report found');
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please upload a PDF or DOC file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    setUploading(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('resume', file);

      const response = await aiAPI.parseResume(formData);
      updateUser(response.data.data.user);
      setCurrentResume(response.data.data.user?.resume || null);
      setResumeReport(response.data.data.report);
      
      // Fetch predictions after resume upload
      if (response.data.data.report?.parsedData?.skills) {
        fetchPredictions(response.data.data.report.parsedData.skills);
      }
      
      setSuccess('Resume uploaded successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload resume');
    }

    setUploading(false);
  };

  const handleDeleteResume = async () => {
    if (!confirm('Are you sure you want to delete your resume?')) return;

    setLoading(true);
    try {
      await userAPI.deleteResume();
      setCurrentResume(null);
      setResumeReport(null);
      setRolePrediction(null);
      setSalaryPrediction(null);
      setSuccess('Resume deleted successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete resume');
    }
    setLoading(false);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="animate-fadeIn">
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-6 border border-slate-200">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Resume AI Analysis</h1>
        <p className="text-gray-600">Upload your resume for deep AI-powered career insights</p>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm">
          {success}
        </div>
      )}

      {/* Upload Section */}
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-6 border border-slate-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Resume</h2>
        
        {hasUploadedResume ? (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mr-3">
                <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 2l5 5h-5V4zM8.5 13a.5.5 0 01.5-.5h6a.5.5 0 010 1H9a.5.5 0 01-.5-.5zm0 3a.5.5 0 01.5-.5h4a.5.5 0 010 1H9a.5.5 0 01-.5-.5z"/>
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-900">Current Resume</p>
                <p className="text-sm text-gray-500">{currentResume.filename}</p>
              </div>
            </div>
            <button
              onClick={handleDeleteResume}
              disabled={loading}
              className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
            >
              Delete
            </button>
          </div>
        ) : (
          <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 sm:p-12 text-center bg-slate-50/50 hover:bg-slate-50 transition-colors">
            <svg className="w-16 h-16 text-slate-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-lg font-medium text-slate-900 mb-2">Upload your resume (PDF or DOC)</p>
            <p className="text-sm text-slate-500 mb-6">Our AI will parse and analyze it for your career growth</p>
            <label className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-3 rounded-lg font-semibold cursor-pointer inline-block transition-shadow shadow-lg shadow-cyan-500/20">
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                className="hidden"
                disabled={uploading}
              />
              {uploading ? 'Processing...' : 'Choose File'}
            </label>
          </div>
        )}
      </div>

      {/* ATS Score Section */}
      {hasResumeAnalysis && (
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-6 border border-slate-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">ATS Optimization Score</h2>
          
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative w-32 h-32 flex-shrink-0">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle
                  cx="64"
                  cy="64"
                  r="58"
                  stroke="#f1f5f9"
                  strokeWidth="10"
                  fill="none"
                />
                <circle
                  cx="64"
                  cy="64"
                  r="58"
                  stroke={resumeReport.atsScore >= 80 ? '#10b981' : resumeReport.atsScore >= 60 ? '#f59e0b' : '#ef4444'}
                  strokeWidth="10"
                  fill="none"
                  strokeDasharray={`${(resumeReport.atsScore / 100) * 364.4} 364.4`}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={`text-3xl font-bold ${getScoreColor(resumeReport.atsScore)}`}>
                  {resumeReport.atsScore}%
                </span>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                {resumeReport.atsScore >= 80 ? 'Excellent Match!' :
                 resumeReport.atsScore >= 60 ? 'Good Potential' :
                 'Needs Optimization'}
              </h3>
              <p className="text-slate-600">
                {resumeReport.atsScore >= 80 ? 'Your resume is highly optimized for applicant tracking systems.' :
                 resumeReport.atsScore >= 60 ? 'Your resume has good content but could benefit from better keyword optimization.' :
                 'Your resume might be filtered out by some automated systems. Use the suggestions below to improve.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Salary Prediction Section */}
      {hasResumeAnalysis && salaryPrediction && (
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-6 border border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Salary Predictor (Company Level)</h2>
              <p className="text-sm text-gray-500">Predict your expected salary for specific companies</p>
            </div>
            
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Enter Company Name (e.g. Google, TCS)"
                className="px-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 min-w-[200px]"
                value={targetCompany}
                onChange={(e) => setTargetCompany(e.target.value)}
              />
              <button
                onClick={() => fetchPredictions(resumeReport.parsedData.skills, targetCompany)}
                disabled={loadingPredictions}
                className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
              >
                {loadingPredictions ? 'Predicting...' : 'Predict'}
              </button>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl shadow-slate-200">
            <div className="relative z-10">
              <div className="flex justify-center mb-6">
                <span className="px-4 py-1 bg-cyan-500/20 text-cyan-300 rounded-full text-xs font-bold uppercase tracking-widest border border-cyan-500/30">
                  {salaryPrediction.company || 'Market Standard'}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <p className="text-slate-400 text-sm mb-2 font-medium uppercase tracking-wider">Starting Range</p>
                  <p className="text-3xl font-bold text-white">{formatINR(salaryPrediction.min)}</p>
                </div>
                <div className="text-center py-4 md:py-0 md:border-x border-slate-700">
                  <p className="text-cyan-400 text-sm mb-2 font-bold uppercase tracking-wider">Average Predicted</p>
                  <p className="text-4xl font-extrabold text-white">
                    {formatINR(Math.round((salaryPrediction.min + salaryPrediction.max) / 2))}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-slate-400 text-sm mb-2 font-medium uppercase tracking-wider">Potential High</p>
                  <p className="text-3xl font-bold text-white">{formatINR(salaryPrediction.max)}</p>
                </div>
              </div>
              
              <div className="mt-8 pt-6 border-t border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-cyan-500/10 flex items-center justify-center border border-cyan-500/20">
                    <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 font-medium uppercase">Role Context</p>
                    <p className="text-sm font-semibold text-white">{salaryPrediction.role || 'Professional'}</p>
                  </div>
                </div>
                
                <p className="text-xs text-slate-400 italic">
                  *Estimates based on current market trends and tier-level data.
                </p>
              </div>
            </div>
            
            {/* Background design elements */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
          </div>
        </div>
      )}

      {/* AI Recommendations Section */}
      {hasResumeAnalysis && rolePrediction && (
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-6 border border-slate-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">AI Recommended Career Paths</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {rolePrediction.roles && rolePrediction.roles.length > 0 ? (
              rolePrediction.roles.slice(0, 4).map((role, index) => (
                <div key={index} className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200 hover:border-cyan-300 transition-colors group">
                  <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center border border-slate-200 group-hover:bg-cyan-500 transition-colors">
                    <svg className="w-6 h-6 text-cyan-600 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{role}</p>
                    <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">High Compatibility</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-600 text-sm">Upload your resume to see recommended paths.</p>
            )}
          </div>
        </div>
      )}

      {/* Improvement Suggestions Section */}
      {hasResumeAnalysis && resumeReport?.suggestions?.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-6 border border-slate-200">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Optimization Suggestions</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {resumeReport.suggestions.map((suggestion, index) => (
              <div key={index} className="flex items-start p-3 bg-amber-50/50 rounded-lg border border-amber-100">
                <svg className="w-5 h-5 text-amber-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="text-sm text-slate-700">{suggestion}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Chatbot Section */}
      <div className="bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl shadow-lg p-6 sm:p-8 text-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">Need Personalized Career Advice?</h2>
            <p className="text-cyan-100 max-w-lg">Our AI Chatbot is ready to help you with resume tips, interview prep, and skill development strategies.</p>
          </div>
          <button
            onClick={() => navigate('/dashboard/chatbot')}
            className="bg-white text-slate-900 px-8 py-3 rounded-xl font-bold hover:bg-cyan-50 transition-colors shadow-lg shadow-black/10 flex items-center gap-2 self-start md:self-auto"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Ask AI Assistant
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserResume;
