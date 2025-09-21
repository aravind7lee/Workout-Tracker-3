// frontend/src/pages/Achievements.jsx
import React from 'react';

export default function Achievements() {
  const badges = [
    { id:1, title:'100 Workouts', subtitle:'Consistency', icon:'🏆' },
    { id:2, title:'Bench PR +10kg', subtitle:'Strength', icon:'💪' },
    { id:3, title:'7 Day Streak', subtitle:'Streak', icon:'🔥' }
  ];

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Goals & Achievements</h2>
      <div className="grid md:grid-cols-3 gap-4">
        {badges.map(b => (
          <div key={b.id} className="card p-4 text-center">
            <div className="text-4xl">{b.icon}</div>
            <div className="font-semibold mt-2">{b.title}</div>
            <div className="text-slate-400 text-sm">{b.subtitle}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
