import React, { useState, useEffect } from 'react';
import { getPublishedLeaderboard } from '../../services/firestoreService';
import { PublishedLeaderboard, LeaderboardEntry } from '../../types';
import { Download, Search, Award, Circle, Square, ArrowUpRight, FlaskConical } from 'lucide-react';

export const PublicLeaderboardPage: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<PublishedLeaderboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [exporting, setExporting] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<string>('hackgrid-2025');

  useEffect(() => {
    loadLeaderboardData(selectedEventId);
  }, [selectedEventId]);

  const loadLeaderboardData = async (eventId: string) => {
    setLoading(true);
    try {
      const data = await getPublishedLeaderboard(eventId);
      setLeaderboard(data || null);
    } catch (e) {
      console.error(e);
      setLeaderboard(null);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const response = await fetch(`/api/export/leaderboard-csv?eventId=${selectedEventId}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `codelab-bauhaus-synthesis-${selectedEventId}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        const rows = [
          ['Rank', 'Team', 'Problem Track', 'Score', 'Status'],
          ...(leaderboard?.standings || []).map((s: LeaderboardEntry) => [
            s.rank,
            s.teamName,
            s.problemTitle || '',
            s.score,
            s.status,
          ]),
        ];
        const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement('a');
        link.setAttribute('href', encodedUri);
        link.setAttribute('download', `codelab-bauhaus-synthesis-${selectedEventId}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setExporting(false);
    }
  };

  const filteredStandings: LeaderboardEntry[] = (leaderboard?.standings || []).filter((s: LeaderboardEntry) => {
    const q = search.toLowerCase();
    return s.teamName.toLowerCase().includes(q) || (s.problemTitle?.toLowerCase().includes(q) ?? false);
  });

  return (
    <div className="flex-1 flex flex-col relative w-full pb-20 min-h-screen text-stone-900 bg-[#faf9f4]">
      {/* Bauhaus Top Motif Bar */}
      <div className="w-full flex h-1.5 bg-stone-900">
        <div className="w-1/3 bg-amber-400" />
        <div className="w-1/3 bg-emerald-600" />
        <div className="w-1/3 bg-orange-500" />
      </div>

      <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-8 flex flex-col gap-6">
        
        {/* Bauhaus Geometric Header Banner */}
        <section className="clay-card-yellow p-6 sm:p-8 flex flex-col gap-4 border-2 border-stone-900">
          <div className="flex items-center justify-between gap-3 flex-wrap pb-3 border-b-2 border-stone-900">
            <div className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded-full bg-amber-500 border border-stone-900" />
              <span className="font-mono text-xs font-black uppercase tracking-widest text-stone-900">
                BAUHAUS // SYNTHESIS STANDINGS
              </span>
            </div>
            <span className="font-mono text-xs font-black px-2.5 py-1 bg-white border-2 border-stone-900 rounded-full text-stone-900">
              SEALED MANIFEST
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-4xl font-black text-stone-900 tracking-tight uppercase">
                InterCollege HackGrid 2025
              </h1>
              <p className="text-xs sm:text-sm text-stone-700 font-medium font-mono mt-1">
                Specimen standings normalized across multi-reagent rubric assays. Form follows function.
              </p>
            </div>

            <button
              onClick={handleExportCSV}
              disabled={exporting}
              className="clay-btn-orange min-h-[44px] px-5 py-2.5 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 border-2 border-stone-900 cursor-pointer self-start sm:self-auto"
            >
              <Download className="w-4 h-4" />
              <span>{exporting ? 'Exporting...' : 'Export CSV Ledger'}</span>
            </button>
          </div>
        </section>

        {/* Bauhaus Geometric Podium Trio (Top 3) */}
        {!loading && filteredStandings.length >= 3 && !search && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5">
            {/* 1st Place: Circle Motif (Citron Yellow) */}
            <div className="clay-card-yellow p-6 flex flex-col justify-between border-2 border-stone-900 order-1 md:order-2">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <div className="w-12 h-12 rounded-full bg-amber-400 text-stone-900 font-mono font-black text-lg border-2 border-stone-900 flex items-center justify-center shadow-sm">
                    01
                  </div>
                  <span className="font-mono text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 bg-white border border-stone-900 rounded-full text-stone-900">
                    CIRCLE // GOLD
                  </span>
                </div>
                <h3 className="font-black text-stone-900 text-base uppercase font-mono truncate">
                  {filteredStandings[0]?.teamName}
                </h3>
                <p className="text-xs text-stone-700 line-clamp-2 mt-1 font-medium">
                  {filteredStandings[0]?.problemTitle}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t-2 border-stone-900 flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-amber-950 uppercase">FINAL SCORE</span>
                <span className="font-mono text-2xl font-black text-stone-900">
                  {filteredStandings[0]?.score.toFixed(1)} <span className="text-xs">PTS</span>
                </span>
              </div>
            </div>

            {/* 2nd Place: Square Motif (Mint Green) */}
            <div className="clay-card-green p-6 flex flex-col justify-between border-2 border-stone-900 order-2 md:order-1">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <div className="w-12 h-12 rounded-lg bg-emerald-600 text-white font-mono font-black text-lg border-2 border-stone-900 flex items-center justify-center shadow-sm">
                    02
                  </div>
                  <span className="font-mono text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 bg-white border border-stone-900 rounded-full text-stone-900">
                    SQUARE // SAGE
                  </span>
                </div>
                <h3 className="font-black text-stone-900 text-base uppercase font-mono truncate">
                  {filteredStandings[1]?.teamName}
                </h3>
                <p className="text-xs text-stone-700 line-clamp-2 mt-1 font-medium">
                  {filteredStandings[1]?.problemTitle}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t-2 border-stone-900 flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-emerald-950 uppercase">FINAL SCORE</span>
                <span className="font-mono text-2xl font-black text-stone-900">
                  {filteredStandings[1]?.score.toFixed(1)} <span className="text-xs">PTS</span>
                </span>
              </div>
            </div>

            {/* 3rd Place: Semicircle Motif (Orange Tangerine) */}
            <div className="clay-card-orange p-6 flex flex-col justify-between border-2 border-stone-900 order-3">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <div className="w-12 h-12 rounded-t-full bg-orange-500 text-white font-mono font-black text-lg border-2 border-stone-900 flex items-center justify-center shadow-sm pt-1">
                    03
                  </div>
                  <span className="font-mono text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 bg-white border border-stone-900 rounded-full text-stone-900">
                    SEMICIRCLE // AMBER
                  </span>
                </div>
                <h3 className="font-black text-stone-900 text-base uppercase font-mono truncate">
                  {filteredStandings[2]?.teamName}
                </h3>
                <p className="text-xs text-stone-700 line-clamp-2 mt-1 font-medium">
                  {filteredStandings[2]?.problemTitle}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t-2 border-stone-900 flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-orange-950 uppercase">FINAL SCORE</span>
                <span className="font-mono text-2xl font-black text-stone-900">
                  {filteredStandings[2]?.score.toFixed(1)} <span className="text-xs">PTS</span>
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="clay-card p-4 border-2 border-stone-900">
          <div className="relative w-full">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-500 pointer-events-none" />
            <input
              type="text"
              placeholder="Filter specimen squads by name or research topic..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="clay-input w-full min-h-[44px] pl-10 pr-4 text-xs font-mono border-2 border-stone-900"
            />
          </div>
        </div>

        {/* Full Standings List */}
        <div className="clay-card p-6 flex flex-col gap-3.5 border-2 border-stone-900">
          <div className="flex items-center justify-between pb-3 border-b-2 border-stone-900">
            <div className="flex items-center gap-2">
              <FlaskConical className="w-4 h-4 text-emerald-700" />
              <h2 className="text-sm font-black text-stone-900 uppercase font-mono">
                Full Specimen Cohort Standings
              </h2>
            </div>
            <span className="font-mono text-xs font-bold text-stone-500">
              {filteredStandings.length} Cohorts
            </span>
          </div>

          <div className="space-y-3">
            {filteredStandings.length === 0 ? (
              <div className="text-center py-12 text-stone-500 font-mono text-xs">
                {search ? 'No cohorts match your filter criteria.' : 'No official leaderboard rankings released yet for this event.'}
              </div>
            ) : (
              filteredStandings.map((team: LeaderboardEntry, idx: number) => (
              <React.Fragment key={team.teamId}>
                {idx === 3 && (
                  <div className="my-3 p-3 rounded-xl clay-card-yellow border-2 border-amber-400 flex items-center justify-between text-xs font-mono font-black text-stone-900">
                    <span>FINALS THRESHOLD CUTOFF (78.0 PTS)</span>
                    <span className="px-2 py-0.5 rounded-full bg-white border border-stone-900 text-[10px]">
                      QUALIFIED
                    </span>
                  </div>
                )}

                <div className="p-4 rounded-xl border-2 border-stone-900 bg-white flex items-center justify-between gap-4 hover:-translate-y-0.5 transition-transform">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center font-mono font-black text-xs border-2 border-stone-900 shrink-0 ${
                        team.rank === 1
                          ? 'bg-amber-400 text-stone-900'
                          : team.rank === 2
                          ? 'bg-emerald-600 text-white'
                          : team.rank === 3
                          ? 'bg-orange-500 text-white'
                          : 'bg-stone-100 text-stone-700'
                      }`}
                    >
                      {team.rank < 10 ? `0${team.rank}` : team.rank}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-stone-900 text-sm truncate uppercase font-mono">
                          {team.teamName}
                        </span>
                        {team.rank <= 3 && (
                          <span className="text-[10px] font-mono font-black px-1.5 py-0.2 bg-stone-100 border border-stone-900 rounded">
                            PODIUM
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-stone-600 font-mono truncate mt-0.5">{team.problemTitle}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-mono font-black text-base text-stone-900">
                      {team.score.toFixed(1)} <span className="text-[10px] font-normal text-stone-500">PTS</span>
                    </div>
                  </div>
                </div>
              </React.Fragment>
            )))}
          </div>
        </div>
      </div>
    </div>
  );
};

export const PublicLeaderboard = PublicLeaderboardPage;
