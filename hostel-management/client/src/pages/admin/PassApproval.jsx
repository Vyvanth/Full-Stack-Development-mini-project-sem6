// src/pages/admin/PassApproval.jsx
import { useState, useEffect } from 'react';
import api from '../../api/client';
import toast from 'react-hot-toast';

export default function PassApproval() {
  const [outPasses, setOutPasses] = useState([]);
  const [homePasses, setHomePasses] = useState([]);
  const [tab, setTab] = useState('out');
  const [remarks, setRemarks] = useState({});

  const fetchAll = () => {
    api.get('/passes/out').then(({ data }) => setOutPasses(data.passes));
    api.get('/passes/home').then(({ data }) => setHomePasses(data.passes));
  };
  useEffect(() => { fetchAll(); }, []);

  const updatePass = async (type, id, status) => {
    try {
      await api.patch(`/passes/${type}/${id}`, { status, remarks: remarks[id] || '' });
      toast.success(`Pass ${status.toLowerCase()}!`);
      fetchAll();
    } catch { toast.error('Action failed'); }
  };

  const PassTable = ({ passes, type }) => (
    <div className="card overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-slate-50"><tr>
          {(type === 'out'
            ? ['Student', 'Date', 'Time Out', 'Return', 'Reason', 'Status', 'Remarks', 'Actions']
            : ['Student', 'From', 'To', 'Destination', 'Guardian', 'Status', 'Remarks', 'Actions']
          ).map(h => <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase">{h}</th>)}
        </tr></thead>
        <tbody>
          {passes.length === 0 ? <tr><td colSpan={8} className="px-4 py-8 text-center text-slate-400">No {type} passes</td></tr>
            : passes.map(p => (
              <tr key={p.id} className="border-t border-slate-50">
                <td className="px-4 py-3 font-medium">{p.student?.fullName}<br /><span className="text-xs text-slate-400">{p.student?.rollNumber}</span></td>
                {type === 'out' ? <>
                  <td className="px-4 py-3">{new Date(p.date).toLocaleDateString()}</td>
                  <td className="px-4 py-3">{new Date(p.timeOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                  <td className="px-4 py-3">{new Date(p.expectedReturn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                </> : <>
                  <td className="px-4 py-3">{new Date(p.fromDate).toLocaleDateString()}</td>
                  <td className="px-4 py-3">{new Date(p.toDate).toLocaleDateString()}</td>
                  <td className="px-4 py-3">{p.destination}</td>
                  <td className="px-4 py-3">{p.guardianContact}</td>
                </>}
                {type === 'out' && <td className="px-4 py-3 text-slate-500 max-w-[140px] truncate">{p.reason}</td>}
                <td className="px-4 py-3"><span className={`badge-${p.status.toLowerCase()}`}>{p.status}</span></td>
                <td className="px-4 py-3">
                  <input className="input text-xs w-28" placeholder="Remarks..." value={remarks[p.id] || ''} onChange={e => setRemarks({ ...remarks, [p.id]: e.target.value })} />
                </td>
                <td className="px-4 py-3">
                  {p.status === 'PENDING' && (
                    <div className="flex gap-1">
                      <button onClick={() => updatePass(type, p.id, 'APPROVED')} className="bg-green-100 text-green-700 hover:bg-green-200 text-xs font-medium px-2 py-1 rounded transition-colors">Approve</button>
                      <button onClick={() => updatePass(type, p.id, 'REJECTED')} className="bg-red-100 text-red-700 hover:bg-red-200 text-xs font-medium px-2 py-1 rounded transition-colors">Reject</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Pass Approval</h1>
      <div className="flex gap-2 mb-4">
        {[['out', 'Out Passes', outPasses.filter(p => p.status === 'PENDING').length],
          ['home', 'Home Passes', homePasses.filter(p => p.status === 'PENDING').length]].map(([t, label, count]) => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t ? 'bg-primary-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
            {label} {count > 0 && <span className="ml-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">{count}</span>}
          </button>
        ))}
      </div>
      {tab === 'out' ? <PassTable passes={outPasses} type="out" /> : <PassTable passes={homePasses} type="home" />}
    </div>
  );
}

