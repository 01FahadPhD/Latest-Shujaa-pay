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
  Smartphone,
  X,
  BanknoteIcon,
  Phone,
  FileText,
  Calendar as CalendarIcon
} from 'lucide-react';

const PayoutsPage = () => {
  const [dateFilter, setDateFilter] = useState('today');
  const [searchQuery, setSearchQuery] = useState('');
  const [customDateRange, setCustomDateRange] = useState({ start: '', end: '' });
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState('');
  const [selectedAgent, setSelectedAgent] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedPayout, setSelectedPayout] = useState(null);

  // Mobile Money Agents
  const mobileMoneyAgents = [
    { id: 'mpesa', name: 'M-Pesa', icon: '📱' },
    { id: 'halopesa', name: 'Halopesa', icon: '💜' },
    { id: 'airtelmoney', name: 'Airtel Money', icon: '🔵' },
    { id: 'mix', name: 'Mix by Yas', icon: '🎨' },
    { id: 'azampesa', name: 'Azam Pesa', icon: '🟠' }
  ];

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

  const handleViewDetails = (payout) => {
    setSelectedPayout(payout);
    setShowDetailsModal(true);
  };

  const handleWithdraw = () => {
    setShowWithdrawModal(true);
    setWithdrawAmount('');
  };

  const handleMethodSelect = (method) => {
    setSelectedMethod(method);
    setSelectedAgent('');
    setPhoneNumber('');
    setWithdrawAmount('');
  };

  const handleAgentSelect = (agentId) => {
    setSelectedAgent(agentId);
  };

  const handleWithdrawSubmit = () => {
    if (selectedMethod === 'mobile_money') {
      if (!selectedAgent || !phoneNumber || !withdrawAmount) {
        alert('Please fill all required fields');
        return;
      }
      
      // Simulate mobile money withdrawal
      console.log('Mobile Money Withdrawal:', {
        agent: selectedAgent,
        phoneNumber: phoneNumber,
        amount: withdrawAmount
      });

      alert(`Withdrawal of Tsh ${parseInt(withdrawAmount).toLocaleString()} to ${mobileMoneyAgents.find(a => a.id === selectedAgent)?.name} submitted!`);
    }

    // Reset and close modal
    setShowWithdrawModal(false);
    setSelectedMethod('');
    setSelectedAgent('');
    setPhoneNumber('');
    setWithdrawAmount('');
  };

  const closeModal = () => {
    setShowWithdrawModal(false);
    setSelectedMethod('');
    setSelectedAgent('');
    setPhoneNumber('');
    setWithdrawAmount('');
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedPayout(null);
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
                            onClick={() => handleViewDetails(payout)}
                            className="text-primary-600 hover:text-primary-900 flex items-center space-x-1 bg-primary-50 px-3 py-1 rounded-lg transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                            <span>View Details</span>
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
                          onClick={() => handleViewDetails(payout)}
                          className="text-primary-600 hover:text-primary-900 flex items-center space-x-1 bg-primary-50 px-3 py-1 rounded-lg transition-colors"
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

      {/* Withdrawal Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-sm sm:max-w-md mx-auto animate-fade-in max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 sticky top-0 bg-white">
              <div className="flex items-center">
                <div className="bg-primary-100 p-2 rounded-lg mr-3">
                  <BanknoteIcon className="h-5 w-5 sm:h-6 sm:w-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">Withdraw Funds</h3>
                  <p className="text-xs sm:text-sm text-gray-600">Choose your withdrawal method</p>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 sm:p-6">
              {/* Available Balance */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm font-medium text-green-800">Available Balance</span>
                  <span className="text-base sm:text-lg font-bold text-green-900">Tsh 8,120,000</span>
                </div>
              </div>

              {/* Payment Method Selection */}
              {!selectedMethod ? (
                <div className="space-y-3 sm:space-y-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2 sm:mb-3">Select Payment Method</h4>
                  
                  {/* Bank Transfer Option */}
                  <button
                    onClick={() => handleMethodSelect('bank_transfer')}
                    className="w-full flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 border border-gray-300 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors text-left"
                  >
                    <div className="bg-blue-100 p-2 sm:p-3 rounded-lg">
                      <Building className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h5 className="text-sm sm:text-base font-medium text-gray-900">Bank Transfer</h5>
                      <p className="text-xs sm:text-sm text-gray-600">Direct transfer to your bank account</p>
                    </div>
                  </button>

                  {/* Mobile Money Option */}
                  <button
                    onClick={() => handleMethodSelect('mobile_money')}
                    className="w-full flex items-center space-x-3 sm:space-x-4 p-3 sm:p-4 border border-gray-300 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors text-left"
                  >
                    <div className="bg-purple-100 p-2 sm:p-3 rounded-lg">
                      <Smartphone className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h5 className="text-sm sm:text-base font-medium text-gray-900">Mobile Money</h5>
                      <p className="text-xs sm:text-sm text-gray-600">Instant transfer to your mobile wallet</p>
                    </div>
                  </button>
                </div>
              ) : selectedMethod === 'mobile_money' ? (
                <div className="space-y-4 sm:space-y-6">
                  {/* Back Button */}
                  <button
                    onClick={() => handleMethodSelect('')}
                    className="flex items-center text-gray-600 hover:text-gray-700 text-xs sm:text-sm font-medium"
                  >
                    <X className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    Back to Methods
                  </button>

                  {/* Mobile Money Agents */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2 sm:mb-3">Select Mobile Money Agent</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                      {mobileMoneyAgents.map((agent) => (
                        <button
                          key={agent.id}
                          onClick={() => handleAgentSelect(agent.id)}
                          className={`p-2 sm:p-3 border rounded-lg text-center transition-colors min-h-[80px] sm:min-h-[90px] ${
                            selectedAgent === agent.id
                              ? 'border-primary-500 bg-primary-50'
                              : 'border-gray-300 hover:border-primary-300'
                          }`}
                        >
                          <div className="text-xl sm:text-2xl mb-1 sm:mb-2">{agent.icon}</div>
                          <span className="text-xs sm:text-sm font-medium text-gray-900">{agent.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Phone Number Input */}
                  {selectedAgent && (
                    <div className="space-y-3 sm:space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                          Enter your {mobileMoneyAgents.find(a => a.id === selectedAgent)?.name} number
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <input
                            type="tel"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            placeholder="+255 XXX XXX XXX"
                            className="w-full pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm sm:text-base"
                          />
                        </div>
                      </div>

                      {/* Amount Input */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                          Withdrawal Amount (Tsh)
                        </label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                          <input
                            type="number"
                            value={withdrawAmount}
                            onChange={(e) => setWithdrawAmount(e.target.value)}
                            placeholder="0"
                            className="w-full pl-10 pr-4 py-2 sm:py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm sm:text-base"
                            min="0"
                            max="8120000"
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Available: Tsh 8,120,000
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                // Bank Transfer Content
                <div className="space-y-4 sm:space-y-6">
                  <button
                    onClick={() => handleMethodSelect('')}
                    className="flex items-center text-gray-600 hover:text-gray-700 text-xs sm:text-sm font-medium"
                  >
                    <X className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    Back to Methods
                  </button>
                  
                  <div className="text-center py-4 sm:py-6">
                    <Building className="h-12 w-12 sm:h-14 sm:w-14 text-gray-400 mx-auto mb-3 sm:mb-4" />
                    <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">Bank Transfer</h4>
                    <p className="text-sm text-gray-600 bg-yellow-50 border border-yellow-200 rounded-lg p-3 sm:p-4">
                      Currently unavailable, will come soon
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="flex border-t border-gray-200 p-4 sm:p-6 sticky bottom-0 bg-white">
              <button
                onClick={closeModal}
                className="flex-1 bg-gray-100 text-gray-700 py-2 sm:py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors mr-2 sm:mr-3 text-sm sm:text-base"
              >
                Cancel
              </button>
              
              {selectedMethod === 'mobile_money' && selectedAgent && phoneNumber && withdrawAmount ? (
                <button
                  onClick={handleWithdrawSubmit}
                  className="flex-1 bg-primary-500 text-white py-2 sm:py-3 rounded-lg font-medium hover:bg-primary-600 transition-colors flex items-center justify-center space-x-1 sm:space-x-2 text-sm sm:text-base"
                >
                  <Download className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span>Withdraw</span>
                </button>
              ) : selectedMethod === 'bank_transfer' ? (
                <button
                  disabled
                  className="flex-1 bg-gray-300 text-gray-500 py-2 sm:py-3 rounded-lg font-medium cursor-not-allowed text-sm sm:text-base"
                >
                  Unavailable
                </button>
              ) : (
                <button
                  disabled
                  className="flex-1 bg-gray-300 text-gray-500 py-2 sm:py-3 rounded-lg font-medium cursor-not-allowed text-sm sm:text-base"
                >
                  Continue
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Payout Details Modal - Responsive */}
      {showDetailsModal && selectedPayout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-xs sm:max-w-sm mx-auto animate-fade-in max-h-[85vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 sticky top-0 bg-white">
              <div className="flex items-center">
                <div className="bg-primary-100 p-2 rounded-lg mr-3">
                  <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">Payout Details</h3>
                  <p className="text-xs sm:text-sm text-gray-600">Transaction information</p>
                </div>
              </div>
              <button
                onClick={closeDetailsModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>

            {/* Details Content */}
            <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-500">Payout ID</p>
                  <p className="text-xs sm:text-sm font-semibold text-gray-900">{selectedPayout.id}</p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-500">Order ID</p>
                  <p className="text-xs sm:text-sm font-semibold text-gray-900">{selectedPayout.orderId}</p>
                </div>
              </div>

              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-500">Product</p>
                <p className="text-sm sm:text-base font-semibold text-gray-900">{selectedPayout.product}</p>
              </div>

              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-500">Amount</p>
                <p className="text-base sm:text-lg font-bold text-primary-600">{formatCurrency(selectedPayout.amount)}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-500">Method</p>
                  <div className="flex items-center space-x-1 sm:space-x-2 mt-1">
                    {selectedPayout.method === 'bank_transfer' ? (
                      <Building className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />
                    ) : (
                      <Smartphone className="h-3 w-3 sm:h-4 sm:w-4 text-purple-500" />
                    )}
                    <span className="text-xs sm:text-sm font-semibold text-gray-900">
                      {methodConfig[selectedPayout.method].label}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-500">Status</p>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig[selectedPayout.status].color}`}>
                    {statusConfig[selectedPayout.status].label}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-500">Date</p>
                <div className="flex items-center space-x-1 sm:space-x-2 mt-1">
                  <CalendarIcon className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                  <p className="text-xs sm:text-sm font-semibold text-gray-900">
                    {new Date(selectedPayout.date).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                <p className="text-xs sm:text-sm font-medium text-gray-500 mb-1 sm:mb-2">
                  {selectedPayout.method === 'bank_transfer' ? 'Bank Details' : 'Provider Details'}
                </p>
                {selectedPayout.method === 'bank_transfer' ? (
                  <div className="space-y-1">
                    <p className="text-xs sm:text-sm font-semibold text-gray-900">{selectedPayout.bankName}</p>
                    <p className="text-xs sm:text-sm text-gray-600">Account: {selectedPayout.accountNumber}</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <p className="text-xs sm:text-sm font-semibold text-gray-900">{selectedPayout.provider}</p>
                    <p className="text-xs sm:text-sm text-gray-600">Phone: {selectedPayout.phoneNumber}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="flex border-t border-gray-200 p-4 sm:p-6 sticky bottom-0 bg-white">
              <button
                onClick={closeDetailsModal}
                className="flex-1 bg-primary-500 text-white py-2 sm:py-3 rounded-lg font-medium hover:bg-primary-600 transition-colors text-sm sm:text-base"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </StableLayout>
  );
};

export default PayoutsPage;