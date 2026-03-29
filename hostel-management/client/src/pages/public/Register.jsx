import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import BrandMark from '../../components/BrandMark';

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

const validate = (form) => {
  const errors = {};

  if (!form.fullName.trim() || form.fullName.trim().length < 3) {
    errors.fullName = 'Full name must be at least 3 characters.';
  } else if (!/^[a-zA-Z\s]+$/.test(form.fullName.trim())) {
    errors.fullName = 'Full name must contain only letters.';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(form.email)) {
    errors.email = 'Enter a valid email address.';
  }

  const phoneRegex = /^[6-9]\d{9}$/;
  if (!phoneRegex.test(form.phone)) {
    errors.phone = 'Enter a valid 10-digit Indian mobile number (starts with 6-9).';
  }

  if (!form.rollNumber.trim() || form.rollNumber.trim().length < 3) {
    errors.rollNumber = 'Enter a valid roll number.';
  }

  if (!form.course.trim() || form.course.trim().length < 2) {
    errors.course = 'Enter a valid course name.';
  }

  if (!form.branch) {
    errors.branch = 'Please select your branch.';
  }

  if (!form.gender) {
    errors.gender = 'Please select your gender.';
  }

  if (form.password.length < 6) {
    errors.password = 'Password must be at least 6 characters.';
  } else if (!/[A-Za-z]/.test(form.password) || !/[0-9]/.test(form.password)) {
    errors.password = 'Password must contain at least one letter and one number.';
  }

  if (form.confirmPassword !== form.password) {
    errors.confirmPassword = 'Passwords do not match.';
  }

  return errors;
};

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    fullName: '', email: '', phone: '', course: '',
    branch: '', gender: '', rollNumber: '', password: '', confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [globalError, setGlobalError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === 'phone') {
      if (!/^\d*$/.test(value) || value.length > 10) return;
    }

    setForm({ ...form, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: '' });
    setGlobalError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGlobalError('');

    const fieldErrors = validate(form);
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      toast.error('Please fix the errors before submitting.');
      return;
    }

    setLoading(true);
    try {
      const { confirmPassword, ...data } = form;
      await register(data);
      toast.success('Registration successful!');
      navigate('/student');
    } catch (err) {
      const message = err?.response?.data?.error || err?.response?.data?.message || err?.message || 'Registration failed. Please try again.';
      setGlobalError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass = (field) => `input ${errors[field] ? 'border-red-400 focus:ring-red-300' : ''}`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-8">
      <div className="w-full max-w-lg">
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700 transition-colors">
            {'\u2190'} Back to Home
          </Link>
        </div>

        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 text-2xl font-bold text-primary-700"><BrandMark />HostelMS</Link>
          <h2 className="mt-4 text-xl font-semibold text-slate-800">Create your account</h2>
          <p className="mt-1 text-sm text-slate-500">Already registered? <Link to="/login" className="text-primary-600 font-medium hover:underline">Sign in</Link></p>
        </div>

        <div className="card p-8">
          {globalError && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-5 text-sm">
              <span className="mt-0.5 inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-red-100 text-[11px] font-bold text-red-700">!</span>
              <span>{globalError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="label">Full Name</label>
                <input name="fullName" required className={inputClass('fullName')} placeholder="Your full name" value={form.fullName} onChange={handleChange} />
                {errors.fullName && <p className="text-xs text-red-500 mt-1">{errors.fullName}</p>}
              </div>

              <div className="col-span-2">
                <label className="label">Email</label>
                <input name="email" type="email" required className={inputClass('email')} placeholder="you@example.com" value={form.email} onChange={handleChange} />
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="label">Phone</label>
                <input name="phone" required className={inputClass('phone')} placeholder="10-digit mobile number" value={form.phone} onChange={handleChange} maxLength={10} inputMode="numeric" />
                {errors.phone ? <p className="text-xs text-red-500 mt-1">{errors.phone}</p> : <p className="text-xs text-slate-400 mt-1">Must start with 6, 7, 8 or 9</p>}
              </div>

              <div>
                <label className="label">Roll Number</label>
                <input name="rollNumber" required className={inputClass('rollNumber')} value={form.rollNumber} onChange={handleChange} />
                {errors.rollNumber && <p className="text-xs text-red-500 mt-1">{errors.rollNumber}</p>}
              </div>

              <div>
                <label className="label">Course</label>
                <input name="course" required className={inputClass('course')} value={form.course} onChange={handleChange} />
                {errors.course && <p className="text-xs text-red-500 mt-1">{errors.course}</p>}
              </div>

              <div>
                <label className="label">Gender</label>
                <select name="gender" required className={inputClass('gender')} value={form.gender} onChange={handleChange}>
                  <option value="" disabled>Select gender</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                </select>
                {errors.gender && <p className="text-xs text-red-500 mt-1">{errors.gender}</p>}
              </div>

              <div className="col-span-2">
                <label className="label">Branch</label>
                <select name="branch" required className={inputClass('branch')} value={form.branch} onChange={handleChange}>
                  <option value="" disabled>Select your branch</option>
                  {amritaBranches.map((branch) => (
                    <option key={branch} value={branch}>{branch}</option>
                  ))}
                </select>
                {errors.branch && <p className="text-xs text-red-500 mt-1">{errors.branch}</p>}
              </div>

              <div>
                <label className="label">Password</label>
                <input name="password" type="password" required className={inputClass('password')} placeholder="Min. 6 characters" value={form.password} onChange={handleChange} />
                {errors.password ? <p className="text-xs text-red-500 mt-1">{errors.password}</p> : <p className="text-xs text-slate-400 mt-1">Letters + numbers required</p>}
              </div>

              <div>
                <label className="label">Confirm Password</label>
                <input name="confirmPassword" type="password" required className={inputClass('confirmPassword')} placeholder="Repeat password" value={form.confirmPassword} onChange={handleChange} />
                {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>}
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">{loading ? 'Creating account...' : 'Create account'}</button>
          </form>
        </div>
      </div>
    </div>
  );
}

