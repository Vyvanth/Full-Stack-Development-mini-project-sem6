// src/pages/student/Profile.jsx
import { useState, useEffect } from 'react';
import api from '../../api/client';
import toast from 'react-hot-toast';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });

  useEffect(() => {
    api.get('/students/profile').then(({ data }) => {
      setProfile(data.student);
      setForm({ fullName: data.student.fullName, phone: data.student.phone, guardianName: data.student.guardianName || '', guardianPhone: data.student.guardianPhone || '', address: data.student.address || '' });
    });
  }, []);

  const handleSave = async () => {
    try {
      await api.put('/students/profile', form);
      toast.success('Profile updated!');
      setEditing(false);
    } catch { toast.error('Update failed'); }
  };

  const handlePwChange = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirm) return toast.error('Passwords do not match');
    try {
      await api.post('/auth/change-password', { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Password changed!');
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
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
                  ? <input className="input" value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} />
                  : <p className="text-sm text-slate-800 py-2">{form[key] || '-'}</p>}
              </div>
            ))}
            <div><label className="label">Roll Number</label><p className="text-sm text-slate-800 py-2">{profile.rollNumber}</p></div>
            <div><label className="label">Course / Branch</label><p className="text-sm text-slate-800 py-2">{profile.course} Â· {profile.branch}</p></div>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="font-semibold text-slate-700 mb-4">Change Password</h2>
          <form onSubmit={handlePwChange} className="space-y-3">
            {[['currentPassword', 'Current Password'], ['newPassword', 'New Password'], ['confirm', 'Confirm Password']].map(([key, label]) => (
              <div key={key}>
                <label className="label">{label}</label>
                <input type="password" className="input" value={pwForm[key]} onChange={e => setPwForm({ ...pwForm, [key]: e.target.value })} />
              </div>
            ))}
            <button type="submit" className="btn-primary w-full mt-2">Update Password</button>
          </form>
        </div>
      </div>
    </div>
  );
}

