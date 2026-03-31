// src/pages/admin/RoomManagement.jsx
import { useState, useEffect } from 'react';
import api from '../../api/client';
import toast from 'react-hot-toast';
import ConfirmDialog from '../../components/ConfirmDialog';

const STATUS_COLORS = { AVAILABLE: 'green', OCCUPIED: 'teal', FULL: 'red', MAINTENANCE: 'yellow' };

export default function RoomManagement() {
  const [rooms, setRooms] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState({ roomNumber: '', block: 'A', floor: '', capacity: '3' });
  const [alloc, setAlloc] = useState({ studentId: '', roomId: '' });
  const [roomErrors, setRoomErrors] = useState({});
  const [allocErrors, setAllocErrors] = useState({});
  const [vacateTarget, setVacateTarget] = useState(null);

  const fetchRooms = () => api.get('/rooms').then(({ data }) => setRooms(data.rooms));
  const fetchStudents = () => api.get('/students?limit=100').then(({ data }) => setStudents(data.students));
  const fetchAvailableRooms = async (gender) => {
    const { data } = await api.get('/rooms/available', { params: gender ? { gender } : {} });
    setAvailableRooms(data.rooms);
  };

  useEffect(() => { fetchRooms(); fetchStudents(); fetchAvailableRooms(); }, []);

  useEffect(() => {
    const selected = students.find((student) => student.id === alloc.studentId);
    fetchAvailableRooms(selected?.gender).catch(() => setAvailableRooms([]));
  }, [alloc.studentId, students]);

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    const nextErrors = {};
    if (!form.roomNumber.trim()) nextErrors.roomNumber = 'Room number is required.';
    if (!/^[AB]\d{3}$/i.test(form.roomNumber.trim())) nextErrors.roomNumber = 'Use a room number like A101 or B205.';
    if (!form.floor || Number(form.floor) <= 0) nextErrors.floor = 'Floor must be greater than 0.';
    if (!form.capacity || Number(form.capacity) <= 0) nextErrors.capacity = 'Capacity must be greater than 0.';
    if (Object.keys(nextErrors).length > 0) {
      setRoomErrors(nextErrors);
      toast.error('Please fix the highlighted room fields.');
      return;
    }

    try { await api.post('/rooms', form); toast.success('Room created!'); setForm({ roomNumber: '', block: 'A', floor: '', capacity: '3' }); setRoomErrors({}); fetchRooms(); }
    catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  const handleAllocate = async (e) => {
    e.preventDefault();
    const nextErrors = {};
    if (!alloc.studentId) nextErrors.studentId = 'Please select a student.';
    if (!alloc.roomId) nextErrors.roomId = 'Please select a room.';
    if (Object.keys(nextErrors).length > 0) {
      setAllocErrors(nextErrors);
      toast.error('Please fix the highlighted allocation fields.');
      return;
    }
    try {
      await api.post('/rooms/allocate', alloc);
      toast.success('Room allocated!');
      setAlloc({ studentId: '', roomId: '' });
      setAllocErrors({});
      fetchRooms();
      fetchStudents();
      fetchAvailableRooms();
    }
    catch (err) { toast.error(err.response?.data?.error || 'Allocation failed'); }
  };

  const handleDeallocate = async () => {
    if (!vacateTarget?.studentId) return;
    try {
      await api.delete(`/rooms/deallocate/${vacateTarget.studentId}`);
      toast.success('Room deallocated');
      setVacateTarget(null);
      fetchRooms();
      fetchStudents();
      const selected = students.find((student) => student.id === alloc.studentId);
      fetchAvailableRooms(selected?.gender);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Deallocation failed');
    }
  };

  const unallocatedStudents = students.filter(s => !s.roomAllocation?.isActive);
  const selectedStudent = unallocatedStudents.find((student) => student.id === alloc.studentId);
  const allowedBlock = selectedStudent?.gender === 'FEMALE' ? 'B' : selectedStudent?.gender === 'MALE' ? 'A' : null;
  const visibleRooms = allowedBlock ? availableRooms.filter((room) => room.block === allowedBlock) : availableRooms;

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
                <div key={k}><label className="label">{l}</label><input required className={`input ${roomErrors[k] ? 'border-red-300 focus:ring-red-400' : ''}`} placeholder={p} value={form[k]} onChange={e => { setForm({ ...form, [k]: e.target.value }); if (roomErrors[k]) setRoomErrors({ ...roomErrors, [k]: '' }); }} />{roomErrors[k] && <p className="mt-1 text-xs text-red-500">{roomErrors[k]}</p>}</div>
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
              <select required className={`input ${allocErrors.studentId ? 'border-red-300 focus:ring-red-400' : ''}`} value={alloc.studentId} onChange={e => { setAlloc({ ...alloc, studentId: e.target.value, roomId: '' }); if (allocErrors.studentId) setAllocErrors({ ...allocErrors, studentId: '' }); }}>
                <option value="">Select student</option>
                {unallocatedStudents.map(s => <option key={s.id} value={s.id}>{s.fullName} ({s.rollNumber}) - {s.gender === 'FEMALE' ? 'Female' : 'Male'}</option>)}
              </select>
              {allocErrors.studentId && <p className="mt-1 text-xs text-red-500">{allocErrors.studentId}</p>}
            </div>
            <div>
              <label className="label">Room {allowedBlock ? `(Block ${allowedBlock})` : ''}</label>
              <select required className={`input ${allocErrors.roomId ? 'border-red-300 focus:ring-red-400' : ''}`} value={alloc.roomId} onChange={e => { setAlloc({ ...alloc, roomId: e.target.value }); if (allocErrors.roomId) setAllocErrors({ ...allocErrors, roomId: '' }); }}>
                <option value="">Select room</option>
                {visibleRooms.map(r => (
                  <option key={r.id} value={r.id}>{r.roomNumber} (Block {r.block}, {r.occupiedCount}/{r.capacity})</option>
                ))}
              </select>
              {allocErrors.roomId && <p className="mt-1 text-xs text-red-500">{allocErrors.roomId}</p>}
            </div>
            <button type="submit" className="btn-primary w-full">Assign</button>
          </form>
        </div>
        <div className="card p-5">
          <h2 className="font-semibold text-slate-700 mb-3">Summary</h2>
          <div className="space-y-2">
            {Object.entries(STATUS_COLORS).map(([status, color]) => {
              const count = rooms.filter(r => r.status === status).length;
              const colorClass = color === 'green'
                ? 'text-green-600'
                : color === 'teal'
                  ? 'text-blue-600'
                  : color === 'red'
                    ? 'text-red-600'
                    : 'text-yellow-600';
              return <div key={status} className="flex justify-between text-sm"><span className="text-slate-500">{status}</span><span className={`font-semibold ${colorClass}`}>{count}</span></div>;
            })}
            <div className="border-t border-slate-100 pt-2 flex justify-between text-sm font-semibold"><span>Total</span><span>{rooms.length}</span></div>
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100"><h2 className="font-semibold">All Rooms</h2></div>
        <table className="w-full text-sm">
          <thead className="bg-slate-50"><tr>{['Room', 'Block', 'Floor', 'Capacity', 'Occupants', 'Status', 'Action'].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">{h}</th>)}</tr></thead>
          <tbody>{rooms.map(r => (
            <tr key={r.id} className="border-t border-slate-50">
              <td className="px-4 py-3 font-medium">{r.roomNumber}</td>
              <td className="px-4 py-3">{r.block}</td>
              <td className="px-4 py-3">{r.floor}</td>
              <td className="px-4 py-3">{r.capacity}</td>
              <td className="px-4 py-3">{r.occupiedCount}/{r.capacity} - {r.allocations?.map(a => a.student.fullName).join(', ') || '-'}</td>
              <td className="px-4 py-3"><span className={`badge-${r.status === 'AVAILABLE' ? 'approved' : r.status === 'FULL' ? 'rejected' : 'pending'}`}>{r.status}</span></td>
              <td className="px-4 py-3">
                {r.allocations?.length ? (
                  <div className="flex flex-wrap gap-2">
                    {r.allocations.map((allocation) => (
                      <button
                        key={allocation.id}
                        type="button"
                        className="inline-flex items-center rounded-full border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 transition-colors hover:border-rose-300 hover:bg-rose-100"
                        onClick={() => setVacateTarget({
                          studentId: allocation.student.id,
                          studentName: allocation.student.fullName,
                          roomNumber: r.roomNumber,
                        })}
                      >
                        Vacate {allocation.student.fullName}
                      </button>
                    ))}
                  </div>
                ) : (
                  <span className="text-slate-400">-</span>
                )}
              </td>
            </tr>
          ))}</tbody>
        </table>
      </div>
      <ConfirmDialog
        open={Boolean(vacateTarget)}
        title="Vacate this room allocation?"
        description={vacateTarget ? `${vacateTarget.studentName} will be removed from room ${vacateTarget.roomNumber}.` : ''}
        confirmText="Yes, vacate"
        cancelText="Keep allocation"
        confirmTone="danger"
        onClose={() => setVacateTarget(null)}
        onConfirm={handleDeallocate}
      />
    </div>
  );
}

