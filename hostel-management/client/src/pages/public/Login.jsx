// src/pages/public/Login.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back!`);
      navigate(user.role === 'STUDENT' ? '/student' : '/admin');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="text-2xl font-bold text-primary-700">🏨 HostelMS</Link>
          <h2 className="mt-4 text-xl font-semibold text-slate-800">Sign in to your account</h2>
          <p className="mt-1 text-sm text-slate-500">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-600 font-medium hover:underline">Register</Link>
          </p>
        </div>

        <div className="card p-8">
          {/* Demo credentials */}
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-6 text-xs text-blue-700">
            <p className="font-semibold mb-1">Demo credentials:</p>
            <p>Admin: admin@hostel.com / admin123</p>
            <p>Student: student@hostel.com / student123</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input name="email" type="email" required className="input" placeholder="you@example.com"
                value={form.email} onChange={handleChange} />
            </div>
            <div>
              <label className="label">Password</label>
              <input name="password" type="password" required className="input" placeholder="••••••••"
                value={form.password} onChange={handleChange} />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
