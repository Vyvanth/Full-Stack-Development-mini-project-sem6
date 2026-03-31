import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import BrandMark from '../components/BrandMark';
import UiIcon from '../components/UiIcon';

const navItems = [
  { to: '/admin', label: 'Dashboard', icon: '\u{1F4CA}', end: true },
  { to: '/admin/students', label: 'Students', icon: '\u{1F393}' },
  { to: '/admin/rooms', label: 'Rooms', icon: '\u{1F6CF}\uFE0F' },
  { to: '/admin/complaints', label: 'Complaints', icon: '\u{1F9FE}' },
  { to: '/admin/payments', label: 'Payments', icon: '\u{1F4B3}' },
  { to: '/admin/food', label: 'Food Menu', icon: '\u{1F37D}\uFE0F' },
  { to: '/admin/laundry', label: 'Laundry', icon: '\u{1F9FA}' },
  { to: '/admin/passes', label: 'Pass Approval', icon: '\u{1F6C2}' },
];

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
    <div className="flex h-screen overflow-hidden bg-[linear-gradient(180deg,#f3f6fb_0%,#eef2f7_100%)]">
      <aside className="w-72 flex-shrink-0 border-r border-slate-800 bg-[linear-gradient(180deg,#0f172a_0%,#111827_50%,#172033_100%)] text-slate-200 shadow-[18px_0_40px_rgba(15,23,42,0.16)]">
        <div className="flex h-full flex-col">
          <div className="border-b border-slate-800 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.18),transparent_36%),linear-gradient(180deg,rgba(15,23,42,0.98),rgba(15,23,42,0.92))] px-6 py-6">
            <div className="flex items-center gap-3">
              <BrandMark compact dark />
              <div>
                <h1 className="text-lg font-bold tracking-tight text-white">Campus Nest</h1>
                <p className="mt-1 text-[11px] uppercase tracking-[0.22em] text-sky-300">Operations Console</p>
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

          <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
            {navItems.map(({ to, label, icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `nav-link flex items-center gap-3 rounded-2xl px-3 py-3 text-sm transition-all ${
                    isActive
                      ? 'bg-[linear-gradient(135deg,#2563eb,#1d4ed8)] text-white shadow-[0_14px_28px_rgba(37,99,235,0.28)]'
                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <UiIcon label={icon} size="sm" dark={isActive} />
                    <span className="font-medium">{label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          <div className="border-t border-slate-800 bg-[linear-gradient(180deg,rgba(15,23,42,0.16),rgba(15,23,42,0.36))] px-4 py-5">
            <div className="rounded-2xl border border-slate-700/80 bg-white/5 px-4 py-4">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#2563eb,#60a5fa)] text-sm font-bold text-white shadow-inner">
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
