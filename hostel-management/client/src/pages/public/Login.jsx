import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import BrandMark from '../../components/BrandMark';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const validate = (values) => {
    const nextErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(values.email.trim())) {
      nextErrors.email = 'Enter a valid email address.';
    }

    if (!values.password) {
      nextErrors.password = 'Password is required.';
    } else if (values.password.length < 6) {
      nextErrors.password = 'Password must be at least 6 characters.';
    }

    return nextErrors;
  };

  const handleChange = (e) => {
    setError('');
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const nextErrors = validate(form);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      toast.error('Please fix the highlighted fields.');
      return;
    }
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate(user.role === 'STUDENT' ? '/student' : '/admin');
    } catch (err) {
      const message = err?.response?.data?.error || err?.response?.data?.message || err?.message || 'Invalid email or password. Please try again.';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field) => `input rounded-2xl border-slate-200 bg-slate-50/85 shadow-sm ${errors[field] ? 'border-red-300 focus:ring-red-400' : ''}`;

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[linear-gradient(180deg,#f8fafc_0%,#f1f5f9_52%,#f8fafc_100%)] px-4">
      <div className="pointer-events-none absolute left-[-10%] top-[-10%] h-72 w-72 rounded-full bg-slate-200/60 blur-3xl" />
      <div className="pointer-events-none absolute right-[-8%] bottom-[-10%] h-80 w-80 rounded-full bg-sky-100/70 blur-3xl" />
      <div className="w-full max-w-md">
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700 transition-colors">
            {'\u2190'} Back to Home
          </Link>
        </div>

        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 text-2xl font-bold text-primary-700"><BrandMark />Campus Nest</Link>
          <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-400">Secure Hostel Access</p>
          <h2 className="mt-4 text-[26px] font-semibold tracking-tight text-slate-800">Sign in to your account</h2>
          <p className="mt-2 text-sm leading-7 text-slate-500">Don't have an account? <Link to="/register" className="text-primary-600 font-medium hover:underline">Register</Link></p>
        </div>

        <div className="card rounded-[28px] border border-white/80 bg-white/92 p-8 shadow-[0_24px_60px_rgba(15,23,42,0.08)] backdrop-blur-sm">
          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-2xl px-4 py-3 mb-5 text-sm">
              <span className="mt-0.5 inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-red-100 text-[11px] font-bold text-red-700">!</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input name="email" type="email" required className={inputClass('email')} placeholder="you@example.com" value={form.email} onChange={handleChange} />
              {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
            </div>
            <div>
              <label className="label">Password</label>
              <input name="password" type="password" required className={inputClass('password')} placeholder="Enter password" value={form.password} onChange={handleChange} />
              {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full mt-2 rounded-2xl shadow-[0_16px_30px_rgba(37,99,235,0.16)]">{loading ? 'Signing in...' : 'Sign in'}</button>
          </form>
        </div>
      </div>
    </div>
  );
}
