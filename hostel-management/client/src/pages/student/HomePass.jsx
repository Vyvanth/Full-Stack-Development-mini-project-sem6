// src/pages/student/HomePass.jsx
import { useState, useEffect } from 'react';
import api from '../../api/client';
import toast from 'react-hot-toast';

export default function HomePass() {
  const [passes, setPasses] = useState([]);
  const [form, setForm] = useState({ fromDate: '', toDate: '', destination: '', guardianContact: '', reason: '' });
  const [loading, setLoading] = useState(false);
  const fetch = () => api.get('/passes/home').then(({ data }) => setPasses(data.passes));
  useEffect(() => { fetch(); }, []);
  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try { await api.post('/passes/home', form); toast.success('Home pass applied!'); setForm({ fromDate: '', toDate: '', destination: '', guardianContact: '', reason: '' }); fetch(); }
    catch (err) { toast.error(err.response?.data?.error || 'Failed'); } finally { setLoading(false); }
  };
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Apply Home Pass</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-6">
          <h2 className="font-semibold text-slate-700 mb-4">New Request</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><label className="label">From Date</label><input type="date" required className="input" value={form.fromDate} onChange={e => setForm({ ...form, fromDate: e.target.value })} /></div>
            <div><label className="label">To Date</label><input type="date" required className="input" value={form.toDate} onChange={e => setForm({ ...form, toDate: e.target.value })} /></div>
            <div><label className="label">Destination</label><input required className="input" placeholder="City, State" value={form.destination} onChange={e => setForm({ ...form, destination: e.target.value })} /></div>
            <div><label className="label">Guardian Contact</label><input required className="input" placeholder="10-digit number" value={form.guardianContact} onChange={e => setForm({ ...form, guardianContact: e.target.value })} /></div>
            <div><label className="label">Reason</label><textarea required rows={3} className="input resize-none" value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} /></div>
            <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Submitting...' : 'Apply'}</button>
          </form>
        </div>
        <div className="lg:col-span-2 card overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100"><h2 className="font-semibold">Home Pass History</h2></div>
          {passes.length === 0 ? <div className="p-8 text-center text-slate-400">No home passes</div> : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50"><tr>{['From', 'To', 'Destination', 'Status', 'Remarks'].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">{h}</th>)}</tr></thead>
              <tbody>{passes.map(p => (
                <tr key={p.id} className="border-t border-slate-50">
                  <td className="px-4 py-3">{new Date(p.fromDate).toLocaleDateString()}</td>
                  <td className="px-4 py-3">{new Date(p.toDate).toLocaleDateString()}</td>
                  <td className="px-4 py-3">{p.destination}</td>
                  <td className="px-4 py-3"><span className={`badge-${p.status.toLowerCase()}`}>{p.status}</span></td>
                  <td className="px-4 py-3 text-slate-500">{p.remarks || '-'}</td>
                </tr>
              ))}</tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
