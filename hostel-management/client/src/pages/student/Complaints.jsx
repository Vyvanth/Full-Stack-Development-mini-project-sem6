// src/pages/student/Complaints.jsx
import { useState, useEffect } from 'react';
import api from '../../api/client';
import toast from 'react-hot-toast';

const CATEGORIES = ['Maintenance', 'Electrical', 'Plumbing', 'Cleanliness', 'Security', 'Food', 'Internet', 'Other'];

export default function Complaints() {
  const [complaints, setComplaints] = useState([]);
  const [form, setForm] = useState({ category: '', description: '' });
  const [loading, setLoading] = useState(false);

  const fetch = () => api.get('/complaints').then(({ data }) => setComplaints(data.complaints));

  useEffect(() => { fetch(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/complaints', form);
      toast.success('Complaint submitted!');
      setForm({ category: '', description: '' });
      fetch();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Complaints</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="card p-6">
          <h2 className="font-semibold text-slate-700 mb-4">Submit New Complaint</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Category</label>
              <select required className="input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                <option value="">Select category</option>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Description</label>
              <textarea required rows={4} className="input resize-none" placeholder="Describe your issue..."
                value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Submitting...' : 'Submit Complaint'}
            </button>
          </form>
        </div>

        {/* List */}
        <div className="lg:col-span-2 card overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100">
            <h2 className="font-semibold text-slate-700">Complaint History</h2>
          </div>
          {complaints.length === 0 ? (
            <div className="p-8 text-center text-slate-400">No complaints yet</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>{['ID', 'Category', 'Date', 'Status'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {complaints.map(c => (
                  <tr key={c.id} className="border-t border-slate-50">
                    <td className="px-4 py-3 text-slate-400 font-mono text-xs">{c.id.slice(0, 8)}</td>
                    <td className="px-4 py-3 font-medium">{c.category}</td>
                    <td className="px-4 py-3 text-slate-500">{new Date(c.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3"><span className={`badge-${c.status.toLowerCase().replace('_', '-')}`}>{c.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

