// src/pages/student/Laundry.jsx
import { useState, useEffect } from 'react';
import api from '../../api/client';
import toast from 'react-hot-toast';
import ConfirmDialog from '../../components/ConfirmDialog';

const getToday = () => new Date().toISOString().split('T')[0];
const STATUS_STEPS = ['PENDING', 'PICKED_UP', 'PROCESSING', 'DELIVERED'];
const STATUS_LABELS = {
  PENDING: 'Pending Pickup',
  PICKED_UP: 'Picked Up',
  PROCESSING: 'In Laundry',
  DELIVERED: 'Delivered',
};
const TYPE_RULES = {
  REGULAR: 'Pickup today, return after at least 2 days',
  EXPRESS: 'Pickup today, return by same day or next day',
};

export default function Laundry() {
  const [requests, setRequests] = useState([]);
  const [form, setForm] = useState({ clothesCount: '', laundryType: 'REGULAR', returnDate: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);
  const fetch = () => api.get('/laundry').then(({ data }) => setRequests(data.requests));
  useEffect(() => { fetch(); }, []);

  const activeRequest = requests.find((request) => ['PENDING', 'PICKED_UP', 'PROCESSING'].includes(request.status));
  const estimatedAmount = Number(form.clothesCount || 0) * (form.laundryType === 'EXPRESS' ? 30 : 15);

  const validateForm = () => {
    const nextErrors = {};
    const count = Number(form.clothesCount);
    const today = getToday();

    if (!Number.isInteger(count) || count <= 0) {
      nextErrors.clothesCount = 'Number of clothes must be a whole number greater than 0.';
    }

    if (count > 100) {
      nextErrors.clothesCount = 'Number of clothes cannot exceed 100 in a single request.';
    }

    if (!['REGULAR', 'EXPRESS'].includes(form.laundryType)) {
      nextErrors.laundryType = 'Please select a valid laundry type.';
    }

    if (!form.returnDate) {
      nextErrors.returnDate = 'Return date is required.';
    }

    if (form.returnDate < today) {
      nextErrors.returnDate = 'Return date cannot be in the past.';
    }

    if (form.returnDate) {
      const pickup = new Date(today);
      const ret = new Date(form.returnDate);
      pickup.setHours(0, 0, 0, 0);
      ret.setHours(0, 0, 0, 0);
      const diffDays = Math.round((ret - pickup) / (1000 * 60 * 60 * 24));

      if (form.laundryType === 'REGULAR' && diffDays < 2) {
        nextErrors.returnDate = 'Regular laundry needs at least a 2-day turnaround.';
      }

      if (form.laundryType === 'EXPRESS' && diffDays > 1) {
        nextErrors.returnDate = 'Express laundry must return the same day or next day.';
      }
    }

    if (activeRequest) {
      nextErrors.form = 'Finish or cancel your current request before placing a new one.';
    }

    return nextErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = validateForm();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      toast.error('Please fix the highlighted fields.');
      return;
    }

    setLoading(true);
    try { await api.post('/laundry', { ...form, pickupDate: getToday() }); toast.success('Laundry request submitted!'); setForm({ clothesCount: '', laundryType: 'REGULAR', returnDate: '' }); setErrors({}); fetch(); }
    catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
    finally { setLoading(false); }
  };

  const handleCancelRequest = async () => {
    if (!cancellingId) return;
    try {
      await api.delete(`/laundry/${cancellingId}`);
      toast.success('Laundry request cancelled');
      setCancellingId(null);
      fetch();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not cancel request');
    }
  };

  const formatStatus = (status) => STATUS_LABELS[status] || status;
  const stepIndex = (status) => STATUS_STEPS.indexOf(status);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Laundry Service</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-6">
          <h2 className="font-semibold text-slate-700 mb-4">New Request</h2>
          <div className="mb-4 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
            <p className="font-medium text-slate-700">Service rule</p>
            <p className="mt-1">{TYPE_RULES[form.laundryType]}</p>
            <p className="mt-2 text-xs text-slate-500">Pickup will be scheduled for today automatically.</p>
            <p className="mt-2 text-xs text-slate-500">Estimated charge: {'\u20B9'}{Number.isFinite(estimatedAmount) ? estimatedAmount : 0}</p>
          </div>
          {activeRequest && (
            <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Active request in progress: <span className="font-semibold">{formatStatus(activeRequest.status)}</span>. Complete or cancel it before booking another pickup.
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><label className="label">Number of Clothes</label><input type="number" required min={1} max={100} step={1} className={`input ${errors.clothesCount ? 'border-red-300 focus:ring-red-400' : ''}`} value={form.clothesCount} onChange={e => { setForm({ ...form, clothesCount: e.target.value }); if (errors.clothesCount) setErrors({ ...errors, clothesCount: '' }); }} />{errors.clothesCount && <p className="mt-1 text-xs text-red-500">{errors.clothesCount}</p>}</div>
            <div><label className="label">Laundry Type</label>
              <select className={`input ${errors.laundryType ? 'border-red-300 focus:ring-red-400' : ''}`} value={form.laundryType} onChange={e => { setForm({ ...form, laundryType: e.target.value }); if (errors.laundryType) setErrors({ ...errors, laundryType: '' }); }}>
                <option value="REGULAR">Regular ({'\u20B9'}15/item)</option><option value="EXPRESS">Express ({'\u20B9'}30/item)</option>
              </select>
              {errors.laundryType && <p className="mt-1 text-xs text-red-500">{errors.laundryType}</p>}
            </div>
            <div><label className="label">Return Date</label><input type="date" required min={getToday()} className={`input ${errors.returnDate ? 'border-red-300 focus:ring-red-400' : ''}`} value={form.returnDate} onChange={e => { setForm({ ...form, returnDate: e.target.value }); if (errors.returnDate) setErrors({ ...errors, returnDate: '' }); }} />{errors.returnDate && <p className="mt-1 text-xs text-red-500">{errors.returnDate}</p>}</div>
            {errors.form && <p className="text-xs text-red-500">{errors.form}</p>}
            <button type="submit" disabled={loading || Boolean(activeRequest)} className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60">{loading ? 'Submitting...' : 'Submit Request'}</button>
          </form>
        </div>
        <div className="lg:col-span-2 card overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100"><h2 className="font-semibold">Request History</h2></div>
          {requests.length === 0 ? <div className="p-8 text-center text-slate-400">No laundry requests</div> : (
            <div className="overflow-x-auto">
              <table className="min-w-[900px] w-full text-sm">
                <thead className="bg-slate-50"><tr>{['Clothes', 'Type', 'Pickup', 'Return', 'Amount', 'Payment', 'Status', 'Action'].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">{h}</th>)}</tr></thead>
                <tbody>{requests.map(r => (
                  <tr key={r.id} className="border-t border-slate-50">
                    <td className="px-4 py-3">{r.clothesCount}</td>
                    <td className="px-4 py-3">{r.laundryType}</td>
                    <td className="px-4 py-3 text-slate-500">{new Date(r.pickupDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-slate-500">{new Date(r.returnDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3">{'\u20B9'}{r.amount}</td>
                    <td className="px-4 py-3">
                      <span className={`badge-${r.isPaid ? 'approved' : 'pending'}`}>{r.isPaid ? 'PAID' : 'PENDING'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-2">
                        <span className={`badge-${r.status === 'DELIVERED' ? 'approved' : 'pending'}`}>{formatStatus(r.status)}</span>
                        <div className="flex gap-1">
                          {STATUS_STEPS.map((step, index) => (
                            <span key={step} className={`h-1.5 w-7 rounded-full ${index <= stepIndex(r.status) ? 'bg-teal-500' : 'bg-slate-200'}`} />
                          ))}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {r.status === 'PENDING' ? (
                        <button type="button" onClick={() => setCancellingId(r.id)} className="text-xs font-medium text-red-500 hover:text-red-600">
                          Cancel
                        </button>
                      ) : r.status === 'DELIVERED' ? (
                        <span className="text-xs font-medium text-emerald-600">Completed</span>
                      ) : (
                        <span className="text-xs text-slate-400">In progress</span>
                      )}
                    </td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      <ConfirmDialog
        open={Boolean(cancellingId)}
        title="Cancel laundry request?"
        description="This request will be removed before pickup. You can place a new request later."
        confirmText="Yes, cancel it"
        cancelText="Keep request"
        onClose={() => setCancellingId(null)}
        onConfirm={handleCancelRequest}
        confirmTone="danger"
      />
    </div>
  );
}

