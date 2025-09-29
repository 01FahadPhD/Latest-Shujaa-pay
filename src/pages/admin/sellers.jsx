// pages/admin/sellers.jsx
import React, { useState } from 'react';
import StableLayout from '../../components/common/layout/StableLayout';
import { 
  Users, 
  UserCheck, 
  UserX, 
  UserPlus,
  Search,
  Eye,
  MoreVertical,
  Phone,
  Mail,
  MapPin,
  Building,
  Calendar,
  Shield,
  Key,
  Trash2,
  X,
  User
} from 'lucide-react';

const SellersManagement = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    businessType: '',
    location: '',
    status: ''
  });
  const [selectedSeller, setSelectedSeller] = useState(null);
  const [showSellerDetails, setShowSellerDetails] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(null);

  // Tanzania Regions
  const tanzaniaRegions = [
    'Arusha',
    'Dar es Salaam',
    'Dodoma',
    'Geita',
    'Iringa',
    'Kagera',
    'Katavi',
    'Kigoma',
    'Kilimanjaro',
    'Lindi',
    'Manyara',
    'Mara',
    'Mbeya',
    'Morogoro',
    'Mtwara',
    'Mwanza',
    'Njombe',
    'Pemba North',
    'Pemba South',
    'Pwani',
    'Rukwa',
    'Ruvuma',
    'Shinyanga',
    'Simiyu',
    'Singida',
    'Songwe',
    'Tabora',
    'Tanga',
    'Zanzibar Central/South',
    'Zanzibar North',
    'Zanzibar Urban/West'
  ];

  const businessTypes = [
    'Fashion & Clothing',
    'Electronics',
    'Beauty & Cosmetics',
    'Food & Beverages',
    'Arts & Crafts',
    'Home & Living',
    'Others'
  ];

  // KPI Stats Data
  const kpiStats = [
    {
      title: 'Total Sellers',
      value: '156',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Active Sellers',
      value: '142',
      icon: UserCheck,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Suspended Sellers',
      value: '14',
      icon: UserX,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'New This Month',
      value: '23',
      icon: UserPlus,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  // Mock sellers data
  const sellersData = [
    {
      id: 1,
      fullName: 'John Doe',
      businessName: 'Tech Gadgets Ltd',
      businessType: 'Electronics',
      phoneNumber: '+255 712 345 678',
      location: 'Dar es Salaam',
      email: 'john@techgadgets.co.tz',
      status: 'active',
      registeredDate: '2024-01-15',
      totalOrders: 47,
      totalPayouts: 'Tsh 12.5M'
    },
    {
      id: 2,
      fullName: 'Jane Smith',
      businessName: 'Fashion Hub',
      businessType: 'Fashion & Clothing',
      phoneNumber: '+255 713 456 789',
      location: 'Arusha',
      email: 'jane@fashionhub.co.tz',
      status: 'active',
      registeredDate: '2024-02-20',
      totalOrders: 23,
      totalPayouts: 'Tsh 8.2M'
    },
    {
      id: 3,
      fullName: 'Michael Johnson',
      businessName: 'Fresh Foods Market',
      businessType: 'Food & Beverages',
      phoneNumber: '+255 714 567 890',
      location: 'Mwanza',
      email: 'michael@freshfoods.co.tz',
      status: 'suspended',
      registeredDate: '2024-01-08',
      totalOrders: 15,
      totalPayouts: 'Tsh 3.8M'
    },
    {
      id: 4,
      fullName: 'Sarah Williams',
      businessName: 'Beauty Palace',
      businessType: 'Beauty & Cosmetics',
      phoneNumber: '+255 715 678 901',
      location: 'Dar es Salaam',
      email: 'sarah@beautypalace.co.tz',
      status: 'active',
      registeredDate: '2024-03-05',
      totalOrders: 34,
      totalPayouts: 'Tsh 6.7M'
    },
    {
      id: 5,
      fullName: 'David Brown',
      businessName: 'Home Comforts',
      businessType: 'Home & Living',
      phoneNumber: '+255 716 789 012',
      location: 'Mbeya',
      email: 'david@homecomforts.co.tz',
      status: 'active',
      registeredDate: '2024-02-12',
      totalOrders: 28,
      totalPayouts: 'Tsh 5.4M'
    },
    {
      id: 6,
      fullName: 'Grace Mwamba',
      businessName: 'Artisan Crafts',
      businessType: 'Arts & Crafts',
      phoneNumber: '+255 717 890 123',
      location: 'Zanzibar Urban/West',
      email: 'grace@artisancrafts.co.tz',
      status: 'suspended',
      registeredDate: '2024-01-30',
      totalOrders: 12,
      totalPayouts: 'Tsh 2.1M'
    }
  ];

  // Filter sellers based on search and filters
  const filteredSellers = sellersData.filter(seller => {
    const matchesSearch = 
      seller.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      seller.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      seller.phoneNumber.includes(searchQuery);
    
    const matchesBusinessType = !filters.businessType || seller.businessType === filters.businessType;
    const matchesLocation = !filters.location || seller.location === filters.location;
    const matchesStatus = !filters.status || seller.status === filters.status;
    
    return matchesSearch && matchesBusinessType && matchesLocation && matchesStatus;
  });

  const handleViewSeller = (seller) => {
    setSelectedSeller(seller);
    setShowSellerDetails(true);
    setShowActionMenu(null);
  };

  const handleSuspendSeller = (sellerId) => {
    console.log('Suspend seller:', sellerId);
    setShowActionMenu(null);
    // Implement suspend logic
  };

  const handleActivateSeller = (sellerId) => {
    console.log('Activate seller:', sellerId);
    setShowActionMenu(null);
    // Implement activate logic
  };

  const handleDeleteSeller = (sellerId) => {
    console.log('Delete seller:', sellerId);
    setShowActionMenu(null);
    // Implement delete logic
  };

  const handleResetPassword = (sellerId) => {
    console.log('Reset password for seller:', sellerId);
    setShowActionMenu(null);
    // Implement reset password logic
  };

  const closeSellerDetails = () => {
    setShowSellerDetails(false);
    setSelectedSeller(null);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      businessType: '',
      location: '',
      status: ''
    });
    setSearchQuery('');
  };

  const toggleActionMenu = (sellerId) => {
    setShowActionMenu(showActionMenu === sellerId ? null : sellerId);
  };

  return (
    <StableLayout role="admin">
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          
          {/* KPI Metrics Grid - 2 per row on mobile */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
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
                    placeholder="Search by name, business, or phone..."
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Business Type Filter */}
                <select
                  value={filters.businessType}
                  onChange={(e) => handleFilterChange('businessType', e.target.value)}
                  className="block w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                >
                  <option value="">All Business Types</option>
                  {businessTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>

                {/* Location Filter */}
                <select
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  className="block w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                >
                  <option value="">All Locations</option>
                  {tanzaniaRegions.map(region => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>

                {/* Status Filter */}
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="block w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
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

          {/* Sellers Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Desktop Table */}
            <div className="hidden lg:block">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Business Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone Number</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSellers.map((seller) => (
                    <tr key={seller.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {seller.fullName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {seller.businessType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {seller.phoneNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {seller.location}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          seller.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-orange-100 text-orange-800'
                        }`}>
                          {seller.status === 'active' ? 'Active' : 'Suspended'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium relative">
                        <div className="flex justify-end">
                          <button
                            onClick={() => toggleActionMenu(seller.id)}
                            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>
                          
                          {/* Action Menu Dropdown */}
                          {showActionMenu === seller.id && (
                            <div className="absolute right-0 mt-8 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                              <div className="py-1">
                                <button
                                  onClick={() => handleViewSeller(seller)}
                                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                >
                                  <Eye className="h-4 w-4 mr-3" />
                                  View Details
                                </button>
                                
                                {seller.status === 'active' ? (
                                  <button
                                    onClick={() => handleSuspendSeller(seller.id)}
                                    className="flex items-center w-full px-4 py-2 text-sm text-orange-600 hover:bg-orange-50 transition-colors"
                                  >
                                    <UserX className="h-4 w-4 mr-3" />
                                    Suspend Seller
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleActivateSeller(seller.id)}
                                    className="flex items-center w-full px-4 py-2 text-sm text-green-600 hover:bg-green-50 transition-colors"
                                  >
                                    <UserCheck className="h-4 w-4 mr-3" />
                                    Activate Seller
                                  </button>
                                )}
                                
                                <button
                                  onClick={() => handleResetPassword(seller.id)}
                                  className="flex items-center w-full px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 transition-colors"
                                >
                                  <Key className="h-4 w-4 mr-3" />
                                  Reset Password
                                </button>
                                
                                <button
                                  onClick={() => handleDeleteSeller(seller.id)}
                                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                                >
                                  <Trash2 className="h-4 w-4 mr-3" />
                                  Delete Seller
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden divide-y divide-gray-200">
              {filteredSellers.map((seller) => (
                <div key={seller.id} className="p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="font-medium text-gray-900">{seller.fullName}</div>
                      <div className="text-sm text-gray-500">{seller.businessType}</div>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      seller.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-orange-100 text-orange-800'
                    }`}>
                      {seller.status === 'active' ? 'Active' : 'Suspended'}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="h-4 w-4 mr-2" />
                      <span>{seller.phoneNumber}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>{seller.location}</span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="h-4 w-4 mr-2" />
                      <span className="truncate">{seller.email}</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between pt-3 mt-3 border-t border-gray-200">
                    <button
                      onClick={() => handleViewSeller(seller)}
                      className="text-green-600 hover:text-green-900 flex items-center space-x-1 text-sm"
                    >
                      <Eye className="h-4 w-4" />
                      <span>View</span>
                    </button>
                    
                    {seller.status === 'active' ? (
                      <button
                        onClick={() => handleSuspendSeller(seller.id)}
                        className="text-orange-600 hover:text-orange-900 flex items-center space-x-1 text-sm"
                      >
                        <UserX className="h-4 w-4" />
                        <span>Suspend</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleActivateSeller(seller.id)}
                        className="text-green-600 hover:text-green-900 flex items-center space-x-1 text-sm"
                      >
                        <UserCheck className="h-4 w-4" />
                        <span>Activate</span>
                      </button>
                    )}
                    
                    <button
                      onClick={() => handleDeleteSeller(seller.id)}
                      className="text-red-600 hover:text-red-900 flex items-center space-x-1 text-sm"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {filteredSellers.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No sellers found matching your criteria</p>
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

      {/* Seller Details Modal */}
      {showSellerDetails && selectedSeller && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-md mx-auto animate-fade-in max-h-[85vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 sticky top-0 bg-white">
              <div className="flex items-center">
                <div className="bg-green-100 p-2 rounded-lg mr-3">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">Seller Details</h3>
                  <p className="text-xs sm:text-sm text-gray-600">{selectedSeller.businessName}</p>
                </div>
              </div>
              <button
                onClick={closeSellerDetails}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>

            {/* Details Content */}
            <div className="p-4 sm:p-6 space-y-4">
              {/* Basic Info */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Full Name</span>
                  <span className="text-sm font-semibold text-gray-900">{selectedSeller.fullName}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Business Name</span>
                  <span className="text-sm font-semibold text-gray-900">{selectedSeller.businessName}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Business Type</span>
                  <span className="text-sm font-semibold text-gray-900">{selectedSeller.businessType}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Phone Number</span>
                  <span className="text-sm font-semibold text-gray-900">{selectedSeller.phoneNumber}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Location</span>
                  <span className="text-sm font-semibold text-gray-900">{selectedSeller.location}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Email</span>
                  <span className="text-sm font-semibold text-gray-900">{selectedSeller.email}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Registered Date</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {new Date(selectedSeller.registeredDate).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Status</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    selectedSeller.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-orange-100 text-orange-800'
                  }`}>
                    {selectedSeller.status === 'active' ? 'Active' : 'Suspended'}
                  </span>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Stats</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-900">{selectedSeller.totalOrders}</p>
                    <p className="text-xs text-gray-500">Total Orders</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-900">{selectedSeller.totalPayouts}</p>
                    <p className="text-xs text-gray-500">Total Payouts</p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Actions</h4>
                
                {selectedSeller.status === 'active' ? (
                  <button
                    onClick={() => {
                      handleSuspendSeller(selectedSeller.id);
                      closeSellerDetails();
                    }}
                    className="w-full flex items-center justify-center space-x-2 bg-orange-50 text-orange-700 py-2 rounded-lg hover:bg-orange-100 transition-colors"
                  >
                    <UserX className="h-4 w-4" />
                    <span>Suspend Seller</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      handleActivateSeller(selectedSeller.id);
                      closeSellerDetails();
                    }}
                    className="w-full flex items-center justify-center space-x-2 bg-green-50 text-green-700 py-2 rounded-lg hover:bg-green-100 transition-colors"
                  >
                    <UserCheck className="h-4 w-4" />
                    <span>Activate Seller</span>
                  </button>
                )}
                
                <button
                  onClick={() => {
                    handleResetPassword(selectedSeller.id);
                    closeSellerDetails();
                  }}
                  className="w-full flex items-center justify-center space-x-2 bg-blue-50 text-blue-700 py-2 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Key className="h-4 w-4" />
                  <span>Reset Password</span>
                </button>
                
                <button
                  onClick={() => {
                    handleDeleteSeller(selectedSeller.id);
                    closeSellerDetails();
                  }}
                  className="w-full flex items-center justify-center space-x-2 bg-red-50 text-red-700 py-2 rounded-lg hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete Seller</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Close dropdown when clicking outside */}
      {showActionMenu && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setShowActionMenu(null)}
        />
      )}
    </StableLayout>
  );
};

export default SellersManagement;