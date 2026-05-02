import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { aiAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { formatINR } from '../../utils/currency';

const UserDashboard = () => {
  const { user } = useAuth();
  const [report, setReport] = useState(null);
  const [salary, setSalary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await aiAPI.getResumeReport();
      const reportData = response.data.data.report;
      setReport(reportData);
      
      if (reportData?.parsedData?.skills) {
        const salaryRes = await aiAPI.getSalaryPrediction({ 
          skills: reportData.parsedData.skills 
        });
        setSalary(salaryRes.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
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
      {/* Welcome Header */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-slate-200">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.name}
        </h1>
        <p className="text-gray-600">
          Your AI career insights and resume analysis results at a glance.
        </p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* ATS Score Card */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200 flex flex-col items-center text-center">
          <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">ATS Optimization</p>
          <div className="relative w-32 h-32 mb-4">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle cx="64" cy="64" r="58" stroke="#f1f5f9" strokeWidth="8" fill="none" />
              <circle
                cx="64"
                cy="64"
                r="58"
                stroke={report?.atsScore >= 80 ? '#10b981' : '#f59e0b'}
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${(report?.atsScore || 0) * 3.64} 364`}
                strokeLinecap="round"
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl font-black text-slate-900">{report?.atsScore || 0}%</span>
            </div>
          </div>
          <Link to="/dashboard/resume" className="text-cyan-600 font-bold hover:underline text-sm">Improve Score →</Link>
        </div>

        {/* Salary Prediction Card */}
        <div className="bg-slate-900 rounded-2xl shadow-lg p-6 text-white lg:col-span-2 relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-6">Market Valuation</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-center">
              <div>
                <p className="text-slate-400 text-sm mb-1">Expected Avg. Package</p>
                <p className="text-4xl font-black text-white mb-2">
                  {salary ? formatINR(Math.round((salary.min + salary.max) / 2)) : '₹ --'}
                </p>
                <p className="text-xs text-slate-500">Based on {report?.parsedData?.skills?.length || 0} extracted skills</p>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Target Role</span>
                  <span className="font-bold">{report?.predictedRole || 'Analyzing...'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Market Confidence</span>
                  <span className="text-green-400 font-bold">High</span>
                </div>
                <Link to="/dashboard/resume" className="block w-full bg-cyan-500 text-slate-950 text-center py-2 rounded-lg font-bold text-sm hover:bg-cyan-400 transition-colors">
                  Predict for specific company
                </Link>
              </div>
            </div>
          </div>
          <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Quick Insights */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Skill Insights</h2>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-slate-500 mb-2">Top Strengths</p>
              <div className="flex flex-wrap gap-2">
                {report?.parsedData?.skills?.slice(0, 5).map((s, i) => (
                  <span key={i} className="px-3 py-1 bg-cyan-50 text-cyan-700 rounded-lg text-xs font-bold border border-cyan-100">{s}</span>
                )) || <p className="text-xs italic text-slate-400">No skills identified yet.</p>}
              </div>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-2">Critical Gaps</p>
              <div className="flex flex-wrap gap-2">
                {report?.atsAnalysis?.keywordsMissing?.slice(0, 3).map((s, i) => (
                  <span key={i} className="px-3 py-1 bg-amber-50 text-amber-700 rounded-lg text-xs font-bold border border-amber-100">{s}</span>
                )) || <p className="text-xs italic text-slate-400">Upload resume for analysis.</p>}
              </div>
            </div>
          </div>
        </div>

        {/* AI Assistant Promo */}
        <div className="bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl shadow-sm p-6 text-white flex flex-col justify-between">
          <div>
            <h2 className="text-xl font-bold mb-2">Need career guidance?</h2>
            <p className="text-blue-50 text-sm opacity-90 leading-relaxed">
              Our AI chatbot can help you prepare for interviews, suggest courses, and improve your resume bullets.
            </p>
          </div>
          <Link to="/dashboard/chatbot" className="mt-6 flex items-center justify-center gap-2 bg-white text-blue-600 py-3 rounded-xl font-bold hover:bg-blue-50 transition-colors shadow-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Talk to AI Assistant
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
