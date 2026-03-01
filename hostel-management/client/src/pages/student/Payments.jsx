// src/pages/student/Payments.jsx
import { useState, useEffect } from 'react';
import api from '../../api/client';
import toast from 'react-hot-toast';

export default function Payments() {
  const [payments, setPayments] = useState([]);
  useEffect(() => { api.get('/payments').then(({ data }) => setPayments(data.payments)); }, []);
  const total = payments.reduce((s, p) => s + p.amount, 0);
  const paid = payments.filter(p => p.status === 'PAID').reduce((s, p) => s + p.amount, 0);
  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Payments</h1>
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[['Total Payable', `₹${total}`, 'slate'], ['Paid', `₹${paid}`, 'green'], ['Outstanding', `₹${total - paid}`, total - paid > 0 ? 'red' : 'green']].map(([l, v, c]) => (
          <div key={l} className="card p-5"><p className="text-xs text-slate-500 uppercase">{l}</p><p className={`text-2xl font-bold text-${c}-600 mt-1`}>{v}</p></div>
        ))}
      </div>
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100"><h2 className="font-semibold">Payment History</h2></div>
        {payments.length === 0 ? <div className="p-8 text-center text-slate-400">No payment records</div> : (
          <table className="w-full text-sm">
            <thead className="bg-slate-50"><tr>{['Fee', 'Amount', 'Due Date', 'Status', 'Paid On'].map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">{h}</th>)}</tr></thead>
            <tbody>{payments.map(p => (
              <tr key={p.id} className="border-t border-slate-50">
                <td className="px-4 py-3 font-medium">{p.fee.title}</td>
                <td className="px-4 py-3">₹{p.amount}</td>
                <td className="px-4 py-3 text-slate-500">{new Date(p.fee.dueDate).toLocaleDateString()}</td>
                <td className="px-4 py-3"><span className={`badge-${p.status === 'PAID' ? 'approved' : p.status === 'OVERDUE' ? 'rejected' : 'pending'}`}>{p.status}</span></td>
                <td className="px-4 py-3 text-slate-500">{p.paidAt ? new Date(p.paidAt).toLocaleDateString() : '-'}</td>
              </tr>
            ))}</tbody>
          </table>
        )}
      </div>
    </div>
  );
}
