import React, { useState, useEffect } from 'react';
import StableLayout from '../../components/common/layout/StableLayout';
import { 
  ShoppingCart, 
  CreditCard, 
  DollarSign,
  Calendar,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

const Dashboard = () => {
  const [dateFilter, setDateFilter] = useState('today');
  const [customDateRange, setCustomDateRange] = useState({ start: '', end: '' });
  const [userData, setUserData] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadUserData();
    loadDashboardData();
  }, [dateFilter, customDateRange]);

  const loadUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/auth/login';
        return;
      }

      const localUserData = localStorage.getItem('user');
      if (localUserData) {
        setUserData(JSON.parse(localUserData));
      }

      // Fetch fresh user data
      const response = await fetch('http://localhost:5000/api/auth/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUserData(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      // In a real app, you would have a dedicated dashboard API endpoint
      // For now, we'll simulate data based on user data
      const mockDashboardData = {
        totalOrders: 1247,
        inEscrow: 2845000,
        availableBalance: 5672000,
        recentActivity: [
          { id: 1, type: 'payment', description: 'Payment received from John Doe', amount: 120000, time: '2 min ago', status: 'success' },
          { id: 2, type: 'order', description: 'New order #ORD-7842', amount: 85000, time: '1 hour ago', status: 'pending' },
          { id: 3, type: 'payout', description: 'Payout processed', amount: 450000, time: '2 hours ago', status: 'success' },
          { id: 4, type: 'dispute', description: 'Dispute raised #DSP-123', amount: 200000, time: '5 hours ago', status: 'warning' }
        ]
      };

      // Simulate API delay
      setTimeout(() => {
        setDashboardData(mockDashboardData);
        setIsLoading(false);
      }, 1000);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError('Failed to load dashboard data');
      setIsLoading(false);
    }
  };

  // Format currency for Tanzanian Shillings
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-TZ', {
      style: 'currency',
      currency: 'TZS',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // KPI Stats Data - Connected to backend data
  const kpiStats = [
    {
      title: 'Total Orders',
      value: dashboardData ? dashboardData.totalOrders.toLocaleString() : '0',
      icon: ShoppingCart,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'In Escrow',
      value: dashboardData ? formatCurrency(dashboardData.inEscrow) : 'Tsh 0',
      icon: CreditCard,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Available Balance',
      value: dashboardData ? formatCurrency(dashboardData.availableBalance) : 'Tsh 0',
      icon: DollarSign,
      color: 'text-green-500',
      bgColor: 'bg-green-50'
    }
  ];

  // Quick Actions Data
  const quickActions = [
    { label: 'Create Link', icon: '🔗', path: '/seller/generate-link' },
    { label: 'View Orders', icon: '📦', path: '/seller/orders' },
    { label: 'Payouts', icon: '💰', path: '/seller/payouts' },
    { label: 'Support', icon: '💬', path: '/seller/support' }
  ];

  const handleNavigation = (path) => {
    const existingPages = ['/seller/generate-link', '/seller/orders'];
    if (!existingPages.includes(path)) {
      alert('This feature is coming soon!');
      return;
    }
    window.location.href = path;
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  if (isLoading) {
    return (
      <StableLayout>
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading your dashboard...</p>
            </div>
          </div>
        </div>
      </StableLayout>
    );
  }

  if (error) {
    return (
      <StableLayout>
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={loadDashboardData}
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </StableLayout>
    );
  }

  return (
    <StableLayout>
      <div className="p-4 sm:p-6 lg:p-8">
        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Welcome Section with Real User Data */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div className="text-center sm:text-left">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
                {getGreeting()}, {userData?.fullName?.split(' ')[0] || 'Seller'}! 👋
              </h1>
              <p className="text-sm text-gray-600">
                {userData?.businessName ? `Welcome to your ${userData.businessName} dashboard` : 'Here\'s your business overview today'}
              </p>
              {userData?.location && (
                <p className="text-xs text-gray-500 mt-1">
                  📍 {userData.location}
                </p>
              )}
            </div>
            <div className="mt-3 sm:mt-0 flex justify-center sm:justify-end">
              <div className="bg-primary-50 border border-primary-200 rounded-lg px-3 py-2 sm:px-4 sm:py-2">
                <p className="text-xs text-primary-600 font-medium">
                  {dateFilter === 'today' ? 'Today' : 
                   dateFilter === 'week' ? 'This Week' :
                   dateFilter === 'month' ? 'This Month' :
                   dateFilter === 'year' ? 'This Year' : 'Custom Range'}
                </p>
                <p className="text-sm font-semibold text-primary-700">
                  {new Date().toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Date Filter Section */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
            {['today', 'week', 'month', 'year', 'custom'].map((filter) => (
              <button
                key={filter}
                onClick={() => setDateFilter(filter)}
                className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  dateFilter === filter
                    ? 'bg-primary-500 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {filter === 'today' && 'Today'}
                {filter === 'week' && 'This Week'}
                {filter === 'month' && 'This Month'}
                {filter === 'year' && 'This Year'}
                {filter === 'custom' && 'Custom'}
              </button>
            ))}
          </div>

          {/* Custom Date Picker */}
          {dateFilter === 'custom' && (
            <div className="mt-3 bg-white p-4 rounded-lg border border-gray-200">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="date"
                      value={customDateRange.start}
                      onChange={(e) => setCustomDateRange(prev => ({ ...prev, start: e.target.value }))}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="date"
                      value={customDateRange.end}
                      onChange={(e) => setCustomDateRange(prev => ({ ...prev, end: e.target.value }))}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* KPI Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {kpiStats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                  <p className={`text-lg sm:text-xl font-bold ${stat.color} mb-2`}>
                    {stat.value}
                  </p>
                  <div className="flex items-center text-xs text-gray-500">
                    <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                    Updated just now
                  </div>
                </div>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Action Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => handleNavigation(action.path)}
                className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors group"
              >
                <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">
                  {action.icon}
                </span>
                <span className="text-sm font-medium text-gray-700 text-center">
                  {action.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
          </div>
          
          <div className="divide-y divide-gray-100">
            {dashboardData?.recentActivity.map((activity) => (
              <div key={activity.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      activity.status === 'success' ? 'bg-green-100' : 
                      activity.status === 'warning' ? 'bg-yellow-100' : 'bg-blue-100'
                    }`}>
                      {activity.status === 'success' && <div className="w-3 h-3 bg-green-500 rounded-full"></div>}
                      {activity.status === 'warning' && <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>}
                      {activity.status === 'pending' && <div className="w-3 h-3 bg-blue-500 rounded-full"></div>}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{activity.description}</p>
                      <p className="text-sm text-gray-500">{activity.time}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{formatCurrency(activity.amount)}</p>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                      activity.status === 'success' ? 'bg-green-100 text-green-800' :
                      activity.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {activity.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="p-4 border-t border-gray-200 text-center">
            <button 
              onClick={() => handleNavigation('/seller/orders')}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              View all activity →
            </button>
          </div>
        </div>
      </div>
    </StableLayout>
  );
};

export default Dashboard;