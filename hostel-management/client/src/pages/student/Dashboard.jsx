import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import UiIcon from '../../components/UiIcon';
import roomIcon from '../../assets/icons/room.png';
import feeIcon from '../../assets/icons/fee.png';
import complaintIcon from '../../assets/icons/complaint.png';
import foodIcon from '../../assets/icons/food.png';
import laundryIcon from '../../assets/icons/laundry.png';

const DashboardIcon = ({ src, alt, size = 'sm' }) => {
  const classes = size === 'md' ? 'h-12 w-12 rounded-2xl p-2.5' : 'h-10 w-10 rounded-xl p-2';

  return (
    <div className={`flex shrink-0 items-center justify-center border border-slate-200 bg-white shadow-sm ${classes}`}>
      <img src={src} alt={alt} className="h-full w-full object-contain" />
    </div>
  );
};

const StatCard = ({ label, value, sub, color = 'blue', link }) => (
  <Link to={link || '#'} className="card p-5 hover:shadow-xl hover:-translate-y-0.5 transition-all block bg-[linear-gradient(160deg,#ffffff,rgba(248,250,252,0.92))] border-sky-100">
    <div>
      <div>
        <p className="text-xs font-semibold text-sky-500 uppercase tracking-[0.18em]">{label}</p>
        <p className={`text-2xl font-bold mt-1 text-${color}-600`}>{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
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

  const pendingPayments = profile?.payments?.filter((payment) => payment.status === 'PENDING').length || 0;
  const openComplaints = profile?.complaints?.filter((complaint) => complaint.status !== 'RESOLVED' && complaint.status !== 'CLOSED').length || 0;
  const firstName = profile?.fullName?.split(' ')[0] || 'Student';

  return (
    <div>
      <div className="mb-8 rounded-[28px] border border-slate-200 bg-white px-7 py-7 shadow-sm">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-sky-500">Campus Living Snapshot</p>
            <h1 className="mt-3 text-3xl font-bold text-slate-800">Good day, {firstName}</h1>
            <p className="text-slate-500 text-sm mt-2">{profile?.rollNumber} · {profile?.course} · {profile?.branch}</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[
              ['Room Status', profile?.roomAllocation?.room?.roomNumber ? 'Assigned' : 'Pending'],
              ['Pending Fees', pendingPayments > 0 ? `${pendingPayments} due` : 'All clear'],
              ['Support Desk', openComplaints > 0 ? `${openComplaints} open` : 'No issues'],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-white/80 bg-white/75 px-4 py-3 shadow-sm">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">{label}</p>
                <p className="mt-1 text-sm font-semibold text-slate-700">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="My Room" value={profile?.roomAllocation?.room?.roomNumber || 'Not Assigned'} sub={profile?.roomAllocation ? `Block ${profile.roomAllocation.room.block}, Floor ${profile.roomAllocation.room.floor}` : 'Contact admin'} color="primary" link="/student/room" />
        <StatCard label="Pending Payments" value={pendingPayments} sub="Tap to pay now" color={pendingPayments > 0 ? 'red' : 'green'} link="/student/payments" />
        <StatCard label="Open Complaints" value={openComplaints} sub={openComplaints > 0 ? 'Being processed' : 'All resolved'} color={openComplaints > 0 ? 'yellow' : 'green'} link="/student/complaints" />
        <StatCard label="My Profile" value="View" sub="Manage your details" color="slate" link="/student/profile" />
      </div>

      <h2 className="text-sm font-semibold text-sky-500 uppercase tracking-[0.2em] mb-3">Quick Actions</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[
          { to: '/student/out-pass', icon: '\u{1FAAA}', label: 'Apply Out Pass' },
          { to: '/student/home-pass', icon: '\u{1F3E0}', label: 'Apply Home Pass' },
          { to: '/student/food', icon: { src: foodIcon, alt: 'View food menu' }, label: 'View Food Menu' },
          { to: '/student/laundry', icon: { src: laundryIcon, alt: 'Laundry request' }, label: 'Laundry Request' },
          { to: '/student/complaints', icon: { src: complaintIcon, alt: 'File complaint' }, label: 'File Complaint' },
          { to: '/student/payments', icon: { src: feeIcon, alt: 'Make payment' }, label: 'Make Payment' },
        ].map(({ to, icon, label }) => (
          <Link key={to} to={to} className="card p-4 flex items-center gap-3 hover:shadow-lg hover:-translate-y-0.5 transition-all bg-[linear-gradient(160deg,#ffffff,rgba(240,249,255,0.75))] border-sky-100">
            {typeof icon === 'string' ? <UiIcon label={icon} size="sm" tone="blue" /> : <DashboardIcon src={icon.src} alt={icon.alt} />}
            <span className="text-sm font-medium text-slate-700">{label}</span>
          </Link>
        ))}
      </div>

      {profile?.complaints?.length > 0 && (
        <div className="mt-8">
          <h2 className="text-sm font-semibold text-sky-500 uppercase tracking-[0.2em] mb-3">Recent Complaints</h2>
          <div className="card overflow-hidden border-sky-100">
            <table className="w-full text-sm">
              <thead className="bg-sky-50/70 border-b border-sky-100">
                <tr>
                  {['Category', 'Date', 'Status'].map((heading) => (
                    <th key={heading} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {profile.complaints.slice(0, 5).map((complaint) => (
                  <tr key={complaint.id} className="border-b border-slate-50 last:border-0">
                    <td className="px-4 py-3 font-medium">{complaint.category}</td>
                    <td className="px-4 py-3 text-slate-500">{new Date(complaint.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3"><span className={`badge-${complaint.status.toLowerCase()}`}>{complaint.status}</span></td>
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
