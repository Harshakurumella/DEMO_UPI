import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const QRCodeDisplay = ({ upiLink, amount, orderId, upiId }) => {
  const [utrNumber, setUtrNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const isAndroid = /Android/i.test(navigator.userAgent);
  const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
  const isMobile = isAndroid || isIOS;

  const handleUTRSubmit = async (e) => {
    e.preventDefault();
    if (!utrNumber || utrNumber.length < 6) {
      toast.error("Please enter a valid UTR number");
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/payment/submit-utr`, {
        orderId,
        utrNumber,
      });
      toast.success("Payment submitted successfully!");
      navigate(`/status/${orderId}`);
    } catch (err) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* QR Code — shown on ALL devices */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-4 text-center">
        <h2 className="text-lg font-bold text-gray-800 mb-1">
          Scan & Pay ₹{amount}
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          {isMobile
            ? "Scan QR or tap the button below to pay"
            : "Scan this QR code with your phone to pay"}
        </p>

        {/* QR Code */}
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-white border-2 border-gray-100 rounded-xl shadow-inner">
            <QRCodeSVG
              value={upiLink}
              size={isMobile ? 200 : 240}
              bgColor="#ffffff"
              fgColor="#1f2937"
              level="H"
              includeMargin={true}
            />
          </div>
        </div>

        {/* Payment Info */}
        <div className="bg-gray-50 rounded-xl p-3 mb-4 text-left space-y-1">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Pay to</span>
            <span className="font-medium text-gray-800">{upiId}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Amount</span>
            <span className="font-bold text-green-600">₹{amount}.00</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Order ID</span>
            <span className="font-medium text-gray-800 text-xs">{orderId}</span>
          </div>
        </div>

        {/* Mobile Only — UPI App Button */}
        {isMobile && (
          <div className="space-y-3">
            <a
              href={upiLink}
              className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white text-center py-3 rounded-xl font-semibold text-base transition-colors"
            >
              💳 Pay ₹{amount} via UPI App
            </a>

            {/* Supported Apps — Mobile Only */}
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <span className="text-xs text-gray-400">Works with:</span>
              {["GPay", "PhonePe", "Paytm", "BHIM"].map((app) => (
                <span
                  key={app}
                  className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
                >
                  {app}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Desktop Only — Instruction */}
        {!isMobile && (
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-left">
            <p className="text-sm font-semibold text-blue-800 mb-2">
              📱 How to pay from your phone:
            </p>
            <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
              <li>Open GPay / PhonePe / Paytm on your phone</li>
              <li>Tap "Scan QR" or use camera</li>
              <li>Scan the QR code above</li>
              <li>₹{amount} will be pre-filled — tap Pay</li>
            </ol>
          </div>
        )}
      </div>

      {/* UTR Form — shown on ALL devices after payment */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-base font-bold text-gray-800 mb-1">
          Paid? Confirm your payment
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Enter the UTR / Transaction Reference number from your UPI app
        </p>

        <form onSubmit={handleUTRSubmit} className="space-y-3">
          <div>
            <input
              type="text"
              value={utrNumber}
              onChange={(e) => setUtrNumber(e.target.value)}
              placeholder="e.g. 123456789012"
              maxLength={20}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
            />
            <p className="text-xs text-gray-400 mt-1">
              Find this in your UPI app → Payment History → Transaction ID
            </p>
          </div>

          <button
            type="submit"
            disabled={loading || !utrNumber}
            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 rounded-xl font-semibold text-sm transition-colors"
          >
            {loading ? "Submitting..." : "✅ Confirm Payment"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default QRCodeDisplay;
