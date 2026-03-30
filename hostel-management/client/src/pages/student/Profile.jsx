// src/pages/student/Profile.jsx
import { useState, useEffect } from 'react';
import api from '../../api/client';
import toast from 'react-hot-toast';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [profileErrors, setProfileErrors] = useState({});
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [pwErrors, setPwErrors] = useState({});

  useEffect(() => {
    api.get('/students/profile').then(({ data }) => {
      setProfile(data.student);
      setForm({ fullName: data.student.fullName, phone: data.student.phone, guardianName: data.student.guardianName || '', guardianPhone: data.student.guardianPhone || '', address: data.student.address || '' });
    });
  }, []);

  const validateProfile = () => {
    const nextErrors = {};
    const fullName = form.fullName?.trim() || '';
    const phone = form.phone?.trim() || '';
    const guardianPhone = form.guardianPhone?.trim() || '';

    if (fullName.length < 3) nextErrors.fullName = 'Full name must be at least 3 characters.';
    if (phone && !/^[6-9]\d{9}$/.test(phone)) nextErrors.phone = 'Enter a valid 10-digit mobile number.';
    if (guardianPhone && !/^[6-9]\d{9}$/.test(guardianPhone)) nextErrors.guardianPhone = 'Enter a valid 10-digit guardian mobile number.';
    if (form.address && form.address.trim().length > 250) nextErrors.address = 'Address cannot exceed 250 characters.';

    return nextErrors;
  };

  const handleSave = async () => {
    const nextErrors = validateProfile();
    if (Object.keys(nextErrors).length > 0) {
      setProfileErrors(nextErrors);
      toast.error('Please fix the highlighted profile fields.');
      return;
    }
    try {
      await api.put('/students/profile', form);
      toast.success('Profile updated!');
      setEditing(false);
      setProfileErrors({});
    } catch { toast.error('Update failed'); }
  };

  const handlePwChange = async (e) => {
    e.preventDefault();
    const nextErrors = {};
    if (!pwForm.currentPassword) nextErrors.currentPassword = 'Current password is required.';
    if (!pwForm.newPassword) nextErrors.newPassword = 'New password is required.';
    else if (pwForm.newPassword.length < 6) nextErrors.newPassword = 'New password must be at least 6 characters.';
    if (pwForm.confirm !== pwForm.newPassword) nextErrors.confirm = 'Passwords do not match.';
    if (Object.keys(nextErrors).length > 0) {
      setPwErrors(nextErrors);
      toast.error('Please fix the highlighted password fields.');
      return;
    }
    try {
      await api.post('/auth/change-password', { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Password changed!');
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
      setPwErrors({});
    } catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  if (!profile) return <div className="text-slate-400">Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">My Profile</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-700">Personal Details</h2>
            <button onClick={() => editing ? handleSave() : setEditing(true)} className="btn-primary text-sm px-3 py-1.5">
              {editing ? 'Save Changes' : 'Edit Profile'}
            </button>
          </div>
          <div className="space-y-3">
            {[['Full Name', 'fullName'], ['Phone', 'phone'], ['Guardian Name', 'guardianName'], ['Guardian Phone', 'guardianPhone'], ['Address', 'address']].map(([label, key]) => (
              <div key={key}>
                <label className="label">{label}</label>
                {editing
                  ? <><input className={`input ${profileErrors[key] ? 'border-red-300 focus:ring-red-400' : ''}`} value={form[key]} onChange={e => { setForm({ ...form, [key]: e.target.value }); if (profileErrors[key]) setProfileErrors({ ...profileErrors, [key]: '' }); }} />{profileErrors[key] && <p className="mt-1 text-xs text-red-500">{profileErrors[key]}</p>}</>
                  : <p className="text-sm text-slate-800 py-2">{form[key] || '-'}</p>}
              </div>
            ))}
            <div><label className="label">Roll Number</label><p className="text-sm text-slate-800 py-2">{profile.rollNumber}</p></div>
            <div><label className="label">Course / Branch</label><p className="text-sm text-slate-800 py-2">{profile.course} · {profile.branch}</p></div>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="font-semibold text-slate-700 mb-4">Change Password</h2>
          <form onSubmit={handlePwChange} className="space-y-3">
            {[['currentPassword', 'Current Password'], ['newPassword', 'New Password'], ['confirm', 'Confirm Password']].map(([key, label]) => (
              <div key={key}>
                <label className="label">{label}</label>
                <input type="password" className={`input ${pwErrors[key] ? 'border-red-300 focus:ring-red-400' : ''}`} value={pwForm[key]} onChange={e => { setPwForm({ ...pwForm, [key]: e.target.value }); if (pwErrors[key]) setPwErrors({ ...pwErrors, [key]: '' }); }} />
                {pwErrors[key] && <p className="mt-1 text-xs text-red-500">{pwErrors[key]}</p>}
              </div>
            ))}
            <button type="submit" className="btn-primary w-full mt-2">Update Password</button>
          </form>
        </div>
      </div>
    </div>
  );
}

