import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FlaskConical,
  Mail,
  Key,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  Shield,
  Square,
  Circle,
  Triangle,
} from 'lucide-react';
import { useAuth, OWNER_EMAIL } from '../../context/AuthContext';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { signInWithGoogle, signInWithEmail } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithGoogle();
      navigate('/app/dashboard');
    } catch (err: any) {
      setError(err.message || 'Google authentication was cancelled.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await signInWithEmail(email, password);
      const isOwner = email.toLowerCase() === OWNER_EMAIL.toLowerCase();
      navigate(isOwner ? '/superadmin/dashboard' : '/app/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 py-8 sm:py-12 text-stone-900 bg-[#faf9f4]">
      {/* Top Bauhaus Bar Motif */}
      <div className="fixed top-0 inset-x-0 h-1.5 flex bg-stone-900 z-50">
        <div className="w-1/3 bg-amber-400" />
        <div className="w-1/3 bg-emerald-600" />
        <div className="w-1/3 bg-orange-500" />
      </div>

      <div className="w-full max-w-md flex flex-col items-center">
        {/* Bauhaus Geometric Brand Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="flex items-center gap-1.5 mb-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 border-2 border-stone-900 flex items-center justify-center text-white shadow-sm font-mono font-bold">
              <FlaskConical className="w-4 h-4" />
            </div>
            <div className="w-8 h-8 rounded-full bg-amber-400 border-2 border-stone-900 shadow-sm" />
            <div className="w-8 h-8 rounded-r-full bg-orange-500 border-2 border-stone-900 shadow-sm" />
          </div>

          <span className="font-mono text-xs font-black uppercase tracking-widest text-stone-600 mb-1">
            BAUHAUS // FORM FOLLOWS FUNCTION
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 uppercase tracking-tight">
            codeLab Gateway
          </h1>
          <p className="text-xs text-stone-600 max-w-[320px] mt-1 text-center font-medium">
            Sign in to access your hackathon dashboard, teams, and submissions.
          </p>
        </div>

        {/* Main Bauhaus Claymorphism Card */}
        <div className="clay-card p-6 sm:p-8 w-full flex flex-col space-y-5 border-2 border-stone-900">
          {error && (
            <div className="p-3.5 rounded-xl clay-card-orange border-2 border-orange-400 text-orange-950 text-xs flex items-start gap-2 font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-orange-700" />
              <span>{error}</span>
            </div>
          )}

          {/* Primary Clay Google Login */}
          <button
            type="button"
            onClick={handleGoogleSubmit}
            disabled={loading}
            className="clay-btn-google w-full min-h-[48px] py-3.5 px-4 flex items-center justify-center gap-3 text-stone-900 font-black text-xs uppercase tracking-wider cursor-pointer border-2 border-stone-900 hover:-translate-y-0.5 active:translate-y-0.5 transition-all"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
              <path d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z" fill="#EA4335" />
              <path d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5.1 3.7-8.9z" fill="#4285F4" />
              <path d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.8s.2-2.1.4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z" fill="#FBBC05" />
              <path d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z" fill="#34A853" />
            </svg>
            <span>{loading ? 'Synthesizing...' : 'Continue with Google'}</span>
          </button>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t-2 border-stone-200" />
            <span className="flex-shrink mx-3 text-[11px] font-mono font-black uppercase text-stone-500">
              OR EMAIL IDENTITY
            </span>
            <div className="flex-grow border-t-2 border-stone-200" />
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-mono font-black uppercase text-stone-800 mb-1">
                Lab Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-3.5 text-stone-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="analyst@codelab.edu"
                  className="clay-input w-full min-h-[44px] pl-9 pr-3 py-2 text-xs font-mono border-2 border-stone-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono font-black uppercase text-stone-800 mb-1">
                Authorization Key
              </label>
              <div className="relative">
                <Key className="w-4 h-4 absolute left-3 top-3.5 text-stone-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="clay-input w-full min-h-[44px] pl-9 pr-10 py-2 text-xs font-mono border-2 border-stone-900"
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
              disabled={loading}
              className="clay-btn-primary w-full min-h-[48px] py-3 px-4 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 border-2 border-stone-900"
            >
              <span>{loading ? 'Synthesizing...' : 'Authorize Clearance'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-2 text-center text-xs font-mono">
            <Link to="/" className="text-stone-600 hover:text-stone-950 font-bold underline">
              ← Return to Research Manifesto
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
