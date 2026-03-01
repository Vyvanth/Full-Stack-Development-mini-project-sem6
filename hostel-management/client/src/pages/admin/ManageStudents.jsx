// src/pages/admin/ManageStudents.jsx
import { useState, useEffect } from 'react';
import api from '../../api/client';
import toast from 'react-hot-toast';

export default function ManageStudents() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const fetch = (q = '') => {
    setLoading(true);
    api.get(`/students?search=${q}&limit=50`).then(({ data }) => setStudents(data.students)).finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, []);

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete student ${name}? This is irreversible.`)) return;
    try {
      await api.delete(`/students/${id}`);
      toast.success('Student deleted');
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
              <tr>{['Name', 'Roll Number', 'Course/Branch', 'Room', 'Phone', 'Actions'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-400">No students found</td></tr>
              ) : students.map(s => (
                <tr key={s.id} className="border-t border-slate-50 hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium">{s.fullName}</td>
                  <td className="px-4 py-3 text-slate-500 font-mono text-xs">{s.rollNumber}</td>
                  <td className="px-4 py-3 text-slate-500">{s.course} · {s.branch}</td>
                  <td className="px-4 py-3">{s.roomAllocation?.room?.roomNumber || <span className="text-slate-300">—</span>}</td>
                  <td className="px-4 py-3 text-slate-500">{s.phone}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleDelete(s.id, s.fullName)} className="text-red-500 hover:text-red-700 text-xs font-medium">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
