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
  ChevronRight,
  X,
  MoreVertical
} from 'lucide-react';

const DisputesPage = () => {
  const [selectedDispute, setSelectedDispute] = useState(null);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [responseText, setResponseText] = useState('');

  // Dispute Summary KPIs
  const disputeStats = [
    {
      title: 'Total Disputes',
      value: '24',
      icon: AlertCircle,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50'
    },
    {
      title: 'Open Disputes',
      value: '8',
      icon: Clock,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'In Progress',
      value: '5',
      icon: MessageCircle,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Resolved',
      value: '11',
      icon: CheckCircle,
      color: 'text-green-500',
      bgColor: 'bg-green-50'
    }
  ];

  // Mock disputes data
  const disputesData = [
    {
      id: 'DSP-2301',
      orderId: 'ORD-7842',
      buyer: 'John Mwita',
      product: 'iPhone 15 Pro',
      amount: 2450000,
      status: 'open',
      reason: 'Product not delivered',
      createdAt: '2024-01-15',
      updatedAt: '2024-01-16',
      buyerPhone: '+255 789 456 123',
      evidence: [],
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
      buyer: 'Sarah Johnson',
      product: 'MacBook Air M2',
      amount: 3250000,
      status: 'in_review',
      reason: 'Wrong product received',
      createdAt: '2024-01-14',
      updatedAt: '2024-01-15',
      buyerPhone: '+255 712 345 678',
      evidence: [
        { type: 'image', name: 'wrong_product.jpg', date: '2024-01-14' }
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
          action: 'Under review by Shujaa Pay',
          date: '2024-01-15 09:00',
          user: 'Shujaa Pay Support',
          type: 'admin'
        }
      ]
    },
    {
      id: 'DSP-2303',
      orderId: 'ORD-7839',
      buyer: 'Grace Mushi',
      product: 'iPad Air',
      amount: 1850000,
      status: 'awaiting_evidence',
      reason: 'Product damaged on arrival',
      createdAt: '2024-01-13',
      updatedAt: '2024-01-14',
      buyerPhone: '+255 768 123 456',
      evidence: [],
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
          user: 'Shujaa Pay Support',
          type: 'admin'
        }
      ]
    },
    {
      id: 'DSP-2304',
      orderId: 'ORD-7837',
      buyer: 'Lisa Johnson',
      product: 'Samsung Galaxy S24',
      amount: 2150000,
      status: 'resolved',
      reason: 'Payment issue',
      createdAt: '2024-01-10',
      updatedAt: '2024-01-12',
      buyerPhone: '+255 745 321 654',
      evidence: [
        { type: 'document', name: 'payment_proof.pdf', date: '2024-01-11' }
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
          action: 'Dispute resolved',
          date: '2024-01-12 10:00',
          user: 'Shujaa Pay Support',
          type: 'admin'
        }
      ]
    }
  ];

  // Status configuration
  const statusConfig = {
    open: { label: 'Open', color: 'bg-orange-100 text-orange-800' },
    in_review: { label: 'In Review', color: 'bg-blue-100 text-blue-800' },
    awaiting_evidence: { label: 'Awaiting Evidence', color: 'bg-yellow-100 text-yellow-800' },
    resolved: { label: 'Resolved', color: 'bg-green-100 text-green-800' }
  };

  // Format currency in Tsh
  const formatCurrency = (amount) => {
    return `Tsh ${amount.toLocaleString()}`;
  };

  const handleViewDispute = (dispute) => {
    setSelectedDispute(dispute);
    setShowDisputeModal(true);
  };

  const handleCloseModal = () => {
    setShowDisputeModal(false);
    setSelectedDispute(null);
  };

  const handleUploadEvidence = () => {
    setShowUploadModal(true);
  };

  const handleRespond = () => {
    setShowResponseModal(true);
  };

  const handleFileUpload = (event) => {
    const files = Array.from(event.target.files);
    setUploadedFiles(prev => [...prev, ...files]);
  };

  const handleRemoveFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmitEvidence = () => {
    // TODO: Implement evidence submission logic
    console.log('Submitting evidence:', uploadedFiles);
    alert('Evidence submitted successfully!');
    setShowUploadModal(false);
    setUploadedFiles([]);
  };

  const handleSubmitResponse = () => {
    if (!responseText.trim()) {
      alert('Please enter your response');
      return;
    }
    
    // TODO: Implement response submission logic
    console.log('Submitting response:', responseText);
    alert('Response submitted successfully!');
    setShowResponseModal(false);
    setResponseText('');
  };

  const handleCloseUploadModal = () => {
    setShowUploadModal(false);
    setUploadedFiles([]);
  };

  const handleCloseResponseModal = () => {
    setShowResponseModal(false);
    setResponseText('');
  };

  return (
    <StableLayout>
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          
          {/* Header Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-3">Dispute Center</h1>
            <p className="text-lg text-gray-600 max-w-3xl">
              Here you can view, report, and manage disputes related to your transactions. 
              Disputes ensure fair resolution for both buyers and sellers.
            </p>
          </div>

          {/* Dispute Summary KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {disputeStats.map((stat, index) => (
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

          {/* Active Disputes Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Active Disputes</h2>
            </div>

            {/* Desktop Table - Updated with Date & Status in same column */}
            <div className="hidden lg:block">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dispute ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Buyer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {disputesData.map((dispute) => (
                    <tr key={dispute.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        <div className="flex items-center">
                          <AlertCircle className="h-4 w-4 text-orange-500 mr-2" />
                          {dispute.id}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {dispute.orderId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <div>
                          <div className="font-medium">{dispute.buyer}</div>
                          <div className="text-gray-500 text-xs">{dispute.buyerPhone}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {dispute.product}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(dispute.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusConfig[dispute.status].color}`}>
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
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards - Updated for consistency */}
            <div className="lg:hidden divide-y divide-gray-200">
              {disputesData.map((dispute) => (
                <div key={dispute.id} className="p-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center">
                      <AlertCircle className="h-4 w-4 text-orange-500 mr-2" />
                      <div>
                        <div className="font-medium text-gray-900">{dispute.id}</div>
                        <div className="text-sm text-gray-500">{dispute.orderId}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig[dispute.status].color}`}>
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
                        <div>{dispute.buyer}</div>
                        <div className="text-gray-500 text-xs">{dispute.buyerPhone}</div>
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
                        <span>View Full Details</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {disputesData.length === 0 && (
              <div className="text-center py-12">
                <CheckCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No active disputes found</p>
                <p className="text-gray-400 text-sm mt-1">All disputes are resolved</p>
              </div>
            )}
          </div>

          {/* Quick Help / Tips Section */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              Quick Tips for Faster Resolution
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800">
              <div className="flex items-start">
                <FileText className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                <span>Provide clear evidence (screenshots, receipts)</span>
              </div>
              <div className="flex items-start">
                <MessageCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                <span>Keep communication respectful and professional</span>
              </div>
              <div className="flex items-start">
                <Clock className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                <span>Most disputes are resolved within 5 business days</span>
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
          onUploadEvidence={handleUploadEvidence}
          onRespond={handleRespond}
          formatCurrency={formatCurrency}
          statusConfig={statusConfig}
        />
      )}

      {/* Upload Evidence Modal */}
      {showUploadModal && selectedDispute && (
        <UploadEvidenceModal
          dispute={selectedDispute}
          onClose={handleCloseUploadModal}
          uploadedFiles={uploadedFiles}
          onFileUpload={handleFileUpload}
          onRemoveFile={handleRemoveFile}
          onSubmit={handleSubmitEvidence}
        />
      )}

      {/* Response Modal */}
      {showResponseModal && selectedDispute && (
        <ResponseModal
          dispute={selectedDispute}
          onClose={handleCloseResponseModal}
          responseText={responseText}
          setResponseText={setResponseText}
          onSubmit={handleSubmitResponse}
        />
      )}
    </StableLayout>
  );
};

// Dispute Modal Component
const DisputeModal = ({ dispute, onClose, onUploadEvidence, onRespond, formatCurrency, statusConfig }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <AlertCircle className="h-6 w-6 text-orange-500" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Dispute Details</h2>
              <p className="text-sm text-gray-600">{dispute.id}</p>
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Transaction Details */}
            <div className="lg:col-span-1 space-y-6">
              {/* Transaction Details */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Transaction Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Order ID:</span>
                    <span className="font-medium">{dispute.orderId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Amount:</span>
                    <span className="font-medium">{formatCurrency(dispute.amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Buyer:</span>
                    <span className="font-medium">{dispute.buyer}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Product:</span>
                    <span className="font-medium">{dispute.product}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Created:</span>
                    <span className="font-medium">
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

              {/* Actions */}
              <div className="space-y-3">
                <button
                  onClick={onUploadEvidence}
                  className="w-full flex items-center justify-center space-x-2 bg-primary-500 text-white px-4 py-3 rounded-lg font-medium hover:bg-primary-600 transition-colors"
                >
                  <Upload className="h-4 w-4" />
                  <span>Upload Evidence</span>
                </button>
                <button
                  onClick={onRespond}
                  className="w-full flex items-center justify-center space-x-2 bg-white border border-gray-300 text-gray-700 px-4 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>Respond to Dispute</span>
                </button>
              </div>
            </div>

            {/* Right Column - Timeline & Evidence */}
            <div className="lg:col-span-2 space-y-6">
              {/* Status & Resolution */}
              <div className="flex items-center justify-between">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusConfig[dispute.status].color}`}>
                  {statusConfig[dispute.status].label}
                </span>
                {dispute.resolution && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-green-800 text-sm font-medium">Resolution: {dispute.resolution}</p>
                  </div>
                )}
              </div>

              {/* Evidence Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Evidence</h3>
                {dispute.evidence.length > 0 ? (
                  <div className="space-y-2">
                    {dispute.evidence.map((item, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium">{item.name}</span>
                        </div>
                        <span className="text-xs text-gray-500">{item.date}</span>
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
                        <div className={`w-2 h-2 rounded-full ${
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

// Upload Evidence Modal Component
const UploadEvidenceModal = ({ dispute, onClose, uploadedFiles, onFileUpload, onRemoveFile, onSubmit }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <Upload className="h-6 w-6 text-primary-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Upload Evidence</h2>
              <p className="text-sm text-gray-600">For dispute: {dispute.id}</p>
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
          <div className="space-y-6">
            {/* File Upload Area */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-gray-900 mb-2">Upload your evidence files</p>
              <p className="text-gray-500 mb-4">
                Upload screenshots, receipts, tracking information, or any other relevant documents
              </p>
              <input
                type="file"
                multiple
                onChange={onFileUpload}
                className="hidden"
                id="evidence-upload"
                accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
              />
              <label
                htmlFor="evidence-upload"
                className="inline-flex items-center justify-center bg-primary-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-600 transition-colors cursor-pointer"
              >
                <Upload className="h-4 w-4 mr-2" />
                Choose Files
              </label>
              <p className="text-xs text-gray-500 mt-2">
                Supported formats: JPG, PNG, PDF, DOC (Max 10MB per file)
              </p>
            </div>

            {/* Uploaded Files List */}
            {uploadedFiles.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Selected Files</h3>
                <div className="space-y-2">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{file.name}</p>
                          <p className="text-xs text-gray-500">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => onRemoveFile(index)}
                        className="text-red-500 hover:text-red-700 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes (Optional)
              </label>
              <textarea
                placeholder="Add any additional context or explanation for your evidence..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onSubmit}
                disabled={uploadedFiles.length === 0}
                className="flex-1 bg-primary-500 text-white py-3 rounded-lg font-medium hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Evidence
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Response Modal Component
const ResponseModal = ({ dispute, onClose, responseText, setResponseText, onSubmit }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <MessageCircle className="h-6 w-6 text-primary-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Respond to Dispute</h2>
              <p className="text-sm text-gray-600">For dispute: {dispute.id}</p>
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
          <div className="space-y-6">
            {/* Dispute Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Dispute Details</h3>
              <p className="text-sm text-gray-600">
                <strong>Buyer:</strong> {dispute.buyer} | <strong>Product:</strong> {dispute.product}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                <strong>Reason:</strong> {dispute.reason}
              </p>
            </div>

            {/* Response Form */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Response *
              </label>
              <textarea
                value={responseText}
                onChange={(e) => setResponseText(e.target.value)}
                placeholder="Provide your detailed response to the dispute. Include any relevant information, explanations, or proposed solutions..."
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              />
              <p className="text-xs text-gray-500 mt-2">
                Be professional and clear in your response. This will be reviewed by Shujaa Pay support team.
              </p>
            </div>

            {/* Response Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Response Tips</h4>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• Be factual and provide specific details</li>
                <li>• Include any relevant order or shipping information</li>
                <li>• Maintain a professional and respectful tone</li>
                <li>• Propose fair solutions when possible</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={onSubmit}
                disabled={!responseText.trim()}
                className="flex-1 bg-primary-500 text-white py-3 rounded-lg font-medium hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit Response
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DisputesPage;