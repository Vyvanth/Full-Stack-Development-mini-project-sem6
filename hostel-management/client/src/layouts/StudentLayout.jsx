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
  const iconClass = active ? 'text-slate-800' : 'text-slate-400';
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
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col shadow-sm flex-shrink-0 relative z-10">
        <div className="px-6 py-6 border-b border-slate-200 bg-white">
          <div className="flex items-center gap-3">
            <BrandMark compact />
            <div>
              <h1 className="text-lg font-bold text-primary-700 tracking-tight">Campus Nest</h1>
              <p className="text-[11px] uppercase tracking-[0.22em] text-teal-600 mt-0.5">Student Portal</p>
            </div>
          </div>
          <div className="mt-5 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Welcome Back</p>
            <p className="mt-1 text-base font-semibold text-slate-800">{firstName}</p>
            <p className="text-xs text-slate-400 mt-1">{user?.student?.rollNumber || 'Student Portal'}</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-5 space-y-1 overflow-y-auto bg-white">
          {navItems.map(({ to, label, icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `nav-link flex items-center gap-3 px-3 py-3 rounded-2xl text-sm transition-all ${
                  isActive ? 'active shadow-sm' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-800'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <SidebarIcon item={icon} active={isActive} />
                  <span className="font-medium">{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="px-4 py-5 border-t border-slate-200 bg-white">
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-sm">
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
