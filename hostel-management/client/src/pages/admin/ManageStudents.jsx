// src/pages/admin/ManageStudents.jsx
import { useState, useEffect } from 'react';
import api from '../../api/client';
import toast from 'react-hot-toast';
import ConfirmDialog from '../../components/ConfirmDialog';

export default function ManageStudents() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetch = (q = '') => {
    setLoading(true);
    api.get(`/students?search=${q}&limit=50`).then(({ data }) => setStudents(data.students)).finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, []);

  const handleDelete = async () => {
    if (!deleteTarget?.id) return;
    try {
      await api.delete(`/students/${deleteTarget.id}`);
      toast.success('Student deleted');
      setDeleteTarget(null);
      fetch(search);
    } catch { toast.error('Delete failed'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Manage Students</h1>
        <div className="flex gap-2">
          <input className="input w-64" placeholder="Search by name, roll, email..." value={search}
            onChange={e => { setSearch(e.target.value); fetch(e.target.value); }} />
        </div>
      </div>
      <div className="card overflow-hidden">
        {loading ? <div className="p-8 text-center text-slate-400">Loading...</div> : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>{['Name', 'Gender', 'Roll Number', 'Course/Branch', 'Room', 'Phone', 'Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-400">No students found</td></tr>
              ) : students.map(s => (
                <tr key={s.id} className="border-t border-slate-50 hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium">{s.fullName}</td>
                  <td className="px-4 py-3 text-slate-500">{s.gender === 'FEMALE' ? 'Female' : 'Male'}</td>
                  <td className="px-4 py-3 text-slate-500 font-mono text-xs">{s.rollNumber}</td>
                  <td className="px-4 py-3 text-slate-500">{s.course} - {s.branch}</td>
                  <td className="px-4 py-3">{s.roomAllocation?.room?.roomNumber || <span className="text-slate-300">-</span>}</td>
                  <td className="px-4 py-3 text-slate-500">{s.phone}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => setDeleteTarget({ id: s.id, name: s.fullName })}
                      className="inline-flex items-center rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 transition-colors hover:border-rose-300 hover:bg-rose-100"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete student record?"
        description={deleteTarget ? `${deleteTarget.name} will be removed permanently. This action cannot be undone.` : ''}
        confirmText="Yes, delete"
        cancelText="Keep student"
        confirmTone="danger"
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}

