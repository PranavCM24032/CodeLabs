import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  LogIn,
  Copy,
  Check,
  Shield,
  UserPlus,
  AlertCircle,
  CheckCircle2,
  FlaskConical,
  Dna,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getEvents, getTeamsForEvent, saveTeam } from '../../services/firestoreService';
import { HackathonEvent, Team, TeamMember } from '../../types';

export const TeamsPage: React.FC = () => {
  const { user, profile } = useAuth();
  const [activeEvent, setActiveEvent] = useState<HackathonEvent | null>(null);
  const [myTeam, setMyTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Forms
  const [createTeamName, setCreateTeamName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      const events = await getEvents();
      if (events && events.length > 0) {
        const evt = events[0];
        setActiveEvent(evt);

        const teams = await getTeamsForEvent(evt.id);
        const userT = teams.find(
          (t) =>
            t.leaderId === user?.uid ||
            t.members?.some((m) => m.userId === user?.uid)
        );
        setMyTeam(userT || null);
      }
    } catch (err) {
      console.error('Error loading team data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !activeEvent) return;
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      if (myTeam) {
        throw new Error('You are already registered in a squad for this event. Leave your current squad first.');
      }

      const teamCode = `${createTeamName.slice(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;
      const newTeamId = `team_${Date.now()}`;

      const leaderMember: TeamMember = {
        userId: user.uid,
        email: user.email || '',
        displayName: profile?.displayName || user.displayName || 'Lead Chemist',
        role: 'leader',
        joinedAt: new Date().toISOString(),
      };

      const newTeam: Team = {
        id: newTeamId,
        eventId: activeEvent.id,
        name: createTeamName.trim(),
        code: teamCode,
        leaderId: user.uid,
        leaderEmail: user.email || '',
        members: [leaderMember],
        submissionStatus: 'not_submitted',
        createdAt: new Date().toISOString(),
      };

      await saveTeam(activeEvent.id, newTeam);
      setMyTeam(newTeam);
      setSuccess(`Laboratory Squad "${newTeam.name}" synthesized! Share intake code: ${teamCode}`);
      setCreateTeamName('');
    } catch (err: any) {
      setError(err.message || 'Failed to create squad.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleJoinTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !activeEvent) return;
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      if (myTeam) {
        throw new Error('You are already enrolled in an active laboratory squad.');
      }

      const cleanCode = joinCode.trim().toUpperCase();
      const allTeams = await getTeamsForEvent(activeEvent.id);
      const targetTeam = allTeams.find((t) => t.code.toUpperCase() === cleanCode);

      if (!targetTeam) {
        throw new Error('Invalid squad clearance code. No matching laboratory squad found.');
      }

      if (targetTeam.members.length >= activeEvent.maxTeamSize) {
        throw new Error(`This squad has reached the maximum capacity of ${activeEvent.maxTeamSize} researchers.`);
      }

      const newMember: TeamMember = {
        userId: user.uid,
        email: user.email || '',
        displayName: profile?.displayName || user.displayName || 'Synthesizer',
        role: 'member',
        joinedAt: new Date().toISOString(),
      };

      const updatedTeam: Team = {
        ...targetTeam,
        members: [...targetTeam.members, newMember],
      };

      await saveTeam(activeEvent.id, updatedTeam);
      setMyTeam(updatedTeam);
      setSuccess(`Joined squad ${updatedTeam.name} successfully!`);
      setJoinCode('');
    } catch (err: any) {
      setError(err.message || 'Failed to join squad.');
    } finally {
      setSubmitting(false);
    }
  };

  const copyCode = () => {
    if (myTeam?.code) {
      navigator.clipboard.writeText(myTeam.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-stone-600">
        <div className="w-10 h-10 border-4 border-amber-500/20 border-t-emerald-600 rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs font-semibold text-stone-700">Loading squad roster and clearances...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-mono text-[11px] font-bold mb-2 shadow-xs">
          <FlaskConical className="w-3.5 h-3.5 text-amber-700" />
          <span>codeLab Squad Formations</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
          Specimen Squad Management
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 mt-1">
          Form your research unit for <span className="font-bold text-amber-800">{activeEvent?.title || 'active hackathon'}</span>.
          Allowed squad capacity: {activeEvent?.minTeamSize || 1} to {activeEvent?.maxTeamSize || 4} members.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl clay-card-orange border-orange-300 flex items-start gap-2.5 text-xs text-orange-950 font-semibold shadow-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-orange-700 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-2xl clay-card-green border-emerald-300 flex items-start gap-2.5 text-xs text-emerald-950 font-semibold shadow-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-700 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      {myTeam ? (
        /* My Active Team Card */
        <div className="clay-card p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-stone-200">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-amber-100 text-amber-800 border border-amber-200">
                  <Users className="w-5 h-5" />
                </span>
                <h2 className="text-2xl font-black text-stone-900">{myTeam.name}</h2>
              </div>
              <p className="text-xs text-stone-500 font-medium mt-1">
                Formed on {new Date(myTeam.createdAt).toLocaleDateString()} • Lead Chemist: <span className="font-semibold text-stone-800">{myTeam.leaderEmail}</span>
              </p>
            </div>

            {/* Squad Clearance Code */}
            <div className="flex items-center gap-3 bg-amber-50/80 border border-amber-200 p-3 rounded-2xl">
              <div className="text-left">
                <span className="block text-[10px] font-bold text-amber-800 uppercase tracking-wider font-mono">
                  Clearance Code
                </span>
                <span className="font-mono text-base font-black text-stone-900 tracking-widest">{myTeam.code}</span>
              </div>
              <button
                onClick={copyCode}
                className="clay-btn-yellow p-2.5 rounded-xl text-amber-900 hover:text-stone-900 transition-colors"
                title="Copy squad intake code"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Members List */}
          <div>
            <h3 className="text-xs font-bold text-stone-600 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-amber-700" />
              <span>Squad Roster ({myTeam.members.length} / {activeEvent?.maxTeamSize || 4})</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {myTeam.members.map((m) => {
                const isLeader = m.role === 'leader';
                const isCurrent = m.userId === user?.uid;

                return (
                  <div
                    key={m.userId}
                    className="p-4 rounded-2xl bg-stone-50/90 border border-stone-200 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-amber-200 text-amber-900 border border-amber-300 flex items-center justify-center font-black text-sm">
                        {m.displayName ? m.displayName.slice(0, 2).toUpperCase() : 'CO'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-stone-900">{m.displayName || 'Analyst'}</span>
                          {isCurrent && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                              You
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-stone-500 font-mono">{m.email}</span>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                        isLeader
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-stone-200 text-stone-700'
                      }`}
                    >
                      {m.role}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-stone-200 flex justify-between items-center text-xs text-stone-600 font-medium">
            <span>Need more lab collaborators? Share your clearance code to intake teammates.</span>
          </div>
        </div>
      ) : (
        /* Team Actions: Create or Join */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Create Squad */}
          <div className="clay-card-yellow p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-200/90 border border-amber-300 flex items-center justify-center text-amber-900 mb-4 shadow-xs">
                <Plus className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-black text-stone-900 mb-1">Synthesize a New Squad</h2>
              <p className="text-xs text-stone-600 mb-6 leading-relaxed">
                Become the lead chemist. You will receive a unique intake code to distribute to your lab partners.
              </p>

              <form onSubmit={handleCreateTeam} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1.5">
                    Squad Identifier / Name
                  </label>
                  <input
                    type="text"
                    required
                    value={createTeamName}
                    onChange={(e) => setCreateTeamName(e.target.value)}
                    placeholder="e.g. Catalytic Synthesizers"
                    className="clay-input"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting || !createTeamName.trim()}
                  className="w-full clay-btn-primary py-3 px-4 rounded-2xl text-xs font-bold shadow-md disabled:opacity-50"
                >
                  {submitting ? 'Synthesizing Squad...' : 'Form Squad as Lead'}
                </button>
              </form>
            </div>
          </div>

          {/* Join Squad */}
          <div className="clay-card-orange p-6 sm:p-8 flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-orange-200/90 border border-orange-300 flex items-center justify-center text-orange-900 mb-4 shadow-xs">
                <LogIn className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-black text-stone-900 mb-1">Enter Existing Squad</h2>
              <p className="text-xs text-stone-600 mb-6 leading-relaxed">
                Provide the 6-character squad code supplied by your team lead to join their active research roster.
              </p>

              <form onSubmit={handleJoinTeam} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-stone-800 mb-1.5">
                    Squad Clearance Code
                  </label>
                  <input
                    type="text"
                    required
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    placeholder="e.g. CAT-592"
                    className="clay-input uppercase font-mono tracking-wider"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting || !joinCode.trim()}
                  className="w-full clay-btn-orange py-3 px-4 rounded-2xl text-xs font-bold shadow-md disabled:opacity-50"
                >
                  {submitting ? 'Verifying Code...' : 'Join Squad with Code'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
