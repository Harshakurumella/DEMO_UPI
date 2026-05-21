import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const UTRForm = ({ orderId }) => {
  const [utr, setUtr] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (utr.length < 6) {
      toast.error('Transaction ID seems too short');
      return;
    }
    
    setLoading(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/payment/submit-utr`, {
        orderId,
        utrNumber: utr
      });
      toast.success('Payment submitted for verification!');
      navigate(`/status/${orderId}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit UTR');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8 pt-6 border-t border-gray-100">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <label className="text-sm font-semibold text-gray-700">
          Enter UTR / Transaction Reference Number
        </label>
        <input 
          type="text"
          required
          value={utr}
          onChange={(e) => setUtr(e.target.value)} 
          maxLength={30}
          placeholder="e.g. 123456789012"
          className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-600 focus:bg-white outline-none transition"
        />
        <p className="text-xs text-gray-500">Find this in your UPI app under payment history.</p>
        <button 
          type="submit" 
          disabled={loading || utr.length < 6}
          className="mt-2 w-full bg-green-600 text-white py-3 rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
        >
          {loading ? 'Confirming...' : 'Confirm Payment'}
        </button>
      </form>
    </div>
  );
};

export default UTRForm;
