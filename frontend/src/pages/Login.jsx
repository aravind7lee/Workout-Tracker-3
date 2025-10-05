// Fixed Login Page with Better Error Handling
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from '../context/AuthContext';
import { loginUser, checkBackendStatus } from '../services/authService';
import heroImg from '../assets/Heroimg.jpg';

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [backendStatus, setBackendStatus] = useState('checking');
  const [showPassword, setShowPassword] = useState(false);
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

    console.log('🔐 Login attempt:', {
      email: formData.email,
      hasPassword: !!formData.password,
      backendStatus
    });

    try {
      const result = await loginUser({
        email: formData.email,
        password: formData.password
      });
      
      console.log('✅ Login successful, navigating to dashboard');
      login(result.user, result.token);
      navigate('/dashboard');
      
    } catch (err) {
      console.error('❌ Login error details:', {
        message: err.message,
        stack: err.stack,
        name: err.name
      });
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };





  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroImg})` }}
      ></div>
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/50"></div>
      {/* Gym Atmosphere */}
      <div className="absolute inset-0 bg-gradient-to-t from-amber-950/20 via-transparent to-red-950/10"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(139,69,19,0.15),transparent_50%)] animate-pulse"></div>
      
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-amber-100 mb-3 tracking-tight drop-shadow-2xl">
            Welcome Back
          </h1>
          <p className="text-amber-200/70 font-medium tracking-wide">Sign in to your workout tracker account</p>
          <div className={`mt-4 px-4 py-2 rounded border border-amber-800/30 text-xs font-mono backdrop-blur-sm ${
            backendStatus === 'online' 
              ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/50' 
              : 'bg-amber-950/40 text-amber-300 border-amber-800/50'
          }`}>
            {backendStatus === 'online' ? '● SYSTEM ONLINE' : '● OFFLINE MODE'}
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="bg-gradient-to-b from-black/15 to-black/25 backdrop-blur-sm border border-amber-600/30 rounded-xl p-8 shadow-[0_0_40px_rgba(0,0,0,0.5)] space-y-6">
          <h2 className="text-2xl font-bold text-amber-100 mb-6 tracking-wide">Login</h2>
          
          {error && (
            <div className="bg-red-950/50 border border-red-600/50 rounded-lg p-4 text-red-200 text-sm font-medium backdrop-blur-sm">
              ⚠ {error}
            </div>
          )}
          
          <div>
            <label className="block text-sm font-bold text-amber-200 mb-3 tracking-wide uppercase">Email</label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              className="w-full p-4 rounded-lg bg-zinc-800/80 border border-amber-900/30 text-amber-100 placeholder-amber-600/50 focus:border-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-600/20 transition-all duration-300 font-medium backdrop-blur-sm"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-amber-200 mb-3 tracking-wide uppercase">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                className="w-full p-4 pr-14 rounded-lg bg-zinc-800/80 border border-amber-900/30 text-amber-100 placeholder-amber-600/50 focus:border-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-600/20 transition-all duration-300 font-medium backdrop-blur-sm"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-amber-600/70 hover:text-amber-400 transition-colors duration-200"
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full p-4 bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-amber-100 font-bold tracking-wide uppercase rounded-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:transform-none shadow-lg hover:shadow-amber-600/25"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
          

          
          <p className="text-center text-sm text-amber-300/70 mt-8 font-medium">
            Don't have an account?{" "}
            <Link to="/register" className="text-amber-400 hover:text-amber-300 font-bold tracking-wide transition-colors duration-200">
              Sign up here
            </Link>
          </p>
        </form>
        

      </div>
    </div>
  );
};

export default Login;
