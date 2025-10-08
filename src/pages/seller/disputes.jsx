import React, { useState, useEffect } from "react";
import axios from "axios";
import StableLayout from "../../components/common/layout/StableLayout";
import { 
  AlertCircle, 
  Clock, 
  CheckCircle, 
  MessageCircle,
  Eye,
  Upload,
  FileText,
  X,
  Search,
  Image as ImageIcon,
  Download,
  ExternalLink,
  Loader,
  AlertTriangle,
  ShoppingCart,
  Calendar,
  User,
  Shield,
  Flag,
  ChevronDown,
  Filter
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// Simple hook to check if we're on client side
const useClientSide = () => {
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  return isClient;
};

const SellerDisputes = () => {
  const isClient = useClientSide();
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [disputes, setDisputes] = useState([]);
  const [filteredDisputes, setFilteredDisputes] = useState([]);
  const [kpis, setKpis] = useState({
    total: 0,
    opened: 0,
    inReview: 0,
    resolved: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [timeFilter, setTimeFilter] = useState("all");
  const [customDateRange, setCustomDateRange] = useState({ start: "", end: "" });
  const [showTimeFilterDropdown, setShowTimeFilterDropdown] = useState(false);
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [responseText, setResponseText] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("success");

  // Load auth data safely
  useEffect(() => {
    if (isClient) {
      try {
        const userData = localStorage.getItem("user");
        const tokenData = localStorage.getItem("token");
        
        console.log("🔍 Auth Debug:", { 
          userData: userData ? "exists" : "null", 
          tokenData: tokenData ? "exists" : "null" 
        });

        if (userData) {
          setUser(JSON.parse(userData));
        }
        if (tokenData) {
          setToken(tokenData);
        }
      } catch (err) {
        console.error("❌ Error loading auth data:", err);
        setError("Failed to load authentication data");
      }
    }
  }, [isClient]);

  const sellerId = user?._id || user?.id;
  const isAuthenticated = !!user && !!token;

  // Status configuration
  const statusConfig = {
    opened: { label: "Opened", color: "bg-orange-100 text-orange-800", icon: Clock },
    in_review: { label: "In Review", color: "bg-blue-100 text-blue-800", icon: MessageCircle },
    resolved: { label: "Resolved", color: "bg-green-100 text-green-800", icon: CheckCircle },
    disputed: { label: "Under Review", color: "bg-red-100 text-red-800", icon: AlertCircle }
  };

  // Time filter options
  const timeFilterOptions = [
    { value: "all", label: "All Time" },
    { value: "today", label: "Today" },
    { value: "week", label: "This Week" },
    { value: "month", label: "This Month" },
    { value: "custom", label: "Custom Range" }
  ];

  // System alert function
  const showSystemAlert = (message, type = "success") => {
    setAlertMessage(message);
    setAlertType(type);
    setShowAlert(true);
    setTimeout(() => setShowAlert(false), 5000);
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount) return "Tsh 0";
    return `Tsh ${parseInt(amount).toLocaleString()}`;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", { 
      year: "numeric", 
      month: "short", 
      day: "numeric" 
    });
  };

  // Format date and time
  const formatDateTime = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", { 
      year: "numeric", 
      month: "short", 
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  // Filter disputes by date range
  const filterDisputesByDate = (disputesList, filter, customRange) => {
    if (!disputesList || !Array.isArray(disputesList)) return [];
    
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return disputesList.filter(dispute => {
      if (!dispute) return false;
      
      const disputeDate = new Date(dispute.created_at || dispute.createdAt || dispute.submittedAt);
      if (isNaN(disputeDate.getTime())) return false;
      
      switch (filter) {
        case "today":
          return disputeDate >= today;
        case "week":
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          return disputeDate >= weekAgo;
        case "month":
          const monthAgo = new Date(today);
          monthAgo.setMonth(monthAgo.getMonth() - 1);
          return disputeDate >= monthAgo;
        case "custom":
          if (!customRange.start || !customRange.end) return true;
          const startDate = new Date(customRange.start);
          const endDate = new Date(customRange.end);
          endDate.setHours(23, 59, 59, 999);
          return disputeDate >= startDate && disputeDate <= endDate;
        default:
          return true;
      }
    });
  };

  // Apply filters
  const applyFilters = () => {
    let filtered = disputes || [];

    // Apply date filter
    filtered = filterDisputesByDate(filtered, timeFilter, customDateRange);

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(dispute => 
        dispute && (
          (dispute._id && dispute._id.toLowerCase().includes(searchLower)) ||
          (dispute.dispute_id && dispute.dispute_id.toLowerCase().includes(searchLower)) ||
          (dispute.order_id && dispute.order_id.toLowerCase().includes(searchLower)) ||
          (dispute.buyer_name && dispute.buyer_name.toLowerCase().includes(searchLower)) ||
          (dispute.product_name && dispute.product_name.toLowerCase().includes(searchLower)) ||
          (dispute.reason && dispute.reason.toLowerCase().includes(searchLower)) ||
          (dispute.buyer_phone && dispute.buyer_phone.toLowerCase().includes(searchLower))
        )
      );
    }

    setFilteredDisputes(filtered);
  };

  // Fetch disputes
  const fetchDisputes = async () => {
    if (!sellerId || !token) {
      console.error("❌ Missing auth data:", { sellerId, token });
      setError("Authentication required. Please login again.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");

      console.log("🔄 Fetching disputes for seller:", sellerId);

      const res = await axios.get(`${API_URL}/disputes/seller/${sellerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("✅ Disputes fetched:", res.data);
      
      if (res.data.success) {
        const processedDisputes = (res.data.disputes || []).map(dispute => ({
          ...dispute,
          dispute_id: dispute.dispute_id || dispute._id,
          order_id: dispute.order_id || dispute.linkId,
          buyer_name: dispute.buyer_name || dispute.buyerName || "Unknown Buyer",
          product_name: dispute.product_name || dispute.productName || "Unknown Product",
          amount: dispute.amount || dispute.productPrice || 0,
          status: dispute.status || "opened",
          created_at: dispute.created_at || dispute.submittedAt || new Date().toISOString(),
          buyer_evidence: dispute.buyer_evidence || dispute.evidence || [],
          seller_evidence: dispute.seller_evidence || [],
          timeline: dispute.timeline || [
            {
              action: "Dispute opened by buyer",
              date: dispute.created_at || dispute.submittedAt || new Date().toISOString(),
              user: dispute.buyer_name || dispute.buyerName || "Buyer",
              type: "buyer"
            }
          ]
        }));

        setDisputes(processedDisputes);
        setFilteredDisputes(processedDisputes);
      } else {
        throw new Error(res.data.message || "Failed to fetch disputes");
      }
    } catch (err) {
      console.error("❌ Error fetching disputes:", err.response?.data || err.message);
      setError(err.response?.data?.message || err.message || "Failed to load disputes");
    }
  };

  // Fetch stats
  const fetchStats = async () => {
    if (!sellerId || !token) return;

    try {
      const res = await axios.get(`${API_URL}/disputes/stats/seller/${sellerId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("📊 Dispute stats:", res.data);
      
      if (res.data.success) {
        const s = res.data.stats;
        setKpis({
          total: s.total || 0,
          opened: s.opened || 0,
          inReview: s.in_review || 0,
          resolved: s.resolved || 0,
        });
      }
    } catch (err) {
      console.error("❌ Error fetching stats:", err.response?.data || err.message);
      // Calculate stats from local data as fallback
      const total = disputes.length;
      const opened = disputes.filter(d => d?.status === "opened" || d?.status === "disputed").length;
      const inReview = disputes.filter(d => d?.status === "in_review").length;
      const resolved = disputes.filter(d => d?.status === "resolved").length;
      
      setKpis({ total, opened, inReview, resolved });
    } finally {
      setLoading(false);
    }
  };

  // Effects
  useEffect(() => {
    if (isClient && isAuthenticated) {
      console.log("✅ Auth verified, fetching disputes...");
      fetchDisputes();
    } else if (isClient && !loading) {
      console.log("❌ Not authenticated");
      setLoading(false);
    }
  }, [isClient, isAuthenticated]);

  useEffect(() => {
    if (disputes.length > 0) {
      fetchStats();
    } else if (isClient && isAuthenticated) {
      setLoading(false);
    }
  }, [disputes, isClient, isAuthenticated]);

  useEffect(() => {
    applyFilters();
  }, [disputes, searchTerm, timeFilter, customDateRange]);

  // Show loading state
  if (!isClient || loading) {
    return (
      <StableLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Loader className="h-12 w-12 text-primary-500 animate-spin mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-gray-900">Loading Disputes</h2>
            <p className="text-gray-600">Please wait while we fetch your disputes...</p>
          </div>
        </div>
      </StableLayout>
    );
  }

  // Show not authenticated
  if (!isAuthenticated) {
    return (
      <StableLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-6">
            <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
            <p className="text-gray-600 mb-4">
              Please login to access the disputes center. 
              {isClient && "No authentication data found in browser storage."}
            </p>
            <div className="space-x-2">
              <button
                onClick={() => {
                  console.log("LocalStorage contents:");
                  for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    console.log(key, ":", localStorage.getItem(key));
                  }
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Debug Storage
              </button>
              <button
                onClick={() => window.location.href = '/login'}
                className="bg-primary-500 text-white px-6 py-2 rounded-lg hover:bg-primary-600 transition-colors"
              >
                Go to Login
              </button>
            </div>
          </div>
        </div>
      </StableLayout>
    );
  }

  // KPI Cards data
  const kpiCards = [
    {
      title: "Total Disputes",
      value: kpis.total.toString(),
      icon: AlertCircle,
      color: "text-gray-600",
      bgColor: "bg-gray-50"
    },
    {
      title: "Open Disputes",
      value: kpis.opened.toString(),
      icon: Clock,
      color: "text-orange-500",
      bgColor: "bg-orange-50"
    },
    {
      title: "In Review",
      value: kpis.inReview.toString(),
      icon: MessageCircle,
      color: "text-blue-500",
      bgColor: "bg-blue-50"
    },
    {
      title: "Resolved",
      value: kpis.resolved.toString(),
      icon: CheckCircle,
      color: "text-green-500",
      bgColor: "bg-green-50"
    }
  ];

  return (
    <StableLayout>
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          
          {/* System Alert */}
          {showAlert && (
            <div className={`fixed top-4 right-4 z-50 max-w-sm w-full ${
              alertType === "success" ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
            } border rounded-lg shadow-lg p-4 transform transition-transform duration-300 ease-in-out`}>
              <div className="flex items-start space-x-3">
                {alertType === "success" ? (
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <p className={`text-sm font-medium ${
                    alertType === "success" ? "text-green-800" : "text-red-800"
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
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Dispute Center</h1>
              <p className="text-gray-600">Manage and resolve order disputes professionally</p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => window.location.href = '/seller/support'}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center space-x-2"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Support</span>
              </button>
              <button
                onClick={fetchDisputes}
                className="bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors flex items-center space-x-2"
              >
                <Loader className="h-4 w-4" />
                <span>Refresh</span>
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 text-red-700">
                <AlertTriangle className="h-5 w-5" />
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {kpiCards.map((stat, index) => (
              <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                    <p className={`text-2xl font-bold ${stat.color} mb-2`}>
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

          {/* Search and Filter Section */}
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
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Search disputes by ID, order, buyer, or product..."
                  />
                </div>
              </div>

              {/* Time Filter Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowTimeFilterDropdown(!showTimeFilterDropdown)}
                  className="flex items-center space-x-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors min-w-[140px] justify-between"
                >
                  <Filter className="h-4 w-4" />
                  <span>{timeFilterOptions.find(opt => opt.value === timeFilter)?.label || "All Time"}</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${showTimeFilterDropdown ? "rotate-180" : ""}`} />
                </button>

                {showTimeFilterDropdown && (
                  <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                    {timeFilterOptions.map((filter) => (
                      <button
                        key={filter.value}
                        onClick={() => {
                          setTimeFilter(filter.value);
                          setShowTimeFilterDropdown(false);
                        }}
                        className={`w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors ${
                          timeFilter === filter.value
                            ? "bg-primary-50 text-primary-600"
                            : "text-gray-700"
                        } first:rounded-t-lg last:rounded-b-lg`}
                      >
                        {filter.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Custom Date Picker */}
            {timeFilter === "custom" && (
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

          {/* Disputes Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Desktop Table */}
            <div className="hidden lg:block">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dispute & Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Buyer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredDisputes.map((dispute) => (
                    <tr key={dispute._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Flag className="h-4 w-4 text-orange-500 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {dispute.dispute_id || dispute._id}
                            </div>
                            <div className="text-xs text-gray-500">
                              {formatDate(dispute.created_at || dispute.submittedAt)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {dispute.order_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div className="font-medium">{dispute.buyer_name}</div>
                          {dispute.buyer_phone && (
                            <div className="text-gray-500 text-xs">{dispute.buyer_phone}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div className="max-w-xs truncate">{dispute.product_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(dispute.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          statusConfig[dispute.status]?.color || "bg-gray-100 text-gray-800"
                        }`}>
                          {statusConfig[dispute.status]?.label || dispute.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => {
                            setSelectedDispute(dispute);
                            setShowDisputeModal(true);
                          }}
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
              {filteredDisputes.map((dispute) => (
                <div key={dispute._id} className="p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <Flag className="h-4 w-4 text-orange-500 mr-2" />
                        <div className="font-medium text-gray-900">{dispute.dispute_id || dispute._id}</div>
                      </div>
                      <div className="text-sm text-gray-500 mb-1">
                        {formatDate(dispute.created_at || dispute.submittedAt)}
                      </div>
                      <div className="text-sm text-gray-500">{dispute.order_id}</div>
                      <div className="text-sm text-gray-500 mt-1">{dispute.product_name}</div>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      statusConfig[dispute.status]?.color || "bg-gray-100 text-gray-800"
                    }`}>
                      {statusConfig[dispute.status]?.label || dispute.status}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-500">Buyer</div>
                      <div className="font-medium">{dispute.buyer_name}</div>
                      {dispute.buyer_phone && (
                        <div className="text-gray-500 text-xs">{dispute.buyer_phone}</div>
                      )}
                    </div>
                    <div>
                      <div className="text-gray-500">Amount</div>
                      <div className="font-medium">{formatCurrency(dispute.amount)}</div>
                    </div>
                    <div className="col-span-2">
                      <div className="text-gray-500">Actions</div>
                      <button
                        onClick={() => {
                          setSelectedDispute(dispute);
                          setShowDisputeModal(true);
                        }}
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
            {filteredDisputes.length === 0 && (
              <div className="text-center py-12">
                <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">
                  {searchTerm || timeFilter !== "all" 
                    ? "No disputes found matching your criteria" 
                    : "No disputes found"
                  }
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dispute Details Modal */}
      {showDisputeModal && selectedDispute && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl mx-auto max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 sticky top-0 bg-white rounded-t-xl">
              <div className="flex items-center space-x-3">
                <Flag className="h-6 w-6 text-orange-500" />
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Dispute Details</h2>
                  <p className="text-sm text-gray-600">ID: {selectedDispute.dispute_id || selectedDispute._id}</p>
                </div>
              </div>
              <button onClick={() => setShowDisputeModal(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-6">
              {/* Dispute Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Dispute ID</p>
                  <p className="font-medium text-sm sm:text-base">{selectedDispute.dispute_id || selectedDispute._id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    statusConfig[selectedDispute.status]?.color || "bg-gray-100 text-gray-800"
                  }`}>
                    {statusConfig[selectedDispute.status]?.label || selectedDispute.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Order ID</p>
                  <p className="font-medium text-sm sm:text-base">{selectedDispute.order_id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Product</p>
                  <p className="font-medium text-sm sm:text-base">{selectedDispute.product_name}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600">Amount</p>
                <p className="font-medium text-lg sm:text-xl text-green-600">{formatCurrency(selectedDispute.amount)}</p>
              </div>

              {/* Dispute Reason */}
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h3 className="text-base sm:text-lg font-semibold text-orange-900 mb-2 flex items-center">
                  <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Dispute Reason
                </h3>
                <p className="text-orange-800 font-medium mb-2">{selectedDispute.reason}</p>
                <p className="text-orange-700 text-sm">{selectedDispute.description}</p>
              </div>

              {/* Buyer Information */}
              <div className="border-t pt-4">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 flex items-center">
                  <User className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Buyer Information
                </h3>
                <div className="space-y-2 text-sm sm:text-base">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Full Name:</span>
                    <span className="font-medium text-right">{selectedDispute.buyer_name}</span>
                  </div>
                  {selectedDispute.buyer_phone && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Phone:</span>
                      <span className="font-medium">{selectedDispute.buyer_phone}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              {(selectedDispute.status === "opened" || selectedDispute.status === "disputed") && (
                <div className="border-t pt-4 mt-4 space-y-3">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
                    <p className="text-yellow-800 text-sm text-center">
                      <strong>Action Required:</strong> Please respond within 24 hours
                    </p>
                  </div>
                  
                  <button
                    onClick={() => {
                      setShowDisputeModal(false);
                      // Handle upload evidence
                      showSystemAlert("Upload evidence feature coming soon!", "info");
                    }}
                    className="w-full flex items-center justify-center space-x-2 bg-primary-500 text-white px-4 py-3 rounded-lg font-medium hover:bg-primary-600 transition-colors text-sm sm:text-base"
                  >
                    <Upload className="h-4 w-4" />
                    <span>Upload Evidence</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowDisputeModal(false);
                      // Handle respond
                      showSystemAlert("Respond feature coming soon!", "info");
                    }}
                    className="w-full flex items-center justify-center space-x-2 bg-white border border-gray-300 text-gray-700 px-4 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors text-sm sm:text-base"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>Respond to Dispute</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </StableLayout>
  );
};

export default SellerDisputes;