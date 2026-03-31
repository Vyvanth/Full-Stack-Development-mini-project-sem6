import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../api/client';
import UiIcon from '../../components/UiIcon';
import roomIcon from '../../assets/icons/room.png';
import feeIcon from '../../assets/icons/fee.png';
import complaintIcon from '../../assets/icons/complaint.png';

const statColorClasses = {
  blue: 'text-teal-600',
  slate: 'text-slate-800',
  amber: 'text-amber-600',
  violet: 'text-cyan-600',
  green: 'text-emerald-600',
};

const DashboardIcon = ({ src, alt, size = 'md' }) => {
  const classes = size === 'sm' ? 'h-9 w-9 rounded-xl p-2' : 'h-12 w-12 rounded-2xl p-2.5';

  return (
    <div className={`flex shrink-0 items-center justify-center border border-slate-200 bg-white shadow-sm ${classes}`}>
      <img src={src} alt={alt} className="h-full w-full object-contain" />
    </div>
  );
};

const Stat = ({ label, value, icon, tone = 'blue', color = 'blue', to, helper }) => {
  const content = (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
        <p className={`mt-3 text-3xl font-bold ${statColorClasses[color] || statColorClasses.slate}`}>{value}</p>
        {helper && <p className="mt-1 text-xs text-slate-400">{helper}</p>}
      </div>
      {typeof icon === 'string' ? <UiIcon label={icon} size="md" tone={tone} /> : <DashboardIcon src={icon.src} alt={icon.alt} />}
    </div>
  );

  if (!to) {
    return <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_14px_30px_rgba(15,23,42,0.06)]">{content}</div>;
  }

  return (
    <Link
      to={to}
      className="block rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_14px_30px_rgba(15,23,42,0.06)] transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_18px_34px_rgba(15,23,42,0.1)]"
    >
      {content}
    </Link>
  );
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/admin/dashboard').then(({ data }) => setStats(data));
  }, []);

  if (!stats) return <div className="p-2 text-slate-400">Loading dashboard...</div>;

  const roomChartData = stats.roomStats?.map((room) => ({ name: room.status, count: room._count })) || [];
  const occupancy = Number.isFinite(stats.occupancyPercentage) ? `${stats.occupancyPercentage}%` : '0%';
  const revenue = `${String.fromCodePoint(0x20B9)}${(stats.totalRevenue || 0).toLocaleString()}`;
  const roomSummary = {
    available: roomChartData.find((room) => room.name === 'AVAILABLE')?.count || 0,
    occupied: roomChartData.find((room) => room.name === 'OCCUPIED')?.count || 0,
    full: roomChartData.find((room) => room.name === 'FULL')?.count || 0,
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[32px] border border-slate-200 bg-[radial-gradient(circle_at_top_left,rgba(20,184,166,0.1),transparent_30%),linear-gradient(135deg,#ffffff,#f8fafc)] px-7 py-7 shadow-[0_18px_40px_rgba(15,23,42,0.06)]">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-teal-700">Administration</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">Operations Dashboard</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-500">
              Monitor room availability, student support activity, finance, and pending approvals from one central workspace.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              ['Occupancy', occupancy],
              ['Pending Complaints', String(stats.pendingComplaints || 0)],
              ['Pending Passes', String(stats.pendingPassRequests || 0)],
            ].map(([label, value]) => (
              <div key={label} className="min-w-[180px] rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">{label}</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
        <Stat label="Students" value={stats.totalStudents} icon={'\u{1F393}'} tone="blue" color="blue" to="/admin/students" helper="Registered residents" />
        <Stat label="Rooms" value={stats.totalRooms} icon={{ src: roomIcon, alt: 'Room management' }} color="slate" to="/admin/rooms" helper="Across active hostel blocks" />
        <Stat label="Complaints" value={stats.pendingComplaints} icon={{ src: complaintIcon, alt: 'Complaint tracking' }} color="amber" to="/admin/complaints" helper="Needs review" />
        <Stat label="Pass Requests" value={stats.pendingPassRequests} icon={'\u{1FAAA}'} tone="violet" color="violet" to="/admin/passes" helper="Awaiting decisions" />
        <Stat label="Revenue" value={revenue} icon={{ src: feeIcon, alt: 'Fee payments' }} color="green" to="/admin/payments" helper="Collected fee payments" />
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="rounded-[30px] border border-slate-200 bg-white p-6 shadow-[0_16px_36px_rgba(15,23,42,0.06)]">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Room Status Breakdown</h2>
              <p className="mt-1 text-sm text-slate-500">Live overview of room allocation status across the hostel.</p>
            </div>
            <Link to="/admin/rooms" className="text-sm font-medium text-teal-700 hover:text-teal-800">
              Open rooms
            </Link>
          </div>
          {roomChartData.length > 0 ? (
            <div className="space-y-5">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={roomChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: 'rgba(148,163,184,0.08)' }} />
                  <Bar dataKey="count" fill="#0f766e" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-3 gap-3 border-t border-slate-100 pt-4">
                {[
                  ['Available', roomSummary.available],
                  ['Occupied', roomSummary.occupied],
                  ['Full', roomSummary.full],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl bg-slate-50 px-4 py-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">{label}</p>
                    <p className="mt-2 text-xl font-semibold text-slate-800">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-400">
              No room analytics available yet.
            </div>
          )}
        </div>

        <div className="rounded-[30px] border border-slate-200 bg-[linear-gradient(180deg,#ffffff,#f8fafc)] p-6 shadow-[0_16px_36px_rgba(15,23,42,0.06)]">
          <h2 className="text-lg font-semibold text-slate-900">Admin Shortcuts</h2>
          <p className="mt-1 text-sm text-slate-500">Jump straight into the daily operational tasks that need attention.</p>
          <div className="mt-5 space-y-3">
            {[
              ['Manage Students', '/admin/students', '\u{1F393}', 'Review student records and admission details'],
              ['Room Management', '/admin/rooms', { src: roomIcon, alt: 'Room management' }, 'Allocate rooms and track availability'],
              ['Complaint Desk', '/admin/complaints', { src: complaintIcon, alt: 'Complaint desk' }, 'Resolve open issues and maintenance requests'],
              ['Pass Approval', '/admin/passes', '\u{1FAAA}', 'Approve or reject leave requests'],
            ].map(([label, href, icon, desc]) => (
              <Link
                key={href}
                to={href}
                className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-4 transition-all hover:border-slate-300 hover:shadow-md"
              >
                {typeof icon === 'string' ? <UiIcon label={icon} size="sm" tone="slate" /> : <DashboardIcon src={icon.src} alt={icon.alt} size="sm" />}
                <div>
                  <p className="font-medium text-slate-800">{label}</p>
                  <p className="mt-1 text-xs text-slate-500">{desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
