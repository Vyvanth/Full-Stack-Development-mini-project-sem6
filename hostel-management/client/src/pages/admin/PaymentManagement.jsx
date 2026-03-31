// src/pages/admin/PaymentManagement.jsx
import { useState, useEffect } from 'react';
import api from '../../api/client';
import toast from 'react-hot-toast';
import ConfirmDialog from '../../components/ConfirmDialog';

const getCurrentAcademicYear = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const startYear = month >= 6 ? year : year - 1;
  const endYearSuffix = String((startYear + 1) % 100).padStart(2, '0');
  return `${startYear}-${endYearSuffix}`;
};

const getTodayInputValue = () => new Date().toISOString().split('T')[0];

const EMPTY_FEE_FORM = { title: '', amount: '', dueDate: '', academicYear: getCurrentAcademicYear() };

export default function PaymentManagement() {
  const [payments, setPayments] = useState([]);
  const [fees, setFees] = useState([]);
  const [feeForm, setFeeForm] = useState(EMPTY_FEE_FORM);
  const [editingFee, setEditingFee] = useState(null); // fee object being edited
  const [activeTab, setActiveTab] = useState('transactions'); // 'transactions' | 'fees'
  const [filterStatus, setFilterStatus] = useState('');
  const [filterFee, setFilterFee] = useState('');
  const [loading, setLoading] = useState(true);
  const [feeErrors, setFeeErrors] = useState({});
  const [confirmState, setConfirmState] = useState(null);
  const minDueDate = getTodayInputValue();
  const currentAcademicYear = getCurrentAcademicYear();

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [pRes, fRes] = await Promise.all([
        api.get('/payments'),
        api.get('/payments/fees'),
      ]);
      setPayments(pRes.data.payments);
      setFees(fRes.data.fees);
    } catch {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  // â”€â”€ Stats â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const totalRevenue = payments.filter(p => p.status === 'PAID').reduce((s, p) => s + p.amount, 0);
  const totalPending = payments.filter(p => p.status === 'PENDING').reduce((s, p) => s + p.amount, 0);
  const paidCount = payments.filter(p => p.status === 'PAID').length;
  const pendingCount = payments.filter(p => p.status === 'PENDING').length;

  // â”€â”€ Filtered payments â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const filteredPayments = payments.filter(p => {
    if (filterStatus && p.status !== filterStatus) return false;
    if (filterFee && p.feeId !== filterFee) return false;
    return true;
  });

  // â”€â”€ Create or Update Fee â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const handleFeeSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = {};
    if (!feeForm.title.trim()) nextErrors.title = 'Fee title is required.';
    else if (feeForm.title.trim().length < 3) nextErrors.title = 'Fee title must be at least 3 characters.';
    if (!feeForm.amount || Number(feeForm.amount) <= 0) nextErrors.amount = 'Amount must be greater than 0.';
    if (!feeForm.dueDate) nextErrors.dueDate = 'Due date is required.';
    else if (feeForm.dueDate < minDueDate) nextErrors.dueDate = 'Due date cannot be in the past.';
    if (!/^\d{4}-\d{2}$/.test(feeForm.academicYear)) nextErrors.academicYear = 'Academic year must be in YYYY-YY format.';

    const [startYearText, endYearSuffix] = feeForm.academicYear.split('-');
    const startYear = Number(startYearText);
    const expectedEndYearSuffix = String((startYear + 1) % 100).padStart(2, '0');
    if (!nextErrors.academicYear && endYearSuffix !== expectedEndYearSuffix) nextErrors.academicYear = 'Academic year must be a valid consecutive range like 2025-26.';
    if (!nextErrors.academicYear && feeForm.academicYear < currentAcademicYear) nextErrors.academicYear = `Academic year cannot be earlier than ${currentAcademicYear}.`;

    if (Object.keys(nextErrors).length > 0) {
      setFeeErrors(nextErrors);
      toast.error('Please fix the highlighted fee fields.');
      return;
    }

    try {
      if (editingFee) {
        // Update fee via PATCH
        await api.patch(`/payments/fees/${editingFee.id}`, feeForm);
        toast.success('Fee updated successfully!');
        setEditingFee(null);
      } else {
        await api.post('/payments/fees', feeForm);
        toast.success('Fee created and assigned to all students!');
      }
      setFeeForm(EMPTY_FEE_FORM);
      setFeeErrors({});
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to save fee');
    }
  };

  const startEdit = (fee) => {
    setEditingFee(fee);
    setFeeForm({
      title: fee.title,
      amount: fee.amount,
      dueDate: fee.dueDate?.slice(0, 10) ?? '',
      academicYear: fee.academicYear,
    });
    setActiveTab('fees');
  };

  const cancelEdit = () => {
    setEditingFee(null);
    setFeeForm(EMPTY_FEE_FORM);
  };

  const openConfirm = (config) => setConfirmState(config);
  const closeConfirm = () => setConfirmState(null);

  // â”€â”€ Delete Fee â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const deleteFee = async (fee) => {
    try {
      await api.delete(`/payments/fees/${fee.id}`);
      toast.success('Fee deleted.');
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Delete failed');
    }
  };

  // â”€â”€ Mark payment as paid (cash) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const markPaid = async (payment) => {
    try {
      await api.patch(`/payments/${payment.id}`, { status: 'PAID' });
      toast.success('Payment marked as received!');
      fetchAll();
    } catch {
      toast.error('Failed to update payment');
    }
  };

  // â”€â”€ Mark payment as pending â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  const markPending = async (payment) => {
    try {
      await api.patch(`/payments/${payment.id}`, { status: 'PENDING' });
      toast.success('Payment reverted to pending.');
      fetchAll();
    } catch {
      toast.error('Failed to update payment');
    }
  };

  const statusBadge = (status) => {
    if (status === 'PAID') return <span className="badge-approved">PAID</span>;
    if (status === 'OVERDUE') return <span className="badge-rejected">OVERDUE</span>;
    return <span className="badge-pending">PENDING</span>;
  };

  return (
    <div>
      <ConfirmDialog
        open={Boolean(confirmState)}
        title={confirmState?.title || 'Confirm action'}
        message={confirmState?.message || ''}
        confirmLabel={confirmState?.confirmLabel || 'Confirm'}
        cancelLabel={confirmState?.cancelLabel || 'Cancel'}
        tone={confirmState?.tone || 'danger'}
        onConfirm={async () => {
          if (!confirmState?.onConfirm) return;
          await confirmState.onConfirm();
          closeConfirm();
        }}
        onCancel={closeConfirm}
      />
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Payment Management</h1>

      {/* â”€â”€ Stats â”€â”€ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
        { label: 'Total Collected', value: `₹${totalRevenue.toLocaleString()}`, color: 'green' },
        { label: 'Total Pending', value: `₹${totalPending.toLocaleString()}`, color: 'yellow' },
          { label: 'Paid Payments', value: paidCount, color: 'blue' },
          { label: 'Pending Payments', value: pendingCount, color: 'red' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card p-5">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">{label}</p>
            <p className={`text-2xl font-bold mt-1 text-${color}-600`}>{value}</p>
          </div>
        ))}
      </div>

      {/* â”€â”€ Tabs â”€â”€ */}
      <div className="flex gap-2 mb-4">
        {[['transactions', 'Transactions'], ['fees', 'Manage Fees']].map(([key, label]) => (
          <button key={key} onClick={() => setActiveTab(key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === key ? 'bg-primary-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
            {label}
          </button>
        ))}
      </div>

      {/* â•â• TRANSACTIONS TAB â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      {activeTab === 'transactions' && (
        <div>
          {/* Filters */}
          <div className="flex gap-3 mb-4">
            <select className="input w-44" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="PAID">Paid</option>
              <option value="OVERDUE">Overdue</option>
            </select>
            <select className="input w-52" value={filterFee} onChange={e => setFilterFee(e.target.value)}>
              <option value="">All Fees</option>
              {fees.map(f => <option key={f.id} value={f.id}>{f.title}</option>)}
            </select>
            {(filterStatus || filterFee) && (
              <button onClick={() => { setFilterStatus(''); setFilterFee(''); }}
                className="btn-secondary text-sm px-3">Clear Filters</button>
            )}
          </div>

          <div className="card overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-slate-400">Loading...</div>
            ) : filteredPayments.length === 0 ? (
              <div className="p-8 text-center text-slate-400">No transactions found.</div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    {['Student', 'Roll No', 'Fee', 'Amount', 'Status', 'Paid On', 'Actions'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredPayments.map(p => (
                    <tr key={p.id} className="border-t border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-medium">{p.student?.fullName}</td>
                      <td className="px-4 py-3 text-slate-400 text-xs font-mono">{p.student?.rollNumber}</td>
                      <td className="px-4 py-3">{p.fee?.title}</td>
                  <td className="px-4 py-3 font-semibold">₹{p.amount.toLocaleString()}</td>
                      <td className="px-4 py-3">{statusBadge(p.status)}</td>
                      <td className="px-4 py-3 text-slate-500">{p.paidAt ? new Date(p.paidAt).toLocaleDateString('en-IN') : '-'}</td>
                      <td className="px-4 py-3">
                        {p.status !== 'PAID' ? (
                          <button onClick={() => openConfirm({
                            title: 'Mark payment as received?',
                            message: `Mark ${p.student?.fullName}'s payment of ₹${p.amount.toLocaleString()} as paid by cash?`,
                            confirmLabel: 'Mark Received',
                            cancelLabel: 'Cancel',
                            tone: 'primary',
                            onConfirm: () => markPaid(p),
                          })}
                            className="text-xs bg-green-100 text-green-700 hover:bg-green-200 font-medium px-3 py-1 rounded-lg transition-colors">
                            Mark Received
                          </button>
                        ) : (
                          <button onClick={() => openConfirm({
                            title: 'Revert payment to pending?',
                            message: `This will change ${p.student?.fullName}'s payment status back to pending.`,
                            confirmLabel: 'Revert',
                            cancelLabel: 'Keep Paid',
                            tone: 'danger',
                            onConfirm: () => markPending(p),
                          })}
                            className="text-xs bg-slate-100 text-slate-500 hover:bg-slate-200 font-medium px-3 py-1 rounded-lg transition-colors">
                            Revert
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* â•â• FEES TAB â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â• */}
      {activeTab === 'fees' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Create / Edit form */}
          <div className="card p-6">
            <h2 className="font-semibold text-slate-700 mb-4">
              {editingFee ? `Edit: ${editingFee.title}` : 'Create New Fee'}
            </h2>
            <form onSubmit={handleFeeSubmit} className="space-y-3">
              <div>
                <label className="label">Title</label>
                <input required className={`input ${feeErrors.title ? 'border-red-300 focus:ring-red-400' : ''}`} placeholder="e.g. Hostel Fee "
                  value={feeForm.title} onChange={e => { setFeeForm({ ...feeForm, title: e.target.value }); if (feeErrors.title) setFeeErrors({ ...feeErrors, title: '' }); }} />
                {feeErrors.title && <p className="mt-1 text-xs text-red-500">{feeErrors.title}</p>}
              </div>
              <div>
                    <label className="label">Amount (₹)</label>
                <input type="number" required min="1" className={`input ${feeErrors.amount ? 'border-red-300 focus:ring-red-400' : ''}`}
                  value={feeForm.amount} onChange={e => { setFeeForm({ ...feeForm, amount: e.target.value }); if (feeErrors.amount) setFeeErrors({ ...feeErrors, amount: '' }); }} />
                {feeErrors.amount && <p className="mt-1 text-xs text-red-500">{feeErrors.amount}</p>}
              </div>
              <div>
                <label className="label">Due Date</label>
                <input type="date" required className={`input ${feeErrors.dueDate ? 'border-red-300 focus:ring-red-400' : ''}`} min={minDueDate}
                  value={feeForm.dueDate} onChange={e => { setFeeForm({ ...feeForm, dueDate: e.target.value }); if (feeErrors.dueDate) setFeeErrors({ ...feeErrors, dueDate: '' }); }} />
                {feeErrors.dueDate && <p className="mt-1 text-xs text-red-500">{feeErrors.dueDate}</p>}
              </div>
              <div>
                <label className="label">Academic Year</label>
                <input required className={`input ${feeErrors.academicYear ? 'border-red-300 focus:ring-red-400' : ''}`} placeholder={currentAcademicYear}
                  value={feeForm.academicYear} onChange={e => { setFeeForm({ ...feeForm, academicYear: e.target.value }); if (feeErrors.academicYear) setFeeErrors({ ...feeErrors, academicYear: '' }); }} />
                {feeErrors.academicYear ? <p className="mt-1 text-xs text-red-500">{feeErrors.academicYear}</p> : <p className="mt-1 text-xs text-slate-400">Use current or future academic years only, for example {currentAcademicYear}.</p>}
              </div>
              <div className="flex gap-2 pt-1">
                <button type="submit" className="btn-primary flex-1">
                  {editingFee ? 'Update Fee' : 'Create Fee'}
                </button>
                {editingFee && (
                  <button type="button" onClick={cancelEdit} className="btn-secondary px-3">
                    Cancel
                  </button>
                )}
              </div>
              {!editingFee && (
                <p className="text-xs text-slate-400 text-center">
                  Creating a fee will assign it to all current students as pending.
                </p>
              )}
            </form>
          </div>

          {/* Fee list */}
          <div className="lg:col-span-2 card overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-700">All Fee Structures</h2>
            </div>
            {fees.length === 0 ? (
              <div className="p-8 text-center text-slate-400">No fees created yet.</div>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-100">
                  <tr>
                    {['Title', 'Amount', 'Due Date', 'Academic Year', 'Actions'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {fees.map(f => (
                    <tr key={f.id} className="border-t border-slate-50 hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium">{f.title}</td>
                  <td className="px-4 py-3 font-semibold text-slate-700">₹{f.amount.toLocaleString()}</td>
                      <td className="px-4 py-3 text-slate-500">{new Date(f.dueDate).toLocaleDateString('en-IN')}</td>
                      <td className="px-4 py-3 text-slate-500">{f.academicYear}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <button onClick={() => startEdit(f)}
                            className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 font-medium px-3 py-1 rounded-lg transition-colors">
                            Edit
                          </button>
                          <button onClick={() => openConfirm({
                            title: 'Delete fee structure?',
                            message: `Delete "${f.title}" and remove all related payment records? This cannot be undone.`,
                            confirmLabel: 'Delete Fee',
                            cancelLabel: 'Keep Fee',
                            tone: 'danger',
                            onConfirm: () => deleteFee(f),
                          })}
                            className="text-xs bg-red-100 text-red-700 hover:bg-red-200 font-medium px-3 py-1 rounded-lg transition-colors">
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
