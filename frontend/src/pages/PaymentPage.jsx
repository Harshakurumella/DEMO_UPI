import { useState } from 'react';
import axios from 'axios';
import QRCodeDisplay from '../components/QRCodeDisplay';
import UTRForm from '../components/UTRForm';
import toast from 'react-hot-toast';

const PaymentPage = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: ''
  });
  const [paymentData, setPaymentData] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const initiatePayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/payment/initiate`, {
        ...formData,
        amount: 1 // Fixed ₹1 for demo
      });
      setPaymentData(res.data);
      setStep(2);
      toast.success('QR Code Generated');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to initiate payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-10 px-4 bg-gray-50">
      <div className={`w-full bg-white shadow-xl rounded-2xl overflow-hidden transition-all duration-300 ${step === 2 ? 'max-w-4xl' : 'max-w-md'}`}>
        <div className="bg-indigo-600 p-6 text-white text-center">
          <h1 className="text-2xl font-bold">UPI Pay Demo</h1>
          <p className="text-indigo-200 mt-1">Fast and secure payments</p>
        </div>
        
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <span className={`text-sm font-medium ${step === 1 ? 'text-indigo-600' : 'text-gray-400'}`}>Step 1: Details</span>
            <span className="w-8 h-px bg-gray-200"></span>
            <span className={`text-sm font-medium ${step === 2 ? 'text-indigo-600' : 'text-gray-400'}`}>Step 2: Pay</span>
          </div>

          {step === 1 ? (
            <form onSubmit={initiatePayment} className="space-y-4 animate-fadeIn">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input 
                  type="text" 
                  name="customerName"
                  required
                  value={formData.customerName}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input 
                  type="email" 
                  name="customerEmail"
                  required
                  value={formData.customerEmail}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input 
                  type="tel" 
                  name="customerPhone"
                  required
                  value={formData.customerPhone}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none"
                  placeholder="9876543210"
                />
              </div>
              
              <div className="mt-6 bg-gray-50 p-4 rounded-lg flex justify-between items-center border border-gray-100">
                <span className="font-semibold text-gray-700">Amount to Pay</span>
                <span className="text-xl font-bold text-indigo-600">₹1.00</span>
              </div>

              <button 
                type="submit"
                disabled={loading}
                className="mt-4 w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-70 shadow-md"
              >
                {loading ? 'Processing...' : 'Generate Payment QR'}
              </button>
            </form>
          ) : (
            <div className="animate-fadeIn">
              {paymentData && (
                <>
                  <QRCodeDisplay 
                    upiLink={paymentData.upiLink} 
                    amount={paymentData.amount} 
                    orderId={paymentData.orderId}
                  />
                  <div className="max-w-md mx-auto mt-6">
                    <UTRForm orderId={paymentData.orderId} />
                    <button 
                      onClick={() => {
                        setStep(1);
                        setPaymentData(null);
                      }}
                      className="mt-4 w-full bg-white text-gray-600 py-3 rounded-lg font-medium border border-gray-200 hover:bg-gray-50 transition shadow-sm"
                    >
                      Cancel Payment
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
