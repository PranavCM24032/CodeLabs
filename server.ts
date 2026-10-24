import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Health Check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'GitTrack Engine',
    timestamp: new Date().toISOString(),
    owner: 'pranavpaunikar.ml24@sbjit.edu.in',
  });
});

  try {
    res.json({ success: true, timestamp: new Date().toISOString(), results });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Helper to normalize and tokenize code for similarity analysis
function tokenizeCode(code: string): string[] {
  // Strip comments and normalize whitespace
  const stripped = code
    .replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '')
    .replace(/\s+/g, ' ')
    .trim();
  // Simple tokenization by words, symbols, and operators
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

// 2. SIMILARITY ANALYSIS ENGINE
app.post('/api/analysis/run-similarity', (req: Request, res: Response) => {
  try {
    const { submissionId, teamName, codeSampleA, codeSampleB, otherTeamName } = req.body;

    const sampleA =
      codeSampleA ||
      `
import React, { useState, useEffect } from 'react';
export function PaymentProcessor({ amount, currency }) {
  const [status, setStatus] = useState('idle');
  const handleCheckout = async () => {
    setStatus('processing');
    const res = await fetch('/api/pay', { method: 'POST', body: JSON.stringify({ amount, currency }) });
    if (res.ok) setStatus('success');
    else setStatus('failed');
  };
  return <button onClick={handleCheckout}>Pay {amount} {currency}</button>;
}
`;

    const sampleB =
      codeSampleB ||
      `
import React, { useState } from 'react';
export function PaymentWidget({ total, currencyCode }) {
  const [state, setState] = useState('idle');
  const triggerPayment = async () => {
    setState('processing');
    const res = await fetch('/api/pay', { method: 'POST', body: JSON.stringify({ amount: total, currency: currencyCode }) });
    if (res.ok) setState('success');
    else setState('failed');
  };
  return <button onClick={triggerPayment}>Submit {total} {currencyCode}</button>;
}
`;

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

// 3. AUTHORIZED CSV EXPORT (Supports GET and POST)
app.all('/api/export/leaderboard-csv', (req: Request, res: Response) => {
  try {
    const standings = req.body?.standings || [
      { rank: 1, teamName: 'Team HyperSync', score: 94.2, isTie: false, status: 'Approved & Sealed', lastUpdated: new Date().toISOString() },
      { rank: 2, teamName: 'Team OmniMesh', score: 93.8, isTie: false, status: 'Approved & Sealed', lastUpdated: new Date().toISOString() },
      { rank: 3, teamName: 'Team ByteCrafters', score: 92.5, isTie: false, status: 'Approved & Sealed', lastUpdated: new Date().toISOString() },
      { rank: 4, teamName: 'Team Aurora Innovators', score: 89.4, isTie: false, status: 'Approved & Sealed', lastUpdated: new Date().toISOString() },
      { rank: 5, teamName: 'Team KryptonLedger', score: 88.0, isTie: false, status: 'Approved & Sealed', lastUpdated: new Date().toISOString() },
    ];
    const eventTitle = req.body?.eventTitle || (req.query.eventId as string) || 'HackGrid_2025';

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
      `attachment; filename="GitTrack_Leaderboard_${(eventTitle || 'Event').replace(/\s+/g, '_')}.csv"`
    );
    return res.send(csvContent);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Vite middleware in dev or static files in production

// Serve static in production (Vercel)
const distPath = path.resolve(__dirname, 'dist');
app.use(express.static(distPath));
app.get('*', (_req, res) => {
  res.sendFile(path.resolve(distPath, 'index.html'));
});
export default app;

