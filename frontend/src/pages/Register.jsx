// Fixed Register Page with Offline Support
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from '../context/AuthContext';
import { registerUser, createDemoUser, checkBackendStatus } from '../services/authService';
import { demoService } from '../services/demoService';

const Register = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
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

    if (formData.password !== formData.confirmPassword) {
      return setError("Passwords do not match!");
    }

    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
      return setError("All fields are required!");
    }

    setLoading(true);

    try {
      const result = await registerUser({
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      
      login(result.user, result.token);
      navigate("/dashboard");
      
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'Registration failed. Please try again.');
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

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="card w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Create Account</h1>
          <p className="text-slate-400">Join the ultimate fitness experience</p>
          {backendStatus === 'offline' && (
            <div className="mt-2 px-3 py-1 bg-yellow-600/20 text-yellow-400 rounded-full text-xs">
              Offline Mode - Account will be stored locally
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-3 mb-4">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              className="w-full p-3 rounded-lg bg-slate-800/60 border border-slate-700 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none transition-colors"
              value={formData.name}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          
          <div>
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              className="w-full p-3 rounded-lg bg-slate-800/60 border border-slate-700 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none transition-colors"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          
          <div>
            <input
              type="password"
              name="password"
              placeholder="Password"
              className="w-full p-3 rounded-lg bg-slate-800/60 border border-slate-700 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none transition-colors"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          
          <div>
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              className="w-full p-3 rounded-lg bg-slate-800/60 border border-slate-700 text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none transition-colors"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full btn bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-slate-800 text-slate-400">Or</span>
            </div>
          </div>
          
          <button
            onClick={handleDemoLogin}
            disabled={loading}
            className="w-full mt-4 btn bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
          >
            {loading ? 'Starting Demo...' : '🚀 Try Demo Account'}
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-slate-400 text-sm">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium">
              Sign In
            </Link>
          </p>
        </div>

        {/* Quick Registration for Testing */}
        <div className="mt-6 p-4 bg-slate-800/30 border border-slate-700 rounded-lg">
          <p className="text-slate-300 text-sm text-center mb-3">Quick Test Registration:</p>
          <button
            onClick={() => setFormData({
              name: 'Test User',
              email: 'test@example.com',
              password: 'password123',
              confirmPassword: 'password123'
            })}
            className="w-full px-3 py-2 bg-slate-700/50 hover:bg-slate-700 rounded text-sm text-slate-300 transition-colors"
            disabled={loading}
          >
            📝 Fill Test Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default Register;