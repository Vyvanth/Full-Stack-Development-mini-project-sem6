import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import UiIcon from '../../components/UiIcon';

const StatCard = ({ label, value, sub, color = 'blue', link, icon, tone = 'slate' }) => (
  <Link to={link || '#'} className="card p-5 hover:shadow-md transition-shadow block">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
        <p className={`text-2xl font-bold mt-1 text-${color}-600`}>{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
      <UiIcon label={icon} size="md" tone={tone} />
    </div>
  </Link>
);

export default function StudentDashboard() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/students/profile')
      .then(({ data }) => setProfile(data.student))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-slate-400 p-8">Loading dashboard...</div>;

  const pendingPayments = profile?.payments?.filter((p) => p.status === 'PENDING').length || 0;
  const openComplaints = profile?.complaints?.filter((c) => c.status !== 'RESOLVED' && c.status !== 'CLOSED').length || 0;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Good day, {profile?.fullName?.split(' ')[0]}</h1>
        <p className="text-slate-500 text-sm mt-1">{profile?.rollNumber} · {profile?.course} · {profile?.branch}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="My Room" value={profile?.roomAllocation?.room?.roomNumber || 'Not Assigned'} sub={profile?.roomAllocation ? `Block ${profile.roomAllocation.room.block}, Floor ${profile.roomAllocation.room.floor}` : 'Contact admin'} color="primary" tone="indigo" link="/student/room" icon={'\u{1F6CF}\uFE0F'} />
        <StatCard label="Pending Payments" value={pendingPayments} sub="Tap to pay now" color={pendingPayments > 0 ? 'red' : 'green'} tone={pendingPayments > 0 ? 'red' : 'green'} link="/student/payments" icon={'\u{1F4B3}'} />
        <StatCard label="Open Complaints" value={openComplaints} sub={openComplaints > 0 ? 'Being processed' : 'All resolved'} color={openComplaints > 0 ? 'yellow' : 'green'} tone={openComplaints > 0 ? 'amber' : 'green'} link="/student/complaints" icon={'\u{1F9FE}'} />
        <StatCard label="Profile" value="View" sub="Manage your info" color="slate" tone="slate" link="/student/profile" icon={'\u{1F464}'} />
      </div>

      <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Quick Actions</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[
          { to: '/student/out-pass', icon: '\u{1FAAA}', label: 'Apply Out Pass' },
          { to: '/student/home-pass', icon: '\u{1F3E0}', label: 'Apply Home Pass' },
          { to: '/student/food', icon: '\u{1F37D}\uFE0F', label: 'View Food Menu' },
          { to: '/student/laundry', icon: '\u{1F9FA}', label: 'Laundry Request' },
          { to: '/student/complaints', icon: '\u{1F9FE}', label: 'File Complaint' },
          { to: '/student/payments', icon: '\u{1F4B3}', label: 'Make Payment' },
        ].map(({ to, icon, label }) => (
          <Link key={to} to={to} className="card p-4 flex items-center gap-3 hover:shadow-md transition-shadow">
            <UiIcon label={icon} size="sm" tone="slate" />
            <span className="text-sm font-medium text-slate-700">{label}</span>
          </Link>
        ))}
      </div>

      {profile?.complaints?.length > 0 && (
        <div className="mt-8">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Recent Complaints</h2>
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  {['Category', 'Date', 'Status'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {profile.complaints.slice(0, 5).map((c) => (
                  <tr key={c.id} className="border-b border-slate-50 last:border-0">
                    <td className="px-4 py-3 font-medium">{c.category}</td>
                    <td className="px-4 py-3 text-slate-500">{new Date(c.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3"><span className={`badge-${c.status.toLowerCase()}`}>{c.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

