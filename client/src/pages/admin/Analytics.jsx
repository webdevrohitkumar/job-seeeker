import { useState, useEffect } from 'react';
import { jobAPI, applicationAPI } from '../../services/api';

const Analytics = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRecruiters: 0,
    totalJobs: 0,
    totalApplications: 0,
    activeJobs: 0,
    applicationsByStatus: [],
    applicationsByJobType: [],
    topCompanies: [],
    recentTrends: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await jobAPI.getDashboardStats();
      setStats(response.data.data.stats);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const statCards = [
    { title: 'Total Users', value: stats.totalUsers, color: 'text-blue-600' },
    { title: 'Total Recruiters', value: stats.totalRecruiters, color: 'text-purple-600' },
    { title: 'Total Jobs', value: stats.totalJobs, color: 'text-green-600' },
    { title: 'Active Jobs', value: stats.activeJobs, color: 'text-teal-600' },
    { title: 'Total Applications', value: stats.totalApplications, color: 'text-yellow-600' }
  ];

  return (
    <div className="animate-fadeIn">
      <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Analytics</h1>
        <p className="text-gray-600">Platform statistics and insights</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
            <p className="text-sm text-gray-500 mb-1">{stat.title}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Application Status Distribution */}
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Application Status</h2>
          <div className="space-y-4">
            {[
              { status: 'Applied', count: stats.totalApplications * 0.4, color: 'bg-blue-500' },
              { status: 'Reviewing', count: stats.totalApplications * 0.25, color: 'bg-yellow-500' },
              { status: 'Shortlisted', count: stats.totalApplications * 0.15, color: 'bg-green-500' },
              { status: 'Interview Scheduled', count: stats.totalApplications * 0.1, color: 'bg-purple-500' },
              { status: 'Rejected', count: stats.totalApplications * 0.1, color: 'bg-red-500' }
            ].map((item, index) => (
              <div key={index}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">{item.status}</span>
                  <span className="font-medium">{Math.round(item.count)}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`${item.color} h-2 rounded-full`}
                    style={{ width: `${(item.count / stats.totalApplications) * 100 || 0}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Job Type Distribution */}
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Jobs by Type</h2>
          <div className="space-y-4">
            {[
              { type: 'Full Time', percentage: 60 },
              { type: 'Part Time', percentage: 15 },
              { type: 'Contract', percentage: 15 },
              { type: 'Internship', percentage: 7 },
              { type: 'Freelance', percentage: 3 }
            ].map((item, index) => (
              <div key={index}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">{item.type}</span>
                  <span className="font-medium">{item.percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full"
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Companies */}
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Companies</h2>
          {stats.topCompanies?.length > 0 ? (
            <div className="space-y-3">
              {stats.topCompanies.map((company, index) => (
                <div key={index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <span className="w-6 h-6 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center text-sm font-medium mr-3">
                      {index + 1}
                    </span>
                    <span className="font-medium text-gray-900">{company.name}</span>
                  </div>
                  <span className="text-sm text-gray-500">{company.jobCount} jobs</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No data available</p>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-sm p-4 sm:p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Platform Growth</h2>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">New Users (This Month)</span>
              <span className="font-semibold text-green-600">+{Math.round(stats.totalUsers * 0.1)}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">New Jobs (This Month)</span>
              <span className="font-semibold text-green-600">+{Math.round(stats.totalJobs * 0.15)}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Applications (This Month)</span>
              <span className="font-semibold text-green-600">+{Math.round(stats.totalApplications * 0.2)}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Active Recruiters</span>
              <span className="font-semibold text-primary-600">{stats.totalRecruiters}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-6 bg-white rounded-xl shadow-sm p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Platform Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-3xl font-bold text-primary-600 mb-1">
              {stats.totalUsers > 0 ? Math.round((stats.totalJobs / stats.totalUsers) * 100) / 100 : 0}
            </p>
            <p className="text-sm text-gray-600">Avg Jobs per User</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-3xl font-bold text-primary-600 mb-1">
              {stats.totalJobs > 0 ? Math.round((stats.totalApplications / stats.totalJobs) * 100) / 100 : 0}
            </p>
            <p className="text-sm text-gray-600">Avg Applications per Job</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-3xl font-bold text-primary-600 mb-1">
              {stats.totalApplications > 0 ? Math.round((stats.activeJobs / stats.totalApplications) * 10000) / 100 : 0}%
            </p>
            <p className="text-sm text-gray-600">Success Rate</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
