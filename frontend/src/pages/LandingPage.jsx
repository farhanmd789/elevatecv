import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const features = [
  {
    icon: '🤖',
    title: 'AI-Powered Writing',
    desc: 'Gemini AI generates professional summaries, rewrites descriptions with action verbs, and crafts ATS-optimized content instantly.',
  },
  {
    icon: '📊',
    title: 'ATS Score Checker',
    desc: 'Compare your resume against job descriptions. Get a score, missing keywords, and actionable improvement tips.',
  },
  {
    icon: '🎨',
    title: 'Beautiful Templates',
    desc: 'Choose from Classic, Modern, and Minimal templates. Customize colors and fonts to match your personal brand.',
  },
  {
    icon: '⚡',
    title: 'Live Preview',
    desc: 'See your resume update in real-time as you type. Split-view editor with instant rendering.',
  },
  {
    icon: '📄',
    title: 'PDF Export',
    desc: 'Download a print-ready, A4 PDF with selectable text — no screenshots or blurry exports.',
  },
  {
    icon: '🌐',
    title: 'Public Portfolio',
    desc: 'Generate a shareable public portfolio page from your resume data. Toggle visibility anytime.',
  },
]

const steps = [
  { num: '01', title: 'Create an Account', desc: 'Sign up in seconds, no credit card required.' },
  { num: '02', title: 'Fill Your Resume', desc: 'Use our multi-step form to enter your details.' },
  { num: '03', title: 'Polish with AI', desc: 'Let Gemini AI enhance your content instantly.' },
  { num: '04', title: 'Download & Apply', desc: 'Export a perfect PDF and land your dream job.' },
]

export default function LandingPage() {
  const { isAuthenticated } = useAuth()

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-600/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-600/15 rounded-full blur-3xl" />
          <div className="absolute top-0 right-1/3 w-64 h-64 bg-cyan-600/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 badge badge-primary mb-8 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-primary-400 animate-pulse" />
            Powered by Google Gemini AI
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-extrabold leading-tight mb-6 animate-fade-in">
            Build Your{' '}
            <span className="gradient-text">Dream Resume</span>
            <br />
            with AI
          </h1>

          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in">
            ELEVATECV uses Google Gemini to generate ATS-optimized content, score your resume against job descriptions,
            and help you land more interviews — all in minutes.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in">
            {isAuthenticated ? (
              <Link to="/dashboard" className="btn btn-primary btn-lg glow-sm">
                Go to Dashboard →
              </Link>
            ) : (
              <>
                <Link to="/signup" className="btn btn-primary btn-lg glow-sm">
                  Start Building Free
                </Link>
                <Link to="/login" className="btn btn-secondary btn-lg">
                  Sign In
                </Link>
              </>
            )}
          </div>

          {/* Stats */}
          <div className="flex flex-wrap items-center justify-center gap-8 mt-16 pt-8 border-t border-white/5 animate-fade-in">
            {[['5 AI Features', 'Summary, Improve, Generate, ATS, Cover Letter'], ['3 Templates', 'Classic, Modern, Minimal'], ['PDF Export', 'Print-ready, A4 format']].map(([title, desc]) => (
              <div key={title} className="text-center">
                <div className="text-lg font-bold text-white">{title}</div>
                <div className="text-sm text-slate-500">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display font-bold mb-4">
              Everything You Need to{' '}
              <span className="gradient-text">Get Hired</span>
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              A complete toolkit for building, optimizing, and sharing your professional resume.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div
                key={f.title}
                className="card group hover:border-primary-500/40 hover:-translate-y-1 transition-all duration-300"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-display font-bold mb-4">
              From Zero to <span className="gradient-text">Interview</span> in Minutes
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <div key={s.num} className="relative">
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-primary-500/40 to-transparent z-10" />
                )}
                <div className="card text-center hover:border-primary-500/40 transition-all">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500/20 to-violet-500/20 border border-primary-500/30 flex items-center justify-center mx-auto mb-4">
                    <span className="text-primary-400 font-bold text-lg">{s.num}</span>
                  </div>
                  <h3 className="font-semibold text-white mb-2">{s.title}</h3>
                  <p className="text-slate-400 text-sm">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="card relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-600/20 to-violet-600/10" />
            <div className="relative z-10 py-8">
              <h2 className="text-4xl font-display font-bold mb-4">
                Ready to Land Your <span className="gradient-text">Dream Job?</span>
              </h2>
              <p className="text-slate-400 mb-8">
                Join thousands of professionals building ATS-optimized resumes with AI.
              </p>
              <Link to="/signup" className="btn btn-primary btn-lg animate-pulse-glow">
                Build My Resume — It's Free
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center text-white font-bold text-xs">E</div>
            <span className="font-display font-bold gradient-text">ELEVATECV</span>
          </div>
          <p className="text-slate-500 text-sm">© 2026 ELEVATECV. Built with Google Gemini AI.</p>
        </div>
      </footer>
    </div>
  )
}
