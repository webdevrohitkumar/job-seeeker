import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { login, error } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(formData.email, formData.password);

    if (result.success) {
      navigate('/dashboard');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-[calc(100vh-200px)] grid lg:grid-cols-[0.95fr_1.05fr] max-w-6xl mx-auto px-4 py-8 sm:py-12 gap-8 items-center">
      <div className="hidden lg:block app-shell-card rounded-2xl p-8">
        <p className="tiny-label mb-3">Placement desk</p>
        <h2 className="text-3xl font-bold text-white mb-4">Welcome back to your job tracker.</h2>
        <p className="text-slate-400 mb-8">
          Continue from saved openings, pending applications, and resume feedback without searching through notes.
        </p>
        <div className="space-y-3">
          {['Resume parsed and ready', '3 applications pending review', 'New frontend internships added'].map((item) => (
            <div key={item} className="flex items-center gap-3 rounded-xl bg-slate-950/70 border border-slate-800 p-4">
              <span className="status-dot"></span>
              <span className="text-slate-200">{item}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-md w-full mx-auto">
        <div className="app-shell-card rounded-2xl p-5 sm:p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Sign in</h1>
            <p className="text-slate-400">Use your JobSeeker account</p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-rose-500/10 border border-rose-400/20 rounded-lg text-rose-300 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="Password"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="rounded border-slate-600 bg-slate-900 text-primary-600 focus:ring-primary-500" />
                <span className="ml-2 text-sm text-slate-400">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-sm text-primary-600 hover:text-primary-700">
                Forgot password?
              </Link>
            </div>

            <button type="submit" disabled={loading} className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-400">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">
                Create Account
              </Link>
            </p>
          </div>

          <div className="mt-4 p-4 rounded-lg paper-note">
            <p className="text-xs text-center">
              Demo accounts:<br />
              user@demo.com / recruiter@demo.com / admin@demo.com<br />
              Password: password123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
