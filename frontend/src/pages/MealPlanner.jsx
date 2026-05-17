// frontend/src/pages/MealPlanner.jsx
import React, { useState } from 'react';

export default function MealPlanner() {
  const [meals, setMeals] = useState([]);
  const [form, setForm] = useState({ type:'breakfast', name:'', calories:0, protein:0, carbs:0, fat:0 });

  function addMeal(e) {
    e.preventDefault();
    setMeals(prev => [...prev, { ...form, id: Date.now() }]);
    setForm({ type:'breakfast', name:'', calories:0, protein:0, carbs:0, fat:0 });
  }

  const totals = meals.reduce((acc, m) => {
    acc.calories += Number(m.calories || 0);
    acc.protein += Number(m.protein || 0);
    acc.carbs += Number(m.carbs || 0);
    acc.fat += Number(m.fat || 0);
    return acc;
  }, { calories:0, protein:0, carbs:0, fat:0 });

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Meal & Nutrition Planner</h2>
      <div className="grid md:grid-cols-2 gap-4">
        <div className="card p-4">
          <form onSubmit={addMeal} className="space-y-2">
            <select value={form.type} onChange={e=>setForm({...form,type:e.target.value})} className="w-full p-2 rounded bg-black/60">
              <option value="breakfast">Breakfast</option>
              <option value="lunch">Lunch</option>
              <option value="dinner">Dinner</option>
              <option value="snack">Snack</option>
            </select>
            <input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Item name" className="w-full p-2 rounded bg-black/60" />
            <div className="grid grid-cols-3 gap-2">
              <input type="number" value={form.calories} onChange={e=>setForm({...form,calories:e.target.value})} placeholder="kcal" className="p-2 rounded bg-black/60" />
              <input type="number" value={form.protein} onChange={e=>setForm({...form,protein:e.target.value})} placeholder="protein" className="p-2 rounded bg-black/60" />
              <input type="number" value={form.carbs} onChange={e=>setForm({...form,carbs:e.target.value})} placeholder="carbs" className="p-2 rounded bg-black/60" />
            </div>
            <input type="number" value={form.fat} onChange={e=>setForm({...form,fat:e.target.value})} placeholder="fat" className="w-full p-2 rounded bg-black/60" />
            <button className="px-4 py-2 rounded bg-accent text-black font-semibold">Add Meal</button>
          </form>
        </div>

        <div className="card p-4">
          <h3 className="font-semibold">Today - Totals</h3>
          <div className="mt-3">
            <div>Calories: <strong>{totals.calories}</strong></div>
            <div>Protein: <strong>{totals.protein} g</strong></div>
            <div>Carbs: <strong>{totals.carbs} g</strong></div>
            <div>Fat: <strong>{totals.fat} g</strong></div>
          </div>
          <div className="mt-4">
            <h4 className="font-semibold">Meals</h4>
            <ul className="mt-2 space-y-2">
              {meals.map(m => (
                <li key={m.id} className="p-2 rounded bg-black/30">{m.type} - {m.name} - {m.calories} kcal</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
