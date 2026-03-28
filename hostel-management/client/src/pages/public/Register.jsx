// src/pages/public/Register.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const amritaBranches = [
  'Aerospace Engineering',
  'Artificial Intelligence',
  'Artificial Intelligence & Data Science',
  'Artificial Intelligence & Machine Learning',
  'Automobile Engineering',
  'Biomedical Engineering',
  'Biotechnology',
  'Chemical Engineering',
  'Civil Engineering',
  'Computer Science & Engineering',
  'Computer Science & Engineering (Cyber Security)',
  'Computer Science & Engineering (IoT)',
  'Computer Science & Business Systems',
  'Electrical & Electronics Engineering',
  'Electronics & Communication Engineering',
  'Electronics & Instrumentation Engineering',
  'Information Technology',
  'Mechanical Engineering',
  'Mechatronics Engineering',
  'Robotics & Automation',
  'B.Sc Physics',
  'B.Sc Chemistry',
  'B.Sc Mathematics',
  'B.Sc Computer Science',
  'B.Com',
  'BBA',
  'MBA',
  'M.Tech Computer Science',
  'M.Tech VLSI',
  'M.Tech Power Electronics',
  'M.Sc Data Science',
  'M.Sc Computational Biology',
  'Ph.D',
];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: '', email: '', phone: '', course: '',
    branch: '', rollNumber: '', password: '', confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setError('');
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      const msg = 'Passwords do not match.';
      setError(msg);
      return toast.error(msg);
    }
    if (form.password.length < 6) {
      const msg = 'Password must be at least 6 characters.';
      setError(msg);
      return toast.error(msg);
    }

    setLoading(true);
    try {
      const { confirmPassword, ...data } = form;
      await register(data);
      toast.success('Registration successful!');
      navigate('/student');
    } catch (err) {
      const message =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        err?.message ||
        'Registration failed. Please try again.';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-8">
      <div className="w-full max-w-lg">

        {/* Back to home */}
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700 transition-colors"
          >
            ← Back to Home
          </Link>
        </div>

        <div className="text-center mb-8">
          <Link to="/" className="text-2xl font-bold text-primary-700">🏨 HostelMS</Link>
          <h2 className="mt-4 text-xl font-semibold text-slate-800">Create your account</h2>
          <p className="mt-1 text-sm text-slate-500">
            Already registered?{' '}
            <Link to="/login" className="text-primary-600 font-medium hover:underline">Sign in</Link>
          </p>
        </div>

        <div className="card p-8">

          {/* Inline error banner */}
          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-5 text-sm">
              <span className="mt-0.5 flex-shrink-0">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">

              <div className="col-span-2">
                <label className="label">Full Name</label>
                <input name="fullName" required className="input" placeholder="Your full name"
                  value={form.fullName} onChange={handleChange} />
              </div>

              <div className="col-span-2">
                <label className="label">Email</label>
                <input name="email" type="email" required className="input" placeholder="you@example.com"
                  value={form.email} onChange={handleChange} />
              </div>

              <div>
                <label className="label">Phone</label>
                <input name="phone" required className="input" placeholder="10-digit number"
                  value={form.phone} onChange={handleChange} />
              </div>

              <div>
                <label className="label">Roll Number</label>
                <input name="rollNumber" required className="input"
                  value={form.rollNumber} onChange={handleChange} />
              </div>

              <div>
                <label className="label">Course</label>
                <input name="course" required className="input"
                  value={form.course} onChange={handleChange} />
              </div>

              <div>
                <label className="label">Branch</label>
                <select name="branch" required className="input"
                  value={form.branch} onChange={handleChange}>
                  <option value="" disabled>Select your branch</option>
                  {amritaBranches.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Password</label>
                <input name="password" type="password" required className="input" placeholder="Min. 6 characters"
                  value={form.password} onChange={handleChange} />
              </div>

              <div>
                <label className="label">Confirm Password</label>
                <input name="confirmPassword" type="password" required className="input" placeholder="Repeat password"
                  value={form.confirmPassword} onChange={handleChange} />
              </div>

            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}