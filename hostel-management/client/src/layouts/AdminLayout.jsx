import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import BrandMark from '../components/BrandMark';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: 'dashboard', end: true },
  { to: '/admin/students', label: 'Students', icon: 'students' },
  { to: '/admin/rooms', label: 'Rooms', icon: 'rooms' },
  { to: '/admin/complaints', label: 'Complaints', icon: 'complaints' },
  { to: '/admin/payments', label: 'Payments', icon: 'payments' },
  { to: '/admin/food', label: 'Food Menu', icon: 'food' },
  { to: '/admin/laundry', label: 'Laundry', icon: 'laundry' },
  { to: '/admin/passes', label: 'Pass Approval', icon: 'passes' },
];

const SidebarIcon = ({ item, active = false }) => {
  const iconClass = active ? 'text-white' : 'text-slate-200';
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
    case 'students':
      return (
        <svg {...shared}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
          <circle cx="9.5" cy="7" r="3" />
          <path d="M20 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 4.13a3 3 0 0 1 0 5.74" />
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
    case 'passes':
      return (
        <svg {...shared}>
          <rect x="4" y="5" width="16" height="14" rx="2" />
          <path d="M8 9h8M8 13h5" />
          <path d="M16.5 15.5 18 17l3-3" />
        </svg>
      );
    default:
      return null;
  }
};

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const adminName = user?.admin?.fullName || 'Admin';

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    navigate('/login');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[linear-gradient(180deg,#f3f7f7_0%,#edf2f2_100%)]">
      <aside className="w-72 flex-shrink-0 border-r border-slate-800 bg-[linear-gradient(180deg,#18222d_0%,#202c37_50%,#26343f_100%)] text-slate-200 shadow-[18px_0_40px_rgba(15,23,42,0.16)]">
        <div className="flex h-full flex-col">
          <div className="border-b border-slate-800 bg-[radial-gradient(circle_at_top_left,rgba(20,184,166,0.22),transparent_36%),linear-gradient(180deg,rgba(24,34,45,0.98),rgba(24,34,45,0.92))] px-6 py-6">
            <div className="flex items-center gap-3">
              <BrandMark compact dark />
              <div>
                <h1 className="text-lg font-bold tracking-tight text-white">Campus Nest</h1>
                <p className="mt-1 text-[11px] uppercase tracking-[0.22em] text-teal-300">Operations Console</p>
              </div>
            </div>
            <div className="mt-5 rounded-2xl border border-slate-700/80 bg-white/5 px-4 py-3 backdrop-blur-sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">Active Session</p>
              <p className="mt-2 text-sm font-semibold text-white">{adminName}</p>
              <p className="mt-1 text-xs text-slate-400">Admin Panel · {user?.role}</p>
            </div>
          </div>

          <div className="px-6 pt-4">
            <p className="text-[11px] uppercase tracking-[0.22em] text-slate-500">Management</p>
          </div>

          <nav className="flex-1 space-y-2 overflow-y-auto px-4 py-5">
            {navItems.map(({ to, label, icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `nav-link flex items-center gap-3 rounded-2xl border px-3 py-3.5 text-sm transition-all ${
                    isActive
                      ? 'border-teal-400/20 bg-[linear-gradient(135deg,rgba(15,118,110,0.95),rgba(17,94,89,0.95))] text-white shadow-[0_14px_28px_rgba(15,118,110,0.24)]'
                      : 'border-transparent text-slate-300 hover:border-slate-700/80 hover:bg-slate-800/45 hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <SidebarIcon item={icon} active={isActive} />
                    <span className={`font-medium tracking-[0.01em] ${isActive ? 'text-white' : 'text-slate-200'}`}>{label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="border-t border-slate-800 bg-[linear-gradient(180deg,rgba(15,23,42,0.16),rgba(15,23,42,0.36))] px-4 py-5">
            <div className="rounded-2xl border border-slate-700/80 bg-white/5 px-4 py-4">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#0f766e,#2dd4bf)] text-sm font-bold text-white shadow-inner">
                  {adminName[0] || 'A'}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">{adminName}</p>
                  <p className="truncate text-xs text-slate-400">{user?.email}</p>
                </div>
              </div>
              <button onClick={handleLogout} className="w-full px-1 text-left text-sm font-medium text-red-400 transition-colors hover:text-red-300">
                Sign out {'\u2192'}
              </button>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-6 lg:p-7">
        <Outlet />
      </main>
    </div>
  );
}
