import React, { useState } from 'react';
import StableLayout from '../../components/common/layout/StableLayout';
import { 
  Phone, 
  Mail, 
  Youtube, 
  HelpCircle,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

const SupportPage = () => {
  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  // Contact methods data
  const contactMethods = [
    {
      title: 'Phone Support',
      icon: Phone,
      primary: '+255 123 456 789',
      secondary: '9 AM - 6 PM (Mon-Fri)',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Email Support',
      icon: Mail,
      primary: 'support@shujaapay.com',
      secondary: 'Response within 24 hours',
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Video Tutorials',
      icon: Youtube,
      primary: 'Watch on YouTube',
      secondary: 'Step-by-step product guides',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      link: 'https://www.youtube.com/@ShujaaPay' // 🔗 Replace with your real channel link
    }
  ];

  // FAQ data
  const faqs = [
    {
      question: 'How long does it take to receive my payout?',
      answer: 'Payouts are typically processed within 24-48 hours after the buyer confirms delivery. Bank transfers may take an additional 1-2 business days to reflect in your account.'
    },
    {
      question: 'What should I do if a buyer raises a dispute?',
      answer: 'Respond promptly with evidence of delivery or service completion. You can upload tracking information, delivery confirmation, or communication records in the disputes section.'
    },
    {
      question: 'How secure are payments through Shujaa Pay?',
      answer: 'All payments are held securely in escrow until the buyer confirms receipt. We use bank-level encryption and security measures to protect all transactions.'
    },
    {
      question: 'Can I create multiple payment links for different products?',
      answer: 'Yes, you can create unlimited payment links for different products or services. Each link is unique and can be customized with product details and pricing.'
    },
    {
      question: 'What happens if a buyer doesn\'t confirm delivery?',
      answer: 'If a buyer doesn\'t confirm delivery within 7 days and doesn\'t raise a dispute, funds are automatically released to your account for security.'
    }
  ];

  // Quick tips data
  const quickTips = [
    'Include your order ID or transaction reference when reporting payment issues',
    'Provide screenshots when reporting technical problems',
    'Check your spam folder if you haven\'t received email responses',
    'For urgent payment issues, call our phone support during business hours'
  ];

  return (
    <StableLayout>
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
        <div className="max-w-6xl mx-auto">
          
          {/* Page Header */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-3">Support Center</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We're here to help you succeed. Choose the best way to get in touch with our support team.
            </p>
          </div>

          {/* Container 1: Ways to Reach Us */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Ways to Reach Us</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {contactMethods.map((method, index) => {
                const Icon = method.icon;
                return (
                  <a 
                    key={index} 
                    href={method.link || '#'} 
                    target={method.link ? "_blank" : "_self"} 
                    rel="noopener noreferrer"
                    className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow block"
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`p-3 rounded-lg ${method.bgColor}`}>
                        <Icon className={`h-6 w-6 ${method.color}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {method.title}
                        </h3>
                        <p className="text-gray-900 font-medium text-lg mb-1">
                          {method.primary}
                        </p>
                        <p className="text-gray-600 text-sm">
                          {method.secondary}
                        </p>
                      </div>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>

          {/* Container 2: Frequently Asked Questions */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              {faqs.map((faq, index) => {
                const isOpen = openFaq === index;
                return (
                  <div key={index} className="border-b border-gray-200 last:border-b-0">
                    <button
                      onClick={() => toggleFaq(index)}
                      className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-lg font-medium text-gray-900 pr-4">
                        {faq.question}
                      </span>
                      {isOpen ? (
                        <ChevronUp className="h-5 w-5 text-gray-500 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-500 flex-shrink-0" />
                      )}
                    </button>
                    {isOpen && (
                      <div className="px-6 pb-6">
                        <p className="text-gray-600 leading-relaxed">
                          {faq.answer}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Container 3: Quick Tips for Faster Support */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Tips for Faster Support</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <div className="flex items-start mb-4">
                <AlertCircle className="h-6 w-6 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                <h3 className="text-lg font-semibold text-blue-900">
                  Follow these tips to help us assist you faster
                </h3>
              </div>
              <ul className="space-y-3">
                {quickTips.map((tip, index) => (
                  <li key={index} className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-blue-800">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Additional Help Section */}
          <div className="mt-12 bg-primary-50 border border-primary-200 rounded-xl p-8 text-center">
            <HelpCircle className="h-12 w-12 text-primary-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-primary-900 mb-2">
              Still Need Help?
            </h3>
            <p className="text-primary-700 mb-4">
              Our dedicated support team is ready to assist you with any questions or issues.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="tel:+255123456789"
                className="inline-flex items-center justify-center bg-primary-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-600 transition-colors"
              >
                <Phone className="h-5 w-5 mr-2" />
                Call Now
              </a>
              <a
                href="mailto:support@shujaapay.com"
                className="inline-flex items-center justify-center bg-white text-primary-600 border border-primary-300 px-6 py-3 rounded-lg font-medium hover:bg-primary-50 transition-colors"
              >
                <Mail className="h-5 w-5 mr-2" />
                Send Email
              </a>
            </div>
          </div>

        </div>
      </div>
    </StableLayout>
  );
};

export default SupportPage;
