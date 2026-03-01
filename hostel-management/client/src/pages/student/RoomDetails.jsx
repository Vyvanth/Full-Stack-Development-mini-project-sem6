// src/pages/student/RoomDetails.jsx
import { useState, useEffect } from 'react';
import api from '../../api/client';

export default function RoomDetails() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/students/profile').then(({ data }) => setProfile(data.student)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-slate-400">Loading...</div>;
  const alloc = profile?.roomAllocation;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">My Room</h1>
      {!alloc ? (
        <div className="card p-8 text-center text-slate-400">No room assigned yet. Contact your warden.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card p-6">
            <h2 className="font-semibold text-slate-700 mb-4">Room Details</h2>
            <dl className="space-y-3">
              {[
                ['Room Number', alloc.room.roomNumber],
                ['Block', alloc.room.block],
                ['Floor', alloc.room.floor],
                ['Capacity', alloc.room.capacity],
                ['Occupied', alloc.room.occupiedCount],
                ['Status', alloc.room.status],
                ['Allocated On', new Date(alloc.allocatedAt).toLocaleDateString()],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between text-sm">
                  <dt className="text-slate-500">{k}</dt>
                  <dd className="font-medium text-slate-800">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="card p-6">
            <h2 className="font-semibold text-slate-700 mb-4">Amenities</h2>
            <div className="flex flex-wrap gap-2">
              {alloc.room.amenities?.map(a => (
                <span key={a} className="bg-primary-50 text-primary-700 text-xs px-3 py-1 rounded-full">{a}</span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
