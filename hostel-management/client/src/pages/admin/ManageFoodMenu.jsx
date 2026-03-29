// src/pages/admin/ManageFoodMenu.jsx
import { useState, useEffect } from 'react';
import api from '../../api/client';
import toast from 'react-hot-toast';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function ManageFoodMenu() {
  const [menus, setMenus] = useState([]);
  const [form, setForm] = useState({ date: '', dayOfWeek: '', breakfast: '', lunch: '', snacks: '', dinner: '', isVeg: true });
  const fetch = () => api.get('/food').then(({ data }) => setMenus(data.menus));
  useEffect(() => { fetch(); }, []);

  const handleDateChange = (e) => {
    const d = new Date(e.target.value);
    setForm({ ...form, date: e.target.value, dayOfWeek: DAYS[d.getDay()] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      breakfast: form.breakfast.split(',').map(s => s.trim()).filter(Boolean),
      lunch: form.lunch.split(',').map(s => s.trim()).filter(Boolean),
      snacks: form.snacks.split(',').map(s => s.trim()).filter(Boolean),
      dinner: form.dinner.split(',').map(s => s.trim()).filter(Boolean),
    };
    try { await api.post('/food', payload); toast.success('Menu saved!'); fetch(); }
    catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Manage Food Menu</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-6">
          <h2 className="font-semibold text-slate-700 mb-4">Add / Update Menu</h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div><label className="label">Date</label><input type="date" required className="input" value={form.date} onChange={handleDateChange} /></div>
            <div><label className="label">Day</label><input className="input bg-slate-50" readOnly value={form.dayOfWeek} /></div>
            {[['Breakfast', 'breakfast'], ['Lunch', 'lunch'], ['Snacks', 'snacks'], ['Dinner', 'dinner']].map(([l, k]) => (
              <div key={k}><label className="label">{l} <span className="text-slate-400 font-normal">(comma separated)</span></label>
                <input className="input" placeholder="Item 1, Item 2..." value={form[k]} onChange={e => setForm({ ...form, [k]: e.target.value })} /></div>
            ))}
            <div className="flex items-center gap-2">
              <input type="checkbox" id="isVeg" checked={form.isVeg} onChange={e => setForm({ ...form, isVeg: e.target.checked })} className="rounded" />
              <label htmlFor="isVeg" className="text-sm text-slate-700">Vegetarian menu</label>
            </div>
            <button type="submit" className="btn-primary w-full">Save Menu</button>
          </form>
        </div>
        <div className="lg:col-span-2 space-y-4">
          {menus.length === 0 ? <div className="card p-8 text-center text-slate-400">No menus yet</div> : menus.map(menu => (
            <div key={menu.id} className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <p className="font-semibold text-slate-700">{menu.dayOfWeek} â€” {new Date(menu.date).toLocaleDateString()}</p>
                {menu.isVeg && <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">ðŸŒ¿ Veg</span>}
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {[['â˜€ï¸ Breakfast', menu.breakfast], ['ðŸŒ¤ï¸ Lunch', menu.lunch], ['ðŸŒ™ Snacks', menu.snacks], ['ðŸŒƒ Dinner', menu.dinner]].map(([l, items]) => (
                  <div key={l}><p className="text-xs font-semibold text-slate-500 mb-1">{l}</p><p className="text-slate-700">{items?.join(', ')}</p></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

