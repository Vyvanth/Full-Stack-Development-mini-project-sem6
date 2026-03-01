// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layouts
import StudentLayout from './layouts/StudentLayout';
import AdminLayout from './layouts/AdminLayout';

// Public pages
import Landing from './pages/public/Landing';
import Login from './pages/public/Login';
import Register from './pages/public/Register';

// Student pages
import StudentDashboard from './pages/student/Dashboard';
import RoomDetails from './pages/student/RoomDetails';
import Complaints from './pages/student/Complaints';
import Payments from './pages/student/Payments';
import Profile from './pages/student/Profile';
import FoodMenu from './pages/student/FoodMenu';
import Laundry from './pages/student/Laundry';
import OutPass from './pages/student/OutPass';
import HomePass from './pages/student/HomePass';

// Admin pages
import AdminDashboard from './pages/admin/Dashboard';
import ManageStudents from './pages/admin/ManageStudents';
import RoomManagement from './pages/admin/RoomManagement';
import ComplaintManagement from './pages/admin/ComplaintManagement';
import PaymentManagement from './pages/admin/PaymentManagement';
import ManageFoodMenu from './pages/admin/ManageFoodMenu';
import LaundryManagement from './pages/admin/LaundryManagement';
import PassApproval from './pages/admin/PassApproval';

// Guards
const PrivateRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/unauthorized" replace />;
  return children;
};

const GuestRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to={user.role === 'STUDENT' ? '/student' : '/admin'} replace />;
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
      <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />

      {/* Student */}
      <Route path="/student" element={<PrivateRoute roles={['STUDENT']}><StudentLayout /></PrivateRoute>}>
        <Route index element={<StudentDashboard />} />
        <Route path="room" element={<RoomDetails />} />
        <Route path="complaints" element={<Complaints />} />
        <Route path="payments" element={<Payments />} />
        <Route path="profile" element={<Profile />} />
        <Route path="food" element={<FoodMenu />} />
        <Route path="laundry" element={<Laundry />} />
        <Route path="out-pass" element={<OutPass />} />
        <Route path="home-pass" element={<HomePass />} />
      </Route>

      {/* Admin / Warden */}
      <Route path="/admin" element={<PrivateRoute roles={['ADMIN', 'WARDEN']}><AdminLayout /></PrivateRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="students" element={<ManageStudents />} />
        <Route path="rooms" element={<RoomManagement />} />
        <Route path="complaints" element={<ComplaintManagement />} />
        <Route path="payments" element={<PaymentManagement />} />
        <Route path="food" element={<ManageFoodMenu />} />
        <Route path="laundry" element={<LaundryManagement />} />
        <Route path="passes" element={<PassApproval />} />
      </Route>

      <Route path="/unauthorized" element={<div className="flex items-center justify-center h-screen text-xl font-semibold text-red-500">403 — Unauthorized</div>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      </BrowserRouter>
    </AuthProvider>
  );
}
