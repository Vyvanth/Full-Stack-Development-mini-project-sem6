// src/pages/admin/LaundryManagement.jsx
import { useState, useEffect } from 'react';
import api from '../../api/client';
import toast from 'react-hot-toast';

export default function LaundryManagement() {
  const [requests, setRequests] = useState([]);
  const fetch = () => api.get('/laundry').then(({ data }) => setRequests(data.requests));
  useEffect(() => { fetch(); }, []);
  const update = async (id, payload) => {
    try { await api.patch(`/laundry/${id}`, payload); toast.success('Updated!'); fetch(); }
    catch { toast.error('Update failed'); }
  };
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Laundry Management</h1>
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50"><tr>{['Student', 'Clothes', 'Type', 'Pickup', 'Return', 'Amount', 'Payment', 'Status', 'Actions'].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">{h}</th>)}</tr></thead>
          <tbody>
            {requests.length === 0 ? <tr><td colSpan={9} className="px-4 py-8 text-center text-slate-400">No requests</td></tr> : requests.map(r => (
              <tr key={r.id} className="border-t border-slate-50">
                <td className="px-4 py-3 font-medium">{r.student?.fullName}</td>
                <td className="px-4 py-3">{r.clothesCount}</td>
                <td className="px-4 py-3">{r.laundryType}</td>
                <td className="px-4 py-3 text-slate-500">{new Date(r.pickupDate).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-slate-500">{new Date(r.returnDate).toLocaleDateString()}</td>
                <td className="px-4 py-3">₹{r.amount}</td>
                <td className="px-4 py-3">
                  <input type="checkbox" checked={r.isPaid} onChange={e => update(r.id, { isPaid: e.target.checked })} className="rounded" />
                </td>
                <td className="px-4 py-3"><span className={`badge-${r.status === 'DELIVERED' ? 'approved' : 'pending'}`}>{r.status}</span></td>
                <td className="px-4 py-3">
                  <select className="text-xs border rounded px-2 py-1" value={r.status} onChange={e => update(r.id, { status: e.target.value })}>
                    {['PENDING', 'PICKED_UP', 'PROCESSING', 'DELIVERED'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
