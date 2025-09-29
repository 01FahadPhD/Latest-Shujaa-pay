// pages/admin/dashboard.jsx
import React, { useState } from 'react';
import StableLayout from '../../components/common/layout/StableLayout';
import { useRouter } from 'next/router';
import { 
  ShoppingCart, 
  DollarSign, 
  AlertTriangle, 
  CreditCard,
  CheckCircle,
  Shield,
  Users,
  TrendingUp,
  Eye,
  Calendar
} from 'lucide-react';

const AdminDashboard = () => {
  const router = useRouter();
  const [timeFilter, setTimeFilter] = useState('today');

  // Time filter options
  const timeFilters = [
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'year', label: 'This Year' }
  ];

  // Metrics Data - Filtered by time period
  const getMetricsData = () => {
    const baseMetrics = [
      {
        title: 'Total Orders',
        value: timeFilter === 'today' ? '47' : 
               timeFilter === 'week' ? '324' : 
               timeFilter === 'month' ? '1,248' : '15,892',
        icon: ShoppingCart,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50'
      },
      {
        title: 'Total Revenue',
        value: timeFilter === 'today' ? 'Tsh 8.2M' : 
               timeFilter === 'week' ? 'Tsh 45.2M' : 
               timeFilter === 'month' ? 'Tsh 156.8M' : 'Tsh 2.1B',
        icon: DollarSign,
        color: 'text-green-600',
        bgColor: 'bg-green-50'
      },
      {
        title: 'Active Disputes',
        value: timeFilter === 'today' ? '3' : 
               timeFilter === 'week' ? '15' : 
               timeFilter === 'month' ? '23' : '89',
        icon: AlertTriangle,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50'
      },
      {
        title: 'Pending Payouts',
        value: timeFilter === 'today' ? '8' : 
               timeFilter === 'week' ? '27' : 
               timeFilter === 'month' ? '47' : '512',
        icon: CreditCard,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50'
      }
    ];
    return baseMetrics;
  };

  const metrics = getMetricsData();

  // Quick Actions
  const quickActions = [
    {
      title: 'Approve Payouts',
      description: 'Review and approve seller payouts',
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      href: '/admin/payouts'
    },
    {
      title: 'Resolve Disputes',
      description: 'Manage active disputes and conflicts',
      icon: Shield,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      href: '/admin/disputes'
    },
    {
      title: 'Manage Sellers',
      description: 'View and manage seller accounts',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      href: '/admin/sellers'
    }
  ];

  // Recent Activity Data
  const recentActivity = [
    {
      id: 1,
      type: 'payout',
      title: 'Payout Approved',
      description: 'Tsh 2,450,000 to John Doe',
      time: '2 min ago',
      status: 'completed'
    },
    {
      id: 2,
      type: 'dispute',
      title: 'New Dispute Filed',
      description: 'Order #ORD-7841 - Product not delivered',
      time: '15 min ago',
      status: 'pending'
    },
    {
      id: 3,
      type: 'seller',
      title: 'New Seller Registered',
      description: 'Jane Smith - Electronics Store',
      time: '1 hour ago',
      status: 'completed'
    },
    {
      id: 4,
      type: 'order',
      title: 'Large Order Processed',
      description: 'Tsh 8,500,000 - Wholesale purchase',
      time: '2 hours ago',
      status: 'completed'
    },
    {
      id: 5,
      type: 'payout',
      title: 'Payout Rejected',
      description: 'Tsh 1,200,000 - Insufficient documentation',
      time: '3 hours ago',
      status: 'rejected'
    }
  ];

  // Handle quick action navigation
  const handleQuickAction = (href) => {
    router.push(href);
  };

  return (
    <StableLayout role="admin">
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Time Filter */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">Period:</span>
                </div>
                <div className="flex space-x-1 bg-white border border-gray-300 rounded-lg p-1">
                  {timeFilters.map((filter) => (
                    <button
                      key={filter.value}
                      onClick={() => setTimeFilter(filter.value)}
                      className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                        timeFilter === filter.value
                          ? 'bg-green-500 text-white'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* KPI Metrics Grid - 2 per row on mobile */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
            {metrics.map((metric, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">{metric.title}</p>
                    <p className={`text-lg sm:text-2xl font-bold ${metric.color} mb-2`}>
                      {metric.value}
                    </p>
                  </div>
                  <div className={`p-2 sm:p-3 rounded-lg ${metric.bgColor}`}>
                    <metric.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${metric.color}`} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            
            {/* Left Column - Quick Actions & Revenue */}
            <div className="lg:col-span-2">
              {/* Quick Actions - Horizontal on mobile */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6 sm:mb-8">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Quick Actions</h2>
                </div>

                <div className="grid grid-cols-3 gap-3 sm:gap-4">
                  {quickActions.map((action, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickAction(action.href)}
                      className="text-left p-3 sm:p-4 border border-gray-200 rounded-lg hover:border-green-300 hover:shadow-md transition-all duration-200 group"
                    >
                      <div className={`p-2 rounded-lg w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center ${action.bgColor} mb-2 sm:mb-3 group-hover:scale-105 transition-transform`}>
                        <action.icon className={`h-4 w-4 sm:h-5 sm:w-5 ${action.color}`} />
                      </div>
                      <h3 className="text-sm sm:text-base font-semibold text-gray-900 mb-1 line-clamp-1">{action.title}</h3>
                      <p className="text-xs sm:text-sm text-gray-600 line-clamp-2">{action.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Revenue Chart Section */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Revenue Overview</h2>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <span>{timeFilters.find(f => f.value === timeFilter)?.label}</span>
                  </div>
                </div>
                
                {/* Chart Placeholder */}
                <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-6 sm:p-8 text-center border border-green-100">
                  <TrendingUp className="h-12 w-12 sm:h-16 sm:w-16 text-green-400 mx-auto mb-3 sm:mb-4" />
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Revenue Analytics</h3>
                  <p className="text-gray-600 text-sm sm:text-base">Detailed revenue charts coming soon</p>
                </div>
              </div>
            </div>

            {/* Right Column - Recent Activity & System Status */}
            <div className="space-y-6 sm:space-y-8">
              {/* Recent Activity */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Recent Activity</h2>
                </div>

                <div className="space-y-3 sm:space-y-4 max-h-96 overflow-y-auto">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100">
                      <div className={`p-2 rounded-full ${
                        activity.status === 'completed' ? 'bg-green-100' : 
                        activity.status === 'rejected' ? 'bg-red-100' : 'bg-orange-100'
                      }`}>
                        {activity.type === 'payout' && (
                          <CreditCard className={`h-3 w-3 sm:h-4 sm:w-4 ${
                            activity.status === 'completed' ? 'text-green-600' : 
                            activity.status === 'rejected' ? 'text-red-600' : 'text-orange-600'
                          }`} />
                        )}
                        {activity.type === 'dispute' && (
                          <Shield className={`h-3 w-3 sm:h-4 sm:w-4 ${
                            activity.status === 'completed' ? 'text-green-600' : 'text-orange-600'
                          }`} />
                        )}
                        {activity.type === 'seller' && (
                          <Users className={`h-3 w-3 sm:h-4 sm:w-4 ${
                            activity.status === 'completed' ? 'text-green-600' : 'text-orange-600'
                          }`} />
                        )}
                        {activity.type === 'order' && (
                          <ShoppingCart className={`h-3 w-3 sm:h-4 sm:w-4 ${
                            activity.status === 'completed' ? 'text-green-600' : 'text-orange-600'
                          }`} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 line-clamp-1">
                          {activity.title}
                        </h4>
                        <p className="text-xs sm:text-sm text-gray-600 line-clamp-1">
                          {activity.description}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {activity.time}
                        </p>
                      </div>
                      <button className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                        <Eye className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* System Status */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4 sm:mb-6">System Status</h2>
                
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Payment Gateway</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Operational
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Database</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Operational
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">API Services</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Operational
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-700">Mobile App</span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Maintenance
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </StableLayout>
  );
};

export default AdminDashboard;