import React, { useState, useEffect } from 'react';
import { CheckCircle2, Clock, Users, Award, Download, ArrowLeft, FlaskConical, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getEvents, getTeamsForEvent, getEvaluationsForEvent } from '../../services/firestoreService';
import { HackathonEvent, Team, Evaluation } from '../../types';

export const AdminReportsPage: React.FC = () => {
  const [activeEvent, setActiveEvent] = useState<HackathonEvent | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const evts = await getEvents();
        if (evts && evts.length > 0) {
          const evt = evts[0];
          setActiveEvent(evt);
          const [tList, eList] = await Promise.all([
            getTeamsForEvent(evt.id),
            getEvaluationsForEvent(evt.id),
          ]);
          setTeams(tList || []);
          setEvaluations(eList || []);
        }
      } catch (err) {
        console.error('Failed to load reports:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const completed = evaluations.filter((e) => e.status === 'submitted' || e.status === 'approved').length;
  const completionRate = teams.length > 0 ? Math.round((completed / teams.length) * 100) : 0;

  const averageScore =
    evaluations.length > 0
      ? (evaluations.reduce((sum, e) => sum + e.totalScore, 0) / evaluations.length).toFixed(1)
      : '0.0';

  const handleDownloadCsv = () => {
    const headers = ['Team ID', 'Team Name', 'Problem Statement', 'Status', 'Total Score'];
    const rows = teams.map((t) => {
      const ev = evaluations.find((e) => e.teamId === t.id);
      return [
        t.id,
        `"${t.name.replace(/"/g, '""')}"`,
        `"${(t.problemId || 'None').replace(/"/g, '""')}"`,
        ev ? ev.status : 'pending',
        ev ? ev.totalScore : 0,
      ];
    });

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `codeLab_evaluation_reports_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <Link
          to="/admin/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 hover:text-amber-900 mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Judge Dashboard
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
              Evaluation Reports & Analytics
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 mt-1">
              Evaluation completion rates and scoring distribution for {activeEvent?.title || 'active event'}.
            </p>
          </div>
          <button
            onClick={handleDownloadCsv}
            className="clay-btn-yellow self-start sm:self-auto px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2"
          >
            <Download className="w-4 h-4 text-amber-800" />
            <span>Export Results (CSV)</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="clay-card-green p-6">
          <span className="text-xs font-bold text-emerald-900 block mb-1">Evaluation Completion</span>
          <div className="text-3xl font-black text-emerald-950 font-mono">{completionRate}%</div>
          <div className="w-full bg-emerald-200/80 h-2.5 rounded-full overflow-hidden mt-3 border border-emerald-300">
            <div className="bg-emerald-600 h-full rounded-full transition-all duration-700" style={{ width: `${completionRate}%` }} />
          </div>
          <span className="text-[11px] font-semibold text-emerald-800 mt-2 block">{completed} of {teams.length} teams completed</span>
        </div>

        <div className="clay-card-yellow p-6">
          <span className="text-xs font-bold text-amber-900 block mb-1">Average Score</span>
          <div className="text-3xl font-black text-amber-950 font-mono">{averageScore}</div>
          <p className="text-[11px] font-semibold text-amber-800 mt-2">Across evaluated rubric dimensions</p>
        </div>

        <div className="clay-card-orange p-6">
          <span className="text-xs font-bold text-orange-900 block mb-1">Total Intake Squads</span>
          <div className="text-3xl font-black text-orange-950 font-mono">{teams.length}</div>
          <p className="text-[11px] font-semibold text-orange-800 mt-2">Enrolled in active hackathon event</p>
        </div>
      </div>

      {/* Progress Breakdown Table */}
      <div className="clay-card overflow-hidden">
        <div className="p-5 border-b border-stone-200/80 flex justify-between items-center bg-stone-50/60">
          <div className="flex items-center gap-2">
            <FlaskConical className="w-4 h-4 text-amber-700" />
            <h3 className="font-black text-stone-900 text-sm">Team Evaluation Matrix</h3>
          </div>
          <span className="text-xs font-mono font-bold text-stone-500">{teams.length} teams enrolled</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-100/80 border-b border-stone-200 text-stone-700 uppercase font-bold tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Team Name</th>
                <th className="py-3 px-4">Problem Code</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Awarded Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200/70 font-semibold text-stone-800">
              {teams.map((t) => {
                const ev = evaluations.find((e) => e.teamId === t.id);
                return (
                  <tr key={t.id} className="hover:bg-amber-50/40 transition-colors">
                    <td className="py-3.5 px-4 text-stone-900 font-bold">{t.name}</td>
                    <td className="py-3.5 px-4 text-stone-600 font-mono">{t.problemId || 'None'}</td>
                    <td className="py-3.5 px-4">
                      {ev ? (
                        <span className="clay-pill bg-emerald-100 text-emerald-800 border-emerald-200 text-[10px] capitalize">
                          {ev.status}
                        </span>
                      ) : (
                        <span className="clay-pill bg-amber-100 text-amber-800 border-amber-200 text-[10px]">
                          Pending Review
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-stone-900">
                      {ev ? `${ev.totalScore} pts` : '—'}
                    </td>
                  </tr>
                );
              })}
              {teams.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-stone-500 font-semibold">
                    No teams registered in this event yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
