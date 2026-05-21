import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const PaymentStatus = () => {
  const { orderId } = useParams();
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/payment/status/${orderId}`);
        setPayment(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 10000); // poll every 10s
    return () => clearInterval(interval);
  }, [orderId]);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  if (!payment) {
    return <div className="flex min-h-screen items-center justify-center text-red-500">Payment not found</div>;
  }

  const renderStatusConfig = () => {
    switch(payment.status) {
      case 'pending':
        return {
          icon: <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center animate-pulse"><div className="w-8 h-8 rounded-full bg-yellow-500"></div></div>,
          title: 'Awaiting Payment',
          text: 'Waiting for your payment details',
          color: 'text-yellow-600'
        };
      case 'submitted':
        return {
          icon: <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center"><svg className="animate-spin w-8 h-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg></div>,
          title: 'Verifying Payment',
          text: 'Payment submitted, waiting for admin verification',
          color: 'text-blue-600'
        };
      case 'verified':
        return {
          icon: <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center"><svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg></div>,
          title: 'Payment Verified!',
          text: 'Thank you for your payment.',
          color: 'text-green-600'
        };
      case 'rejected':
        return {
          icon: <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center"><svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg></div>,
          title: 'Payment Rejected',
          text: 'Payment could not be verified. Please contact support.',
          color: 'text-red-600'
        };
      default:
        return {};
    }
  };

  const config = renderStatusConfig();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="flex justify-center mb-6">
          {config.icon}
        </div>
        <h2 className={`text-2xl font-bold mb-2 ${config.color}`}>{config.title}</h2>
        <p className="text-gray-600 mb-8">{config.text}</p>

        <div className="bg-gray-50 rounded-xl p-4 text-left space-y-3 mb-8">
          <div className="flex justify-between">
            <span className="text-gray-500 text-sm">Order ID</span>
            <span className="font-medium text-gray-800">{payment.orderId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500 text-sm">Amount</span>
            <span className="font-medium text-gray-800">₹{payment.amount}</span>
          </div>
          {payment.utrNumber && (
            <div className="flex justify-between">
              <span className="text-gray-500 text-sm">UTR</span>
              <span className="font-medium text-gray-800">{payment.utrNumber}</span>
            </div>
          )}
        </div>

        <Link 
          to="/" 
          className="inline-block w-full bg-gray-800 text-white py-3 rounded-lg font-medium hover:bg-gray-900 transition"
        >
          Go Back Home
        </Link>
      </div>
    </div>
  );
};

export default PaymentStatus;
