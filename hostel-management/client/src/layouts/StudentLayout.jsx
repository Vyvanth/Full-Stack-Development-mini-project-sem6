import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import BrandMark from '../components/BrandMark';
import UiIcon from '../components/UiIcon';

const navItems = [
  { to: '/student', label: 'Dashboard', icon: '\u{1F4CA}', end: true },
  { to: '/student/room', label: 'My Room', icon: '\u{1F6CF}\uFE0F' },
  { to: '/student/complaints', label: 'Complaints', icon: '\u{1F9FE}' },
  { to: '/student/payments', label: 'Payments', icon: '\u{1F4B3}' },
  { to: '/student/food', label: 'Food Menu', icon: '\u{1F37D}\uFE0F' },
  { to: '/student/laundry', label: 'Laundry', icon: '\u{1F9FA}' },
  { to: '/student/out-pass', label: 'Out Pass', icon: '\u{1FAAA}' },
  { to: '/student/home-pass', label: 'Home Pass', icon: '\u{1F3E0}' },
  { to: '/student/profile', label: 'Profile', icon: '\u{1F464}' },
];

export default function StudentLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const studentName = user?.student?.fullName || 'Student';
  const firstName = studentName.split(' ')[0];

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[linear-gradient(180deg,#f6fbff_0%,#eef5ff_48%,#f8fafc_100%)]">
      <aside className="w-72 bg-white border-r border-sky-200 flex flex-col shadow-[0_0_0_1px_rgba(186,230,253,0.45),0_24px_60px_rgba(15,23,42,0.08)] flex-shrink-0 relative z-10">
        <div className="px-6 py-6 border-b border-sky-100 bg-[radial-gradient(circle_at_top_left,rgba(186,230,253,0.82),transparent_58%),linear-gradient(135deg,#ffffff,rgba(240,249,255,0.96))]">
          <div className="flex items-center gap-3">
            <BrandMark compact />
            <div>
              <h1 className="text-lg font-bold text-primary-700 tracking-tight">Campus Nest</h1>
              <p className="text-[11px] uppercase tracking-[0.22em] text-sky-500 mt-0.5">Student Portal</p>
            </div>
          </div>
          <div className="mt-5 rounded-2xl border border-sky-100 bg-white px-4 py-3 shadow-[0_10px_30px_rgba(14,116,144,0.08)]">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-500">Welcome Back</p>
            <p className="mt-1 text-base font-semibold text-slate-800">{firstName}</p>
            <p className="text-xs text-slate-400 mt-1">{user?.student?.rollNumber || 'Student Portal'}</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-5 space-y-1 overflow-y-auto bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)]">
          {navItems.map(({ to, label, icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `nav-link flex items-center gap-3 px-3 py-3 rounded-2xl text-sm transition-all ${
                  isActive ? 'active shadow-sm' : 'text-slate-600 hover:bg-sky-50 hover:text-sky-700'
                }`
              }
            >
              <UiIcon label={icon} size="sm" tone="slate" />
              <span className="font-medium">{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="px-4 py-5 border-t border-sky-100 bg-white">
          <div className="rounded-2xl border border-sky-100 bg-[linear-gradient(135deg,#ffffff,#f0f9ff)] px-4 py-4 shadow-[0_12px_30px_rgba(14,116,144,0.08)]">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-2xl bg-[linear-gradient(135deg,#dbeafe,#bfdbfe)] flex items-center justify-center text-primary-700 font-bold text-sm shadow-inner">
                {studentName[0] || 'S'}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-700 truncate">{studentName}</p>
                <p className="text-xs text-slate-400 truncate">{user?.email}</p>
              </div>
            </div>
            <button onClick={handleLogout} className="w-full text-left text-sm font-medium text-red-500 hover:text-red-700 transition-colors px-1">
              Sign out {'\u2192'}
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-7">
        <Outlet />
      </main>
    </div>
  );
}
