import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Logo = () => (
  <div className="flex items-center space-x-2">
    <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-gradient-to-br from-cyan-400 to-amber-400 shadow-lg shadow-cyan-500/20">
      <svg className="w-5 h-5 text-slate-950" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    </div>
    <span className="text-xl font-bold text-white">ResumeAI</span>
  </div>
);

const Layout = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setDropdownOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col text-slate-100 bg-slate-950">
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/85 shadow-sm backdrop-blur-xl">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/">
              <Logo />
            </Link>

            <div className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-slate-300 hover:text-cyan-300 transition-colors">
                Home
              </Link>
              {isAuthenticated && (
                <Link to="/dashboard" className="text-slate-300 hover:text-cyan-300 transition-colors">
                  Dashboard
                </Link>
              )}
            </div>

            <div className="hidden md:flex items-center space-x-4">
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center space-x-2 text-slate-300 hover:text-cyan-300"
                  >
                    <div className="w-8 h-8 bg-cyan-400/15 rounded-full flex items-center justify-center ring-1 ring-cyan-300/20">
                      <span className="text-cyan-300 font-medium">
                        {user?.name?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <span>{user?.name}</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {dropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-lg border border-slate-700 bg-slate-900/95 shadow-lg py-2 z-50">
                      <Link to="/dashboard" className="block px-4 py-2 text-slate-200 hover:bg-slate-800" onClick={() => setDropdownOpen(false)}>
                        Dashboard
                      </Link>
                      <Link to="/dashboard/profile" className="block px-4 py-2 text-slate-200 hover:bg-slate-800" onClick={() => setDropdownOpen(false)}>
                        Profile
                      </Link>
                      <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-rose-300 hover:bg-slate-800">
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link to="/login" className="text-slate-300 hover:text-cyan-300">
                    Sign In
                  </Link>
                  <Link to="/register" className="btn-primary">
                    Get Started
                  </Link>
                </>
              )}
            </div>

            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-slate-100">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-slate-800">
              <Link to="/" className="block py-2 text-slate-300" onClick={() => setMobileMenuOpen(false)}>
                Home
              </Link>
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard" className="block py-2 text-slate-300" onClick={() => setMobileMenuOpen(false)}>
                    Dashboard
                  </Link>
                  <button onClick={handleLogout} className="block w-full text-left py-2 text-rose-300">
                    Logout
                  </button>
                </>
              ) : (
                <div className="space-y-2 pt-2">
                  <Link to="/login" className="block text-center py-2 text-slate-300" onClick={() => setMobileMenuOpen(false)}>
                    Sign In
                  </Link>
                  <Link to="/register" className="block text-center btn-primary" onClick={() => setMobileMenuOpen(false)}>
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          )}
        </nav>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-slate-950 text-white py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="mb-4">
                <Logo />
              </div>
              <p className="text-slate-400">
                AI-powered resume analysis and career guidance. Unlock your potential with our advanced tools.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-slate-400">
                <li><Link to="/dashboard/resume" className="hover:text-cyan-300">Resume Analysis</Link></li>
                <li><Link to="/dashboard/recommendations" className="hover:text-cyan-300">AI Recommendations</Link></li>
                <li><Link to="/dashboard/chatbot" className="hover:text-cyan-300">Career Chatbot</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-slate-400">
                <li>support@resumeai.com</li>
                <li>Made with ❤️ for Career Growth</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-500">
            <p>&copy; {new Date().getFullYear()} ResumeAI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
