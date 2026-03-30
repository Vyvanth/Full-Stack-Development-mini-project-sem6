// src/pages/student/Complaints.jsx
import { useState, useEffect } from 'react';
import api from '../../api/client';
import toast from 'react-hot-toast';

const CATEGORIES = ['Maintenance', 'Electrical', 'Plumbing', 'Cleanliness', 'Security', 'Food', 'Internet', 'Other'];

export default function Complaints() {
  const [complaints, setComplaints] = useState([]);
  const [form, setForm] = useState({ category: '', description: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const fetch = () => api.get('/complaints').then(({ data }) => setComplaints(data.complaints));

  useEffect(() => { fetch(); }, []);

  const validateForm = () => {
    const nextErrors = {};
    if (!form.category) {
      nextErrors.category = 'Please choose a complaint category.';
    }

    const description = form.description.trim();
    if (!description) {
      nextErrors.description = 'Please describe the issue.';
    } else if (description.length < 10) {
      nextErrors.description = 'Description must be at least 10 characters.';
    } else if (description.length > 500) {
      nextErrors.description = 'Description cannot exceed 500 characters.';
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
      await api.post('/complaints', form);
      toast.success('Complaint submitted!');
      setForm({ category: '', description: '' });
      setErrors({});
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
              <select required className={`input ${errors.category ? 'border-red-300 focus:ring-red-400' : ''}`} value={form.category} onChange={e => { setForm({ ...form, category: e.target.value }); if (errors.category) setErrors({ ...errors, category: '' }); }}>
                <option value="">Select category</option>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
              {errors.category && <p className="mt-1 text-xs text-red-500">{errors.category}</p>}
            </div>
            <div>
              <label className="label">Description</label>
              <textarea required rows={4} className={`input resize-none ${errors.description ? 'border-red-300 focus:ring-red-400' : ''}`} placeholder="Describe your issue..."
                value={form.description} onChange={e => { setForm({ ...form, description: e.target.value }); if (errors.description) setErrors({ ...errors, description: '' }); }} />
              {errors.description ? <p className="mt-1 text-xs text-red-500">{errors.description}</p> : <p className="mt-1 text-xs text-slate-400">Be specific so the hostel team can act faster.</p>}
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

