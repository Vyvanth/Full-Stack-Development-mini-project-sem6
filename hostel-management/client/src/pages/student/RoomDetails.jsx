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
  const detailRows = alloc ? [
    ['Block', alloc.room.block],
    ['Floor', alloc.room.floor],
    ['Capacity', `${alloc.room.capacity} beds`],
    ['Occupied', `${alloc.room.occupiedCount} residents`],
    ['Allocated On', new Date(alloc.allocatedAt).toLocaleDateString()],
  ] : [];

  return (
    <div className="space-y-6">
      <div className="rounded-[30px] border border-slate-200 bg-white px-7 py-7 shadow-[0_18px_42px_rgba(15,23,42,0.06)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500">Accommodation Overview</p>
        <div className="mt-3 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900">My Room</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-500">
              View your current room assignment, occupancy details, and the facilities available in your block.
            </p>
          </div>
          {alloc && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Room Number</p>
                <p className="mt-2 text-2xl font-bold text-slate-900">{alloc.room.roomNumber}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Status</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">{alloc.room.status}</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Occupancy</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">{alloc.room.occupiedCount}/{alloc.room.capacity}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {!alloc ? (
        <div className="rounded-[28px] border border-slate-200 bg-white px-8 py-12 text-center text-slate-400 shadow-[0_16px_36px_rgba(15,23,42,0.05)]">
          No room assigned yet. Contact your warden.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_16px_36px_rgba(15,23,42,0.05)]">
            <div className="mb-5">
              <h2 className="text-xl font-semibold text-slate-900">Room Details</h2>
              <p className="mt-2 text-sm text-slate-500">Everything you need to know about your assigned room in one place.</p>
            </div>
            <dl className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {detailRows.map(([k, v]) => (
                <div key={k} className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-4">
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">{k}</dt>
                  <dd className="mt-2 text-lg font-semibold text-slate-800">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_16px_36px_rgba(15,23,42,0.05)]">
            <div className="mb-5">
              <h2 className="text-xl font-semibold text-slate-900">Amenities</h2>
              <p className="mt-2 text-sm text-slate-500">Facilities currently listed for your room and attached services.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              {alloc.room.amenities?.map((a) => (
                <span key={a} className="inline-flex items-center rounded-full border border-sky-100 bg-sky-50 px-4 py-2 text-sm font-medium text-sky-700">
                  {a}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

