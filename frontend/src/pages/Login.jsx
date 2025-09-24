// Fixed Login Page with Better Error Handling
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from '../context/AuthContext';
import { loginUser, createDemoUser, checkBackendStatus } from '../services/authService';
import { demoService } from '../services/demoService';

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [backendStatus, setBackendStatus] = useState('checking');
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const checkBackend = async () => {
      const status = await checkBackendStatus();
      setBackendStatus(status.online ? 'online' : 'offline');
    };
    checkBackend();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!formData.email.trim() || !formData.password.trim()) {
      setError('Email and password are required');
      setLoading(false);
      return;
    }

    try {
      const result = await loginUser({
        email: formData.email,
        password: formData.password
      });
      
      login(result.user, result.token);
      navigate('/dashboard');
      
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setLoading(true);
    setError('');
    
    try {
      const { user, token } = demoService.createDemoSession();
      login(user, token);
      navigate('/dashboard');
    } catch (err) {
      console.error('Demo login error:', err);
      setError('Failed to start demo. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (email, password) => {
    setLoading(true);
    setError('');
    
    try {
      const result = await loginUser({ email, password });
      login(result.user, result.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-slate-400">Sign in to your workout tracker account</p>
          <div className={`mt-2 px-3 py-1 rounded-full text-xs ${
            backendStatus === 'online' 
              ? 'bg-green-600/20 text-green-400' 
              : 'bg-yellow-600/20 text-yellow-400'
          }`}>
            {backendStatus === 'online' ? '✅ Online Mode - Full functionality' : '⚠️ Offline Mode - Limited functionality'}
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="card space-y-4">
          <h2 className="text-xl font-semibold text-white mb-4">Login</h2>
          
          {error && (
            <div className="bg-red-900/20 border border-red-500 rounded p-3 text-red-300 text-sm">
              {error}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              className="w-full p-3 rounded-lg bg-slate-800/60 border border-slate-700 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              className="w-full p-3 rounded-lg bg-slate-800/60 border border-slate-700 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="btn bg-blue-600 hover:bg-blue-700 text-white w-full disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
          
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-slate-800 text-slate-400">Or</span>
            </div>
          </div>
          
          <button
            type="button"
            onClick={handleDemoLogin}
            className="btn bg-green-600 hover:bg-green-700 text-white w-full"
          >
            🚀 Try Demo Account
          </button>
          
          <p className="text-center text-sm text-slate-400 mt-6">
            Don't have an account?{" "}
            <Link to="/register" className="text-blue-400 hover:text-blue-300 font-medium">
              Sign up here
            </Link>
          </p>
        </form>
        
        {backendStatus === 'offline' && (
          <div className="mt-6 p-4 bg-slate-800/30 border border-slate-700 rounded-lg">
            <p className="text-slate-300 text-sm text-center mb-3">Quick Login Options:</p>
            <div className="space-y-2">
              <button
                onClick={() => handleQuickLogin('demo@gymtracker.com', 'demo123456')}
                className="w-full text-left px-3 py-2 bg-slate-700/50 hover:bg-slate-700 rounded text-sm text-slate-300 transition-colors"
                disabled={loading}
              >
                📧 demo@gymtracker.com / demo123456
              </button>
              <button
                onClick={() => handleQuickLogin('test@example.com', 'password123')}
                className="w-full text-left px-3 py-2 bg-slate-700/50 hover:bg-slate-700 rounded text-sm text-slate-300 transition-colors"
                disabled={loading}
              >
                📧 test@example.com / password123
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
