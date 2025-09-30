// pages/admin/orders.jsx
import React, { useState } from 'react';
import StableLayout from '../../components/common/layout/StableLayout';
import { 
  ShoppingCart, 
  DollarSign, 
  Search,
  Filter,
  Eye,
  MoreVertical,
  User,
  Building,
  CreditCard,
  Smartphone,
  Calendar,
  Flag,
  CheckCircle,
  X,
  Clock,
  Package,
  Ban,
  RotateCcw,
  Shield,
  AlertTriangle
} from 'lucide-react';

const OrdersManagement = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    status: '',
    paymentMethod: '',
    dateRange: 'today',
    seller: ''
  });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  // Status options with colors
  const statusOptions = [
    { value: 'waiting_payment', label: 'Waiting Payment', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'in_escrow', label: 'In Escrow', color: 'bg-purple-100 text-purple-800' },
    { value: 'delivered', label: 'Delivered', color: 'bg-green-100 text-green-800' },
    { value: 'completed', label: 'Completed', color: 'bg-blue-100 text-blue-800' },
    { value: 'canceled', label: 'Canceled', color: 'bg-red-100 text-red-800' },
    { value: 'refunded', label: 'Refunded', color: 'bg-orange-100 text-orange-800' }
  ];

  const paymentMethods = [
    'Bank Transfer',
    'M-Pesa',
    'Airtel Money',
    'Tigo Pesa',
    'Halopesa'
  ];

  const dateRanges = [
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'custom', label: 'Custom Range' }
  ];

  // KPI Stats Data
  const kpiStats = [
    {
      title: 'Total Orders',
      value: '1,248',
      icon: ShoppingCart,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'In Escrow',
      value: '156',
      icon: Shield,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Delivered',
      value: '892',
      icon: Package,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Completed',
      value: '784',
      icon: CheckCircle,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Refunded',
      value: '47',
      icon: RotateCcw,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Suspicious',
      value: '12',
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-50'
    }
  ];

  // Mock orders data
  const ordersData = [
    {
      id: 'ORD-7842',
      sellerName: 'John Doe',
      businessName: 'Tech Gadgets Ltd',
      productName: 'iPhone 15 Pro',
      quantity: 1,
      amount: 2450000,
      paymentMethod: 'M-Pesa',
      status: 'completed',
      orderDate: '2024-01-15',
      buyerInfo: {
        name: 'Michael Brown',
        phone: '+255 713 456 789',
        email: 'michael@email.com'
      },
      timeline: [
        { action: 'Order Placed', date: '2024-01-15 10:30', status: 'completed' },
        { action: 'Payment Received', date: '2024-01-15 10:35', status: 'completed' },
        { action: 'Product Shipped', date: '2024-01-16 09:15', status: 'completed' },
        { action: 'Delivered', date: '2024-01-18 14:20', status: 'completed' }
      ],
      isSuspicious: false
    },
    {
      id: 'ORD-7841',
      sellerName: 'Jane Smith',
      businessName: 'Fashion Hub',
      productName: 'Designer Handbag',
      quantity: 1,
      amount: 850000,
      paymentMethod: 'Bank Transfer',
      status: 'in_escrow',
      orderDate: '2024-01-14',
      buyerInfo: {
        name: 'Sarah Johnson',
        phone: '+255 714 567 890',
        email: 'sarah@email.com'
      },
      timeline: [
        { action: 'Order Placed', date: '2024-01-14 16:45', status: 'completed' },
        { action: 'Payment Received', date: '2024-01-14 16:50', status: 'completed' },
        { action: 'In Escrow', date: '2024-01-14 17:00', status: 'current' }
      ],
      isSuspicious: false
    },
    {
      id: 'ORD-7840',
      sellerName: 'David Wilson',
      businessName: 'Electro Store',
      productName: 'Samsung TV 55"',
      quantity: 1,
      amount: 1850000,
      paymentMethod: 'Airtel Money',
      status: 'waiting_payment',
      orderDate: '2024-01-13',
      buyerInfo: {
        name: 'Robert Taylor',
        phone: '+255 715 678 901',
        email: 'robert@email.com'
      },
      timeline: [
        { action: 'Order Placed', date: '2024-01-13 11:20', status: 'completed' },
        { action: 'Waiting Payment', date: '2024-01-13 11:20', status: 'current' }
      ],
      isSuspicious: false
    },
    {
      id: 'ORD-7839',
      sellerName: 'Grace Mwamba',
      businessName: 'Artisan Crafts',
      productName: 'Handmade Jewelry Set',
      quantity: 2,
      amount: 450000,
      paymentMethod: 'Tigo Pesa',
      status: 'delivered',
      orderDate: '2024-01-12',
      buyerInfo: {
        name: 'Lisa White',
        phone: '+255 716 789 012',
        email: 'lisa@email.com'
      },
      timeline: [
        { action: 'Order Placed', date: '2024-01-12 08:15', status: 'completed' },
        { action: 'Payment Received', date: '2024-01-12 08:20', status: 'completed' },
        { action: 'Product Shipped', date: '2024-01-12 14:30', status: 'completed' },
        { action: 'Delivered', date: '2024-01-14 10:45', status: 'completed' }
      ],
      isSuspicious: true
    },
    {
      id: 'ORD-7838',
      sellerName: 'Mike Johnson',
      businessName: 'Home Comforts',
      productName: 'Office Chair',
      quantity: 1,
      amount: 320000,
      paymentMethod: 'Halopesa',
      status: 'canceled',
      orderDate: '2024-01-11',
      buyerInfo: {
        name: 'James Wilson',
        phone: '+255 717 890 123',
        email: 'james@email.com'
      },
      timeline: [
        { action: 'Order Placed', date: '2024-01-11 13:40', status: 'completed' },
        { action: 'Canceled', date: '2024-01-11 14:15', status: 'completed' }
      ],
      isSuspicious: false
    },
    {
      id: 'ORD-7837',
      sellerName: 'Sarah Williams',
      businessName: 'Beauty Palace',
      productName: 'Skincare Bundle',
      quantity: 1,
      amount: 280000,
      paymentMethod: 'M-Pesa',
      status: 'refunded',
      orderDate: '2024-01-10',
      buyerInfo: {
        name: 'Emma Davis',
        phone: '+255 718 901 234',
        email: 'emma@email.com'
      },
      timeline: [
        { action: 'Order Placed', date: '2024-01-10 09:30', status: 'completed' },
        { action: 'Payment Received', date: '2024-01-10 09:35', status: 'completed' },
        { action: 'Refunded', date: '2024-01-12 16:20', status: 'completed' }
      ],
      isSuspicious: false
    }
  ];

  // Filter orders based on search and filters
  const filteredOrders = ordersData.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.sellerName.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = !filters.status || order.status === filters.status;
    const matchesPaymentMethod = !filters.paymentMethod || order.paymentMethod === filters.paymentMethod;
    
    return matchesSearch && matchesStatus && matchesPaymentMethod;
  });

  const handleViewOrder = (order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const handleReportSuspicious = (orderId) => {
    console.log('Report suspicious order:', orderId);
    // Implement report logic
  };

  const handleActivateOrder = (orderId) => {
    console.log('Activate order:', orderId);
    // Implement activate logic
  };

  const closeOrderDetails = () => {
    setShowOrderDetails(false);
    setSelectedOrder(null);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      paymentMethod: '',
      dateRange: 'today',
      seller: ''
    });
    setSearchQuery('');
  };

  const formatCurrency = (amount) => {
    return `Tsh ${amount.toLocaleString()}`;
  };

  const getStatusConfig = (status) => {
    return statusOptions.find(s => s.value === status) || statusOptions[0];
  };

  return (
    <StableLayout role="admin">
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          
          {/* KPI Metrics Grid - 3 per row on desktop, 2 per row on mobile */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
            {kpiStats.map((stat, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                    <p className={`text-lg sm:text-2xl font-bold ${stat.color} mb-2`}>
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

          {/* Search and Filters Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
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
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    placeholder="Search by Order ID, Product, or Seller..."
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Status Filter */}
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="block w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                >
                  <option value="">All Status</option>
                  {statusOptions.map(status => (
                    <option key={status.value} value={status.value}>{status.label}</option>
                  ))}
                </select>

                {/* Payment Method Filter */}
                <select
                  value={filters.paymentMethod}
                  onChange={(e) => handleFilterChange('paymentMethod', e.target.value)}
                  className="block w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                >
                  <option value="">All Payment Methods</option>
                  {paymentMethods.map(method => (
                    <option key={method} value={method}>{method}</option>
                  ))}
                </select>

                {/* Date Range Filter */}
                <select
                  value={filters.dateRange}
                  onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                  className="block w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                >
                  {dateRanges.map(range => (
                    <option key={range.value} value={range.value}>{range.label}</option>
                  ))}
                </select>

                {/* Clear Filters */}
                <button
                  onClick={clearFilters}
                  className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Desktop Table */}
            <div className="hidden lg:block">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seller</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment & Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrders.map((order) => {
                    const statusConfig = getStatusConfig(order.status);
                    return (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {order.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div>
                            <div className="font-medium">{order.sellerName}</div>
                            <div className="text-gray-500 text-xs">{order.businessName}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {order.productName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatCurrency(order.amount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              {order.paymentMethod === 'Bank Transfer' ? (
                                <CreditCard className="h-3 w-3 text-blue-500" />
                              ) : (
                                <Smartphone className="h-3 w-3 text-purple-500" />
                              )}
                              <span className="text-xs">{order.paymentMethod}</span>
                            </div>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig.color}`}>
                              {statusConfig.label}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleViewOrder(order)}
                            className="text-green-600 hover:text-green-900 flex items-center space-x-1 bg-green-50 px-3 py-1 rounded-lg transition-colors"
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
              {filteredOrders.map((order) => {
                const statusConfig = getStatusConfig(order.status);
                return (
                  <div key={order.id} className="p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <div className="font-medium text-gray-900">{order.id}</div>
                        <div className="text-sm text-gray-500">{order.productName}</div>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.color}`}>
                        {statusConfig.label}
                      </span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <div className="text-sm text-gray-500">Seller</div>
                        <div className="text-sm font-medium text-gray-900">{order.sellerName}</div>
                      </div>
                      
                      <div className="flex justify-between">
                        <div className="text-sm text-gray-500">Amount</div>
                        <div className="text-sm font-medium text-gray-900">{formatCurrency(order.amount)}</div>
                      </div>
                      
                      <div className="flex justify-between">
                        <div className="text-sm text-gray-500">Payment</div>
                        <div className="text-sm font-medium text-gray-900">{order.paymentMethod}</div>
                      </div>
                    </div>
                    
                    <div className="flex justify-end pt-3 mt-3 border-t border-gray-200">
                      <button
                        onClick={() => handleViewOrder(order)}
                        className="text-green-600 hover:text-green-900 flex items-center space-x-1 text-sm"
                      >
                        <Eye className="h-4 w-4" />
                        <span>View Details</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Empty State */}
            {filteredOrders.length === 0 && (
              <div className="text-center py-12">
                <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No orders found matching your criteria</p>
                <button
                  onClick={clearFilters}
                  className="mt-2 text-green-600 hover:text-green-700 text-sm font-medium"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl mx-auto animate-fade-in max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 sticky top-0 bg-white">
              <div className="flex items-center">
                <div className="bg-green-100 p-2 rounded-lg mr-3">
                  <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">Order Details</h3>
                  <p className="text-xs sm:text-sm text-gray-600">{selectedOrder.id}</p>
                </div>
              </div>
              <button
                onClick={closeOrderDetails}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>

            {/* Details Content */}
            <div className="p-4 sm:p-6 space-y-6">
              {/* Order Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Order Information</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Order ID</span>
                        <span className="text-sm font-semibold text-gray-900">{selectedOrder.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Product</span>
                        <span className="text-sm font-semibold text-gray-900">{selectedOrder.productName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Quantity</span>
                        <span className="text-sm font-semibold text-gray-900">{selectedOrder.quantity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Amount</span>
                        <span className="text-sm font-semibold text-green-600">{formatCurrency(selectedOrder.amount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Payment Method</span>
                        <span className="text-sm font-semibold text-gray-900">{selectedOrder.paymentMethod}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Status</span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusConfig(selectedOrder.status).color}`}>
                          {getStatusConfig(selectedOrder.status).label}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Seller Information */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Seller Information</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Name</span>
                        <span className="text-sm font-semibold text-gray-900">{selectedOrder.sellerName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Business</span>
                        <span className="text-sm font-semibold text-gray-900">{selectedOrder.businessName}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  {/* Buyer Information */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Buyer Information</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Name</span>
                        <span className="text-sm font-semibold text-gray-900">{selectedOrder.buyerInfo.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Phone</span>
                        <span className="text-sm font-semibold text-gray-900">{selectedOrder.buyerInfo.phone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-500">Email</span>
                        <span className="text-sm font-semibold text-gray-900">{selectedOrder.buyerInfo.email}</span>
                      </div>
                    </div>
                  </div>

                  {/* Order Timeline */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Order Timeline</h4>
                    <div className="space-y-2">
                      {selectedOrder.timeline.map((event, index) => (
                        <div key={index} className="flex items-start space-x-3">
                          <div className={`w-2 h-2 rounded-full mt-2 ${
                            event.status === 'current' ? 'bg-green-500' : 'bg-gray-300'
                          }`} />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">{event.action}</p>
                            <p className="text-xs text-gray-500">{event.date}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Admin Actions</h4>
                <div className="flex flex-col sm:flex-row gap-3">
                  {selectedOrder.isSuspicious ? (
                    <button
                      onClick={() => handleActivateOrder(selectedOrder.id)}
                      className="flex-1 flex items-center justify-center space-x-2 bg-green-50 text-green-700 py-2 rounded-lg hover:bg-green-100 transition-colors"
                    >
                      <CheckCircle className="h-4 w-4" />
                      <span>Activate Order</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleReportSuspicious(selectedOrder.id)}
                      className="flex-1 flex items-center justify-center space-x-2 bg-orange-50 text-orange-700 py-2 rounded-lg hover:bg-orange-100 transition-colors"
                    >
                      <Flag className="h-4 w-4" />
                      <span>Report Suspicious</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </StableLayout>
  );
};

export default OrdersManagement;