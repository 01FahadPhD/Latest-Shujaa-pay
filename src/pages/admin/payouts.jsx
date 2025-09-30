import React, { useState } from 'react';
import StableLayout from '../../components/common/layout/StableLayout';
import { 
  Search, 
  Filter,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Building,
  Smartphone,
  MoreVertical,
  Eye,
  Download,
  Calendar,
  User,
  FileText,
  X,
  ChevronDown,
  Loader,
  AlertTriangle
} from 'lucide-react';

const AdminPayoutsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [methodFilter, setMethodFilter] = useState('all');
  const [sellerFilter, setSellerFilter] = useState('');
  const [activeMenu, setActiveMenu] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedPayout, setSelectedPayout] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // KPI Stats Data
  const kpiStats = [
    {
      title: 'Total Payout Requests',
      value: '1,248',
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      description: 'All-time requests'
    },
    {
      title: 'Pending Payouts',
      value: '23',
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      description: 'Awaiting action'
    },
    {
      title: 'Completed Payouts',
      value: '1,195',
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      description: 'Successfully paid'
    },
    {
      title: 'Total Payout Volume',
      value: 'Tsh 4.2B',
      icon: DollarSign,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      description: 'All-time volume'
    }
  ];

  // Mock payouts data
  const payoutsData = [
    {
      id: 'PYT-8923',
      seller: {
        id: 'SEL-7841',
        name: 'Tech Gadgets Ltd',
        email: 'contact@techgadgets.co.tz',
        phone: '+255 712 345 678'
      },
      orderId: 'ORD-8923',
      amount: 3250000,
      method: 'bank_transfer',
      status: 'pending',
      requestedDate: '2024-01-15',
      bankName: 'CRDB Bank',
      accountNumber: '0154897654321',
      accountName: 'Tech Gadgets Ltd'
    },
    {
      id: 'PYT-8922',
      seller: {
        id: 'SEL-6321',
        name: 'Fashion Hub',
        email: 'info@fashionhub.com',
        phone: '+255 754 123 456'
      },
      orderId: 'ORD-8922',
      amount: 1850000,
      method: 'mobile_money',
      status: 'processing',
      requestedDate: '2024-01-14',
      provider: 'M-Pesa',
      phoneNumber: '+255 712 987 654'
    },
    {
      id: 'PYT-8921',
      seller: {
        id: 'SEL-4512',
        name: 'Electro World',
        email: 'sales@electroworld.tz',
        phone: '+255 768 456 123'
      },
      orderId: 'ORD-8921',
      amount: 4250000,
      method: 'bank_transfer',
      status: 'completed',
      requestedDate: '2024-01-13',
      bankName: 'NMB Bank',
      accountNumber: '2114567890123',
      accountName: 'Electro World'
    },
    {
      id: 'PYT-8920',
      seller: {
        id: 'SEL-7841',
        name: 'Tech Gadgets Ltd',
        email: 'contact@techgadgets.co.tz',
        phone: '+255 712 345 678'
      },
      orderId: 'ORD-8920',
      amount: 950000,
      method: 'mobile_money',
      status: 'failed',
      requestedDate: '2024-01-12',
      provider: 'Airtel Money',
      phoneNumber: '+255 712 345 678'
    },
    {
      id: 'PYT-8919',
      seller: {
        id: 'SEL-8934',
        name: 'Home Essentials',
        email: 'support@homeessentials.co.tz',
        phone: '+255 745 789 123'
      },
      orderId: 'ORD-8919',
      amount: 2750000,
      method: 'bank_transfer',
      status: 'rejected',
      requestedDate: '2024-01-11',
      bankName: 'CRDB Bank',
      accountNumber: '0154879632145',
      accountName: 'Home Essentials',
      rejectionReason: 'Insufficient documentation'
    },
    {
      id: 'PYT-8918',
      seller: {
        id: 'SEL-6321',
        name: 'Fashion Hub',
        email: 'info@fashionhub.com',
        phone: '+255 754 123 456'
      },
      orderId: 'ORD-8918',
      amount: 1200000,
      method: 'mobile_money',
      status: 'pending',
      requestedDate: '2024-01-10',
      provider: 'Halopesa',
      phoneNumber: '+255 754 123 456'
    }
  ];

  // Seller history data
  const sellerHistory = [
    { id: 'PYT-8823', amount: 2850000, status: 'completed', date: '2024-01-08' },
    { id: 'PYT-8721', amount: 1950000, status: 'completed', date: '2024-01-05' },
    { id: 'PYT-8619', amount: 3250000, status: 'completed', date: '2024-01-02' },
    { id: 'PYT-8517', amount: 1450000, status: 'completed', date: '2023-12-28' },
    { id: 'PYT-8415', amount: 2250000, status: 'completed', date: '2023-12-25' }
  ];

  // Fixed Status configuration with proper icons
  const statusConfig = {
    pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
    processing: { label: 'Processing', color: 'bg-blue-100 text-blue-800', icon: Loader },
    completed: { label: 'Completed', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    rejected: { label: 'Rejected', color: 'bg-red-100 text-red-800', icon: XCircle },
    failed: { label: 'Failed', color: 'bg-orange-100 text-orange-800', icon: AlertTriangle }
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

  // Filter payouts based on filters and search
  const filteredPayouts = payoutsData.filter(payout => {
    const matchesSearch = 
      payout.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payout.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payout.seller.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payout.seller.id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || payout.status === statusFilter;
    const matchesMethod = methodFilter === 'all' || payout.method === methodFilter;
    const matchesSeller = !sellerFilter || payout.seller.id === sellerFilter;

    return matchesSearch && matchesStatus && matchesMethod && matchesSeller;
  });

  // Get unique sellers for filter
  const uniqueSellers = [...new Set(payoutsData.map(p => `${p.seller.name} (${p.seller.id})`))];

  const handleViewDetails = (payout) => {
    setSelectedPayout(payout);
    setShowDetailsModal(true);
    setActiveMenu(null);
  };

  const handleApprove = (payout) => {
    // Simulate API call
    console.log('Approving payout:', payout.id);
    alert(`Payout ${payout.id} approved and marked as processing!`);
    setActiveMenu(null);
  };

  const handleReject = (payout) => {
    setSelectedPayout(payout);
    setShowRejectModal(true);
    setActiveMenu(null);
  };

  const handleMarkCompleted = (payout) => {
    // Simulate API call
    console.log('Marking payout as completed:', payout.id);
    alert(`Payout ${payout.id} marked as completed!`);
    setActiveMenu(null);
  };

  const submitRejection = () => {
    if (!rejectionReason.trim()) {
      alert('Please enter a rejection reason');
      return;
    }
    
    // Simulate API call
    console.log('Rejecting payout:', selectedPayout.id, 'Reason:', rejectionReason);
    alert(`Payout ${selectedPayout.id} rejected! Reason: ${rejectionReason}`);
    
    setShowRejectModal(false);
    setRejectionReason('');
    setSelectedPayout(null);
  };

  const closeModals = () => {
    setShowDetailsModal(false);
    setShowRejectModal(false);
    setSelectedPayout(null);
    setRejectionReason('');
  };

  const toggleMenu = (payoutId) => {
    setActiveMenu(activeMenu === payoutId ? null : payoutId);
  };

  return (
    <StableLayout role="admin" activeItem="payouts-management">
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Payouts Management</h1>
            <p className="text-gray-600">Manage and monitor seller payout requests</p>
          </div>

          {/* KPI Stats Grid - Updated for 2 per row on mobile */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {kpiStats.map((stat, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-xs lg:text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                    <p className={`text-lg lg:text-2xl font-bold ${stat.color} mb-1 lg:mb-2`}>
                      {stat.value}
                    </p>
                    <p className="text-xs lg:text-sm text-gray-500">{stat.description}</p>
                  </div>
                  <div className={`p-2 lg:p-3 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`h-4 w-4 lg:h-6 lg:w-6 ${stat.color}`} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Filters & Search Bar */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
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
                    placeholder="Search by Payout ID, Order ID, or Seller..."
                  />
                </div>
              </div>

              {/* Filter Options */}
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Status Filter */}
                <div className="relative">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="appearance-none bg-white border border-gray-300 rounded-lg pl-3 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="completed">Completed</option>
                    <option value="failed">Failed</option>
                    <option value="rejected">Rejected</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>

                {/* Method Filter */}
                <div className="relative">
                  <select
                    value={methodFilter}
                    onChange={(e) => setMethodFilter(e.target.value)}
                    className="appearance-none bg-white border border-gray-300 rounded-lg pl-3 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                  >
                    <option value="all">All Methods</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="mobile_money">Mobile Money</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>

                {/* Seller Filter */}
                <div className="relative">
                  <select
                    value={sellerFilter}
                    onChange={(e) => setSellerFilter(e.target.value)}
                    className="appearance-none bg-white border border-gray-300 rounded-lg pl-3 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                  >
                    <option value="">All Sellers</option>
                    {uniqueSellers.map((seller, index) => (
                      <option key={index} value={seller}>
                        {seller}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Payouts Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payout ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seller</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requested Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPayouts.map((payout) => {
                    const MethodIcon = methodConfig[payout.method].icon;
                    const StatusIcon = statusConfig[payout.status].icon;
                    return (
                      <tr key={payout.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                          {payout.id}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          <div>
                            <div className="font-medium">{payout.seller.name}</div>
                            <div className="text-gray-500 text-xs">{payout.seller.id}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          {payout.orderId}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatCurrency(payout.amount)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center space-x-2">
                            <MethodIcon className={`h-4 w-4 ${methodConfig[payout.method].color}`} />
                            <span>{methodConfig[payout.method].label}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig[payout.status].color}`}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusConfig[payout.status].label}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {new Date(payout.requestedDate).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                          <div className="relative">
                            <button
                              onClick={() => toggleMenu(payout.id)}
                              className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </button>
                            
                            {activeMenu === payout.id && (
                              <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-48">
                                <button
                                  onClick={() => handleViewDetails(payout)}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                                >
                                  <Eye className="h-4 w-4" />
                                  <span>View Details</span>
                                </button>
                                {payout.status === 'pending' && (
                                  <>
                                    <button
                                      onClick={() => handleApprove(payout)}
                                      className="w-full text-left px-4 py-2 text-sm text-green-700 hover:bg-green-50 flex items-center space-x-2"
                                    >
                                      <CheckCircle className="h-4 w-4" />
                                      <span>Approve</span>
                                    </button>
                                    <button
                                      onClick={() => handleReject(payout)}
                                      className="w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50 flex items-center space-x-2"
                                    >
                                      <XCircle className="h-4 w-4" />
                                      <span>Reject</span>
                                    </button>
                                  </>
                                )}
                                {payout.status === 'processing' && (
                                  <button
                                    onClick={() => handleMarkCompleted(payout)}
                                    className="w-full text-left px-4 py-2 text-sm text-blue-700 hover:bg-blue-50 flex items-center space-x-2"
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                    <span>Mark Completed</span>
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Empty State */}
            {filteredPayouts.length === 0 && (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No payouts found matching your criteria</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Payout Details Modal */}
      {showDetailsModal && selectedPayout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl mx-auto animate-fade-in max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
              <div className="flex items-center">
                <div className="bg-primary-100 p-2 rounded-lg mr-3">
                  <FileText className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Payout Details</h3>
                  <p className="text-sm text-gray-600">Complete payout information</p>
                </div>
              </div>
              <button
                onClick={closeModals}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Payout Details */}
                <div className="space-y-6">
                  {/* Basic Information */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-4">Basic Information</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-medium text-gray-500">Payout ID</p>
                        <p className="text-sm font-semibold text-gray-900">{selectedPayout.id}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500">Order ID</p>
                        <p className="text-sm font-semibold text-gray-900">{selectedPayout.orderId}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500">Amount</p>
                        <p className="text-lg font-bold text-primary-600">{formatCurrency(selectedPayout.amount)}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500">Requested Date</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {new Date(selectedPayout.requestedDate).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Seller Information */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-4">Seller Information</h4>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div className="flex items-center space-x-3">
                        <User className="h-4 w-4 text-gray-400" />
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{selectedPayout.seller.name}</p>
                          <p className="text-xs text-gray-500">{selectedPayout.seller.id}</p>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        <p>{selectedPayout.seller.email}</p>
                        <p>{selectedPayout.seller.phone}</p>
                      </div>
                    </div>
                  </div>

                  {/* Payment Method Details */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-4">Payment Method</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      {selectedPayout.method === 'bank_transfer' ? (
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Building className="h-4 w-4 text-blue-500" />
                            <span className="text-sm font-semibold text-gray-900">Bank Transfer</span>
                          </div>
                          <div className="text-sm text-gray-600">
                            <p>{selectedPayout.bankName}</p>
                            <p>Account: {selectedPayout.accountNumber}</p>
                            <p>Name: {selectedPayout.accountName}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Smartphone className="h-4 w-4 text-purple-500" />
                            <span className="text-sm font-semibold text-gray-900">Mobile Money</span>
                          </div>
                          <div className="text-sm text-gray-600">
                            <p>{selectedPayout.provider}</p>
                            <p>Phone: {selectedPayout.phoneNumber}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column - Actions & History */}
                <div className="space-y-6">
                  {/* Status & Actions */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-4">Status & Actions</h4>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                      <div>
                        <p className="text-xs font-medium text-gray-500 mb-2">Current Status</p>
                        {/* Fixed StatusIcon usage */}
                        {(() => {
                          const StatusIcon = statusConfig[selectedPayout.status].icon;
                          return (
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusConfig[selectedPayout.status].color}`}>
                              <StatusIcon className="h-4 w-4 mr-1" />
                              {statusConfig[selectedPayout.status].label}
                            </span>
                          );
                        })()}
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-2">
                        {selectedPayout.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(selectedPayout)}
                              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(selectedPayout)}
                              className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {selectedPayout.status === 'processing' && (
                          <button
                            onClick={() => handleMarkCompleted(selectedPayout)}
                            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                          >
                            Mark Completed
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Seller Payout History */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-4">Recent Payout History</h4>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="space-y-3">
                        {sellerHistory.map((history) => (
                          <div key={history.id} className="flex justify-between items-center py-2 border-b border-gray-200 last:border-b-0">
                            <div>
                              <p className="text-sm font-medium text-gray-900">{history.id}</p>
                              <p className="text-xs text-gray-500">
                                {new Date(history.date).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-semibold text-gray-900">{formatCurrency(history.amount)}</p>
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Completed
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {showRejectModal && selectedPayout && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md mx-auto animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center">
                <div className="bg-red-100 p-2 rounded-lg mr-3">
                  <XCircle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Reject Payout</h3>
                  <p className="text-sm text-gray-600">Provide reason for rejection</p>
                </div>
              </div>
              <button
                onClick={closeModals}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  Rejecting payout <strong>{selectedPayout.id}</strong> for {selectedPayout.seller.name}
                </p>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rejection Reason *
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Enter the reason for rejecting this payout request..."
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex border-t border-gray-200 p-6">
              <button
                onClick={closeModals}
                className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors mr-3"
              >
                Cancel
              </button>
              <button
                onClick={submitRejection}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
              >
                Reject Payout
              </button>
            </div>
          </div>
        </div>
      )}
    </StableLayout>
  );
};

export default AdminPayoutsPage;