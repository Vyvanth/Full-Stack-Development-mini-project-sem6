// src/pages/student/FoodMenu.jsx
import { useEffect, useState } from 'react';
import api from '../../api/client';
import toast from 'react-hot-toast';

export default function FoodMenu() {
  const [menus, setMenus] = useState([]);
  const [feedbackForms, setFeedbackForms] = useState({});
  const [submittingId, setSubmittingId] = useState('');
  const vegBadge = String.fromCodePoint(0x1F957);
  const bullet = String.fromCodePoint(0x2022);

  const fetchMenus = async () => {
    const { data } = await api.get('/food');
    setMenus(data.menus);
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  const meals = [
    ['Breakfast', 'breakfast', String.fromCodePoint(0x1F95E)],
    ['Lunch', 'lunch', String.fromCodePoint(0x1F372)],
    ['Snacks', 'snacks', String.fromCodePoint(0x1F36A)],
    ['Dinner', 'dinner', String.fromCodePoint(0x1F37D)],
  ];

  const updateFeedbackForm = (menuId, field, value) => {
    setFeedbackForms((current) => ({
      ...current,
      [menuId]: {
        rating: current[menuId]?.rating || '5',
        comment: current[menuId]?.comment || '',
        [field]: value,
      },
    }));
  };

  const handleFeedbackSubmit = async (menuId) => {
    const form = feedbackForms[menuId] || { rating: '5', comment: '' };
    try {
      setSubmittingId(menuId);
      await api.post(`/food/${menuId}/feedback`, {
        rating: Number(form.rating),
        comment: form.comment.trim(),
      });
      toast.success('Food feedback submitted');
      setFeedbackForms((current) => ({
        ...current,
        [menuId]: { rating: '5', comment: '' },
      }));
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit feedback');
    } finally {
      setSubmittingId('');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Food Menu</h1>
      {menus.length === 0 ? <div className="card p-8 text-center text-slate-400">No menu available</div> : (
        <div className="space-y-4">
          {menus.map(menu => (
            <div key={menu.id} className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-slate-700">{menu.dayOfWeek} - {new Date(menu.date).toLocaleDateString()}</h2>
                {menu.isVeg && <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">{vegBadge} Veg</span>}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {meals.map(([label, key, icon]) => (
                  <div key={key}>
                    <p className="text-xs font-semibold text-slate-500 mb-2">{icon} {label}</p>
                    <ul className="text-sm text-slate-700 space-y-1">{menu[key]?.map(item => <li key={item}>{bullet} {item}</li>)}</ul>
                  </div>
                ))}
              </div>
              <div className="mt-6 border-t border-slate-100 pt-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-end">
                  <div className="md:w-40">
                    <label className="label">Rating</label>
                    <select
                      className="input"
                      value={feedbackForms[menu.id]?.rating || '5'}
                      onChange={(e) => updateFeedbackForm(menu.id, 'rating', e.target.value)}
                    >
                      <option value="5">5 - Excellent</option>
                      <option value="4">4 - Good</option>
                      <option value="3">3 - Average</option>
                      <option value="2">2 - Needs work</option>
                      <option value="1">1 - Poor</option>
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="label">Comment</label>
                    <input
                      className="input"
                      placeholder="Share a quick note about this menu"
                      value={feedbackForms[menu.id]?.comment || ''}
                      onChange={(e) => updateFeedbackForm(menu.id, 'comment', e.target.value)}
                    />
                  </div>
                  <button
                    type="button"
                    className="btn-primary md:w-auto"
                    disabled={submittingId === menu.id}
                    onClick={() => handleFeedbackSubmit(menu.id)}
                  >
                    {submittingId === menu.id ? 'Submitting...' : 'Submit Feedback'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

