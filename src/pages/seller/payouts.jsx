import React, { useState } from 'react';
import StableLayout from '../../components/common/layout/StableLayout';
import { 
  Search, 
  Calendar,
  Clock,
  DollarSign,
  Download,
  Eye,
  Building,
  Smartphone
} from 'lucide-react';

const PayoutsPage = () => {
  const [dateFilter, setDateFilter] = useState('today');
  const [searchQuery, setSearchQuery] = useState('');
  const [customDateRange, setCustomDateRange] = useState({ start: '', end: '' });

  // KPI Stats Data - 2 boxes only
  const kpiStats = [
    {
      title: 'Pending Payouts',
      value: 'Tsh 3,450,000',
      icon: Clock,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50',
      description: 'Awaiting processing'
    },
    {
      title: 'Available Balance',
      value: 'Tsh 8,120,000',
      icon: DollarSign,
      color: 'text-green-500',
      bgColor: 'bg-green-50',
      description: 'Ready to withdraw',
      action: true
    }
  ];

  // Mock payouts data
  const payoutsData = [
    {
      id: 'PYT-7842',
      orderId: 'ORD-7842',
      product: 'iPhone 15 Pro',
      amount: 2450000,
      method: 'bank_transfer',
      status: 'completed',
      date: '2024-01-15',
      bankName: 'CRDB Bank',
      accountNumber: '***015489'
    },
    {
      id: 'PYT-7841',
      orderId: 'ORD-7841',
      product: 'MacBook Air M2',
      amount: 3250000,
      method: 'mobile_money',
      status: 'completed',
      date: '2024-01-14',
      provider: 'M-Pesa',
      phoneNumber: '+255 712 *** 678'
    },
    {
      id: 'PYT-7840',
      orderId: 'ORD-7840',
      product: 'AirPods Pro',
      amount: 850000,
      method: 'bank_transfer',
      status: 'pending',
      date: '2024-01-13',
      bankName: 'NMB Bank',
      accountNumber: '***782341'
    },
    {
      id: 'PYT-7839',
      orderId: 'ORD-7839',
      product: 'iPad Air',
      amount: 1850000,
      method: 'mobile_money',
      status: 'completed',
      date: '2024-01-12',
      provider: 'Tigo Pesa',
      phoneNumber: '+255 768 *** 456'
    },
    {
      id: 'PYT-7838',
      orderId: 'ORD-7838',
      product: 'Apple Watch',
      amount: 950000,
      method: 'bank_transfer',
      status: 'pending',
      date: '2024-01-11',
      bankName: 'CRDB Bank',
      accountNumber: '***015489'
    },
    {
      id: 'PYT-7837',
      orderId: 'ORD-7837',
      product: 'Samsung Galaxy S24',
      amount: 2150000,
      method: 'mobile_money',
      status: 'completed',
      date: '2024-01-10',
      provider: 'Airtel Money',
      phoneNumber: '+255 745 *** 654'
    }
  ];

  // Status configuration
  const statusConfig = {
    pending: { label: 'Pending', color: 'bg-orange-100 text-orange-800' },
    completed: { label: 'Completed', color: 'bg-green-100 text-green-800' }
  };

  // Method configuration
  const methodConfig = {
    bank_transfer: { label: 'Bank Transfer', icon: Building, color: 'text-blue-500' },
    mobile_money: { label: 'Mobile Money', icon: Smartphone, color: 'text-purple-500' }
  };

  // Format currency in Tsh
  const formatCurrency = (amount) => {
    return `Tsh ${amount.toLocaleString()}`;
  };

  // Filter payouts based on search and date filter
  const filteredPayouts = payoutsData.filter(payout => {
    const matchesSearch = 
      payout.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payout.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payout.product.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

  const handleViewDetails = (payoutId) => {
    console.log('View details for:', payoutId);
    // TODO: Implement view details logic
  };

  const handleWithdraw = () => {
    console.log('Initiate withdrawal');
    // TODO: Implement withdrawal logic
    alert('Withdrawal request submitted!');
  };

  return (
    <StableLayout>
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Payouts</h1>
            <p className="text-gray-600">Manage your earnings and withdrawal requests</p>
          </div>

          {/* KPI Stats Grid - 2 boxes only */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            {kpiStats.map((stat, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                    <p className={`text-2xl font-bold ${stat.color} mb-2`}>
                      {stat.value}
                    </p>
                    <p className="text-sm text-gray-500">{stat.description}</p>
                    
                    {/* Withdraw Button for Available Balance */}
                    {stat.action && (
                      <button
                        onClick={handleWithdraw}
                        className="mt-4 bg-primary-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-600 transition-colors flex items-center space-x-2"
                      >
                        <Download className="h-4 w-4" />
                        <span>Withdraw Funds</span>
                      </button>
                    )}
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Control Bar - Search and Filters in same row */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search Bar */}
              <div className="flex-1">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Search payouts, orders, products..."
                  />
                </div>
              </div>

              {/* Filter Options */}
              <div className="flex flex-wrap gap-2">
                {['today', 'week', 'month', 'custom'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setDateFilter(filter)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      dateFilter === filter
                        ? 'bg-primary-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {filter === 'today' && 'Today'}
                    {filter === 'week' && 'This Week'}
                    {filter === 'month' && 'This Month'}
                    {filter === 'custom' && 'Custom Range'}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Date Picker */}
            {dateFilter === 'custom' && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
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
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
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

          {/* Payouts Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Desktop Table */}
            <div className="hidden lg:block">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payout ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPayouts.map((payout) => {
                    const MethodIcon = methodConfig[payout.method].icon;
                    return (
                      <tr key={payout.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {payout.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {payout.orderId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {payout.product}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatCurrency(payout.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center space-x-2">
                            <MethodIcon className={`h-4 w-4 ${methodConfig[payout.method].color}`} />
                            <span>{methodConfig[payout.method].label}</span>
                          </div>
                          <div className="text-gray-500 text-xs mt-1">
                            {payout.method === 'bank_transfer' 
                              ? `${payout.bankName} • ${payout.accountNumber}`
                              : `${payout.provider} • ${payout.phoneNumber}`
                            }
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig[payout.status].color}`}>
                            {statusConfig[payout.status].label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(payout.date).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleViewDetails(payout.id)}
                            className="text-primary-600 hover:text-primary-900 flex items-center space-x-1"
                          >
                            <Eye className="h-4 w-4" />
                            <span>View</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden divide-y divide-gray-200">
              {filteredPayouts.map((payout) => {
                const MethodIcon = methodConfig[payout.method].icon;
                return (
                  <div key={payout.id} className="p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="font-medium text-gray-900">{payout.id}</div>
                        <div className="text-sm text-gray-500">{payout.orderId}</div>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig[payout.status].color}`}>
                        {statusConfig[payout.status].label}
                      </span>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <div className="text-sm text-gray-500">Product</div>
                        <div className="text-sm font-medium text-gray-900">{payout.product}</div>
                      </div>
                      
                      <div className="flex justify-between">
                        <div className="text-sm text-gray-500">Amount</div>
                        <div className="text-sm font-medium text-gray-900">{formatCurrency(payout.amount)}</div>
                      </div>
                      
                      <div className="flex justify-between">
                        <div className="text-sm text-gray-500">Method</div>
                        <div className="text-sm font-medium text-gray-900 flex items-center space-x-1">
                          <MethodIcon className={`h-4 w-4 ${methodConfig[payout.method].color}`} />
                          <span>{methodConfig[payout.method].label}</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between">
                        <div className="text-sm text-gray-500">Date</div>
                        <div className="text-sm font-medium text-gray-900">
                          {new Date(payout.date).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </div>
                      </div>
                      
                      <div className="flex justify-between">
                        <div className="text-sm text-gray-500">Actions</div>
                        <button
                          onClick={() => handleViewDetails(payout.id)}
                          className="text-primary-600 hover:text-primary-900 flex items-center space-x-1"
                        >
                          <Eye className="h-4 w-4" />
                          <span>View Details</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Empty State */}
            {filteredPayouts.length === 0 && (
              <div className="text-center py-12">
                <DollarSign className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No payouts found matching your criteria</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </StableLayout>
  );
};

export default PayoutsPage;