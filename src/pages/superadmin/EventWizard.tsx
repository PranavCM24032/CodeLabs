import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Calendar,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Layers,
  Users,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { saveEvent, recordAuditLog } from '../../services/firestoreService';
import { HackathonEvent, EventRound, EventStatus } from '../../types';

export const EventWizardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [eligibility, setEligibility] = useState('Open to all developers and university students.');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString().split('T')[0]
  );
  const [submissionDeadline, setSubmissionDeadline] = useState(
    new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString().split('T')[0]
  );
  const [minTeamSize, setMinTeamSize] = useState(2);
  const [maxTeamSize, setMaxTeamSize] = useState(4);
  const [status, setStatus] = useState<EventStatus>('active');

  const handleTitleChange = (val: string) => {
    setTitle(val);
    setSlug(val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !user) return;
    setError('');
    setSubmitting(true);

    try {
      const eventId = `event_${Date.now()}`;
      const rounds: EventRound[] = [
        { id: 'round_1', name: 'Round 1: Architecture & Git Prototype', order: 1, maxMarks: 50, weight: 0.4 },
        { id: 'round_2', name: 'Round 2: Production Deploy & Impact', order: 2, maxMarks: 50, weight: 0.6 },
      ];

      const newEvent: HackathonEvent = {
        id: eventId,
        title: title.trim(),
        slug: slug.trim() || `event-${Date.now()}`,
        description: description.trim(),
        eligibility: eligibility.trim(),
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        submissionDeadline: new Date(submissionDeadline).toISOString(),
        minTeamSize: Number(minTeamSize),
        maxTeamSize: Number(maxTeamSize),
        status,
        rounds,
        createdBy: user.email || 'superadmin',
        createdAt: new Date().toISOString(),
      };

      await saveEvent(newEvent);

      await recordAuditLog({
        actorId: user.uid,
        actorEmail: user.email || '',
        action: 'EVENT_CREATED',
        entityType: 'HackathonEvent',
        entityId: eventId,
        details: `Created new hackathon event: "${newEvent.title}" (${newEvent.status})`,
      });

      navigate('/events');
    } catch (err: any) {
      setError(err.message || 'Failed to create event.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <Link
          to="/superadmin/dashboard"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </Link>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Create Hackathon Event</h1>
        <p className="text-sm text-slate-400 mt-1">
          Configure lifecycle dates, team constraints, challenge parameters, and evaluation rounds.
        </p>
      </div>

      {/* Steps Indicator */}
      <div className="grid grid-cols-4 gap-2 mb-8">
        {[
          { num: 1, label: 'General Info' },
          { num: 2, label: 'Dates & Deadlines' },
          { num: 3, label: 'Team Rules' },
          { num: 4, label: 'Review & Publish' },
        ].map((s) => (
          <div
            key={s.num}
            onClick={() => setStep(s.num as any)}
            className={`p-3 rounded-xl border text-center cursor-pointer transition-all ${
              step === s.num
                ? 'bg-red-500/10 border-red-500 text-white font-bold'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="text-xs">Step {s.num}</span>
            <div className="text-xs font-medium truncate mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-start gap-2.5 text-xs text-red-400">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={step === 4 ? handleFinalSubmit : (e) => { e.preventDefault(); setStep((prev) => Math.min(prev + 1, 4) as any); }}>
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 mb-8">
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-white mb-4">Step 1: Event Details & Branding</h2>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Hackathon Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="e.g. Global Distributed Systems Hackathon 2026"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  URL Slug
                </label>
                <input
                  type="text"
                  required
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-400 font-mono focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Event Description & Theme
                </label>
                <textarea
                  rows={4}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Overview of the challenges, technical expectations, and hackathon mission..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Eligibility Criteria
                </label>
                <input
                  type="text"
                  value={eligibility}
                  onChange={(e) => setEligibility(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-white mb-4">Step 2: Dates & Deadlines</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Start Date
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    End Date
                  </label>
                  <input
                    type="date"
                    required
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Repository Submission & Commit Freeze Deadline
                </label>
                <input
                  type="date"
                  required
                  value={submissionDeadline}
                  onChange={(e) => setSubmissionDeadline(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-red-500"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  After this deadline, participants can no longer submit new commit SHAs.
                </p>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-white mb-4">Step 3: Team Parameters & Capacity</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Minimum Team Size
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    required
                    value={minTeamSize}
                    onChange={(e) => setMinTeamSize(parseInt(e.target.value, 10))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Maximum Team Size
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    required
                    value={maxTeamSize}
                    onChange={(e) => setMaxTeamSize(parseInt(e.target.value, 10))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-5">
              <h2 className="text-lg font-bold text-white mb-4">Step 4: Review & Initial Status</h2>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                <div><span className="text-slate-400">Event Title:</span> <span className="text-white font-bold">{title || 'Untitled'}</span></div>
                <div><span className="text-slate-400">Slug:</span> <span className="font-mono text-slate-300">{slug}</span></div>
                <div><span className="text-slate-400">Team Size:</span> <span className="text-slate-300">{minTeamSize} to {maxTeamSize} members</span></div>
                <div><span className="text-slate-400">Freeze Deadline:</span> <span className="text-amber-400 font-mono">{submissionDeadline}</span></div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Initial Lifecycle State
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {(['draft', 'published', 'active', 'judging', 'completed'] as EventStatus[]).map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setStatus(st)}
                      className={`py-2 px-3 rounded-xl border text-xs capitalize font-semibold transition-all ${
                        status === st
                          ? 'bg-red-600/10 border-red-500 text-red-400 ring-1 ring-red-500/20'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex justify-between items-center">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((prev) => Math.max(prev - 1, 1) as any)}
              className="px-4 py-2.5 rounded-2xl bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Previous
            </button>
          ) : <div />}

          {step < 4 ? (
            <button
              type="button"
              onClick={() => setStep((prev) => Math.min(prev + 1, 4) as any)}
              className="clay-btn-primary px-5 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-1.5"
            >
              Next <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={submitting || !title.trim()}
              className="clay-btn-orange px-6 py-2.5 rounded-2xl text-xs font-black shadow-md flex items-center gap-2 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              {submitting ? 'Creating Event...' : 'Publish Event'}
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
