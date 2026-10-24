import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Save,
  Send,
  Lock,
  ExternalLink,
  Plus,
  Minus,
  Sparkles,
  Terminal,
  Activity,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  getEvents,
  getTeamById,
  getSubmissionForTeam,
  saveEvaluation,
  recordAuditLog,
} from '../../services/firestoreService';
import { Evaluation } from '../../types';

export const EvaluationFormPage: React.FC = () => {
  const { teamId } = useParams<{ teamId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Criteria Scores
  const [scoreCrit1, setScoreCrit1] = useState<number>(28.5);
  const [tierCrit1, setTierCrit1] = useState<string>('Exceptional');
  const [feedbackCrit1, setFeedbackCrit1] = useState(
    'Clean separation of concerns in stream buffer handling. Proper use of lock-free ring buffers without deadlock vulnerability. Memory footprint tests verify zero allocs inside hot loop.'
  );

  const [scoreCrit2, setScoreCrit2] = useState<number>(38.0);
  const [tierCrit2, setTierCrit2] = useState<string>('Flawless');
  const [feedbackCrit2, setFeedbackCrit2] = useState(
    'Authentic multi-author velocity across all 48 hours. Validated Git SHA signatures with zero late bulk dumps. Commit messages follow conventional standard with linked test iterations.'
  );

  const [scoreCrit3, setScoreCrit3] = useState<number>(26.0);
  const [tierCrit3, setTierCrit3] = useState<string>('Meets SLA');
  const [feedbackCrit3, setFeedbackCrit3] = useState(
    'Stress testing verified throughput with zero packet drops under network partition simulation. Clean code patterns.'
  );

  const [internalJuryNote, setInternalJuryNote] = useState(
    'Candidate for Top 5 finals presentation. Strong distributed systems fundamentals. Alex demonstrated exceptional mastery of memory barriers during live Q&A.'
  );

  const [submitting, setSubmitting] = useState(false);
  const [finalized, setFinalized] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const provisionalTotal = Number((scoreCrit1 + scoreCrit2 + scoreCrit3).toFixed(1));

  const handleSave = async (status: 'draft' | 'submitted') => {
    setSubmitting(true);
    setFeedback(null);
    try {
      const evalId = `eval_${teamId || 'bytecrafters'}_round_1`;
      const payload: Evaluation = {
        id: evalId,
        eventId: 'hack-2026-global',
        roundId: 'round_1',
        teamId: teamId || 'team_bytecrafters',
        teamName: 'Team ByteCrafters',
        submissionId: 'sub_bytecrafters',
        judgeId: user?.uid || 'usr_judge_04',
        judgeEmail: user?.email || 'e.vance@mit.edu',
        schemaId: 'schema_round_1',
        schemaVersion: 1,
        scores: {
          crit_01: scoreCrit1,
          crit_02: scoreCrit2,
          crit_03: scoreCrit3,
        },
        criterionComments: {
          crit_01: feedbackCrit1,
          crit_02: feedbackCrit2,
          crit_03: feedbackCrit3,
        },
        totalScore: provisionalTotal,
        provisionalTotal,
        generalFeedback: feedbackCrit1 + '\n\n' + feedbackCrit3,
        internalNotes: internalJuryNote,
        status: status === 'submitted' ? 'submitted' : 'draft',
        submittedAt: new Date().toISOString(),
      };

      await saveEvaluation('hack-2026-global', payload);

      if (user) {
        await recordAuditLog({
          actorId: user.uid,
          actorEmail: user.email || 'e.vance@mit.edu',
          action: `EVALUATION_${status.toUpperCase()}`,
          entityType: 'Evaluation',
          entityId: evalId,
          eventId: 'hack-2026-global',
          details: `Judge Dr. E. Vance (#04) ${status} evaluation for ByteCrafters: ${provisionalTotal}/100 PTS`,
        });
      }

      if (status === 'submitted') {
        setFinalized(true);
        setFeedback({
          type: 'success',
          text: `Evaluation finalized (${provisionalTotal}/100 PTS) and cryptographically signed with Judge #04 credentials.`,
        });
      } else {
        setFeedback({ type: 'success', text: 'Evaluation draft autosaved successfully.' });
      }
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Failed to save evaluation.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col w-full pb-28 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 space-y-4 text-on-surface">
      {/* Micro Top Forensic Sub-header */}
      <div className="flex items-center justify-between py-1 text-on-surface-variant font-mono text-xs">
        <div className="flex items-center gap-1.5 min-w-0">
          <Link to="/admin/judging" className="hover:text-primary transition-colors flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Queue</span>
          </Link>
          <span>/</span>
          <span className="text-on-surface truncate">Eval: R1 Forensics</span>
        </div>
        <div className="flex items-center gap-1 bg-surface-container-high px-2 py-0.5 rounded text-tertiary text-[10px]">
          <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse" />
          <span>AUTOSAVED 30s AGO</span>
        </div>
      </div>

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

      {/* Team Identity & Provisional Header Card */}
      <section className="bg-surface-container rounded-2xl p-4 sm:p-5 shadow-md border border-outline-variant/30 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-on-surface tracking-tight">Team ByteCrafters</h1>
              <span className="bg-surface-container-highest text-primary font-mono text-[10px] px-2 py-0.5 rounded border border-outline-variant/20">
                #BC-408
              </span>
            </div>
            <p className="text-xs text-on-surface-variant mt-0.5">PS-04 High-Throughput Event Streaming</p>
          </div>
          <span className="bg-primary-container/20 text-primary font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-primary-container/30">
            {finalized ? 'Finalized' : 'Draft In Progress'}
          </span>
        </div>

        {/* Team Avatar & Status */}
        <div className="flex items-center justify-between bg-surface-container-low rounded-xl p-3 border border-outline-variant/20">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-bold text-xs shrink-0">
              AZ
            </div>
            <div className="flex flex-col text-xs">
              <span className="font-semibold text-on-surface leading-tight">Lead: Alex Zhang + 3</span>
              <span className="font-mono text-[10px] text-on-surface-variant leading-tight">
                Repo: bytecrafters/stream-mesh
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-secondary">
            <span className="w-2 h-2 rounded-full bg-secondary" />
            <span>Verified Build</span>
          </div>
        </div>

        {/* Live Score Metronome Bar */}
        <div className="bg-surface-container-lowest rounded-xl p-3.5 flex flex-col gap-2 border border-outline-variant/20">
          <div className="flex items-baseline justify-between">
            <div className="flex flex-col">
              <span className="font-mono text-[10px] uppercase tracking-wider text-on-surface-variant font-semibold">
                Provisional Total
              </span>
              <span className="text-[11px] text-outline">Authoritative score computed at final submission</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-extrabold text-primary tracking-tight font-mono">
                {provisionalTotal}
              </span>
              <span className="font-mono text-xs text-on-surface-variant">/ 100 PTS</span>
            </div>
          </div>

          <div className="w-full h-2 rounded-full bg-surface-container-high overflow-hidden flex gap-0.5">
            <div className="h-full bg-secondary transition-all" style={{ width: `${(scoreCrit1 / 100) * 100}%` }} />
            <div className="h-full bg-tertiary transition-all" style={{ width: `${(scoreCrit2 / 100) * 100}%` }} />
            <div className="h-full bg-primary transition-all" style={{ width: `${(scoreCrit3 / 100) * 100}%` }} />
          </div>

          <div className="flex justify-between text-on-surface-variant font-mono text-[10px] pt-0.5">
            <span className="flex items-center gap-1 text-secondary">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary" /> Arch {scoreCrit1}
            </span>
            <span className="flex items-center gap-1 text-tertiary">
              <span className="w-1.5 h-1.5 rounded-full bg-tertiary" /> Forensics {scoreCrit2}
            </span>
            <span className="flex items-center gap-1 text-primary">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" /> Benchmark {scoreCrit3}
            </span>
          </div>
        </div>
      </section>

      {/* Criterion 1: Code Architecture */}
      <section className="bg-surface-container rounded-2xl p-4 shadow-sm flex flex-col gap-3 border border-outline-variant/30">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] bg-surface-container-highest px-2 py-0.5 rounded text-on-surface font-bold">
                CRIT 01
              </span>
              <h3 className="font-bold text-sm text-on-surface">Code Architecture & Modularity</h3>
            </div>
            <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
              Clean separation of concerns, memory safety, effective concurrency primitives, and modular API design.
            </p>
          </div>
          <span className="bg-surface-container-high font-mono text-[10px] text-secondary px-2 py-1 rounded font-bold shrink-0">
            30% WT
          </span>
        </div>

        {/* Rubric Tier Selector Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          {[
            { label: 'Exceptional', points: '27.0 - 30.0 PTS', val: 28.5 },
            { label: 'Proficient', points: '22.0 - 26.5 PTS', val: 24.0 },
            { label: 'Basic', points: '15.0 - 21.5 PTS', val: 18.0 },
            { label: 'Subpar', points: '< 15.0 PTS', val: 12.0 },
          ].map((t) => (
            <button
              key={t.label}
              type="button"
              onClick={() => {
                setTierCrit1(t.label);
                setScoreCrit1(t.val);
              }}
              className={`p-2.5 rounded-xl text-left border transition-all ${
                tierCrit1 === t.label
                  ? 'bg-secondary-container/30 border-secondary text-white'
                  : 'bg-surface-container-high/60 border-outline-variant/20 text-on-surface-variant'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="font-bold text-xs">{t.label}</span>
                {tierCrit1 === t.label && <Check className="w-3.5 h-3.5 text-secondary" />}
              </div>
              <span className="font-mono text-[10px] text-on-surface-variant">{t.points}</span>
            </button>
          ))}
        </div>

        {/* Stepper Input & Range Slider */}
        <div className="bg-surface-container-low rounded-xl p-3 flex flex-col gap-2 border border-outline-variant/20">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-on-surface-variant uppercase">ASSIGNED SCORE</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setScoreCrit1((v) => Math.max(0, Number((v - 0.5).toFixed(1))))}
                className="w-7 h-7 rounded-lg bg-surface-container-highest text-on-surface flex items-center justify-center active:scale-95"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <div className="bg-surface-container-lowest px-2.5 py-1 rounded-lg text-right font-mono font-bold text-xs text-secondary border border-outline-variant/20">
                {scoreCrit1} <span className="text-[10px] text-on-surface-variant font-normal">/ 30</span>
              </div>
              <button
                type="button"
                onClick={() => setScoreCrit1((v) => Math.min(30, Number((v + 0.5).toFixed(1))))}
                className="w-7 h-7 rounded-lg bg-surface-container-highest text-on-surface flex items-center justify-center active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <input
            type="range"
            min="0"
            max="30"
            step="0.5"
            value={scoreCrit1}
            onChange={(e) => setScoreCrit1(parseFloat(e.target.value) || 0)}
            className="w-full accent-secondary cursor-pointer"
          />
        </div>

        {/* Verified Code Evidence Badge */}
        <div className="flex items-center justify-between bg-surface-container-lowest px-3 py-2 rounded-xl border border-outline-variant/20">
          <div className="flex items-center gap-2 min-w-0">
            <Terminal className="w-4 h-4 text-tertiary" />
            <span className="font-mono text-xs text-on-surface truncate">src/engine/ring_buffer.rs</span>
          </div>
          <span className="font-mono text-[10px] text-secondary bg-secondary-container/30 px-2 py-0.5 rounded font-semibold">
            Safe Lockless
          </span>
        </div>

        {/* Feedback text */}
        <div className="flex flex-col gap-1">
          <label className="font-mono text-[10px] text-on-surface-variant uppercase">Evaluator Feedback Note</label>
          <textarea
            rows={2}
            value={feedbackCrit1}
            onChange={(e) => setFeedbackCrit1(e.target.value)}
            className="w-full bg-surface-container-lowest rounded-xl p-2.5 text-on-surface text-xs border border-outline-variant/30 focus:outline-none"
          />
        </div>
      </section>

      {/* Criterion 2: Repository Forensics */}
      <section className="bg-surface-container rounded-2xl p-4 shadow-sm flex flex-col gap-3 border border-outline-variant/30">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] bg-surface-container-highest px-2 py-0.5 rounded text-on-surface font-bold">
                CRIT 02
              </span>
              <h3 className="font-bold text-sm text-on-surface">Repository Forensics & Cadence</h3>
            </div>
            <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
              Authentic commit history, regular commit velocity across timeline, no eleventh-hour bulk dumps.
            </p>
          </div>
          <span className="bg-surface-container-high font-mono text-[10px] text-tertiary px-2 py-1 rounded font-bold shrink-0">
            40% WT
          </span>
        </div>

        <div className="grid grid-cols-3 gap-1.5">
          {[
            { label: 'Flawless', points: '36.0 – 40.0', val: 38.0 },
            { label: 'Acceptable', points: '28.0 – 35.5', val: 32.0 },
            { label: 'Suspicious', points: '< 28.0 PTS', val: 24.0 },
          ].map((t) => (
            <button
              key={t.label}
              type="button"
              onClick={() => {
                setTierCrit2(t.label);
                setScoreCrit2(t.val);
              }}
              className={`p-2.5 rounded-xl text-left border transition-all ${
                tierCrit2 === t.label
                  ? 'bg-tertiary-container/30 border-tertiary text-white'
                  : 'bg-surface-container-high/60 border-outline-variant/20 text-on-surface-variant'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="font-bold text-xs">{t.label}</span>
                {tierCrit2 === t.label && <Check className="w-3.5 h-3.5 text-tertiary" />}
              </div>
              <span className="font-mono text-[10px] text-on-surface-variant">{t.points}</span>
            </button>
          ))}
        </div>

        {/* Stepper */}
        <div className="bg-surface-container-low rounded-xl p-3 flex flex-col gap-2 border border-outline-variant/20">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-on-surface-variant uppercase">ASSIGNED SCORE</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setScoreCrit2((v) => Math.max(0, Number((v - 0.5).toFixed(1))))}
                className="w-7 h-7 rounded-lg bg-surface-container-highest text-on-surface flex items-center justify-center active:scale-95"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <div className="bg-surface-container-lowest px-2.5 py-1 rounded-lg text-right font-mono font-bold text-xs text-tertiary border border-outline-variant/20">
                {scoreCrit2} <span className="text-[10px] text-on-surface-variant font-normal">/ 40</span>
              </div>
              <button
                type="button"
                onClick={() => setScoreCrit2((v) => Math.min(40, Number((v + 0.5).toFixed(1))))}
                className="w-7 h-7 rounded-lg bg-surface-container-highest text-on-surface flex items-center justify-center active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <input
            type="range"
            min="0"
            max="40"
            step="0.5"
            value={scoreCrit2}
            onChange={(e) => setScoreCrit2(parseFloat(e.target.value) || 0)}
            className="w-full accent-tertiary cursor-pointer"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="font-mono text-[10px] text-on-surface-variant uppercase">Evaluator Feedback Note</label>
          <textarea
            rows={2}
            value={feedbackCrit2}
            onChange={(e) => setFeedbackCrit2(e.target.value)}
            className="w-full bg-surface-container-lowest rounded-xl p-2.5 text-on-surface text-xs border border-outline-variant/30 focus:outline-none"
          />
        </div>
      </section>

      {/* Criterion 3: Functional Deliverable */}
      <section className="bg-surface-container rounded-2xl p-4 shadow-sm flex flex-col gap-3 border border-outline-variant/30">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] bg-primary-container text-on-primary-container px-2 py-0.5 rounded font-bold">
                CRIT 03 (ACTIVE)
              </span>
              <h3 className="font-bold text-sm text-on-surface">Functional Deliverable & Benchmark</h3>
            </div>
            <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
              Adherence to throughput targets, edge-case recovery, and execution benchmarks.
            </p>
          </div>
          <span className="bg-surface-container-high font-mono text-[10px] text-primary px-2 py-1 rounded font-bold shrink-0">
            30% WT
          </span>
        </div>

        {/* Live CI Telemetry Card */}
        <div className="bg-surface-container-lowest rounded-xl p-3 flex items-center justify-between border border-outline-variant/20">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
              <Activity className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="font-mono text-[10px] text-on-surface-variant uppercase">
                Benchmark Telemetry (Auto CI)
              </span>
              <span className="font-mono text-xs text-on-surface font-bold">120,412 msgs/sec @ 1.2ms p99</span>
            </div>
          </div>
          <span className="bg-secondary/20 text-secondary font-mono text-[10px] font-bold px-2 py-0.5 rounded border border-secondary/30">
            PASSED SLA
          </span>
        </div>

        {/* Rubrics */}
        <div className="grid grid-cols-3 gap-1.5">
          {[
            { label: 'Exceeds SLA', points: '27.0 – 30.0', val: 28.0 },
            { label: 'Meets SLA', points: '22.0 – 26.5', val: 26.0 },
            { label: 'Below SLA', points: '< 22.0 PTS', val: 18.0 },
          ].map((t) => (
            <button
              key={t.label}
              type="button"
              onClick={() => {
                setTierCrit3(t.label);
                setScoreCrit3(t.val);
              }}
              className={`p-2.5 rounded-xl text-left border transition-all ${
                tierCrit3 === t.label
                  ? 'bg-primary/20 border-primary text-white'
                  : 'bg-surface-container-high/60 border-outline-variant/20 text-on-surface-variant'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="font-bold text-xs">{t.label}</span>
                {tierCrit3 === t.label && <Check className="w-3.5 h-3.5 text-primary" />}
              </div>
              <span className="font-mono text-[10px] text-on-surface-variant">{t.points}</span>
            </button>
          ))}
        </div>

        {/* Stepper */}
        <div className="bg-surface-container-low rounded-xl p-3 flex flex-col gap-2 border border-outline-variant/20">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-on-surface-variant uppercase">ASSIGNED SCORE</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setScoreCrit3((v) => Math.max(0, Number((v - 0.5).toFixed(1))))}
                className="w-7 h-7 rounded-lg bg-surface-container-highest text-on-surface flex items-center justify-center active:scale-95"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <div className="bg-surface-container-lowest px-2.5 py-1 rounded-lg text-right font-mono font-bold text-xs text-primary border border-outline-variant/20">
                {scoreCrit3} <span className="text-[10px] text-on-surface-variant font-normal">/ 30</span>
              </div>
              <button
                type="button"
                onClick={() => setScoreCrit3((v) => Math.min(30, Number((v + 0.5).toFixed(1))))}
                className="w-7 h-7 rounded-lg bg-surface-container-highest text-on-surface flex items-center justify-center active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <input
            type="range"
            min="0"
            max="30"
            step="0.5"
            value={scoreCrit3}
            onChange={(e) => setScoreCrit3(parseFloat(e.target.value) || 0)}
            className="w-full accent-primary cursor-pointer"
          />
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex justify-between">
            <label className="font-mono text-[10px] text-on-surface-variant uppercase">Participant Feedback</label>
            <span className="font-mono text-[10px] text-primary">Required Field</span>
          </div>
          <textarea
            rows={2}
            value={feedbackCrit3}
            onChange={(e) => setFeedbackCrit3(e.target.value)}
            className="w-full bg-surface-container-lowest rounded-xl p-2.5 text-on-surface text-xs border border-outline-variant/30 focus:outline-none"
          />
        </div>
      </section>

      {/* Confidential Internal Deliberation Note */}
      <section className="bg-surface-container rounded-2xl p-4 shadow-sm flex flex-col gap-2.5 border border-outline-variant/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-tertiary" />
            <h3 className="font-bold text-sm text-on-surface">Confidential Internal Jury Note</h3>
          </div>
          <span className="bg-tertiary-container/20 text-tertiary font-mono text-[10px] px-2 py-0.5 rounded uppercase border border-tertiary/30">
            Hidden from Team
          </span>
        </div>
        <p className="text-xs text-on-surface-variant">
          Private notes visible only to the Lead Organizer and Judging Panel during final deliberations.
        </p>
        <textarea
          rows={3}
          value={internalJuryNote}
          onChange={(e) => setInternalJuryNote(e.target.value)}
          className="w-full bg-surface-container-lowest rounded-xl p-3 text-on-surface text-xs border border-outline-variant/30 focus:outline-none"
        />
        <div className="flex items-center justify-between pt-1 text-on-surface-variant font-mono text-[10px]">
          <span>Logged by: Dr. E. Vance (#04)</span>
          <span className="text-tertiary flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>PGP-Secured</span>
          </span>
        </div>
      </section>

      {/* Sticky Mobile Action Footer */}
      <div className="fixed bottom-0 inset-x-0 z-40 bg-surface-container-lowest/95 backdrop-blur-xl p-3 shadow-2xl border-t border-outline-variant/30">
        <div className="max-w-md mx-auto flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleSave('draft')}
              className="flex-1 h-11 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-mono text-xs flex items-center justify-center gap-1.5 transition-colors border border-outline-variant/20"
            >
              <Save className="w-4 h-4" />
              <span>Save Draft</span>
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={() => handleSave('submitted')}
              className="flex-[2] h-11 rounded-xl bg-primary hover:bg-primary-fixed text-on-primary font-sans text-xs font-bold flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Finalize ({provisionalTotal}/100) →</span>
            </button>
          </div>
          <div className="flex items-center justify-center gap-1.5 text-center text-outline font-mono text-[10px]">
            <Lock className="w-3 h-3 text-tertiary" />
            <span>Submission locks evaluation and signs payload with Judge Node #04 key.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
