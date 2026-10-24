import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FlaskConical,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Search,
  ArrowRight,
  GitBranch,
  Layers,
  AlertCircle,
  FileEdit,
  Tag,
} from 'lucide-react';
import {
  getEvents,
  getTeamsForEvent,
  getSubmissionsForEvent,
  getEvaluationsForEvent,
} from '../../services/firestoreService';
import { HackathonEvent, Team, Submission, Evaluation } from '../../types';

export const JudgingQueuePage: React.FC = () => {
  const navigate = useNavigate();
  const [activeEvent, setActiveEvent] = useState<HackathonEvent | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'pending' | 'draft' | 'completed'>('all');

  useEffect(() => {
    async function load() {
      try {
        const evts = await getEvents();
        if (evts && evts.length > 0) {
          const evt = evts[0];
          setActiveEvent(evt);

          const [tList, sList, eList] = await Promise.all([
            getTeamsForEvent(evt.id),
            getSubmissionsForEvent(evt.id),
            getEvaluationsForEvent(evt.id),
          ]);

          setTeams(tList || []);
          setSubmissions(sList || []);
          setEvaluations(eList || []);
        }
      } catch (err) {
        console.error('Error loading judging queue:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const queueItems = teams.map((team) => {
    const sub = submissions.find((s) => s.teamId === team.id);
    const evalItem = evaluations.find((e) => e.teamId === team.id);
    const status: 'pending' | 'draft' | 'completed' = evalItem
      ? evalItem.status === 'submitted' || evalItem.status === 'approved'
        ? 'completed'
        : 'draft'
      : 'pending';

    return {
      id: team.id,
      name: team.name,
      problemStatement: team.problemId || 'General Track Specimen',
      code: team.code,
      status,
      sha: sub?.frozenCommitSha ? sub.frozenCommitSha.slice(0, 7) : 'Not frozen',
      hasSubmission: !!sub,
      totalScore: evalItem?.totalScore || 0,
      scoresCount: evalItem?.scores ? Object.keys(evalItem.scores).length : 0,
      evaluator: evalItem?.judgeEmail,
    };
  });

  const pendingCount = queueItems.filter((i) => i.status === 'pending').length;
  const draftCount = queueItems.filter((i) => i.status === 'draft').length;
  const completedCount = queueItems.filter((i) => i.status === 'completed').length;

  const filteredItems = queueItems.filter((item) => {
    const matchSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.problemStatement.toLowerCase().includes(search.toLowerCase()) ||
      item.code.toLowerCase().includes(search.toLowerCase());
    if (!matchSearch) return false;
    if (filterTab === 'all') return true;
    return item.status === filterTab;
  });

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center text-stone-600">
        <div className="w-10 h-10 border-4 border-amber-500/20 border-t-emerald-600 rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs font-semibold text-stone-700">Loading chemical evaluation queue and specimens...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Banner */}
      <div className="clay-card-yellow p-6 sm:p-7 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-amber-200">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-amber-900">
              codeLab Analyst Queue
            </span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-200/80 text-amber-950 font-mono text-[11px] font-bold border border-amber-300">
            <span>{activeEvent?.title || 'Active Hackathon'}</span>
          </div>
        </div>

        <div className="mt-5 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
              Specimen Judging &amp; Multi-Reagent Assays
            </h1>
            <p className="text-xs sm:text-sm text-stone-700 mt-1 max-w-xl leading-relaxed">
              Examine sealed commit SHAs, record criterion-level rubric scores, and publish verified certificates.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              to="/admin/reports"
              className="clay-btn-orange py-2.5 px-4 rounded-xl text-xs font-bold flex items-center gap-1.5"
            >
              <span>View Assay Reports</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="clay-card p-4 text-center">
          <div className="text-2xl font-black text-stone-900 font-mono">{queueItems.length}</div>
          <div className="text-[11px] font-bold text-stone-500 uppercase tracking-wider mt-0.5">Assigned Squads</div>
        </div>
        <div className="clay-card-orange p-4 text-center">
          <div className="text-2xl font-black text-orange-950 font-mono">{pendingCount}</div>
          <div className="text-[11px] font-bold text-orange-800 uppercase tracking-wider mt-0.5">Pending Review</div>
        </div>
        <div className="clay-card-yellow p-4 text-center">
          <div className="text-2xl font-black text-amber-950 font-mono">{draftCount}</div>
          <div className="text-[11px] font-bold text-amber-800 uppercase tracking-wider mt-0.5">In Draft</div>
        </div>
        <div className="clay-card-green p-4 text-center">
          <div className="text-2xl font-black text-emerald-950 font-mono">{completedCount}</div>
          <div className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider mt-0.5">Sealed &amp; Done</div>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setFilterTab('all')}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
              filterTab === 'all'
                ? 'clay-btn-primary'
                : 'clay-card hover:bg-stone-100 text-stone-700'
            }`}
          >
            All Squads ({queueItems.length})
          </button>
          <button
            onClick={() => setFilterTab('pending')}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
              filterTab === 'pending'
                ? 'clay-btn-orange'
                : 'clay-card hover:bg-stone-100 text-stone-700'
            }`}
          >
            Pending ({pendingCount})
          </button>
          <button
            onClick={() => setFilterTab('draft')}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
              filterTab === 'draft'
                ? 'clay-btn-yellow'
                : 'clay-card hover:bg-stone-100 text-stone-700'
            }`}
          >
            Drafts ({draftCount})
          </button>
          <button
            onClick={() => setFilterTab('completed')}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
              filterTab === 'completed'
                ? 'clay-btn-primary'
                : 'clay-card hover:bg-stone-100 text-stone-700'
            }`}
          >
            Sealed ({completedCount})
          </button>
        </div>

        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search specimen team, challenge code, or track..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="clay-input pl-10"
          />
        </div>
      </div>

      {/* Queue Cards */}
      <div className="space-y-3">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className={`clay-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-transform hover:-translate-y-0.5 ${
              item.status === 'completed'
                ? 'bg-emerald-50/50'
                : item.status === 'draft'
                ? 'bg-amber-50/50'
                : ''
            }`}
          >
            <div className="min-w-0 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-black text-base text-stone-900 truncate">{item.name}</h3>
                <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-lg bg-amber-100 text-amber-900 border border-amber-200">
                  {item.code}
                </span>
                <span
                  className={`clay-pill text-[10px] font-bold ${
                    item.status === 'completed'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : item.status === 'draft'
                      ? 'bg-amber-100 text-amber-800 border-amber-300'
                      : 'bg-stone-100 text-stone-700 border-stone-200'
                  }`}
                >
                  {item.status.toUpperCase()}
                </span>
              </div>

              <p className="text-xs text-stone-600 font-medium">
                Problem: <span className="font-semibold text-stone-800">{item.problemStatement}</span>
              </p>

              <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500 font-mono pt-1">
                <span className="flex items-center gap-1">
                  <GitBranch className="w-3.5 h-3.5 text-stone-400" />
                  <span>SHA: <strong className="text-stone-800">{item.sha}</strong></span>
                </span>
                {item.status === 'completed' && (
                  <span className="font-bold text-emerald-800">
                    Awarded: {item.totalScore} pts
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Link
                to={`/admin/evaluate/${item.id}`}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm ${
                  item.status === 'completed'
                    ? 'clay-btn-yellow'
                    : item.status === 'draft'
                    ? 'clay-btn-orange'
                    : 'clay-btn-primary'
                }`}
              >
                <span>{item.status === 'completed' ? 'Re-inspect Score' : 'Open Assay Form'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}

        {filteredItems.length === 0 && (
          <div className="clay-card p-12 text-center text-stone-500 font-semibold text-xs">
            {teams.length === 0
              ? 'No specimen squads enrolled in this hackathon yet.'
              : 'No squads match the current filter or search criteria.'}
          </div>
        )}
      </div>
    </div>
  );
};
