// Fixed Register Page with Offline Support
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from '../context/AuthContext';
import { registerUser, checkBackendStatus } from '../services/authService';
import heroImg from '../assets/Heroimg.jpg';

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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordMatch, setPasswordMatch] = useState(null);
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
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Real-time password matching validation
    if (name === 'confirmPassword' || (name === 'password' && formData.confirmPassword)) {
      const password = name === 'password' ? value : formData.password;
      const confirmPassword = name === 'confirmPassword' ? value : formData.confirmPassword;
      
      if (confirmPassword.length > 0) {
        setPasswordMatch(password === confirmPassword);
      } else {
        setPasswordMatch(null);
      }
    }
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
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(139,69,19,0.15),transparent_50%)] animate-pulse"></div>
      
      <div className="bg-gradient-to-b from-black/15 to-black/25 backdrop-blur-sm border border-amber-600/30 rounded-xl p-8 shadow-[0_0_40px_rgba(0,0,0,0.5)] w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-black text-amber-100 mb-3 tracking-tight drop-shadow-2xl">
            Create Account
          </h1>
          <p className="text-amber-200/70 font-medium tracking-wide">Join the ultimate fitness experience</p>
          <div className={`mt-4 px-4 py-2 rounded border border-amber-800/30 text-xs font-mono backdrop-blur-sm ${
            backendStatus === 'online' 
              ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/50' 
              : 'bg-amber-950/40 text-amber-300 border-amber-800/50'
          }`}>
            {backendStatus === 'online' 
              ? '● DATABASE CONNECTED' 
              : '● LOCAL STORAGE MODE'}
          </div>
        </div>

        {error && (
          <div className="bg-red-950/50 border border-red-600/50 rounded-lg p-4 mb-6 backdrop-blur-sm">
            <p className="text-red-200 text-sm font-medium">⚠ {error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              className="w-full p-4 rounded-lg bg-zinc-800/80 border border-amber-900/30 text-amber-100 placeholder-amber-600/50 focus:border-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-600/20 transition-all duration-300 font-medium backdrop-blur-sm uppercase tracking-wide"
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
              className="w-full p-4 rounded-lg bg-zinc-800/80 border border-amber-900/30 text-amber-100 placeholder-amber-600/50 focus:border-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-600/20 transition-all duration-300 font-medium backdrop-blur-sm"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          
          <div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                className="w-full p-4 pr-14 rounded-lg bg-zinc-800/80 border border-amber-900/30 text-amber-100 placeholder-amber-600/50 focus:border-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-600/20 transition-all duration-300 font-medium backdrop-blur-sm"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-amber-600/70 hover:text-amber-400 transition-colors duration-200"
                tabIndex={-1}
                disabled={loading}
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
          
          <div>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm Password"
                className={`w-full p-4 pr-14 rounded-lg bg-zinc-800/80 border text-amber-100 placeholder-amber-600/50 focus:outline-none focus:ring-2 transition-all duration-300 font-medium backdrop-blur-sm ${
                  passwordMatch === null 
                    ? 'border-amber-900/30 focus:border-amber-600 focus:ring-amber-600/20'
                    : passwordMatch 
                    ? 'border-green-500/50 focus:border-green-500 focus:ring-green-500/20'
                    : 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20'
                }`}
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-amber-600/70 hover:text-amber-400 transition-colors duration-200"
                tabIndex={-1}
                disabled={loading}
              >
                {showConfirmPassword ? (
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
            
            {/* Password Match Indicator */}
            {passwordMatch !== null && formData.confirmPassword.length > 0 && (
              <div className={`mt-2 text-sm font-medium flex items-center gap-2 ${
                passwordMatch ? 'text-green-400' : 'text-red-400'
              }`}>
                {passwordMatch ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Passwords match
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Passwords do not match
                  </>
                )}
              </div>
            )}
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="w-full p-4 bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-amber-100 font-bold tracking-wide uppercase rounded-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:transform-none shadow-lg hover:shadow-amber-600/25"
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>



        <div className="mt-8 text-center">
          <p className="text-amber-300/70 text-sm font-medium">
            Already have an account?{' '}
            <Link to="/login" className="text-amber-400 hover:text-amber-300 font-bold tracking-wide transition-colors duration-200">
              Sign In
            </Link>
          </p>
        </div>

        {/* Quick Registration for Testing */}
        <div className="mt-6 p-4 bg-zinc-800/50 border border-amber-900/20 rounded-lg backdrop-blur-sm">
          <p className="text-amber-300/70 text-sm text-center mb-3 font-medium">Quick Test Registration:</p>
          <button
            onClick={() => setFormData({
              name: 'Test User',
              email: 'test@example.com',
              password: 'password123',
              confirmPassword: 'password123'
            })}
            className="w-full px-4 py-2 bg-amber-800/30 hover:bg-amber-700/40 rounded text-sm text-amber-300 transition-all duration-200 font-medium tracking-wide border border-amber-800/30"
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