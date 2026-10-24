import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  GitBranch,
  Copy,
  Check,
  Rocket,
  Users,
  Code2,
  Activity,
  Layers,
  ArrowRight,
  FlaskConical,
  Dna,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  getEvents,
  getTeamsForEvent,
  getSubmissionForTeam,
  getProblemsForEvent,
} from '../../services/firestoreService';
import { HackathonEvent, Team, Submission, ProblemStatement } from '../../types';

export const ParticipantDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeEvent, setActiveEvent] = useState<HackathonEvent | null>(null);
  const [userTeam, setUserTeam] = useState<Team | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [problem, setProblem] = useState<ProblemStatement | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedSha, setCopiedSha] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const events = await getEvents();
        if (events && events.length > 0) {
          const evt = events[0];
          setActiveEvent(evt);

          const teams = await getTeamsForEvent(evt.id);
          const found = teams.find(
            (t) =>
              t.leaderId === user?.uid ||
              t.members?.some((m) => m.userId === user?.uid)
          );

          if (found) {
            setUserTeam(found);
            const sub = await getSubmissionForTeam(evt.id, found.id);
            setSubmission(sub);

            if (found.problemId) {
              const problems = await getProblemsForEvent(evt.id);
              const p = problems.find((pr) => pr.id === found.problemId);
              if (p) setProblem(p);
            }
          }
        }
      } catch (err) {
        console.error('Participant dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  const handleCopySha = (sha: string) => {
    navigator.clipboard.writeText(sha);
    setCopiedSha(true);
    setTimeout(() => setCopiedSha(false), 2000);
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center text-stone-600">
        <div className="w-10 h-10 border-4 border-amber-500/20 border-t-emerald-600 rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs font-semibold text-stone-700">Loading codeLab workbench clearances...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full px-4 sm:px-6 lg:px-8 py-8 max-w-5xl mx-auto gap-6 text-stone-800">
      {/* 1. Active Event Context Banner */}
      <section className="clay-card-yellow p-6 sm:p-7 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-amber-200">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-amber-900">
              codeLab Synthesis Workbench
            </span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-200/80 text-amber-950 font-mono text-[11px] font-bold border border-amber-300">
            <span>EVENT: {activeEvent?.title || 'Active Hackathon'}</span>
          </div>
        </div>

        <div className="mt-5 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
              Chemical Code Forensics Laboratory
            </h1>
            <p className="text-xs sm:text-sm text-stone-700 mt-1 max-w-xl leading-relaxed">
              Track your squad's specimen commit cadence, lock immutable git SHAs before catalytic freeze, and view multi-reagent scoring status.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              to="/app/submissions"
              className="clay-btn-orange py-3 px-5 rounded-2xl text-xs font-black flex items-center gap-2 shadow-md"
            >
              <Rocket className="w-4 h-4" />
              <span>{submission ? 'View Sealed Specimen' : 'Freeze & Submit SHA'}</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 2. Quick Status Matrix (2x2 Grid) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Active Squad */}
        <div className="clay-card p-5">
          <div className="flex items-center justify-between text-xs font-bold text-stone-600 mb-1">
            <span>Enrolled Squad</span>
            <Users className="w-4 h-4 text-amber-700" />
          </div>
          <div className="mt-2">
            <div className="font-black text-base text-stone-900 truncate">
              {userTeam?.name || 'No Squad Formed'}
            </div>
            <div className="font-mono text-xs text-stone-500 mt-0.5 font-semibold">
              {userTeam ? `${userTeam.members.length} researchers` : 'Join or create squad'}
            </div>
          </div>
        </div>

        {/* Target Track */}
        <div className="clay-card p-5">
          <div className="flex items-center justify-between text-xs font-bold text-stone-600 mb-1">
            <span>Challenge Track</span>
            <Code2 className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="mt-2">
            <div className="font-black text-base text-stone-900 truncate">
              {problem?.track || (userTeam?.problemId ? 'Track Claimed' : 'Unassigned')}
            </div>
            <div className="font-mono text-xs text-stone-500 mt-0.5 font-semibold">
              {problem ? problem.code : 'Browse challenge specs'}
            </div>
          </div>
        </div>

        {/* Specimen Conduit */}
        <div className="clay-card-green p-5">
          <div className="flex items-center justify-between text-xs font-bold text-emerald-900 mb-1">
            <span>Repository Conduit</span>
            <GitBranch className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="mt-2">
            <div className="font-black text-base text-emerald-950 truncate">
              {submission?.repoUrl ? 'Conduit Linked' : 'Awaiting Link'}
            </div>
            <div className="font-mono text-xs text-emerald-800 mt-0.5 font-semibold truncate">
              {submission?.branch ? `Branch: ${submission.branch}` : 'git repository hook'}
            </div>
          </div>
        </div>

        {/* Catalytic Freeze Status */}
        <div className="clay-card-orange p-5">
          <div className="flex items-center justify-between text-xs font-bold text-orange-900 mb-1">
            <span>Freeze Status</span>
            <ShieldCheck className="w-4 h-4 text-orange-700" />
          </div>
          <div className="mt-2">
            <div className="font-black text-base text-orange-950 truncate">
              {submission?.frozenCommitSha ? 'Specimen Sealed' : 'Draft Intake'}
            </div>
            <div className="font-mono text-xs text-orange-800 mt-0.5 font-semibold">
              {submission?.frozenCommitSha ? 'SHA locked for review' : 'Ready to freeze'}
            </div>
          </div>
        </div>
      </section>

      {/* 3. Problem Statement & Research Spec */}
      {problem ? (
        <section className="clay-card p-6 flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-mono text-xs font-black px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 border border-amber-300">
              {problem.code}
            </span>
            <span className="clay-pill bg-emerald-100 text-emerald-800 border-emerald-200 text-[10px]">
              Assigned to Squad
            </span>
          </div>
          <h2 className="font-black text-lg text-stone-900 mt-1">
            {problem.title}
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
            {problem.summary}
          </p>
          <div className="p-3.5 rounded-xl bg-stone-100/90 border border-stone-200 text-xs text-stone-700 font-mono">
            <span className="font-bold text-stone-800 block mb-1">Research Scope & Benchmarks:</span>
            <p className="text-[11px] leading-relaxed text-stone-600 line-clamp-3">
              {problem.description}
            </p>
          </div>
        </section>
      ) : (
        <section className="clay-card-yellow p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-200/90 border border-amber-300 flex items-center justify-center text-amber-900 shrink-0">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-stone-900 text-sm">Select Your Chemical Research Track</h3>
              <p className="text-xs text-stone-600 mt-0.5">
                Review available challenge statements and lock a track for your specimen squad.
              </p>
            </div>
          </div>
          <Link
            to="/app/problems"
            className="clay-btn-primary px-4 py-2.5 rounded-xl text-xs font-bold shrink-0"
          >
            Browse Tracks <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </section>
      )}

      {/* 4. Submission & Immutable SHA Lock Card */}
      {submission && (
        <section className="clay-card-green p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-700" />
              <h3 className="font-black text-sm sm:text-base text-emerald-950">
                Sealed Commit Specimen
              </h3>
            </div>
            <span className="clay-pill bg-emerald-200 text-emerald-900 border-emerald-300 text-[10px]">
              FROZEN &amp; SEALED
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-white/80 border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex flex-col min-w-0">
              <span className="font-mono text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                FROZEN HEAD COMMIT SHA
              </span>
              <span className="font-mono text-sm font-black text-emerald-950 truncate">
                {submission.frozenCommitSha}
              </span>
              <span className="font-mono text-[11px] text-stone-500 mt-1 truncate">
                Repo: {submission.repoUrl} ({submission.branch})
              </span>
            </div>

            <button
              onClick={() => handleCopySha(submission.frozenCommitSha)}
              className="clay-btn-yellow px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0"
            >
              {copiedSha ? (
                <>
                  <Check className="w-4 h-4 text-emerald-700" />
                  <span>SHA Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-amber-800" />
                  <span>Copy SHA</span>
                </>
              )}
            </button>
          </div>
        </section>
      )}

      {/* 5. Real Squad Roster */}
      <section className="clay-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-700" />
            <h3 className="font-black text-sm sm:text-base text-stone-900">
              Squad Roster {userTeam ? `(${userTeam.name})` : ''}
            </h3>
          </div>
          {userTeam && (
            <Link
              to="/app/teams"
              className="text-xs font-bold text-amber-800 hover:text-amber-900 flex items-center gap-1"
            >
              <span>Manage Roster</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {userTeam ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {userTeam.members.map((m) => {
              const isCurrent = m.userId === user?.uid;
              const isLeader = m.role === 'leader';

              return (
                <div
                  key={m.userId}
                  className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-amber-200 text-amber-900 border border-amber-300 flex items-center justify-center font-black text-xs shrink-0">
                      {m.displayName ? m.displayName.slice(0, 2).toUpperCase() : 'CO'}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-stone-900 truncate">
                          {m.displayName || 'Researcher'}
                        </span>
                        {isCurrent && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                            You
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-stone-500 font-mono truncate block">
                        {m.email}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${
                      isLeader
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-stone-200 text-stone-700'
                    }`}
                  >
                    {m.role}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-6 rounded-2xl bg-amber-50/80 border border-amber-200 text-center space-y-3">
            <p className="text-xs text-amber-900 font-semibold">
              You are not currently enrolled in a laboratory squad.
            </p>
            <Link
              to="/app/teams"
              className="clay-btn-orange inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold"
            >
              <Users className="w-4 h-4" /> Form or Join Squad
            </Link>
          </div>
        )}
      </section>

      {/* 6. Four-Stage Chemical Synthesis Timeline */}
      <section className="clay-card-yellow p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-amber-800" />
            <h3 className="font-black text-sm sm:text-base text-stone-900">
              codeLab Synthesis Pipeline
            </h3>
          </div>
          <span className="font-mono text-[11px] font-bold text-amber-900">4-Stage Assay</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-2xl bg-white/70 border border-amber-200/80 flex flex-col justify-between">
            <div>
              <span className="font-mono text-[10px] font-black text-amber-800">STAGE 01</span>
              <h4 className="font-bold text-xs text-stone-900 mt-0.5">Specimen Intake</h4>
              <p className="text-[11px] text-stone-600 mt-1">Form squad, enroll in challenge track, and link git conduit.</p>
            </div>
            <div className="mt-3">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${userTeam ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-stone-200 text-stone-700'}`}>
                {userTeam ? 'Complete' : 'Pending'}
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/70 border border-amber-200/80 flex flex-col justify-between">
            <div>
              <span className="font-mono text-[10px] font-black text-amber-800">STAGE 02</span>
              <h4 className="font-bold text-xs text-stone-900 mt-0.5">Catalytic Freeze</h4>
              <p className="text-[11px] text-stone-600 mt-1">Lock immutable commit SHA to halt further specimen alterations.</p>
            </div>
            <div className="mt-3">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${submission?.frozenCommitSha ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-amber-100 text-amber-800 border border-amber-200'}`}>
                {submission?.frozenCommitSha ? 'Frozen' : 'Open'}
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/70 border border-amber-200/80 flex flex-col justify-between">
            <div>
              <span className="font-mono text-[10px] font-black text-amber-800">STAGE 03</span>
              <h4 className="font-bold text-xs text-stone-900 mt-0.5">Reagent Evaluation</h4>
              <p className="text-[11px] text-stone-600 mt-1">Forensic analysts inspect chromatography and apply rubric assays.</p>
            </div>
            <div className="mt-3">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                In Review
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/70 border border-amber-200/80 flex flex-col justify-between">
            <div>
              <span className="font-mono text-[10px] font-black text-amber-800">STAGE 04</span>
              <h4 className="font-bold text-xs text-stone-900 mt-0.5">Synthesis Release</h4>
              <p className="text-[11px] text-stone-600 mt-1">Standings published to public leaderboard with sealed certificates.</p>
            </div>
            <div className="mt-3">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-200 text-stone-700">
                {activeEvent?.status === 'completed' ? 'Published' : 'Sealed'}
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
