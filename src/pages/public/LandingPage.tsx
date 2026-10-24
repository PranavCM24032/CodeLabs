import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Terminal,
  Award,
  ArrowRight,
  Shield,
  Lock,
  Mail,
  Key,
  Eye,
  EyeOff,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  Calendar,
  FlaskConical,
  Dna,
  Pipette,
  Atom,
  Circle,
  Square,
  Triangle,
} from 'lucide-react';
import { useAuth, OWNER_EMAIL } from '../../context/AuthContext';
import { getEvents } from '../../services/firestoreService';
import { HackathonEvent } from '../../types';

export const LandingPage: React.FC = () => {
  const { user, profile, role, signInWithGoogle, signInWithEmail, logout } = useAuth();
  const navigate = useNavigate();

  const [events, setEvents] = useState<HackathonEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');

  useEffect(() => {
    getEvents().then((list) => {
      setEvents(list?.slice(0, 2) || []);
      setLoadingEvents(false);
    });
  }, []);

  const handleGoogleLogin = async () => {
    setAuthError('');
    setAuthSuccess('');
    setAuthLoading(true);
    try {
      await signInWithGoogle();
      setAuthSuccess('Welcome! Entering codeLab workspace...');
      setTimeout(() => {
        navigate('/app/dashboard');
      }, 500);
    } catch (err: any) {
      setAuthError(err.message || 'Google sign-in was interrupted. You can also use the Instant Access clearance below.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');
    setAuthLoading(true);
    try {
      await signInWithEmail(email, password);
      const isOwner = email.toLowerCase() === OWNER_EMAIL.toLowerCase();
      setAuthSuccess('Laboratory credentials verified!');
      setTimeout(() => {
        navigate(isOwner ? '/superadmin/dashboard' : '/app/dashboard');
      }, 500);
    } catch (err: any) {
      setAuthError(err.message || 'Invalid email or authorization passkey.');
    } finally {
      setAuthLoading(false);
    }
  };



  return (
    <div className="flex flex-col w-full min-h-screen text-stone-900 bg-[#faf9f4]">
      {/* Top Bauhaus Architectural Motif Bar */}
      <div className="w-full flex h-2 bg-stone-900">
        <div className="w-1/3 bg-amber-400" />
        <div className="w-1/3 bg-emerald-600" />
        <div className="w-1/3 bg-orange-500" />
      </div>

      {/* Hero Section: Bauhaus Geometric Composition */}
      <section className="px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10 pb-12 max-w-6xl mx-auto w-full">
        {/* Main 2-Column Responsive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-14">
          
          {/* Left Column: Form Follows Function - Manifesto & Active Assays */}
          <div className="lg:col-span-7 flex flex-col gap-6 order-2 lg:order-1">
            
            {/* Bauhaus Geometric Kicker */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded-full bg-amber-400 border border-stone-900 shadow-2xs" />
                <div className="w-4 h-4 bg-emerald-600 border border-stone-900 shadow-2xs" />
                <div className="w-4 h-4 rounded-r-full bg-orange-500 border border-stone-900 shadow-2xs" />
              </div>
              <span className="font-mono text-xs uppercase font-black tracking-widest text-stone-900">
                BAUHAUS // FORM FOLLOWS FUNCTION
              </span>
            </div>

            {/* Stark Typographic Headline */}
            <div className="space-y-3">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-stone-900 tracking-tight leading-[1.08] uppercase">
                Build, <br />
                <span className="text-emerald-700 underline decoration-amber-400 decoration-wavy decoration-2">compete</span> &amp; <br />
                win.
              </h1>
              <p className="text-sm sm:text-base text-stone-700 leading-relaxed max-w-xl font-medium">
                codeLab streamlines hackathon evaluations: immutable commit snapshots, automated deadline freezes, and multi-criteria rubric scoring.
              </p>
            </div>

            {/* Geometric Action Block */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              <Link
                to="/events"
                className="clay-btn-primary min-h-[48px] px-6 py-3 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 border-2 border-stone-900"
              >
                <Square className="w-4 h-4 fill-white text-white" />
                <span>Explore Events</span>
              </Link>
              <Link
                to="/leaderboard"
                className="clay-card-yellow min-h-[48px] px-6 py-3 text-xs font-black uppercase tracking-wider text-stone-900 flex items-center justify-center gap-2 border-2 border-stone-900 hover:-translate-y-1 transition-transform"
              >
                <Circle className="w-4 h-4 fill-amber-500 text-amber-600" />
                <span>View Leaderboard</span>
              </Link>
            </div>

            {/* Bauhaus Structural Divider Line */}
            <div className="w-full h-0.5 bg-stone-900/15 my-1" />

            {/* Real Active Hackathons in Geometric Clay Containers */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black font-mono uppercase tracking-wider text-stone-900 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-emerald-600 border border-stone-900" />
                  Active Hackathons
                </span>
                <span className="text-[11px] font-mono text-stone-500 font-bold">REAL FIRESTORE DATA</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {loadingEvents ? (
                  <>
                    <div className="clay-card-yellow p-4 h-28 animate-pulse border-2 border-stone-900" />
                    <div className="clay-card-green p-4 h-28 animate-pulse border-2 border-stone-900" />
                  </>
                ) : events.length > 0 ? (
                  events.map((evt, idx) => (
                    <Link
                      key={evt.id}
                      to={`/app/dashboard?eventId=${evt.id}`}
                      className={`p-4 flex flex-col justify-between gap-3 group border-2 border-stone-900 hover:-translate-y-1 transition-transform ${
                        idx === 0 ? 'clay-card-green' : 'clay-card-orange'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1 text-[11px] font-mono">
                          <span className="font-black text-stone-900 uppercase truncate">
                            {evt.slug}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-white text-stone-900 font-bold border border-stone-900 text-[10px]">
                            {evt.status.toUpperCase()}
                          </span>
                        </div>
                        <h2 className="font-black text-stone-900 text-sm mt-1.5 truncate group-hover:text-emerald-800 transition-colors">
                          {evt.title}
                        </h2>
                      </div>
                      <div className="flex items-center justify-between text-xs text-stone-700 pt-2 border-t border-stone-900/10 font-mono">
                        <span className="flex items-center gap-1.5 text-[11px] font-bold">
                          <Calendar className="w-3.5 h-3.5 text-stone-600" />
                          <span>{new Date(evt.startDate).toLocaleDateString()}</span>
                        </span>
                        <span className="text-emerald-800 font-black flex items-center gap-1 text-[11px] uppercase">
                          Enter <ArrowRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="clay-card p-6 col-span-2 text-center text-xs text-stone-500 font-semibold border-2 border-stone-900">
                    No active hackathons in registry.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: First Screen Google Login Gateway (Bauhaus Claymorphism) */}
          <div className="lg:col-span-5 w-full order-1 lg:order-2">
            <div className="clay-card p-6 sm:p-7 flex flex-col relative border-2 border-stone-900">
              
              {/* Bauhaus Decorative Geometric Header Tab */}
              <div className="flex items-center justify-between mb-5 pb-3 border-b-2 border-stone-900">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 bg-emerald-600 border-2 border-stone-900 rounded-lg flex items-center justify-center text-white shadow-2xs">
                    <Atom className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-black text-stone-900 tracking-tight uppercase font-mono">
                      codeLab Gateway
                    </h2>
                    <p className="text-[11px] font-mono font-bold text-stone-600">
                      SECURE RESEARCH IDENTITY
                    </p>
                  </div>
                </div>

                {/* Semicircle Accent */}
                <div className="w-6 h-6 rounded-t-full bg-amber-400 border border-stone-900" />
              </div>

              {/* Status & Alerts */}
              {authError && (
                <div className="mb-4 p-3 rounded-xl clay-card-orange border-2 border-orange-400 text-orange-950 text-xs flex items-start gap-2 font-semibold">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-orange-700" />
                  <span>{authError}</span>
                </div>
              )}
              {authSuccess && (
                <div className="mb-4 p-3 rounded-xl clay-card-green border-2 border-emerald-400 text-emerald-950 text-xs flex items-start gap-2 font-semibold">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-700" />
                  <span>{authSuccess}</span>
                </div>
              )}

              {/* Authenticated State */}
              {user ? (
                <div className="clay-card-green p-5 flex flex-col gap-4 text-stone-800 border-2 border-stone-900">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-emerald-700 text-white flex items-center justify-center font-black text-base border-2 border-stone-900 shadow-sm shrink-0">
                      {(profile?.displayName || user.email || 'U')[0].toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] font-black text-emerald-900 uppercase font-mono tracking-wider">
                        AUTHENTICATED IDENTITY
                      </div>
                      <div className="font-black text-stone-900 text-sm truncate">
                        {profile?.displayName || user.email}
                      </div>
                      <div className="text-xs text-stone-600 font-mono mt-0.5">
                        Role: <span className="font-black text-amber-900 uppercase">{role}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 pt-2 border-t border-emerald-300">
                    <Link
                      to={
                        role === 'superadmin'
                          ? '/superadmin/dashboard'
                          : role === 'admin'
                          ? '/admin/judging'
                          : '/app/dashboard'
                      }
                      className="clay-btn-primary min-h-[44px] py-2.5 px-4 text-xs font-black uppercase tracking-wider text-center flex items-center justify-center gap-2 border-2 border-stone-900"
                    >
                      <span>
                        Enter {role === 'superadmin' ? 'Admin Console' : role === 'admin' ? 'Judging Queue' : 'Dashboard'}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => logout()}
                      className="text-xs text-stone-600 hover:text-stone-900 py-1.5 text-center font-bold font-mono transition-colors min-h-[44px] flex items-center justify-center"
                    >
                      Sign out / Switch account
                    </button>
                  </div>
                </div>
              ) : (
                /* Unauthenticated State: Primary Google Sign-in */
                <div className="flex flex-col gap-4">
                  {/* Primary Google Button */}
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={authLoading}
                    className="clay-btn-google w-full min-h-[48px] py-3.5 px-4 flex items-center justify-center gap-3 text-stone-900 font-black text-xs uppercase tracking-wider cursor-pointer border-2 border-stone-900 hover:-translate-y-0.5 active:translate-y-0.5 transition-all"
                  >
                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        fill="#EA4335"
                      />
                    </svg>
                    <span>{authLoading ? 'Verifying with Google...' : 'Continue with Google'}</span>
                  </button>

                  {/* Academic Email Form Accordion */}
                  <div className="border-t-2 border-stone-200 pt-3">
                    <button
                      type="button"
                      onClick={() => setShowEmailForm(!showEmailForm)}
                      className="w-full min-h-[44px] flex items-center justify-between text-xs text-stone-700 hover:text-stone-900 font-bold uppercase font-mono py-1 transition-colors"
                    >
                      <span>Academic Email Credentials</span>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${
                          showEmailForm ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {showEmailForm && (
                      <form onSubmit={handleEmailSubmit} className="mt-3 flex flex-col gap-3">
                        <div>
                          <label className="text-[11px] font-black text-stone-800 block mb-1 uppercase font-mono">
                            Academic Email
                          </label>
                          <div className="relative">
                            <Mail className="w-4 h-4 absolute left-3 top-3 text-stone-500" />
                            <input
                              type="email"
                              required
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="clay-input w-full min-h-[44px] pl-9 pr-3 py-2 text-xs font-mono border-2 border-stone-900"
                              placeholder="analyst@codelab.edu"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[11px] font-black text-stone-800 block mb-1 uppercase font-mono">
                            Password
                          </label>
                          <div className="relative">
                            <Key className="w-4 h-4 absolute left-3 top-3 text-stone-500" />
                            <input
                              type={showPassword ? 'text' : 'password'}
                              required
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              className="clay-input w-full min-h-[44px] pl-9 pr-10 py-2 text-xs font-mono border-2 border-stone-900"
                              placeholder="••••••••••••"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-3 text-stone-500 hover:text-stone-800 min-h-[32px] min-w-[32px] flex items-center justify-center"
                              aria-label="Toggle password visibility"
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={authLoading}
                          className="clay-btn-orange min-h-[44px] py-2.5 px-4 text-xs font-black uppercase tracking-wider text-center border-2 border-stone-900 mt-1"
                        >
                          {authLoading ? 'Signing in...' : 'Sign In with Email'}
                        </button>
                      </form>
                    )}
                  </div>
                </div>
              )}

              {/* Minimal Security Footnote */}
              <div className="mt-4 pt-3 border-t-2 border-stone-200 flex items-center justify-between text-[11px] text-stone-500 font-mono font-bold">
                <span className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Secure Platform</span>
                </span>
                <span className="text-emerald-800">ENCRYPTED</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3-Step Bauhaus Geometric Assay Pipeline (Circle -> Semicircle -> Rectangle) */}
        <div className="pt-6 border-t-2 border-stone-900">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-8">
            <div>
              <span className="font-mono text-xs uppercase font-black text-amber-700 tracking-widest">
                GEOMETRIC ARCHITECTURE
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight uppercase">
                The 3-Stage Evaluation Pipeline
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-stone-600 font-mono font-semibold max-w-sm">
              Form follows function: project submission, deadline freeze, and multi-criteria scoring.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1: Circle (Mint Green) */}
            <div className="clay-card-green p-6 flex flex-col justify-between gap-4 border-2 border-stone-900">
              <div>
                <div className="flex items-center justify-between mb-4">
                  {/* Geometric Shape: Circle */}
                  <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center font-black text-base border-2 border-stone-900 shadow-sm font-mono">
                    01
                  </div>
                  <span className="text-[10px] font-mono font-black uppercase tracking-widest px-2 py-0.5 bg-white border border-stone-900 rounded-full text-stone-900">
                    CIRCLE
                  </span>
                </div>
                <h3 className="font-black text-stone-900 text-base uppercase font-mono">
                  Project Submission
                </h3>
                <p className="text-xs text-stone-700 leading-relaxed font-medium mt-1">
                  Connect your Git repository. Commit history and author contributions are recorded automatically without manual intervention.
                </p>
              </div>

              <div className="pt-3 border-t border-stone-900/10 flex items-center justify-between text-xs font-mono font-bold text-emerald-900">
                <span>STAGE 01</span>
                <span>INSPECTION</span>
              </div>
            </div>

            {/* Step 2: Semicircle (Citron Yellow) */}
            <div className="clay-card-yellow p-6 flex flex-col justify-between gap-4 border-2 border-stone-900">
              <div>
                <div className="flex items-center justify-between mb-4">
                  {/* Geometric Shape: Semicircle Top */}
                  <div className="w-12 h-12 rounded-t-full bg-amber-400 text-stone-900 flex items-center justify-center font-black text-base border-2 border-stone-900 shadow-sm font-mono pt-1">
                    02
                  </div>
                  <span className="text-[10px] font-mono font-black uppercase tracking-widest px-2 py-0.5 bg-white border border-stone-900 rounded-full text-stone-900">
                    SEMICIRCLE
                  </span>
                </div>
                <h3 className="font-black text-stone-900 text-base uppercase font-mono">
                  Deadline Freeze
                </h3>
                <p className="text-xs text-stone-700 leading-relaxed font-medium mt-1">
                  At the deadline, commit HEAD SHAs are permanently sealed. Post-deadline code changes are automatically blocked.
                </p>
              </div>

              <div className="pt-3 border-t border-stone-900/10 flex items-center justify-between text-xs font-mono font-bold text-amber-900">
                <span>STAGE 02</span>
                <span>IMMUTABLE LOCK</span>
              </div>
            </div>

            {/* Step 3: Rectangle (Accent Orange) */}
            <div className="clay-card-orange p-6 flex flex-col justify-between gap-4 border-2 border-stone-900">
              <div>
                <div className="flex items-center justify-between mb-4">
                  {/* Geometric Shape: Square / Rectangle */}
                  <div className="w-12 h-12 rounded-lg bg-orange-500 text-white flex items-center justify-center font-black text-base border-2 border-stone-900 shadow-sm font-mono">
                    03
                  </div>
                  <span className="text-[10px] font-mono font-black uppercase tracking-widest px-2 py-0.5 bg-white border border-stone-900 rounded-full text-stone-900">
                    RECTANGLE
                  </span>
                </div>
                <h3 className="font-black text-stone-900 text-base uppercase font-mono">
                  Judging & Results
                </h3>
                <p className="text-xs text-stone-700 leading-relaxed font-medium mt-1">
                  Multi-criteria rubrics are evaluated by authorized judges with normalized score distributions and verified leaderboard release.
                </p>
              </div>

              <div className="pt-3 border-t border-stone-900/10 flex items-center justify-between text-xs font-mono font-bold text-orange-950">
                <span>STAGE 03</span>
                <span>STANDINGS RELEASE</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bauhaus Architectural Footer */}
      <footer className="mt-auto border-t-2 border-stone-900 bg-white px-4 sm:px-6 lg:px-8 py-6 text-xs text-stone-600">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3 font-mono">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-amber-400 border border-stone-900" />
              <div className="w-3 h-3 rounded-full bg-emerald-600 border border-stone-900" />
              <div className="w-3 h-3 rounded-r-full bg-orange-500 border border-stone-900" />
            </div>
            <span className="font-black text-stone-900 uppercase">codeLab</span>
            <span className="text-stone-400">·</span>
            <span className="font-bold text-stone-600">Bauhaus Claymorphism Edition</span>
          </div>
          <div className="flex items-center gap-6 font-mono font-bold uppercase text-[11px]">
            <Link to="/events" className="hover:text-emerald-700 transition-colors">Events</Link>
            <Link to="/leaderboard" className="hover:text-emerald-700 transition-colors">Leaderboard</Link>
            <Link to="/login" className="hover:text-emerald-700 transition-colors">Login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
