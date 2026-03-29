// src/pages/admin/RoomManagement.jsx
import { useState, useEffect } from 'react';
import api from '../../api/client';
import toast from 'react-hot-toast';

const STATUS_COLORS = { AVAILABLE: 'green', OCCUPIED: 'blue', FULL: 'red', MAINTENANCE: 'yellow' };

export default function RoomManagement() {
  const [rooms, setRooms] = useState([]);
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState({ roomNumber: '', block: 'A', floor: '', capacity: '3' });
  const [alloc, setAlloc] = useState({ studentId: '', roomId: '' });

  const fetchRooms = () => api.get('/rooms').then(({ data }) => setRooms(data.rooms));
  const fetchStudents = () => api.get('/students?limit=100').then(({ data }) => setStudents(data.students));

  useEffect(() => { fetchRooms(); fetchStudents(); }, []);

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    try { await api.post('/rooms', form); toast.success('Room created!'); setForm({ roomNumber: '', block: 'A', floor: '', capacity: '3' }); fetchRooms(); }
    catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  const handleAllocate = async (e) => {
    e.preventDefault();
    try { await api.post('/rooms/allocate', alloc); toast.success('Room allocated!'); setAlloc({ studentId: '', roomId: '' }); fetchRooms(); }
    catch (err) { toast.error(err.response?.data?.error || 'Allocation failed'); }
  };

  const unallocatedStudents = students.filter(s => !s.roomAllocation?.isActive);
  const selectedStudent = unallocatedStudents.find((student) => student.id === alloc.studentId);
  const allowedBlock = selectedStudent?.gender === 'FEMALE' ? 'B' : selectedStudent?.gender === 'MALE' ? 'A' : null;
  const visibleRooms = rooms.filter((room) => {
    if (room.status === 'FULL' || room.status === 'MAINTENANCE') return false;
    if (!allowedBlock) return true;
    return room.block === allowedBlock;
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Room Management</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="card p-5">
          <h2 className="font-semibold text-slate-700 mb-3">Add Room</h2>
          <form onSubmit={handleCreateRoom} className="space-y-3">
            {[['Room Number', 'roomNumber', 'A101'], ['Block', 'block', 'A'], ['Floor', 'floor', '1'], ['Capacity', 'capacity', '3']].map(([l, k, p]) => (
              k === 'block' ? (
                <div key={k}>
                  <label className="label">{l}</label>
                  <select required className="input" value={form.block} onChange={e => setForm({ ...form, block: e.target.value })}>
                    <option value="A">Block A</option>
                    <option value="B">Block B</option>
                  </select>
                </div>
              ) : (
                <div key={k}><label className="label">{l}</label><input required className="input" placeholder={p} value={form[k]} onChange={e => setForm({ ...form, [k]: e.target.value })} /></div>
              )
            ))}
            <button type="submit" className="btn-primary w-full">Create Room</button>
          </form>
        </div>
        <div className="card p-5">
          <h2 className="font-semibold text-slate-700 mb-3">Assign Room</h2>
          <form onSubmit={handleAllocate} className="space-y-3">
            <div>
              <label className="label">Student (Unallocated)</label>
              <select required className="input" value={alloc.studentId} onChange={e => setAlloc({ ...alloc, studentId: e.target.value, roomId: '' })}>
                <option value="">Select student</option>
                {unallocatedStudents.map(s => <option key={s.id} value={s.id}>{s.fullName} ({s.rollNumber}) - {s.gender === 'FEMALE' ? 'Female' : 'Male'}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Room {allowedBlock ? `(Block ${allowedBlock})` : ''}</label>
              <select required className="input" value={alloc.roomId} onChange={e => setAlloc({ ...alloc, roomId: e.target.value })}>
                <option value="">Select room</option>
                {visibleRooms.map(r => (
                  <option key={r.id} value={r.id}>{r.roomNumber} (Block {r.block}, {r.occupiedCount}/{r.capacity})</option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn-primary w-full">Assign</button>
          </form>
        </div>
        <div className="card p-5">
          <h2 className="font-semibold text-slate-700 mb-3">Summary</h2>
          <div className="space-y-2">
            {Object.entries(STATUS_COLORS).map(([status, color]) => {
              const count = rooms.filter(r => r.status === status).length;
              return <div key={status} className="flex justify-between text-sm"><span className="text-slate-500">{status}</span><span className={`font-semibold text-${color}-600`}>{count}</span></div>;
            })}
            <div className="border-t border-slate-100 pt-2 flex justify-between text-sm font-semibold"><span>Total</span><span>{rooms.length}</span></div>
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100"><h2 className="font-semibold">All Rooms</h2></div>
        <table className="w-full text-sm">
          <thead className="bg-slate-50"><tr>{['Room', 'Block', 'Floor', 'Capacity', 'Occupants', 'Status'].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">{h}</th>)}</tr></thead>
          <tbody>{rooms.map(r => (
            <tr key={r.id} className="border-t border-slate-50">
              <td className="px-4 py-3 font-medium">{r.roomNumber}</td>
              <td className="px-4 py-3">{r.block}</td>
              <td className="px-4 py-3">{r.floor}</td>
              <td className="px-4 py-3">{r.capacity}</td>
              <td className="px-4 py-3">{r.occupiedCount}/{r.capacity} Â· {r.allocations?.map(a => a.student.fullName).join(', ') || 'â€”'}</td>
              <td className="px-4 py-3"><span className={`badge-${r.status === 'AVAILABLE' ? 'approved' : r.status === 'FULL' ? 'rejected' : 'pending'}`}>{r.status}</span></td>
            </tr>
          ))}</tbody>
        </table>
      </div>
    </div>
  );
}

