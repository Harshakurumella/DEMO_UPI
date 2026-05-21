import { QRCodeSVG } from 'qrcode.react';
import { useState, useEffect } from 'react';

const QRCodeDisplay = ({ upiLink, amount, orderId }) => {
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [activeTab, setActiveTab] = useState('qr');

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="flex flex-col items-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
      <div className="mb-4 text-center">
        <p className="text-gray-500 text-sm">Order #{orderId}</p>
        <p className="text-2xl font-bold text-gray-800">₹{parseFloat(amount).toFixed(2)}</p>
      </div>

      <div className="flex w-full bg-gray-100 p-1 rounded-lg mb-6">
        <button 
          type="button"
          onClick={() => setActiveTab('qr')} 
          className={`flex-1 py-2 text-xs font-medium rounded-md transition ${activeTab === 'qr' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-600 hover:bg-gray-200'}`}
        >
          Scan QR
        </button>
        <button 
          type="button"
          onClick={() => setActiveTab('apps')} 
          className={`flex-1 py-2 text-xs font-medium rounded-md transition ${activeTab === 'apps' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-600 hover:bg-gray-200'}`}
        >
          UPI Apps
        </button>
        <button 
          type="button"
          onClick={() => setActiveTab('id')} 
          className={`flex-1 py-2 text-xs font-medium rounded-md transition ${activeTab === 'id' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-600 hover:bg-gray-200'}`}
        >
          UPI ID
        </button>
      </div>
      
      {activeTab === 'qr' && (
        <div className="w-full flex flex-col items-center animate-fadeIn">
          <div className="bg-white p-4 rounded-xl shadow-inner border border-gray-200">
            <QRCodeSVG 
              value={upiLink} 
              size={220} 
              level="H"
              includeMargin={true}
            />
          </div>
          <p className="mt-4 text-sm font-medium text-gray-600">Scan with any UPI app</p>
        </div>
      )}

      {activeTab === 'apps' && (
        <div className="w-full flex flex-col gap-3 animate-fadeIn">
          <p className="text-sm text-gray-600 text-center mb-1">Select an app to pay directly</p>
          <a 
            href={upiLink.replace('upi://pay', 'gpay://upi/pay')}
            className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-center py-3 rounded-lg font-medium hover:bg-gray-100 transition shadow-sm flex items-center justify-center gap-2"
          >
            Google Pay
          </a>
          <a 
            href={upiLink.replace('upi://pay', 'phonepe://pay')}
            className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-center py-3 rounded-lg font-medium hover:bg-gray-100 transition shadow-sm flex items-center justify-center gap-2"
          >
            PhonePe
          </a>
          <a 
            href={upiLink.replace('upi://pay', 'paytmmp://pay')}
            className="w-full bg-gray-50 border border-gray-200 text-gray-800 text-center py-3 rounded-lg font-medium hover:bg-gray-100 transition shadow-sm flex items-center justify-center gap-2"
          >
            Paytm
          </a>
          <a 
            href={upiLink}
            className="w-full bg-indigo-600 text-white text-center py-3 rounded-lg font-medium hover:bg-indigo-700 transition shadow-md flex items-center justify-center gap-2"
          >
            Other UPI App
          </a>
        </div>
      )}

      {activeTab === 'id' && (
        <div className="w-full flex flex-col gap-4 py-2 animate-fadeIn">
          <div className="flex flex-col gap-3">
            <label className="text-sm text-gray-600 text-center font-medium">Enter your UPI ID</label>
            <input 
              type="text"
              placeholder="e.g. 9876543210@ybl"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:bg-white outline-none transition text-center"
            />
            <a 
              href={upiLink}
              className="w-full bg-indigo-600 text-white text-center py-3 rounded-lg font-medium hover:bg-indigo-700 transition shadow-md"
            >
              Verify & Pay
            </a>
            <p className="text-[10px] text-gray-400 text-center leading-tight">
              * Note: On desktop, you may need to scan the QR code instead. This button works best on mobile devices.
            </p>
          </div>

          <div className="mt-2 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500 text-center mb-2">Or manually copy our merchant UPI ID:</p>
            <div className="w-full flex items-center justify-between bg-gray-50 px-4 py-3 rounded-lg border border-gray-200">
              <span className="text-sm font-semibold text-gray-800 break-all">{import.meta.env.VITE_UPI_ID || 'yourname@upi'}</span>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(import.meta.env.VITE_UPI_ID || 'yourname@upi');
                  alert('Merchant UPI ID Copied!');
                }}
                className="ml-2 bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded text-xs font-bold hover:bg-indigo-200 transition whitespace-nowrap shadow-sm"
                type="button"
              >
                Copy ID
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="mt-6 text-sm text-red-500 font-medium flex items-center justify-center gap-1">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        Time remaining: {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </div>
    </div>
  );
};

export default QRCodeDisplay;
