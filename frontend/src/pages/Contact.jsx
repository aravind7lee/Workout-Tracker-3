// frontend/src/pages/Contact.jsx
import React from 'react';

export default function Contact() {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Contact / Support</h2>
      <div className="card p-4 max-w-xl">
        <form onSubmit={(e)=>{e.preventDefault(); alert('Message sent!')}} className="space-y-3">
          <input className="w-full p-2 rounded bg-slate-900/60" placeholder="Your name" />
          <input className="w-full p-2 rounded bg-slate-900/60" placeholder="Email" />
          <textarea className="w-full p-2 rounded bg-slate-900/60" rows={5} placeholder="How can we help?" />
          <button className="px-4 py-2 rounded bg-accent text-black font-semibold">Send</button>
        </form>
      </div>
    </div>
  );
}
