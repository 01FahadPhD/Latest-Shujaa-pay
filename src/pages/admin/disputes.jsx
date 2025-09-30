import React, { useState } from 'react';
import StableLayout from '../../components/common/layout/StableLayout';
import { 
  AlertCircle, 
  Clock, 
  CheckCircle, 
  MessageCircle,
  Eye,
  Upload,
  FileText,
  User,
  ShoppingCart,
  DollarSign,
  Calendar,
  X,
  MoreVertical,
  Download,
  Filter,
  Search,
  ChevronDown,
  Shield,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
  Zap
} from 'lucide-react';

const AdminDisputesPage = () => {
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  // KPI Stats Data
  const kpiStats = [
    {
      title: 'Total Disputes',
      value: '156',
      icon: AlertCircle,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      description: 'All-time disputes'
    },
    {
      title: 'Open Disputes',
      value: '23',
      icon: Clock,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50',
      description: 'Requiring action'
    },
    {
      title: 'In Review',
      value: '18',
      icon: MessageCircle,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50',
      description: 'Under investigation'
    },
    {
      title: 'Awaiting Evidence',
      value: '12',
      icon: FileText,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-50',
      description: 'Pending documentation'
    },
    {
      title: 'Resolved',
      value: '98',
      icon: CheckCircle,
      color: 'text-green-500',
      bgColor: 'bg-green-50',
      description: 'Successfully closed'
    },
    {
      title: 'Escalated',
      value: '5',
      icon: AlertTriangle,
      color: 'text-red-500',
      bgColor: 'bg-red-50',
      description: 'Requires senior review'
    }
  ];

  // Mock disputes data
  const disputesData = [
    {
      id: 'DSP-2301',
      orderId: 'ORD-7842',
      buyer: {
        name: 'John Mwita',
        id: 'BUY-7842',
        phone: '+255 789 456 123'
      },
      seller: {
        name: 'Tech Gadgets Ltd',
        id: 'SEL-4512',
        phone: '+255 712 345 678'
      },
      product: 'iPhone 15 Pro',
      amount: 2450000,
      status: 'open',
      reason: 'Product not delivered',
      createdAt: '2024-01-15',
      updatedAt: '2024-01-16',
      evidence: [],
      adminNotes: [],
      timeline: [
        {
          action: 'Dispute opened by buyer',
          date: '2024-01-15 14:30',
          user: 'John Mwita',
          type: 'buyer'
        }
      ]
    },
    {
      id: 'DSP-2302',
      orderId: 'ORD-7841',
      buyer: {
        name: 'Sarah Johnson',
        id: 'BUY-6321',
        phone: '+255 712 345 678'
      },
      seller: {
        name: 'Electro World',
        id: 'SEL-8934',
        phone: '+255 754 123 456'
      },
      product: 'MacBook Air M2',
      amount: 3250000,
      status: 'in_review',
      reason: 'Wrong product received',
      createdAt: '2024-01-14',
      updatedAt: '2024-01-15',
      evidence: [
        { type: 'image', name: 'wrong_product.jpg', date: '2024-01-14', uploadedBy: 'buyer' }
      ],
      adminNotes: [
        { note: 'Buyer provided photo evidence', date: '2024-01-15 09:00', admin: 'Admin User' }
      ],
      timeline: [
        {
          action: 'Dispute opened by buyer',
          date: '2024-01-14 10:15',
          user: 'Sarah Johnson',
          type: 'buyer'
        },
        {
          action: 'Evidence submitted by buyer',
          date: '2024-01-14 10:20',
          user: 'Sarah Johnson',
          type: 'buyer'
        },
        {
          action: 'Under review by admin',
          date: '2024-01-15 09:00',
          user: 'Admin User',
          type: 'admin'
        }
      ]
    },
    {
      id: 'DSP-2303',
      orderId: 'ORD-7839',
      buyer: {
        name: 'Grace Mushi',
        id: 'BUY-4512',
        phone: '+255 768 123 456'
      },
      seller: {
        name: 'Fashion Hub',
        id: 'SEL-6321',
        phone: '+255 745 789 123'
      },
      product: 'iPad Air',
      amount: 1850000,
      status: 'awaiting_evidence',
      reason: 'Product damaged on arrival',
      createdAt: '2024-01-13',
      updatedAt: '2024-01-14',
      evidence: [],
      adminNotes: [],
      timeline: [
        {
          action: 'Dispute opened by buyer',
          date: '2024-01-13 16:45',
          user: 'Grace Mushi',
          type: 'buyer'
        },
        {
          action: 'Awaiting evidence from buyer',
          date: '2024-01-14 08:30',
          user: 'Admin User',
          type: 'admin'
        }
      ]
    },
    {
      id: 'DSP-2304',
      orderId: 'ORD-7837',
      buyer: {
        name: 'Lisa Johnson',
        id: 'BUY-8934',
        phone: '+255 745 321 654'
      },
      seller: {
        name: 'Home Essentials',
        id: 'SEL-7841',
        phone: '+255 712 987 654'
      },
      product: 'Samsung Galaxy S24',
      amount: 2150000,
      status: 'resolved',
      reason: 'Payment issue',
      createdAt: '2024-01-10',
      updatedAt: '2024-01-12',
      evidence: [
        { type: 'document', name: 'payment_proof.pdf', date: '2024-01-11', uploadedBy: 'buyer' }
      ],
      adminNotes: [
        { note: 'Payment verified, funds released to seller', date: '2024-01-12 10:00', admin: 'Admin User' }
      ],
      resolution: 'Funds released to seller - buyer confirmed receipt',
      timeline: [
        {
          action: 'Dispute opened by buyer',
          date: '2024-01-10 11:20',
          user: 'Lisa Johnson',
          type: 'buyer'
        },
        {
          action: 'Evidence submitted',
          date: '2024-01-11 14:15',
          user: 'Lisa Johnson',
          type: 'buyer'
        },
        {
          action: 'Dispute resolved in favor of seller',
          date: '2024-01-12 10:00',
          user: 'Admin User',
          type: 'admin'
        }
      ]
    },
    {
      id: 'DSP-2305',
      orderId: 'ORD-7835',
      buyer: {
        name: 'David Smith',
        id: 'BUY-5678',
        phone: '+255 714 567 890'
      },
      seller: {
        name: 'Tech Gadgets Ltd',
        id: 'SEL-4512',
        phone: '+255 712 345 678'
      },
      product: 'AirPods Pro',
      amount: 850000,
      status: 'escalated',
      reason: 'Counterfeit product',
      createdAt: '2024-01-09',
      updatedAt: '2024-01-11',
      evidence: [
        { type: 'image', name: 'product_authenticity.jpg', date: '2024-01-10', uploadedBy: 'buyer' }
      ],
      adminNotes: [
        { note: 'Product authenticity in question, escalated to senior admin', date: '2024-01-11 15:30', admin: 'Admin User' }
      ],
      timeline: [
        {
          action: 'Dispute opened by buyer',
          date: '2024-01-09 13:20',
          user: 'David Smith',
          type: 'buyer'
        },
        {
          action: 'Evidence submitted by buyer',
          date: '2024-01-10 09:45',
          user: 'David Smith',
          type: 'buyer'
        },
        {
          action: 'Dispute escalated to senior admin',
          date: '2024-01-11 15:30',
          user: 'Admin User',
          type: 'admin'
        }
      ]
    }
  ];

  // Status configuration
  const statusConfig = {
    open: { label: 'Open', color: 'bg-orange-100 text-orange-800', icon: Clock },
    in_review: { label: 'In Review', color: 'bg-blue-100 text-blue-800', icon: MessageCircle },
    awaiting_evidence: { label: 'Awaiting Evidence', color: 'bg-yellow-100 text-yellow-800', icon: FileText },
    resolved: { label: 'Resolved', color: 'bg-green-100 text-green-800', icon: CheckCircle },
    escalated: { label: 'Escalated', color: 'bg-red-100 text-red-800', icon: AlertTriangle }
  };

  // Format currency in Tsh
  const formatCurrency = (amount) => {
    return `Tsh ${amount.toLocaleString()}`;
  };

  // Filter disputes based on search and filters
  const filteredDisputes = disputesData.filter(dispute => {
    const matchesSearch = 
      dispute.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dispute.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dispute.buyer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dispute.seller.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dispute.product.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || dispute.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleViewDispute = (dispute) => {
    setSelectedDispute(dispute);
    setShowDisputeModal(true);
  };

  const handleCloseModal = () => {
    setShowDisputeModal(false);
    setSelectedDispute(null);
  };

  const handleApprove = (dispute) => {
    // TODO: Implement approve logic
    console.log('Approving dispute:', dispute.id);
    alert(`Dispute ${dispute.id} approved!`);
  };

  const handleReject = (dispute) => {
    // TODO: Implement reject logic
    console.log('Rejecting dispute:', dispute.id);
    alert(`Dispute ${dispute.id} rejected!`);
  };

  const handleEscalate = (dispute) => {
    // TODO: Implement escalate logic
    console.log('Escalating dispute:', dispute.id);
    alert(`Dispute ${dispute.id} escalated to senior admin!`);
  };

  const handleExportDisputes = () => {
    // TODO: Implement export logic
    console.log('Exporting disputes data');
    alert('Disputes data exported successfully!');
  };

  return (
    <StableLayout role="admin" activeItem="disputes-management">
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-3">Disputes Management</h1>
                <p className="text-lg text-gray-600 max-w-3xl">
                  Monitor and resolve buyer-seller disputes with comprehensive admin tools and insights.
                </p>
              </div>
              <button
                onClick={handleExportDisputes}
                className="mt-4 lg:mt-0 flex items-center space-x-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                <Download className="h-4 w-4" />
                <span>Export Disputes</span>
              </button>
            </div>
          </div>

          {/* KPI Stats Grid - 3 per row on desktop, 2 per row on mobile */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {kpiStats.map((stat, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                    <p className={`text-2xl font-bold ${stat.color} mb-2`}>
                      {stat.value}
                    </p>
                    <p className="text-xs text-gray-500">{stat.description}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
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
                    placeholder="Search by Dispute ID, Order ID, Buyer, Seller, Product..."
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
                    <option value="open">Open</option>
                    <option value="in_review">In Review</option>
                    <option value="awaiting_evidence">Awaiting Evidence</option>
                    <option value="resolved">Resolved</option>
                    <option value="escalated">Escalated</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>

                {/* Date Filter */}
                <div className="relative">
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="appearance-none bg-white border border-gray-300 rounded-lg pl-3 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                  >
                    <option value="all">All Dates</option>
                    <option value="today">Today</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="custom">Custom Range</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Disputes Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-xl font-semibold text-gray-900">All Disputes</h2>
                <span className="text-sm text-gray-500 mt-2 sm:mt-0">
                  {filteredDisputes.length} dispute(s) found
                </span>
              </div>
            </div>

            {/* Desktop Table */}
            <div className="hidden lg:block">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dispute & Order ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Buyer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seller</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product & Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status & Last Updated</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredDisputes.map((dispute) => {
                    const StatusIcon = statusConfig[dispute.status].icon;
                    return (
                      <tr key={dispute.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-1">
                            <div className="flex items-center">
                              <AlertCircle className="h-4 w-4 text-orange-500 mr-2" />
                              <span className="text-sm font-medium text-gray-900">{dispute.id}</span>
                            </div>
                            <div className="text-xs text-gray-500 pl-6">
                              Order: {dispute.orderId}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div>
                            <div className="font-medium">{dispute.buyer.name}</div>
                            <div className="text-gray-500 text-xs">{dispute.buyer.id}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div>
                            <div className="font-medium">{dispute.seller.name}</div>
                            <div className="text-gray-500 text-xs">{dispute.seller.id}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-1">
                            <div className="text-sm font-medium text-gray-900">
                              {dispute.product}
                            </div>
                            <div className="text-sm font-semibold text-primary-600">
                              {formatCurrency(dispute.amount)}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="space-y-1">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusConfig[dispute.status].color}`}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {statusConfig[dispute.status].label}
                            </span>
                            <div className="text-xs text-gray-500">
                              {new Date(dispute.updatedAt).toLocaleDateString('en-US', { 
                                month: 'short', 
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleViewDispute(dispute)}
                            className="text-primary-600 hover:text-primary-900 flex items-center space-x-2 bg-primary-50 hover:bg-primary-100 px-3 py-2 rounded-lg transition-colors"
                          >
                            <Eye className="h-4 w-4" />
                            <span>View More</span>
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
              {filteredDisputes.map((dispute) => {
                const StatusIcon = statusConfig[dispute.status].icon;
                return (
                  <div key={dispute.id} className="p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center">
                        <AlertCircle className="h-4 w-4 text-orange-500 mr-2" />
                        <div>
                          <div className="font-medium text-gray-900">{dispute.id}</div>
                          <div className="text-sm text-gray-500">Order: {dispute.orderId}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig[dispute.status].color}`}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusConfig[dispute.status].label}
                        </span>
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(dispute.updatedAt).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric'
                          })}
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <div className="text-gray-500">Buyer</div>
                        <div className="font-medium text-gray-900 text-right">
                          <div>{dispute.buyer.name}</div>
                          <div className="text-gray-500 text-xs">{dispute.buyer.id}</div>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <div className="text-gray-500">Seller</div>
                        <div className="font-medium text-gray-900 text-right">
                          <div>{dispute.seller.name}</div>
                          <div className="text-gray-500 text-xs">{dispute.seller.id}</div>
                        </div>
                      </div>
                      <div className="flex justify-between">
                        <div className="text-gray-500">Product</div>
                        <div className="font-medium text-gray-900">{dispute.product}</div>
                      </div>
                      <div className="flex justify-between">
                        <div className="text-gray-500">Amount</div>
                        <div className="font-medium text-gray-900">{formatCurrency(dispute.amount)}</div>
                      </div>
                      <div className="pt-2">
                        <button
                          onClick={() => handleViewDispute(dispute)}
                          className="w-full flex items-center justify-center space-x-2 bg-primary-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-600 transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                          <span>View More Details</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Empty State */}
            {filteredDisputes.length === 0 && (
              <div className="text-center py-12">
                <CheckCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No disputes found matching your criteria</p>
                <p className="text-gray-400 text-sm mt-1">Try adjusting your search or filters</p>
              </div>
            )}
          </div>

          {/* Admin Tips Section */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Admin Dispute Resolution Tips
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-blue-800">
              <div className="flex items-start">
                <FileText className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                <span>Review all evidence thoroughly before making decisions</span>
              </div>
              <div className="flex items-start">
                <MessageCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                <span>Maintain impartiality and follow platform policies</span>
              </div>
              <div className="flex items-start">
                <Clock className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                <span>Aim to resolve disputes within 48 hours when possible</span>
              </div>
              <div className="flex items-start">
                <AlertTriangle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                <span>Escalate complex cases to senior admins promptly</span>
              </div>
              <div className="flex items-start">
                <User className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                <span>Document all actions and decisions in admin notes</span>
              </div>
              <div className="flex items-start">
                <DollarSign className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                <span>Ensure fair outcomes for both buyers and sellers</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dispute Details Modal */}
      {showDisputeModal && selectedDispute && (
        <DisputeModal 
          dispute={selectedDispute}
          onClose={handleCloseModal}
          onApprove={handleApprove}
          onReject={handleReject}
          onEscalate={handleEscalate}
          formatCurrency={formatCurrency}
          statusConfig={statusConfig}
        />
      )}
    </StableLayout>
  );
};

// Dispute Modal Component
const DisputeModal = ({ dispute, onClose, onApprove, onReject, onEscalate, formatCurrency, statusConfig }) => {
  const [adminNote, setAdminNote] = useState('');
  const [showAddNote, setShowAddNote] = useState(false);

  const handleAddNote = () => {
    if (!adminNote.trim()) {
      alert('Please enter a note');
      return;
    }
    
    // TODO: Implement add note logic
    console.log('Adding admin note:', adminNote);
    alert('Note added successfully!');
    setAdminNote('');
    setShowAddNote(false);
  };

  const handleStatusChange = (newStatus) => {
    // TODO: Implement status change logic
    console.log('Changing status to:', newStatus);
    alert(`Status changed to ${newStatus}`);
  };

  const handleUploadAdminEvidence = () => {
    // TODO: Implement admin evidence upload
    console.log('Uploading admin evidence for:', dispute.id);
    alert('Admin evidence upload functionality would go here');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <AlertCircle className="h-6 w-6 text-orange-500" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Dispute Details - {dispute.id}</h2>
              <p className="text-sm text-gray-600">Order: {dispute.orderId}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Column - Transaction & Actions */}
            <div className="lg:col-span-1 space-y-6">
              {/* Transaction Details */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Transaction Details</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <span className="text-gray-600">Order ID:</span>
                    <span className="font-medium ml-2">{dispute.orderId}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-medium ml-2">{formatCurrency(dispute.amount)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Buyer:</span>
                    <span className="font-medium ml-2">{dispute.buyer.name} ({dispute.buyer.id})</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Seller:</span>
                    <span className="font-medium ml-2">{dispute.seller.name} ({dispute.seller.id})</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Product:</span>
                    <span className="font-medium ml-2">{dispute.product}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Created:</span>
                    <span className="font-medium ml-2">
                      {new Date(dispute.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Dispute Reason */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-orange-900 mb-2">Dispute Reason</h3>
                <p className="text-orange-800">{dispute.reason}</p>
              </div>

              {/* Resolution (if available) */}
              {dispute.resolution && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-green-900 mb-2">Resolution</h3>
                  <p className="text-green-800">{dispute.resolution}</p>
                </div>
              )}

              {/* Admin Actions */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-gray-900">Admin Actions</h3>
                
                {/* Status Change */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">Change Status</label>
                  <select
                    defaultValue={dispute.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="open">Open</option>
                    <option value="in_review">In Review</option>
                    <option value="awaiting_evidence">Awaiting Evidence</option>
                    <option value="resolved">Resolved</option>
                    <option value="escalated">Escalated</option>
                  </select>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onApprove(dispute)}
                    className="flex items-center justify-center space-x-1 bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
                  >
                    <ThumbsUp className="h-4 w-4" />
                    <span>Approve</span>
                  </button>
                  <button
                    onClick={() => onReject(dispute)}
                    className="flex items-center justify-center space-x-1 bg-red-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
                  >
                    <ThumbsDown className="h-4 w-4" />
                    <span>Reject</span>
                  </button>
                </div>

                <button
                  onClick={() => onEscalate(dispute)}
                  className="w-full flex items-center justify-center space-x-1 bg-orange-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors"
                >
                  <Zap className="h-4 w-4" />
                  <span>Escalate to Senior</span>
                </button>

                <button
                  onClick={handleUploadAdminEvidence}
                  className="w-full flex items-center justify-center space-x-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  <Upload className="h-4 w-4" />
                  <span>Upload Admin Evidence</span>
                </button>

                <button
                  onClick={() => setShowAddNote(true)}
                  className="w-full flex items-center justify-center space-x-1 bg-gray-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors"
                >
                  <FileText className="h-4 w-4" />
                  <span>Add Admin Note</span>
                </button>
              </div>
            </div>

            {/* Right Column - Evidence, Notes & Timeline */}
            <div className="lg:col-span-3 space-y-6">
              {/* Status & Quick Info */}
              <div className="flex items-center justify-between">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusConfig[dispute.status].color}`}>
                  {statusConfig[dispute.status].label}
                </span>
                <div className="text-sm text-gray-500">
                  Last updated: {new Date(dispute.updatedAt).toLocaleDateString()}
                </div>
              </div>

              {/* Add Note Form */}
              {showAddNote && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-blue-900 mb-2">Add Admin Note</h4>
                  <textarea
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    placeholder="Enter your notes about this dispute..."
                    rows={3}
                    className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                  <div className="flex space-x-2 mt-2">
                    <button
                      onClick={handleAddNote}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                      Save Note
                    </button>
                    <button
                      onClick={() => setShowAddNote(false)}
                      className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Admin Notes */}
              {dispute.adminNotes.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Admin Notes</h3>
                  <div className="space-y-3">
                    {dispute.adminNotes.map((note, index) => (
                      <div key={index} className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-sm font-medium text-yellow-900">{note.admin}</span>
                          <span className="text-xs text-yellow-700">{note.date}</span>
                        </div>
                        <p className="text-sm text-yellow-800">{note.note}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Evidence Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Evidence</h3>
                {dispute.evidence.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {dispute.evidence.map((item, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-4 w-4 text-gray-500" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{item.name}</p>
                            <p className="text-xs text-gray-500">
                              Uploaded by {item.uploadedBy} on {item.date}
                            </p>
                          </div>
                        </div>
                        <button className="text-primary-600 hover:text-primary-800 text-sm font-medium">
                          View
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No evidence submitted yet.</p>
                )}
              </div>

              {/* Timeline */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Timeline</h3>
                <div className="space-y-4">
                  {dispute.timeline.map((event, index) => (
                    <div key={index} className="flex space-x-3">
                      <div className="flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full ${
                          event.type === 'buyer' ? 'bg-blue-500' : 
                          event.type === 'admin' ? 'bg-green-500' : 'bg-gray-500'
                        }`}></div>
                        {index < dispute.timeline.length - 1 && (
                          <div className="w-0.5 h-8 bg-gray-200 mt-1"></div>
                        )}
                      </div>
                      <div className="flex-1 pb-4">
                        <p className="text-sm font-medium text-gray-900">{event.action}</p>
                        <p className="text-xs text-gray-500">{event.date}</p>
                        <p className="text-xs text-gray-600">By: {event.user}</p>
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
  );
};

export default AdminDisputesPage;