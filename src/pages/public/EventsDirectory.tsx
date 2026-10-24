import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getEvents } from '../../services/firestoreService';
import { HackathonEvent } from '../../types';
import { Search, Calendar, ArrowRight, FlaskConical, Users, Award, Circle, Square } from 'lucide-react';

export const EventsDirectory: React.FC = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<HackathonEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'ongoing' | 'upcoming' | 'past'>('all');

  useEffect(() => {
    getEvents().then((list) => {
      if (list && list.length > 0) {
        setEvents(list);
      } else {
        setEvents([
          {
            id: 'event-hackgrid-2025',
            title: 'InterCollege HackGrid 2025: Distributed Chemical Synthesis',
            description:
              'State-wide engineering championship challenging teams to build high-concurrency distributed systems with automated commit forensics.',
            slug: 'hackgrid-2025',
            submissionDeadline: new Date(Date.now() + 86400000 * 2).toISOString(),
            createdBy: 'admin',
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 86400000 * 3).toISOString(),
            status: 'active',
            minTeamSize: 2,
            maxTeamSize: 4,
            rounds: [
              { id: 'r1', order: 1, name: 'Round 1: Technical Audit & Forensics', maxMarks: 100, weight: 50 },
              { id: 'r2', order: 2, name: 'Round 2: Live Pitch & Architecture', maxMarks: 100, weight: 50 },
            ],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: 'event-devpulse-2025',
            title: 'DevPulse National AI Reagent Sprint',
            slug: 'devpulse-2025',
            submissionDeadline: new Date(Date.now() + 86400000 * 19).toISOString(),
            createdBy: 'admin',
            description:
              '48-hour buildathon targeting edge-inference agentic architectures. Continuous evaluation with automated synthetic stress test suites.',
            startDate: new Date(Date.now() + 86400000 * 18).toISOString(),
            endDate: new Date(Date.now() + 86400000 * 20).toISOString(),
            status: 'draft',
            minTeamSize: 2,
            maxTeamSize: 4,
            rounds: [
              { id: 'r1', order: 1, name: 'Agentic Infrastructure Benchmarks', maxMarks: 100, weight: 100 },
            ],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: 'event-cybershield-2025',
            title: 'CyberShield Chemical Code Forensics',
            slug: 'cybershield-2025',
            submissionDeadline: new Date(Date.now() + 86400000).toISOString(),
            createdBy: 'admin',
            description:
              'Defensive security gauntlet. Repositories currently under automated diff inspection, AST code tree integrity audits, and live judge review.',
            startDate: new Date(Date.now() - 86400000 * 2).toISOString(),
            endDate: new Date(Date.now() + 86400000).toISOString(),
            status: 'published',
            minTeamSize: 1,
            maxTeamSize: 4,
            rounds: [
              { id: 'r1', order: 1, name: 'Round 1: Vulnerability Patching', maxMarks: 100, weight: 50 },
              { id: 'r2', order: 2, name: 'Round 2: Jury Deliberation', maxMarks: 100, weight: 50 },
            ],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ]);
      }
      setLoading(false);
    });
  }, []);

  const filtered = events.filter((e) => {
    const q = search.toLowerCase();
    const match = e.title.toLowerCase().includes(q) || e.description.toLowerCase().includes(q);
    if (!match) return false;
    if (activeTab === 'all') return true;
    if (activeTab === 'ongoing') return e.status === 'active' || e.status === 'published';
    if (activeTab === 'upcoming') return e.status === 'draft';
    if (activeTab === 'past') return e.status === 'completed' || e.status === 'archived';
    return true;
  });

  const ongoingCount = events.filter((e) => e.status === 'active' || e.status === 'published').length;
  const upcomingCount = events.filter((e) => e.status === 'draft').length;
  const pastCount = events.filter((e) => e.status === 'completed' || e.status === 'archived').length;

  return (
    <div className="flex-1 flex flex-col relative w-full pb-20 min-h-screen text-stone-900 bg-[#faf9f4]">
      {/* Top Bauhaus Bar Motif */}
      <div className="w-full flex h-1.5 bg-stone-900">
        <div className="w-1/3 bg-amber-400" />
        <div className="w-1/3 bg-emerald-600" />
        <div className="w-1/3 bg-orange-500" />
      </div>

      <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 flex flex-col gap-6">
        
        {/* Header Banner */}
        <section className="clay-card-yellow p-6 sm:p-8 flex flex-col gap-4 border-2 border-stone-900">
          <div className="flex items-center justify-between gap-3 flex-wrap pb-3 border-b-2 border-stone-900">
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded-full bg-amber-500 border border-stone-900" />
              <span className="font-mono text-xs font-black uppercase tracking-widest text-stone-900">
                BAUHAUS // LABORATORY ASSAYS
              </span>
            </div>
            <span className="font-mono text-xs font-black px-2.5 py-1 bg-white border-2 border-stone-900 rounded-full text-stone-900">
              {events.length} ACTIVE DIRECTORY
            </span>
          </div>

          <div>
            <h1 className="text-2xl sm:text-4xl font-black text-stone-900 tracking-tight uppercase">
              Hackathon Research Directory
            </h1>
            <p className="text-xs sm:text-sm text-stone-700 font-medium font-mono mt-1">
              Explore scheduled chemical synthesis events, challenge tracks, and evaluation criteria.
            </p>
          </div>
        </section>

        {/* Search & Filter Toolbar */}
        <div className="clay-card p-4 sm:p-5 flex flex-col gap-4 border-2 border-stone-900">
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500 pointer-events-none" />
            <input
              className="clay-input w-full min-h-[44px] pl-10 pr-4 text-xs font-mono border-2 border-stone-900"
              placeholder="Search codeLab assays by title, specimen track, keyword..."
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto py-0.5 no-scrollbar font-mono text-xs font-black uppercase">
            <button
              onClick={() => setActiveTab('all')}
              className={`min-h-[38px] px-4 py-1.5 rounded-xl border-2 border-stone-900 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'all'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white text-stone-800 hover:bg-stone-100'
              }`}
            >
              All Assays ({events.length})
            </button>
            <button
              onClick={() => setActiveTab('ongoing')}
              className={`min-h-[38px] px-4 py-1.5 rounded-xl border-2 border-stone-900 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'ongoing'
                  ? 'bg-amber-400 text-stone-900 shadow-sm'
                  : 'bg-white text-stone-800 hover:bg-stone-100'
              }`}
            >
              Active ({ongoingCount})
            </button>
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`min-h-[38px] px-4 py-1.5 rounded-xl border-2 border-stone-900 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'upcoming'
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'bg-white text-stone-800 hover:bg-stone-100'
              }`}
            >
              Upcoming ({upcomingCount})
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`min-h-[38px] px-4 py-1.5 rounded-xl border-2 border-stone-900 transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'past'
                  ? 'bg-stone-800 text-white shadow-sm'
                  : 'bg-white text-stone-800 hover:bg-stone-100'
              }`}
            >
              Completed ({pastCount})
            </button>
          </div>
        </div>

        {/* Assays List */}
        <div className="space-y-4">
          {filtered.map((evt, idx) => {
            const isOngoing = evt.status === 'active' || evt.status === 'published';
            const isUpcoming = evt.status === 'draft';

            return (
              <article
                key={evt.id}
                className={`clay-card p-6 flex flex-col gap-4 border-2 border-stone-900 hover:-translate-y-1 transition-transform ${
                  idx === 0
                    ? 'clay-card-green'
                    : idx === 1
                    ? 'clay-card-yellow'
                    : 'clay-card-orange'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b-2 border-stone-900">
                  <div className="flex items-center gap-2.5 flex-wrap font-mono">
                    <span className="text-xs font-black px-2.5 py-1 rounded bg-white text-stone-900 border border-stone-900 uppercase">
                      {evt.slug}
                    </span>
                    <span
                      className={`text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full border border-stone-900 ${
                        isOngoing
                          ? 'bg-emerald-200 text-emerald-950'
                          : isUpcoming
                          ? 'bg-orange-200 text-orange-950'
                          : 'bg-stone-200 text-stone-900'
                      }`}
                    >
                      {evt.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-stone-600 text-xs font-mono font-bold">
                    <Calendar className="w-3.5 h-3.5 text-stone-800" />
                    <span>
                      {new Date(evt.startDate).toLocaleDateString()} – {new Date(evt.endDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div>
                  <h2 className="text-lg sm:text-xl font-black text-stone-900 uppercase font-mono">
                    {evt.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-medium mt-1.5">
                    {evt.description}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-3 border-t-2 border-stone-900">
                  <div className="flex items-center gap-4 text-xs font-mono font-bold text-stone-700">
                    <span className="flex items-center gap-1.5">
                      <Users className="w-4 h-4 text-stone-800" />
                      <span>{evt.minTeamSize}–{evt.maxTeamSize} Researchers</span>
                    </span>
                    <span>·</span>
                    <span>{evt.rounds?.length || 2} Assay Rounds</span>
                  </div>

                  <Link
                    to={`/app/dashboard?eventId=${evt.id}`}
                    className="clay-btn-primary min-h-[44px] px-5 py-2.5 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 border-2 border-stone-900 self-start sm:self-auto"
                  >
                    <span>Enter Specimen Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </article>
            );
          })}

          {filtered.length === 0 && (
            <div className="clay-card p-12 text-center text-stone-600 font-mono font-bold text-xs border-2 border-stone-900">
              No matching research assays located. Try adjusting your query or filter.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
