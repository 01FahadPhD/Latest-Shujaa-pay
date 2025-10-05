import React, { useState, useEffect } from 'react';
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
  CheckCircle,
  Trash2,
  AlertTriangle,
  Loader,
  RefreshCw
} from 'lucide-react';

const OrdersPage = () => {
  const [dateFilter, setDateFilter] = useState('today');
  const [searchQuery, setSearchQuery] = useState('');
  const [customDateRange, setCustomDateRange] = useState({ start: '', end: '' });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showDeliveryForm, setShowDeliveryForm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ordersData, setOrdersData] = useState([]);
  const [kpiStats, setKpiStats] = useState([]);
  const [error, setError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deliveryLoading, setDeliveryLoading] = useState(false);
  const [deliveryData, setDeliveryData] = useState({
    destination: '',
    estimatedArrival: '',
    deliveryCompany: '',
    deliveryReceipt: null,
    trackingNumber: '',
    notes: ''
  });
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('success'); // 'success' or 'error'

  // Status configuration - UPDATED with complete workflow
  const statusConfig = {
    // Order workflow statuses
    waiting_payment: { label: 'Waiting Payment', color: 'bg-orange-100 text-orange-800', canDelete: true },
    paid: { label: 'Paid', color: 'bg-blue-100 text-blue-800', canDelete: false },
    delivered: { label: 'Delivered', color: 'bg-yellow-100 text-yellow-800', canDelete: false },
    completed: { label: 'Completed', color: 'bg-green-100 text-green-800', canDelete: false },
    disputed: { label: 'Disputed', color: 'bg-red-100 text-red-800', canDelete: false },
    refunded: { label: 'Refunded', color: 'bg-gray-100 text-gray-800', canDelete: false },
    deleted: { label: 'Deleted', color: 'bg-gray-100 text-gray-800', canDelete: false },
    // Old statuses (for backward compatibility)
    active: { label: 'Waiting Payment', color: 'bg-orange-100 text-orange-800', canDelete: true },
    in_escrow: { label: 'In Escrow', color: 'bg-purple-100 text-purple-800', canDelete: false },
    expired: { label: 'Expired', color: 'bg-gray-100 text-gray-800', canDelete: false },
    cancelled: { label: 'Canceled', color: 'bg-red-100 text-red-800', canDelete: false }
  };

  // ✅ NEW: System alert function
  const showSystemAlert = (message, type = 'success') => {
    setAlertMessage(message);
    setAlertType(type);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 5000);
  };

  // Format currency in Tsh
  const formatCurrency = (amount) => {
    if (!amount) return 'Tsh 0';
    return `Tsh ${parseInt(amount).toLocaleString()}`;
  };

  // Format date for display
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Format date and time for display
  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get authentication token
  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  // Get current seller ID
  const getSellerId = () => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    return userData.id || userData._id;
  };

  // Filter orders by date range
  const filterOrdersByDate = (orders, filter, customRange) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      
      switch (filter) {
        case 'today':
          return orderDate >= today;
        case 'week':
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          return orderDate >= weekAgo;
        case 'month':
          const monthAgo = new Date(today);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          return orderDate >= monthAgo;
        case 'custom':
          if (!customRange.start || !customRange.end) return true;
          const startDate = new Date(customRange.start);
          const endDate = new Date(customRange.end);
          endDate.setHours(23, 59, 59, 999);
          return orderDate >= startDate && orderDate <= endDate;
        default:
          return true;
      }
    });
  };

  // ✅ ADD REFRESH TOKEN FUNCTION
  const refreshToken = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/refresh-token', {
        method: 'POST',
        credentials: 'include' // Important for cookies
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('token', data.token);
        return data.token;
      }
      return null;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return null;
    }
  };

  // ✅ ADD HELPER FUNCTION FOR SUCCESSFUL DELIVERY
  const handleSuccessfulDelivery = (responseData, orderId, deliveryInfo) => {
    if (responseData.paymentLink) {
      setOrdersData(prev => prev.map(order => 
        order.id === orderId 
          ? { 
              ...order, 
              status: 'delivered',
              deliveryInfo: responseData.paymentLink.deliveryInfo,
              originalStatus: 'delivered'
            }
          : order
      ));
    } else {
      // Fallback update if response doesn't include the updated order
      setOrdersData(prev => prev.map(order => 
        order.id === orderId 
          ? { 
              ...order, 
              status: 'delivered',
              deliveryInfo: {
                destination: deliveryInfo.destination,
                estimatedArrival: deliveryInfo.estimatedArrival,
                deliveryCompany: deliveryInfo.deliveryCompany,
                trackingNumber: deliveryInfo.trackingNumber,
                notes: deliveryInfo.notes,
                deliveredAt: new Date().toISOString()
              },
              originalStatus: 'delivered'
            }
          : order
      ));
    }
    return true;
  };

  // Fetch orders from API
  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      
      const token = getAuthToken();
      const sellerId = getSellerId();

      if (!token || !sellerId) {
        throw new Error('Authentication required. Please login again.');
      }

      console.log('🔄 Fetching orders for seller:', sellerId);

      const response = await fetch(`http://localhost:5000/api/payment-links/seller/${sellerId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 Orders API response status:', response.status);

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Session expired. Please login again.');
        }
        throw new Error(`Failed to fetch orders (${response.status})`);
      }

      const data = await response.json();
      console.log('📡 Orders API response data:', data);
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to load orders');
      }

      // Transform the data from the API
      const transformedOrders = (data.paymentLinks || []).map(order => {
        // ✅ FIXED: Map old statuses to new ones for frontend display
        const statusMap = {
          'active': 'waiting_payment', // Map active to waiting_payment
          'waiting_payment': 'waiting_payment', // Keep waiting_payment as is
          'paid': 'paid',
          'expired': 'expired',
          'cancelled': 'canceled',
          'in_escrow': 'paid', // Map in_escrow to paid for frontend display
          'delivered': 'delivered',
          'completed': 'completed',
          'disputed': 'disputed',
          'refunded': 'refunded',
          'deleted': 'deleted'
        };

        // ✅ FIXED: Determine the correct status for display
        const displayStatus = statusMap[order.status] || order.status || 'waiting_payment';

        return {
          id: order.linkId || order.id,
          productName: order.productName || 'Unknown Product',
          buyerName: order.buyerName || 'Unknown Buyer',
          productPrice: order.productPrice || 0,
          status: displayStatus, // Use the mapped status
          createdAt: order.createdAt || new Date().toISOString(),
          buyerPhone: order.buyerPhone || 'Not provided',
          buyerEmail: order.buyerEmail || '',
          shippingAddress: order.shippingAddress || 'Address not provided',
          deliveryInfo: order.deliveryInfo || null,
          // Include original status for backend operations
          originalStatus: order.status,
          // Include all original data
          ...order
        };
      });

      setOrdersData(transformedOrders);
      calculateKpiStats(transformedOrders);

      console.log('✅ Orders loaded successfully:', transformedOrders.length, 'orders');

    } catch (err) {
      console.error('❌ Error fetching orders:', err);
      setError(err.message || 'Failed to load orders. Please try again.');
      // Fallback to mock data if API fails
      setOrdersData(getMockOrders());
      calculateKpiStats(getMockOrders());
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIXED: Calculate KPI stats from orders data - UPDATED with proper waiting payment calculation
  const calculateKpiStats = (orders) => {
    const filteredOrders = filterOrdersByDate(orders, dateFilter, customDateRange);
    
    const totalOrders = filteredOrders.length;
    
    // Sales: Only completed orders
    const totalSales = filteredOrders
      .filter(order => order.status === 'completed')
      .reduce((sum, order) => sum + (parseInt(order.productPrice) || 0), 0);
    
    // ✅ FIXED: Waiting Payment - Include both waiting_payment status AND active status (which maps to waiting_payment)
    const waitingPayment = filteredOrders
      .filter(order => 
        order.status === 'waiting_payment' || 
        order.originalStatus === 'active' // Include original active status
      )
      .reduce((sum, order) => sum + (parseInt(order.productPrice) || 0), 0);
    
    // In Escrow: paid, delivered, disputed statuses
    const inEscrow = filteredOrders
      .filter(order => 
        order.status === 'paid' || 
        order.status === 'delivered' || 
        order.status === 'disputed'
      )
      .reduce((sum, order) => sum + (parseInt(order.productPrice) || 0), 0);

    setKpiStats([
      {
        title: 'Total Orders',
        value: totalOrders.toLocaleString(),
        icon: ShoppingCart,
        color: 'text-blue-500',
        bgColor: 'bg-blue-50'
      },
      {
        title: 'Total Sales',
        value: formatCurrency(totalSales),
        icon: DollarSign,
        color: 'text-green-500',
        bgColor: 'bg-green-50',
        description: 'Completed orders only'
      },
      {
        title: 'Waiting Payment',
        value: formatCurrency(waitingPayment),
        icon: Clock,
        color: 'text-orange-500',
        bgColor: 'bg-orange-50',
        description: 'Awaiting buyer payment'
      },
      {
        title: 'In Escrow',
        value: formatCurrency(inEscrow),
        icon: Shield,
        color: 'text-purple-500',
        bgColor: 'bg-purple-50',
        description: 'Paid, delivered, or disputed'
      }
    ]);
  };

  // Mock data fallback - UPDATED to reflect correct status mapping
  const getMockOrders = () => [
    {
      id: 'ORD-7842',
      productName: 'iPhone 15 Pro',
      buyerName: 'John Mwita',
      productPrice: 2450000,
      status: 'waiting_payment', // Display status
      originalStatus: 'active', // Backend status
      createdAt: '2024-01-15',
      buyerPhone: '+255 789 456 123',
      buyerEmail: 'john.mwita@email.com',
      shippingAddress: '123 Main Street, Dar es Salaam'
    },
    {
      id: 'ORD-7841',
      productName: 'MacBook Air M2',
      buyerName: 'Sarah Johnson',
      productPrice: 3250000,
      status: 'paid',
      originalStatus: 'paid',
      createdAt: '2024-01-14',
      buyerPhone: '+255 712 345 678',
      buyerEmail: 'sarah.j@email.com',
      shippingAddress: '456 City Center, Arusha'
    },
    {
      id: 'ORD-7840',
      productName: 'Samsung Galaxy S24',
      buyerName: 'Michael Brown',
      productPrice: 1850000,
      status: 'delivered',
      originalStatus: 'delivered',
      createdAt: '2024-01-13',
      buyerPhone: '+255 765 432 109',
      buyerEmail: 'michael.b@email.com',
      shippingAddress: '789 Beach Road, Zanzibar',
      deliveryInfo: {
        destination: '789 Beach Road, Zanzibar',
        estimatedArrival: '2024-01-20',
        deliveryCompany: 'DHL Express',
        trackingNumber: 'DHL123456789'
      }
    },
    {
      id: 'ORD-7839',
      productName: 'iPad Air',
      buyerName: 'Lisa Johnson',
      productPrice: 1250000,
      status: 'completed',
      originalStatus: 'completed',
      createdAt: '2024-01-12',
      buyerPhone: '+255 788 123 456',
      buyerEmail: 'lisa.j@email.com',
      shippingAddress: '321 Hillside, Mwanza'
    },
    {
      id: 'ORD-7838',
      productName: 'Wireless Headphones',
      buyerName: 'David Wilson',
      productPrice: 450000,
      status: 'disputed',
      originalStatus: 'disputed',
      createdAt: '2024-01-11',
      buyerPhone: '+255 712 987 654',
      buyerEmail: 'david.w@email.com',
      shippingAddress: '654 Valley View, Mbeya'
    },
    {
      id: 'ORD-7837',
      productName: 'Smart Watch',
      buyerName: 'Emma Thompson',
      productPrice: 320000,
      status: 'refunded',
      originalStatus: 'refunded',
      createdAt: '2024-01-10',
      buyerPhone: '+255 789 555 123',
      buyerEmail: 'emma.t@email.com',
      shippingAddress: '987 Mountain Road, Arusha'
    }
  ];

  // ✅ UPDATED: Improved delete order function with proper status validation
  const deleteOrder = async (orderId) => {
    try {
      setDeleteLoading(true);
      const token = getAuthToken();
      if (!token) {
        showSystemAlert('You are not logged in', 'error');
        return false;
      }

      console.log('🔄 Attempting to delete order:', orderId);

      // Find the order to check its status
      const orderToDelete = ordersData.find(order => order.id === orderId);
      if (!orderToDelete) {
        showSystemAlert('Order not found', 'error');
        return false;
      }

      console.log('📋 Order details:', {
        id: orderToDelete.id,
        status: orderToDelete.status,
        originalStatus: orderToDelete.originalStatus,
        canDelete: canDeleteOrder(orderToDelete)
      });

      // Double-check if the order can be deleted - only waiting_payment/active status
      if (!canDeleteOrder(orderToDelete)) {
        showSystemAlert('Cannot delete this order. It may have already been processed or paid.', 'error');
        return false;
      }

      const response = await fetch(`http://localhost:5000/api/payment-links/${orderId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('📡 Delete API response status:', response.status);

      let responseData;
      try {
        responseData = await response.json();
        console.log('📡 Delete API response data:', responseData);
      } catch (parseError) {
        console.error('❌ Error parsing response:', parseError);
        showSystemAlert('Invalid response from server', 'error');
        return false;
      }

      if (!response.ok) {
        const errorMessage = responseData?.message || 
                            responseData?.error || 
                            `Failed to delete order (${response.status})`;
        
        if (response.status === 400) {
          showSystemAlert(responseData.details || 'Cannot delete this order. It may have already been processed or paid.', 'error');
        } else if (response.status === 401) {
          if (responseData.code === 'TOKEN_EXPIRED') {
            showSystemAlert('Session expired. Please log in again.', 'error');
          } else {
            showSystemAlert('Invalid token. Please log in again.', 'error');
          }
        } else if (response.status === 404) {
          showSystemAlert('Order not found. It may have already been deleted.', 'error');
        } else if (response.status === 403) {
          showSystemAlert('You do not have permission to delete this order.', 'error');
        } else if (response.status === 409) {
          showSystemAlert('Cannot delete order due to conflict with current status.', 'error');
        } else if (response.status === 500) {
          showSystemAlert('Server error. Please try again later.', 'error');
        } else {
          showSystemAlert(errorMessage, 'error');
        }
        
        return false;
      }

      if (!responseData.success) {
        showSystemAlert(responseData.message || 'Failed to delete order', 'error');
        return false;
      }

      console.log('✅ Order deleted successfully');
      
      // Update order status to deleted in local state
      setOrdersData(prev => prev.map(order => 
        order.id === orderId 
          ? { ...order, status: 'deleted', originalStatus: 'deleted' }
          : order
      ));
      
      return true;

    } catch (err) {
      console.error('❌ Error deleting order:', err);
      showSystemAlert('Network error. Please try again later.', 'error');
      return false;
    } finally {
      setDeleteLoading(false);
    }
  };

  // ✅ UPDATED: Mark order as delivered with proper token handling AND token refresh
  const markAsDelivered = async (orderId, deliveryInfo) => {
    try {
      setDeliveryLoading(true);
      const token = getAuthToken();
      if (!token) {
        showSystemAlert('You are not logged in', 'error');
        return false;
      }

      console.log('🔄 Marking order as delivered:', orderId, deliveryInfo);

      // ✅ CORRECTED: Send delivery data directly (not nested in deliveryInfo)
      const payload = {
        destination: deliveryInfo.destination,
        estimatedArrival: deliveryInfo.estimatedArrival,
        deliveryCompany: deliveryInfo.deliveryCompany,
        trackingNumber: deliveryInfo.trackingNumber || '',
        notes: deliveryInfo.notes || ''
      };

      console.log('📦 Payload being sent:', payload);

      // ✅ HANDLE FILE UPLOAD PROPERLY
      let requestBody;
      let headers = {
        'Authorization': `Bearer ${token}`,
      };

      if (deliveryInfo.deliveryReceipt) {
        // Use FormData for file upload
        const formData = new FormData();
        formData.append('data', JSON.stringify(payload));
        formData.append('deliveryReceipt', deliveryInfo.deliveryReceipt);
        requestBody = formData;
        console.log('📤 Using FormData with file upload');
      } else {
        // Use JSON without file
        headers['Content-Type'] = 'application/json';
        requestBody = JSON.stringify(payload);
        console.log('📤 Using JSON without file');
      }

      const response = await fetch(`http://localhost:5000/api/payment-links/${orderId}/deliver`, {
        method: 'PUT',
        headers: headers,
        body: requestBody
      });

      console.log('📡 Deliver API response status:', response.status);

      // ✅ ADD TOKEN REFRESH LOGIC HERE
      if (response.status === 401) {
        const refreshedToken = await refreshToken();
        if (refreshedToken) {
          // Retry the request with new token
          headers['Authorization'] = `Bearer ${refreshedToken}`;
          const retryResponse = await fetch(`http://localhost:5000/api/payment-links/${orderId}/deliver`, {
            method: 'PUT',
            headers: headers,
            body: requestBody
          });
          
          if (retryResponse.ok) {
            // Process successful response from retry
            const responseData = await retryResponse.json();
            return handleSuccessfulDelivery(responseData, orderId, deliveryInfo);
          }
        }
      }

      let responseData;
      try {
        responseData = await response.json();
        console.log('📡 Deliver API response data:', responseData);
      } catch (parseError) {
        console.error('❌ Error parsing response:', parseError);
        showSystemAlert('Invalid response from server', 'error');
        return false;
      }

      if (!response.ok) {
        if (response.status === 401) {
          if (responseData.code === 'TOKEN_EXPIRED') {
            showSystemAlert('Session expired. Please log in again.', 'error');
          } else {
            showSystemAlert('Invalid token. Please log in again.', 'error');
          }
        } else {
          const errorMessage = responseData?.message || `Failed to update order (${response.status})`;
          showSystemAlert(errorMessage, 'error');
        }
        return false;
      }

      if (!responseData.success) {
        showSystemAlert(responseData.message || 'Failed to update order status', 'error');
        return false;
      }

      console.log('✅ Order marked as delivered successfully:', responseData);
      
      // ✅ UPDATE LOCAL STATE to match backend response
      return handleSuccessfulDelivery(responseData, orderId, deliveryInfo);

    } catch (err) {
      console.error('❌ Error marking order as delivered:', err);
      showSystemAlert('Network error. Please try again later.', 'error');
      return false;
    } finally {
      setDeliveryLoading(false);
    }
  };

  // Filter orders based on search and date filter
  const filteredOrders = filterOrdersByDate(ordersData, dateFilter, customDateRange).filter(order => {
    const matchesSearch = 
      order.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.productName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.buyerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.buyerPhone?.includes(searchQuery);
    
    return matchesSearch;
  });

  // Get empty state message based on current filter
  const getEmptyStateMessage = () => {
    if (searchQuery) {
      return 'No orders found matching your search criteria';
    }
    
    switch (dateFilter) {
      case 'today':
        return 'No orders found for today';
      case 'week':
        return 'No orders found this week';
      case 'month':
        return 'No orders found this month';
      case 'custom':
        return 'No orders found in the selected date range';
      default:
        return 'No orders found matching your criteria';
    }
  };

  // ✅ FIXED: Function to check if order can be deleted
  const canDeleteOrder = (order) => {
    // Only orders with waiting_payment status OR active original status can be deleted
    const canDeleteByStatus = 
      order.status === 'waiting_payment' || 
      order.originalStatus === 'active' ||
      order.originalStatus === 'waiting_payment';
    
    return canDeleteByStatus;
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    
    // Check if order can be marked as delivered
    const canMarkDelivered = order.status === 'paid' || order.originalStatus === 'paid';
    
    if (canMarkDelivered) {
      // Pre-fill delivery form with buyer info
      setDeliveryData({
        destination: order.shippingAddress || '',
        estimatedArrival: '',
        deliveryCompany: '',
        deliveryReceipt: null,
        trackingNumber: '',
        notes: ''
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
    setDeliveryData({
      destination: '',
      estimatedArrival: '',
      deliveryCompany: '',
      deliveryReceipt: null,
      trackingNumber: '',
      notes: ''
    });
  };

  const handleCloseDeleteConfirm = () => {
    setShowDeleteConfirm(false);
    setOrderToDelete(null);
    setDeleteLoading(false);
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

  // ✅ IMPROVED: Handle mark as delivered with validation
  const handleMarkDelivered = async () => {
    // ✅ IMPROVED VALIDATION
    if (!deliveryData.destination?.trim()) {
      showSystemAlert('Please enter the destination address', 'error');
      return;
    }

    if (!deliveryData.estimatedArrival) {
      showSystemAlert('Please select the estimated arrival date and time', 'error');
      return;
    }

    if (!deliveryData.deliveryCompany?.trim()) {
      showSystemAlert('Please enter the delivery company name', 'error');
      return;
    }

    const success = await markAsDelivered(selectedOrder.id, deliveryData);
    
    if (success) {
      showSystemAlert('Order marked as delivered! Buyer will now see the delivery information.');
      handleCloseModal();
      
      // ✅ REFRESH DATA to ensure consistency
      setTimeout(() => {
        fetchOrders();
      }, 500);
    }
  };

  // Handle delete order confirmation
  const handleDeleteClick = (orderId) => {
    const order = ordersData.find(o => o.id === orderId);
    if (!order) {
      showSystemAlert('Order not found', 'error');
      return;
    }

    console.log('🗑️ Delete click for order:', {
      id: order.id,
      status: order.status,
      originalStatus: order.originalStatus,
      canDelete: canDeleteOrder(order)
    });

    if (!canDeleteOrder(order)) {
      showSystemAlert('Cannot delete this order. It may have already been processed or paid.', 'error');
      return;
    }
    
    setOrderToDelete(orderId);
    setShowDeleteConfirm(true);
  };

  // Handle actual order deletion
  const handleConfirmDelete = async () => {
    if (orderToDelete) {
      const success = await deleteOrder(orderToDelete);
      
      if (success) {
        setShowOrderModal(false);
        handleCloseDeleteConfirm();
        showSystemAlert('Order deleted successfully!');
        
        // Refresh KPI stats
        calculateKpiStats(ordersData);
      }
    }
  };

  // Refresh data
  const handleRefresh = () => {
    fetchOrders();
  };

  // Update KPI stats when date filter changes
  useEffect(() => {
    if (ordersData.length > 0) {
      calculateKpiStats(ordersData);
    }
  }, [dateFilter, customDateRange, ordersData]);

  // Fetch orders on component mount
  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <StableLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Loader className="h-12 w-12 text-primary-500 animate-spin mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-gray-900">Loading Orders</h2>
            <p className="text-gray-600">Please wait while we fetch your orders...</p>
          </div>
        </div>
      </StableLayout>
    );
  }

  return (
    <StableLayout>
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          
          {/* ✅ NEW: System Alert */}
          {showAlert && (
            <div className={`fixed top-4 right-4 z-50 max-w-sm w-full ${
              alertType === 'success' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
            } border rounded-lg shadow-lg p-4 transform transition-transform duration-300 ease-in-out`}>
              <div className="flex items-start space-x-3">
                {alertType === 'success' ? (
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <p className={`text-sm font-medium ${
                    alertType === 'success' ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {alertMessage}
                  </p>
                </div>
                <button
                  onClick={() => setShowAlert(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* Page Header */}
          <div className="mb-6 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Orders Management</h1>
              <p className="text-gray-600">Track and manage your orders through the complete workflow</p>
            </div>
            <button
              onClick={handleRefresh}
              className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-red-700">
                <AlertTriangle className="h-5 w-5" />
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* KPI Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {kpiStats.map((stat, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                    <p className={`text-lg font-bold ${stat.color} mb-2`}>
                      {stat.value}
                    </p>
                    {stat.description && (
                      <p className="text-xs text-gray-500">{stat.description}</p>
                    )}
                  </div>
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Control Bar - Search and Filters */}
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order & Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Buyer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {order.id}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatDateTime(order.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.productName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div>{order.buyerName}</div>
                          <div className="text-gray-500 text-xs">{order.buyerPhone}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatCurrency(order.productPrice)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig[order.status]?.color || 'bg-gray-100 text-gray-800'}`}>
                          {statusConfig[order.status]?.label || order.status}
                        </span>
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
                      <div className="text-sm text-gray-500">{formatDateTime(order.createdAt)}</div>
                      <div className="text-sm text-gray-500 mt-1">{order.productName}</div>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig[order.status]?.color || 'bg-gray-100 text-gray-800'}`}>
                      {statusConfig[order.status]?.label || order.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-500">Buyer</div>
                      <div className="font-medium">{order.buyerName}</div>
                      <div className="text-gray-500 text-xs">{order.buyerPhone}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Price</div>
                      <div className="font-medium">{formatCurrency(order.productPrice)}</div>
                    </div>
                    <div className="col-span-2">
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
                <p className="text-gray-500">{getEmptyStateMessage()}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      {showOrderModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md mx-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-xl">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Order Details</h2>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Order ID</p>
                  <p className="font-medium text-sm sm:text-base">{selectedOrder.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig[selectedOrder.status]?.color || 'bg-gray-100 text-gray-800'}`}>
                    {statusConfig[selectedOrder.status]?.label || selectedOrder.status}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600">Product</p>
                <p className="font-medium text-sm sm:text-base">{selectedOrder.productName}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Amount</p>
                <p className="font-medium text-lg sm:text-xl">{formatCurrency(selectedOrder.productPrice)}</p>
              </div>

              {/* Show Delivery Information if available */}
              {selectedOrder.deliveryInfo && (
                <div className="border-t pt-4">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <Truck className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    Delivery Information
                  </h3>
                  <div className="space-y-2 text-sm sm:text-base">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Company:</span>
                      <span className="font-medium">{selectedOrder.deliveryInfo.deliveryCompany}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Destination:</span>
                      <span className="font-medium">{selectedOrder.deliveryInfo.destination}</span>
                    </div>
                    {selectedOrder.deliveryInfo.estimatedArrival && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">ETA:</span>
                        <span className="font-medium">
                          {formatDate(selectedOrder.deliveryInfo.estimatedArrival)}
                        </span>
                      </div>
                    )}
                    {selectedOrder.deliveryInfo.trackingNumber && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Tracking:</span>
                        <span className="font-medium">{selectedOrder.deliveryInfo.trackingNumber}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="border-t pt-4">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <User className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Buyer Information
                </h3>
                <div className="space-y-2 text-sm sm:text-base">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Full Name:</span>
                    <span className="font-medium text-right">{selectedOrder.buyerName}</span>
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
                    <p className="font-medium mt-1 text-sm">{selectedOrder.shippingAddress}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between text-sm text-gray-500">
                <span>Order Date:</span>
                <span>{formatDateTime(selectedOrder.createdAt)}</span>
              </div>

              {/* Delete Button for Waiting Payment Orders */}
              {canDeleteOrder(selectedOrder) && (
                <div className="border-t pt-4 mt-4">
                  <button
                    onClick={() => handleDeleteClick(selectedOrder.id)}
                    className="w-full flex items-center justify-center space-x-2 bg-red-500 text-white px-4 py-3 rounded-lg font-medium hover:bg-red-600 transition-colors text-sm sm:text-base"
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Delete Order</span>
                  </button>
                  <p className="text-xs text-gray-500 text-center mt-2">
                    Only available for orders with "Waiting Payment" status
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delivery Form Modal for Paid Orders */}
      {showDeliveryForm && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl mx-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-xl">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <Truck className="h-5 w-5 sm:h-6 sm:w-6 text-purple-500" />
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Mark Order as Delivered</h2>
                  <p className="text-xs sm:text-sm text-gray-600">{selectedOrder.id} - {selectedOrder.productName}</p>
                </div>
              </div>
              <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </div>

            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                {/* Left Column - Buyer Information */}
                <div className="space-y-4 sm:space-y-6">
                  <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">Buyer Information</h3>
                    <div className="space-y-2 sm:space-y-3">
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <User className="h-4 w-4 text-gray-500 flex-shrink-0" />
                        <div>
                          <p className="text-xs sm:text-sm text-gray-600">Full Name</p>
                          <p className="font-medium text-sm sm:text-base">{selectedOrder.buyerName}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <Phone className="h-4 w-4 text-gray-500 flex-shrink-0" />
                        <div>
                          <p className="text-xs sm:text-sm text-gray-600">Phone Number</p>
                          <p className="font-medium text-sm sm:text-base">{selectedOrder.buyerPhone}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 sm:space-x-3">
                        <MapPin className="h-4 w-4 text-gray-500 flex-shrink-0" />
                        <div>
                          <p className="text-xs sm:text-sm text-gray-600">Shipping Address</p>
                          <p className="font-medium text-sm sm:text-base">{selectedOrder.shippingAddress}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Delivery Information Form */}
                  <div className="space-y-3 sm:space-y-4">
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
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm sm:text-base"
                          placeholder="Enter delivery address"
                          required
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm sm:text-base"
                        required
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
                          className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm sm:text-base"
                          placeholder="e.g., DHL, FedEx, Local Courier"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tracking Number (Optional)
                      </label>
                      <input
                        type="text"
                        value={deliveryData.trackingNumber}
                        onChange={(e) => handleDeliveryInputChange('trackingNumber', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm sm:text-base"
                        placeholder="Enter tracking number"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Notes (Optional)
                      </label>
                      <textarea
                        value={deliveryData.notes}
                        onChange={(e) => handleDeliveryInputChange('notes', e.target.value)}
                        rows="3"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm sm:text-base"
                        placeholder="Additional delivery notes..."
                      />
                    </div>
                  </div>
                </div>

                {/* Right Column - Receipt Upload */}
                <div className="space-y-4 sm:space-y-6">
                  <div>
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3">Delivery Receipt</h3>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 text-center hover:border-primary-300 transition-colors">
                      <Upload className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-xs sm:text-sm text-gray-600 mb-2">
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
                        className="inline-block bg-primary-500 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium hover:bg-primary-600 transition-colors cursor-pointer"
                      >
                        Choose File
                      </label>
                      {deliveryData.deliveryReceipt && (
                        <p className="text-xs sm:text-sm text-green-600 mt-2">
                          ✓ {deliveryData.deliveryReceipt.name}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="bg-primary-50 border border-primary-200 rounded-lg p-3 sm:p-4">
                    <h3 className="text-base sm:text-lg font-semibold text-primary-800 mb-3">Order Summary</h3>
                    <div className="space-y-2 text-xs sm:text-sm">
                      <div className="flex justify-between">
                        <span className="text-primary-600">Product:</span>
                        <span className="text-primary-900">{selectedOrder.productName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-primary-600">Amount:</span>
                        <span className="text-primary-900">{formatCurrency(selectedOrder.productPrice)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-primary-600">Current Status:</span>
                        <span className="text-primary-900">{statusConfig[selectedOrder.status]?.label || selectedOrder.status}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={handleMarkDelivered}
                    disabled={deliveryLoading}
                    className="w-full flex items-center justify-center space-x-2 bg-green-500 text-white px-4 py-3 rounded-lg font-medium hover:bg-green-600 transition-colors text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deliveryLoading ? (
                      <>
                        <Loader className="h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                        <span>Updating...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                        <span>Mark as Delivered</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-sm mx-auto">
            <div className="p-4 sm:p-6 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Delete Order?
              </h3>
              
              <p className="text-sm text-gray-600 mb-6">
                Are you sure you want to delete this order? This action cannot be undone.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleCloseDeleteConfirm}
                  disabled={deleteLoading}
                  className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-200 transition-colors text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={deleteLoading}
                  className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 transition-colors text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {deleteLoading ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin mr-2" />
                      Deleting...
                    </>
                  ) : (
                    'Delete Order'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </StableLayout>
  );
};

export default OrdersPage;