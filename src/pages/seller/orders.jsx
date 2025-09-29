import React, { useState } from 'react';
import StableLayout from '../../components/common/layout/StableLayout';
import { 
  Search, 
  Calendar,
  ShoppingCart,
  DollarSign,
  Clock,
  Shield,
  Eye,
  X,
  User,
  Phone,
  MapPin,
  Truck,
  Upload,
  CheckCircle
} from 'lucide-react';

const OrdersPage = () => {
  const [dateFilter, setDateFilter] = useState('today');
  const [searchQuery, setSearchQuery] = useState('');
  const [customDateRange, setCustomDateRange] = useState({ start: '', end: '' });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showDeliveryForm, setShowDeliveryForm] = useState(false);
  const [deliveryData, setDeliveryData] = useState({
    destination: '',
    estimatedArrival: '',
    deliveryCompany: '',
    deliveryReceipt: null
  });

  // Updated KPI Stats Data - 4 boxes with money figures
  const kpiStats = [
    {
      title: 'Total Orders',
      value: '1,247',
      icon: ShoppingCart,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Total Sales',
      value: 'Tsh 29,690,000',
      icon: DollarSign,
      color: 'text-green-500',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Waiting Payment',
      value: 'Tsh 3,450,000',
      icon: Clock,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'In Escrow',
      value: 'Tsh 8,120,000',
      icon: Shield,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50'
    }
  ];

  // Mock orders data with 5-stage workflow
  const [ordersData, setOrdersData] = useState([
    {
      id: 'ORD-7842',
      product: 'iPhone 15 Pro',
      buyer: 'John Mwita',
      price: 2450000,
      status: 'waiting_payment',
      date: '2024-01-15',
      buyerPhone: '+255 789 456 123',
      buyerEmail: 'john.mwita@email.com',
      shippingAddress: '123 Main Street, Dar es Salaam'
    },
    {
      id: 'ORD-7841',
      product: 'MacBook Air M2',
      buyer: 'Sarah Johnson',
      price: 3250000,
      status: 'in_escrow',
      date: '2024-01-14',
      buyerPhone: '+255 712 345 678',
      buyerEmail: 'sarah.j@email.com',
      shippingAddress: '456 City Center, Arusha'
    },
    {
      id: 'ORD-7840',
      product: 'AirPods Pro',
      buyer: 'David Kim',
      price: 850000,
      status: 'delivered',
      date: '2024-01-13',
      buyerPhone: '+255 754 987 321',
      buyerEmail: 'david.kim@email.com',
      shippingAddress: '789 Hillside, Mwanza'
    },
    {
      id: 'ORD-7839',
      product: 'iPad Air',
      buyer: 'Grace Mushi',
      price: 1850000,
      status: 'completed',
      date: '2024-01-12',
      buyerPhone: '+255 768 123 456',
      buyerEmail: 'grace.mushi@email.com',
      shippingAddress: '321 Beach Road, Zanzibar'
    },
    {
      id: 'ORD-7838',
      product: 'Apple Watch',
      buyer: 'Michael Brown',
      price: 950000,
      status: 'canceled',
      date: '2024-01-11',
      buyerPhone: '+255 719 654 987',
      buyerEmail: 'michael.b@email.com',
      shippingAddress: '654 Market Street, Dodoma'
    },
    {
      id: 'ORD-7837',
      product: 'Samsung Galaxy S24',
      buyer: 'Lisa Johnson',
      price: 2150000,
      status: 'waiting_payment',
      date: '2024-01-10',
      buyerPhone: '+255 745 321 654',
      buyerEmail: 'lisa.j@email.com',
      shippingAddress: '987 Business District, Mbeya'
    }
  ]);

  // Status configuration
  const statusConfig = {
    waiting_payment: { label: 'Waiting Payment', color: 'bg-orange-100 text-orange-800' },
    in_escrow: { label: 'In Escrow', color: 'bg-purple-100 text-purple-800' },
    delivered: { label: 'Delivered', color: 'bg-yellow-100 text-yellow-800' },
    completed: { label: 'Completed', color: 'bg-green-100 text-green-800' },
    canceled: { label: 'Canceled', color: 'bg-red-100 text-red-800' }
  };

  // Format currency in Tsh
  const formatCurrency = (amount) => {
    return `Tsh ${amount?.toLocaleString() || '0'}`;
  };

  // Filter orders based on search and date filter
  const filteredOrders = ordersData.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.buyer.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    
    if (order.status === 'in_escrow') {
      // Pre-fill delivery form with buyer info
      setDeliveryData({
        destination: order.shippingAddress,
        estimatedArrival: '',
        deliveryCompany: '',
        deliveryReceipt: null
      });
      setShowDeliveryForm(true);
    } else {
      setShowOrderModal(true);
    }
  };

  const handleCloseModal = () => {
    setShowOrderModal(false);
    setShowDeliveryForm(false);
    setSelectedOrder(null);
  };

  const handleDeliveryInputChange = (field, value) => {
    setDeliveryData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setDeliveryData(prev => ({
        ...prev,
        deliveryReceipt: file
      }));
    }
  };

  const handleMarkDelivered = () => {
    if (!deliveryData.destination || !deliveryData.estimatedArrival || !deliveryData.deliveryCompany || !deliveryData.deliveryReceipt) {
      alert('Please fill all delivery information and upload receipt');
      return;
    }

    // Update order status to delivered
    setOrdersData(prev => prev.map(order => 
      order.id === selectedOrder.id 
        ? { ...order, status: 'delivered' }
        : order
    ));

    alert('Order marked as delivered! Status updated.');
    handleCloseModal();
  };

  return (
    <StableLayout>
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Orders Management</h1>
            <p className="text-gray-600">Track and manage your orders through the complete workflow</p>
          </div>

          {/* Updated KPI Stats Grid - 4 boxes with money figures */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {kpiStats.map((stat, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                    <p className={`text-lg font-bold ${stat.color} mb-2`}>
                      {stat.value}
                    </p>
                  </div>
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
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
                    placeholder="Search orders, products, buyers..."
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

          {/* Orders Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Desktop Table */}
            <div className="hidden lg:block">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Buyer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {order.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.product}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div>{order.buyer}</div>
                          <div className="text-gray-500 text-xs">{order.buyerPhone}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(order.price)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig[order.status].color}`}>
                          {statusConfig[order.status].label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.date).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleViewDetails(order)}
                          className="text-primary-600 hover:text-primary-900 flex items-center space-x-1 bg-primary-50 hover:bg-primary-100 px-3 py-2 rounded-lg transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                          <span>View Details</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <div key={order.id} className="p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="font-medium text-gray-900">{order.id}</div>
                      <div className="text-sm text-gray-500">{order.product}</div>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig[order.status].color}`}>
                      {statusConfig[order.status].label}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-500">Buyer</div>
                      <div className="font-medium">{order.buyer}</div>
                      <div className="text-gray-500 text-xs">{order.buyerPhone}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Price</div>
                      <div className="font-medium">{formatCurrency(order.price)}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Date</div>
                      <div className="font-medium">
                        {new Date(order.date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-500">Actions</div>
                      <button
                        onClick={() => handleViewDetails(order)}
                        className="text-primary-600 hover:text-primary-900 flex items-center space-x-1"
                      >
                        <Eye className="h-4 w-4" />
                        <span>View Details</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {filteredOrders.length === 0 && (
              <div className="text-center py-12">
                <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No orders found matching your criteria</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Order Details</h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Order ID</p>
                  <p className="font-medium">{selectedOrder.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig[selectedOrder.status].color}`}>
                    {statusConfig[selectedOrder.status].label}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600">Product</p>
                <p className="font-medium">{selectedOrder.product}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Amount</p>
                <p className="font-medium text-lg">{formatCurrency(selectedOrder.price)}</p>
              </div>

              <div className="border-t pt-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Buyer Information
                </h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Full Name:</span>
                    <span className="font-medium">{selectedOrder.buyer}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phone:</span>
                    <span className="font-medium">{selectedOrder.buyerPhone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium">{selectedOrder.buyerEmail}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Shipping Address:</span>
                    <p className="font-medium mt-1">{selectedOrder.shippingAddress}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between text-sm text-gray-500">
                <span>Order Date:</span>
                <span>{new Date(selectedOrder.date).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delivery Form Modal for In Escrow Orders */}
      {showDeliveryForm && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <Truck className="h-6 w-6 text-purple-500" />
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Mark Order as Delivered</h2>
                  <p className="text-sm text-gray-600">{selectedOrder.id} - {selectedOrder.product}</p>
                </div>
              </div>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Buyer Information */}
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Buyer Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <User className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-600">Full Name</p>
                          <p className="font-medium">{selectedOrder.buyer}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Phone className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-sm text-gray-600">Phone Number</p>
                          <p className="font-medium">{selectedOrder.buyerPhone}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Delivery Information Form */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Destination Address *
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          value={deliveryData.destination}
                          onChange={(e) => handleDeliveryInputChange('destination', e.target.value)}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                          placeholder="Enter delivery address"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Estimated Time of Arrival *
                      </label>
                      <input
                        type="datetime-local"
                        value={deliveryData.estimatedArrival}
                        onChange={(e) => handleDeliveryInputChange('estimatedArrival', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Delivery Company Name *
                      </label>
                      <div className="relative">
                        <Truck className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          value={deliveryData.deliveryCompany}
                          onChange={(e) => handleDeliveryInputChange('deliveryCompany', e.target.value)}
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                          placeholder="e.g., DHL, FedEx, Local Courier"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column - Receipt Upload */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Delivery Receipt</h3>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-300 transition-colors">
                      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 mb-2">
                        Upload delivery receipt or proof of delivery
                      </p>
                      <p className="text-xs text-gray-500 mb-4">
                        PNG, JPG, PDF up to 10MB
                      </p>
                      <input
                        type="file"
                        accept="image/png, image/jpeg, application/pdf"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="receipt-upload"
                      />
                      <label
                        htmlFor="receipt-upload"
                        className="inline-block bg-primary-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors cursor-pointer"
                      >
                        Choose File
                      </label>
                      {deliveryData.deliveryReceipt && (
                        <p className="text-sm text-green-600 mt-2">
                          ✓ {deliveryData.deliveryReceipt.name}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-primary-800 mb-3">Order Summary</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-primary-600">Product:</span>
                        <span className="text-primary-900">{selectedOrder.product}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-primary-600">Amount:</span>
                        <span className="text-primary-900">{formatCurrency(selectedOrder.price)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-primary-600">Current Status:</span>
                        <span className="text-primary-900">In Escrow</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={handleMarkDelivered}
                    className="w-full flex items-center justify-center space-x-2 bg-green-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-600 transition-colors"
                  >
                    <CheckCircle className="h-5 w-5" />
                    <span>Mark as Delivered</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </StableLayout>
  );
};

export default OrdersPage;