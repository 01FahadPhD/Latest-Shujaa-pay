// pages/admin/analytics.jsx
import React, { useState } from 'react';
import StableLayout from '../../components/common/layout/StableLayout';
import { 
  ShoppingCart, 
  DollarSign, 
  CreditCard,
  Users,
  TrendingUp,
  BarChart3,
  PieChart,
  MapPin,
  Download,
  Calendar,
  Filter,
  Search,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  Package,
  Ban,
  RotateCcw,
  Shield
} from 'lucide-react';

const ReportsAnalytics = () => {
  const [dateRange, setDateRange] = useState('month');
  const [filters, setFilters] = useState({
    seller: '',
    paymentMethod: '',
    region: ''
  });
  const [selectedReport, setSelectedReport] = useState('');

  // Tanzania Regions
  const tanzaniaRegions = [
    'Arusha',
    'Dar es Salaam',
    'Dodoma',
    'Geita',
    'Iringa',
    'Kagera',
    'Katavi',
    'Kigoma',
    'Kilimanjaro',
    'Lindi',
    'Manyara',
    'Mara',
    'Mbeya',
    'Morogoro',
    'Mtwara',
    'Mwanza',
    'Njombe',
    'Pemba North',
    'Pemba South',
    'Pwani',
    'Rukwa',
    'Ruvuma',
    'Shinyanga',
    'Simiyu',
    'Singida',
    'Songwe',
    'Tabora',
    'Tanga',
    'Zanzibar Central/South',
    'Zanzibar North',
    'Zanzibar Urban/West'
  ];

  const dateRanges = [
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'year', label: 'This Year' },
    { value: 'custom', label: 'Custom Range' }
  ];

  const paymentMethods = [
    'Bank Transfer',
    'M-Pesa',
    'Airtel Money',
    'Tigo Pesa',
    'Halopesa'
  ];

  // KPI Stats Data - Removed percentage changes
  const kpiStats = [
    {
      title: 'Total Orders',
      value: '1,248',
      icon: ShoppingCart,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Total Revenue',
      value: 'Tsh 156.8M',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Pending Payouts',
      value: 'Tsh 24.3M',
      icon: CreditCard,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Completed Payouts',
      value: 'Tsh 132.5M',
      icon: CheckCircle,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Active Sellers',
      value: '142',
      icon: Users,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50'
    },
    {
      title: 'Total Profit',
      value: 'Tsh 1.57M',
      icon: TrendingUp,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50'
    }
  ];

  // Mock data for charts
  const revenueData = [
    { month: 'Jan', revenue: 45.2 },
    { month: 'Feb', revenue: 52.1 },
    { month: 'Mar', revenue: 48.7 },
    { month: 'Apr', revenue: 61.3 },
    { month: 'May', revenue: 55.8 },
    { month: 'Jun', revenue: 68.4 }
  ];

  const ordersByStatus = [
    { status: 'Completed', count: 784, color: 'bg-blue-500' },
    { status: 'Delivered', count: 892, color: 'bg-green-500' },
    { status: 'In Escrow', count: 156, color: 'bg-purple-500' },
    { status: 'Waiting Payment', count: 89, color: 'bg-yellow-500' },
    { status: 'Refunded', count: 47, color: 'bg-orange-500' },
    { status: 'Canceled', count: 23, color: 'bg-red-500' }
  ];

  const payoutsByMethod = [
    { method: 'M-Pesa', value: 65, color: 'bg-green-500' },
    { method: 'Airtel Money', value: 15, color: 'bg-red-500' },
    { method: 'Bank Transfer', value: 12, color: 'bg-blue-500' },
    { method: 'Tigo Pesa', value: 5, color: 'bg-purple-500' },
    { method: 'Halopesa', value: 3, color: 'bg-orange-500' }
  ];

  const topSellers = [
    { name: 'Tech Gadgets Ltd', orders: 247, revenue: 'Tsh 32.1M' },
    { name: 'Fashion Hub', orders: 189, revenue: 'Tsh 18.7M' },
    { name: 'Electro Store', orders: 156, revenue: 'Tsh 22.3M' },
    { name: 'Beauty Palace', orders: 134, revenue: 'Tsh 12.8M' },
    { name: 'Home Comforts', orders: 98, revenue: 'Tsh 8.9M' }
  ];

  const disputeTrends = [
    { month: 'Jan', disputes: 12 },
    { month: 'Feb', disputes: 8 },
    { month: 'Mar', disputes: 15 },
    { month: 'Apr', disputes: 10 },
    { month: 'May', disputes: 7 },
    { month: 'Jun', disputes: 5 }
  ];

  const sellersByRegion = [
    { region: 'Dar es Salaam', sellers: 45 },
    { region: 'Mwanza', sellers: 23 },
    { region: 'Arusha', sellers: 18 },
    { region: 'Mbeya', sellers: 15 },
    { region: 'Dodoma', sellers: 12 },
    { region: 'Others', sellers: 29 }
  ];

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      seller: '',
      paymentMethod: '',
      region: ''
    });
  };

  const handleExport = (type) => {
    console.log(`Exporting ${type} data...`);
    // Implement export logic
    setSelectedReport(type);
  };

  const generatePDFReport = () => {
    console.log('Generating PDF report...');
    // Implement PDF generation logic
  };

  // Simple chart components (replace with actual chart library in production)
  const SimpleLineChart = ({ data, title, color = 'green' }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="h-64 flex items-end space-x-2">
        {data.map((item, index) => (
          <div key={index} className="flex-1 flex flex-col items-center">
            <div 
              className={`w-full bg-${color}-500 rounded-t-lg transition-all duration-300 hover:opacity-80`}
              style={{ height: `${(item.revenue || item.disputes) * 1.2}px` }}
            />
            <span className="text-xs text-gray-500 mt-2">{item.month}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const SimpleBarChart = ({ data, title }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={index} className="flex items-center space-x-3">
            <div className="w-24 text-sm text-gray-600">{item.name || item.region}</div>
            <div className="flex-1 bg-gray-200 rounded-full h-4">
              <div 
                className={`h-4 rounded-full ${item.color}`}
                style={{ width: `${(item.orders || item.sellers) / Math.max(...data.map(d => d.orders || d.sellers)) * 100}%` }}
              />
            </div>
            <div className="w-20 text-sm font-medium text-gray-900">
              {item.orders || item.sellers}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const SimplePieChart = ({ data, title }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <div className="flex flex-col items-center">
        <div className="w-48 h-48 rounded-full relative mb-4 bg-gray-200">
          {/* This is a simplified pie chart representation */}
          <div className="absolute inset-0 rounded-full border-8 border-green-500" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' }} />
          <div className="absolute inset-0 rounded-full border-8 border-blue-500" style={{ clipPath: 'polygon(50% 50%, 100% 0, 100% 100%, 50% 50%)' }} />
          <div className="absolute inset-0 rounded-full border-8 border-purple-500" style={{ clipPath: 'polygon(50% 50%, 100% 0, 0 0, 50% 50%)' }} />
        </div>
        <div className="space-y-2">
          {data.map((item, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${item.color}`} />
              <span className="text-sm text-gray-600">{item.method || item.status}</span>
              <span className="text-sm font-medium text-gray-900">{item.value || item.count}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <StableLayout role="admin">
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Page Header */}
          <div className="mb-6 sm:mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Reports & Analytics</h1>
                <p className="text-gray-600">Comprehensive platform performance and financial insights</p>
              </div>
              <div className="mt-4 sm:mt-0 flex space-x-3">
                <button
                  onClick={generatePDFReport}
                  className="flex items-center space-x-2 bg-white border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <FileText className="h-4 w-4" />
                  <span className="text-sm font-medium">PDF Report</span>
                </button>
              </div>
            </div>
          </div>

          {/* Filters Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                {/* Date Range */}
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="block px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                  >
                    {dateRanges.map(range => (
                      <option key={range.value} value={range.value}>{range.label}</option>
                    ))}
                  </select>
                </div>

                {/* Payment Method Filter */}
                <select
                  value={filters.paymentMethod}
                  onChange={(e) => handleFilterChange('paymentMethod', e.target.value)}
                  className="block px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                >
                  <option value="">All Payment Methods</option>
                  {paymentMethods.map(method => (
                    <option key={method} value={method}>{method}</option>
                  ))}
                </select>

                {/* Region Filter */}
                <select
                  value={filters.region}
                  onChange={(e) => handleFilterChange('region', e.target.value)}
                  className="block px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                >
                  <option value="">All Regions</option>
                  {tanzaniaRegions.map(region => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>

                {/* Clear Filters */}
                <button
                  onClick={clearFilters}
                  className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>

          {/* KPI Metrics Grid - Clean without percentage changes */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
            {kpiStats.map((stat, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                    <p className={`text-lg sm:text-2xl font-bold ${stat.color}`}>
                      {stat.value}
                    </p>
                  </div>
                  <div className={`p-2 sm:p-3 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`h-5 w-5 sm:h-6 sm:w-6 ${stat.color}`} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Export Options */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Export Data</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                onClick={() => handleExport('orders')}
                className="flex items-center justify-center space-x-2 bg-blue-50 text-blue-700 py-3 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <ShoppingCart className="h-4 w-4" />
                <span className="text-sm font-medium">Orders CSV</span>
              </button>
              <button
                onClick={() => handleExport('payouts')}
                className="flex items-center justify-center space-x-2 bg-green-50 text-green-700 py-3 rounded-lg hover:bg-green-100 transition-colors"
              >
                <CreditCard className="h-4 w-4" />
                <span className="text-sm font-medium">Payouts CSV</span>
              </button>
              <button
                onClick={() => handleExport('revenue')}
                className="flex items-center justify-center space-x-2 bg-purple-50 text-purple-700 py-3 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <DollarSign className="h-4 w-4" />
                <span className="text-sm font-medium">Revenue Excel</span>
              </button>
              <button
                onClick={() => handleExport('summary')}
                className="flex items-center justify-center space-x-2 bg-orange-50 text-orange-700 py-3 rounded-lg hover:bg-orange-100 transition-colors"
              >
                <FileText className="h-4 w-4" />
                <span className="text-sm font-medium">Summary PDF</span>
              </button>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Revenue Over Time */}
            <SimpleLineChart 
              data={revenueData} 
              title="Revenue Over Time (Millions Tsh)" 
              color="green"
            />

            {/* Orders By Status */}
            <SimplePieChart 
              data={ordersByStatus} 
              title="Orders By Status"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Payouts By Method */}
            <SimplePieChart 
              data={payoutsByMethod} 
              title="Payouts By Method"
            />

            {/* Top Selling Sellers */}
            <SimpleBarChart 
              data={topSellers} 
              title="Top Selling Sellers"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Dispute Trends */}
            <SimpleLineChart 
              data={disputeTrends} 
              title="Dispute Trends" 
              color="red"
            />

            {/* Sellers by Region */}
            <SimpleBarChart 
              data={sellersByRegion} 
              title="Sellers by Region"
            />
          </div>

          {/* Data Summary Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent High-Value Orders</h3>
              <div className="space-y-3">
                {topSellers.slice(0, 5).map((seller, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{seller.name}</p>
                      <p className="text-sm text-gray-500">{seller.orders} orders</p>
                    </div>
                    <p className="font-semibold text-green-600">{seller.revenue}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Regional Performance */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Regional Performance</h3>
              <div className="space-y-3">
                {sellersByRegion.map((region, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border border-gray-100 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="font-medium text-gray-900">{region.region}</span>
                    </div>
                    <span className="font-semibold text-blue-600">{region.sellers} sellers</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Export Status */}
          {selectedReport && (
            <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4" />
                <span>Exporting {selectedReport} data...</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </StableLayout>
  );
};

export default ReportsAnalytics;