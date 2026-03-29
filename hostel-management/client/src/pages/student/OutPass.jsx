// src/pages/student/OutPass.jsx
import { useState, useEffect } from 'react';
import api from '../../api/client';
import toast from 'react-hot-toast';
import ConfirmDialog from '../../components/ConfirmDialog';

const getToday = () => new Date().toISOString().split('T')[0];

export default function OutPass() {
  const [passes, setPasses] = useState([]);
  const [form, setForm] = useState({ date: '', timeOut: '', expectedReturn: '', reason: '' });
  const [loading, setLoading] = useState(false);
  const [cancellingId, setCancellingId] = useState('');
  const [pendingCancelId, setPendingCancelId] = useState('');
  const fetch = () => api.get('/passes/out').then(({ data }) => setPasses(data.passes));
  useEffect(() => { fetch(); }, []);

  const validateForm = () => {
    const today = getToday();
    const reason = form.reason.trim();
    const timeOutDate = new Date(form.timeOut);
    const expectedReturnDate = new Date(form.expectedReturn);

    if (!form.date || !form.timeOut || !form.expectedReturn || !reason) {
      return 'All fields are required.';
    }

    if (form.date < today) {
      return 'Out pass date cannot be in the past.';
    }

    if (Number.isNaN(timeOutDate.getTime()) || Number.isNaN(expectedReturnDate.getTime())) {
      return 'Please enter valid time details.';
    }

    if (!form.timeOut.startsWith(form.date)) {
      return 'Time out must be on the selected date.';
    }

    if (expectedReturnDate <= timeOutDate) {
      return 'Expected return must be later than time out.';
    }

    if (reason.length < 4) {
      return 'Reason must be at least 4 characters long.';
    }

    if (reason.length > 200) {
      return 'Reason cannot exceed 200 characters.';
    }

    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const error = validateForm();
    if (error) {
      toast.error(error);
      return;
    }

    setLoading(true);
    try { await api.post('/passes/out', form); toast.success('Out pass applied!'); setForm({ date: '', timeOut: '', expectedReturn: '', reason: '' }); fetch(); }
    catch (err) { toast.error(err.response?.data?.error || 'Failed'); } finally { setLoading(false); }
  };

  const handleCancel = async () => {
    if (!pendingCancelId) return;
    setCancellingId(pendingCancelId);
    try {
      await api.delete(`/passes/out/${pendingCancelId}`);
      toast.success('Out pass request cancelled');
      setPendingCancelId('');
      fetch();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to cancel request');
    } finally {
      setCancellingId('');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Apply Out Pass</h1>
      <ConfirmDialog
        open={Boolean(pendingCancelId)}
        title="Cancel out pass request?"
        message="This will remove your pending out pass request from the system."
        confirmLabel="Yes, cancel it"
        cancelLabel="Keep request"
        busy={cancellingId === pendingCancelId}
        onConfirm={handleCancel}
        onCancel={() => !cancellingId && setPendingCancelId('')}
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-6">
          <h2 className="font-semibold text-slate-700 mb-4">New Request</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><label className="label">Date</label><input type="date" required min={getToday()} className="input" value={form.date} onChange={e => setForm({ ...form, date: e.target.value, ...(form.timeOut && !form.timeOut.startsWith(e.target.value) ? { timeOut: '' } : {}), ...(form.expectedReturn && form.expectedReturn < `${e.target.value}T00:00` ? { expectedReturn: '' } : {}) })} /></div>
            <div><label className="label">Time Out</label><input type="datetime-local" required min={form.date ? `${form.date}T00:00` : `${getToday()}T00:00`} className="input" value={form.timeOut} onChange={e => setForm({ ...form, timeOut: e.target.value, ...(form.expectedReturn && form.expectedReturn <= e.target.value ? { expectedReturn: '' } : {}) })} /></div>
            <div><label className="label">Expected Return</label><input type="datetime-local" required min={form.timeOut || (form.date ? `${form.date}T00:00` : `${getToday()}T00:00`)} className="input" value={form.expectedReturn} onChange={e => setForm({ ...form, expectedReturn: e.target.value })} /></div>
            <div><label className="label">Reason</label><textarea required minLength={4} maxLength={200} rows={3} className="input resize-none" value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} /></div>
            <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Submitting...' : 'Apply'}</button>
          </form>
        </div>
        <div className="lg:col-span-2 card overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100"><h2 className="font-semibold">Out Pass History</h2></div>
          {passes.length === 0 ? <div className="p-8 text-center text-slate-400">No out passes</div> : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50"><tr>{['Date', 'Time Out', 'Return', 'Reason', 'Status', 'Action'].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">{h}</th>)}</tr></thead>
              <tbody>{passes.map(p => (
                <tr key={p.id} className="border-t border-slate-50">
                  <td className="px-4 py-3">{new Date(p.date).toLocaleDateString()}</td>
                  <td className="px-4 py-3">{new Date(p.timeOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                  <td className="px-4 py-3">{new Date(p.expectedReturn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                  <td className="px-4 py-3 text-slate-500 max-w-[150px] truncate">{p.reason}</td>
                  <td className="px-4 py-3"><span className={`badge-${p.status.toLowerCase()}`}>{p.status}</span></td>
                  <td className="px-4 py-3">
                    {p.status === 'PENDING' ? (
                      <button
                        type="button"
                        className="text-xs font-medium text-rose-600 hover:text-rose-700 disabled:opacity-50"
                        disabled={cancellingId === p.id}
                        onClick={() => setPendingCancelId(p.id)}
                      >
                        {cancellingId === p.id ? 'Cancelling...' : 'Cancel'}
                      </button>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                </tr>
              ))}</tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

