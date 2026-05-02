import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'user'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    const result = await register({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      role: formData.role
    });

    if (result.success) {
      if (formData.role === 'recruiter') {
        navigate('/recruiter');
      } else {
        navigate('/dashboard');
      }
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-[calc(100vh-200px)] grid lg:grid-cols-[1.05fr_0.95fr] max-w-6xl mx-auto px-4 py-8 sm:py-12 gap-8 items-center">
      <div className="max-w-md w-full mx-auto">
        <div className="app-shell-card rounded-2xl p-5 sm:p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Create account</h1>
            <p className="text-slate-400">Set up your placement profile</p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-rose-500/10 border border-rose-400/20 rounded-lg text-rose-300 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
                Full Name
              </label>
              <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required className="input-field" placeholder="John Doe" />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                Email Address
              </label>
              <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required className="input-field" placeholder="you@example.com" />
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-slate-300 mb-2">
                I am a...
              </label>
              <select id="role" name="role" value={formData.role} onChange={handleChange} className="input-field">
                <option value="user">Job Seeker</option>
                <option value="recruiter">Recruiter</option>
              </select>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                Password
              </label>
              <input type="password" id="password" name="password" value={formData.password} onChange={handleChange} required className="input-field" placeholder="At least 6 characters" />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300 mb-2">
                Confirm Password
              </label>
              <input type="password" id="confirmPassword" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required className="input-field" placeholder="Re-enter password" />
            </div>

            <button type="submit" disabled={loading} className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed">
              {loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-400">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>

      <div className="hidden lg:block app-shell-card rounded-2xl p-8">
        <p className="tiny-label mb-3">What gets created</p>
        <h2 className="text-3xl font-bold text-white mb-6">A profile that feels like a real placement file.</h2>
        <div className="space-y-4">
          {[
            ['Role based dashboard', 'Job seeker and recruiter accounts open different workspaces.'],
            ['Resume workspace', 'Upload your file and keep extracted details in one place.'],
            ['Job activity', 'Saved and applied jobs stay attached to the same profile.']
          ].map(([title, copy]) => (
            <div key={title} className="rounded-xl bg-slate-950/70 border border-slate-800 p-4">
              <p className="font-semibold text-white">{title}</p>
              <p className="text-sm text-slate-400 mt-1">{copy}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Register;
