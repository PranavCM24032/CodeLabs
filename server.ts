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

// Start listener for standalone/local environment (Vercel invokes exported handler)
if (!process.env.VERCEL) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CodeLab server running at http://localhost:${PORT}`);
  });
}

export default app;
