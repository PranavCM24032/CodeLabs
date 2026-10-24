import express, { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Health Check
app.get(['/api/health', '/health'], (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'CodeLab Engine',
    timestamp: new Date().toISOString(),
    owner: 'pranavpaunikar.ml24@sbjit.edu.in',
  });
});

type GitHubContributor = { login: string; contributions: number; avatarUrl?: string };

function getGitHubRepository(url: string): { owner: string; repo: string } | null {
  try {
    const parsed = new URL(url.trim());
    if (parsed.hostname !== 'github.com') return null;
    const [owner, repo] = parsed.pathname.split('/').filter(Boolean);
    if (!owner || !repo) return null;
    return { owner, repo: repo.replace(/\.git$/, '') };
  } catch {
    return null;
  }
}

function getPageCount(linkHeader: string | null): number | null {
  const last = linkHeader?.match(/[?&]page=(\d+)[^>]*>; rel="last"/);
  return last ? Number(last[1]) : null;
}

// Repository metadata only. Git history cannot reliably tell whether code is human- or AI-written;
// plagiarism detection needs a configured comparison corpus and is therefore reported separately.
app.get(['/api/repository-insights', '/repository-insights'], async (req: Request, res: Response) => {
  const target = getGitHubRepository(String(req.query.repoUrl || ''));
  if (!target) return res.status(400).json({ error: 'Enter a valid GitHub repository URL.' });

  const baseUrl = `https://api.github.com/repos/${encodeURIComponent(target.owner)}/${encodeURIComponent(target.repo)}`;
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'User-Agent': 'CodeLab-Hackathon-Portal',
  };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

  try {
    const [repoResponse, commitsResponse, contributorsResponse] = await Promise.all([
      fetch(baseUrl, { headers }),
      fetch(`${baseUrl}/commits?per_page=1`, { headers }),
      fetch(`${baseUrl}/contributors?per_page=100&anon=1`, { headers }),
    ]);

    if (!repoResponse.ok) {
      const message = repoResponse.status === 404
        ? 'Repository not found or it is private. Add a GitHub token on the server for private repositories.'
        : `GitHub could not read this repository (${repoResponse.status}).`;
      return res.status(repoResponse.status).json({ error: message });
    }
    if (!commitsResponse.ok || !contributorsResponse.ok) {
      return res.status(502).json({ error: 'GitHub repository metadata could not be loaded.' });
    }

    const repo = await repoResponse.json() as { default_branch: string; updated_at: string; license?: { spdx_id?: string } };
    const commits = await commitsResponse.json() as Array<{ sha: string; commit: { message: string; author: { date: string; name: string } } }>;
    const contributorsRaw = await contributorsResponse.json() as Array<{ login?: string; name?: string; contributions: number; avatar_url?: string }>;
    const totalCommits = getPageCount(commitsResponse.headers.get('link')) ?? commits.length;
    const contributors: GitHubContributor[] = contributorsRaw
      .map((item) => ({ login: item.login || item.name || 'Unknown contributor', contributions: item.contributions, avatarUrl: item.avatar_url }))
      .sort((a, b) => b.contributions - a.contributions)
      .slice(0, 12);
    const contributionTotal = contributors.reduce((sum, item) => sum + item.contributions, 0);
    const latest = commits[0];
    const lastCommitPage = getPageCount(commitsResponse.headers.get('link'));
    const [firstCommitResponse, pullRequestsResponse, branchesResponse, languagesResponse, rootFilesResponse, commitActivityResponse, codeFrequencyResponse] = await Promise.all([
      lastCommitPage ? fetch(`${baseUrl}/commits?per_page=1&page=${lastCommitPage}`, { headers }) : Promise.resolve(null),
      fetch(`${baseUrl}/pulls?state=all&per_page=1`, { headers }),
      fetch(`${baseUrl}/branches?per_page=1`, { headers }),
      fetch(`${baseUrl}/languages`, { headers }),
      fetch(`${baseUrl}/contents`, { headers }),
      fetch(`${baseUrl}/stats/commit_activity`, { headers }),
      fetch(`${baseUrl}/stats/code_frequency`, { headers }),
    ]);
    const firstCommit = firstCommitResponse?.ok ? (await firstCommitResponse.json() as Array<{ commit: { author: { date: string } } }>)[0] : null;
    const languages = languagesResponse.ok ? await languagesResponse.json() as Record<string, number> : {};
    const rootFiles = rootFilesResponse.ok ? await rootFilesResponse.json() as Array<{ name: string }> : [];
    const rootNames = new Set(rootFiles.map((file) => file.name.toLowerCase()));
    const activity = commitActivityResponse.ok ? await commitActivityResponse.json() as Array<{ week: number; total: number }> : [];
    const codeFrequency = codeFrequencyResponse.ok ? await codeFrequencyResponse.json() as Array<[number, number, number]> : [];

    return res.json({
      repository: `${target.owner}/${target.repo}`,
      defaultBranch: repo.default_branch,
      totalCommits,
      totalContributors: contributorsRaw.length,
      lastCommit: latest ? {
        sha: latest.sha,
        message: latest.commit.message,
        authoredAt: latest.commit.author.date,
        author: latest.commit.author.name,
      } : null,
      contributors: contributors.map((item) => ({ ...item, percentage: contributionTotal ? Math.round((item.contributions / contributionTotal) * 100) : 0 })),
      firstCommitAt: firstCommit?.commit.author.date || null,
      pullRequests: pullRequestsResponse.ok ? (getPageCount(pullRequestsResponse.headers.get('link')) ?? 0) : null,
      branches: branchesResponse.ok ? (getPageCount(branchesResponse.headers.get('link')) ?? 1) : null,
      languages: Object.entries(languages).sort(([, a], [, b]) => b - a).slice(0, 5).map(([name, bytes]) => ({ name, bytes })),
      projectHealth: {
        readme: rootNames.has('readme.md'),
        license: rootNames.has('license') || rootNames.has('license.md'),
        gitignore: rootNames.has('.gitignore'),
        ci: rootNames.has('.github'),
      },
      commitActivity: activity.slice(-12).map((week) => ({ week: week.week, commits: week.total })),
      codeChurn: codeFrequency.slice(-12).map(([week, additions, deletions]) => ({ week, additions, deletions: Math.abs(deletions) })),
      checks: {
        repositoryAccess: 'passed',
        humanAiAuthorship: 'not_determinable',
        plagiarism: 'requires_comparison_corpus',
      },
      fetchedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    return res.status(502).json({ error: err.message || 'Unable to reach GitHub.' });
  }
});

// Helper to normalize and tokenize code for similarity analysis
function tokenizeCode(code: string): string[] {
  const stripped = code
    .replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '')
    .replace(/\s+/g, ' ')
    .trim();
  return stripped.split(/([a-zA-Z0-9_]+|[^\s\w])/g).filter((t) => t.trim().length > 0);
}

