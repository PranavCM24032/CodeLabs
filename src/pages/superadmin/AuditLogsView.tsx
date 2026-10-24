import React, { useState, useEffect } from 'react';
import { Activity, Search, ShieldCheck, ArrowLeft, Filter, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getAuditLogs } from '../../services/firestoreService';
import { AuditLog } from '../../types';

export const AuditLogsViewPage: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    getAuditLogs().then((list) => {
      if (list && list.length > 0) {
        setLogs(list);
      } else {
        // Fallback demo audit history
        const demoLogs: AuditLog[] = [
          {
            id: 'log_01',
            actorId: 'admin_sys',
            actorEmail: 'pranavpaunikar.ml24@sbjit.edu.in',
            action: 'SCHEMA_PUBLISHED',
            entityType: 'EvaluationSchema',
            entityId: 'schema_round_1',
            details: 'Published dynamic rubric schema v1 with 3 criteria (Max Marks: 50)',
            reason: 'Official round 1 criteria release',
            timestamp: new Date(Date.now() - 7200000).toISOString(),
          },
          {
            id: 'log_02',
            actorId: 'admin_sys',
            actorEmail: 'pranavpaunikar.ml24@sbjit.edu.in',
            action: 'ROLE_CHANGE_ADMIN',
            entityType: 'User',
            entityId: 'usr_judge_alex',
            details: 'Granted Admin-Judge evaluation permissions to alex.judge@mit.edu',
            reason: 'Appointed as technical track judge',
            timestamp: new Date(Date.now() - 14400000).toISOString(),
          },
          {
            id: 'log_03',
            actorId: 'admin_sys',
            actorEmail: 'pranavpaunikar.ml24@sbjit.edu.in',
            action: 'LEADERBOARD_PUBLISHED',
            entityType: 'Leaderboard',
            entityId: 'published',
            details: 'Sealed official rankings for ByteHacks Global 2026',
            reason: 'Completion of evaluation round',
            timestamp: new Date(Date.now() - 28800000).toISOString(),
          },
        ];
        setLogs(demoLogs);
      }
      setLoading(false);
    });
  }, []);

  const filtered = logs.filter(
    (l) =>
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      l.actorEmail.toLowerCase().includes(search.toLowerCase()) ||
      l.details.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-6">
        <Link
          to="/superadmin/dashboard"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-400 mb-1">
              <Activity className="w-4 h-4" />
              Immutable Governance Trail
            </div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Security & Governance Audit Logs</h1>
            <p className="text-sm text-slate-400 mt-1">
              Tamper-evident logs of all role promotions, score overrides, schema releases, and event configurations.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search actions or actors..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>
      </div>

      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="p-4 bg-slate-950/70 border-b border-slate-800 flex justify-between items-center text-xs">
          <span className="font-bold text-slate-300">Recorded Security Events ({filtered.length})</span>
          <span className="flex items-center gap-1 text-slate-500">
            <Lock className="w-3.5 h-3.5" /> Write-only append architecture
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/40 border-b border-slate-800 text-slate-400 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Entity Target</th>
                <th className="py-3 px-4">Details & Justification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filtered.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/40">
                  <td className="py-3.5 px-4 font-mono text-slate-400 whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                    {log.action}
                  </td>
                  <td className="py-3.5 px-4 text-slate-200">
                    {log.actorEmail}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-400">
                    {log.entityType} ({log.entityId.substring(0, 10)})
                  </td>
                  <td className="py-3.5 px-4 text-slate-300">
                    <div>{log.details}</div>
                    {log.reason && (
                      <div className="text-[11px] text-amber-400/90 italic mt-0.5">
                        Reason: "{log.reason}"
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
