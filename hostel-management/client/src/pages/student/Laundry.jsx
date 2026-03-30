// src/pages/student/Laundry.jsx
import { useState, useEffect } from 'react';
import api from '../../api/client';
import toast from 'react-hot-toast';

const getToday = () => new Date().toISOString().split('T')[0];

export default function Laundry() {
  const [requests, setRequests] = useState([]);
  const [form, setForm] = useState({ clothesCount: '', laundryType: 'REGULAR', pickupDate: '', returnDate: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const fetch = () => api.get('/laundry').then(({ data }) => setRequests(data.requests));
  useEffect(() => { fetch(); }, []);

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

    if (!form.pickupDate || !form.returnDate) {
      if (!form.pickupDate) nextErrors.pickupDate = 'Pickup date is required.';
      if (!form.returnDate) nextErrors.returnDate = 'Return date is required.';
    }

    if (form.pickupDate < today) {
      nextErrors.pickupDate = 'Pickup date cannot be in the past.';
    }

    if (form.returnDate < form.pickupDate) {
      nextErrors.returnDate = 'Return date cannot be earlier than pickup date.';
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
    try { await api.post('/laundry', form); toast.success('Laundry request submitted!'); setForm({ clothesCount: '', laundryType: 'REGULAR', pickupDate: '', returnDate: '' }); setErrors({}); fetch(); }
    catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
    finally { setLoading(false); }
  };
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Laundry Service</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-6">
          <h2 className="font-semibold text-slate-700 mb-4">New Request</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><label className="label">Number of Clothes</label><input type="number" required min={1} max={100} step={1} className={`input ${errors.clothesCount ? 'border-red-300 focus:ring-red-400' : ''}`} value={form.clothesCount} onChange={e => { setForm({ ...form, clothesCount: e.target.value }); if (errors.clothesCount) setErrors({ ...errors, clothesCount: '' }); }} />{errors.clothesCount && <p className="mt-1 text-xs text-red-500">{errors.clothesCount}</p>}</div>
            <div><label className="label">Laundry Type</label>
              <select className={`input ${errors.laundryType ? 'border-red-300 focus:ring-red-400' : ''}`} value={form.laundryType} onChange={e => { setForm({ ...form, laundryType: e.target.value }); if (errors.laundryType) setErrors({ ...errors, laundryType: '' }); }}>
                <option value="REGULAR">Regular ({'\u20B9'}15/item)</option><option value="EXPRESS">Express ({'\u20B9'}30/item)</option>
              </select>
              {errors.laundryType && <p className="mt-1 text-xs text-red-500">{errors.laundryType}</p>}
            </div>
            <div><label className="label">Pickup Date</label><input type="date" required min={getToday()} className={`input ${errors.pickupDate ? 'border-red-300 focus:ring-red-400' : ''}`} value={form.pickupDate} onChange={e => { setForm({ ...form, pickupDate: e.target.value, ...(form.returnDate && form.returnDate < e.target.value ? { returnDate: e.target.value } : {}) }); if (errors.pickupDate) setErrors({ ...errors, pickupDate: '' }); }} />{errors.pickupDate && <p className="mt-1 text-xs text-red-500">{errors.pickupDate}</p>}</div>
            <div><label className="label">Return Date</label><input type="date" required min={form.pickupDate || getToday()} className={`input ${errors.returnDate ? 'border-red-300 focus:ring-red-400' : ''}`} value={form.returnDate} onChange={e => { setForm({ ...form, returnDate: e.target.value }); if (errors.returnDate) setErrors({ ...errors, returnDate: '' }); }} />{errors.returnDate && <p className="mt-1 text-xs text-red-500">{errors.returnDate}</p>}</div>
            <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Submitting...' : 'Submit Request'}</button>
          </form>
        </div>
        <div className="lg:col-span-2 card overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100"><h2 className="font-semibold">Request History</h2></div>
          {requests.length === 0 ? <div className="p-8 text-center text-slate-400">No laundry requests</div> : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50"><tr>{['Clothes', 'Type', 'Pickup', 'Return', 'Amount', 'Status'].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">{h}</th>)}</tr></thead>
              <tbody>{requests.map(r => (
                <tr key={r.id} className="border-t border-slate-50">
                  <td className="px-4 py-3">{r.clothesCount}</td>
                  <td className="px-4 py-3">{r.laundryType}</td>
                  <td className="px-4 py-3 text-slate-500">{new Date(r.pickupDate).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-slate-500">{new Date(r.returnDate).toLocaleDateString()}</td>
                  <td className="px-4 py-3">{'\u20B9'}{r.amount}</td>
                  <td className="px-4 py-3"><span className={`badge-${r.status === 'DELIVERED' ? 'approved' : 'pending'}`}>{r.status}</span></td>
                </tr>
              ))}</tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

