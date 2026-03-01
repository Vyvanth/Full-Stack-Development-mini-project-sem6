// src/pages/student/FoodMenu.jsx
import { useState, useEffect } from 'react';
import api from '../../api/client';

export default function FoodMenu() {
  const [menus, setMenus] = useState([]);
  useEffect(() => { api.get('/food').then(({ data }) => setMenus(data.menus)); }, []);
  const meals = [['Breakfast', 'breakfast', '☀️'], ['Lunch', 'lunch', '🌤️'], ['Snacks', 'snacks', '🌙'], ['Dinner', 'dinner', '🌃']];

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Food Menu</h1>
      {menus.length === 0 ? <div className="card p-8 text-center text-slate-400">No menu available</div> : (
        <div className="space-y-4">
          {menus.map(menu => (
            <div key={menu.id} className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-slate-700">{menu.dayOfWeek} — {new Date(menu.date).toLocaleDateString()}</h2>
                {menu.isVeg && <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">🌿 Veg</span>}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {meals.map(([label, key, icon]) => (
                  <div key={key}>
                    <p className="text-xs font-semibold text-slate-500 mb-2">{icon} {label}</p>
                    <ul className="text-sm text-slate-700 space-y-1">{menu[key]?.map(item => <li key={item}>• {item}</li>)}</ul>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
