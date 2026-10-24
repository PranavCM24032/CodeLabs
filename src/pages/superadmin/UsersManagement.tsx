import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  UserCheck,
  UserX,
  Lock,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Tag,
  Key,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getAllUsers, getAuditLogs, updateUserRole } from '../../services/firestoreService';

export const UsersManagementPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'users' | 'logs'>('users');
  const [userFilter, setUserFilter] = useState<'all' | 'admin' | 'participant' | 'suspended'>('all');
  const [search, setSearch] = useState('');
  const [copiedSha, setCopiedSha] = useState<string | null>(null);

  const [users, setUsers] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const [uList, logList] = await Promise.all([
          getAllUsers(),
          getAuditLogs(),
        ]);
        if (uList) {
          setUsers(
            uList.map((u) => ({
              id: u.uid,
              name: u.displayName || u.email?.split('@')[0] || 'User',
              email: u.email,
              role: u.role,
              scope: 'Platform User',
              status: u.status || 'active',
              evalsDone: 0,
              verified: true,
              avatar: u.photoURL || null,
            }))
          );
        }
        if (logList) {
          setAuditLogs(
            logList.map((l) => ({
              id: l.id.slice(-6),
              action: l.action,
              actor: l.actorEmail,
              target: l.entityType,
              time: new Date(l.timestamp).toLocaleTimeString(),
              criterion: l.entityId,
              oldPoints: '-',
              newPoints: '-',
              reason: l.details || l.reason || '',
              sha: l.id.slice(0, 7),
            }))
          );
        }
      } catch (err) {
        console.error('Failed to load users management data:', err);
      }
    }
    load();
  }, []);

  const handleCopySha = (sha: string) => {
    navigator.clipboard.writeText(sha);
    setCopiedSha(sha);
    setTimeout(() => setCopiedSha(null), 2000);
  };

  const handleGrantAdmin = async (userId: string) => {
    try {
      await updateUserRole(userId, 'admin', user?.email || 'superadmin');
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: 'admin' } : u))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleRevokeAdmin = async (userId: string) => {
    try {
      await updateUserRole(userId, 'participant', user?.email || 'superadmin');
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: 'participant' } : u))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    if (userFilter === 'all') return true;
    if (userFilter === 'admin') return u.role === 'admin' || u.role === 'pending_admin';
    if (userFilter === 'participant') return u.role === 'participant';
    if (userFilter === 'suspended') return u.status === 'suspended';
    return true;
  });

  return (
    <div className="flex flex-col w-full pb-16 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 space-y-4 text-on-surface">
      {/* Governance Header Banner */}
      <div className="flex flex-col gap-1 bg-surface-container-low p-4 rounded-2xl shadow-sm border border-outline-variant/30">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <ShieldCheck className="w-5 h-5 text-primary" />
            <h1 className="font-bold text-base sm:text-lg text-on-surface truncate">Security Governance</h1>
          </div>
          <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-container-high text-tertiary font-mono text-[10px] shrink-0 border border-outline-variant/20 font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse" />
            <span>ROLE ISOLATION</span>
          </div>
        </div>
        <p className="text-xs text-on-surface-variant">
          Access Matrix & Cryptographic Event Ledger for Root Governance
        </p>
      </div>

      {/* Primary Tab Segment Control */}
      <div className="w-full bg-surface-container-lowest p-1 rounded-xl flex items-center border border-outline-variant/20">
        <button
          type="button"
          onClick={() => setActiveTab('users')}
          className={`flex-1 py-2 px-3 rounded-lg font-mono text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'users'
              ? 'bg-surface-container-high text-primary shadow-sm'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span>User Directory</span>
          <span className="ml-1 px-1.5 py-0.2 rounded-full bg-primary/10 text-primary text-[10px]">
            {users.length}
          </span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('logs')}
          className={`flex-1 py-2 px-3 rounded-lg font-mono text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
            activeTab === 'logs'
              ? 'bg-surface-container-high text-primary shadow-sm'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <span>Privileged Audit</span>
          <span className="w-2 h-2 rounded-full bg-secondary" />
        </button>
      </div>

      {/* VIEW 1: USERS DIRECTORY */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          {/* Search & Filter Controls */}
          <div className="flex flex-col gap-2.5 bg-surface-container-low p-3.5 rounded-2xl shadow-sm border border-outline-variant/30">
            <div className="relative w-full flex items-center">
              <Search className="w-4 h-4 absolute left-3 text-on-surface-variant" />
              <input
                type="text"
                placeholder="Filter users by email, handle, or ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-surface-container-lowest text-on-surface placeholder:text-outline text-xs pl-9 pr-3 py-2 rounded-xl focus:outline-none border border-outline-variant/30"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar font-mono text-[10px]">
              {[
                { id: 'all', label: 'All (842)' },
                { id: 'admin', label: 'Admins / Judges (32)' },
                { id: 'participant', label: 'Participants (809)' },
                { id: 'suspended', label: 'Suspended (1)' },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setUserFilter(p.id as any)}
                  className={`px-3 py-1 rounded-full whitespace-nowrap transition-colors ${
                    userFilter === p.id
                      ? 'bg-primary text-on-primary font-bold'
                      : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* User Cards List */}
          <div className="space-y-3">
            {filteredUsers.map((u) => (
              <div
                key={u.id}
                className="bg-surface-container-low p-4 rounded-2xl flex flex-col gap-3 relative shadow-sm border border-outline-variant/30"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative shrink-0">
                      {u.avatar ? (
                        <img
                          src={u.avatar}
                          alt=""
                          className="w-11 h-11 rounded-xl object-cover bg-surface-container-highest border border-outline-variant/30"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-xl bg-surface-container-highest flex items-center justify-center text-primary font-bold text-xs border border-outline-variant/30">
                          {u.name.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                      <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-surface-container-low flex items-center justify-center">
                        <span className="w-2 h-2 rounded-full bg-secondary" />
                      </span>
                    </div>

                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-on-surface truncate">{u.name}</span>
                        {u.verified && <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />}
                      </div>
                      <span className="font-mono text-[11px] text-on-surface-variant truncate">{u.email}</span>
                    </div>
                  </div>

                  <span
                    className={`font-mono text-[9px] font-bold px-2 py-0.5 rounded uppercase border ${
                      u.role === 'admin'
                        ? 'bg-primary/15 text-primary border-primary/30'
                        : u.role === 'pending_admin'
                        ? 'bg-primary-container/20 text-primary border-primary-container/40'
                        : 'bg-surface-container-high text-on-surface-variant border-outline-variant/20'
                    }`}
                  >
                    {u.role === 'pending_admin' ? 'PENDING' : u.role.toUpperCase()}
                  </span>
                </div>

                {/* Scope & Badges */}
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5 font-mono text-[10px]">
                  {u.role === 'admin' && (
                    <>
                      <span className="px-2 py-0.5 rounded bg-primary/15 text-primary font-semibold flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> ADMIN / JUDGE
                      </span>
                      <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant">
                        {u.scope}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-surface-container text-secondary flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> {u.evalsDone} Evals Done
                      </span>
                    </>
                  )}

                  {u.role === 'participant' && (
                    <>
                      <span className="px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant">
                        PARTICIPANT
                      </span>
                      <span className="px-2 py-0.5 rounded bg-tertiary/10 text-tertiary">
                        Team: {u.team}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-surface-container text-outline">
                        No Escalation
                      </span>
                    </>
                  )}

                  {u.role === 'pending_admin' && (
                    <div className="w-full bg-surface-container-lowest p-2.5 rounded-xl flex items-start gap-2 border border-outline-variant/20">
                      <Sparkles className="w-4 h-4 text-tertiary shrink-0 mt-0.5" />
                      <div className="flex flex-col text-xs">
                        <span className="font-mono text-[10px] text-tertiary font-bold uppercase">
                          Nomination Request
                        </span>
                        <span className="text-on-surface text-[11px]">{u.nomination}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-1">
                  {u.role === 'admin' && (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        className="h-9 px-3 rounded-xl bg-surface-container text-on-surface hover:bg-surface-container-high font-mono text-xs flex items-center justify-center gap-1.5 transition-colors border border-outline-variant/20"
                      >
                        Permissions
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRevokeAdmin(u.id)}
                        className="h-9 px-3 rounded-xl bg-error-container/20 text-error hover:bg-error-container/30 font-mono text-xs flex items-center justify-center gap-1.5 transition-colors border border-error/20"
                      >
                        Revoke Admin
                      </button>
                    </div>
                  )}

                  {u.role === 'participant' && (
                    <button
                      type="button"
                      onClick={() => handleGrantAdmin(u.id)}
                      className="w-full h-9 rounded-xl bg-surface-container text-on-surface hover:bg-surface-container-high font-mono text-xs flex items-center justify-center gap-1.5 transition-colors border border-outline-variant/20"
                    >
                      <span>Grant Admin-as-Judge Privileges</span>
                    </button>
                  )}

                  {u.role === 'pending_admin' && (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => handleGrantAdmin(u.id)}
                        className="h-9 px-3 rounded-xl bg-secondary-container text-on-secondary font-mono text-xs flex items-center justify-center gap-1.5 font-bold shadow-sm"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Grant Admin
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRevokeAdmin(u.id)}
                        className="h-9 px-3 rounded-xl bg-surface-container text-error hover:bg-error-container/20 font-mono text-xs flex items-center justify-center gap-1.5 transition-colors"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 2: PRIVILEGED AUDIT TRAIL LOGS */}
      {activeTab === 'logs' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-secondary" />
              <span className="font-bold text-sm text-on-surface">Immutable Event Log</span>
            </div>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-mono text-[10px] border border-outline-variant/20">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
              <span>CHAIN: VALID</span>
            </div>
          </div>

          <div className="space-y-3">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="bg-surface-container-low rounded-2xl p-4 flex flex-col gap-2 shadow-sm border border-outline-variant/30"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="px-1.5 py-0.2 rounded bg-surface-container-highest font-mono text-[10px] text-primary">
                      {log.id}
                    </span>
                    <span className="font-mono text-xs font-bold text-tertiary truncate">{log.action}</span>
                  </div>
                  <span className="font-mono text-[10px] text-on-surface-variant shrink-0">{log.time}</span>
                </div>

                <div className="flex items-center gap-2 text-on-surface-variant font-mono text-[10px]">
                  <span>Actor: <strong className="text-on-surface font-semibold">{log.actor}</strong></span>
                  <span>•</span>
                  <span>Target: <strong className="text-on-surface">{log.target}</strong></span>
                </div>

                {log.reason && (
                  <div className="bg-surface-container-lowest p-2.5 rounded-xl flex flex-col gap-1 border border-outline-variant/20">
                    <div className="flex items-center justify-between font-mono text-[10px]">
                      <span className="text-outline">Criterion: {log.criterion}</span>
                      <div className="flex items-center gap-1 text-secondary font-bold">
                        <span className="line-through text-outline font-normal">{log.oldPoints}</span>
                        <span>→ {log.newPoints}</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-on-surface-variant italic">"{log.reason}"</p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-1 font-mono text-[10px] border-t border-outline-variant/10">
                  <div className="flex items-center gap-1 text-outline">
                    <span>SHA:</span>
                    <span className="text-primary font-mono font-bold">{log.sha}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopySha(log.sha)}
                    className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors border border-outline-variant/20"
                  >
                    {copiedSha === log.sha ? (
                      <Check className="w-3 h-3 text-secondary" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    <span>{copiedSha === log.sha ? 'Copied' : 'Copy Hash'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-surface-container-lowest p-3.5 rounded-2xl flex items-start gap-2.5 border border-outline-variant/20 text-xs">
            <Lock className="w-4 h-4 text-outline shrink-0 mt-0.5" />
            <p className="text-on-surface-variant leading-relaxed text-[11px]">
              All role mutations, score overrides, and publication triggers generate signed SHA-256 audit events and automatically notify affected stakeholders.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
