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

const QuickActionGlyph = ({ type }) => {
  const shared = {
    className: `h-4 w-4 shrink-0 ${type === 'outPass' ? 'text-sky-600' : 'text-emerald-600'}`,
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '1.8',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    viewBox: '0 0 24 24',
    'aria-hidden': 'true',
  };

  if (type === 'outPass') {
    return (
      <svg {...shared}>
        <path d="M10 17l5-5-5-5" />
        <path d="M15 12H4" />
        <path d="M14 5h4a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-4" />
      </svg>
    );
  }

  if (type === 'homePass') {
    return (
      <svg {...shared}>
        <path d="M4 11.5 12 5l8 6.5" />
        <path d="M6 10.5V19h12v-8.5" />
        <path d="M10 19v-4.5h4V19" />
      </svg>
    );
  }

  return null;
};

const StatCard = ({ label, value, sub, color = 'blue', link }) => (
  <Link
    to={link || '#'}
    className="group relative block overflow-hidden rounded-[28px] border border-sky-100 bg-[linear-gradient(160deg,#ffffff,rgba(248,250,252,0.94))] p-5 shadow-[0_16px_36px_rgba(15,23,42,0.06)] transition-all hover:-translate-y-1 hover:shadow-[0_20px_44px_rgba(14,165,233,0.12)]"
  >
    <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,rgba(59,130,246,0.95),rgba(56,189,248,0.55))]" />
    <div className="relative">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-600">{label}</p>
        <p className={`mt-3 text-3xl font-bold text-${color}-600`}>{value}</p>
        {sub && <p className="mt-2 text-sm text-slate-500">{sub}</p>}
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
    <div className="space-y-8">
      <div className="rounded-[32px] border border-slate-200 bg-white px-7 py-8 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900">Good day, {firstName}</h1>
            <p className="mt-3 max-w-2xl text-base text-slate-600">{profile?.rollNumber} · {profile?.course} · {profile?.branch}</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[
              ['Room Status', profile?.roomAllocation?.room?.roomNumber ? 'Assigned' : 'Pending'],
              ['Pending Fees', pendingPayments > 0 ? `${pendingPayments} due` : 'All clear'],
              ['Support Desk', openComplaints > 0 ? `${openComplaints} open` : 'No issues'],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">{label}</p>
                <p className="mt-2 text-base font-semibold text-slate-800">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="My Room" value={profile?.roomAllocation?.room?.roomNumber || 'Not Assigned'} sub={profile?.roomAllocation ? `Block ${profile.roomAllocation.room.block}, Floor ${profile.roomAllocation.room.floor}` : 'Contact admin'} color="primary" link="/student/room" />
        <StatCard label="Pending Payments" value={pendingPayments} sub="Tap to pay now" color={pendingPayments > 0 ? 'red' : 'green'} link="/student/payments" />
        <StatCard label="Open Complaints" value={openComplaints} sub={openComplaints > 0 ? 'Being processed' : 'All resolved'} color={openComplaints > 0 ? 'yellow' : 'green'} link="/student/complaints" />
        <StatCard label="My Profile" value="View" sub="Manage your details" color="slate" link="/student/profile" />
      </div>

      <section>
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-600">Quick Actions</h2>
            <p className="mt-2 text-sm text-slate-500">Jump to the tasks you use most throughout the day.</p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[
            { to: '/student/out-pass', icon: 'outPass', label: 'Apply Out Pass', desc: 'Plan a short leave request for today.' },
            { to: '/student/home-pass', icon: 'homePass', label: 'Apply Home Pass', desc: 'Request overnight or multi-day leave.' },
            { to: '/student/food', icon: { src: foodIcon, alt: 'View food menu' }, label: 'View Food Menu', desc: 'Check what is being served this week.' },
            { to: '/student/laundry', icon: { src: laundryIcon, alt: 'Laundry request' }, label: 'Laundry Request', desc: 'Book pickup and track current laundry.' },
            { to: '/student/complaints', icon: { src: complaintIcon, alt: 'File complaint' }, label: 'File Complaint', desc: 'Raise issues for room or facility support.' },
            { to: '/student/payments', icon: { src: feeIcon, alt: 'Make payment' }, label: 'Make Payment', desc: 'Review pending dues and pay online.' },
          ].map(({ to, icon, label, desc }) => (
            <Link
              key={to}
              to={to}
              className="group flex items-start gap-4 rounded-[26px] border border-sky-100 bg-[linear-gradient(160deg,#ffffff,rgba(240,249,255,0.82))] px-5 py-5 shadow-[0_14px_32px_rgba(15,23,42,0.05)] transition-all hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(56,189,248,0.12)]"
            >
              {typeof icon === 'string' ? (
                <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-sky-100 bg-white shadow-sm">
                  <QuickActionGlyph type={icon} />
                </span>
              ) : (
                <DashboardIcon src={icon.src} alt={icon.alt} />
              )}
              <div className="min-w-0">
                <p className="text-lg font-semibold text-slate-800">{label}</p>
                <p className="mt-2 text-sm leading-6 text-slate-500">{desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {profile?.complaints?.length > 0 && (
        <section>
          <div className="mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-[0.24em] text-sky-600">Recent Complaints</h2>
            <p className="mt-2 text-sm text-slate-500">A quick look at the most recent support items linked to your account.</p>
          </div>
          <div className="overflow-hidden rounded-[28px] border border-sky-100 bg-white shadow-[0_16px_34px_rgba(15,23,42,0.05)]">
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
        </section>
      )}
    </div>
  );
}
