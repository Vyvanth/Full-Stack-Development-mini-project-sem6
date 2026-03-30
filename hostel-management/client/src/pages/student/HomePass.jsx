// src/pages/student/HomePass.jsx
import { useState, useEffect } from 'react';
import api from '../../api/client';
import toast from 'react-hot-toast';
import ConfirmDialog from '../../components/ConfirmDialog';

const getToday = () => new Date().toISOString().split('T')[0];

export default function HomePass() {
  const [passes, setPasses] = useState([]);
  const [form, setForm] = useState({ fromDate: '', fromTime: '', toDate: '', toTime: '', reason: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [cancellingId, setCancellingId] = useState('');
  const [pendingCancelId, setPendingCancelId] = useState('');
  const fetch = () => api.get('/passes/home').then(({ data }) => setPasses(data.passes));
  useEffect(() => { fetch(); }, []);

  const validateForm = () => {
    const nextErrors = {};
    const today = getToday();
    const reason = form.reason.trim();

    if (!form.fromDate) nextErrors.fromDate = 'Please choose a start date.';
    if (!form.fromTime) nextErrors.fromTime = 'Please choose a start time.';
    if (!form.toDate) nextErrors.toDate = 'Please choose an end date.';
    if (!form.toTime) nextErrors.toTime = 'Please choose an end time.';
    if (!reason) nextErrors.reason = 'Please enter a reason.';

    if (form.fromDate < today) {
      nextErrors.fromDate = 'From date cannot be in the past.';
    }

    const fromDateTime = new Date(`${form.fromDate}T${form.fromTime}`);
    const toDateTime = new Date(`${form.toDate}T${form.toTime}`);

    if (Number.isNaN(fromDateTime.getTime()) || Number.isNaN(toDateTime.getTime())) {
      if (!nextErrors.fromTime) nextErrors.fromTime = 'Please enter valid date and time values.';
    }

    if (toDateTime <= fromDateTime) {
      nextErrors.toTime = 'To date and time must be later than from date and time.';
    }

    if (reason.length < 4) {
      nextErrors.reason = 'Reason must be at least 4 characters long.';
    }

    if (reason.length > 200) {
      nextErrors.reason = 'Reason cannot exceed 200 characters.';
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
    try {
      await api.post('/passes/home', {
        fromDate: `${form.fromDate}T${form.fromTime}`,
        toDate: `${form.toDate}T${form.toTime}`,
        reason: form.reason,
      });
      toast.success('Home pass applied!');
      setForm({ fromDate: '', fromTime: '', toDate: '', toTime: '', reason: '' });
      setErrors({});
      fetch();
    }
    catch (err) { toast.error(err.response?.data?.error || 'Failed'); } finally { setLoading(false); }
  };

  const handleCancel = async () => {
    if (!pendingCancelId) return;

    setCancellingId(pendingCancelId);
    try {
      await api.delete(`/passes/home/${pendingCancelId}`);
      toast.success('Home pass request cancelled');
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
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Apply Home Pass</h1>
      <ConfirmDialog
        open={Boolean(pendingCancelId)}
        title="Cancel home pass request?"
        message="This will remove your pending home pass request from the system."
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
            <div><label className="label">From Date</label><input type="date" required min={getToday()} className={`input ${errors.fromDate ? 'border-red-300 focus:ring-red-400' : ''}`} value={form.fromDate} onChange={e => { setForm({ ...form, fromDate: e.target.value, ...(form.toDate && form.toDate < e.target.value ? { toDate: e.target.value, toTime: '' } : {}) }); if (errors.fromDate) setErrors({ ...errors, fromDate: '' }); }} />{errors.fromDate && <p className="mt-1 text-xs text-red-500">{errors.fromDate}</p>}</div>
            <div><label className="label">From Time</label><input type="time" required className={`input ${errors.fromTime ? 'border-red-300 focus:ring-red-400' : ''}`} value={form.fromTime} onChange={e => { setForm({ ...form, fromTime: e.target.value }); if (errors.fromTime) setErrors({ ...errors, fromTime: '' }); }} />{errors.fromTime && <p className="mt-1 text-xs text-red-500">{errors.fromTime}</p>}</div>
            <div><label className="label">To Date</label><input type="date" required min={form.fromDate || getToday()} className={`input ${errors.toDate ? 'border-red-300 focus:ring-red-400' : ''}`} value={form.toDate} onChange={e => { setForm({ ...form, toDate: e.target.value }); if (errors.toDate) setErrors({ ...errors, toDate: '' }); }} />{errors.toDate && <p className="mt-1 text-xs text-red-500">{errors.toDate}</p>}</div>
            <div><label className="label">To Time</label><input type="time" required className={`input ${errors.toTime ? 'border-red-300 focus:ring-red-400' : ''}`} value={form.toTime} onChange={e => { setForm({ ...form, toTime: e.target.value }); if (errors.toTime) setErrors({ ...errors, toTime: '' }); }} />{errors.toTime && <p className="mt-1 text-xs text-red-500">{errors.toTime}</p>}</div>
            <div><label className="label">Reason</label><textarea required minLength={4} maxLength={200} rows={3} className={`input resize-none ${errors.reason ? 'border-red-300 focus:ring-red-400' : ''}`} value={form.reason} onChange={e => { setForm({ ...form, reason: e.target.value }); if (errors.reason) setErrors({ ...errors, reason: '' }); }} />{errors.reason ? <p className="mt-1 text-xs text-red-500">{errors.reason}</p> : <p className="mt-1 text-xs text-slate-400">Mention your purpose briefly.</p>}</div>
            <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Submitting...' : 'Apply'}</button>
          </form>
        </div>
        <div className="lg:col-span-2 card overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100"><h2 className="font-semibold">Home Pass History</h2></div>
          {passes.length === 0 ? <div className="p-8 text-center text-slate-400">No home passes</div> : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50"><tr>{['From Date', 'From Time', 'To Date', 'To Time', 'Status', 'Action'].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">{h}</th>)}</tr></thead>
              <tbody>{passes.map(p => (
                <tr key={p.id} className="border-t border-slate-50">
                  <td className="px-4 py-3">{new Date(p.fromDate).toLocaleDateString()}</td>
                  <td className="px-4 py-3">{new Date(p.fromDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                  <td className="px-4 py-3">{new Date(p.toDate).toLocaleDateString()}</td>
                  <td className="px-4 py-3">{new Date(p.toDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
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

