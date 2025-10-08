import React, { useState, useEffect, useCallback } from 'react';
import StableLayout from '../../components/common/layout/StableLayout';
import { 
  ShoppingCart, 
  CreditCard, 
  DollarSign,
  Calendar,
  TrendingUp,
  AlertCircle,
  Eye,
  EyeOff,
  Link as LinkIcon
} from 'lucide-react';

const Dashboard = () => {
  const [dateFilter, setDateFilter] = useState('today');
  const [customDateRange, setCustomDateRange] = useState({ start: '', end: '' });
  const [userData, setUserData] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [filteredData, setFilteredData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAvailableBalance, setShowAvailableBalance] = useState(false);

  useEffect(() => {
    loadUserData();
    loadDashboardData();
  }, []);

  // Filter data when date filter changes without reloading
  useEffect(() => {
    if (dashboardData?.allData) {
      const filtered = filterDataByDate(dashboardData.allData);
      setFilteredData(filtered);
    }
  }, [dateFilter, customDateRange, dashboardData]);

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
      const sellerId = getSellerId();

      if (!token || !sellerId) return;

      console.log('🔄 Fetching dashboard data for seller:', sellerId);

      // Fetch real data from API
      const response = await fetch(`http://localhost:5000/api/payment-links/seller/${sellerId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 Dashboard API response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('📡 Dashboard API response data:', data);
        
        if (data.success && data.paymentLinks) {
          console.log('✅ Processing payment links:', data.paymentLinks.length);
          const processedData = processDashboardData(data.paymentLinks);
          setDashboardData(processedData);
          // Set initial filtered data
          const initialFiltered = filterDataByDate(data.paymentLinks);
          setFilteredData(initialFiltered);
          console.log('✅ Dashboard data loaded successfully');
        } else {
          throw new Error(data.message || 'No payment links data received');
        }
      } else {
        throw new Error(`API returned ${response.status}`);
      }

    } catch (error) {
      console.error('❌ Error loading dashboard data:', error);
      setError('Failed to load dashboard data: ' + error.message);
      // Don't use mock data - show error instead
    } finally {
      setIsLoading(false);
    }
  };

  // Filter data by date without API call
  const filterDataByDate = useCallback((paymentLinks) => {
    if (!paymentLinks || paymentLinks.length === 0) {
      return {
        totalOrders: 0,
        inEscrow: 0,
        availableBalance: 0,
        recentActivity: []
      };
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    console.log(`🕒 Filtering ${paymentLinks.length} orders for:`, dateFilter);

    const filteredOrders = paymentLinks.filter(order => {
      const orderDate = new Date(order.updatedAt || order.createdAt);
      
      switch (dateFilter) {
        case 'today':
          const isToday = orderDate.toDateString() === today.toDateString();
          console.log('📅 Today filter - Order:', order.productName, 'Date:', orderDate.toDateString(), 'IsToday:', isToday);
          return isToday;
        case 'week':
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          const isThisWeek = orderDate >= weekAgo;
          console.log('📅 Week filter - Order:', order.productName, 'Date:', orderDate, 'WeekAgo:', weekAgo, 'IsThisWeek:', isThisWeek);
          return isThisWeek;
        case 'month':
          const monthAgo = new Date(today);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          const isThisMonth = orderDate >= monthAgo;
          console.log('📅 Month filter - Order:', order.productName, 'Date:', orderDate, 'MonthAgo:', monthAgo, 'IsThisMonth:', isThisMonth);
          return isThisMonth;
        case 'year':
          const yearAgo = new Date(today);
          yearAgo.setFullYear(yearAgo.getFullYear() - 1);
          const isThisYear = orderDate >= yearAgo;
          console.log('📅 Year filter - Order:', order.productName, 'Date:', orderDate, 'YearAgo:', yearAgo, 'IsThisYear:', isThisYear);
          return isThisYear;
        case 'custom':
          if (!customDateRange.start || !customDateRange.end) return true;
          const startDate = new Date(customDateRange.start);
          const endDate = new Date(customDateRange.end);
          endDate.setHours(23, 59, 59, 999);
          const isInCustomRange = orderDate >= startDate && orderDate <= endDate;
          console.log('📅 Custom filter - Order:', order.productName, 'Date:', orderDate, 'Start:', startDate, 'End:', endDate, 'InRange:', isInCustomRange);
          return isInCustomRange;
        default: // 'all'
          console.log('📅 All filter - Order:', order.productName, 'Date:', orderDate);
          return true;
      }
    });

    console.log(`✅ Filtered ${filteredOrders.length} orders for ${dateFilter}`);
    const result = processDashboardData(filteredOrders);
    console.log('📊 Filtered KPI Stats:', result);
    return result;
  }, [dateFilter, customDateRange]);

  // Get seller ID from user data
  const getSellerId = () => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    return userData.id || userData._id;
  };

  // Process payment links data for dashboard
  const processDashboardData = (paymentLinks) => {
    let totalOrders = 0;
    let inEscrow = 0;
    let availableBalance = 0;
    const recentActivity = [];

    console.log('🔨 Processing payment links:', paymentLinks);

    paymentLinks.forEach(order => {
      const orderAmount = parseInt(order.productPrice) || 0;
      const orderStatus = order.status;
      
      console.log(`📦 Order: ${order.productName}, Amount: ${orderAmount}, Status: ${orderStatus}`);

      // Count all orders
      totalOrders++;

      // Calculate in escrow (paid, delivered, disputed orders)
      if (['paid', 'delivered', 'disputed'].includes(orderStatus)) {
        inEscrow += orderAmount;
        console.log(`💰 Added to escrow: ${orderAmount}, Total escrow: ${inEscrow}`);
      }

      // Calculate available balance (completed orders)
      if (orderStatus === 'completed') {
        availableBalance += orderAmount;
        console.log(`💳 Added to available: ${orderAmount}, Total available: ${availableBalance}`);
      }

      // Create recent activity entries
      const activity = {
        id: order._id || order.id,
        type: getActivityType(orderStatus),
        description: getActivityDescription(order),
        amount: orderAmount,
        time: formatTimeAgo(order.updatedAt || order.createdAt),
        status: getActivityStatus(orderStatus),
        date: new Date(order.updatedAt || order.createdAt)
      };
      recentActivity.push(activity);
      console.log(`📝 Activity: ${activity.description}, Amount: ${activity.amount}, Status: ${activity.status}`);
    });

    // Sort recent activity by time (newest first) and take latest 4
    const sortedActivity = recentActivity.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 4);

    const result = {
      totalOrders,
      inEscrow,
      availableBalance,
      recentActivity: sortedActivity,
      allData: paymentLinks
    };

    console.log('📊 Final Dashboard Stats:', result);
    return result;
  };

  // Helper functions for activity processing
  const getActivityType = (status) => {
    const typeMap = {
      'paid': 'payment',
      'completed': 'payout',
      'disputed': 'dispute',
      'refunded': 'refund'
    };
    return typeMap[status] || 'order';
  };

  const getActivityDescription = (order) => {
    const productName = order.productName || 'Product';
    const status = order.status;
    
    const descriptions = {
      'paid': `Payment received for ${productName}`,
      'completed': `Payout processed for ${productName}`,
      'disputed': `Dispute raised for ${productName}`,
      'refunded': `Refund processed for ${productName}`
    };
    
    return descriptions[status] || `Order updated: ${productName}`;
  };

  const getActivityStatus = (status) => {
    const statusMap = {
      'paid': 'success',
      'completed': 'success',
      'disputed': 'warning',
      'refunded': 'warning'
    };
    return statusMap[status] || 'pending';
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
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

  // Format available balance with eye toggle
  const formatAvailableBalance = (amount) => {
    if (showAvailableBalance) {
      return formatCurrency(amount);
    }
    return '••••••';
  };

  // KPI Stats Data - Connected to filtered data
  const kpiStats = [
    {
      title: 'Total Orders',
      value: filteredData ? filteredData.totalOrders.toLocaleString() : '0',
      icon: ShoppingCart,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'In Escrow',
      value: filteredData ? formatCurrency(filteredData.inEscrow) : 'Tsh 0',
      icon: CreditCard,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Available Balance',
      value: filteredData ? formatAvailableBalance(filteredData.availableBalance) : 'Tsh ••••••',
      icon: DollarSign,
      color: 'text-green-500',
      bgColor: 'bg-green-50',
      showEye: true
    }
  ];

  // Quick Actions Data
  const quickActions = [
    { label: 'Create Link', icon: '🔗', path: '/seller/generate-link' },
    { label: 'View Orders', icon: '📦', path: '/seller/orders' },
    { label: 'Payouts', icon: '💰', path: '/seller/payouts' },
    { label: 'Support', icon: '💬', path: '/seller/support' }
  ];

  // Time filter options for dropdown
  const timeFilterOptions = [
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'year', label: 'This Year' },
    { value: 'custom', label: 'Custom Range' }
  ];

  const handleNavigation = (path) => {
    const existingPages = ['/seller/generate-link', '/seller/orders', '/seller/payouts', '/seller/notifications'];
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

  const toggleAvailableBalance = () => {
    setShowAvailableBalance(!showAvailableBalance);
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
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
            <div className="text-center sm:text-left mb-3 sm:mb-0 flex-1">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 mb-1">
                {getGreeting()}, {userData?.fullName?.split(' ')[0] || 'Seller'}! 👋
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 mb-1">
                {userData?.businessName ? `Welcome to your ${userData.businessName} dashboard` : 'Here\'s your business overview today'}
              </p>
              {userData?.location && (
                <p className="text-xs text-gray-500">
                  📍 {userData.location}
                </p>
              )}
            </div>
            
            {/* Date and Filter Section - Mobile: Filter left, Date right */}
            <div className="flex items-center justify-between sm:justify-end space-x-2 sm:space-x-3">
              {/* Date Display - Always shows today's date */}
              <div className="sm:order-1">
                <div className="bg-primary-50 border border-primary-200 rounded-lg px-3 py-2 min-w-[120px] text-center">
                  <p className="text-xs text-primary-600 font-medium">Today</p>
                  <p className="text-sm font-semibold text-primary-700">
                    {new Date().toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </p>
                </div>
              </div>
              
              {/* Filter Dropdown - Right on desktop */}
              <div className="sm:order-2">
                <div className="bg-primary-50 border border-primary-200 rounded-lg px-3 py-2 min-w-[120px]">
                  <p className="text-xs text-primary-600 font-medium">Time Filter</p>
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="w-full bg-transparent border-none text-xs sm:text-sm font-semibold text-primary-700 focus:outline-none focus:ring-0 p-0"
                  >
                    {timeFilterOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Custom Date Picker */}
          {dateFilter === 'custom' && (
            <div className="mt-3 bg-white p-3 rounded-lg border border-gray-200">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                      <Calendar className="h-3 w-3 text-gray-400" />
                    </div>
                    <input
                      type="date"
                      value={customDateRange.start}
                      onChange={(e) => setCustomDateRange(prev => ({ ...prev, start: e.target.value }))}
                      className="w-full pl-7 pr-2 py-1 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-2 flex items-center pointer-events-none">
                      <Calendar className="h-3 w-3 text-gray-400" />
                    </div>
                    <input
                      type="date"
                      value={customDateRange.end}
                      onChange={(e) => setCustomDateRange(prev => ({ ...prev, end: e.target.value }))}
                      className="w-full pl-7 pr-2 py-1 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
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
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs sm:text-sm font-medium text-gray-600">{stat.title}</p>
                    {stat.showEye && (
                      <button
                        onClick={toggleAvailableBalance}
                        className="text-gray-400 hover:text-gray-600 transition-colors ml-2"
                      >
                        {showAvailableBalance ? (
                          <EyeOff className="h-3 w-3 sm:h-4 sm:w-4" />
                        ) : (
                          <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                        )}
                      </button>
                    )}
                  </div>
                  <p className={`text-base sm:text-lg font-bold ${stat.color} mb-2`}>
                    {stat.value}
                  </p>
                  <div className="flex items-center text-xs text-gray-500">
                    <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
                    {dateFilter === 'today' ? 'Today' : dateFilter === 'week' ? 'This week' : dateFilter === 'month' ? 'This month' : dateFilter === 'year' ? 'This year' : 'Selected period'}
                  </div>
                </div>
                <div className={`p-2 rounded-lg ${stat.bgColor} ml-2`}>
                  <stat.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${stat.color}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Action Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => handleNavigation(action.path)}
                className="flex flex-col items-center justify-center p-3 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors group"
              >
                <span className="text-xl sm:text-2xl mb-1 sm:mb-2 group-hover:scale-110 transition-transform">
                  {action.icon}
                </span>
                <span className="text-xs sm:text-sm font-medium text-gray-700 text-center">
                  {action.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900">Recent Activity</h2>
          </div>
          
          <div className="divide-y divide-gray-100">
            {filteredData?.recentActivity && filteredData.recentActivity.length > 0 ? (
              filteredData.recentActivity.map((activity) => (
                <div key={activity.id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 sm:space-x-4">
                      <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${
                        activity.status === 'success' ? 'bg-green-100' : 
                        activity.status === 'warning' ? 'bg-yellow-100' : 'bg-blue-100'
                      }`}>
                        {activity.status === 'success' && <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full"></div>}
                        {activity.status === 'warning' && <div className="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-500 rounded-full"></div>}
                        {activity.status === 'pending' && <div className="w-2 h-2 sm:w-3 sm:h-3 bg-blue-500 rounded-full"></div>}
                      </div>
                      <div>
                        <p className="text-sm sm:text-base font-medium text-gray-900">{activity.description}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm sm:text-base font-semibold text-gray-900">{formatCurrency(activity.amount)}</p>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        activity.status === 'success' ? 'bg-green-100 text-green-800' :
                        activity.status === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {activity.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              // No activity message
              <div className="p-8 text-center">
                <div className="flex flex-col items-center justify-center space-y-3">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                    <LinkIcon className="h-8 w-8 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {dateFilter === 'today' ? 'No activity today' : 
                       dateFilter === 'week' ? 'No activity this week' :
                       dateFilter === 'month' ? 'No activity this month' :
                       dateFilter === 'year' ? 'No activity this year' : 'No activity in selected period'}
                    </h3>
                    <p className="text-gray-600 text-sm mb-4">
                      Start by creating a{' '}
                      <button 
                        onClick={() => handleNavigation('/seller/generate-link')}
                        className="text-primary-600 hover:text-primary-700 font-medium underline"
                      >
                        payment link
                      </button>{' '}
                      for your buyers to get started with orders and payments.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {filteredData?.recentActivity && filteredData.recentActivity.length > 0 && (
            <div className="p-4 border-t border-gray-200 text-center">
              <button 
                onClick={() => handleNavigation('/seller/notifications')}
                className="text-primary-600 hover:text-primary-700 font-medium text-sm"
              >
                View all activity →
              </button>
            </div>
          )}
        </div>
      </div>
    </StableLayout>
  );
};

export default Dashboard;