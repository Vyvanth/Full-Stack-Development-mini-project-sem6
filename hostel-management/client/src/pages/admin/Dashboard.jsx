import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../../api/client';
import UiIcon from '../../components/UiIcon';

const Stat = ({ label, value, icon, tone = 'blue', color = 'blue', to }) => {
  const content = (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">{label}</p>
        <p className={`text-3xl font-bold mt-1 text-${color}-600`}>{value}</p>
      </div>
      <UiIcon label={icon} size="md" tone={tone} />
    </div>
  );

  if (!to) {
    return <div className="card p-5">{content}</div>;
  }

  return (
    <Link to={to} className="card block p-5 transition-all hover:-translate-y-0.5 hover:shadow-md">
      {content}
    </Link>
  );
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/admin/dashboard').then(({ data }) => setStats(data));
  }, []);

  if (!stats) return <div className="text-slate-400">Loading dashboard...</div>;

  const roomChartData = stats.roomStats?.map((room) => ({ name: room.status, count: room._count }));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Admin Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Overview of hostel operations</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <div className="col-span-2 md:col-span-1 lg:col-span-1">
          <Stat label="Students" value={stats.totalStudents} icon={'\u{1F393}'} tone="blue" color="blue" to="/admin/students" />
        </div>
        <div className="col-span-2 md:col-span-1 lg:col-span-1">
          <Stat label="Rooms" value={stats.totalRooms} icon={'\u{1F6CF}\uFE0F'} tone="slate" color="slate" to="/admin/rooms" />
        </div>
        <div className="col-span-2 md:col-span-1 lg:col-span-1">
          <Stat label="Complaints" value={stats.pendingComplaints} icon={'\u{1F9FE}'} tone="amber" color="yellow" to="/admin/complaints" />
        </div>
        <div className="col-span-2 md:col-span-1 lg:col-span-1">
          <Stat label="Pass Requests" value={stats.pendingPassRequests} icon={'\u{1F6C2}'} tone="violet" color="purple" to="/admin/passes" />
        </div>
        <div className="col-span-2 md:col-span-1 lg:col-span-1">
          <Stat label="Revenue" value={`${String.fromCodePoint(0x20B9)}${(stats.totalRevenue || 0).toLocaleString()}`} icon={'\u{1F4B0}'} tone="green" color="green" to="/admin/payments" />
        </div>
      </div>

      {roomChartData?.length > 0 && (
        <div className="card p-6 mb-6">
          <h2 className="font-semibold text-slate-700 mb-4">Room Status Breakdown</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={roomChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {[
          ['Manage Students', '/admin/students', '\u{1F393}', 'View, add, or remove students'],
          ['Room Management', '/admin/rooms', '\u{1F6CF}\uFE0F', 'Allocate and manage rooms'],
          ['Complaint Management', '/admin/complaints', '\u{1F9FE}', 'Review and resolve complaints'],
          ['Pass Approval', '/admin/passes', '\u{1F6C2}', 'Approve or reject pass requests'],
        ].map(([label, href, icon, desc]) => (
          <a key={href} href={href} className="card p-5 hover:shadow-md transition-shadow flex items-start gap-4">
            <UiIcon label={icon} size="sm" tone="slate" />
            <div>
              <p className="font-medium text-slate-700">{label}</p>
              <p className="text-xs text-slate-400 mt-0.5">{desc}</p>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
