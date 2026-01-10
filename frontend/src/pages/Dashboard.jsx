import { useEffect, useState } from 'react';
import { apiClient } from '../api/api.js';
import { Package, CheckCircle, XCircle, Scan } from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [dailyScans, setDailyScans] = useState([]);
  const [monthlyScans, setMonthlyScans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, dailyRes, monthlyRes] = await Promise.all([
        apiClient.get('/analytics/dashboard'),
        apiClient.get('/analytics/daily?days=7'),
        apiClient.get('/analytics/monthly?months=6'),
      ]);

      setStats(statsRes.data);
      
      // Format daily scans data - ensure proper date formatting
      const formattedDaily = (dailyRes.data || []).map((item) => {
        const dateStr = item._id;
        // Format date to be more readable (e.g., "2024-01-15" -> "Jan 15")
        const date = new Date(dateStr);
        const formattedDate = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        return { date: formattedDate, scans: item.count || 0 };
      });
      setDailyScans(formattedDaily);
      
      // Format monthly scans data
      const formattedMonthly = (monthlyRes.data || []).map((item) => {
        const monthStr = item._id;
        // Format month (e.g., "2024-01" -> "Jan 2024")
        const [year, month] = monthStr.split('-');
        const date = new Date(year, parseInt(month) - 1);
        const formattedMonth = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        return { month: formattedMonth, scans: item.count || 0 };
      });
      setMonthlyScans(formattedMonthly);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      // Set empty arrays on error to prevent chart errors
      setDailyScans([]);
      setMonthlyScans([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Products',
      value: stats?.totalProducts || 0,
      icon: Package,
      color: 'bg-blue-500',
    },
    {
      title: 'Active Products',
      value: stats?.activeProducts || 0,
      icon: CheckCircle,
      color: 'bg-green-500',
    },
    {
      title: 'Invalid Products',
      value: stats?.invalidProducts || 0,
      icon: XCircle,
      color: 'bg-red-500',
    },
    {
      title: 'Total QR Scans',
      value: stats?.totalScans || 0,
      icon: Scan,
      color: 'bg-purple-500',
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Overview of your QR verification system</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{card.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{card.value.toLocaleString()}</p>
                </div>
                <div className={`${card.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Daily Scan Count (Last 7 Days)</h2>
          {dailyScans.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyScans} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="date" 
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="scans"
                  stroke="#0ea5e9"
                  strokeWidth={2}
                  dot={{ fill: '#0ea5e9', r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Scans"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-500">
              <p>No scan data available for the last 7 days</p>
            </div>
          )}
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Monthly Scan Count</h2>
          {monthlyScans.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyScans} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="month" 
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
                <Legend />
                <Bar dataKey="scans" fill="#0ea5e9" name="Scans" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-500">
              <p>No scan data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
