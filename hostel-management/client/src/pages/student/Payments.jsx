// src/pages/student/Payments.jsx
import { useState, useEffect } from 'react';
import api from '../../api/client';
import toast from 'react-hot-toast';

// Dynamically load Razorpay checkout script
const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (document.getElementById('razorpay-script')) return resolve(true);
    const script = document.createElement('script');
    script.id = 'razorpay-script';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [payingId, setPayingId] = useState(null); // track which payment is being processed

  const fetchPayments = () => {
    setLoading(true);
    api.get('/payments')
      .then(({ data }) => setPayments(data.payments))
      .catch(() => toast.error('Failed to load payments'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchPayments(); }, []);

  const total = payments.reduce((s, p) => s + p.amount, 0);
  const paid = payments.filter(p => p.status === 'PAID').reduce((s, p) => s + p.amount, 0);
  const outstanding = total - paid;

  const handlePay = async (payment) => {
    setPayingId(payment.id);
    try {
      // 1. Load Razorpay SDK
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        toast.error('Failed to load payment gateway. Please try again.');
        setPayingId(null);
        return;
      }

      // 2. Create Razorpay order from backend
      const { data } = await api.post('/payments/create-order', { paymentId: payment.id });
      const { order, keyId } = data;

      // 3. Open Razorpay checkout
      const options = {
        key: keyId,
        amount: order.amount,
        currency: order.currency,
        name: 'Campus Nest',
        description: payment.fee.title,
        order_id: order.id,
        handler: async (response) => {
          // 4. Verify payment on backend
          try {
            await api.post('/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              paymentId: payment.id,
            });
            toast.success('Payment successful.');
            fetchPayments(); // refresh list
          } catch {
            toast.error('Payment verification failed. Contact admin.');
          }
        },
        prefill: {
          name: payment.student?.fullName || '',
          email: '',
        },
        theme: { color: '#2563eb' },
        modal: {
          ondismiss: () => {
            toast('Payment cancelled.');
            setPayingId(null);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', (response) => {
        toast.error(`Payment failed: ${response.error.description}`);
        setPayingId(null);
      });
      rzp.open();
    } catch (err) {
      const msg = err?.response?.data?.error || 'Failed to initiate payment.';
      toast.error(msg);
    } finally {
      setPayingId(null);
    }
  };

  const statusBadge = (status) => {
    if (status === 'PAID') return <span className="badge-approved">PAID</span>;
    if (status === 'OVERDUE') return <span className="badge-rejected">OVERDUE</span>;
    return <span className="badge-pending">PENDING</span>;
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Payments</h1>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          ['Total Payable', `₹${total.toLocaleString()}`, 'slate'],
          ['Paid', `₹${paid.toLocaleString()}`, 'green'],
          ['Outstanding', `₹${outstanding.toLocaleString()}`, outstanding > 0 ? 'red' : 'green'],
        ].map(([label, value, color]) => (
          <div key={label} className="card p-5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</p>
            <p className={`text-2xl font-bold mt-1 text-${color}-600`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Payment table */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="font-semibold text-slate-700">Payment History</h2>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading payments...</div>
        ) : payments.length === 0 ? (
          <div className="p-8 text-center text-slate-400">No payment records found.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                {['Fee', 'Amount', 'Due Date', 'Status', 'Paid On', 'Action'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {payments.map(p => (
                <tr key={p.id} className="border-t border-slate-50 hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-slate-800">{p.fee?.title}</td>
                  <td className="px-4 py-3 text-slate-700 font-semibold">₹{p.amount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-slate-500">
                    {p.fee?.dueDate ? new Date(p.fee.dueDate).toLocaleDateString('en-IN') : '—'}
                  </td>
                  <td className="px-4 py-3">{statusBadge(p.status)}</td>
                  <td className="px-4 py-3 text-slate-500">
                    {p.paidAt ? new Date(p.paidAt).toLocaleDateString('en-IN') : '—'}
                  </td>
                  <td className="px-4 py-3">
                    {p.status === 'PENDING' || p.status === 'OVERDUE' ? (
                      <button
                        onClick={() => handlePay(p)}
                        disabled={payingId === p.id}
                        className="btn-primary text-xs px-4 py-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {payingId === p.id ? 'Processing...' : 'Pay Now'}
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Note about Razorpay test mode */}
      <p className="text-xs text-slate-400 mt-4 text-center">
        Payments are processed securely via Razorpay. For test mode, prefer UPI with `success@razorpay` for success and `failure@razorpay` for failure.
      </p>
    </div>
  );
}


