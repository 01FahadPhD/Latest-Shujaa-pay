import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { User, Mail, Phone, MapPin, Building, Edit, ArrowLeft, Shield, Settings, Bell, CreditCard, Menu, X } from 'lucide-react';

const SellerProfilePage = () => {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      const localUserData = localStorage.getItem('user');
      if (localUserData) {
        setUserData(JSON.parse(localUserData));
      }

      const response = await fetch('http://localhost:5000/api/auth/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUserData(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
      } else {
        console.error('Failed to fetch profile data');
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setError('Failed to load profile data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToDashboard = () => {
    router.push('/seller/dashboard');
  };

  const handleEditProfile = () => {
    alert('Edit profile functionality coming soon!');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/auth/login');
  };

  const handleQuickAction = (action) => {
    alert(`${action} functionality coming soon!`);
  };

  const toggleMobileMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load profile data</p>
          <button
            onClick={() => router.push('/auth/login')}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="flex items-center justify-between h-16 px-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={handleBackToDashboard}
              className="p-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">My Profile</h1>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleEditProfile}
              className="p-2 text-gray-600 hover:text-gray-900"
            >
              <Edit className="h-5 w-5" />
            </button>
            <button
              onClick={toggleMobileMenu}
              className="p-2 text-gray-600 hover:text-gray-900"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMenuOpen && (
          <div className="absolute top-16 right-4 bg-white rounded-lg shadow-lg border border-gray-200 py-2 w-48 z-50">
            <button
              onClick={handleEditProfile}
              className="flex items-center w-full px-4 py-3 text-sm text-gray-700 hover:bg-gray-50"
            >
              <Edit className="h-4 w-4 mr-3" />
              Edit Profile
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-gray-50 border-t border-gray-100"
            >
              <ArrowLeft className="h-4 w-4 mr-3" />
              Logout
            </button>
          </div>
        )}
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:block bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={handleBackToDashboard}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Dashboard
              </button>
            </div>
            <h1 className="text-2xl font-semibold text-gray-900">My Profile</h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleEditProfile}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="max-w-4xl mx-auto py-4 lg:py-8 px-4 sm:px-6 lg:px-8">
        {/* Profile Card */}
        <div className="bg-white rounded-xl lg:rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Profile Header - Mobile Optimized */}
          <div className="bg-gradient-to-r from-green-600 to-green-500 px-4 lg:px-6 py-6 lg:py-8">
            <div className="flex items-center space-x-3 lg:space-x-4">
              <div className="w-16 h-16 lg:w-20 lg:h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <User className="h-8 lg:h-10 w-8 lg:w-10 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl lg:text-2xl font-bold text-white truncate">
                  {userData.fullName}
                </h2>
                <p className="text-green-100 text-sm lg:text-base truncate">
                  {userData.email}
                </p>
                <div className="flex items-center mt-2 space-x-2">
                  <span className="inline-flex items-center px-2 lg:px-3 py-1 rounded-full text-xs font-medium bg-white/20 text-white backdrop-blur-sm">
                    <Shield className="h-3 w-3 mr-1" />
                    Seller
                  </span>
                  <span className="inline-flex items-center px-2 lg:px-3 py-1 rounded-full text-xs font-medium bg-white/20 text-white backdrop-blur-sm">
                    Active
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Profile Details - Mobile Optimized */}
          <div className="p-4 lg:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              {/* Personal Information */}
              <div className="space-y-4 lg:space-y-6">
                <h3 className="text-base lg:text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                  Personal Information
                </h3>
                
                <div className="space-y-3 lg:space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <User className="h-4 lg:h-5 w-4 lg:w-5 text-gray-400 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs lg:text-sm text-gray-500">Full Name</p>
                      <p className="font-medium text-gray-900 text-sm lg:text-base truncate">
                        {userData.fullName}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Mail className="h-4 lg:h-5 w-4 lg:w-5 text-gray-400 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs lg:text-sm text-gray-500">Email Address</p>
                      <p className="font-medium text-gray-900 text-sm lg:text-base truncate">
                        {userData.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Phone className="h-4 lg:h-5 w-4 lg:w-5 text-gray-400 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs lg:text-sm text-gray-500">Phone Number</p>
                      <p className="font-medium text-gray-900 text-sm lg:text-base">
                        {userData.phoneNumber || 'Not provided'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Business Information */}
              <div className="space-y-4 lg:space-y-6">
                <h3 className="text-base lg:text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                  Business Information
                </h3>
                
                <div className="space-y-3 lg:space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Building className="h-4 lg:h-5 w-4 lg:w-5 text-gray-400 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs lg:text-sm text-gray-500">Business Name</p>
                      <p className="font-medium text-gray-900 text-sm lg:text-base">
                        {userData.businessName || 'No business name'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <Building className="h-4 lg:h-5 w-4 lg:w-5 text-gray-400 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs lg:text-sm text-gray-500">Business Type</p>
                      <p className="font-medium text-gray-900 text-sm lg:text-base">
                        {userData.businessType || 'Not specified'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <MapPin className="h-4 lg:h-5 w-4 lg:w-5 text-gray-400 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs lg:text-sm text-gray-500">Location</p>
                      <p className="font-medium text-gray-900 text-sm lg:text-base">
                        {userData.location || 'Not specified'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Information - Mobile Optimized */}
            <div className="mt-6 lg:mt-8 pt-4 lg:pt-6 border-t border-gray-200">
              <h3 className="text-base lg:text-lg font-semibold text-gray-900 mb-3 lg:mb-4">
                Account Information
              </h3>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
                <div className="bg-gray-50 rounded-lg p-3 lg:p-4">
                  <p className="text-xs lg:text-sm text-gray-500">Member Since</p>
                  <p className="font-medium text-gray-900 text-sm lg:text-base">
                    {userData.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'Recent'}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 lg:p-4">
                  <p className="text-xs lg:text-sm text-gray-500">Account Status</p>
                  <p className="font-medium text-green-600 text-sm lg:text-base">Active</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 lg:p-4 col-span-2 lg:col-span-1">
                  <p className="text-xs lg:text-sm text-gray-500">User ID</p>
                  <p className="font-medium text-gray-900 text-xs lg:text-sm truncate">
                    {userData.id || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions - Mobile Optimized */}
        <div className="mt-4 lg:mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
          <button 
            onClick={() => handleQuickAction('Security Settings')}
            className="bg-white p-4 rounded-xl border border-gray-200 hover:border-green-500 transition-colors text-left active:scale-95 transition-transform"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Settings className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 text-sm lg:text-base">Security Settings</h4>
                <p className="text-xs lg:text-sm text-gray-500 mt-1 hidden sm:block">
                  Update password and security preferences
                </p>
              </div>
            </div>
          </button>

          <button 
            onClick={() => handleQuickAction('Notification Preferences')}
            className="bg-white p-4 rounded-xl border border-gray-200 hover:border-green-500 transition-colors text-left active:scale-95 transition-transform"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <Bell className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 text-sm lg:text-base">Notification Preferences</h4>
                <p className="text-xs lg:text-sm text-gray-500 mt-1 hidden sm:block">
                  Manage email and push notifications
                </p>
              </div>
            </div>
          </button>

          <button 
            onClick={() => handleQuickAction('Billing Information')}
            className="bg-white p-4 rounded-xl border border-gray-200 hover:border-green-500 transition-colors text-left active:scale-95 transition-transform sm:col-span-2 lg:col-span-1"
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <CreditCard className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 text-sm lg:text-base">Billing Information</h4>
                <p className="text-xs lg:text-sm text-gray-500 mt-1 hidden sm:block">
                  View and update payment methods
                </p>
              </div>
            </div>
          </button>
        </div>

        {/* Mobile Action Buttons */}
        <div className="lg:hidden fixed bottom-4 left-4 right-4 bg-white rounded-xl shadow-lg border border-gray-200 p-4 z-30">
          <div className="flex items-center justify-between">
            <button
              onClick={handleEditProfile}
              className="flex-1 bg-green-600 text-white py-3 rounded-lg font-medium text-sm mx-1"
            >
              Edit Profile
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-medium text-sm mx-1"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Spacing */}
      <div className="lg:hidden h-20"></div>
    </div>
  );
};

export default SellerProfilePage;