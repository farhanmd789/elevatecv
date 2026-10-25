import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useState } from 'react'
import toast from 'react-hot-toast'

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    toast.success('Logged out successfully')
    navigate('/')
  }

  const isActive = (path) => location.pathname === path

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm shadow-lg group-hover:scale-110 transition-transform tracking-tight">
              E
            </div>
            <span className="font-display font-extrabold text-lg gradient-text tracking-wider">ELEVATECV</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {isAuthenticated ? (
              <>
                <NavLink to="/dashboard" active={isActive('/dashboard')}>Dashboard</NavLink>
                <NavLink to="/ats-checker" active={isActive('/ats-checker')}>ATS Checker</NavLink>
                <NavLink to="/cover-letter" active={isActive('/cover-letter')}>Cover Letter</NavLink>
              </>
            ) : (
              <>
                <NavLink to="/#features" active={false}>Features</NavLink>
              </>
            )}
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <Link
                  to={`/portfolio/${user?.username}`}
                  className="text-sm text-slate-400 hover:text-white transition-colors"
                >
                  Portfolio
                </Link>
                <div className="w-px h-5 bg-white/10" />
                <span className="text-sm text-slate-300">{user?.name}</span>
                <button onClick={handleLogout} className="btn btn-secondary btn-sm">
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link to="/login" className="btn btn-secondary btn-sm">Login</Link>
                <Link to="/signup" className="btn btn-primary btn-sm">Get Started</Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-all"
            onClick={() => setMenuOpen(!menuOpen)}
            id="mobile-menu-btn"
          >
            <div className="w-5 space-y-1">
              <span className={`block h-0.5 bg-current transition-all ${menuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
              <span className={`block h-0.5 bg-current transition-all ${menuOpen ? 'opacity-0' : ''}`} />
              <span className={`block h-0.5 bg-current transition-all ${menuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
            </div>
          </button>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden py-3 pb-4 border-t border-white/5 animate-fade-in">
            <div className="flex flex-col gap-1">
              {isAuthenticated ? (
                <>
                  <MobileNavLink to="/dashboard" onClick={() => setMenuOpen(false)}>Dashboard</MobileNavLink>
                  <MobileNavLink to="/ats-checker" onClick={() => setMenuOpen(false)}>ATS Checker</MobileNavLink>
                  <MobileNavLink to="/cover-letter" onClick={() => setMenuOpen(false)}>Cover Letter</MobileNavLink>
                  <MobileNavLink to={`/portfolio/${user?.username}`} onClick={() => setMenuOpen(false)}>Portfolio</MobileNavLink>
                  <button onClick={() => { handleLogout(); setMenuOpen(false) }} className="mt-2 btn btn-secondary w-full">Logout</button>
                </>
              ) : (
                <>
                  <MobileNavLink to="/login" onClick={() => setMenuOpen(false)}>Login</MobileNavLink>
                  <Link to="/signup" onClick={() => setMenuOpen(false)} className="btn btn-primary mt-2">Get Started</Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

function NavLink({ to, active, children }) {
  return (
    <Link
      to={to}
      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
        active
          ? 'bg-primary-500/15 text-primary-300'
          : 'text-slate-400 hover:text-white hover:bg-white/5'
      }`}
    >
      {children}
    </Link>
  )
}

function MobileNavLink({ to, onClick, children }) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className="px-3 py-2 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-white/5 transition-all"
    >
      {children}
    </Link>
  )
}
