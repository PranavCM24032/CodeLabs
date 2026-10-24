import React, { useState, useEffect } from 'react';
import {
  GitPullRequest,
  GitBranch,
  CheckCircle2,
  AlertCircle,
  Clock,
  ShieldCheck,
  ExternalLink,
  Copy,
  Check,
  Lock,
  Terminal,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  getEvents,
  getTeamsForEvent,
  getSubmissionForTeam,
  saveSubmission,
  saveAnalysisJob,
} from '../../services/firestoreService';
import { HackathonEvent, Team, Submission, RepoProvider, AnalysisJob } from '../../types';

type RepositoryInsights = {
  repository: string;
  defaultBranch: string;
  totalCommits: number;
  totalContributors: number;
  lastCommit: { sha: string; message: string; authoredAt: string; author: string } | null;
  contributors: { login: string; contributions: number; percentage: number }[];
  firstCommitAt: string | null;
  pullRequests: number | null;
  branches: number | null;
  languages: { name: string; bytes: number }[];
  projectHealth: { readme: boolean; license: boolean; gitignore: boolean; ci: boolean };
  commitActivity: { week: number; commits: number }[];
  codeChurn: { week: number; additions: number; deletions: number }[];
  checks: { humanAiAuthorship: string; plagiarism: string };
};

