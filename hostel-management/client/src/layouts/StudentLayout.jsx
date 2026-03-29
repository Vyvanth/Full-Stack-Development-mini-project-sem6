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

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <aside className="w-64 bg-white border-r border-slate-100 flex flex-col shadow-sm flex-shrink-0">
        <div className="px-6 py-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <BrandMark compact />
            <h1 className="text-lg font-bold text-primary-700 tracking-tight">HostelMS</h1>
          </div>
          <p className="text-xs text-slate-400 mt-2">{user?.student?.rollNumber || 'Student Portal'}</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(({ to, label, icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `nav-link flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive ? 'active' : 'text-slate-600 hover:bg-slate-50'
                }`
              }
            >
              <UiIcon label={icon} size="sm" tone="slate" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-4 py-4 border-t border-slate-100">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm">
              {user?.student?.fullName?.[0] || 'S'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-700 truncate">{user?.student?.fullName || 'Student'}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full text-left text-sm text-red-500 hover:text-red-700 transition-colors px-1">
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
