import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import BrandMark from '../components/BrandMark';
import UiIcon from '../components/UiIcon';
import roomIcon from '../assets/icons/room.png';
import feeIcon from '../assets/icons/fee.png';
import complaintIcon from '../assets/icons/complaint.png';
import foodIcon from '../assets/icons/food.png';
import laundryIcon from '../assets/icons/laundry.png';

const navItems = [
  { to: '/student', label: 'Dashboard', icon: '\u{1F4CA}', end: true },
  { to: '/student/room', label: 'My Room', icon: { src: roomIcon, alt: 'My room' } },
  { to: '/student/complaints', label: 'Complaints', icon: { src: complaintIcon, alt: 'Complaints' } },
  { to: '/student/payments', label: 'Payments', icon: { src: feeIcon, alt: 'Payments' } },
  { to: '/student/food', label: 'Food Menu', icon: { src: foodIcon, alt: 'Food menu' } },
  { to: '/student/laundry', label: 'Laundry', icon: { src: laundryIcon, alt: 'Laundry' } },
  { to: '/student/out-pass', label: 'Out Pass', icon: '\u{1FAAA}' },
  { to: '/student/home-pass', label: 'Home Pass', icon: '\u{1F3E0}' },
  { to: '/student/profile', label: 'Profile', icon: '\u{1F464}' },
];

const SidebarIcon = ({ item }) => {
  if (typeof item === 'string') {
    return <UiIcon label={item} size="sm" tone="slate" />;
  }

  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-teal-100 bg-white shadow-sm">
      <img src={item.src} alt={item.alt} className="h-5 w-5 object-contain" />
    </div>
  );
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
              <SidebarIcon item={icon} />
              <span className="font-medium">{label}</span>
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