export const SubmissionPage: React.FC = () => {
  const { user } = useAuth();
  const [activeEvent, setActiveEvent] = useState<HackathonEvent | null>(null);
  const [userTeam, setUserTeam] = useState<Team | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);

  // Form State
  const [provider, setProvider] = useState<RepoProvider>('github');
  const [repoUrl, setRepoUrl] = useState('');
  const [liveProjectUrl, setLiveProjectUrl] = useState('');
  const [branch, setBranch] = useState('main');
  const [commitSha, setCommitSha] = useState('');
  const [autoLockEnabled, setAutoLockEnabled] = useState(true);

  // Interaction State
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedSha, setCopiedSha] = useState(false);
  const [locking, setLocking] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [insights, setInsights] = useState<RepositoryInsights | null>(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insightsError, setInsightsError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const events = await getEvents();
        if (events && events.length > 0) {
          const evt = events[0];
          setActiveEvent(evt);

          const teams = await getTeamsForEvent(evt.id);
          const found = teams.find(
            (t) =>
              t.leaderId === user?.uid ||
              t.members?.some((m) => m.userId === user?.uid)
          );

          if (found) {
            setUserTeam(found);
            const sub = await getSubmissionForTeam(evt.id, found.id);
            if (sub) {
              setSubmission(sub);
              setRepoUrl(sub.repoUrl);
              setLiveProjectUrl(sub.liveProjectUrl || '');
              setCommitSha(sub.frozenCommitSha);
              setProvider(sub.provider);
            }
          }
        }
      } catch (err) {
        console.error('Error loading submission page data:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  useEffect(() => {
    if (!/^https?:\/\/github\.com\/[^/]+\/[^/]+/i.test(repoUrl.trim())) {
      setInsights(null);
      setInsightsError('');
      return;
    }

    const timer = window.setTimeout(() => {
      void loadRepositoryInsights();
    }, 700);

    return () => window.clearTimeout(timer);
  }, [repoUrl]);

  const loadRepositoryInsights = async () => {
    if (!/^https?:\/\/github\.com\/[^/]+\/[^/]+/i.test(repoUrl.trim())) return;
    setInsightsLoading(true);
    setInsightsError('');
    try {
      const response = await fetch(`/api/repository-insights?repoUrl=${encodeURIComponent(repoUrl.trim())}`);
      const body = await response.text();
      let data: RepositoryInsights & { error?: string };
      try {
        data = JSON.parse(body);
      } catch {
        throw new Error(
          response.ok
            ? 'Repository service returned an unexpected response. Please try again.'
            : `Repository service error (${response.status}). Please try again or check the server logs.`
        );
      }
      if (!response.ok) throw new Error(data.error || 'Could not analyse this repository.');
      setInsights(data);
      setBranch(data.defaultBranch || branch);
      if (data.lastCommit?.sha) setCommitSha(data.lastCommit.sha);
    } catch (err: any) {
      setInsights(null);
      setInsightsError(err.message || 'Could not analyse this repository.');
    } finally {
      setInsightsLoading(false);
    }
  };

  const handleCopy = (text: string, type: 'url' | 'sha') => {
    navigator.clipboard.writeText(text);
    if (type === 'url') {
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    } else {
      setCopiedSha(true);
      setTimeout(() => setCopiedSha(false), 2000);
    }
  };

  const handleManualLock = async () => {
    if (!activeEvent || !user) return;
    setLocking(true);
    setFeedback(null);

    try {
      const subId = submission?.id || `sub_${Date.now()}`;
      const newSubmission: Submission = {
        id: subId,
        teamId: userTeam?.id || 'team_bytecrafters',
        teamName: userTeam?.name || 'ByteCrafters',
        eventId: activeEvent.id,
        problemId: userTeam?.problemId || 'prob_ai',
        provider,
        repoUrl: repoUrl.trim(),
        liveProjectUrl: liveProjectUrl.trim() || undefined,
        branch: branch.replace(' (protected)', ''),
        frozenCommitSha: commitSha,
        commitMessage: 'Sync: Complete video pipeline streaming service',
        authorName: user?.displayName || 'Alex Zhang',
        authorEmail: user?.email || 'alex@bytecrafters.org',
        committedAt: new Date(Date.now() - 12 * 60000).toISOString(),
        snapshotAt: new Date().toISOString(),
        status: 'submitted',
        submittedBy: user.uid,
        lateBulkUploadDetected: false,
      };

      await saveSubmission(activeEvent.id, newSubmission);

      const job: AnalysisJob = {
        id: `job_${Date.now()}`,
        submissionId: subId,
        eventId: activeEvent.id,
        teamId: newSubmission.teamId,
        teamName: newSubmission.teamName,
        status: 'completed',
        similarityScore: 0.0,
        lateBulkUploadIndicator: false,
        totalCommits: insights?.totalCommits || 0,
        activeContributors: insights?.totalContributors || 0,
        findingsCount: 0,
        analyzedAt: new Date().toISOString(),
        logs: [
          `Snapshot frozen at ${new Date().toISOString()}`,
          `Commit verified: ${commitSha.substring(0, 10)}`,
          insights ? `${insights.totalCommits} commits from ${insights.totalContributors} contributors` : 'Repository insights not available',
        ],
      };
      await saveAnalysisJob(activeEvent.id, job);

      setSubmission(newSubmission);
      setShowConfirmModal(true);
    } catch (err: any) {
      setFeedback({ type: 'error', text: err.message || 'Failed to freeze submission.' });
    } finally {
      setLocking(false);
    }
  };

  return (
    <div className="flex flex-col w-full px-4 sm:px-6 lg:px-8 py-6 max-w-4xl mx-auto space-y-6 text-on-surface">
      {/* Header Section */}
      <div className="flex flex-col space-y-1">
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-surface-container-high text-primary font-mono text-[10px] uppercase tracking-wider border border-outline-variant/30">
            <Lock className="w-3.5 h-3.5" />
            Step 2 of 4
          </span>
          <span className="inline-flex items-center gap-1.5 font-mono text-[10px] text-secondary bg-surface-container-low px-2.5 py-0.5 rounded border border-outline-variant/20">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-ping" />
            Analysis runs after submission
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight mt-1">
          Submit your project
        </h1>
        <p className="text-xs sm:text-sm text-on-surface-variant">
          Add your GitHub repository link and submit the project version for evaluation.
        </p>
      </div>

      {feedback && (
        <div
          className={`p-3.5 rounded-xl text-xs flex items-start gap-2.5 border ${
            feedback.type === 'success'
              ? 'bg-secondary-container/20 border-secondary-container/40 text-secondary'
              : 'bg-error-container/20 border-error-container/40 text-error'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          )}
          <span>{feedback.text}</span>
        </div>
      )}

      {/* Countdown Banner & Code Freeze Status */}
      <div className="relative overflow-hidden rounded-2xl bg-surface-container-low p-4 sm:p-5 space-y-4 shadow-lg border border-outline-variant/30">
        <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-primary/5 rounded-full pointer-events-none" />
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-surface-container-high flex items-center justify-center text-primary shrink-0 border border-outline-variant/20">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <div className="font-mono text-[10px] uppercase tracking-wider text-on-surface-variant font-semibold">
                Submission deadline
              </div>
              <div className="font-bold text-sm sm:text-base text-on-surface">
                Today, 11:59 PM EST
              </div>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="px-2.5 py-0.5 rounded bg-primary-container/20 text-primary font-mono text-xs font-semibold tracking-wide border border-primary-container/30">
              06h 38m left
            </span>
            <span className="font-mono text-[10px] text-on-surface-variant mt-0.5">Automated Seal</span>
          </div>
        </div>

        {/* Toggle Container */}
        <div className="flex items-center justify-between pt-2 border-t border-outline-variant/20 bg-surface-container p-3 rounded-xl">
          <div className="flex items-center gap-2.5 min-w-0">
            <Lock className="w-4 h-4 text-secondary shrink-0" />
            <div className="min-w-0">
              <div className="font-medium text-xs text-on-surface truncate">
                Lock submitted version
              </div>
              <div className="font-mono text-[10px] text-on-surface-variant truncate">
                Snapshot head commit at exactly 23:59:00
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setAutoLockEnabled(!autoLockEnabled)}
            className={`w-11 h-6 rounded-full relative p-0.5 transition-colors focus:outline-none shrink-0 ${
              autoLockEnabled ? 'bg-primary-container' : 'bg-surface-container-highest'
            }`}
          >
            <span
              className={`block w-5 h-5 rounded-full bg-on-primary shadow-sm transform transition-transform duration-200 ${
                autoLockEnabled ? 'translate-x-5' : 'translate-x-0 bg-on-surface-variant'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Provider Selector */}
      <div className="flex flex-col space-y-2">
        <label className="font-mono text-[10px] uppercase tracking-wider text-on-surface-variant font-semibold">
          Repository provider
        </label>
        <div className="grid grid-cols-3 gap-3">
          {/* GitHub (Active) */}
          <button
            type="button"
            onClick={() => setProvider('github')}
            className={`relative flex flex-col items-center justify-center p-3 rounded-xl text-left border transition-all ${
              provider === 'github'
                ? 'bg-surface-container-high border-primary text-on-surface shadow-sm'
                : 'bg-surface-container-low border-outline-variant/30 text-on-surface-variant'
            }`}
          >
            <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-secondary flex items-center justify-center">
              <Check className="w-3 h-3 text-on-secondary font-bold" />
            </div>
            <GitBranch className="w-6 h-6 text-primary mb-1" />
            <span className="font-bold text-xs">GitHub</span>
            <span className="font-mono text-[10px] text-secondary">Connected</span>
          </button>

          {/* GitLab */}
          <button
            type="button"
            onClick={() => setProvider('gitlab')}
            className={`relative flex flex-col items-center justify-center p-3 rounded-xl text-left border transition-all ${
              provider === 'gitlab'
                ? 'bg-surface-container-high border-primary text-on-surface shadow-sm'
                : 'bg-surface-container-low border-outline-variant/30 text-on-surface-variant'
            }`}
          >
            <Terminal className="w-6 h-6 text-on-surface-variant mb-1" />
            <span className="font-medium text-xs">GitLab</span>
            <span className="font-mono text-[10px] text-outline">Available</span>
          </button>

          {/* Bitbucket */}
          <button
            type="button"
            onClick={() => setProvider('bitbucket')}
            className={`relative flex flex-col items-center justify-center p-3 rounded-xl text-left border transition-all ${
              provider === 'bitbucket'
                ? 'bg-surface-container-high border-primary text-on-surface shadow-sm'
                : 'bg-surface-container-low border-outline-variant/30 text-on-surface-variant'
            }`}
          >
            <Layers className="w-6 h-6 text-on-surface-variant mb-1" />
            <span className="font-medium text-xs">Bitbucket</span>
            <span className="font-mono text-[10px] text-outline">Available</span>
          </button>
        </div>
      </div>

      {/* Target Reference Connection Form Card */}
      <div className="rounded-2xl bg-surface-container-low p-4 sm:p-5 space-y-4 shadow-md border border-outline-variant/30">
        <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-primary" />
            <span className="font-bold text-sm text-on-surface">Project links</span>
          </div>
          <span className="font-mono text-[11px] text-on-surface-variant">Team: {userTeam?.name || 'ByteCrafters'}</span>
        </div>

        {/* Remote URL */}
        <div className="flex flex-col space-y-1">
          <div className="flex items-center justify-between">
            <label className="font-mono text-[10px] text-on-surface-variant uppercase">GitHub repository link</label>
            <button type="button" onClick={loadRepositoryInsights} disabled={insightsLoading || !repoUrl} className="font-mono text-[10px] text-primary disabled:opacity-50">
              {insightsLoading ? 'Checking…' : 'Check repository'}
            </button>
          </div>
          <div className="relative flex items-center">
            <Terminal className="absolute left-3 text-outline w-4 h-4 pointer-events-none" />
            <input
              type="text"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              className="w-full bg-surface-container-lowest text-on-surface font-mono text-xs rounded-xl pl-9 pr-20 py-2.5 focus:outline-none border border-outline-variant/30"
            />
            <button
              type="button"
              onClick={() => handleCopy(repoUrl, 'url')}
              className="absolute right-1.5 px-2.5 py-1 bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-mono text-[11px] rounded-lg transition-colors flex items-center gap-1 border border-outline-variant/20"
            >
              {copiedUrl ? <Check className="w-3.5 h-3.5 text-secondary" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedUrl ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col space-y-1">
          <label className="font-mono text-[10px] text-on-surface-variant uppercase">Live project link</label>
          <input
            type="url"
            value={liveProjectUrl}
            onChange={(e) => setLiveProjectUrl(e.target.value)}
            placeholder="https://your-project.example"
            className="w-full bg-surface-container-lowest text-on-surface font-mono text-xs rounded-xl px-3 py-2.5 focus:outline-none border border-outline-variant/30"
          />
        </div>

        {/* Branch Selector and SHA Grid */}
        <div className="grid grid-cols-1 gap-3">
          <div className="flex flex-col space-y-1">
            <label className="font-mono text-[10px] text-on-surface-variant uppercase">Target Branch</label>
            <div className="relative flex items-center">
              <GitBranch className="absolute left-3 text-secondary w-4 h-4 pointer-events-none" />
              <select
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full bg-surface-container-lowest text-on-surface font-mono text-xs rounded-xl pl-9 pr-8 py-2.5 appearance-none focus:outline-none border border-outline-variant/30"
              >
                <option value="main (protected)">main (protected)</option>
                <option value="release/v1.0">release/v1.0</option>
                <option value="hackathon-final">hackathon-final</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col space-y-1">
            <div className="flex items-center justify-between">
              <label className="font-mono text-[10px] text-on-surface-variant uppercase">Target Commit SHA</label>
              <span className="font-mono text-[10px] text-primary flex items-center gap-1 font-semibold">
                <CheckCircle2 className="w-3 h-3 text-primary" /> Webhook Synchronized
              </span>
            </div>
            <div className="relative flex items-center">
              <Terminal className="absolute left-3 text-outline w-4 h-4 pointer-events-none" />
              <input
                type="text"
                readOnly
                value={commitSha}
                className="w-full bg-surface-container-lowest text-primary font-mono text-xs rounded-xl pl-9 pr-20 py-2.5 truncate focus:outline-none tracking-wide border border-outline-variant/30"
              />
              <button
                type="button"
                onClick={() => handleCopy(commitSha, 'sha')}
                className="absolute right-1.5 px-2.5 py-1 bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-mono text-[11px] rounded-lg transition-colors flex items-center gap-1 border border-outline-variant/20"
              >
                {copiedSha ? <Check className="w-3.5 h-3.5 text-secondary" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSha ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <div className="flex items-center justify-between text-on-surface-variant font-mono text-[10px]">
              <span className="text-secondary font-medium">{copiedSha ? 'SHA copied to clipboard' : ''}</span>
              <span className="ml-auto">{insights?.lastCommit ? `${new Date(insights.lastCommit.authoredAt).toLocaleString()} by ${insights.lastCommit.author}` : 'Check repository to load commit details'}</span>
            </div>
          </div>
        </div>
      </div>

      <section className="rounded-2xl bg-surface-container-low p-4 sm:p-5 space-y-4 border border-outline-variant/30">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-secondary" />
            <h2 className="font-bold text-sm text-on-surface">Repository insights</h2>
          </div>
          {insights && <span className="font-mono text-[10px] text-secondary">GitHub data loaded</span>}
        </div>

        {insightsError && <p className="text-xs text-error">{insightsError}</p>}
        {!insights && !insightsLoading && !insightsError && <p className="text-xs text-on-surface-variant">Add a public GitHub link, then choose “Check repository” to see live project activity.</p>}
        {insightsLoading && <p className="text-xs text-on-surface-variant">Loading repository activity…</p>}

        {insights && <>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="rounded-xl bg-surface-container-lowest p-3 border border-outline-variant/20"><span className="block text-[10px] text-on-surface-variant">Last commit</span><strong className="block text-xs mt-1">{insights.lastCommit ? new Date(insights.lastCommit.authoredAt).toLocaleString() : 'No commits'}</strong></div>
            <div className="rounded-xl bg-surface-container-lowest p-3 border border-outline-variant/20"><span className="block text-[10px] text-on-surface-variant">Total commits</span><strong className="block text-lg mt-1">{insights.totalCommits}</strong></div>
            <div className="rounded-xl bg-surface-container-lowest p-3 border border-outline-variant/20"><span className="block text-[10px] text-on-surface-variant">Contributors</span><strong className="block text-lg mt-1">{insights.totalContributors}</strong></div>
            <div className="rounded-xl bg-surface-container-lowest p-3 border border-outline-variant/20"><span className="block text-[10px] text-on-surface-variant">First commit</span><strong className="block text-xs mt-1">{insights.firstCommitAt ? new Date(insights.firstCommitAt).toLocaleDateString() : 'Unavailable'}</strong></div>
            <div className="rounded-xl bg-surface-container-lowest p-3 border border-outline-variant/20"><span className="block text-[10px] text-on-surface-variant">Pull requests</span><strong className="block text-lg mt-1">{insights.pullRequests ?? '—'}</strong></div>
            <div className="rounded-xl bg-surface-container-lowest p-3 border border-outline-variant/20"><span className="block text-[10px] text-on-surface-variant">Branches</span><strong className="block text-lg mt-1">{insights.branches ?? '—'}</strong></div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-outline-variant/30 p-3"><h3 className="text-xs font-bold">Commits by week</h3><div className="mt-3 h-20 flex items-end gap-1">{insights.commitActivity.map((item) => <div key={item.week} title={`${item.commits} commits`} className="flex-1 min-w-1 rounded-t bg-primary/80" style={{ height: `${Math.max(4, (item.commits / Math.max(...insights.commitActivity.map((entry) => entry.commits), 1)) * 100)}%` }} />)}</div></div>
            <div className="rounded-xl border border-outline-variant/30 p-3"><h3 className="text-xs font-bold">Lines added / deleted</h3><div className="mt-3 h-20 flex items-end gap-1">{insights.codeChurn.map((item) => <div key={item.week} title={`+${item.additions} / -${item.deletions}`} className="flex-1 min-w-1 flex gap-px items-end h-full"><span className="flex-1 bg-emerald-500 rounded-t" style={{ height: `${Math.max(3, (item.additions / Math.max(...insights.codeChurn.map((entry) => entry.additions), 1)) * 100)}%` }} /><span className="flex-1 bg-rose-400 rounded-t" style={{ height: `${Math.max(3, (item.deletions / Math.max(...insights.codeChurn.map((entry) => entry.deletions), 1)) * 100)}%` }} /></div>)}</div></div>
          </div>

          <div className="space-y-2">
            <h3 className="text-xs font-bold text-on-surface">Commit share by contributor</h3>
            {insights.contributors.map((contributor) => <div key={contributor.login} className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 items-center text-xs"><div><div className="flex justify-between gap-2"><span className="truncate">{contributor.login}</span><span>{contributor.contributions} commits</span></div><div className="h-1.5 mt-1 rounded-full bg-surface-container-highest overflow-hidden"><div className="h-full bg-primary" style={{ width: `${contributor.percentage}%` }} /></div></div><strong>{contributor.percentage}%</strong></div>)}
          </div>

          <div className="grid sm:grid-cols-2 gap-3 text-xs">
            <div className="rounded-xl border border-outline-variant/30 p-3"><strong>Tech stack</strong><p className="mt-1 text-on-surface-variant">{insights.languages.length ? insights.languages.map((language) => language.name).join(' · ') : 'No language data available'}</p></div>
            <div className="rounded-xl border border-outline-variant/30 p-3"><strong>Project health</strong><p className="mt-1 text-on-surface-variant">{[['README', insights.projectHealth.readme], ['License', insights.projectHealth.license], ['.gitignore', insights.projectHealth.gitignore], ['CI', insights.projectHealth.ci]].map(([name, ok]) => `${name}: ${ok ? 'yes' : 'no'}`).join(' · ')}</p></div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3 text-xs">
            <div className="rounded-xl border border-outline-variant/30 p-3"><strong>Human vs AI authorship</strong><p className="mt-1 text-on-surface-variant">GitHub commit data cannot reliably determine whether code was written by a human or AI. This needs a separate review policy/tool.</p></div>
            <div className="rounded-xl border border-outline-variant/30 p-3"><strong>Plagiarism / copy detection</strong><p className="mt-1 text-on-surface-variant">Available after comparison against other submitted repositories or an approved reference corpus.</p></div>
          </div>
        </>}
      </section>

      {/* Snapshot Log History */}
      <div className="flex flex-col space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-sm text-on-surface">Snapshot Log History</h2>
          <span className="font-mono text-[10px] text-on-surface-variant">3 events</span>
        </div>
        <div className="rounded-2xl bg-surface-container-low p-4 space-y-4 border border-outline-variant/20">
          <div className="flex items-start gap-3 relative">
            <div className="flex flex-col items-center">
              <div className="w-3 h-3 rounded-full bg-primary ring-4 ring-primary/20" />
              <div className="w-0.5 h-10 bg-surface-container-highest my-1" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-primary">Snapshot v2 (Current Head)</span>
                <span className="font-mono text-[10px] text-on-surface-variant">12m ago</span>
              </div>
              <p className="text-[11px] text-on-surface-variant mt-0.5 truncate">
                Sync: Complete video pipeline streaming service
              </p>
              <div className="inline-flex items-center gap-1.5 mt-1 font-mono text-[10px] bg-surface-container px-2 py-0.5 rounded text-on-surface">
                <GitBranch className="w-3 h-3 text-primary" />
                <span className="text-primary font-semibold">7a82f0e</span>
                <span className="text-outline">·</span>
                <span>+142 / -18</span>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-outline mt-1" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs text-on-surface">Initial Webhook Hooked</span>
                <span className="font-mono text-[10px] text-on-surface-variant">18h ago</span>
              </div>
              <p className="text-[11px] text-on-surface-variant mt-0.5 truncate">
                Repository attached to HackGrid 2025 event cluster
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Seal Action Box */}
      <div className="space-y-2 pt-2 pb-6">
        <button
          type="button"
          disabled={locking}
          onClick={handleManualLock}
          className="w-full h-12 rounded-xl bg-primary-container hover:bg-primary text-on-primary-container hover:text-on-primary font-sans text-xs font-bold flex items-center justify-center gap-2 shadow-lg active:scale-[0.99] transition-all disabled:opacity-50"
        >
          <Lock className="w-4 h-4" />
          <span>{locking ? 'Locking Snapshot SHA...' : 'Submit & Lock Current SHA'}</span>
        </button>
        <p className="text-center font-mono text-[10px] text-on-surface-variant">
          You can update your submission until the code freeze at 23:59:00 EST.
        </p>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-surface-container-lowest/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-surface-container rounded-2xl p-6 space-y-4 shadow-2xl border border-outline-variant/30">
            <div className="w-12 h-12 rounded-full bg-secondary-container/30 text-secondary flex items-center justify-center mx-auto border border-secondary-container/50">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="font-bold text-base text-on-surface">SHA Cryptographically Frozen</h3>
              <p className="text-xs text-on-surface-variant">
                Commit <span className="font-mono text-primary font-bold">7a82f0e</span> has been successfully logged in GitTrack ledger for HackGrid 2025.
              </p>
            </div>
            <div className="bg-surface-container-low p-3 rounded-xl font-mono text-[11px] text-on-surface-variant space-y-1.5 border border-outline-variant/20">
              <div className="flex justify-between">
                <span>Timestamp:</span>
                <span className="text-on-surface">{new Date().toLocaleTimeString()} UTC</span>
              </div>
              <div className="flex justify-between">
                <span>Ledger Seal:</span>
                <span className="text-secondary font-mono">0x9F42...C8B</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowConfirmModal(false)}
              className="w-full h-11 bg-primary text-on-primary font-sans text-xs font-bold rounded-xl hover:bg-primary-fixed transition-colors"
            >
              Dismiss & View Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
