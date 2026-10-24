import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Terminal,
  ShieldCheck,
  AlertCircle,
  Eye,
  EyeOff,
  User,
  Mail,
  Key,
  GitBranch,
  ArrowRight,
  Shield,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const RegisterPage: React.FC = () => {
  const { registerWithEmail, user } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('Aarav Sharma');
  const [email, setEmail] = useState('aarav.s@campus.edu');
  const [githubHandle, setGithubHandle] = useState('@aarav-dev');
  const [password, setPassword] = useState('Forensic#Secure2025!');
  const [confirmPassword, setConfirmPassword] = useState('Forensic#Secure2025!');
  const [showPass, setShowPass] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) {
    navigate('/app/dashboard', { replace: true });
  }

  // Password entropy calculation
  const getEntropy = (pass: string) => {
    let score = 0;
    if (pass.length >= 6) score++;
    if (pass.length >= 12) score++;
    if (/[0-9]/.test(pass) && /[a-zA-Z]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const entropyScore = getEntropy(password);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!termsAccepted) {
      setError('You must accept the GitTrack Anti-Plagiarism terms to proceed.');
      return;
    }

    setLoading(true);
    try {
      await registerWithEmail(email, password, name);
      navigate('/app/dashboard');
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface text-on-surface flex flex-col justify-center items-center px-4 py-12">
      <div className="w-full max-w-md flex flex-col items-center">
        {/* Onboarding Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="relative mb-3 flex items-center justify-center">
            <div className="w-12 h-12 rounded-xl bg-surface-container-high flex items-center justify-center shadow-md border border-outline-variant/30">
              <Terminal className="text-primary w-6 h-6" />
            </div>
            <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-secondary flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-on-secondary" />
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-low mb-2 border border-outline-variant/20">
            <ShieldCheck className="text-secondary w-3.5 h-3.5" />
            <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-wider">
              GitTrack Onboarding
            </span>
          </div>

          <h1 className="text-2xl font-bold text-on-surface tracking-tight">
            Create Participant Account
          </h1>
          <p className="text-xs text-on-surface-variant mt-1 max-w-[320px]">
            Join college hackathons, create teams, and submit your git repositories for fair evaluation.
          </p>
        </div>

        {/* Default Account Level Notice */}
        <div className="bg-surface-container-low rounded-xl p-3.5 mb-5 flex items-start gap-3 shadow-sm border border-outline-variant/20 w-full">
          <div className="w-7 h-7 rounded-lg bg-surface-container-highest flex items-center justify-center shrink-0 mt-0.5 text-tertiary">
            <Shield className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="font-mono text-[10px] text-tertiary uppercase tracking-wider font-semibold">
              Default Account Level: Participant
            </span>
            <span className="text-[11px] text-on-surface-variant mt-0.5 leading-relaxed">
              Admin and judging rights are strictly assigned per-event by hackathon superadmins.
            </span>
          </div>
        </div>

        {/* Registration Card */}
        <div className="w-full bg-surface-container rounded-2xl p-6 sm:p-7 shadow-2xl border border-outline-variant/30">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-error-container/30 border border-error/30 text-error text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="font-mono text-[10px] text-on-surface-variant flex items-center justify-between">
                <span>FULL NAME</span>
                <span className="text-error text-xs">*</span>
              </label>
              <div className="relative flex items-center">
                <User className="absolute left-3 text-outline w-4 h-4" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Aarav Sharma"
                  className="w-full bg-surface-container-lowest text-on-surface placeholder:text-outline font-sans text-xs pl-10 pr-3 py-2.5 rounded-xl focus:outline-none focus:bg-surface-container transition-colors border border-outline-variant/30"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-mono text-[10px] text-on-surface-variant flex items-center justify-between">
                <span>COLLEGE / ORG EMAIL</span>
                <span className="text-error text-xs">*</span>
              </label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3 text-outline w-4 h-4" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="aarav.s@campus.edu"
                  className="w-full bg-surface-container-lowest text-on-surface placeholder:text-outline font-mono text-xs pl-10 pr-3 py-2.5 rounded-xl focus:outline-none focus:bg-surface-container transition-colors border border-outline-variant/30"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <label className="font-mono text-[10px] text-on-surface-variant">GITHUB IDENTIFIER</label>
                <span className="font-mono text-[9px] text-secondary font-semibold">RECOMMENDED</span>
              </div>
              <div className="relative flex items-center">
                <GitBranch className="absolute left-3 text-outline w-4 h-4" />
                <input
                  type="text"
                  value={githubHandle}
                  onChange={(e) => setGithubHandle(e.target.value)}
                  placeholder="@handle or github.com/username"
                  className="w-full bg-surface-container-lowest text-on-surface placeholder:text-outline font-mono text-xs pl-10 pr-3 py-2.5 rounded-xl focus:outline-none focus:bg-surface-container transition-colors border border-outline-variant/30"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <label className="font-mono text-[10px] text-on-surface-variant flex items-center justify-between">
                <span>PASSWORD</span>
                <span className="text-error text-xs">*</span>
              </label>
              <div className="relative flex items-center">
                <Key className="absolute left-3 text-outline w-4 h-4" />
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 12 characters"
                  className="w-full bg-surface-container-lowest text-on-surface placeholder:text-outline font-mono text-xs pl-10 pr-10 py-2.5 rounded-xl focus:outline-none focus:bg-surface-container transition-colors border border-outline-variant/30"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 text-outline hover:text-on-surface"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* 4-Bar Entropy Meter */}
              <div className="mt-2 bg-surface-container-lowest rounded-lg p-2.5 flex flex-col gap-1.5 border border-outline-variant/20">
                <div className="flex items-center justify-between font-mono text-[10px]">
                  <span className="text-on-surface-variant">Entropy Rating</span>
                  <span className={entropyScore >= 3 ? 'text-secondary' : 'text-tertiary'}>
                    {entropyScore >= 4 ? 'Strong: 12+ chars, symbols' : 'Valid Passphrase'}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden flex gap-1">
                  <div className={`h-full flex-1 rounded-full ${entropyScore >= 1 ? 'bg-secondary' : 'bg-surface-container-high'}`} />
                  <div className={`h-full flex-1 rounded-full ${entropyScore >= 2 ? 'bg-secondary' : 'bg-surface-container-high'}`} />
                  <div className={`h-full flex-1 rounded-full ${entropyScore >= 3 ? 'bg-secondary' : 'bg-surface-container-high'}`} />
                  <div className={`h-full flex-1 rounded-full ${entropyScore >= 4 ? 'bg-secondary' : 'bg-surface-container-high'}`} />
                </div>
              </div>
            </div>

            {/* Terms checkbox */}
            <div className="bg-surface-container-lowest rounded-xl p-3 border border-outline-variant/20 mt-1">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  required
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded bg-surface-container text-primary accent-primary cursor-pointer shrink-0"
                />
                <span className="text-[11px] text-on-surface-variant leading-relaxed">
                  I agree to the <strong className="text-primary">GitTrack Code of Conduct</strong>,{' '}
                  <strong className="text-on-surface">Anti-Plagiarism Directive</strong>, and commit forensics verification terms for all automated evaluation pipelines.
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-secondary-container text-on-secondary hover:bg-secondary hover:text-on-secondary rounded-xl font-sans text-xs font-bold flex items-center justify-center gap-2 shadow-md active:scale-[0.99] transition-all mt-1"
            >
              <span>{loading ? 'Creating Node...' : 'Create Participant Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Footer */}
        <div className="mt-6 flex flex-col items-center gap-3 text-center">
          <div className="text-xs text-on-surface-variant">
            Already registered?{' '}
            <Link to="/login" className="text-primary font-semibold hover:underline">
              Sign In
            </Link>
          </div>
          <div className="flex items-center gap-2 text-outline font-mono text-[10px]">
            <span className="w-1.5 h-1.5 rounded-full bg-outline-variant" />
            <span>SHA-256 Verified Onboarding</span>
            <span className="w-1.5 h-1.5 rounded-full bg-outline-variant" />
          </div>
        </div>
      </div>
    </div>
  );
};
