import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import BrandMark from '../components/BrandMark';

const navItems = [
  { to: '/student', label: 'Dashboard', icon: 'dashboard', end: true },
  { to: '/student/room', label: 'My Room', icon: 'rooms' },
  { to: '/student/complaints', label: 'Complaints', icon: 'complaints' },
  { to: '/student/payments', label: 'Payments', icon: 'payments' },
  { to: '/student/food', label: 'Food Menu', icon: 'food' },
  { to: '/student/laundry', label: 'Laundry', icon: 'laundry' },
  { to: '/student/out-pass', label: 'Out Pass', icon: 'outPass' },
  { to: '/student/home-pass', label: 'Home Pass', icon: 'homePass' },
  { to: '/student/profile', label: 'Profile', icon: 'profile' },
];

const SidebarIcon = ({ item, active = false }) => {
  const iconClass = active ? 'text-white' : 'text-slate-300';
  const shared = {
    className: `h-[18px] w-[18px] shrink-0 ${iconClass}`,
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: '1.8',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    viewBox: '0 0 24 24',
    'aria-hidden': 'true',
  };

  switch (item) {
    case 'dashboard':
      return (
        <svg {...shared}>
          <path d="M4 13h7V4H4zM13 20h7v-9h-7zM13 4h7v5h-7zM4 20h7v-5H4z" />
        </svg>
      );
    case 'rooms':
      return (
        <svg {...shared}>
          <path d="M3 21V8l9-5 9 5v13" />
          <path d="M9 21v-6h6v6" />
          <path d="M9 10h.01M15 10h.01" />
        </svg>
      );
    case 'complaints':
      return (
        <svg {...shared}>
          <path d="M8 3h8l3 3v15H5V3z" />
          <path d="M13 3v4h4" />
          <path d="M9 12h6M9 16h6" />
        </svg>
      );
    case 'payments':
      return (
        <svg {...shared}>
          <rect x="3" y="6" width="18" height="12" rx="2" />
          <path d="M3 10h18" />
          <path d="M7 15h3" />
        </svg>
      );
    case 'food':
      return (
        <svg {...shared}>
          <path d="M4 3v7" />
          <path d="M7 3v7" />
          <path d="M4 7h3" />
          <path d="M6 10v11" />
          <path d="M14 3c0 4 3 4 3 8v10" />
          <path d="M17 3v18" />
        </svg>
      );
    case 'laundry':
      return (
        <svg {...shared}>
          <rect x="4" y="3" width="16" height="18" rx="2" />
          <circle cx="12" cy="13" r="4" />
          <path d="M8 7h.01M12 7h.01M16 7h.01" />
        </svg>
      );
    case 'outPass':
      return (
        <svg {...shared}>
          <path d="M10 17l5-5-5-5" />
          <path d="M15 12H3" />
          <path d="M14 5h4a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-4" />
        </svg>
      );
    case 'homePass':
      return (
        <svg {...shared}>
          <path d="M3 11.5 12 4l9 7.5" />
          <path d="M5 10.5V20h14v-9.5" />
          <path d="M10 20v-5h4v5" />
        </svg>
      );
    case 'profile':
      return (
        <svg {...shared}>
          <path d="M20 21a8 8 0 0 0-16 0" />
          <circle cx="12" cy="8" r="4" />
        </svg>
      );
    default:
      return null;
  }
};

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
    <div className="flex h-screen overflow-hidden bg-[linear-gradient(180deg,#f8fafc_0%,#f1f5f9_100%)]">
      <aside className="relative z-10 flex w-72 flex-shrink-0 flex-col border-r border-slate-800 bg-[linear-gradient(180deg,#18212d_0%,#1f2a37_100%)] shadow-[18px_0_40px_rgba(15,23,42,0.14)]">
        <div className="border-b border-slate-800 bg-[linear-gradient(180deg,rgba(24,33,45,0.98),rgba(31,42,55,0.95))] px-6 py-6">
          <div className="flex items-center gap-3">
            <BrandMark compact dark />
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white">Campus Nest</h1>
              <p className="mt-0.5 text-[11px] uppercase tracking-[0.22em] text-slate-300">Student Portal</p>
            </div>
          </div>
          <div className="mt-5 rounded-3xl border border-white/10 bg-white/8 px-4 py-4 shadow-[0_14px_32px_rgba(15,23,42,0.12)] backdrop-blur-sm">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">Welcome Back</p>
            <p className="mt-2 text-xl font-semibold text-white">{firstName}</p>
            <p className="mt-1 text-xs text-slate-300">{user?.student?.rollNumber || 'Student Portal'}</p>
          </div>
        </div>

        <div className="px-6 pt-4">
          <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">Navigation</p>
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto bg-transparent px-4 py-5">
          {navItems.map(({ to, label, icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `nav-link flex items-center gap-3 rounded-2xl border px-3 py-3.5 text-sm transition-all ${
                  isActive
                    ? 'border-white/12 bg-white/10 text-white shadow-[0_12px_28px_rgba(15,23,42,0.18)]'
                    : 'border-transparent text-slate-300 hover:border-white/10 hover:bg-white/5 hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl border ${isActive ? 'border-white/10 bg-white/12' : 'border-white/10 bg-white/5'}`}>
                    <SidebarIcon item={icon} active={isActive} />
                  </span>
                  <span className={`font-medium ${isActive ? 'text-white' : 'text-slate-200'}`}>{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-800 bg-[linear-gradient(180deg,rgba(24,33,45,0.94),rgba(31,42,55,0.98))] px-4 py-5">
          <div className="rounded-3xl border border-white/10 bg-white/8 px-4 py-4 shadow-[0_14px_30px_rgba(15,23,42,0.12)]">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#1d4ed8,#60a5fa)] text-sm font-bold text-white shadow-inner">
                {studentName[0] || 'S'}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">{studentName}</p>
                <p className="truncate text-xs text-slate-300">{user?.email}</p>
              </div>
            </div>
            <button onClick={handleLogout} className="w-full px-1 text-left text-sm font-medium text-red-300 transition-colors hover:text-red-200">
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
