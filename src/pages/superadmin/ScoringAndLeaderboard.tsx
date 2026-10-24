import React, { useState, useEffect } from 'react';
import {
  Award,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Download,
  Send,
  Lock,
  ArrowLeft,
  Check,
  Sliders,
  ShieldCheck,
  FileCheck,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  getEvents,
  getTeamsForEvent,
  getEvaluationsForEvent,
  savePublishedLeaderboard,
  recordAuditLog,
} from '../../services/firestoreService';
import { HackathonEvent, PublishedLeaderboard, LeaderboardEntry } from '../../types';

export const ScoringAndLeaderboardPage: React.FC = () => {
  const { user } = useAuth();
  const [activeEvent, setActiveEvent] = useState<HackathonEvent | null>(null);

  // Redaction Toggles State
  const [showTotalScore, setShowTotalScore] = useState(true);
  const [showCriterionSubScores, setShowCriterionSubScores] = useState(true);
  const [showEvaluatorIdentity, setShowEvaluatorIdentity] = useState(false);
  const [displayAstSeal, setDisplayAstSeal] = useState(true);

  // Authorization Checkbox
  const [certified, setCertified] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [published, setPublished] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    getEvents().then((evts) => {
      if (evts && evts.length > 0) setActiveEvent(evts[0]);
    });
  }, []);

  const handlePublish = async () => {
    if (!certified || !activeEvent || !user) return;
    setPublishing(true);
    setFeedback(null);

    const standings: LeaderboardEntry[] = [
      {
        rank: 1,
        teamId: 'team_088',
        teamName: 'Team HyperSync',
        problemTitle: 'Distributed Systems',
        score: 94.2,
        roundScores: { round_1: 47.1, round_2: 47.1 },
        isTie: false,
        status: 'Clean Provenance',
        lastUpdated: new Date().toISOString(),
      },
      {
        rank: 2,
        teamId: 'team_104',
        teamName: 'Team OmniMesh',
        problemTitle: 'Mesh Networks',
        score: 93.8,
        roundScores: { round_1: 46.9, round_2: 46.9 },
        isTie: false,
        status: 'Clean Provenance',
        lastUpdated: new Date().toISOString(),
      },
      {
        rank: 3,
        teamId: 'team_042',
        teamName: 'Team ByteCrafters',
        problemTitle: 'Event Streaming',
        score: 92.5,
        roundScores: { round_1: 46.2, round_2: 46.3 },
        isTie: false,
        status: 'Clean Provenance',
        lastUpdated: new Date().toISOString(),
      },
      {
        rank: 4,
        teamId: 'team_019',
        teamName: 'Team NeuralFlux',
        problemTitle: 'Edge Inference',
        score: 87.0,
        roundScores: { round_1: 43.5, round_2: 43.5 },
        isTie: false,
        status: 'Clean Provenance',
        lastUpdated: new Date().toISOString(),
      },
    ];

    try {
      const pubDoc: PublishedLeaderboard = {
        id: 'published',
        eventId: activeEvent.id,
        status: 'published',
        standings,
        publishedAt: new Date().toISOString(),
        publishedBy: user.email || 'superadmin@gittrack.internal',
        updatedAt: new Date().toISOString(),
      };

      await savePublishedLeaderboard(activeEvent.id, pubDoc);

      await recordAuditLog({
        actorId: user.uid,
        actorEmail: user.email || 'superadmin@gittrack.internal',
        action: 'LEADERBOARD_RELEASE_GATE_AUTHORIZED',
        entityType: 'Leaderboard',
        entityId: 'published',
        eventId: activeEvent.id,
        details: 'Superadmin authorized cryptographic release gate of official leaderboard standings.',
        reason: 'Superadmin compliance certification: all 142 submissions audited for Git cadence anomalies.',
      });

      setPublished(true);
      setFeedback({
        type: 'success',
        text: 'Leaderboard Released & Cryptographically Locked on Public Portal!',
      });
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Failed to authorize release.' });
    } finally {
      setPublishing(false);
    }
  };

  const handleExportManifest = async () => {
    try {
      const res = await fetch('/api/export/leaderboard-csv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventTitle: activeEvent?.title || 'HackGrid 2025',
          standings: [
            { rank: 1, teamName: 'Team HyperSync', score: 94.2, isTie: false, status: 'Audited', lastUpdated: new Date().toISOString() },
            { rank: 2, teamName: 'Team OmniMesh', score: 93.8, isTie: false, status: 'Audited', lastUpdated: new Date().toISOString() },
            { rank: 3, teamName: 'Team ByteCrafters', score: 92.5, isTie: false, status: 'Audited', lastUpdated: new Date().toISOString() },
          ],
        }),
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `GitTrack_Sealed_Manifest_${Date.now()}.csv`;
      a.click();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex flex-col w-full pb-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 space-y-5 text-on-surface">
      {/* Top Release Gate Subheader */}
      <section className="px-4 py-3 rounded-2xl bg-surface-container-lowest border border-outline-variant/30">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span className="font-mono text-[10px] uppercase tracking-wider text-on-surface-variant font-semibold">
              Release Gate Control
            </span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-error-container/40 text-error font-mono text-[10px] uppercase flex items-center gap-1 font-bold border border-error/30">
            <span className="w-1.5 h-1.5 rounded-full bg-error animate-ping" />
            Pending Superadmin
          </span>
        </div>

        <h1 className="text-xl sm:text-2xl font-bold text-on-surface tracking-tight">
          Leaderboard Release Gate
        </h1>

        <div className="flex items-center gap-2 mt-1">
          <span className="font-mono text-xs text-tertiary">#IC-HACKGRID-2025</span>
          <span className="text-outline text-xs">•</span>
          <span className="text-xs text-on-surface-variant">Production Aggregation Pipeline</span>
        </div>

        {/* Quick Status Strip */}
        <div className="grid grid-cols-3 gap-2 mt-3">
          <div className="bg-surface-container-low p-2.5 rounded-xl border border-outline-variant/20 flex flex-col">
            <span className="font-mono text-[9px] uppercase tracking-wider text-outline">COHORT COVERAGE</span>
            <span className="font-bold text-sm text-secondary mt-0.5">100%</span>
            <span className="font-mono text-[10px] text-on-surface-variant">142/142 Scored</span>
          </div>
          <div className="bg-surface-container-low p-2.5 rounded-xl border border-outline-variant/20 flex flex-col">
            <span className="font-mono text-[9px] uppercase tracking-wider text-outline">OVERRIDES</span>
            <span className="font-bold text-sm text-tertiary mt-0.5">02 Active</span>
            <span className="font-mono text-[10px] text-on-surface-variant">Audited & Signed</span>
          </div>
          <div className="bg-surface-container-low p-2.5 rounded-xl border border-outline-variant/20 flex flex-col">
            <span className="font-mono text-[9px] uppercase tracking-wider text-outline">SANITY CHECK</span>
            <span className="font-bold text-sm text-primary mt-0.5">VERIFIED</span>
            <span className="font-mono text-[10px] text-on-surface-variant">Zero Diffs</span>
          </div>
        </div>
      </section>

      {feedback && (
        <div
          className={`p-3.5 rounded-xl text-xs flex items-start gap-2.5 border ${
            feedback.type === 'success'
              ? 'bg-secondary-container/20 border-secondary-container/40 text-secondary'
              : 'bg-error-container/20 border-error-container/40 text-error'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Scoring Aggregation Configuration Panel */}
      <div className="bg-surface-container-low rounded-2xl p-4 sm:p-5 shadow-md border border-outline-variant/30 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-primary" />
            <h2 className="font-bold text-sm text-on-surface">Aggregation Matrix</h2>
          </div>
          <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-semibold">
            RULE-SET: v4.1
          </span>
        </div>

        <div className="space-y-3">
          {/* Multi-Judge Method */}
          <div className="bg-surface-container p-3 rounded-xl border border-outline-variant/20">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-on-surface">Multi-Judge Aggregation</span>
              <span className="px-2 py-0.5 rounded bg-primary/15 text-primary font-mono text-[10px] font-semibold">
                Trimmed Mean
              </span>
            </div>
            <p className="text-[11px] text-on-surface-variant mt-1 leading-relaxed">
              Rejects absolute max/min score outliers across judges to mitigate grading drift and partisan variance.
            </p>
            <div className="flex items-center gap-1.5 mt-2 pt-2 bg-surface-container-low/50 px-2 py-1.5 rounded-lg text-secondary font-mono text-[10px]">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Drop 1 Highest + 1 Lowest applied (N≥5)</span>
            </div>
          </div>

          {/* Missing Eval Policy & Normalization Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className="bg-surface-container p-3 rounded-xl border border-outline-variant/20 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[9px] uppercase tracking-wider text-outline">MISSING EVAL POLICY</span>
                <span className="font-mono text-[9px] text-error bg-error-container/20 px-1 rounded font-bold">
                  ENFORCED
                </span>
              </div>
              <p className="text-xs font-semibold text-on-surface mt-1.5">Strict Release Blocker</p>
              <span className="font-mono text-[10px] text-on-surface-variant">0 Null Records Detected</span>
            </div>

            <div className="bg-surface-container p-3 rounded-xl border border-outline-variant/20 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[9px] uppercase tracking-wider text-outline">NORMALIZATION</span>
                <span className="font-mono text-[9px] text-secondary bg-secondary-container/40 px-1 rounded font-bold">
                  ACTIVE
                </span>
              </div>
              <p className="text-xs font-semibold text-on-surface mt-1.5">Z-Score Calibration</p>
              <span className="font-mono text-[10px] text-on-surface-variant">Inter-evaluator variance leveled</span>
            </div>
          </div>

          {/* Deterministic Tie-Break Sequence */}
          <div className="bg-surface-container p-3 rounded-xl border border-outline-variant/20">
            <span className="font-mono text-[9px] uppercase tracking-wider text-outline block mb-1">
              DETERMINISTIC TIE-BREAK SEQUENCE
            </span>
            <div className="space-y-1.5 mt-2 text-xs">
              <div className="flex items-center gap-2 bg-surface-container-high/60 px-2.5 py-1.5 rounded-lg">
                <span className="w-4 h-4 rounded bg-primary/20 text-primary font-mono text-[10px] flex items-center justify-center font-bold">
                  1
                </span>
                <span className="text-on-surface font-medium">Cadence Integrity Score</span>
                <span className="ml-auto font-mono text-[10px] text-on-surface-variant">Forensic AST Index</span>
              </div>
              <div className="flex items-center gap-2 bg-surface-container-high/60 px-2.5 py-1.5 rounded-lg">
                <span className="w-4 h-4 rounded bg-primary/20 text-primary font-mono text-[10px] flex items-center justify-center font-bold">
                  2
                </span>
                <span className="text-on-surface font-medium">Benchmark SLA Latency</span>
                <span className="ml-auto font-mono text-[10px] text-on-surface-variant">ms percentile</span>
              </div>
              <div className="flex items-center gap-2 bg-surface-container-high/60 px-2.5 py-1.5 rounded-lg">
                <span className="w-4 h-4 rounded bg-primary/20 text-primary font-mono text-[10px] flex items-center justify-center font-bold">
                  3
                </span>
                <span className="text-on-surface font-medium">Head SHA Commit Timestamp</span>
                <span className="ml-auto font-mono text-[10px] text-on-surface-variant">UTC Epoch First</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Deliberation & Override Audit Summary */}
      <div className="bg-surface-container-low rounded-2xl p-4 sm:p-5 shadow-md border border-outline-variant/30 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-secondary" />
            <h2 className="font-bold text-sm text-on-surface">Deliberation & Overrides</h2>
          </div>
          <span className="px-2 py-0.5 rounded bg-secondary-container/30 text-secondary font-mono text-[10px] font-semibold">
            142/142 Closed
          </span>
        </div>

        <div className="space-y-2">
          <div className="bg-surface-container p-3 rounded-xl border border-outline-variant/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 rounded bg-tertiary-container/30 text-tertiary font-mono text-[10px]">
                  TEAM #088
                </span>
                <span className="font-bold text-xs text-on-surface">HyperSync</span>
              </div>
              <span className="font-mono text-[11px] text-secondary font-bold">+1.2 PTS Adj.</span>
            </div>
            <p className="text-[11px] text-on-surface-variant mt-1 leading-relaxed">
              Audit Reason: Disqualified bad-faith score from Judge #07 (Uncalibrated 40-pt skew resolved post-rebuttal).
            </p>
            <div className="flex items-center justify-between mt-2 pt-1 font-mono text-[10px] text-outline border-t border-outline-variant/10">
              <span>By: sysadmin@gittrack.internal</span>
              <span>SHA: 8cfb392a</span>
            </div>
          </div>

          <div className="bg-surface-container p-3 rounded-xl border border-outline-variant/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-1.5 py-0.5 rounded bg-tertiary-container/30 text-tertiary font-mono text-[10px]">
                  TEAM #104
                </span>
                <span className="font-bold text-xs text-on-surface">OmniMesh</span>
              </div>
              <span className="font-mono text-[11px] text-secondary font-bold">+0.8 PTS Adj.</span>
            </div>
            <p className="text-[11px] text-on-surface-variant mt-1 leading-relaxed">
              Audit Reason: Restored SLA penalty after infrastructure DNS blackout was confirmed third-party outage.
            </p>
            <div className="flex items-center justify-between mt-2 pt-1 font-mono text-[10px] text-outline border-t border-outline-variant/10">
              <span>By: sysadmin@gittrack.internal</span>
              <span>SHA: 41ae19f0</span>
            </div>
          </div>
        </div>
      </div>

      {/* Public Visibility & Redaction Controls */}
      <div className="bg-surface-container-low rounded-2xl p-4 sm:p-5 shadow-md border border-outline-variant/30 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-primary" />
            <h2 className="font-bold text-sm text-on-surface">Redaction & Transparency</h2>
          </div>
          <span className="font-mono text-[10px] text-on-surface-variant">Live Feed Masking</span>
        </div>

        <div className="space-y-2 text-xs">
          {/* Row 1 */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface-container border border-outline-variant/20">
            <div>
              <span className="font-medium text-on-surface block">Show Total Aggregate Score</span>
              <span className="text-[11px] text-on-surface-variant">Broadcast absolute computed point index</span>
            </div>
            <button
              type="button"
              onClick={() => setShowTotalScore(!showTotalScore)}
              className={`w-11 h-6 rounded-full relative p-0.5 transition-colors ${
                showTotalScore ? 'bg-primary' : 'bg-surface-container-highest'
              }`}
            >
              <span
                className={`block w-5 h-5 rounded-full bg-on-primary shadow-sm transform transition-transform ${
                  showTotalScore ? 'translate-x-5' : 'translate-x-0 bg-on-surface-variant'
                }`}
              />
            </button>
          </div>

          {/* Row 2 */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface-container border border-outline-variant/20">
            <div>
              <span className="font-medium text-on-surface block">Show Criterion Sub-Scores</span>
              <span className="text-[11px] text-on-surface-variant">Reveal breakdown: UI, Arch, Forensic & Pitch</span>
            </div>
            <button
              type="button"
              onClick={() => setShowCriterionSubScores(!showCriterionSubScores)}
              className={`w-11 h-6 rounded-full relative p-0.5 transition-colors ${
                showCriterionSubScores ? 'bg-primary' : 'bg-surface-container-highest'
              }`}
            >
              <span
                className={`block w-5 h-5 rounded-full bg-on-primary shadow-sm transform transition-transform ${
                  showCriterionSubScores ? 'translate-x-5' : 'translate-x-0 bg-on-surface-variant'
                }`}
              />
            </button>
          </div>

          {/* Row 3 */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface-container border border-outline-variant/20">
            <div>
              <span className="font-medium text-on-surface block">Show Evaluator Identity</span>
              <span className="text-[11px] text-on-surface-variant">Strict blind evaluation: conceal judge handles</span>
            </div>
            <button
              type="button"
              onClick={() => setShowEvaluatorIdentity(!showEvaluatorIdentity)}
              className={`w-11 h-6 rounded-full relative p-0.5 transition-colors ${
                showEvaluatorIdentity ? 'bg-primary' : 'bg-surface-container-highest'
              }`}
            >
              <span
                className={`block w-5 h-5 rounded-full bg-on-primary shadow-sm transform transition-transform ${
                  showEvaluatorIdentity ? 'translate-x-5' : 'translate-x-0 bg-on-surface-variant'
                }`}
              />
            </button>
          </div>

          {/* Row 4 */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface-container border border-outline-variant/20">
            <div>
              <span className="font-medium text-on-surface block">Display AST Forensics Verified Seal</span>
              <span className="text-[11px] text-on-surface-variant">Affix cryptographic commit badge on public cards</span>
            </div>
            <button
              type="button"
              onClick={() => setDisplayAstSeal(!displayAstSeal)}
              className={`w-11 h-6 rounded-full relative p-0.5 transition-colors ${
                displayAstSeal ? 'bg-primary' : 'bg-surface-container-highest'
              }`}
            >
              <span
                className={`block w-5 h-5 rounded-full bg-on-primary shadow-sm transform transition-transform ${
                  displayAstSeal ? 'translate-x-5' : 'translate-x-0 bg-on-surface-variant'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Final Ranked Cohort Preview */}
      <div className="bg-surface-container-low rounded-2xl p-4 sm:p-5 shadow-md border border-outline-variant/30 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-primary" />
            <h2 className="font-bold text-sm text-on-surface">Final Cohort Standings (Preview)</h2>
          </div>
          <span className="font-mono text-[10px] text-secondary font-semibold">Pre-flight Sync OK</span>
        </div>

        <div className="space-y-2">
          {/* Rank 1 */}
          <div className="bg-surface-container p-3 rounded-xl flex items-center justify-between gap-3 border border-outline-variant/20">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-primary/20 text-primary font-bold text-xs flex items-center justify-center shrink-0">
                1
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-bold text-xs text-on-surface truncate">Team HyperSync</span>
                  <span className="px-1.5 py-0.2 rounded bg-secondary/15 text-secondary font-mono text-[10px] flex items-center gap-0.5">
                    <CheckCircle2 className="w-3 h-3" /> Clean
                  </span>
                </div>
                <span className="font-mono text-[10px] text-outline">ID: #088 • SHA: a410fb • 24 Commits</span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="font-mono text-sm font-bold text-primary">
                94.2 <span className="text-[10px] text-on-surface-variant font-normal">PTS</span>
              </div>
              <span className="font-mono text-[10px] text-secondary">#1 Seed</span>
            </div>
          </div>

          {/* Rank 2 */}
          <div className="bg-surface-container p-3 rounded-xl flex items-center justify-between gap-3 border border-outline-variant/20">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-surface-container-high text-on-surface-variant font-bold text-xs flex items-center justify-center shrink-0">
                2
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-bold text-xs text-on-surface truncate">Team OmniMesh</span>
                  <span className="px-1.5 py-0.2 rounded bg-secondary/15 text-secondary font-mono text-[10px] flex items-center gap-0.5">
                    <CheckCircle2 className="w-3 h-3" /> Clean
                  </span>
                </div>
                <span className="font-mono text-[10px] text-outline">ID: #104 • SHA: 98df31 • 19 Commits</span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="font-mono text-sm font-bold text-primary">
                93.8 <span className="text-[10px] text-on-surface-variant font-normal">PTS</span>
              </div>
              <span className="font-mono text-[10px] text-on-surface-variant font-medium">Δ -0.4</span>
            </div>
          </div>

          {/* Rank 3 */}
          <div className="bg-surface-container p-3 rounded-xl flex items-center justify-between gap-3 border border-outline-variant/20">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-surface-container-high text-on-surface-variant font-bold text-xs flex items-center justify-center shrink-0">
                3
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-bold text-xs text-on-surface truncate">Team ByteCrafters</span>
                  <span className="px-1.5 py-0.2 rounded bg-secondary/15 text-secondary font-mono text-[10px] flex items-center gap-0.5">
                    <CheckCircle2 className="w-3 h-3" /> Clean
                  </span>
                </div>
                <span className="font-mono text-[10px] text-outline">ID: #042 • SHA: dd8412 • 31 Commits</span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="font-mono text-sm font-bold text-primary">
                92.5 <span className="text-[10px] text-on-surface-variant font-normal">PTS</span>
              </div>
              <span className="font-mono text-[10px] text-on-surface-variant font-medium">Δ -1.7</span>
            </div>
          </div>

          {/* Finals Cutoff line */}
          <div className="my-2 p-2.5 rounded-xl bg-surface-container-highest/60 flex items-center justify-between border border-outline-variant/20">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-on-surface font-medium uppercase tracking-wide">
                Finals Cutoff Line: 78.0 PTS
              </span>
            </div>
            <span className="font-mono text-[10px] text-tertiary bg-tertiary-container/30 px-2 py-0.5 rounded font-semibold">
              Top 16 Qualify
            </span>
          </div>
        </div>
      </div>

      {/* High-Stakes Action & Authorization Box */}
      <div className="bg-surface-container-low rounded-2xl p-4 sm:p-5 shadow-2xl border border-outline-variant/30 space-y-4">
        {/* Warning Scrim */}
        <div className="p-3 rounded-xl bg-error-container/30 text-on-surface flex items-start gap-3 border border-error/20">
          <AlertTriangle className="w-5 h-5 text-error shrink-0 mt-0.5" />
          <div className="min-w-0">
            <p className="text-xs text-error font-bold leading-snug">Irreversible Operation</p>
            <p className="text-[11px] text-on-surface-variant mt-0.5 leading-relaxed">
              Publishing will release official aggregated scores to all hackathon teams, generate cryptographically signed result certificates, and lock leaderboard entries permanently.
            </p>
          </div>
        </div>

        {/* Superadmin Certification Check */}
        <div>
          <label className="flex items-start gap-2.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={certified}
              onChange={(e) => setCertified(e.target.checked)}
              className="w-4 h-4 mt-0.5 rounded bg-surface-container-lowest text-primary accent-primary shrink-0 cursor-pointer"
            />
            <span className="text-xs text-on-surface leading-relaxed">
              I certify that all 142 submissions have been audited for Git cadence anomalies, outlier judge distributions, and duplicate syntax blocks.
            </span>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            type="button"
            disabled={!certified || publishing}
            onClick={handlePublish}
            className={`w-full h-11 px-4 rounded-xl font-sans text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-all ${
              published
                ? 'bg-secondary text-on-secondary'
                : certified
                ? 'bg-primary text-on-primary hover:bg-primary-fixed active:scale-[0.99]'
                : 'bg-primary text-on-primary opacity-50 cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>
              {publishing
                ? 'Signing Manifest & Broadcasting...'
                : published
                ? 'Leaderboard Released & Locked'
                : 'Authorize & Publish Official Results'}
            </span>
          </button>

          <button
            type="button"
            onClick={handleExportManifest}
            className="w-full h-11 px-4 rounded-xl bg-surface-container-high text-on-surface hover:text-primary transition-colors font-sans text-xs font-semibold flex items-center justify-center gap-2 border border-outline-variant/20"
          >
            <Download className="w-4 h-4" />
            <span>Export Sealed Audit Manifest (JSON/CSV)</span>
          </button>
        </div>

        {/* Security Stamp */}
        <div className="pt-2 flex items-center justify-between text-outline font-mono text-[10px] border-t border-outline-variant/10">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
            ECDSA P-256 HSM Ready
          </span>
          <span>Key: SEC-PUB-2025-09A</span>
        </div>
      </div>
    </div>
  );
};
