import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FlaskConical,
  Award,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Download,
  Copy,
  Check,
  ArrowRight,
  ExternalLink,
  Layers,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  getEvents,
  getTeamsForEvent,
  getSubmissionForTeam,
  getEvaluationsForEvent,
} from '../../services/firestoreService';
import { HackathonEvent, Team, Submission, Evaluation } from '../../types';

export const ParticipantResultsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeEvent, setActiveEvent] = useState<HackathonEvent | null>(null);
  const [userTeam, setUserTeam] = useState<Team | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
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
            const [sub, evals] = await Promise.all([
              getSubmissionForTeam(evt.id, found.id),
              getEvaluationsForEvent(evt.id),
            ]);
            setSubmission(sub);
            const teamEval = evals.find((e) => e.teamId === found.id);
            setEvaluation(teamEval || null);
          }
        }
      } catch (err) {
        console.error('Failed to load participant results:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  const handleCopySha = (sha: string) => {
    navigator.clipboard?.writeText(sha);
    setCopiedSha(true);
    setTimeout(() => setCopiedSha(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-stone-600">
        <div className="w-10 h-10 border-4 border-amber-500/20 border-t-emerald-600 rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs font-semibold text-stone-700">Synthesizing laboratory results and rubric assays...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Event Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-mono text-[11px] font-bold mb-2 shadow-xs">
          <FlaskConical className="w-3.5 h-3.5 text-amber-700" />
          <span>codeLab Assays & Results</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
              My Marks
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 mt-1">
              {activeEvent?.title || 'Active Hackathon'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/leaderboard"
              className="clay-btn-yellow px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-1.5"
            >
              <span>Leaderboard</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
            <button
              onClick={handlePrint}
              className="clay-btn-primary px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download marks</span>
            </button>
          </div>
        </div>
      </div>

      {!userTeam ? (
        <div className="clay-card-yellow p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-200/90 border border-amber-300 flex items-center justify-center text-amber-900 mx-auto shadow-xs">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-black text-stone-900">No team found</h2>
          <p className="text-xs text-stone-600 max-w-md mx-auto">
            Join a team to see its marks after evaluation.
          </p>
          <div>
            <Link to="/app/teams" className="clay-btn-orange px-5 py-2.5 rounded-2xl text-xs font-bold inline-block">
              Form a Team
            </Link>
          </div>
        </div>
      ) : !evaluation ? (
        <div className="clay-card p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-700 mx-auto">
            <Clock className="w-6 h-6 text-amber-700" />
          </div>
          <h2 className="text-lg font-black text-stone-900">Marks are not available yet</h2>
          <p className="text-xs text-stone-600 max-w-md mx-auto leading-relaxed">
            Your team's marks will appear here after the evaluation is complete.
          </p>
          {submission?.frozenCommitSha ? (
            <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 inline-block font-mono text-xs text-stone-700">
              Frozen SHA: <span className="font-bold text-amber-800">{submission.frozenCommitSha}</span>
            </div>
          ) : (
            <div>
              <Link to="/app/submissions" className="clay-btn-orange px-5 py-2.5 rounded-2xl text-xs font-bold inline-block">
                Submit Project Before Deadline
              </Link>
            </div>
          )}
        </div>
      ) : (
        /* Verified Real Evaluation Scorecard */
        <div className="space-y-6">
          <div className="clay-card-green p-6 sm:p-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-emerald-900">
                  OFFICIAL EVALUATION SEALED
                </span>
              </div>
              <h2 className="text-3xl font-black text-emerald-950">
                {userTeam.name}
              </h2>
              <p className="text-xs text-emerald-800 mt-1 font-semibold">
                Lead Judge: {evaluation.judgeEmail} • Status: {evaluation.status.toUpperCase()}
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-white/80 border border-emerald-200 text-center shadow-xs min-w-[140px]">
              <span className="block font-mono text-[10px] font-black uppercase tracking-wider text-emerald-800">
                TEAM SCORE
              </span>
              <div className="text-4xl font-black text-emerald-950 font-mono mt-1">
                {evaluation.totalScore}
              </div>
              <span className="text-[11px] font-bold text-emerald-700">/ 100 Points</span>
            </div>
          </div>

          {/* Rubric Criteria Breakdown */}
          <div className="clay-card p-6 space-y-5">
            <h3 className="text-sm font-black text-stone-900 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>Score breakdown</span>
            </h3>

            <div className="space-y-4">
              {evaluation.scores && Object.keys(evaluation.scores).length > 0 ? (
                Object.entries(evaluation.scores).map(([critId, score]) => {
                  const comment = evaluation.criterionComments?.[critId];
                  return (
                    <div key={critId} className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-xs font-bold text-stone-900 uppercase font-mono">{critId.replace(/_/g, ' ')}</span>
                        <span className="font-mono text-xs font-black text-stone-900">
                          {score} pts
                        </span>
                      </div>
                      {comment && (
                        <p className="text-[11px] text-stone-600 mt-2 italic bg-stone-100 p-2 rounded-lg">
                          "{comment}"
                        </p>
                      )}
                    </div>
                  );
                })
              ) : (
                <p className="text-xs text-stone-500 font-semibold">
                  Aggregated standard assessment points awarded.
                </p>
              )}
            </div>

            {evaluation.generalFeedback && (
              <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-950">
                <span className="font-bold block mb-1 text-amber-900">Lead Judge Feedback:</span>
                <p className="leading-relaxed">{evaluation.generalFeedback}</p>
              </div>
            )}
          </div>

          {/* Submission Provenance Details */}
          {submission && (
            <div className="clay-card-yellow p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="font-mono text-[10px] font-black uppercase tracking-wider text-amber-800">
                  SEALED COMMIT PROVENANCE
                </span>
                <div className="font-mono text-xs font-black text-stone-900 mt-0.5">
                  {submission.frozenCommitSha}
                </div>
                <span className="font-mono text-[11px] text-stone-600 block mt-0.5 truncate">
                  {submission.repoUrl} ({submission.branch})
                </span>
              </div>
              <button
                onClick={() => handleCopySha(submission.frozenCommitSha)}
                className="clay-btn-yellow px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0"
              >
                {copiedSha ? <Check className="w-4 h-4 text-emerald-700" /> : <Copy className="w-4 h-4 text-amber-800" />}
                <span>{copiedSha ? 'Copied' : 'Copy Hash'}</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
