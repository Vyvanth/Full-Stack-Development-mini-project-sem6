// src/pages/admin/PaymentManagement.jsx
import { useState, useEffect } from 'react';
import api from '../../api/client';
import toast from 'react-hot-toast';

export default function PaymentManagement() {
  const [payments, setPayments] = useState([]);
  const [feeForm, setFeeForm] = useState({ title: '', amount: '', dueDate: '', academicYear: '2024-25' });
  const fetch = () => api.get('/payments').then(({ data }) => setPayments(data.payments));
  useEffect(() => { fetch(); }, []);
  const total = payments.filter(p => p.status === 'PAID').reduce((s, p) => s + p.amount, 0);

  const createFee = async (e) => {
    e.preventDefault();
    try { await api.post('/payments/fees', feeForm); toast.success('Fee created!'); setFeeForm({ title: '', amount: '', dueDate: '', academicYear: '2024-25' }); }
    catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Payment Management</h1>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        <div className="card p-5 lg:col-span-1">
          <h2 className="font-semibold text-slate-700 mb-3">Create Fee</h2>
          <form onSubmit={createFee} className="space-y-3">
            <div><label className="label">Title</label><input required className="input" placeholder="Hostel Fee Q1" value={feeForm.title} onChange={e => setFeeForm({ ...feeForm, title: e.target.value })} /></div>
            <div><label className="label">Amount (₹)</label><input type="number" required className="input" value={feeForm.amount} onChange={e => setFeeForm({ ...feeForm, amount: e.target.value })} /></div>
            <div><label className="label">Due Date</label><input type="date" required className="input" value={feeForm.dueDate} onChange={e => setFeeForm({ ...feeForm, dueDate: e.target.value })} /></div>
            <div><label className="label">Academic Year</label><input required className="input" value={feeForm.academicYear} onChange={e => setFeeForm({ ...feeForm, academicYear: e.target.value })} /></div>
            <button type="submit" className="btn-primary w-full">Create Fee</button>
          </form>
        </div>
        <div className="lg:col-span-3">
          <div className="card p-5 mb-4">
            <p className="text-xs text-slate-500 uppercase">Total Revenue Collected</p>
            <p className="text-3xl font-bold text-green-600 mt-1">₹{total.toLocaleString()}</p>
          </div>
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50"><tr>{['Student', 'Fee', 'Amount', 'Status', 'Paid On'].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">{h}</th>)}</tr></thead>
              <tbody>
                {payments.length === 0 ? <tr><td colSpan={5} className="px-4 py-8 text-center text-slate-400">No transactions</td></tr> : payments.map(p => (
                  <tr key={p.id} className="border-t border-slate-50">
                    <td className="px-4 py-3 font-medium">{p.student?.fullName}</td>
                    <td className="px-4 py-3">{p.fee?.title}</td>
                    <td className="px-4 py-3">₹{p.amount}</td>
                    <td className="px-4 py-3"><span className={`badge-${p.status === 'PAID' ? 'approved' : p.status === 'OVERDUE' ? 'rejected' : 'pending'}`}>{p.status}</span></td>
                    <td className="px-4 py-3 text-slate-500">{p.paidAt ? new Date(p.paidAt).toLocaleDateString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
