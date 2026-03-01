// src/pages/student/OutPass.jsx
import { useState, useEffect } from 'react';
import api from '../../api/client';
import toast from 'react-hot-toast';

export default function OutPass() {
  const [passes, setPasses] = useState([]);
  const [form, setForm] = useState({ date: '', timeOut: '', expectedReturn: '', reason: '' });
  const [loading, setLoading] = useState(false);
  const fetch = () => api.get('/passes/out').then(({ data }) => setPasses(data.passes));
  useEffect(() => { fetch(); }, []);
  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try { await api.post('/passes/out', form); toast.success('Out pass applied!'); setForm({ date: '', timeOut: '', expectedReturn: '', reason: '' }); fetch(); }
    catch (err) { toast.error(err.response?.data?.error || 'Failed'); } finally { setLoading(false); }
  };
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Apply Out Pass</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-6">
          <h2 className="font-semibold text-slate-700 mb-4">New Request</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><label className="label">Date</label><input type="date" required className="input" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} /></div>
            <div><label className="label">Time Out</label><input type="datetime-local" required className="input" value={form.timeOut} onChange={e => setForm({ ...form, timeOut: e.target.value })} /></div>
            <div><label className="label">Expected Return</label><input type="datetime-local" required className="input" value={form.expectedReturn} onChange={e => setForm({ ...form, expectedReturn: e.target.value })} /></div>
            <div><label className="label">Reason</label><textarea required rows={3} className="input resize-none" value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} /></div>
            <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Submitting...' : 'Apply'}</button>
          </form>
        </div>
        <div className="lg:col-span-2 card overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100"><h2 className="font-semibold">Out Pass History</h2></div>
          {passes.length === 0 ? <div className="p-8 text-center text-slate-400">No out passes</div> : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50"><tr>{['Date', 'Time Out', 'Return', 'Reason', 'Status'].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">{h}</th>)}</tr></thead>
              <tbody>{passes.map(p => (
                <tr key={p.id} className="border-t border-slate-50">
                  <td className="px-4 py-3">{new Date(p.date).toLocaleDateString()}</td>
                  <td className="px-4 py-3">{new Date(p.timeOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                  <td className="px-4 py-3">{new Date(p.expectedReturn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                  <td className="px-4 py-3 text-slate-500 max-w-[150px] truncate">{p.reason}</td>
                  <td className="px-4 py-3"><span className={`badge-${p.status.toLowerCase()}`}>{p.status}</span></td>
                </tr>
              ))}</tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
