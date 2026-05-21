import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [payments, setPayments] = useState([]);
  const [counts, setCounts] = useState({ total: 0, pending: 0, submitted: 0, verified: 0, rejected: 0 });
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  
  const token = localStorage.getItem('admin_token');

  useEffect(() => {
    if (!token) {
      navigate('/admin/login');
      return;
    }
    fetchData();
    const interval = setInterval(fetchData, 15000); // Auto-refresh every 15s
    return () => clearInterval(interval);
  }, [filter, token, navigate]);

  const fetchData = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/admin/payments${filter ? `?status=${filter}` : ''}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPayments(res.data.payments);
      setCounts(res.data.counts);
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem('admin_token');
        navigate('/admin/login');
      }
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id) => {
    try {
      await axios.patch(`${import.meta.env.VITE_API_URL}/admin/payments/${id}/verify`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Payment verified');
      fetchData();
    } catch (error) {
      toast.error('Failed to verify payment');
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Are you sure you want to reject this payment?')) return;
    try {
      await axios.patch(`${import.meta.env.VITE_API_URL}/admin/payments/${id}/reject`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Payment rejected');
      fetchData();
    } catch (error) {
      toast.error('Failed to reject payment');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this record forever?')) return;
    try {
      await axios.delete(`${import.meta.env.VITE_API_URL}/admin/payments/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Payment deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete payment');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    navigate('/admin/login');
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800',
      submitted: 'bg-blue-100 text-blue-800',
      verified: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    return <span className={`px-2 py-1 text-xs font-semibold rounded-full ${badges[status]}`}>{status.toUpperCase()}</span>;
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          <button 
            onClick={handleLogout}
            className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition"
          >
            Logout
          </button>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <p className="text-sm text-gray-500 font-medium">Total</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">{counts.total}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-yellow-200">
            <p className="text-sm text-yellow-600 font-medium">Pending</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">{counts.pending}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-200">
            <p className="text-sm text-blue-600 font-medium">Submitted</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">{counts.submitted}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-green-200">
            <p className="text-sm text-green-600 font-medium">Verified</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">{counts.verified}</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-red-200">
            <p className="text-sm text-red-600 font-medium">Rejected</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">{counts.rejected}</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex gap-2 overflow-x-auto">
          {['', 'pending', 'submitted', 'verified', 'rejected'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${filter === f ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {f ? f.charAt(0).toUpperCase() + f.slice(1) : 'All Payments'}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-sm">
                  <th className="p-4 font-semibold">Order ID</th>
                  <th className="p-4 font-semibold">Customer</th>
                  <th className="p-4 font-semibold">Payment Method</th>
                  <th className="p-4 font-semibold">Customer UPI ID</th>
                  <th className="p-4 font-semibold">Amount</th>
                  <th className="p-4 font-semibold">UTR Number</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold">Date</th>
                  <th className="p-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {loading ? (
                  <tr><td colSpan="9" className="p-8 text-center text-gray-500">Loading...</td></tr>
                ) : payments.length === 0 ? (
                  <tr><td colSpan="9" className="p-8 text-center text-gray-500">No payments found</td></tr>
                ) : (
                  payments.map(payment => (
                    <tr key={payment._id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                      <td className="p-4 font-medium text-gray-900">{payment.orderId}</td>
                      <td className="p-4">
                        <p className="font-medium text-gray-800">{payment.customerName}</p>
                        <p className="text-xs text-gray-500">{payment.customerEmail}</p>
                        <p className="text-xs text-gray-500">{payment.customerPhone}</p>
                      </td>
                      <td className="p-4 text-gray-700 capitalize">{payment.paymentMethod || 'qr'}</td>
                      <td className="p-4">
                        {payment.collectRequestSent ? (
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full font-medium flex items-center gap-1 w-max">
                            🔵 Collect Request Sent → {payment.customerUpiId}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="p-4 font-semibold text-gray-700">₹{payment.amount}</td>
                      <td className="p-4 font-mono text-gray-600">{payment.utrNumber || '-'}</td>
                      <td className="p-4">{getStatusBadge(payment.status)}</td>
                      <td className="p-4 text-gray-500">{new Date(payment.createdAt).toLocaleDateString()}</td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          {(payment.status === 'submitted' || (payment.status === 'pending' && payment.collectRequestSent)) && (
                            <>
                              <button onClick={() => handleVerify(payment._id)} className="bg-green-500 text-white p-2 rounded hover:bg-green-600 transition" title="Verify">
                                ✅
                              </button>
                              <button onClick={() => handleReject(payment._id)} className="bg-red-500 text-white p-2 rounded hover:bg-red-600 transition" title="Reject">
                                ❌
                              </button>
                            </>
                          )}
                          <button onClick={() => handleDelete(payment._id)} className="bg-gray-200 text-gray-600 p-2 rounded hover:bg-gray-300 transition" title="Delete">
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
