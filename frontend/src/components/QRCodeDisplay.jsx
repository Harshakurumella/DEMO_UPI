import { QRCodeSVG } from 'qrcode.react';
import { useState, useEffect } from 'react';

const QRCodeDisplay = ({ upiLink, amount, orderId }) => {
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes

  const isAndroid = /Android/i.test(navigator.userAgent);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const upiId = import.meta.env.VITE_UPI_ID || 'yourname@upi';

  const handleCopy = () => {
    navigator.clipboard.writeText(upiId);
    alert('UPI ID copied!');
  };

  return (
    <div className="flex flex-col items-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100">

      {/* Header */}
      <p className="text-gray-500 text-sm mb-1">Order #{orderId}</p>
      <p className="text-2xl font-bold text-gray-800 mb-5">₹{parseFloat(amount).toFixed(2)}</p>

      {/* Instruction */}
      <p className="text-sm font-semibold text-gray-700 mb-4">📱 Scan QR with your phone to pay</p>

      {/* QR Code */}
      <div className="bg-white p-4 rounded-xl shadow-inner border border-gray-200 mb-5">
        <QRCodeSVG value={upiLink} size={250} level="H" includeMargin={true} />
      </div>

      {/* Payment Info */}
      <div className="w-full bg-gray-50 rounded-xl border border-gray-200 p-4 mb-5 space-y-2 text-sm">
        <div className="flex justify-between items-center">
          <span className="text-gray-500">Pay to</span>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-800">{upiId}</span>
            <button
              type="button"
              onClick={handleCopy}
              className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded font-medium hover:bg-indigo-200 transition"
            >
              Copy
            </button>
          </div>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Amount</span>
          <span className="font-semibold text-gray-800">₹{parseFloat(amount).toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-500">Order</span>
          <span className="font-mono text-gray-700 text-xs">{orderId}</span>
        </div>
      </div>

      {/* Android Only: Direct Pay Button */}
      {isAndroid && (
        <a
          href={upiLink}
          className="w-full bg-indigo-600 text-white text-center py-3 rounded-lg font-medium hover:bg-indigo-700 transition shadow-md mb-4"
        >
          Pay ₹{parseFloat(amount).toFixed(2)} via UPI App
        </a>
      )}

      {/* UTR Hint Box */}
      <div className="w-full bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800">
        <p className="font-medium mb-1">✅ After paying, confirm your payment</p>
        <p className="text-blue-600 text-xs">Enter your UTR / Transaction ID in the form below to confirm your payment.</p>
      </div>

      {/* Timer */}
      <div className="mt-5 text-sm text-red-500 font-medium flex items-center gap-1">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Time remaining: {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </div>
    </div>
  );
};

export default QRCodeDisplay;
