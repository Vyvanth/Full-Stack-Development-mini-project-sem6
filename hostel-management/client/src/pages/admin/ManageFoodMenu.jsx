// src/pages/admin/ManageFoodMenu.jsx
import { useState, useEffect } from 'react';
import api from '../../api/client';
import toast from 'react-hot-toast';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MAX_MEAL_ITEMS = 10;
const MAX_ITEM_LENGTH = 60;
const MEAL_ITEM_PATTERN = /[A-Za-z0-9]/;

const getToday = () => new Date().toISOString().split('T')[0];

const parseMealItems = (value) => value
  .split(',')
  .map((item) => item.trim())
  .filter(Boolean);

export default function ManageFoodMenu() {
  const [menus, setMenus] = useState([]);
  const [form, setForm] = useState({ date: '', dayOfWeek: '', breakfast: '', lunch: '', snacks: '', dinner: '', isVeg: true });
  const [editingId, setEditingId] = useState('');
  const [errors, setErrors] = useState({});
  const vegBadge = String.fromCodePoint(0x1F957);
  const star = String.fromCodePoint(0x2B50);
  const mealLabels = [
    [`${String.fromCodePoint(0x1F95E)} Breakfast`, 'breakfast'],
    [`${String.fromCodePoint(0x1F372)} Lunch`, 'lunch'],
    [`${String.fromCodePoint(0x1F36A)} Snacks`, 'snacks'],
    [`${String.fromCodePoint(0x1F37D)} Dinner`, 'dinner'],
  ];
  const resetForm = () => {
    setForm({ date: '', dayOfWeek: '', breakfast: '', lunch: '', snacks: '', dinner: '', isVeg: true });
    setEditingId('');
  };

  const fetch = () => api.get('/food')
    .then(({ data }) => setMenus(data.menus))
    .catch((err) => {
      toast.error(err.response?.data?.error || 'Failed to load menus');
      setMenus([]);
    });
  useEffect(() => { fetch(); }, []);

  const handleDateChange = (e) => {
    const d = new Date(e.target.value);
    setForm({ ...form, date: e.target.value, dayOfWeek: DAYS[d.getDay()] });
  };

  const validateForm = () => {
    const nextErrors = {};
    if (!form.date) nextErrors.date = 'Date is required';

    const selectedDate = new Date(form.date);
    if (Number.isNaN(selectedDate.getTime())) nextErrors.date = 'Please choose a valid date';

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate < today) nextErrors.date = 'Date cannot be in the past';
    if (!form.dayOfWeek || form.dayOfWeek !== DAYS[selectedDate.getDay()]) nextErrors.dayOfWeek = 'Day must match the selected date';

    for (const [label, key] of [['Breakfast', 'breakfast'], ['Lunch', 'lunch'], ['Snacks', 'snacks'], ['Dinner', 'dinner']]) {
      const items = parseMealItems(form[key]);
      if (items.length === 0) nextErrors[key] = `${label} must have at least one item`;
      else if (items.length > MAX_MEAL_ITEMS) nextErrors[key] = `${label} can have at most ${MAX_MEAL_ITEMS} items`;
      else if (items.some((item) => item.length > MAX_ITEM_LENGTH)) nextErrors[key] = `${label} items must be ${MAX_ITEM_LENGTH} characters or less`;
      else if (items.some((item) => !MEAL_ITEM_PATTERN.test(item))) nextErrors[key] = `${label} items must contain real food names, not only symbols`;
    }

    return nextErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = validateForm();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      toast.error('Please fix the highlighted menu fields.');
      return;
    }

    const payload = {
      ...form,
      breakfast: parseMealItems(form.breakfast),
      lunch: parseMealItems(form.lunch),
      snacks: parseMealItems(form.snacks),
      dinner: parseMealItems(form.dinner),
    };
    try {
      if (editingId) {
        await api.put(`/food/${editingId}`, payload);
        toast.success('Menu updated!');
      } else {
        await api.post('/food', payload);
        toast.success('Menu saved!');
      }
      resetForm();
      setErrors({});
      fetch();
    }
    catch (err) { toast.error(err.response?.data?.error || 'Failed'); }
  };

  const handleEdit = (menu) => {
    const toInputDate = new Date(menu.date).toISOString().split('T')[0];
    setEditingId(menu.id);
    setForm({
      date: toInputDate,
      dayOfWeek: menu.dayOfWeek,
      breakfast: menu.breakfast?.join(', ') || '',
      lunch: menu.lunch?.join(', ') || '',
      snacks: menu.snacks?.join(', ') || '',
      dinner: menu.dinner?.join(', ') || '',
      isVeg: menu.isVeg,
    });
  };

  const handleDelete = async (menuId) => {
    try {
      await api.delete(`/food/${menuId}`);
      toast.success('Menu deleted');
      if (editingId === menuId) resetForm();
      fetch();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Delete failed');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Manage Food Menu</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="font-semibold text-slate-700">{editingId ? 'Edit Menu' : 'Add / Update Menu'}</h2>
            {editingId ? (
              <button type="button" className="text-sm font-medium text-slate-500 hover:text-slate-700" onClick={resetForm}>Cancel</button>
            ) : null}
          </div>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div><label className="label">Date</label><input type="date" required min={getToday()} className={`input ${errors.date ? 'border-red-300 focus:ring-red-400' : ''}`} value={form.date} onChange={handleDateChange} />{errors.date && <p className="mt-1 text-xs text-red-500">{errors.date}</p>}</div>
            <div><label className="label">Day</label><input className={`input bg-slate-50 ${errors.dayOfWeek ? 'border-red-300 focus:ring-red-400' : ''}`} readOnly value={form.dayOfWeek} />{errors.dayOfWeek && <p className="mt-1 text-xs text-red-500">{errors.dayOfWeek}</p>}</div>
            {[['Breakfast', 'breakfast'], ['Lunch', 'lunch'], ['Snacks', 'snacks'], ['Dinner', 'dinner']].map(([l, k]) => (
              <div key={k}><label className="label">{l} <span className="text-slate-400 font-normal"></span></label>
                <input className={`input ${errors[k] ? 'border-red-300 focus:ring-red-400' : ''}`} required maxLength={MAX_MEAL_ITEMS * MAX_ITEM_LENGTH} placeholder="Item 1, Item 2..." value={form[k]} onChange={e => { setForm({ ...form, [k]: e.target.value }); if (errors[k]) setErrors({ ...errors, [k]: '' }); }} />{errors[k] ? <p className="mt-1 text-xs text-red-500">{errors[k]}</p> : <p className="mt-1 text-xs text-slate-400">Separate multiple items with commas.</p>}</div>
            ))}
            <div className="flex items-center gap-2">
              <input type="checkbox" id="isVeg" checked={form.isVeg} onChange={e => setForm({ ...form, isVeg: e.target.checked })} className="rounded" />
              <label htmlFor="isVeg" className="text-sm text-slate-700">Vegetarian menu</label>
            </div>
            <button type="submit" className="btn-primary w-full">{editingId ? 'Update Menu' : 'Save Menu'}</button>
          </form>
        </div>
        <div className="lg:col-span-2 space-y-4">
          {menus.length === 0 ? <div className="card p-8 text-center text-slate-400">No menus yet</div> : menus.map(menu => (
            <div key={menu.id} className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-semibold text-slate-700">{menu.dayOfWeek} - {new Date(menu.date).toLocaleDateString()}</p>
                  {menu.isVeg && <span className="mt-1 inline-flex bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">{vegBadge} Veg</span>}
                </div>
                <div className="flex items-center gap-4">
                  <button type="button" className="text-sm font-medium text-teal-600 hover:text-teal-700" onClick={() => handleEdit(menu)}>Edit</button>
                  <button type="button" className="text-sm font-medium text-rose-600 hover:text-rose-700" onClick={() => handleDelete(menu.id)}>Delete</button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {mealLabels.map(([label, key]) => (
                  <div key={key}><p className="text-xs font-semibold text-slate-500 mb-1">{label}</p><p className="text-slate-700">{menu[key]?.join(', ')}</p></div>
                ))}
              </div>
              <div className="mt-5 border-t border-slate-100 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-slate-700">Student Feedback</p>
                  <span className="text-xs text-slate-400">{menu.feedbacks?.length || 0} received</span>
                </div>
                {!menu.feedbacks?.length ? (
                  <p className="text-sm text-slate-400">No feedback submitted for this menu yet.</p>
                ) : (
                  <div className="space-y-3">
                    {menu.feedbacks.map((feedback) => (
                      <div key={feedback.id} className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
                        <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                          <div>
                            <p className="text-sm font-semibold text-slate-700">{feedback.student?.fullName || 'Student'}</p>
                            <p className="text-xs text-slate-400">{feedback.student?.rollNumber || 'Roll number unavailable'}</p>
                          </div>
                          <p className="text-sm font-medium text-amber-600">{star} {feedback.rating}/5</p>
                        </div>
                        <p className="mt-2 text-sm text-slate-600">{feedback.comment?.trim() || 'No written comment provided.'}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

