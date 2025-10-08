import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import StableLayout from '../../components/common/layout/StableLayout';
import { 
  Bell, 
  ShoppingCart, 
  AlertTriangle, 
  MessageCircle, 
  DollarSign, 
  Settings,
  CheckCircle,
  Trash2,
  Filter,
  ExternalLink,
  Clock,
  Mail,
  Shield,
  Menu,
  X,
  RefreshCw
} from 'lucide-react';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [bulkAction, setBulkAction] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [notificationPreferences, setNotificationPreferences] = useState({
    emailAlerts: true,
    pushNotifications: true
  });
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  // Notification categories
  const notificationCategories = [
    { id: 'all', label: 'All Notifications', icon: Bell, color: 'text-gray-600' },
    { id: 'orders', label: 'Orders & Escrows', icon: ShoppingCart, color: 'text-blue-600' },
    { id: 'disputes', label: 'Disputes & Resolutions', icon: AlertTriangle, color: 'text-orange-600' },
    { id: 'messages', label: 'Messages & Feedback', icon: MessageCircle, color: 'text-purple-600' },
    { id: 'payments', label: 'Payments & Settlements', icon: DollarSign, color: 'text-green-600' },
    { id: 'system', label: 'System Updates', icon: Settings, color: 'text-gray-600' }
  ];

  useEffect(() => {
    loadNotifications();
    loadPersistedState();
    setupPushNotifications();
  }, []);

  // Load persisted state from localStorage
  const loadPersistedState = () => {
    if (typeof window !== 'undefined') {
      try {
        // Load filter preference
        const savedFilter = localStorage.getItem('notifications_filter');
        if (savedFilter) {
          setFilter(savedFilter);
        }

        // Load notification preferences
        const savedPreferences = localStorage.getItem('notification_preferences');
        if (savedPreferences) {
          setNotificationPreferences(JSON.parse(savedPreferences));
        }

        // Load read status for notifications (if we want to persist across sessions)
        const savedReadStatus = localStorage.getItem('notifications_read_status');
        if (savedReadStatus) {
          const readStatus = JSON.parse(savedReadStatus);
          setNotifications(prev => prev.map(noti => ({
            ...noti,
            isRead: readStatus[noti.id] || noti.isRead
          })));
        }
      } catch (error) {
        console.error('Error loading persisted state:', error);
      }
    }
  };

  // Save state to localStorage
  const savePersistedState = (key, value) => {
    if (typeof window !== 'undefined') {
      try {
        if (typeof value === 'object') {
          localStorage.setItem(key, JSON.stringify(value));
        } else {
          localStorage.setItem(key, value);
        }
      } catch (error) {
        console.error('Error saving persisted state:', error);
      }
    }
  };

  // Save read status when notifications change
  useEffect(() => {
    if (notifications.length > 0) {
      const readStatus = {};
      notifications.forEach(noti => {
        readStatus[noti.id] = noti.isRead;
      });
      savePersistedState('notifications_read_status', readStatus);
    }
  }, [notifications]);

  // Save filter when it changes
  useEffect(() => {
    savePersistedState('notifications_filter', filter);
  }, [filter]);

  // Save preferences when they change
  useEffect(() => {
    savePersistedState('notification_preferences', notificationPreferences);
  }, [notificationPreferences]);

  // Get authentication token
  const getAuthToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  };

  // Get current seller ID
  const getSellerId = () => {
    if (typeof window !== 'undefined') {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      return userData.id || userData._id;
    }
    return null;
  };

  // Setup push notifications
  const setupPushNotifications = () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          console.log('Push notification permission granted');
        }
      });
    }
  };

  // Show push notification
  const showPushNotification = (title, message) => {
    if (typeof window !== 'undefined' && notificationPreferences.pushNotifications && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body: message,
        icon: '/favicon.ico'
      });
    }
  };

  // Load real notifications from backend
  const loadNotifications = async () => {
    try {
      setIsLoading(true);
      const token = getAuthToken();
      const sellerId = getSellerId();

      if (!token || !sellerId) {
        console.log('No authentication found, using mock data');
        // Use mock data as fallback
        setNotifications(generateMockNotifications());
        setIsLoading(false);
        return;
      }

      console.log('🔄 Fetching notifications for seller:', sellerId);

      // Try to fetch from your actual backend API
      const response = await fetch(`http://localhost:5000/api/notifications/seller/${sellerId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📡 Real notifications from backend:', data);
        
        if (data.success && data.notifications) {
          // Transform backend data to frontend format
          const transformedNotifications = transformBackendNotifications(data.notifications);
          
          // Load persisted read status and apply it
          const persistedReadStatus = loadPersistedReadStatus();
          const notificationsWithPersistedState = transformedNotifications.map(noti => ({
            ...noti,
            isRead: persistedReadStatus[noti.id] !== undefined ? persistedReadStatus[noti.id] : noti.isRead
          }));
          
          setNotifications(notificationsWithPersistedState);
          console.log('✅ Real notifications loaded successfully:', notificationsWithPersistedState.length);
        } else {
          // Fallback to payment links if notifications endpoint doesn't return data
          await loadNotificationsFromPaymentLinks();
        }
      } else {
        console.log('Backend not available, using payment links data');
        // Fallback to payment links data
        await loadNotificationsFromPaymentLinks();
      }

    } catch (error) {
      console.error('❌ Error loading real notifications:', error);
      // Final fallback to mock data with persisted state
      const mockNotifications = generateMockNotifications();
      const persistedReadStatus = loadPersistedReadStatus();
      const notificationsWithPersistedState = mockNotifications.map(noti => ({
        ...noti,
        isRead: persistedReadStatus[noti.id] !== undefined ? persistedReadStatus[noti.id] : noti.isRead
      }));
      setNotifications(notificationsWithPersistedState);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  // Load persisted read status
  const loadPersistedReadStatus = () => {
    if (typeof window !== 'undefined') {
      try {
        const savedReadStatus = localStorage.getItem('notifications_read_status');
        return savedReadStatus ? JSON.parse(savedReadStatus) : {};
      } catch (error) {
        console.error('Error loading persisted read status:', error);
        return {};
      }
    }
    return {};
  };

  // Fallback: Generate notifications from payment links
  const loadNotificationsFromPaymentLinks = async () => {
    try {
      const token = getAuthToken();
      const sellerId = getSellerId();

      if (!token || !sellerId) {
        const mockNotifications = generateMockNotifications();
        const persistedReadStatus = loadPersistedReadStatus();
        const notificationsWithPersistedState = mockNotifications.map(noti => ({
          ...noti,
          isRead: persistedReadStatus[noti.id] !== undefined ? persistedReadStatus[noti.id] : noti.isRead
        }));
        setNotifications(notificationsWithPersistedState);
        return;
      }

      const response = await fetch(`http://localhost:5000/api/payment-links/seller/${sellerId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.paymentLinks) {
          const generatedNotifications = generateNotificationsFromPaymentLinks(data.paymentLinks);
          
          // Apply persisted read status
          const persistedReadStatus = loadPersistedReadStatus();
          const notificationsWithPersistedState = generatedNotifications.map(noti => ({
            ...noti,
            isRead: persistedReadStatus[noti.id] !== undefined ? persistedReadStatus[noti.id] : noti.isRead
          }));
          
          setNotifications(notificationsWithPersistedState);
          console.log('✅ Generated notifications from payment links:', notificationsWithPersistedState.length);
        } else {
          const mockNotifications = generateMockNotifications();
          const persistedReadStatus = loadPersistedReadStatus();
          const notificationsWithPersistedState = mockNotifications.map(noti => ({
            ...noti,
            isRead: persistedReadStatus[noti.id] !== undefined ? persistedReadStatus[noti.id] : noti.isRead
          }));
          setNotifications(notificationsWithPersistedState);
        }
      } else {
        const mockNotifications = generateMockNotifications();
        const persistedReadStatus = loadPersistedReadStatus();
        const notificationsWithPersistedState = mockNotifications.map(noti => ({
          ...noti,
          isRead: persistedReadStatus[noti.id] !== undefined ? persistedReadStatus[noti.id] : noti.isRead
        }));
        setNotifications(notificationsWithPersistedState);
      }
    } catch (error) {
      console.error('Error loading payment links for notifications:', error);
      const mockNotifications = generateMockNotifications();
      const persistedReadStatus = loadPersistedReadStatus();
      const notificationsWithPersistedState = mockNotifications.map(noti => ({
        ...noti,
        isRead: persistedReadStatus[noti.id] !== undefined ? persistedReadStatus[noti.id] : noti.isRead
      }));
      setNotifications(notificationsWithPersistedState);
    }
  };

  // Transform backend notifications to frontend format
  const transformBackendNotifications = (backendNotifications) => {
    return backendNotifications.map(noti => ({
      id: noti._id || noti.id,
      type: noti.type || 'system',
      title: noti.title || 'Notification',
      message: noti.message || noti.description || 'You have a new notification',
      isRead: noti.isRead || false,
      createdAt: noti.createdAt || noti.timestamp || new Date().toISOString(),
      link: noti.link || noti.actionUrl || null,
      priority: noti.priority || 'medium',
      // Store original data for consistency
      _original: noti
    }));
  };

  // Generate notifications from payment links data
  const generateNotificationsFromPaymentLinks = (paymentLinks) => {
    const notifications = [];

    paymentLinks.forEach(order => {
      const orderAmount = parseInt(order.productPrice) || 0;
      const orderId = order.linkId || order._id?.toString() || order.id;
      const productName = order.productName || 'Product';
      
      // Create notification based on order status
      switch (order.status) {
        case 'paid':
          notifications.push({
            id: `noti_paid_${orderId}`,
            type: 'orders',
            title: 'Payment Received',
            message: `Payment for ${productName} (Order #${orderId.slice(-6)}) has been received and is in escrow.`,
            isRead: false,
            createdAt: order.updatedAt || order.createdAt || new Date().toISOString(),
            link: `/seller/orders/${orderId}`,
            priority: 'high',
            _original: order
          });
          break;
          
        case 'completed':
          notifications.push({
            id: `noti_completed_${orderId}`,
            type: 'payments',
            title: 'Escrow Released',
            message: `Escrow for ${productName} has been released to your available balance.`,
            isRead: true,
            createdAt: order.updatedAt || order.createdAt || new Date().toISOString(),
            link: '/seller/payouts',
            priority: 'medium',
            _original: order
          });
          break;
          
        case 'disputed':
          notifications.push({
            id: `noti_disputed_${orderId}`,
            type: 'disputes',
            title: 'Dispute Raised',
            message: `A dispute has been raised for ${productName}. Please respond within 24 hours.`,
            isRead: false,
            createdAt: order.updatedAt || order.createdAt || new Date().toISOString(),
            link: `/seller/disputes/${orderId}`,
            priority: 'high',
            _original: order
          });
          break;
          
        case 'refunded':
          notifications.push({
            id: `noti_refunded_${orderId}`,
            type: 'payments',
            title: 'Refund Processed',
            message: `Refund for ${productName} has been processed.`,
            isRead: true,
            createdAt: order.updatedAt || order.createdAt || new Date().toISOString(),
            link: '/seller/payouts',
            priority: 'medium',
            _original: order
          });
          break;

        default:
          // Create notification for other statuses
          notifications.push({
            id: `noti_${order.status}_${orderId}`,
            type: 'orders',
            title: `Order ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}`,
            message: `Order #${orderId.slice(-6)} for ${productName} is now ${order.status}.`,
            isRead: false,
            createdAt: order.updatedAt || order.createdAt || new Date().toISOString(),
            link: `/seller/orders/${orderId}`,
            priority: 'medium',
            _original: order
          });
          break;
      }
    });

    // Sort by date (newest first)
    return notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  };

  // Generate mock notifications only as last resort
  const generateMockNotifications = () => {
    console.log('📝 Using mock notifications data');
    return [
      {
        id: 'mock-1',
        type: 'orders',
        title: 'New Order Received',
        message: 'You have received a new order for iPhone 13 Pro',
        isRead: false,
        createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        link: '/seller/orders/123',
        priority: 'high',
        _original: { _id: 'mock-1', source: 'mock' }
      },
      {
        id: 'mock-2',
        type: 'payments',
        title: 'Payment Processed',
        message: 'Payment of $999 has been processed successfully',
        isRead: true,
        createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
        link: '/seller/payouts',
        priority: 'medium',
        _original: { _id: 'mock-2', source: 'mock' }
      }
    ];
  };

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadNotifications();
  };

  // Update backend when marking as read
  const updateBackendReadStatus = async (notificationId, isRead = true) => {
    try {
      const token = getAuthToken();
      if (!token) return;

      // Update backend
      const response = await fetch(`http://localhost:5000/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isRead })
      });

      if (response.ok) {
        console.log('✅ Backend updated for notification:', notificationId);
      }
    } catch (error) {
      console.error('Error updating backend read status:', error);
    }
  };

  // Update backend when deleting
  const deleteFromBackend = async (notificationId) => {
    try {
      const token = getAuthToken();
      if (!token) return;

      const response = await fetch(`http://localhost:5000/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        console.log('✅ Backend deleted notification:', notificationId);
      }
    } catch (error) {
      console.error('Error deleting from backend:', error);
    }
  };

  // Mark single notification as read
  const markAsRead = async (notificationId, e = null) => {
    if (e) e.stopPropagation();
    
    console.log('📖 Marking notification as read:', notificationId);
    
    try {
      // Update backend first
      await updateBackendReadStatus(notificationId, true);
      
      // Then update local state
      setNotifications(prev => 
        prev.map(noti => 
          noti.id === notificationId ? { ...noti, isRead: true } : noti
        )
      );
      
      console.log('✅ Notification marked as read:', notificationId);
      showPushNotification('Notification Read', 'Notification has been marked as read.');
      
    } catch (error) {
      console.error('Error marking notification as read:', error);
      // Still update local state for better UX
      setNotifications(prev => 
        prev.map(noti => 
          noti.id === notificationId ? { ...noti, isRead: true } : noti
        )
      );
    }
  };

  // Mark all notifications as read
  const markAllAsRead = async () => {
    console.log('📖 Marking all notifications as read');
    
    try {
      setActionLoading(true);
      const token = getAuthToken();
      const sellerId = getSellerId();

      if (token && sellerId) {
        // Update backend
        const response = await fetch(`http://localhost:5000/api/notifications/seller/${sellerId}/read-all`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          console.log('✅ Backend updated for all notifications');
        }
      }

      // Update local state
      setNotifications(prev => 
        prev.map(noti => ({ ...noti, isRead: true }))
      );
      
      console.log('✅ All notifications marked as read');
      showPushNotification('All Notifications Read', 'All notifications have been marked as read.');
      
    } catch (error) {
      console.error('Error marking all as read:', error);
      // Still update local state
      setNotifications(prev => 
        prev.map(noti => ({ ...noti, isRead: true }))
      );
    } finally {
      setActionLoading(false);
    }
  };

  // Delete single notification
  const deleteNotification = async (notificationId, e = null) => {
    if (e) e.stopPropagation();
    
    console.log('🗑️ Deleting notification:', notificationId);
    
    try {
      // Update backend first
      await deleteFromBackend(notificationId);
      
      // Then update local state
      setNotifications(prev => 
        prev.filter(noti => noti.id !== notificationId)
      );
      
      if (selectedNotification?.id === notificationId) {
        setSelectedNotification(null);
      }
      
      console.log('✅ Notification deleted:', notificationId);
      showPushNotification('Notification Deleted', 'The notification has been successfully removed.');
      
    } catch (error) {
      console.error('Error deleting notification:', error);
      // Still update local state for better UX
      setNotifications(prev => 
        prev.filter(noti => noti.id !== notificationId)
      );
      if (selectedNotification?.id === notificationId) {
        setSelectedNotification(null);
      }
    }
  };

  // Clear all notifications
  const clearAll = async () => {
    console.log('🗑️ Clearing all notifications');
    
    try {
      setActionLoading(true);
      const token = getAuthToken();
      const sellerId = getSellerId();

      if (token && sellerId) {
        // Clear all from backend
        const response = await fetch(`http://localhost:5000/api/notifications/seller/${sellerId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          console.log('✅ Backend cleared all notifications');
        }
      }

      // Update local state
      setNotifications([]);
      setSelectedNotification(null);
      
      console.log('✅ All notifications cleared');
      showPushNotification('All Notifications Cleared', 'All notifications have been successfully removed.');
      
    } catch (error) {
      console.error('Error clearing all notifications:', error);
      // Still update local state
      setNotifications([]);
      setSelectedNotification(null);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle bulk actions from dropdown
  const handleBulkAction = (action) => {
    console.log('🔄 Executing bulk action:', action);
    
    if (!action) return;

    switch (action) {
      case 'mark_all_read':
        markAllAsRead();
        break;
      case 'clear_all':
        clearAll();
        break;
      default:
        console.warn('Unknown bulk action:', action);
    }

    // Reset dropdown
    setBulkAction('');
  };

  const handleNotificationClick = (notification) => {
    console.log('📱 Notification clicked:', notification.id);
    setSelectedNotification(notification);
  };

  const handleViewAction = (notification, e) => {
    e.stopPropagation();
    
    console.log('👀 View action for:', notification.id);
    
    // Mark as read first
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    
    // Navigate based on notification type
    if (notification.link && notification.type !== 'system') {
      if (notification.type === 'orders') {
        router.push('/seller/orders');
      } else if (notification.type === 'disputes') {
        router.push('/seller/disputes');
      } else if (notification.type === 'payments') {
        router.push('/seller/payouts');
      }
      showPushNotification('Navigation', `Taking you to ${notification.type} page`);
    } else {
      console.log('No navigation for system notifications');
    }
  };

  const handleTogglePreference = (preferenceType) => {
    console.log('⚙️ Toggling preference:', preferenceType);
    
    const newPreferences = {
      ...notificationPreferences,
      [preferenceType]: !notificationPreferences[preferenceType]
    };
    
    setNotificationPreferences(newPreferences);
    
    const message = newPreferences[preferenceType] 
      ? `${preferenceType === 'emailAlerts' ? 'Email' : 'Push'} notifications enabled`
      : `${preferenceType === 'emailAlerts' ? 'Email' : 'Push'} notifications disabled`;
    
    console.log('✅ Preference updated:', message);
    showPushNotification('Notification Settings', message);
  };

  const testNotification = () => {
    console.log('🧪 Testing notifications');
    
    const testNoti = {
      title: 'Test Notification',
      message: 'This is a test notification to verify the system is working.'
    };
    
    if (notificationPreferences.pushNotifications) {
      showPushNotification(testNoti.title, testNoti.message);
    }
    
    // Add a test notification to the list (temporary)
    const testNotification = {
      id: `test-${Date.now()}`,
      type: 'system',
      title: 'Test Notification',
      message: 'This is a test notification added to your list',
      isRead: false,
      createdAt: new Date().toISOString(),
      link: null,
      priority: 'low',
      _original: { _id: `test-${Date.now()}`, source: 'test' }
    };
    
    setNotifications(prev => [testNotification, ...prev]);
  };

  const getFilteredNotifications = () => {
    if (filter === 'all') {
      return notifications;
    }
    return notifications.filter(noti => noti.type === filter);
  };

  const getUnreadCount = () => {
    return notifications.filter(noti => !noti.isRead).length;
  };

  const getUnreadCountByType = (type) => {
    return notifications.filter(noti => !noti.isRead && (type === 'all' || noti.type === type)).length;
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getNotificationIcon = (type) => {
    const category = notificationCategories.find(cat => cat.id === type);
    return category ? category.icon : Bell;
  };

  const getNotificationColor = (type) => {
    const category = notificationCategories.find(cat => cat.id === type);
    return category ? category.color : 'text-gray-600';
  };

  const filteredNotifications = getFilteredNotifications();

  if (isLoading) {
    return (
      <StableLayout>
        <div className="min-h-screen bg-gray-50 p-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center min-h-96">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading notifications...</p>
              </div>
            </div>
          </div>
        </div>
      </StableLayout>
    );
  }

  return (
    <StableLayout>
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          
          {/* Header - Mobile Optimized */}
          <div className="mb-4">
            <div className="flex flex-col space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
                  <p className="text-xs text-gray-600 mt-1">
                    Stay updated with your business activities
                  </p>
                </div>
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    refreshing 
                      ? 'bg-primary-400 cursor-not-allowed' 
                      : 'bg-primary-600 hover:bg-primary-700'
                  } text-white`}
                >
                  <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
                  <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
                </button>
              </div>
              
              {/* Bulk Actions - Mobile Optimized */}
              <div className="flex items-center space-x-2">
                <select
                  value={bulkAction}
                  onChange={(e) => {
                    console.log('Dropdown changed:', e.target.value);
                    handleBulkAction(e.target.value);
                  }}
                  disabled={actionLoading || notifications.length === 0}
                  className={`flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm ${
                    actionLoading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <option value="">Bulk Actions</option>
                  <option 
                    value="mark_all_read" 
                    disabled={getUnreadCount() === 0}
                  >
                    Mark All as Read {getUnreadCount() > 0 && `(${getUnreadCount()} unread)`}
                  </option>
                  <option value="clear_all">Clear All Notifications</option>
                </select>
                {actionLoading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                )}
              </div>

              {/* Quick Stats */}
              <div className="flex items-center space-x-4 text-xs text-gray-600">
                <span className="flex items-center space-x-1">
                  <span>Total:</span>
                  <span className="font-medium text-gray-900">{notifications.length}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span>Unread:</span>
                  <span className="font-medium text-red-600">{getUnreadCount()}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span>Source:</span>
                  <span className="font-medium text-blue-600">
                    {notifications[0]?._original?.source === 'mock' ? 'Demo Data' : 'Real Data'}
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Mobile Category Navigation */}
          <div className="lg:hidden mb-4">
            <div className="bg-white rounded-lg border border-gray-200 p-1">
              <div className="flex space-x-1 overflow-x-auto">
                {notificationCategories.map((category) => {
                  const Icon = category.icon;
                  const unreadCount = getUnreadCountByType(category.id);
                  const isActive = filter === category.id;
                  
                  return (
                    <button
                      key={category.id}
                      onClick={() => setFilter(category.id)}
                      className={`flex items-center space-x-1 px-3 py-2 rounded-md text-xs font-medium transition-colors flex-shrink-0 ${
                        isActive 
                          ? 'bg-primary-100 text-primary-700 border border-primary-200' 
                          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className={`h-3 w-3 ${isActive ? category.color : 'text-gray-400'}`} />
                      <span className="whitespace-nowrap">
                        {category.id === 'all' ? 'All' : 
                         category.id === 'orders' ? 'Orders' :
                         category.id === 'disputes' ? 'Disputes' :
                         category.id === 'messages' ? 'Messages' :
                         category.id === 'payments' ? 'Payments' : 'System'}
                      </span>
                      {unreadCount > 0 && (
                        <span className={`text-xs font-medium px-1 py-0.5 rounded-full min-w-4 text-center ${
                          isActive ? 'bg-primary-200 text-primary-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {unreadCount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Sidebar - Notification Categories (Desktop) */}
            <div className="hidden lg:block lg:col-span-1">
              <div className="bg-white rounded-lg border border-gray-200 p-4 sticky top-6">
                <h3 className="text-base font-semibold text-gray-900 mb-3">Categories</h3>
                <div className="space-y-1">
                  {notificationCategories.map((category) => {
                    const Icon = category.icon;
                    const unreadCount = getUnreadCountByType(category.id);
                    
                    return (
                      <button
                        key={category.id}
                        onClick={() => setFilter(category.id)}
                        className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors ${
                          filter === category.id 
                            ? 'bg-primary-50 border border-primary-200' 
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <Icon className={`h-4 w-4 ${category.color}`} />
                          <span className="font-medium text-gray-700 text-sm">{category.label}</span>
                        </div>
                        {unreadCount > 0 && (
                          <span className="bg-red-500 text-white text-xs font-medium px-1.5 py-0.5 rounded-full min-w-5 text-center">
                            {unreadCount}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Quick Stats */}
                <div className="mt-4 pt-3 border-t border-gray-200">
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total</span>
                      <span className="font-medium text-gray-900">{notifications.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Unread</span>
                      <span className="font-medium text-red-600">{getUnreadCount()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content - Notifications List */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg border border-gray-200">
                {/* Header */}
                <div className="p-3 border-b border-gray-200">
                  <div className="flex items-center space-x-2">
                    <Filter className="h-4 w-4 text-gray-400" />
                    <div>
                      <h2 className="text-base font-semibold text-gray-900">
                        {filter === 'all' ? 'All Notifications' : 
                         notificationCategories.find(cat => cat.id === filter)?.label}
                      </h2>
                      <p className="text-xs text-gray-500">
                        {filteredNotifications.length} notification{filteredNotifications.length !== 1 ? 's' : ''}
                        {getUnreadCountByType(filter) > 0 && ` • ${getUnreadCountByType(filter)} unread`}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Notifications List */}
                <div className="divide-y divide-gray-100 max-h-[70vh] overflow-y-auto">
                  {filteredNotifications.length > 0 ? (
                    filteredNotifications.map((notification) => {
                      const Icon = getNotificationIcon(notification.type);
                      const iconColor = getNotificationColor(notification.type);
                      
                      return (
                        <div
                          key={notification.id}
                          className={`p-3 hover:bg-gray-50 transition-colors cursor-pointer ${
                            !notification.isRead ? 'bg-blue-50' : ''
                          }`}
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className="flex items-start space-x-3">
                            {/* Notification Icon */}
                            <div className={`p-1.5 rounded ${!notification.isRead ? 'bg-white' : 'bg-gray-100'}`}>
                              <Icon className={`h-4 w-4 ${iconColor}`} />
                            </div>

                            {/* Notification Content */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-1">
                                <div className="flex items-center space-x-1 flex-1 min-w-0">
                                  <h3 className={`text-sm font-medium truncate ${
                                    !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                                  }`}>
                                    {notification.title}
                                  </h3>
                                  {!notification.isRead && (
                                    <span className="w-1.5 h-1.5 bg-blue-500 rounded-full flex-shrink-0"></span>
                                  )}
                                </div>
                                <div className="flex items-center space-x-1 text-xs text-gray-500 flex-shrink-0 ml-2">
                                  <Clock className="h-3 w-3" />
                                  <span>{formatTimeAgo(notification.createdAt)}</span>
                                </div>
                              </div>
                              
                              <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                                {notification.message}
                              </p>

                              {/* Actions */}
                              <div className="flex items-center space-x-3">
                                {notification.link && notification.type !== 'system' && (
                                  <button
                                    onClick={(e) => handleViewAction(notification, e)}
                                    className="text-primary-600 hover:text-primary-700 text-xs font-medium flex items-center space-x-1"
                                  >
                                    <span>View</span>
                                    <ExternalLink className="h-3 w-3" />
                                  </button>
                                )}
                                
                                <div className="flex items-center space-x-2">
                                  {!notification.isRead && (
                                    <button
                                      onClick={(e) => markAsRead(notification.id, e)}
                                      className="text-gray-400 hover:text-gray-600 text-xs flex items-center space-x-1"
                                    >
                                      <CheckCircle className="h-3 w-3" />
                                      <span>Read</span>
                                    </button>
                                  )}
                                  
                                  <button
                                    onClick={(e) => deleteNotification(notification.id, e)}
                                    className="text-gray-400 hover:text-red-600 text-xs flex items-center space-x-1"
                                    >
                                    <Trash2 className="h-3 w-3" />
                                    <span>Delete</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    /* Empty State */
                    <div className="p-6 text-center">
                      <div className="flex flex-col items-center justify-center space-y-2">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                          <Bell className="h-6 w-6 text-gray-400" />
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-gray-900 mb-1">No notifications</h3>
                          <p className="text-gray-600 text-xs">
                            {filter === 'all' 
                              ? "You're all caught up!"
                              : `No ${filter} notifications found.`
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Notification Settings Preview */}
              <div className="mt-4 bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-semibold text-gray-900">Notification Preferences</h3>
                  <button
                    onClick={testNotification}
                    className="text-xs bg-primary-600 text-white px-3 py-1 rounded hover:bg-primary-700 transition-colors"
                  >
                    Test Notifications
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Email Alerts</p>
                        <p className="text-xs text-gray-500">Receive notifications via email</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleTogglePreference('emailAlerts')}
                      className={`w-12 h-6 rounded-full transition-colors relative ${
                        notificationPreferences.emailAlerts ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${
                          notificationPreferences.emailAlerts ? 'transform translate-x-7' : 'transform translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Bell className="h-4 w-4 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Push Notifications</p>
                        <p className="text-xs text-gray-500">Browser alerts and popups</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleTogglePreference('pushNotifications')}
                      className={`w-12 h-6 rounded-full transition-colors relative ${
                        notificationPreferences.pushNotifications ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-transform ${
                          notificationPreferences.pushNotifications ? 'transform translate-x-7' : 'transform translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
                
                {/* Removed the "Manage Settings" link as requested */}
              </div>
            </div>
          </div>
        </div>
      </div>
    </StableLayout>
  );
};

export default NotificationsPage;