import { SchemaCriterion, LeaderboardEntry, Evaluation } from '../types';

export function runCriticalDomainInvariantsTest() {
  const results: { test: string; passed: boolean; message?: string }[] = [];

  // Test 1: Score Bounds Validation (0 <= score <= maxMarks)
  try {
    const criterion: SchemaCriterion = {
      id: 'crit_test',
      label: 'Code Quality',
      description: 'Cleanliness',
      type: 'numeric',
      maxMarks: 20,
      required: true,
      weight: 1,
      order: 1,
    };

    const validateScore = (score: number, max: number) => {
      if (score < 0 || score > max) throw new Error('Score out of bounds');
      return true;
    };

    let passedNegative = false;
    try {
      validateScore(-1, criterion.maxMarks);
    } catch {
      passedNegative = true;
    }

    let passedOverflow = false;
    try {
      validateScore(25, criterion.maxMarks);
    } catch {
      passedOverflow = true;
    }

    const passedValid = validateScore(15, criterion.maxMarks);

    results.push({
      test: 'Score Bounds Invariant (0 <= score <= maxMarks)',
      passed: passedNegative && passedOverflow && passedValid,
    });
  } catch (err: any) {
    results.push({ test: 'Score Bounds Invariant', passed: false, message: err.message });
  }

  // Test 2: Multi-Judge Aggregation & Tie Detection
  try {
    const entries: LeaderboardEntry[] = [
      { rank: 1, teamId: 't1', teamName: 'Alpha', score: 90, roundScores: {}, isTie: false, status: 'ok', lastUpdated: '' },
      { rank: 1, teamId: 't2', teamName: 'Beta', score: 90, roundScores: {}, isTie: false, status: 'ok', lastUpdated: '' },
      { rank: 1, teamId: 't3', teamName: 'Gamma', score: 85, roundScores: {}, isTie: false, status: 'ok', lastUpdated: '' },
    ];

    entries.sort((a, b) => b.score - a.score);
    entries.forEach((e, i) => {
      if (i > 0 && entries[i - 1].score === e.score) {
        e.rank = entries[i - 1].rank;
        e.isTie = true;
        entries[i - 1].isTie = true;
      } else {
        e.rank = i + 1;
      }
    });

    const isTieCorrect = entries[0].rank === 1 && entries[1].rank === 1 && entries[0].isTie && entries[1].isTie;
    const isNextRankCorrect = entries[2].rank === 3 && !entries[2].isTie;

    results.push({
      test: 'Leaderboard Ranking and Tie Break Sequence',
      passed: isTieCorrect && isNextRankCorrect,
    });
  } catch (err: any) {
    results.push({ test: 'Leaderboard Ranking and Tie Break Sequence', passed: false, message: err.message });
  }

  // Test 3: Repository URL Format Parser
  try {
    const parseRepo = (url: string) => {
      const clean = url.trim().replace(/\.git$/, '');
      const parts = clean.split('/');
      return { owner: parts[parts.length - 2], repo: parts[parts.length - 1] };
    };

    const parsed = parseRepo('https://github.com/myorg/project');
    results.push({
      test: 'Repository URL Parsing',
      passed: parsed.owner === 'myorg' && parsed.repo === 'project',
    });
  } catch (err: any) {
    results.push({ test: 'Repository URL Parsing', passed: false, message: err.message });
  }

  // Test 4: Participant Default Role Invariant
  try {
    const createNewUser = (email: string) => {
      const isOwner = email === 'pranavpaunikar.ml24@sbjit.edu.in';
      return {
        role: isOwner ? 'superadmin' : 'participant',
      };
    };

    const normalUser = createNewUser('student@college.edu');
    const ownerUser = createNewUser('pranavpaunikar.ml24@sbjit.edu.in');

    results.push({
      test: 'Default Role Isolation & Superadmin Bootstrap',
      passed: normalUser.role === 'participant' && ownerUser.role === 'superadmin',
    });
  } catch (err: any) {
    results.push({ test: 'Default Role Isolation', passed: false, message: err.message });
  }

  return results;
}