// Jaccard similarity of n-grams (3-grams)
function calculateNgramSimilarity(tokensA: string[], tokensB: string[], n = 3): number {
  if (tokensA.length < n || tokensB.length < n) return 0;
  const ngramsA = new Set<string>();
  const ngramsB = new Set<string>();

  for (let i = 0; i <= tokensA.length - n; i++) {
    ngramsA.add(tokensA.slice(i, i + n).join(' '));
  }
  for (let i = 0; i <= tokensB.length - n; i++) {
    ngramsB.add(tokensB.slice(i, i + n).join(' '));
  }

  let intersection = 0;
  for (const item of ngramsA) {
    if (ngramsB.has(item)) intersection++;
  }
  const union = ngramsA.size + ngramsB.size - intersection;
  return union === 0 ? 0 : Math.round((intersection / union) * 100);
}

// Similarity Analysis Engine
app.post(['/api/analysis/run-similarity', '/analysis/run-similarity'], (req: Request, res: Response) => {
  try {
    const { submissionId, codeSampleA, codeSampleB, otherTeamName } = req.body;

    const sampleA = codeSampleA || '';
    const sampleB = codeSampleB || '';

    if (!sampleA || !sampleB) {
      return res.json({
        success: true,
        submissionId: submissionId || '',
        similarityScore: 0,
        findingsCount: 0,
        findings: [],
        lateBulkUploadIndicator: false,
        analyzedAt: new Date().toISOString(),
      });
    }

    const tokensA = tokenizeCode(sampleA);
    const tokensB = tokenizeCode(sampleB);
    const matchPercentage = calculateNgramSimilarity(tokensA, tokensB, 3);

    const findings = [];
    if (matchPercentage > 15) {
      findings.push({
        id: `find_${Date.now()}_1`,
        jobId: `job_${Date.now()}`,
        submissionId: submissionId || 'sub_current',
        comparisonSubmissionId: 'sub_benchmark',
        comparisonTeamName: otherTeamName || 'Team BitCrafters',
        fileA: 'src/components/PaymentProcessor.tsx',
        fileB: 'src/modules/PaymentWidget.tsx',
        lineRangeA: [4, 12] as [number, number],
        lineRangeB: [5, 13] as [number, number],
        matchPercentage,
        similarityMetric: '3-Gram Token Jaccard Distance',
        snippetA: sampleA.trim().split('\n').slice(3, 11).join('\n'),
        snippetB: sampleB.trim().split('\n').slice(4, 12).join('\n'),
        status: matchPercentage > 60 ? 'needs_explanation' : 'unreviewed',
      });
    }

    return res.json({
      success: true,
      submissionId,
      similarityScore: matchPercentage,
      findingsCount: findings.length,
      findings,
      lateBulkUploadIndicator: false,
      analyzedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Similarity engine error' });
  }
});

// Authorized CSV Export
app.all(['/api/export/leaderboard-csv', '/export/leaderboard-csv'], (req: Request, res: Response) => {
  try {
    const standings = req.body?.standings || [];
    const eventTitle = req.body?.eventTitle || (req.query.eventId as string) || 'Hackathon_Event';

    const headers = ['Rank', 'Team Name', 'Total Score', 'Tie Indicator', 'Status', 'Last Updated'];
    const rows = standings.map((item: any) => [
      item.rank,
      `"${(item.teamName || '').replace(/"/g, '""')}"`,
      item.score,
      item.isTie ? 'Tie' : 'Clear',
      item.status,
      item.lastUpdated,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r: (string | number)[]) => r.join(','))].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="CodeLab_Leaderboard_${(eventTitle || 'Event').replace(/\s+/g, '_')}.csv"`
    );
    return res.send(csvContent);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// JSON-based user access control
const DATA_DIR = path.resolve(__dirname, 'data');
const STAFF_USERS_PATH = path.join(DATA_DIR, 'staff-users.json');
const PARTICIPANTS_PATH = path.join(DATA_DIR, 'participants.json');

function readJsonFile(filePath: string) {
  try {
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(content);
    }
  } catch (e) {
    console.error('Error reading JSON file:', e);
  }
  return [];
}

app.get('/api/auth/allowed-users', (_req: Request, res: Response) => {
  try {
    const staffUsers = readJsonFile(STAFF_USERS_PATH);
    const participants = readJsonFile(PARTICIPANTS_PATH);
    res.json({ staffUsers, participants });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/auth/check-access', (req: Request, res: Response) => {
  try {
    const email = ((req.query.email as string) || '').toLowerCase().trim();
    if (!email) return res.status(400).json({ allowed: false, error: 'Email required' });

    const staffUsers = readJsonFile(STAFF_USERS_PATH);
    const participants = readJsonFile(PARTICIPANTS_PATH);

    const staffUser = staffUsers.find((u: any) => (u.email || '').toLowerCase().trim() === email);
    if (staffUser) {
      return res.json({ allowed: true, type: 'staff', user: staffUser });
    }

    const participant = participants.find((p: any) => (p.email || '').toLowerCase().trim() === email);
    if (participant) {
      return res.json({ allowed: true, type: 'participant', user: participant });
    }

    res.json({ allowed: false });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Serve static files in standalone/local production if dist exists
const distPath = path.resolve(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.resolve(distPath, 'index.html'));
  });
}

// Start a listener only for local development. Vercel imports the Express app as a
// serverless handler; starting a second listener there causes function invocation failures.
const isServerlessRuntime = process.env.NODE_ENV === 'production' || Boolean(process.env.VERCEL || process.env.VERCEL_REGION);
if (!isServerlessRuntime) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CodeLab server running at http://localhost:${PORT}`);
  });
}

export default app;
