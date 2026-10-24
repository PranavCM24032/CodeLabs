import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  Tag,
  ArrowRight,
  FlaskConical,
  Dna,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  getEvents,
  getProblemsForEvent,
  getTeamsForEvent,
  saveTeam,
  saveProblem,
} from '../../services/firestoreService';
import { HackathonEvent, ProblemStatement, Team } from '../../types';

export const ProblemsPage: React.FC = () => {
  const { user } = useAuth();
  const [activeEvent, setActiveEvent] = useState<HackathonEvent | null>(null);
  const [problems, setProblems] = useState<ProblemStatement[]>([]);
  const [userTeam, setUserTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTrack, setSelectedTrack] = useState<string>('all');
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [selectingId, setSelectingId] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const events = await getEvents();
      if (events && events.length > 0) {
        const evt = events[0];
        setActiveEvent(evt);

        const [probList, teamList] = await Promise.all([
          getProblemsForEvent(evt.id),
          getTeamsForEvent(evt.id),
        ]);

        setProblems(probList || []);
        const found = teamList.find(
          (t) =>
            t.leaderId === user?.uid ||
            t.members?.some((m) => m.userId === user?.uid)
        );
        setUserTeam(found || null);
      }
    } catch (err) {
      console.error('Error loading problems:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  const handleSelectProblem = async (problem: ProblemStatement) => {
    if (!activeEvent || !userTeam || !user) return;
    setActionMessage(null);

    // Leader only check
    if (userTeam.leaderId !== user.uid) {
      setActionMessage({
        type: 'error',
        text: 'Only the team leader can select or alter challenge tracks.',
      });
      return;
    }

    if (problem.currentCount >= problem.maxCapacity) {
      setActionMessage({
        type: 'error',
        text: 'This challenge track has reached maximum team capacity.',
      });
      return;
    }

    setSelectingId(problem.id);
    try {
      const updatedTeam: Team = {
        ...userTeam,
        problemId: problem.id,
      };
      await saveTeam(activeEvent.id, updatedTeam);

      const updatedProblem: ProblemStatement = {
        ...problem,
        currentCount: problem.currentCount + 1,
      };
      await saveProblem(activeEvent.id, updatedProblem);

      setUserTeam(updatedTeam);
      setProblems((prev) =>
        prev.map((p) => (p.id === problem.id ? updatedProblem : p))
      );

      setActionMessage({
        type: 'success',
        text: `Team "${userTeam.name}" successfully claimed track "${problem.title}"!`,
      });
    } catch (err: any) {
      setActionMessage({ type: 'error', text: err.message || 'Failed to claim challenge track.' });
    } finally {
      setSelectingId(null);
    }
  };

  const tracks = ['all', ...Array.from(new Set(problems.map((p) => p.track)))];

  const filtered = problems.filter((p) => {
    if (selectedTrack === 'all') return true;
    return p.track === selectedTrack;
  });

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-stone-600">
        <div className="w-10 h-10 border-4 border-amber-500/20 border-t-emerald-600 rounded-full animate-spin mx-auto mb-3" />
        <p className="text-xs font-semibold text-stone-700">Loading codeLab challenge tracks & specs...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header & Filter Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-mono text-[11px] font-bold mb-2 shadow-xs">
            <FlaskConical className="w-3.5 h-3.5 text-amber-700" />
            <span>codeLab Challenge Tracks</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
            Research Problem Statements & Tracks
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Claim an active challenge track for your team before the code freeze.
          </p>
        </div>

        {/* Track Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 p-1.5 rounded-2xl bg-stone-200/60 border border-stone-300/80 shadow-xs">
          {tracks.map((t) => (
            <button
              key={t}
              onClick={() => setSelectedTrack(t)}
              className={`px-3 py-1.5 rounded-xl capitalize text-xs font-bold transition-all ${
                selectedTrack === t
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-stone-700 hover:text-stone-950 hover:bg-stone-200/50'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {actionMessage && (
        <div
          className={`p-4 rounded-2xl flex items-start gap-3 text-xs font-semibold shadow-xs ${
            actionMessage.type === 'success'
              ? 'clay-card-green text-emerald-950 border-emerald-300'
              : 'clay-card-orange text-orange-950 border-orange-300'
          }`}
        >
          {actionMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-700 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-orange-700 mt-0.5" />
          )}
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* Team Status Banner */}
      {!userTeam && (
        <div className="clay-card-yellow p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2.5 text-amber-950 font-semibold">
            <AlertCircle className="w-5 h-5 text-amber-700 shrink-0" />
            <span>You must register or join a team before claiming a track.</span>
          </div>
          <Link
            to="/app/teams"
            className="clay-btn-orange px-4 py-2 rounded-xl text-xs font-bold shrink-0"
          >
            Form Team
          </Link>
        </div>
      )}

      {/* Problem Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((prob) => {
          const isSelectedByTeam = userTeam?.problemId === prob.id;
          const isFull = prob.currentCount >= prob.maxCapacity;

          return (
            <div
              key={prob.id}
              className={`clay-card p-6 flex flex-col justify-between transition-all ${
                isSelectedByTeam ? 'ring-2 ring-emerald-500 bg-emerald-50/40' : ''
              }`}
            >
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="font-mono text-[10px] uppercase font-black px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 border border-amber-300">
                    {prob.code}
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200">
                    {prob.difficulty}
                  </span>
                </div>

                <div className="text-xs text-amber-800 font-bold mb-1 flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-amber-700" />
                  {prob.track}
                </div>

                <h3 className="text-base font-black text-stone-900 mb-2 leading-snug">{prob.title}</h3>
                <p className="text-xs text-stone-600 leading-relaxed mb-4">{prob.summary}</p>

                <div className="p-3 rounded-xl bg-stone-100/90 border border-stone-200 mb-4 text-xs text-stone-700">
                  <div className="font-bold text-stone-800 mb-1 text-[11px]">Assay Scope & Benchmarks:</div>
                  <p className="line-clamp-3 text-stone-600 text-[11px] leading-relaxed">
                    {prob.description}
                  </p>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center text-xs text-stone-600 mb-4 border-t border-stone-200 pt-3 font-semibold">
                  <span>Squad Allocation:</span>
                  <span className="font-mono text-stone-900 font-bold">
                    {prob.currentCount} / {prob.maxCapacity} Claimed
                  </span>
                </div>

                {isSelectedByTeam ? (
                  <div className="w-full py-2.5 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-800 font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    Claimed by Your Squad
                  </div>
                ) : (
                  <button
                    onClick={() => handleSelectProblem(prob)}
                    disabled={!userTeam || isFull || selectingId === prob.id}
                    className="w-full py-2.5 rounded-2xl clay-btn-primary text-xs font-bold flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {selectingId === prob.id ? (
                      'Securing Track...'
                    ) : isFull ? (
                      'Capacity Full'
                    ) : (
                      <>
                        Claim This Research Track <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
