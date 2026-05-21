import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import axios from 'axios';
import toast from 'react-hot-toast';

const QRCodeDisplay = ({ upiLink, amount, orderId }) => {
  const isMobile = /Android/i.test(navigator.userAgent);
  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
  const isDesktop = !isMobile && !isIOS;

  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const AndroidView = () => (
    <div className="flex flex-col items-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100 animate-fadeIn">
      <div className="mb-4 text-center">
        <p className="text-gray-500 text-sm">Order #{orderId}</p>
        <p className="text-2xl font-bold text-gray-800">₹{parseFloat(amount).toFixed(2)}</p>
      </div>
      
      <div className="bg-white p-4 rounded-xl shadow-inner border border-gray-200 mb-6">
        <QRCodeSVG value={upiLink} size={220} level="H" includeMargin={true} />
      </div>
      
      <a 
        href={upiLink}
        className="w-full bg-indigo-600 text-white text-center py-3 rounded-lg font-medium hover:bg-indigo-700 transition shadow-md flex items-center justify-center gap-2"
      >
        Pay ₹{parseFloat(amount).toFixed(2)} via UPI App
      </a>

      <div className="mt-6 text-sm text-red-500 font-medium flex items-center justify-center gap-1">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Time remaining: {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </div>
    </div>
  );

  const IOSView = () => (
    <div className="flex flex-col items-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100 animate-fadeIn">
      <div className="mb-4 text-center">
        <p className="text-gray-500 text-sm">Order #{orderId}</p>
        <p className="text-2xl font-bold text-gray-800">₹{parseFloat(amount).toFixed(2)}</p>
      </div>

      <div className="w-full bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
        <h3 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
          📱 iPhone Payment Instructions
        </h3>
        <ol className="text-sm text-blue-700 space-y-2 list-decimal list-inside">
          <li>Open GPay / PhonePe / Paytm on your iPhone</li>
          <li>Go to "Scan QR" section</li>
          <li>Scan the QR code below using your camera</li>
          <li>Amount ₹{parseFloat(amount).toFixed(2)} will be pre-filled</li>
        </ol>
      </div>
      
      <div className="bg-white p-4 rounded-xl shadow-inner border border-gray-200 mb-4">
        <QRCodeSVG value={upiLink} size={250} level="H" includeMargin={true} />
      </div>

      <div className="w-full flex items-center justify-between bg-gray-50 px-4 py-3 rounded-lg border border-gray-200 mb-6">
        <span className="text-sm font-semibold text-gray-800 truncate">{import.meta.env.VITE_UPI_ID || 'yourname@upi'}</span>
        <button 
          onClick={() => {
            navigator.clipboard.writeText(import.meta.env.VITE_UPI_ID || 'yourname@upi');
            toast.success('Merchant UPI ID Copied!');
          }}
          className="ml-2 bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded text-xs font-bold hover:bg-indigo-200 transition whitespace-nowrap shadow-sm"
          type="button"
        >
          Copy ID
        </button>
      </div>

      <div className="text-sm text-red-500 font-medium flex items-center justify-center gap-1">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Time remaining: {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </div>
    </div>
  );

  const DesktopView = () => {
    const [upiId, setUpiId] = useState('');
    const [status, setStatus] = useState('idle'); // idle, loading, sent, verified
    const [error, setError] = useState('');

    const upiHandles = [
      "@ybl (PhonePe)",
      "@okaxis (GPay)",
      "@okhdfcbank (GPay)",
      "@paytm (Paytm)",
      "@ibl (PhonePe)",
    ];

    const validateUpiId = (id) => {
      const regex = /^[a-zA-Z0-9._-]{3,}@[a-zA-Z]{3,}$/;
      return regex.test(id);
    };

    const handleSendRequest = async () => {
      if (!validateUpiId(upiId)) {
        setError('Invalid UPI ID format. Must contain @');
        return;
      }
      setError('');
      setStatus('loading');

      try {
        await axios.post(`${import.meta.env.VITE_API_URL}/payment/collect-request`, {
          orderId,
          customerUpiId: upiId
        });
        setStatus('sent');
      } catch (err) {
        setStatus('idle');
        setError(err.response?.data?.message || 'Failed to send request');
      }
    };

    useEffect(() => {
      let interval;
      if (status === 'sent') {
        interval = setInterval(async () => {
          try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/payment/status/${orderId}`);
            if (res.data.status === 'verified') {
              setStatus('verified');
              clearInterval(interval);
            }
          } catch (e) {
            console.error('Polling error', e);
          }
        }, 5000);
      }
      return () => {
        if (interval) clearInterval(interval);
      };
    }, [status, orderId]);

    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 w-full max-w-3xl animate-fadeIn">
        <div className="mb-6 text-center border-b pb-4">
          <h2 className="text-xl font-bold text-gray-800">💻 Desktop Payment</h2>
          <p className="text-gray-500 text-sm mt-1">Order #{orderId} - ₹{parseFloat(amount).toFixed(2)}</p>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* LEFT COLUMN */}
          <div className="flex-1 flex flex-col items-center justify-start border-b md:border-b-0 md:border-r border-gray-100 pb-6 md:pb-0 md:pr-6">
            <h3 className="font-semibold text-gray-700 mb-4 w-full text-left">Option A — Scan QR</h3>
            <div className="bg-white p-3 rounded-xl shadow-inner border border-gray-200 mb-3">
              <QRCodeSVG value={upiLink} size={180} level="H" includeMargin={true} />
            </div>
            <p className="text-sm font-medium text-gray-600 mb-1">Scan with phone camera</p>
            <p className="text-xs text-gray-400 text-center">Supported: GPay, PhonePe, Paytm, BHIM</p>
          </div>

          {/* RIGHT COLUMN */}
          <div className="flex-1 flex flex-col justify-start">
            <h3 className="font-semibold text-gray-700 mb-4">Option B — Enter UPI ID</h3>
            
            {status === 'idle' && (
              <div className="space-y-4">
                <div>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => {
                      setUpiId(e.target.value);
                      if (error) setError('');
                    }}
                    onBlur={() => {
                      if (upiId && !validateUpiId(upiId)) {
                        setError('Invalid UPI ID format');
                      }
                    }}
                    placeholder="Enter your UPI ID (e.g. name@ybl)"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-600 outline-none text-sm"
                  />
                  {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
                  <p className="text-xs text-gray-400 mt-2">Examples: {upiHandles.join(', ')}</p>
                </div>
                
                <button
                  onClick={handleSendRequest}
                  className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition shadow-md text-sm"
                >
                  Send Payment Request ₹{parseFloat(amount).toFixed(2)}
                </button>
                <div className="bg-yellow-50 text-yellow-800 text-xs p-3 rounded-lg flex gap-2">
                  <span>ℹ️</span>
                  <span>You will receive a payment notification on your UPI app.</span>
                </div>
              </div>
            )}

            {status === 'loading' && (
              <button disabled className="w-full bg-indigo-400 text-white py-3 rounded-lg font-medium text-sm flex justify-center items-center gap-2 cursor-not-allowed">
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending request...
              </button>
            )}

            {status === 'sent' && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm">
                <p className="text-green-800 mb-1">✅ Payment request sent to <strong>{upiId}</strong></p>
                <p className="text-green-700 mb-4">Open your UPI app and approve ₹{parseFloat(amount).toFixed(2)} payment.</p>
                
                <div className="flex items-center gap-2 text-indigo-600 font-medium animate-pulse mb-3">
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Waiting for approval...
                </div>
                
                <div className="bg-blue-50 text-blue-800 text-xs p-2 rounded flex gap-1 mt-2">
                  <span>ℹ️</span>
                  <span>Demo Mode: The admin will manually verify your payment from the dashboard.</span>
                </div>
              </div>
            )}

            {status === 'verified' && (
              <div className="bg-green-500 text-white rounded-xl p-6 text-center shadow-sm">
                <div className="text-4xl mb-2">🎉</div>
                <h3 className="font-bold text-lg">Payment Verified!</h3>
                <p className="text-green-100 text-sm">Thank you for your purchase.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (isMobile) return <AndroidView />;
  if (isIOS) return <IOSView />;
  return <DesktopView />;
};

export default QRCodeDisplay;
