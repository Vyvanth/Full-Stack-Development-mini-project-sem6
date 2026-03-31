// src/pages/admin/LaundryManagement.jsx
import { useState, useEffect } from 'react';
import api from '../../api/client';
import toast from 'react-hot-toast';

const STATUS_FLOW = {
  PENDING: { next: 'PICKED_UP', label: 'Mark Picked Up' },
  PICKED_UP: { next: 'PROCESSING', label: 'Send to Processing' },
  PROCESSING: { next: 'DELIVERED', label: 'Mark Delivered' },
  DELIVERED: null,
};

export default function LaundryManagement() {
  const [requests, setRequests] = useState([]);
  const fetch = () => api.get('/laundry').then(({ data }) => setRequests(data.requests));
  useEffect(() => { fetch(); }, []);
  const update = async (id, payload) => {
    try { await api.patch(`/laundry/${id}`, payload); toast.success('Updated!'); fetch(); }
    catch (err) { toast.error(err.response?.data?.error || 'Update failed'); }
  };
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Laundry Management</h1>
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50"><tr>{['Student', 'Clothes', 'Type', 'Pickup', 'Return', 'Amount', 'Payment', 'Status', 'Next Step'].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">{h}</th>)}</tr></thead>
          <tbody>
            {requests.length === 0 ? <tr><td colSpan={9} className="px-4 py-8 text-center text-slate-400">No requests</td></tr> : requests.map(r => (
              <tr key={r.id} className="border-t border-slate-50">
                <td className="px-4 py-3">
                  <p className="font-medium">{r.student?.fullName}</p>
                  <p className="text-xs text-slate-400">{r.student?.rollNumber}</p>
                </td>
                <td className="px-4 py-3">{r.clothesCount}</td>
                <td className="px-4 py-3">{r.laundryType}</td>
                <td className="px-4 py-3 text-slate-500">{new Date(r.pickupDate).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-slate-500">{new Date(r.returnDate).toLocaleDateString()}</td>
                <td className="px-4 py-3">{'\u20B9'}{r.amount}</td>
                <td className="px-4 py-3">
                  <label className="inline-flex items-center gap-2">
                    <input type="checkbox" checked={r.isPaid} onChange={e => update(r.id, { isPaid: e.target.checked })} className="rounded" />
                    <span className={`text-xs font-medium ${r.isPaid ? 'text-emerald-600' : 'text-amber-600'}`}>{r.isPaid ? 'Paid' : 'Pending'}</span>
                  </label>
                </td>
                <td className="px-4 py-3">
                  <span className={`badge-${r.status === 'DELIVERED' ? 'approved' : 'pending'}`}>{r.status.replace('_', ' ')}</span>
                </td>
                <td className="px-4 py-3">
                  {STATUS_FLOW[r.status] ? (
                    <button
                      type="button"
                      onClick={() => update(r.id, { status: STATUS_FLOW[r.status].next })}
                      disabled={r.status === 'PROCESSING' && !r.isPaid}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {STATUS_FLOW[r.status].label}
                    </button>
                  ) : (
                    <span className="text-xs text-emerald-600 font-medium">Completed</span>
                  )}
                  {r.status === 'PROCESSING' && !r.isPaid && (
                    <p className="mt-1 text-[11px] text-amber-600">Collect payment before delivery</p>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

