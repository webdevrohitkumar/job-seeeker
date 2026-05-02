import { Link } from 'react-router-dom';

const features = [
  {
    title: 'Resume AI Analysis',
    copy: 'Upload your resume and get a deep dive into your skills, ATS score, and improvement tips.',
    accent: 'from-cyan-400 to-blue-500',
    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
  },
  {
    title: 'Salary Predictor',
    copy: 'Predict your expected salary for specific companies based on your unique skill set.',
    accent: 'from-emerald-400 to-cyan-400',
    icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
  },
  {
    title: 'Career Chatbot',
    copy: 'Get 24/7 career guidance, interview preparation, and skill-building advice from our AI.',
    accent: 'from-fuchsia-400 to-cyan-400',
    icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z'
  },
  {
    title: 'Role Matching',
    copy: 'Discover which job roles best fit your profile with our advanced AI recommendation engine.',
    accent: 'from-amber-300 to-orange-500',
    icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z'
  }
];

const Home = () => {
  return (
    <div className="animate-fadeIn text-slate-100 bg-slate-950">
      <section className="relative overflow-hidden border-b border-slate-800 min-h-[80vh] flex items-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.24),transparent_30rem),radial-gradient(circle_at_78%_12%,rgba(245,158,11,0.18),transparent_25rem)]"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-12 items-center">
            <div>
              <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold leading-tight text-white mb-8 tracking-tight">
                Don't just search.<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-amber-400">Strategize with AI.</span>
              </h1>
              <p className="text-xl md:text-2xl text-slate-300 mb-10 max-w-2xl leading-relaxed">
                ResumeAI analyzes your professional profile to predict salaries at top companies, optimize your resume for ATS, and guide your career path with intelligent insights.
              </p>
              <div className="flex flex-col sm:flex-row gap-5">
                <Link to="/register" className="bg-cyan-500 hover:bg-cyan-600 text-slate-950 font-bold px-10 py-4 rounded-xl text-lg transition-all shadow-xl shadow-cyan-500/20 hover:scale-105">
                  Get Free Analysis
                </Link>
                <Link to="/login" className="bg-slate-900 hover:bg-slate-800 border border-slate-700 px-10 py-4 rounded-xl text-lg transition-all font-semibold">
                  Sign In
                </Link>
              </div>
            </div>

            <div className="hidden lg:block relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500/20 to-amber-500/20 blur-3xl opacity-30 animate-pulse"></div>
              <div className="relative bg-slate-900/60 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center">
                    <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-slate-400 font-medium uppercase tracking-wider">Analysis Result</p>
                    <p className="text-xl font-bold text-white">Full Stack Engineer</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-end mb-2">
                      <p className="text-sm font-semibold text-slate-300">ATS Optimization</p>
                      <p className="text-2xl font-black text-cyan-400">92%</p>
                    </div>
                    <div className="h-3 bg-slate-800 rounded-full overflow-hidden border border-white/5">
                      <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 w-[92%]"></div>
                    </div>
                  </div>

                  <div className="p-5 bg-white/5 rounded-2xl border border-white/5">
                    <p className="text-xs text-slate-500 font-bold uppercase mb-3">Predicted Salary @ Google</p>
                    <div className="flex items-center gap-3">
                      <p className="text-2xl font-bold text-amber-400">₹24,50,000</p>
                      <span className="text-xs bg-green-500/20 text-green-400 px-2 py-0.5 rounded-full border border-green-500/20">+ Tier 1 Bonus</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Unleash Your Career Potential</h2>
            <p className="text-lg text-slate-400 max-w-3xl mx-auto leading-relaxed">
              We've replaced the traditional job board with a data-driven career strategist. Stop applying blindly and start optimizing your path.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="bg-slate-900/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-800 hover:border-cyan-500/50 transition-all hover:scale-[1.02] group">
                <div className={`w-14 h-14 bg-gradient-to-br ${feature.accent} rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-cyan-500/10 group-hover:shadow-cyan-500/30 transition-all`}>
                  <svg className="w-7 h-7 text-slate-950" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.icon} />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-slate-400 leading-relaxed">{feature.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-cyan-500/5 blur-3xl"></div>
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center bg-slate-900/40 backdrop-blur-xl border border-slate-800 p-12 rounded-[3rem] shadow-2xl">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Ready to see what you're worth?</h2>
          <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            Join thousands of professionals using ResumeAI to decode the job market and landing roles at Tier 1 companies.
          </p>
          <Link to="/register" className="inline-block bg-white text-slate-950 font-black px-12 py-5 rounded-2xl text-xl hover:bg-cyan-50 transition-all shadow-2xl shadow-cyan-500/10 hover:scale-105">
            Analyze My Resume Now
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
