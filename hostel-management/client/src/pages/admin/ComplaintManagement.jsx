// src/pages/admin/ComplaintManagement.jsx
import { useState, useEffect } from 'react';
import api from '../../api/client';
import toast from 'react-hot-toast';

export default function ComplaintManagement() {
  const [complaints, setComplaints] = useState([]);
  const [filter, setFilter] = useState('');
  const fetch = (s = '') => api.get(`/complaints${s ? `?status=${s}` : ''}`).then(({ data }) => setComplaints(data.complaints));
  useEffect(() => { fetch(); }, []);

  const update = async (id, payload) => {
    try { await api.patch(`/complaints/${id}`, payload); toast.success('Updated!'); fetch(filter); }
    catch { toast.error('Update failed'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Complaints</h1>
        <select className="input w-48" value={filter} onChange={e => { setFilter(e.target.value); fetch(e.target.value); }}>
          <option value="">All Statuses</option>
          {['PENDING', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map(s => <option key={s}>{s}</option>)}
        </select>
      </div>
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50"><tr>{['Student', 'Category', 'Description', 'Priority', 'Status', 'Actions'].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">{h}</th>)}</tr></thead>
          <tbody>
            {complaints.length === 0 ? <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">No complaints</td></tr> : complaints.map(c => (
              <tr key={c.id} className="border-t border-slate-50">
                <td className="px-4 py-3 font-medium">{c.student?.fullName}</td>
                <td className="px-4 py-3">{c.category}</td>
                <td className="px-4 py-3 text-slate-500 max-w-[200px] truncate">{c.description}</td>
                <td className="px-4 py-3">
                  <select className="text-xs border rounded px-2 py-1" value={c.priority} onChange={e => update(c.id, { priority: e.target.value })}>
                    {['LOW', 'MEDIUM', 'HIGH'].map(p => <option key={p}>{p}</option>)}
                  </select>
                </td>
                <td className="px-4 py-3"><span className={`badge-${c.status === 'RESOLVED' ? 'resolved' : c.status === 'CLOSED' ? 'approved' : 'pending'}`}>{c.status}</span></td>
                <td className="px-4 py-3">
                  <select className="text-xs border rounded px-2 py-1" value={c.status} onChange={e => update(c.id, { status: e.target.value })}>
                    {['PENDING', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'].map(s => <option key={s}>{s}</option>)}
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

