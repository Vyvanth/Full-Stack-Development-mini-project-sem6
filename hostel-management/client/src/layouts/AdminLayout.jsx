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

  const handleLogout = () => {
    logout();
    toast.success('Logged out');
    navigate('/login');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <aside className="w-64 bg-slate-900 text-slate-200 flex flex-col flex-shrink-0">
        <div className="px-6 py-5 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <BrandMark compact dark />
            <h1 className="text-lg font-bold text-white tracking-tight">Campus Nest</h1>
          </div>
          <p className="text-xs text-slate-400 mt-2">Admin Panel · {user?.role}</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(({ to, label, icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `nav-link flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-primary-600 text-white font-medium'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <UiIcon label={icon} size="sm" dark />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-slate-700">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold text-sm">
              {user?.admin?.fullName?.[0] || 'A'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.admin?.fullName || 'Admin'}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full text-left text-sm text-red-400 hover:text-red-300 transition-colors px-1">
            Sign out {'\u2192'}
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}

