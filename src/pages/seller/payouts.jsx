import React, { useState, useEffect } from 'react';
import StableLayout from '../../components/common/layout/StableLayout';
import { 
  Search, 
  Calendar,
  Clock,
  DollarSign,
  Download,
  Eye,
  EyeOff,
  Building,
  Smartphone,
  X,
  BanknoteIcon,
  Phone,
  FileText,
  Calendar as CalendarIcon,
  MoreVertical,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Loader,
  ExternalLink,
  Shield
} from 'lucide-react';

const PayoutsPage = () => {
  const [timeFilter, setTimeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [customDateRange, setCustomDateRange] = useState({ start: '', end: '' });
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState('');
  const [selectedAgent, setSelectedAgent] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedPayout, setSelectedPayout] = useState(null);
  const [activeMenu, setActiveMenu] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [loading, setLoading] = useState(true);
  const [payoutsData, setPayoutsData] = useState([]);
  const [kpiStats, setKpiStats] = useState({
    available: 0,
    inEscrow: 0,
    refunded: 0,
    withdrawn: 0
  });
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showAvailableBalance, setShowAvailableBalance] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Time filter options
  const timeFilterOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'custom', label: 'Custom Range' }
  ];

  // Mobile Money Agents
  const mobileMoneyAgents = [
    { id: 'mpesa', name: 'M-Pesa', icon: '📱' },
    { id: 'halopesa', name: 'Halopesa', icon: '💜' },
    { id: 'airtelmoney', name: 'Airtel Money', icon: '🔵' },
    { id: 'mix', name: 'Mix by Yas', icon: '🎨' },
    { id: 'azampesa', name: 'Azam Pesa', icon: '🟠' }
  ];

  // Status configuration
  const statusConfig = {
    withdrawn: { label: 'Withdrawn', color: 'bg-green-100 text-green-800' },
    in_escrow: { label: 'In Escrow', color: 'bg-orange-100 text-orange-800' },
    refunded: { label: 'Refunded', color: 'bg-red-100 text-red-800' },
    disputed: { label: 'Disputed', color: 'bg-red-100 text-red-800' }
  };

  // Method configuration
  const methodConfig = {
    bank_transfer: { label: 'Bank Transfer', icon: Building, color: 'text-blue-500' },
    mobile_money: { label: 'Mobile Money', icon: Smartphone, color: 'text-purple-500' }
  };

  // API Base URL
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

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

  // Truncate long text with ellipsis
  const truncateText = (text, maxLength = 20) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Show platform notification
  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 4000);
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

  // Get user email for password verification
  const getUserEmail = () => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    return userData.email;
  };

  // Verify password using the existing login endpoint
  const verifyPasswordWithAPI = async (password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: getUserEmail(),
          password: password
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Password verification failed');
      }

      return true;
    } catch (error) {
      console.error('Password verification error:', error);
      throw new Error('Invalid password. Please try again.');
    }
  };

  // Get withdrawals from localStorage
  const getWithdrawalsFromStorage = () => {
    try {
      return JSON.parse(localStorage.getItem('seller_withdrawals') || '[]');
    } catch (error) {
      console.error('Error loading withdrawals from storage:', error);
      return [];
    }
  };

  // Save withdrawal to localStorage
  const saveWithdrawalToStorage = (withdrawal) => {
    try {
      const withdrawals = getWithdrawalsFromStorage();
      withdrawals.push(withdrawal);
      localStorage.setItem('seller_withdrawals', JSON.stringify(withdrawals));
    } catch (error) {
      console.error('Error saving withdrawal to storage:', error);
    }
  };

  // Get KPI stats from localStorage
  const getKpiStatsFromStorage = () => {
    try {
      return JSON.parse(localStorage.getItem('seller_payouts_kpi_stats') || 'null');
    } catch (error) {
      console.error('Error loading KPI stats from storage:', error);
      return null;
    }
  };

  // Save KPI stats to localStorage
  const saveKpiStatsToStorage = (stats) => {
    try {
      localStorage.setItem('seller_payouts_kpi_stats', JSON.stringify(stats));
    } catch (error) {
      console.error('Error saving KPI stats to storage:', error);
    }
  };

  // Fetch payouts data from API and combine with local withdrawals
  const fetchPayouts = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      const sellerId = getSellerId();

      if (!token || !sellerId) {
        throw new Error('Authentication required. Please login again.');
      }

      // Fetch seller's orders to calculate payouts
      const response = await fetch(`${API_BASE_URL}/api/payment-links/seller/${sellerId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Session expired. Please login again.');
        }
        throw new Error(`Failed to fetch payouts data (${response.status})`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to load payouts data');
      }

      // Transform orders data to payouts based on your business logic
      const apiPayouts = transformOrdersToPayouts(data.paymentLinks || []);
      
      // Get withdrawals from localStorage
      const localWithdrawals = getWithdrawalsFromStorage();
      
      // Combine API payouts with local withdrawals
      const combinedPayouts = [...localWithdrawals, ...apiPayouts];
      
      // Sort by date (newest first)
      combinedPayouts.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      setPayoutsData(combinedPayouts);
      
      // Calculate KPI stats - use stored stats if available, otherwise calculate from data
      const storedStats = getKpiStatsFromStorage();
      if (storedStats) {
        setKpiStats(storedStats);
      } else {
        calculateKpiStats(combinedPayouts, data.paymentLinks || []);
      }

    } catch (err) {
      console.error('❌ Error fetching payouts:', err);
      showNotification(err.message || 'Failed to load payouts data. Please try again.', 'error');
      // Fallback to mock data if API fails
      const mockPayouts = getMockPayouts();
      const localWithdrawals = getWithdrawalsFromStorage();
      const combinedPayouts = [...localWithdrawals, ...mockPayouts];
      setPayoutsData(combinedPayouts);
      
      const storedStats = getKpiStatsFromStorage();
      if (storedStats) {
        setKpiStats(storedStats);
      } else {
        calculateKpiStats(combinedPayouts, []);
      }
    } finally {
      setLoading(false);
    }
  };

  // Transform orders to payouts based on your business rules
  const transformOrdersToPayouts = (orders) => {
    const payouts = [];

    orders.forEach(order => {
      const orderAmount = parseInt(order.productPrice) || 0;
      const orderId = order.linkId || order._id?.toString() || order.id;
      
      // 1. In Escrow = paid, delivered and disputed orders
      if (['paid', 'delivered', 'disputed'].includes(order.status)) {
        payouts.push({
          id: `PYT-ESC-${orderId}`,
          orderId: orderId,
          product: order.productName || 'Unknown Product',
          amount: orderAmount,
          method: 'mobile_money',
          status: 'in_escrow',
          date: order.updatedAt || order.createdAt || new Date().toISOString(),
          provider: 'M-Pesa',
          phoneNumber: '+255 789 456 123',
          bankName: 'CRDB Bank',
          accountNumber: '0154897654321',
          originalOrder: order,
          source: 'api'
        });
      }
      
      // 2. Refunded = after admin approve a dispute from a buyer
      if (order.status === 'refunded') {
        payouts.push({
          id: `PYT-REF-${orderId}`,
          orderId: orderId,
          product: order.productName || 'Unknown Product',
          amount: orderAmount,
          method: 'mobile_money',
          status: 'refunded',
          date: order.updatedAt || order.createdAt || new Date().toISOString(),
          provider: 'M-Pesa',
          phoneNumber: '+255 712 345 678',
          bankName: 'NMB Bank',
          accountNumber: '7823415678901',
          originalOrder: order,
          source: 'api'
        });
      }
      
      // 3. Withdrawn = after withdraw available balance (from API)
      if (order.status === 'completed' && order.payoutProcessed) {
        payouts.push({
          id: `PYT-WTH-${orderId}`,
          orderId: orderId,
          product: order.productName || 'Unknown Product',
          amount: orderAmount,
          method: 'mobile_money',
          status: 'withdrawn',
          date: order.payoutDate || order.updatedAt || new Date().toISOString(),
          provider: 'Tigo Pesa',
          phoneNumber: '+255 768 123 456',
          bankName: 'Bank of Tanzania',
          accountNumber: '1234567890123',
          originalOrder: order,
          source: 'api'
        });
      }
    });

    return payouts;
  };

  // Calculate KPI stats based on your business rules
  const calculateKpiStats = (payouts, orders) => {
    let available = 0;
    let inEscrow = 0;
    let refunded = 0;
    let withdrawn = 0;

    // Calculate available from completed orders (not shown in table)
    orders.forEach(order => {
      if (order.status === 'completed') {
        available += parseInt(order.productPrice) || 0;
      }
    });

    // Calculate table statuses from payouts
    payouts.forEach(payout => {
      if (payout.status === 'in_escrow') {
        inEscrow += payout.amount;
      } else if (payout.status === 'refunded') {
        refunded += payout.amount;
      } else if (payout.status === 'withdrawn') {
        withdrawn += payout.amount;
      }
    });

    const newStats = {
      available,
      inEscrow,
      refunded,
      withdrawn
    };

    setKpiStats(newStats);
    return newStats;
  };

  // Mock data fallback
  const getMockPayouts = () => [
    {
      id: 'PYT-ESC-pl_kj83hd92lmge0p45t',
      orderId: 'pl_kj83hd92lmge0p45t',
      product: 'MacBook Air M2 13-inch 8GB 256GB',
      amount: 3250000,
      method: 'mobile_money',
      status: 'in_escrow',
      date: '2024-01-14',
      provider: 'M-Pesa',
      phoneNumber: '+255 712 345 678',
      bankName: 'NMB Bank',
      accountNumber: '7823415678901',
      source: 'mock'
    },
    {
      id: 'PYT-REF-pl_93ksh82lmge0p91m',
      orderId: 'pl_93ksh82lmge0p91m',
      product: 'AirPods Pro 2nd Generation',
      amount: 850000,
      method: 'mobile_money',
      status: 'refunded',
      date: '2024-01-13',
      provider: 'M-Pesa',
      phoneNumber: '+255 765 432 109',
      bankName: 'CRDB Bank',
      accountNumber: '0154897654321',
      source: 'mock'
    },
    {
      id: 'PYT-WTH-pl_r72jd92lmge0p63n',
      orderId: 'pl_r72jd92lmge0p63n',
      product: 'iPad Air 5th Generation 64GB',
      amount: 1850000,
      method: 'mobile_money',
      status: 'withdrawn',
      date: '2024-01-12',
      provider: 'Tigo Pesa',
      phoneNumber: '+255 768 123 456',
      bankName: 'Bank of Tanzania',
      accountNumber: '1234567890123',
      source: 'mock'
    },
    {
      id: 'PYT-ESC-pl_d7ys7v92lmge0p72s',
      orderId: 'pl_d7ys7v92lmge0p72s',
      product: 'iPhone 15 Pro Max 256GB Deep Purple',
      amount: 2450000,
      method: 'mobile_money',
      status: 'in_escrow',
      date: '2024-01-15',
      provider: 'M-Pesa',
      phoneNumber: '+255 789 456 123',
      bankName: 'CRDB Bank',
      accountNumber: '0154897654321',
      source: 'mock'
    }
  ];

  // Handle refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchPayouts();
    setTimeout(() => {
      setIsRefreshing(false);
      showNotification('Payouts data has been successfully updated.', 'success');
    }, 1000);
  };

  // Handle password verification for withdrawal
  const handlePasswordVerification = async () => {
    if (!password) {
      showNotification('Please enter your password', 'error');
      return;
    }

    setPasswordLoading(true);

    try {
      // Verify password with the existing login API
      await verifyPasswordWithAPI(password);
      
      // Process the withdrawal after successful password verification
      await processWithdrawal();
      
      showNotification('Withdrawal processed successfully!', 'success');
      setShowPasswordModal(false);
      setPassword('');
      
    } catch (error) {
      console.error('Withdrawal error:', error);
      showNotification(error.message || 'Withdrawal failed. Please try again.', 'error');
    } finally {
      setPasswordLoading(false);
    }
  };

  // Process withdrawal and update local state
  const processWithdrawal = async () => {
    const withdrawalAmount = parseInt(withdrawAmount);
    
    if (withdrawalAmount > kpiStats.available) {
      throw new Error('Insufficient balance');
    }

    // Create new withdrawn payout record
    const newWithdrawnPayout = {
      id: `PYT-WTH-${Date.now()}`,
      orderId: `WTH-${Date.now()}`,
      product: 'Funds Withdrawal',
      amount: withdrawalAmount,
      method: selectedMethod,
      status: 'withdrawn',
      date: new Date().toISOString(),
      provider: mobileMoneyAgents.find(a => a.id === selectedAgent)?.name || 'M-Pesa',
      phoneNumber: phoneNumber,
      bankName: selectedMethod === 'bank_transfer' ? 'CRDB Bank' : undefined,
      accountNumber: selectedMethod === 'bank_transfer' ? '0154897654321' : undefined,
      source: 'local'
    };

    // Update payouts data - add the new withdrawn record
    setPayoutsData(prev => [newWithdrawnPayout, ...prev]);

    // Update KPI stats
    const updatedStats = {
      ...kpiStats,
      available: kpiStats.available - withdrawalAmount,
      withdrawn: kpiStats.withdrawn + withdrawalAmount
    };

    setKpiStats(updatedStats);

    // Save to localStorage to persist across refreshes
    saveWithdrawalToStorage(newWithdrawnPayout);
    saveKpiStatsToStorage(updatedStats);

    // Reset withdrawal form
    setShowWithdrawModal(false);
    setSelectedMethod('');
    setSelectedAgent('');
    setPhoneNumber('');
    setWithdrawAmount('');
  };

  // Handle withdraw submission - opens password modal
  const handleWithdrawSubmit = () => {
    if (selectedMethod === 'mobile_money') {
      if (!selectedAgent || !phoneNumber || !withdrawAmount) {
        showNotification('Please fill all required fields', 'error');
        return;
      }
      
      const withdrawalAmount = parseInt(withdrawAmount);
      if (withdrawalAmount > kpiStats.available) {
        showNotification('Insufficient available balance', 'error');
        return;
      }

      if (withdrawalAmount < 1000) {
        showNotification('Minimum withdrawal amount is Tsh 1,000', 'error');
        return;
      }

      // Open password verification modal instead of processing directly
      setShowPasswordModal(true);
    }
  };

  // Filter payouts based on search and time filter
  const filterPayoutsByDate = (payouts, filter, customRange) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return payouts.filter(payout => {
      const payoutDate = new Date(payout.date);
      
      switch (filter) {
        case 'today':
          return payoutDate.toDateString() === today.toDateString();
        case 'week':
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          return payoutDate >= weekAgo;
        case 'month':
          const monthAgo = new Date(today);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          return payoutDate >= monthAgo;
        case 'custom':
          if (!customRange.start || !customRange.end) return true;
          const startDate = new Date(customRange.start);
          const endDate = new Date(customRange.end);
          endDate.setHours(23, 59, 59, 999);
          return payoutDate >= startDate && payoutDate <= endDate;
        default: // 'all'
          return true;
      }
    });
  };

  const filteredPayouts = filterPayoutsByDate(payoutsData, timeFilter, customDateRange).filter(payout => {
    const matchesSearch = 
      payout.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payout.orderId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payout.product?.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

  // Handle payout ID click (opens details modal)
  const handlePayoutIdClick = (payout) => {
    setSelectedPayout(payout);
    setShowDetailsModal(true);
    setActiveMenu(null);
  };

  const handleViewDetails = (payout) => {
    setSelectedPayout(payout);
    setShowDetailsModal(true);
    setActiveMenu(null);
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

  const closeModal = () => {
    setShowWithdrawModal(false);
    setSelectedMethod('');
    setSelectedAgent('');
    setPhoneNumber('');
    setWithdrawAmount('');
  };

  const closePasswordModal = () => {
    setShowPasswordModal(false);
    setPassword('');
    setPasswordLoading(false);
    setShowPassword(false);
  };

  const closeDetailsModal = () => {
    setShowDetailsModal(false);
    setSelectedPayout(null);
  };

  const toggleMenu = (payoutId) => {
    setActiveMenu(activeMenu === payoutId ? null : payoutId);
  };

  const toggleAvailableBalance = () => {
    setShowAvailableBalance(!showAvailableBalance);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Fetch payouts on component mount
  useEffect(() => {
    fetchPayouts();
  }, []);

  if (loading) {
    return (
      <StableLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Loader className="h-12 w-12 text-primary-500 animate-spin mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-gray-900">Loading Payouts</h2>
            <p className="text-gray-600">Please wait while we fetch your payouts data...</p>
          </div>
        </div>
      </StableLayout>
    );
  }

  return (
    <StableLayout>
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Platform Notification */}
          {notification.show && (
            <div className={`fixed top-4 right-4 z-50 max-w-sm animate-slide-in ${
              notification.type === 'error' 
                ? 'bg-red-50 border border-red-200 text-red-800' 
                : 'bg-green-50 border border-green-200 text-green-800'
            } rounded-lg shadow-lg p-4 flex items-start space-x-3`}>
              {notification.type === 'error' ? (
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              ) : (
                <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <p className="text-sm font-medium">{notification.message}</p>
              </div>
              <button
                onClick={() => setNotification({ show: false, message: '', type: '' })}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
          
          {/* Page Header with Refresh Button */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Payouts</h1>
              <p className="text-gray-600">Manage your earnings and withdrawal requests</p>
            </div>
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center space-x-2 bg-primary-500 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>

          {/* FIXED: Normal KPI Stats Grid - No excessive white space */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {/* Available Balance - Full width on mobile, first column on desktop */}
            <div className="md:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow h-full">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-gray-600">Available Balance</p>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={toggleAvailableBalance}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showAvailableBalance ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                    <div className="bg-green-50 p-2 rounded-lg">
                      <DollarSign className="h-5 w-5 text-green-500" />
                    </div>
                  </div>
                </div>
                <div className="mb-2">
                  {showAvailableBalance ? (
                    <p className="text-2xl font-bold text-green-500">
                      {formatCurrency(kpiStats.available)}
                    </p>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <div className="h-7 bg-gray-300 rounded w-24 animate-pulse"></div>
                      <span className="text-gray-400">••••••</span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 mb-4">Completed orders ready for withdrawal</p>
                
                {/* Withdraw Button */}
                <button
                  onClick={handleWithdraw}
                  disabled={kpiStats.available === 0}
                  className="w-full bg-primary-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-primary-600 transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  <Download className="h-4 w-4" />
                  <span>Withdraw Funds</span>
                </button>
              </div>
            </div>

            {/* In Escrow & Refunded - 2 columns on mobile, span 2 columns on desktop */}
            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* In Escrow */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-1">In Escrow</p>
                    <p className="text-2xl font-bold text-orange-500 mb-2">
                      {formatCurrency(kpiStats.inEscrow)}
                    </p>
                    <p className="text-xs text-gray-500">Paid, delivered, and disputed orders</p>
                  </div>
                  <div className="bg-orange-50 p-2 rounded-lg ml-3">
                    <Clock className="h-5 w-5 text-orange-500" />
                  </div>
                </div>
              </div>

              {/* Refunded */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600 mb-1">Refunded</p>
                    <p className="text-2xl font-bold text-red-500 mb-2">
                      {formatCurrency(kpiStats.refunded)}
                    </p>
                    <p className="text-xs text-gray-500">Refunded amounts</p>
                  </div>
                  <div className="bg-red-50 p-2 rounded-lg ml-3">
                    <Clock className="h-5 w-5 text-red-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Control Bar - Search and Time Filter - Mobile Optimized */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search Bar - Full width on mobile, flexible on desktop */}
              <div className="flex-1 min-w-0">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    placeholder="Search payouts, orders, products..."
                  />
                </div>
              </div>

              {/* Time Filter Dropdown - Same row on mobile */}
              <div className="flex gap-2 w-full lg:w-auto">
                <select
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(e.target.value)}
                  className="w-full lg:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm font-medium"
                >
                  {timeFilterOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Custom Date Picker - Only show when custom is selected */}
            {timeFilter === 'custom' && (
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
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
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
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Desktop Table - Hidden on mobile */}
          <div className="hidden lg:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">Payout ID & Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">Order ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">Product</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/6">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/12">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPayouts.map((payout) => {
                    const MethodIcon = methodConfig[payout.method]?.icon || Building;
                    return (
                      <tr key={payout.id} className="hover:bg-gray-50">
                        {/* Payout ID & Date in same column */}
                        <td className="px-4 py-3">
                          <button
                            onClick={() => handlePayoutIdClick(payout)}
                            className="text-left hover:text-primary-600 transition-colors group"
                          >
                            <div className="flex items-center space-x-1 mb-1">
                              <span className="text-sm font-medium text-primary-600 group-hover:text-primary-700">
                                {truncateText(payout.id, 18)}
                              </span>
                              <ExternalLink className="h-3 w-3 text-primary-500 group-hover:text-primary-600" />
                            </div>
                            <div className="text-xs text-gray-500 flex items-center space-x-1">
                              <CalendarIcon className="h-3 w-3" />
                              <span>{formatDate(payout.date)}</span>
                            </div>
                          </button>
                        </td>
                        
                        {/* Order ID */}
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {truncateText(payout.orderId, 15)}
                        </td>
                        
                        {/* Product Name */}
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {truncateText(payout.product, 25)}
                        </td>
                        
                        {/* Amount */}
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {formatCurrency(payout.amount)}
                        </td>
                        
                        {/* Status */}
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusConfig[payout.status]?.color || 'bg-gray-100 text-gray-800'}`}>
                            {statusConfig[payout.status]?.label || payout.status}
                          </span>
                        </td>
                        
                        {/* Actions */}
                        <td className="px-4 py-3 text-sm font-medium">
                          <div className="relative">
                            <button
                              onClick={() => toggleMenu(payout.id)}
                              className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </button>
                            
                            {activeMenu === payout.id && (
                              <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-32">
                                <button
                                  onClick={() => handleViewDetails(payout)}
                                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                                >
                                  <Eye className="h-4 w-4" />
                                  <span>View Details</span>
                                </button>
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
                <DollarSign className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No payouts found matching your criteria</p>
              </div>
            )}
          </div>

          {/* Mobile Cards - Show only on mobile */}
          <div className="lg:hidden space-y-3">
            {filteredPayouts.map((payout) => {
              const MethodIcon = methodConfig[payout.method]?.icon || Building;
              return (
                <div key={payout.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
                  {/* Header - Payout ID and Status */}
                  <div className="flex justify-between items-start mb-3">
                    <button
                      onClick={() => handlePayoutIdClick(payout)}
                      className="text-left group flex-1"
                    >
                      <div className="flex items-center space-x-1 mb-1">
                        <span className="text-sm font-medium text-primary-600 group-hover:text-primary-700">
                          {truncateText(payout.id, 22)}
                        </span>
                        <ExternalLink className="h-3 w-3 text-primary-500 flex-shrink-0" />
                      </div>
                      <div className="text-xs text-gray-500 flex items-center space-x-1">
                        <CalendarIcon className="h-3 w-3" />
                        <span>{formatDate(payout.date)}</span>
                      </div>
                    </button>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusConfig[payout.status]?.color || 'bg-gray-100 text-gray-800'}`}>
                      {statusConfig[payout.status]?.label || payout.status}
                    </span>
                  </div>

                  {/* Order Info */}
                  <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                    <div>
                      <p className="text-gray-500 text-xs">Order ID</p>
                      <p className="font-medium">{truncateText(payout.orderId, 16)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Product</p>
                      <p className="font-medium">{truncateText(payout.product, 20)}</p>
                    </div>
                  </div>

                  {/* Amount and Method */}
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <p className="text-gray-500 text-xs">Amount</p>
                      <p className="font-semibold text-base">{formatCurrency(payout.amount)}</p>
                    </div>
                    <div className="flex items-center space-x-1 text-gray-600">
                      <MethodIcon className="h-4 w-4" />
                      <span className="text-xs">{methodConfig[payout.method]?.label || 'Bank Transfer'}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                    <button
                      onClick={() => handleViewDetails(payout)}
                      className="flex items-center space-x-1 text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      <Eye className="h-4 w-4" />
                      <span>View Details</span>
                    </button>
                    <button
                      onClick={() => toggleMenu(payout.id)}
                      className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Dropdown Menu */}
                  {activeMenu === payout.id && (
                    <div className="mt-2 bg-white border border-gray-200 rounded-lg shadow-lg">
                      <button
                        onClick={() => handleViewDetails(payout)}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center space-x-2"
                      >
                        <Eye className="h-4 w-4" />
                        <span>View Details</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Empty State for Mobile */}
            {filteredPayouts.length === 0 && (
              <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
                <DollarSign className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 text-sm">No payouts found matching your criteria</p>
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
                  <span className="text-base sm:text-lg font-bold text-green-900">{formatCurrency(kpiStats.available)}</span>
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
                            max={kpiStats.available}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Available: {formatCurrency(kpiStats.available)}
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

      {/* Password Verification Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-sm mx-auto animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
              <div className="flex items-center">
                <div className="bg-primary-100 p-2 rounded-lg mr-3">
                  <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">Verify Withdrawal</h3>
                  <p className="text-xs sm:text-sm text-gray-600">Enter your password to confirm</p>
                </div>
              </div>
              <button
                onClick={closePasswordModal}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 sm:p-6">
              <div className="text-center mb-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-yellow-800">
                    You are about to withdraw <strong>{formatCurrency(parseInt(withdrawAmount))}</strong> to {mobileMoneyAgents.find(a => a.id === selectedAgent)?.name}
                  </p>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  For security purposes, please enter your account password to confirm this withdrawal.
                </p>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Password
                </label>
                <div className="relative">
                  <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your account password"
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex border-t border-gray-200 p-4 sm:p-6">
              <button
                onClick={closePasswordModal}
                disabled={passwordLoading}
                className="flex-1 bg-gray-100 text-gray-700 py-2 sm:py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors mr-2 sm:mr-3 text-sm sm:text-base disabled:opacity-50"
              >
                Cancel
              </button>
              
              <button
                onClick={handlePasswordVerification}
                disabled={passwordLoading || !password}
                className="flex-1 bg-primary-500 text-white py-2 sm:py-3 rounded-lg font-medium hover:bg-primary-600 transition-colors flex items-center justify-center space-x-1 sm:space-x-2 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {passwordLoading ? (
                  <>
                    <Loader className="h-4 w-4 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4" />
                    <span>Verify</span>
                  </>
                )}
              </button>
            </div>

            {/* Resend Option */}
            <div className="px-4 sm:px-6 pb-4 sm:pb-6">
              <button className="text-xs text-primary-600 hover:text-primary-700 font-medium">
                Forgot Password? Reset it here
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payout Details Modal */}
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
                      {methodConfig[selectedPayout.method]?.label || 'Bank Transfer'}
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-500">Status</p>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig[selectedPayout.status]?.color || 'bg-gray-100 text-gray-800'}`}>
                    {statusConfig[selectedPayout.status]?.label || selectedPayout.status}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-xs sm:text-sm font-medium text-gray-500">Date</p>
                <div className="flex items-center space-x-1 sm:space-x-2 mt-1">
                  <CalendarIcon className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400" />
                  <p className="text-xs sm:text-sm font-semibold text-gray-900">
                    {formatDate(selectedPayout.date)}
                  </p>
                </div>
              </div>

              {/* Provider Details */}
              <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                <p className="text-xs sm:text-sm font-medium text-gray-500 mb-2">
                  {selectedPayout.method === 'bank_transfer' ? 'Bank Details' : 'Provider Details'}
                </p>
                {selectedPayout.method === 'bank_transfer' ? (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-600">Bank Name:</span>
                      <span className="text-xs font-semibold text-gray-900">{selectedPayout.bankName || 'CRDB Bank'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-600">Account Number:</span>
                      <span className="text-xs font-semibold text-gray-900">{selectedPayout.accountNumber || '0154897654321'}</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-600">Provider:</span>
                      <span className="text-xs font-semibold text-gray-900">{selectedPayout.provider || 'M-Pesa'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-gray-600">Phone Number:</span>
                      <span className="text-xs font-semibold text-gray-900">{selectedPayout.phoneNumber || '+255 789 456 123'}</span>
                    </div>
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