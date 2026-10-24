import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  GitPullRequest,
  BarChart2,
  ArrowRight,
  FlaskConical,
  Dna,
  Binary,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  getEvents,
  getTeamsForEvent,
  getSubmissionsForEvent,
  getEvaluationsForEvent,
} from '../../services/firestoreService';
import { HackathonEvent, Team, Submission, Evaluation } from '../../types';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeEvent, setActiveEvent] = useState<HackathonEvent | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
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
        console.error('Error loading admin dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const pendingCount = teams.filter(
    (t) => !evaluations.some((e) => e.teamId === t.id && (e.status === 'submitted' || e.status === 'approved'))
  ).length;

  const completedCount = evaluations.filter((e) => e.status === 'submitted' || e.status === 'approved').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="clay-card-yellow p-6 sm:p-8 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-200/80 text-amber-900 border border-amber-300 font-mono text-xs font-bold mb-3 shadow-xs">
              <FlaskConical className="w-4 h-4 text-amber-700" />
              codeLab Analyst Station • {activeEvent?.title || 'Active Hackathon'}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
              Specimen Evaluation & Chromatography Queue
            </h1>
            <p className="text-xs sm:text-sm text-stone-700 mt-1 max-w-xl leading-relaxed">
              Analyze sealed specimen commits, verify chemical code chromatography, and apply catalytic rubric scores with full provenance assurance.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              to="/admin/judging"
              className="clay-btn-orange py-3 px-6 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-md"
            >
              Enter Evaluation Queue <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div className="clay-card p-5">
          <div className="flex justify-between items-center text-xs font-bold text-stone-600 mb-1">
            <span>Intake Squads</span>
            <span className="p-2 rounded-xl bg-amber-100 text-amber-800 border border-amber-200">
              <ShieldCheck className="w-4 h-4" />
            </span>
          </div>
          <div className="text-3xl font-black text-stone-900 font-mono mt-1">{teams.length}</div>
          <p className="text-[11px] font-semibold text-stone-500 mt-1">Across laboratory tracks</p>
        </div>

        <div className="clay-card p-5">
          <div className="flex justify-between items-center text-xs font-bold text-stone-600 mb-1">
            <span>Sealed Specimens</span>
            <span className="p-2 rounded-xl bg-emerald-100 text-emerald-800 border border-emerald-200">
              <GitPullRequest className="w-4 h-4" />
            </span>
          </div>
          <div className="text-3xl font-black text-stone-900 font-mono mt-1">{submissions.length}</div>
          <p className="text-[11px] font-semibold text-stone-500 mt-1">Frozen commit SHAs</p>
        </div>

        <div className="clay-card-orange p-5">
          <div className="flex justify-between items-center text-xs font-bold text-orange-900 mb-1">
            <span>Catalytic Review Pending</span>
            <span className="p-2 rounded-xl bg-orange-200 text-orange-900 border border-orange-300">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="text-3xl font-black text-orange-950 font-mono mt-1">{pendingCount}</div>
          <p className="text-[11px] font-semibold text-orange-800 mt-1">Awaiting multi-reagent scoring</p>
        </div>

        <div className="clay-card-green p-5">
          <div className="flex justify-between items-center text-xs font-bold text-emerald-900 mb-1">
            <span>Synthesized Evaluations</span>
            <span className="p-2 rounded-xl bg-emerald-200 text-emerald-900 border border-emerald-300">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="text-3xl font-black text-emerald-950 font-mono mt-1">{completedCount}</div>
          <p className="text-[11px] font-semibold text-emerald-800 mt-1">Sealed & finalized assays</p>
        </div>
      </div>

      {/* Quick Launch Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/admin/judging"
          className="clay-card-yellow p-6 group hover:-translate-y-1 transition-transform flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-amber-200/90 text-amber-900 flex items-center justify-center mb-4 border border-amber-300 shadow-xs">
              <FlaskConical className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-stone-900 group-hover:text-amber-800 transition-colors">
              Specimen Judging Queue
            </h3>
            <p className="text-xs text-stone-600 mt-1.5 leading-relaxed">
              Review assigned team specimens, enter chemical scores across rubrics, and lock evaluation certificates.
            </p>
          </div>
          <div className="mt-5 flex items-center gap-1.5 text-xs font-bold text-amber-800">
            <span>Open Reagent Queue</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          to="/admin/analysis/sub_aurora"
          className="clay-card-orange p-6 group hover:-translate-y-1 transition-transform flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-orange-200/90 text-orange-900 flex items-center justify-center mb-4 border border-orange-300 shadow-xs">
              <Dna className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-stone-900 group-hover:text-orange-800 transition-colors">
              Repository Forensic Chromatography
            </h3>
            <p className="text-xs text-stone-600 mt-1.5 leading-relaxed">
              Inspect commit cadence, isolate git author anomalies, and verify zero AST reagent collision.
            </p>
          </div>
          <div className="mt-5 flex items-center gap-1.5 text-xs font-bold text-orange-800">
            <span>Inspect Chromatography</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          to="/admin/reports"
          className="clay-card-green p-6 group hover:-translate-y-1 transition-transform flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-200/90 text-emerald-900 flex items-center justify-center mb-4 border border-emerald-300 shadow-xs">
              <BarChart2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-stone-900 group-hover:text-emerald-800 transition-colors">
              Synthesis Standings & Export
            </h3>
            <p className="text-xs text-stone-600 mt-1.5 leading-relaxed">
              Track evaluation progress percentages, inspect normal score curves, and download verified CSV ledgers.
            </p>
          </div>
          <div className="mt-5 flex items-center gap-1.5 text-xs font-bold text-emerald-800">
            <span>Generate Lab Reports</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>
    </div>
  );
};
