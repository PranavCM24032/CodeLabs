import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FlaskConical,
  ShieldCheck,
  Users,
  Award,
  Layers,
  ArrowRight,
  Sparkles,
  GitPullRequest,
  CheckCircle2,
  FileText,
  Sliders,
  Shield,
  Activity,
} from 'lucide-react';
import { useAuth, OWNER_EMAIL } from '../../context/AuthContext';
import {
  getEvents,
  getAllUsers,
  getAuditLogs,
} from '../../services/firestoreService';
import { HackathonEvent, UserProfile, AuditLog } from '../../types';

export const SuperadminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [events, setEvents] = useState<HackathonEvent[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [eList, uList, logs] = await Promise.all([
          getEvents(),
          getAllUsers().catch(() => []),
          getAuditLogs().catch(() => []),
        ]);
        setEvents(eList || []);
        setUsers(uList || []);
        setAuditLogs(logs || []);
      } catch (err) {
        console.error('Superadmin dashboard load error:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const activeEvent = events.length > 0 ? events[0] : null;
  const participantCount = users.filter((u) => u.role === 'participant').length;
  const analystCount = users.filter((u) => u.role === 'admin').length;
  const directorCount = users.filter((u) => u.role === 'superadmin').length;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Platform Owner Context Header */}
      <div className="clay-card-yellow p-6 sm:p-8 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-amber-200">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-amber-900">
              codeLab Root Director Clearance
            </span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-200/80 text-amber-900 font-mono text-[11px] font-bold border border-amber-300">
            <span>DIRECTOR: {OWNER_EMAIL}</span>
          </div>
        </div>

        <div className="mt-5 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
              Chemical Synthesis & Governance Console
            </h1>
            <p className="text-xs sm:text-sm text-stone-700 mt-1 max-w-xl leading-relaxed">
              Real-time oversight of hackathon specimen intake, forensic chromatography pipelines, catalytic rubrics, and published leaderboards.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <Link
              to="/events"
              className="clay-btn-orange py-2.5 px-4 rounded-xl text-xs font-bold flex items-center gap-1.5"
            >
              <span>{activeEvent?.title || 'Active Hackathons'}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Real Metrics KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* KPI 1: Real Registered Users */}
        <div className="clay-card p-5">
          <div className="flex justify-between items-center text-xs font-bold text-stone-600 mb-1">
            <span>Verified Identities</span>
            <span className="p-2 rounded-xl bg-amber-100 text-amber-800 border border-amber-200">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="text-3xl font-black text-stone-900 font-mono mt-1">
            {users.length}
          </div>
          <div className="flex items-center justify-between font-mono text-[10px] text-stone-600 pt-2 border-t border-stone-200 mt-2 font-semibold">
            <span>{participantCount} Synthesizers</span>
            <span>{analystCount} Analysts</span>
            <span>{directorCount} Root</span>
          </div>
        </div>

        {/* KPI 2: Active Events */}
        <div className="clay-card-green p-5">
          <div className="flex justify-between items-center text-xs font-bold text-emerald-900 mb-1">
            <span>Active Hackathons</span>
            <span className="p-2 rounded-xl bg-emerald-200 text-emerald-900 border border-emerald-300">
              <FlaskConical className="w-4 h-4" />
            </span>
          </div>
          <div className="text-3xl font-black text-emerald-950 font-mono mt-1">
            {events.length}
          </div>
          <p className="text-[11px] font-semibold text-emerald-800 mt-2">
            {activeEvent ? `${activeEvent.status.toUpperCase()} Stage` : 'Zero active'}
          </p>
        </div>

        {/* KPI 3: Audit Ledger Entries */}
        <div className="clay-card-orange p-5">
          <div className="flex justify-between items-center text-xs font-bold text-orange-900 mb-1">
            <span>Forensic Audit Ledger</span>
            <span className="p-2 rounded-xl bg-orange-200 text-orange-900 border border-orange-300">
              <Activity className="w-4 h-4" />
            </span>
          </div>
          <div className="text-3xl font-black text-orange-950 font-mono mt-1">
            {auditLogs.length}
          </div>
          <p className="text-[11px] font-semibold text-orange-800 mt-2">
            Immutable operation events
          </p>
        </div>

        {/* KPI 4: Standings & Leaderboard Gate */}
        <div className="clay-card-yellow p-5">
          <div className="flex justify-between items-center text-xs font-bold text-amber-900 mb-1">
            <span>Synthesis Release Gate</span>
            <span className="p-2 rounded-xl bg-amber-200 text-amber-900 border border-amber-300">
              <Award className="w-4 h-4" />
            </span>
          </div>
          <div className="text-3xl font-black text-amber-950 font-mono mt-1">
            {activeEvent?.status === 'completed' ? 'PUBLIC' : 'SEALED'}
          </div>
          <p className="text-[11px] font-semibold text-amber-800 mt-2">
            {activeEvent?.status === 'completed' ? 'Visible to participants' : 'Awaiting publication'}
          </p>
        </div>
      </div>

      {/* Operational Console Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <Link
          to="/superadmin/scoring"
          className="clay-card-yellow p-6 group hover:-translate-y-1 transition-transform flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-amber-200/90 text-amber-900 flex items-center justify-center mb-4 border border-amber-300 shadow-xs">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-stone-900 group-hover:text-amber-800 transition-colors">
              Scoring Synthesis & Release
            </h3>
            <p className="text-xs text-stone-600 mt-1.5 leading-relaxed">
              Review rubric aggregate calculations, toggle public leaderboard visibility, and export verified medal standings.
            </p>
          </div>
          <div className="mt-5 flex items-center gap-1.5 text-xs font-bold text-amber-800">
            <span>Manage Release Gate</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          to="/superadmin/problems"
          className="clay-card-green p-6 group hover:-translate-y-1 transition-transform flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-200/90 text-emerald-900 flex items-center justify-center mb-4 border border-emerald-300 shadow-xs">
              <FlaskConical className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-stone-900 group-hover:text-emerald-800 transition-colors">
              Challenge Problem Statements
            </h3>
            <p className="text-xs text-stone-600 mt-1.5 leading-relaxed">
              Configure track categories, squad capacity ceilings, and problem specs across active hackathon rounds.
            </p>
          </div>
          <div className="mt-5 flex items-center gap-1.5 text-xs font-bold text-emerald-800">
            <span>Configure Tracks</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          to="/superadmin/users"
          className="clay-card-orange p-6 group hover:-translate-y-1 transition-transform flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-2xl bg-orange-200/90 text-orange-900 flex items-center justify-center mb-4 border border-orange-300 shadow-xs">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-stone-900 group-hover:text-orange-800 transition-colors">
              User Clearance & Audit Ledger
            </h3>
            <p className="text-xs text-stone-600 mt-1.5 leading-relaxed">
              Promote evaluators to analyst permissions, inspect security audit events, and manage participant standings.
            </p>
          </div>
          <div className="mt-5 flex items-center gap-1.5 text-xs font-bold text-orange-800">
            <span>Open Security Console</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>

      {/* Recent Forensic Activity Log */}
      <div className="clay-card overflow-hidden">
        <div className="p-5 border-b border-stone-200/80 flex justify-between items-center bg-stone-50/60">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-amber-700" />
            <h3 className="font-black text-stone-900 text-sm">Recent Forensic Audit Activity</h3>
          </div>
          <span className="text-xs font-mono font-bold text-stone-500">{auditLogs.length} logged actions</span>
        </div>
        <div className="divide-y divide-stone-200/70">
          {auditLogs.slice(0, 5).map((log) => (
            <div key={log.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="flex items-start sm:items-center gap-3">
                <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-200">
                  {log.action}
                </span>
                <div>
                  <span className="font-bold text-stone-900">{log.details}</span>
                  <p className="text-[11px] text-stone-500 font-mono mt-0.5">By: {log.actorEmail}</p>
                </div>
              </div>
              <span className="text-[10px] text-stone-400 font-mono shrink-0">
                {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
          {auditLogs.length === 0 && (
            <div className="p-8 text-center text-stone-500 font-semibold text-xs">
              No audit records logged yet. Operations will be recorded here in real-time.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
