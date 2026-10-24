import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getUserNotifications } from '../../services/firestoreService';
import { NotificationItem } from '../../types';

export const Navbar: React.FC = () => {
  const { user, profile, role, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    if (user?.uid) {
      getUserNotifications(user.uid).then((items) => setNotifications(items || []));
    }
  }, [user]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <>
      {/* Top Header Bar (Claymorphism Floating Capsule) */}
      <header className="fixed top-0 inset-x-0 z-50 pt-2 px-2.5 sm:px-6 pointer-events-none">
        <div className="h-14 sm:h-16 max-w-7xl mx-auto px-3 sm:px-5 bg-white/95 backdrop-blur-md border border-stone-200/90 rounded-2xl shadow-[6px_8px_20px_-4px_rgba(120,113,108,0.12),inset_1px_1px_2px_rgba(255,255,255,0.95)] flex items-center justify-between gap-2 sm:gap-3 pointer-events-auto">
          {/* Brand & Bauhaus Geometric Accent */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 group min-h-[44px]">
              {/* Bauhaus Geometric Trio: Green Square + Yellow Circle + Orange Semicircle */}
              <div className="flex items-center gap-1">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white shadow-sm border border-emerald-700 font-bold text-xs">
                  <span className="material-symbols-outlined text-[16px]">science</span>
                </div>
                <div className="w-3.5 h-3.5 rounded-full bg-amber-400 border border-amber-500 shadow-2xs hidden sm:block" />
                <div className="w-3.5 h-3.5 rounded-r-full bg-orange-500 border border-orange-600 shadow-2xs hidden sm:block" />
              </div>
              <div className="flex items-baseline gap-1">
                <span className="font-black text-base sm:text-lg tracking-tight text-stone-900 group-hover:text-green-700 transition-colors uppercase font-mono">
                  codeLab
                </span>
                <span className="hidden sm:inline font-mono text-[9px] uppercase tracking-widest text-stone-700 font-black px-1.5 py-0.5 rounded bg-stone-100 border border-stone-300">
                  BAUHAUS
                </span>
              </div>
            </Link>

            <div className="h-3.5 w-px bg-stone-200 flex-shrink-0 hidden sm:block"></div>

            <Link
              to="/events"
              className="clay-pill hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 bg-yellow-50 text-amber-900 text-[11px] font-semibold border border-yellow-200/70 hover:bg-yellow-100 transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse flex-shrink-0"></span>
              <span className="truncate">Hackathons</span>
            </Link>

            {role === 'superadmin' && (
              <span className="clay-pill px-2 py-0.5 bg-orange-50 text-orange-800 text-[10px] font-bold uppercase hidden md:inline border border-orange-200">
                ROOT
              </span>
            )}
            {role === 'admin' && (
              <span className="clay-pill px-2 py-0.5 bg-yellow-50 text-amber-900 text-[10px] font-bold uppercase hidden md:inline border border-yellow-300">
                JUDGE
              </span>
            )}
            {role === 'participant' && user && (
              <span className="clay-pill px-2 py-0.5 bg-green-50 text-green-800 text-[10px] font-bold uppercase hidden md:inline border border-green-200">
                PARTICIPANT
              </span>
            )}
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1 text-xs font-semibold">
            <Link
              to="/events"
              className={`px-3 py-1.5 rounded-xl transition-all ${
                location.pathname.startsWith('/events')
                  ? 'clay-pill bg-green-50 text-green-800 border border-green-200 shadow-sm font-bold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/70'
              }`}
            >
              Events
            </Link>
            <Link
              to="/leaderboard"
              className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${
                location.pathname === '/leaderboard'
                  ? 'clay-pill bg-yellow-50 text-amber-900 border border-yellow-200 shadow-sm font-bold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/70'
              }`}
            >
              <span className="material-symbols-outlined text-[15px] text-amber-600">military_tech</span>
              Leaderboards
            </Link>

            {user && (
              <div className="flex items-center gap-1.5 ml-2 pl-2 border-l border-stone-200">
                <Link
                  to="/app/dashboard"
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    location.pathname.startsWith('/app')
                      ? 'bg-green-700 text-white shadow-sm'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-green-50'
                  }`}
                >
                  Participant
                </Link>
                <Link
                  to="/admin/judging"
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    location.pathname.startsWith('/admin')
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-yellow-50'
                  }`}
                >
                  Judge
                </Link>
                <Link
                  to="/superadmin/dashboard"
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    location.pathname.startsWith('/superadmin')
                      ? 'bg-orange-600 text-white shadow-sm'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-orange-50'
                  }`}
                >
                  Root
                </Link>
              </div>
            )}
          </div>

          {/* Actions & Profile */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">

            {/* Notification Bell */}
            {user && (
              <div className="relative">
                <button
                  aria-label="Notifications"
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="w-10 h-10 flex items-center justify-center rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer relative"
                >
                  <span className="material-symbols-outlined text-[20px]">notifications</span>
                  {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-orange-600 ring-2 ring-white"></span>
                  )}
                </button>

                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-72 sm:w-80 clay-card p-3 shadow-xl z-50 text-xs">
                    <div className="px-2 py-1.5 border-b border-stone-100 flex justify-between items-center">
                      <span className="font-bold text-stone-900">Notifications</span>
                      <span className="text-[10px] text-stone-500 font-mono">
                        {unreadCount} unread
                      </span>
                    </div>
                    <div className="max-h-60 overflow-y-auto divide-y divide-stone-100 mt-1">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-3 text-stone-500 text-center">No notifications</div>
                      ) : (
                        notifications.map((n) => (
                          <div key={n.id} className="p-2.5 hover:bg-stone-50 rounded-xl transition-colors">
                            <p className="font-semibold text-stone-900">{n.title}</p>
                            <p className="text-stone-600 mt-0.5">{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Profile Avatar / Login CTA */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-600 border border-amber-500 text-white flex items-center justify-center font-bold text-xs sm:text-sm shadow-sm hover:scale-105 transition-transform cursor-pointer"
                >
                  {(profile?.displayName || user.email || 'U')[0].toUpperCase()}
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 sm:w-60 clay-card p-2 shadow-xl z-50 text-xs">
                    <div className="px-3 py-2 border-b border-stone-100">
                      <p className="font-bold text-stone-900 truncate">{profile?.displayName || user.email}</p>
                      <p className="text-[10px] text-green-700 font-mono font-semibold uppercase mt-0.5">
                        Role: {role}
                      </p>
                    </div>

                    <div className="flex flex-col gap-0.5 mt-1">
                      <Link
                        to="/app/dashboard"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-stone-700 hover:bg-green-50 rounded-xl transition-colors min-h-[40px]"
                      >
                        <span className="material-symbols-outlined text-[16px] text-green-700">dashboard</span>
                        Dashboard
                      </Link>

                      <Link
                        to="/admin/judging"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-stone-700 hover:bg-yellow-50 rounded-xl transition-colors min-h-[40px]"
                      >
                        <span className="material-symbols-outlined text-[16px] text-amber-700">science</span>
                        Judging Queue
                      </Link>

                      <Link
                        to="/superadmin/dashboard"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-stone-700 hover:bg-orange-50 rounded-xl transition-colors min-h-[40px]"
                      >
                        <span className="material-symbols-outlined text-[16px] text-orange-700">biotech</span>
                        Lab Director Console
                      </Link>

                      <div className="border-t border-stone-100 my-1" />

                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          logout();
                          navigate('/');
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-rose-700 hover:bg-rose-50 rounded-xl text-left cursor-pointer transition-colors min-h-[40px]"
                      >
                        <span className="material-symbols-outlined text-[16px]">logout</span>
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <Link
                  to="/"
                  className="clay-btn-google px-3 py-1.5 sm:px-3.5 sm:py-2 text-xs font-semibold flex items-center gap-1.5 min-h-[40px]"
                >
                  <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                    <path d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z" fill="#EA4335" />
                    <path d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5.1 3.7-8.9z" fill="#4285F4" />
                    <path d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.8s.2-2.1.4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z" fill="#FBBC05" />
                    <path d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z" fill="#34A853" />
                  </svg>
                  <span className="hidden xs:inline">Sign In</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Spacer to push page content down past fixed navbar */}
      <div className="h-16 sm:h-20" />

      {/* Mobile Bottom Navigation Dock */}
      <nav className="fixed bottom-0 inset-x-0 z-40 md:hidden pb-safe bg-white/95 backdrop-blur-md border-t border-stone-200/80 shadow-[0_-4px_16px_rgba(120,113,108,0.08)]">
        <div className="flex justify-around items-center h-15 px-1 max-w-md mx-auto">
          {role === 'superadmin' ? (
            <>
              <Link
                to="/superadmin/dashboard"
                className={`flex flex-col items-center justify-center min-w-[48px] h-12 transition-colors ${
                  location.pathname === '/superadmin/dashboard'
                    ? 'text-green-700 font-bold'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">grid_view</span>
                <span className="text-[10px]">Overview</span>
              </Link>
              <Link
                to="/superadmin/schemas"
                className={`flex flex-col items-center justify-center min-w-[48px] h-12 transition-colors ${
                  location.pathname === '/superadmin/schemas'
                    ? 'text-green-700 font-bold'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">schema</span>
                <span className="text-[10px]">Reagents</span>
              </Link>
              <Link
                to="/superadmin/scoring"
                className={`flex flex-col items-center justify-center min-w-[48px] h-12 transition-colors ${
                  location.pathname === '/superadmin/scoring'
                    ? 'text-green-700 font-bold'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">rule</span>
                <span className="text-[10px]">Scoring</span>
              </Link>
              <Link
                to="/superadmin/users"
                className={`flex flex-col items-center justify-center min-w-[48px] h-12 transition-colors ${
                  location.pathname === '/superadmin/users'
                    ? 'text-green-700 font-bold'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">group</span>
                <span className="text-[10px]">Users</span>
              </Link>
              <Link
                to="/superadmin/audit-logs"
                className={`flex flex-col items-center justify-center min-w-[48px] h-12 transition-colors ${
                  location.pathname === '/superadmin/audit-logs'
                    ? 'text-green-700 font-bold'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">history</span>
                <span className="text-[10px]">Logs</span>
              </Link>
            </>
          ) : role === 'admin' ? (
            <>
              <Link
                to="/admin/judging"
                className={`flex flex-col items-center justify-center min-w-[56px] h-12 transition-colors ${
                  location.pathname === '/admin/judging'
                    ? 'text-amber-700 font-bold'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">checklist_rtl</span>
                <span className="text-[10px]">Queue</span>
              </Link>
              <Link
                to="/events"
                className={`flex flex-col items-center justify-center min-w-[56px] h-12 transition-colors ${
                  location.pathname === '/events'
                    ? 'text-amber-700 font-bold'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">science</span>
                <span className="text-[10px]">Events</span>
              </Link>
              <Link
                to="/leaderboard"
                className={`flex flex-col items-center justify-center min-w-[56px] h-12 transition-colors ${
                  location.pathname === '/leaderboard'
                    ? 'text-amber-700 font-bold'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">military_tech</span>
                <span className="text-[10px]">Standings</span>
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/app/dashboard"
                className={`flex flex-col items-center justify-center min-w-[56px] h-12 transition-colors ${
                  location.pathname === '/app/dashboard'
                    ? 'text-green-700 font-bold'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">dashboard</span>
                <span className="text-[10px]">Dashboard</span>
              </Link>
              <Link
                to="/app/teams"
                className={`flex flex-col items-center justify-center min-w-[56px] h-12 transition-colors ${
                  location.pathname === '/app/teams'
                    ? 'text-green-700 font-bold'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">group</span>
                <span className="text-[10px]">Team</span>
              </Link>
              <Link
                to="/app/submissions"
                className={`flex flex-col items-center justify-center min-w-[56px] h-12 transition-colors ${
                  location.pathname === '/app/submissions'
                    ? 'text-green-700 font-bold'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">deployed_code_history</span>
                <span className="text-[10px]">Specimen</span>
              </Link>
              <Link
                to="/leaderboard"
                className={`flex flex-col items-center justify-center min-w-[56px] h-12 transition-colors ${
                  location.pathname === '/leaderboard'
                    ? 'text-green-700 font-bold'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
              >
                <span className="material-symbols-outlined text-[20px]">military_tech</span>
                <span className="text-[10px]">Standings</span>
              </Link>
            </>
          )}
        </div>
      </nav>
    </>
  );
};
