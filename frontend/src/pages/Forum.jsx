// frontend/src/pages/Forum.jsx
import React, { useEffect, useState } from 'react';
import api from '../utils/api';

export default function Forum() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get('/posts');
        setPosts(res.data);
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, []);

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Community Feed</h2>
      <div className="space-y-4">
        {posts.map(p => (
          <div key={p._id} className="card p-4">
            <div className="font-semibold">{p.user?.name}</div>
            <div className="text-slate-300 mt-2">{p.content}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
