// frontend/src/components/AuthDebugger.jsx
import React from 'react';
import { useAuth } from '../context/AuthContext';

const AuthDebugger = () => {
  const { user, token, isAuthenticated } = useAuth();
  
  // Only show in development
  if (process.env.NODE_ENV === 'production') return null;
  
  return (
    <div className="fixed bottom-4 right-4 bg-slate-800 border border-slate-600 rounded-lg p-3 text-xs text-white z-50 max-w-xs">
      <div className="font-bold mb-2">🔍 Auth Debug</div>
      <div>Token: {token ? '✅ Present' : '❌ Missing'}</div>
      <div>User: {user ? '✅ Present' : '❌ Missing'}</div>
      <div>User ID: {user?.id || user?._id || '❌ Missing'}</div>
      <div>User Name: {user?.name || '❌ Missing'}</div>
      <div>User Email: {user?.email || '❌ Missing'}</div>
      <div>Authenticated: {isAuthenticated() ? '✅ Yes' : '❌ No'}</div>
      <div className="mt-2 text-xs text-slate-400">
        Check console for detailed logs
      </div>
    </div>
  );
};

export default AuthDebugger;