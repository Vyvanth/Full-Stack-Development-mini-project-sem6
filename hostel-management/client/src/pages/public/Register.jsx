// src/pages/public/Register.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', course: '', branch: '', rollNumber: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) return toast.error('Passwords do not match');
    setLoading(true);
    try {
      const { confirmPassword, ...data } = form;
      await register(data);
      toast.success('Registration successful!');
      navigate('/student');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-8">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link to="/" className="text-2xl font-bold text-primary-700">🏨 HostelMS</Link>
          <h2 className="mt-4 text-xl font-semibold text-slate-800">Create your account</h2>
          <p className="mt-1 text-sm text-slate-500">
            Already registered?{' '}
            <Link to="/login" className="text-primary-600 font-medium hover:underline">Sign in</Link>
          </p>
        </div>

        <div className="card p-8">
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
                <input name="rollNumber" required className="input" placeholder="BL.EN.U4AID23001"
                  value={form.rollNumber} onChange={handleChange} />
              </div>
              <div>
                <label className="label">Course</label>
                <input name="course" required className="input" placeholder="B.Tech"
                  value={form.course} onChange={handleChange} />
              </div>
              <div>
                <label className="label">Branch</label>
                <input name="branch" required className="input" placeholder="AI & Data Science"
                  value={form.branch} onChange={handleChange} />
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
