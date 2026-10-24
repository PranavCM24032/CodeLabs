import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Copy,
  Check,
  Terminal,
  ShieldCheck,
  Activity,
  History,
  Lock,
  Layers,
  ArrowRight,
  Fingerprint,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  getEvents,
  getSubmissionsForEvent,
  getAnalysisJobsForEvent,
  recordAuditLog,
} from '../../services/firestoreService';
import { Submission, AnalysisJob } from '../../types';

export const RepoForensicsView: React.FC = () => {
  const { submissionId } = useParams<{ submissionId: string }>();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'overview' | 'timeline' | 'ast' | 'diff' | 'contributors'>('overview');
  const [copiedSha, setCopiedSha] = useState(false);
  const [auditDecision, setAuditDecision] = useState<'verified' | 'flagged'>('verified');
  const [judgeNotes, setJudgeNotes] = useState(
    'Clean implementation, verified commit history shows progressive iterative development across team members.'
  );
  const [decisionSaved, setDecisionSaved] = useState(false);

  const handleCopySha = () => {
    navigator.clipboard.writeText('7a82f0e8cb14');
    setCopiedSha(true);
    setTimeout(() => setCopiedSha(false), 2000);
  };

  const handleSaveDecision = async () => {
    if (user) {
      await recordAuditLog({
        actorId: user.uid,
        actorEmail: user.email || '',
        action: `FORENSIC_DECISION_${auditDecision.toUpperCase()}`,
        entityType: 'SubmissionForensics',
        entityId: submissionId || 'sub_bytecrafters',
        details: `Judge marked submission as ${auditDecision}. Notes: ${judgeNotes}`,
      });
      setDecisionSaved(true);
    }
  };

  return (
    <div className="flex flex-col w-full pb-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 space-y-4 text-on-surface">
      {/* Sub-Header / Identity Bar */}
      <div className="flex flex-col space-y-2 bg-surface-container-low p-4 rounded-2xl shadow-md border border-outline-variant/30">
        <div className="flex items-center justify-between">
          <Link
            to="/admin/judging"
            className="inline-flex items-center gap-1 text-primary hover:text-primary-fixed font-mono text-xs transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Queue</span>
          </Link>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-secondary-container/30 text-secondary font-mono text-[10px] uppercase font-bold border border-secondary-container/40">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-ping" />
            Automated Forensics Passed
          </span>
        </div>

        <div className="flex items-baseline justify-between pt-1">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-on-surface tracking-tight">ByteCrafters</h1>
            <p className="text-xs text-on-surface-variant">Track: Distributed Systems • PS-04 Event Streaming</p>
          </div>
          <div className="flex items-center gap-1.5 bg-surface-container-highest px-2.5 py-1 rounded-xl text-on-surface border border-outline-variant/30">
            <CheckCircle2 className="w-3.5 h-3.5 text-secondary" />
            <span className="font-mono text-xs font-semibold">7a82f0e8cb14</span>
            <button
              onClick={handleCopySha}
              className="text-on-surface-variant hover:text-on-surface ml-1"
              title="Copy Freeze SHA"
            >
              {copiedSha ? <Check className="w-3.5 h-3.5 text-secondary" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center overflow-x-auto space-x-1 bg-surface-container-lowest p-1 rounded-xl border border-outline-variant/20">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'timeline', label: 'Commit Timeline (46)' },
          { id: 'ast', label: 'AST Similarity' },
          { id: 'diff', label: 'Diff Inspector' },
          { id: 'contributors', label: 'Contributors (4)' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3 py-1.5 rounded-lg font-mono text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === tab.id
                ? 'bg-surface-container-high text-primary shadow-sm'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Repository Metadata Card */}
      <div className="bg-surface-container-low rounded-2xl p-4 sm:p-5 shadow-md border border-outline-variant/30 space-y-3">
        <div className="flex items-center justify-between pb-1 border-b border-outline-variant/20">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-primary" />
            <span className="font-bold text-sm text-on-surface">Repository Manifest</span>
          </div>
          <span className="font-mono text-[10px] text-secondary bg-surface-container-highest px-2 py-0.5 rounded font-bold border border-outline-variant/30">
            LOCKED & CRYPTO-SEALED
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="bg-surface-container p-2.5 rounded-xl flex flex-col justify-between border border-outline-variant/20">
            <span className="font-mono text-[10px] text-on-surface-variant uppercase">Host & Branch</span>
            <span className="font-mono text-xs font-semibold text-on-surface mt-1 truncate">GHE / main</span>
          </div>
          <div className="bg-surface-container p-2.5 rounded-xl flex flex-col justify-between border border-outline-variant/20">
            <span className="font-mono text-[10px] text-on-surface-variant uppercase">Code Volume</span>
            <span className="font-mono text-xs font-semibold text-on-surface mt-1">14 files • 3,420 SLOC</span>
          </div>
          <div className="bg-surface-container p-2.5 rounded-xl flex flex-col justify-between border border-outline-variant/20">
            <span className="font-mono text-[10px] text-on-surface-variant uppercase">Benchmarks</span>
            <span className="font-mono text-xs font-semibold text-secondary mt-1">5/5 Passed (120k m/s)</span>
          </div>
          <div className="bg-surface-container p-2.5 rounded-xl flex flex-col justify-between border border-outline-variant/20">
            <span className="font-mono text-[10px] text-on-surface-variant uppercase">Post-Freeze</span>
            <span className="font-mono text-xs font-semibold text-secondary mt-1">0 Commits (Verified)</span>
          </div>
        </div>
      </div>

      {/* Commit Velocity & Cadence Sparkline */}
      <div className="bg-surface-container-low rounded-2xl p-4 sm:p-5 shadow-md border border-outline-variant/30 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-bold text-sm text-on-surface">Commit Velocity & Cadence</h2>
            <p className="text-xs text-on-surface-variant">48-Hour Hackathon Continuous Telemetry</p>
          </div>
          <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-surface-container text-secondary flex items-center gap-1 font-semibold border border-outline-variant/20">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
            Organic Cadence
          </span>
        </div>

        {/* Inline SVG Sparkline */}
        <div className="bg-surface-container-lowest p-3 rounded-xl space-y-2 border border-outline-variant/20">
          <div className="h-20 w-full relative">
            <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 320 80">
              <line stroke="#31353c" strokeDasharray="2,2" strokeWidth="0.5" x1="0" x2="320" y1="20" y2="20" />
              <line stroke="#31353c" strokeDasharray="2,2" strokeWidth="0.5" x1="0" x2="320" y1="50" y2="50" />
              <polygon
                fill="#86efac"
                fillOpacity="0.25"
                points="0,75 15,70 35,55 55,62 80,40 100,48 125,30 150,38 180,22 210,35 240,18 270,30 295,15 320,25 320,80 0,80"
              />
              <polyline
                fill="none"
                points="0,75 15,70 35,55 55,62 80,40 100,48 125,30 150,38 180,22 210,35 240,18 270,30 295,15 320,25"
                stroke="#16a34a"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
              />
              <circle cx="80" cy="40" fill="#7bdb80" r="2.5" />
              <circle cx="180" cy="22" fill="#7bdb80" r="2.5" />
              <circle cx="240" cy="18" fill="#7bdb80" r="2.5" />
              <circle cx="295" cy="15" fill="#7bdb80" r="2.5" />
            </svg>
          </div>
          <div className="flex justify-between font-mono text-[10px] text-on-surface-variant">
            <span>T+0h (Kickoff)</span>
            <span>T+24h (Midway)</span>
            <span>T+48h (Freeze)</span>
          </div>
        </div>

        {/* Author Contribution Distribution */}
        <div className="space-y-1.5 pt-1">
          <div className="flex justify-between font-mono text-[10px] text-on-surface-variant">
            <span>Author Commits Balance</span>
            <span className="text-secondary font-medium">Equitable Spread (Gini 0.12)</span>
          </div>
          <div className="h-2 w-full rounded-full bg-surface-container-highest overflow-hidden flex">
            <div className="h-full bg-primary" style={{ width: '32%' }} title="Aarav: 32%" />
            <div className="h-full bg-secondary" style={{ width: '28%' }} title="Kevin: 28%" />
            <div className="h-full bg-tertiary" style={{ width: '22%' }} title="Priya: 22%" />
            <div className="h-full bg-primary-container" style={{ width: '18%' }} title="Dev: 18%" />
          </div>
          <div className="grid grid-cols-4 gap-1.5 pt-1 font-mono text-[10px] text-center">
            <div className="bg-surface-container py-1 rounded text-on-surface">Aarav <span className="text-primary font-bold">32%</span></div>
            <div className="bg-surface-container py-1 rounded text-on-surface">Kevin <span className="text-secondary font-bold">28%</span></div>
            <div className="bg-surface-container py-1 rounded text-on-surface">Priya <span className="text-tertiary font-bold">22%</span></div>
            <div className="bg-surface-container py-1 rounded text-on-surface">Dev <span className="text-primary-container font-bold">18%</span></div>
          </div>
        </div>
      </div>

      {/* Code Similarity & AST Fingerprint Engine */}
      <div className="bg-surface-container-low rounded-2xl p-4 sm:p-5 shadow-md border border-outline-variant/30 space-y-3">
        <div className="flex items-center justify-between pb-1 border-b border-outline-variant/20">
          <div className="flex items-center gap-1.5">
            <Fingerprint className="w-4 h-4 text-tertiary" />
            <h2 className="font-bold text-sm text-on-surface">AST Fingerprint Engine</h2>
          </div>
          <span className="font-mono text-[10px] bg-surface-container px-2 py-0.5 rounded text-tertiary">
            v3.4.1 Rust/LLVM
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="bg-surface-container-lowest p-3 rounded-xl flex flex-col items-center text-center justify-center border border-outline-variant/20">
            <span className="text-2xl font-bold text-secondary">0.0%</span>
            <span className="font-mono text-[10px] text-on-surface-variant mt-0.5">Cross-Team Overlap</span>
            <span className="font-mono text-[10px] text-secondary bg-surface-container px-1.5 py-0.5 rounded mt-1.5 font-semibold">
              Clean Provenance
            </span>
          </div>

          <div className="bg-surface-container-lowest p-3 rounded-xl flex flex-col items-center text-center justify-center border border-outline-variant/20">
            <span className="text-2xl font-bold text-tertiary">1.2%</span>
            <span className="font-mono text-[10px] text-on-surface-variant mt-0.5">Public OSS Match</span>
            <span className="font-mono text-[10px] text-on-surface-variant bg-surface-container px-1.5 py-0.5 rounded mt-1.5 truncate max-w-full">
              tokio, crossbeam
            </span>
          </div>
        </div>

        <div className="bg-surface-container p-2.5 rounded-xl space-y-1.5 text-xs border border-outline-variant/20">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-on-surface">
              <CheckCircle2 className="w-3.5 h-3.5 text-secondary" /> Late Bulk Dumps
            </span>
            <span className="font-mono text-[11px] text-on-surface-variant font-medium">Negative (0 anomalous)</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-on-surface">
              <CheckCircle2 className="w-3.5 h-3.5 text-secondary" /> Obfuscation / Minification
            </span>
            <span className="font-mono text-[11px] text-on-surface-variant font-medium">Clean</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-on-surface">
              <CheckCircle2 className="w-3.5 h-3.5 text-secondary" /> Squash / History Rewrite
            </span>
            <span className="font-mono text-[11px] text-on-surface-variant font-medium">Intact DAG Graph</span>
          </div>
        </div>
      </div>

      {/* Code Evidence Viewer Snippet */}
      <div className="bg-surface-container-low rounded-2xl p-4 sm:p-5 shadow-md border border-outline-variant/30 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Terminal className="w-4 h-4 text-primary" />
            <span className="font-mono text-xs font-semibold text-on-surface truncate">
              src/engine/ring_buffer.rs:42-88
            </span>
          </div>
          <span className="font-mono text-[10px] text-primary bg-surface-container px-2 py-0.5 rounded font-bold">
            AST Node Match: 0%
          </span>
        </div>

        {/* Syntax Code Block */}
        <div className="bg-surface-container-lowest p-3 rounded-xl overflow-x-auto text-left font-mono text-[11px] leading-relaxed border border-outline-variant/20">
          <div className="text-on-surface-variant flex gap-2">
            <span className="w-6 text-right text-outline select-none">42</span>
            <span className="text-primary-container font-semibold">pub struct</span>
            <span className="text-on-surface">LockFreeRingBuffer&lt;T&gt; &#123;</span>
          </div>
          <div className="text-on-surface-variant flex gap-2">
            <span className="w-6 text-right text-outline select-none">43</span>
            <span className="pl-4">head: <span className="text-tertiary">AtomicUsize</span>,</span>
          </div>
          <div className="text-on-surface-variant flex gap-2">
            <span className="w-6 text-right text-outline select-none">44</span>
            <span className="pl-4">tail: <span className="text-tertiary">AtomicUsize</span>,</span>
          </div>
          <div className="text-on-surface-variant flex gap-2">
            <span className="w-6 text-right text-outline select-none">45</span>
            <span className="pl-4">capacity: <span className="text-tertiary">usize</span>,</span>
          </div>
          <div className="text-on-surface-variant flex gap-2">
            <span className="w-6 text-right text-outline select-none">46</span>
            <span>&#125;</span>
          </div>
          <div className="text-on-surface-variant flex gap-2 bg-surface-container/60">
            <span className="w-6 text-right text-outline select-none">47</span>
            <span className="text-primary-container font-semibold">impl</span>
            <span className="text-on-surface">&lt;T&gt; LockFreeRingBuffer&lt;T&gt; &#123;</span>
          </div>
          <div className="text-on-surface-variant flex gap-2 bg-surface-container/60">
            <span className="w-6 text-right text-outline select-none">48</span>
            <span className="text-primary-container font-semibold pl-4">pub fn</span>
            <span className="text-secondary">push</span>
            <span className="text-on-surface">(&amp;self, item: T) -&gt; Result&lt;(), T&gt; &#123;</span>
          </div>
          <div className="text-on-surface-variant flex gap-2 bg-surface-container/60">
            <span className="w-6 text-right text-outline select-none">49</span>
            <span className="pl-8 text-on-surface">let current_tail = self.tail.load(Ordering::Acquire);</span>
          </div>
          <div className="text-on-surface-variant flex gap-2 bg-surface-container/60">
            <span className="w-6 text-right text-outline select-none">50</span>
            <span className="pl-8 text-on-surface">if (current_tail + 1) % self.capacity == self.head.load(Ordering::Relaxed) &#123;</span>
          </div>
          <div className="text-on-surface-variant flex gap-2 bg-surface-container/60">
            <span className="w-6 text-right text-outline select-none">51</span>
            <span className="pl-12 text-error">return Err(item);</span>
          </div>
          <div className="text-on-surface-variant flex gap-2">
            <span className="w-6 text-right text-outline select-none">52</span>
            <span className="pl-8">&#125;</span>
          </div>
          <div className="text-on-surface-variant flex gap-2">
            <span className="w-6 text-right text-outline select-none">53</span>
            <span className="pl-8 text-on-surface">self.tail.store((current_tail + 1) % self.capacity, Ordering::Release);</span>
          </div>
          <div className="text-on-surface-variant flex gap-2">
            <span className="w-6 text-right text-outline select-none">54</span>
            <span className="pl-8 text-secondary">Ok(())</span>
          </div>
          <div className="text-on-surface-variant flex gap-2">
            <span className="w-6 text-right text-outline select-none">55</span>
            <span className="pl-4">&#125;</span>
          </div>
          <div className="text-on-surface-variant flex gap-2">
            <span className="w-6 text-right text-outline select-none">56</span>
            <span>&#125;</span>
          </div>
        </div>

        {/* Evaluator Audit Note */}
        <div className="bg-surface-container p-3 rounded-xl flex items-start gap-2.5 border border-outline-variant/20">
          <ShieldCheck className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
          <div className="text-xs">
            <p className="font-bold text-on-surface">Evaluator Audit Note</p>
            <p className="text-on-surface-variant mt-0.5 leading-relaxed">
              Lock-free atomic pointer rotation verified authentic. Original logic does not match any known public repository in the GitTrack global corpus.
            </p>
          </div>
        </div>
      </div>

      {/* Judge Verification Decision Form */}
      <div className="bg-surface-container-low rounded-2xl p-4 sm:p-5 shadow-md border border-outline-variant/30 space-y-3">
        <h3 className="font-bold text-sm text-on-surface">Judge Verification Decision</h3>

        <div className="space-y-2">
          <label className="flex items-start gap-3 p-3 rounded-xl bg-surface-container hover:bg-surface-container-high transition cursor-pointer border border-outline-variant/20">
            <input
              type="radio"
              name="audit_decision"
              checked={auditDecision === 'verified'}
              onChange={() => setAuditDecision('verified')}
              className="mt-1 accent-primary w-4 h-4"
            />
            <div className="flex flex-col text-xs">
              <span className="font-bold text-on-surface">Mark as Verified Authentic</span>
              <span className="text-on-surface-variant mt-0.5">
                Code provenance, commit cadence, and AST trees confirm genuine hackathon implementation.
              </span>
            </div>
          </label>

          <label className="flex items-start gap-3 p-3 rounded-xl bg-surface-container hover:bg-surface-container-high transition cursor-pointer border border-outline-variant/20">
            <input
              type="radio"
              name="audit_decision"
              checked={auditDecision === 'flagged'}
              onChange={() => setAuditDecision('flagged')}
              className="mt-1 accent-primary w-4 h-4"
            />
            <div className="flex flex-col text-xs">
              <span className="font-bold text-error">Flag for Secondary Committee Review</span>
              <span className="text-on-surface-variant mt-0.5">
                Trigger deep manual AST decompilation due to questionable cadence or diff variance.
              </span>
            </div>
          </label>
        </div>

        <div className="space-y-1">
          <label className="font-mono text-[10px] text-on-surface-variant uppercase">
            Forensic Evaluation Notes (Audit Trail)
          </label>
          <textarea
            rows={3}
            value={judgeNotes}
            onChange={(e) => setJudgeNotes(e.target.value)}
            className="w-full bg-surface-container-lowest text-on-surface text-xs p-3 rounded-xl focus:outline-none border border-outline-variant/30"
          />
        </div>
      </div>

      {/* CTA Bottom Bar */}
      <div className="pt-2 flex flex-col gap-2">
        <Link
          to={`/admin/evaluations/team_bytecrafters`}
          onClick={handleSaveDecision}
          className="w-full h-12 bg-primary-container hover:bg-primary text-on-primary-container hover:text-on-primary font-sans text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg active:scale-[0.99] transition-all"
        >
          <span>Proceed to Evaluation Rubric</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
        <p className="text-center font-mono text-[10px] text-on-surface-variant">
          All forensic audits will be cryptographically appended to Dr. E. Vance's signature.
        </p>
      </div>
    </div>
  );
};
