import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../firebase/config';
import {
  HackathonEvent,
  Team,
  ProblemStatement,
  Submission,
  AnalysisJob,
  AnalysisFinding,
  EvaluationSchema,
  Evaluation,
  PublishedLeaderboard,
  AuditLog,
  NotificationItem,
  EventAssignment,
  UserProfile,
} from '../types';

// ==================== EVENTS ====================

export async function getEvents(): Promise<HackathonEvent[]> {
  const path = 'events';
  try {
    const snap = await getDocs(collection(db, path));
    const events: HackathonEvent[] = [];
    snap.forEach((d) => {
      events.push({ id: d.id, ...d.data() } as HackathonEvent);
    });
    return events;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

export async function getEventById(eventId: string): Promise<HackathonEvent | null> {
  const path = `events/${eventId}`;
  try {
    const snap = await getDoc(doc(db, 'events', eventId));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as HackathonEvent;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
  }
}

export async function saveEvent(event: HackathonEvent): Promise<void> {
  const path = `events/${event.id}`;
  try {
    await setDoc(doc(db, 'events', event.id), event);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

// ==================== TEAMS ====================

export async function getTeamsForEvent(eventId: string): Promise<Team[]> {
  const path = `events/${eventId}/teams`;
  try {
    const snap = await getDocs(collection(db, 'events', eventId, 'teams'));
    const teams: Team[] = [];
    snap.forEach((d) => teams.push({ id: d.id, ...d.data() } as Team));
    return teams;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

export async function getTeamById(eventId: string, teamId: string): Promise<Team | null> {
  const path = `events/${eventId}/teams/${teamId}`;
  try {
    const snap = await getDoc(doc(db, 'events', eventId, 'teams', teamId));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as Team;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
  }
}

export async function saveTeam(eventId: string, team: Team): Promise<void> {
  const path = `events/${eventId}/teams/${team.id}`;
  try {
    await setDoc(doc(db, 'events', eventId, 'teams', team.id), team);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

// ==================== PROBLEMS ====================

export async function getProblemsForEvent(eventId: string): Promise<ProblemStatement[]> {
  const path = `events/${eventId}/problems`;
  try {
    const snap = await getDocs(collection(db, 'events', eventId, 'problems'));
    const problems: ProblemStatement[] = [];
    snap.forEach((d) => problems.push({ id: d.id, ...d.data() } as ProblemStatement));
    return problems;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

export async function saveProblem(eventId: string, problem: ProblemStatement): Promise<void> {
  const path = `events/${eventId}/problems/${problem.id}`;
  try {
    await setDoc(doc(db, 'events', eventId, 'problems', problem.id), problem);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

// ==================== SUBMISSIONS ====================

export async function getSubmissionsForEvent(eventId: string): Promise<Submission[]> {
  const path = `events/${eventId}/submissions`;
  if (!auth.currentUser) return [];
  try {
    const snap = await getDocs(collection(db, 'events', eventId, 'submissions'));
    const subs: Submission[] = [];
    snap.forEach((d) => subs.push({ id: d.id, ...d.data() } as Submission));
    return subs;
  } catch (err) {
    console.warn(`Could not list submissions for ${eventId}:`, err);
    return [];
  }
}

export async function getSubmissionForTeam(eventId: string, teamId: string): Promise<Submission | null> {
  const path = `events/${eventId}/submissions`;
  if (!auth.currentUser) return null;
  try {
    const q = query(collection(db, 'events', eventId, 'submissions'), where('teamId', '==', teamId));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    return { id: snap.docs[0].id, ...snap.docs[0].data() } as Submission;
  } catch (err) {
    console.warn(`Could not get submission for team ${teamId}:`, err);
    return null;
  }
}

export async function saveSubmission(eventId: string, submission: Submission): Promise<void> {
  const path = `events/${eventId}/submissions/${submission.id}`;
  try {
    await setDoc(doc(db, 'events', eventId, 'submissions', submission.id), submission);
    // Also update team submission status
    const teamRef = doc(db, 'events', eventId, 'teams', submission.teamId);
    await updateDoc(teamRef, { submissionStatus: 'submitted' });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

// ==================== FORENSICS & FINDINGS ====================

export async function getAnalysisJobsForEvent(eventId: string): Promise<AnalysisJob[]> {
  const path = `events/${eventId}/analysisJobs`;
  if (!auth.currentUser) return [];
  try {
    const snap = await getDocs(collection(db, 'events', eventId, 'analysisJobs'));
    const jobs: AnalysisJob[] = [];
    snap.forEach((d) => jobs.push({ id: d.id, ...d.data() } as AnalysisJob));
    return jobs;
  } catch (err) {
    console.warn(`Could not list analysis jobs for ${eventId}:`, err);
    return [];
  }
}

export async function saveAnalysisJob(eventId: string, job: AnalysisJob): Promise<void> {
  const path = `events/${eventId}/analysisJobs/${job.id}`;
  try {
    await setDoc(doc(db, 'events', eventId, 'analysisJobs', job.id), job);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

// ==================== DYNAMIC EVALUATION SCHEMAS ====================

export async function getSchemasForEvent(eventId: string): Promise<EvaluationSchema[]> {
  const path = `events/${eventId}/schemas`;
  if (!auth.currentUser) return [];
  try {
    const snap = await getDocs(collection(db, 'events', eventId, 'schemas'));
    const schemas: EvaluationSchema[] = [];
    snap.forEach((d) => schemas.push({ id: d.id, ...d.data() } as EvaluationSchema));
    return schemas;
  } catch (err) {
    console.warn(`Could not list schemas for ${eventId}:`, err);
    return [];
  }
}

export async function saveEvaluationSchema(eventId: string, schema: EvaluationSchema): Promise<void> {
  const path = `events/${eventId}/schemas/${schema.id}`;
  try {
    await setDoc(doc(db, 'events', eventId, 'schemas', schema.id), schema);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

// ==================== EVALUATIONS ====================

export async function getEvaluationsForEvent(eventId: string): Promise<Evaluation[]> {
  const path = `events/${eventId}/evaluations`;
  if (!auth.currentUser) return [];
  try {
    const snap = await getDocs(collection(db, 'events', eventId, 'evaluations'));
    const evals: Evaluation[] = [];
    snap.forEach((d) => evals.push({ id: d.id, ...d.data() } as Evaluation));
    return evals;
  } catch (err) {
    console.warn(`Could not list evaluations for ${eventId}:`, err);
    return [];
  }
}

export async function saveEvaluation(eventId: string, evaluation: Evaluation): Promise<void> {
  const path = `events/${eventId}/evaluations/${evaluation.id}`;
  try {
    await setDoc(doc(db, 'events', eventId, 'evaluations', evaluation.id), evaluation);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

// ==================== LEADERBOARD ====================

export async function getPublishedLeaderboard(eventId: string): Promise<PublishedLeaderboard | null> {
  const path = `events/${eventId}/leaderboard/published`;
  try {
    const snap = await getDoc(doc(db, 'events', eventId, 'leaderboard', 'published'));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as PublishedLeaderboard;
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, path);
  }
}

export async function savePublishedLeaderboard(eventId: string, leaderboard: PublishedLeaderboard): Promise<void> {
  const path = `events/${eventId}/leaderboard/published`;
  try {
    await setDoc(doc(db, 'events', eventId, 'leaderboard', 'published'), leaderboard);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

// ==================== AUDIT LOGS ====================

export async function recordAuditLog(log: Omit<AuditLog, 'id' | 'timestamp'>): Promise<void> {
  const logId = `log_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
  const path = `auditLogs/${logId}`;
  try {
    const fullLog: AuditLog = {
      ...log,
      id: logId,
      timestamp: new Date().toISOString(),
    };
    await setDoc(doc(db, 'auditLogs', logId), fullLog);
  } catch (err) {
    console.error('Audit log write error:', err);
  }
}

export async function getAuditLogs(): Promise<AuditLog[]> {
  const path = 'auditLogs';
  try {
    const q = query(collection(db, 'auditLogs'), orderBy('timestamp', 'desc'), limit(100));
    const snap = await getDocs(q);
    const logs: AuditLog[] = [];
    snap.forEach((d) => logs.push({ id: d.id, ...d.data() } as AuditLog));
    return logs;
  } catch (err) {
    console.warn('Could not read audit logs directly (likely participant or permissions):', err);
    return [];
  }
}

// ==================== NOTIFICATIONS ====================

export async function getUserNotifications(userId: string): Promise<NotificationItem[]> {
  const path = `notifications/${userId}/items`;
  try {
    const snap = await getDocs(collection(db, 'notifications', userId, 'items'));
    const items: NotificationItem[] = [];
    snap.forEach((d) => items.push({ id: d.id, ...d.data() } as NotificationItem));
    return items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch (err) {
    return [];
  }
}

// ==================== USERS & ROLES ====================

export async function getAllUsers(): Promise<UserProfile[]> {
  const path = 'users';
  // Fallback demo user directory for offline or unauthenticated demo evaluation
  const fallbackUsers: UserProfile[] = [
    {
      uid: 'usr_01',
      displayName: 'Dr. Evelyn Vance',
      email: 'e.vance@mit.edu',
      role: 'admin',
      status: 'active',
      createdAt: new Date().toISOString(),
    },
    {
      uid: 'usr_02',
      displayName: 'Alex Zhang',
      email: 'alex.z@campus.edu',
      role: 'participant',
      status: 'active',
      createdAt: new Date().toISOString(),
    },
    {
      uid: 'usr_03',
      displayName: 'Aarav Sharma',
      email: 'aarav.s@campus.edu',
      role: 'participant',
      status: 'active',
      createdAt: new Date().toISOString(),
    },
    {
      uid: 'usr_root',
      displayName: 'Platform Superadmin',
      email: 'pranavpaunikar.ml24@sbjit.edu.in',
      role: 'superadmin',
      status: 'active',
      createdAt: new Date().toISOString(),
    },
  ];

  if (!auth.currentUser) {
    return fallbackUsers;
  }

  try {
    const snap = await getDocs(collection(db, path));
    const users: UserProfile[] = [];
    snap.forEach((d) => users.push({ uid: d.id, ...d.data() } as UserProfile));
    return users.length > 0 ? users : fallbackUsers;
  } catch (err) {
    console.warn('Could not list users from Firestore, using fallback directory:', err);
    return fallbackUsers;
  }
}

export async function updateUserRole(userId: string, newRole: 'participant' | 'admin' | 'superadmin', actorEmail: string): Promise<void> {
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, { role: newRole, updatedAt: new Date().toISOString() });

  const adminRef = doc(db, 'admins', userId);
  if (newRole === 'admin' || newRole === 'superadmin') {
    await setDoc(adminRef, {
      uid: userId,
      role: newRole,
      grantedAt: new Date().toISOString(),
      grantedBy: actorEmail,
    });
  }

  await recordAuditLog({
    actorId: actorEmail,
    actorEmail,
    action: `ROLE_CHANGE_${newRole.toUpperCase()}`,
    entityType: 'User',
    entityId: userId,
    details: `Updated user ${userId} role to ${newRole}`,
    reason: 'Administrative role assignment',
  });
}

// ==================== INITIAL SEED DATA ====================

export async function seedInitialDemoEventIfEmpty(): Promise<HackathonEvent | null> {
  try {
    const events = await getEvents();
    if (events && events.length > 0) return events[0];

    const demoEvent: HackathonEvent = {
      id: 'hack-2026-global',
      title: 'ByteHacks Global 2026',
      slug: 'bytehacks-global-2026',
      description: 'The world premier repository-driven hackathon. Innovate, commit, and build next-generation distributed systems, AI tools, and fintech solutions with real-time commit verification.',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
      submissionDeadline: new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString(),
      minTeamSize: 2,
      maxTeamSize: 4,
      status: 'active',
      eligibility: 'Open to developers, college students, and engineers globally.',
      rounds: [
        { id: 'round_1', name: 'Round 1: Architecture & Repo Prototype', order: 1, maxMarks: 50, weight: 0.4 },
        { id: 'round_2', name: 'Round 2: Production Deploy & Impact', order: 2, maxMarks: 50, weight: 0.6 },
      ],
      createdBy: 'pranavpaunikar.ml24@sbjit.edu.in',
      createdAt: new Date().toISOString(),
    };

    await saveEvent(demoEvent);

    // Seed Problem Statements
    const problems: ProblemStatement[] = [
      {
        id: 'prob_fintech',
        eventId: demoEvent.id,
        title: 'Zero-Knowledge Micro-Settlement Gateway',
        code: 'FIN-01',
        track: 'FinTech & Web3',
        summary: 'Build high-throughput, privacy-preserving microtransactions with fraud detection.',
        description: 'Design and deploy a verifiable payment engine capable of settlement under 200ms with tamper-evident audit trails.',
        difficulty: 'advanced',
        maxCapacity: 20,
        currentCount: 3,
        status: 'published',
      },
      {
        id: 'prob_ai',
        eventId: demoEvent.id,
        title: 'Autonomous Code Review & Refactoring Agent',
        code: 'AI-02',
        track: 'Developer Tooling & AI',
        summary: 'Automate pull-request analysis, style normalization, and vulnerability auditing.',
        description: 'Construct a serverless analyzer that ingests Git diffs, flags anti-patterns, and generates unit test coverage automatically.',
        difficulty: 'intermediate',
        maxCapacity: 25,
        currentCount: 4,
        status: 'published',
      },
      {
        id: 'prob_climate',
        eventId: demoEvent.id,
        title: 'Decentralized Carbon Offset Verification API',
        code: 'CLIM-03',
        track: 'Climate & Sustainability',
        summary: 'Verify sensor telemetry from renewable grid installations.',
        description: 'Provide an immutable API that matches energy production metrics against verified carbon credits.',
        difficulty: 'intermediate',
        maxCapacity: 15,
        currentCount: 2,
        status: 'published',
      },
    ];

    for (const prob of problems) {
      await saveProblem(demoEvent.id, prob);
    }

    // Seed Dynamic Rubric Schema
    const schema: EvaluationSchema = {
      id: 'schema_round_1',
      eventId: demoEvent.id,
      roundId: 'round_1',
      name: 'Round 1 Comprehensive Technical Rubric',
      version: 1,
      status: 'published',
      totalMaxMarks: 50,
      createdBy: 'pranavpaunikar.ml24@sbjit.edu.in',
      createdAt: new Date().toISOString(),
      criteria: [
        {
          id: 'crit_code_arch',
          label: 'Code Architecture & Cleanliness',
          description: 'Structure, modularity, separation of concerns, and TypeScript type safety.',
          type: 'rubric',
          maxMarks: 15,
          required: true,
          weight: 0.3,
          order: 1,
          rubricLevels: [
            { label: 'Exemplary', points: 15, description: 'Production-ready, clean domain models, zero spaghetti code' },
            { label: 'Proficient', points: 12, description: 'Good organization with minor duplication' },
            { label: 'Developing', points: 8, description: 'Basic modularity but lacking architectural patterns' },
            { label: 'Needs Improvement', points: 4, description: 'Monolithic or untyped logic' },
          ],
        },
        {
          id: 'crit_repo_hygiene',
          label: 'Git Commit Forensics & Hygiene',
          description: 'Distributed commit history, descriptive commit messages, regular commits without late dump.',
          type: 'rubric',
          maxMarks: 15,
          required: true,
          weight: 0.3,
          order: 2,
          rubricLevels: [
            { label: 'Authentic & Steady', points: 15, description: 'Frequent meaningful commits throughout the hackathon' },
            { label: 'Normal Distributed', points: 12, description: 'Moderate commit count with clear milestones' },
            { label: 'Irregular Clustered', points: 7, description: 'Large single commits with minimal incremental progress' },
          ],
        },
        {
          id: 'crit_technical_depth',
          label: 'Technical Complexity & Innovation',
          description: 'Algorithmic efficiency, integration of real APIs, resilience and error handling.',
          type: 'numeric',
          maxMarks: 20,
          required: true,
          weight: 0.4,
          order: 3,
        },
      ],
    };

    await saveEvaluationSchema(demoEvent.id, schema);

    // Seed Sample Team & Submission for immediate evaluation
    const sampleTeam: Team = {
      id: 'team_aurora',
      eventId: demoEvent.id,
      name: 'Aurora Innovators',
      code: 'AUR-892',
      leaderId: 'seed_leader_1',
      leaderEmail: 'leader@aurora.io',
      problemId: 'prob_ai',
      submissionStatus: 'submitted',
      createdAt: new Date().toISOString(),
      members: [
        { userId: 'seed_leader_1', email: 'leader@aurora.io', displayName: 'Alex Chen', role: 'leader', joinedAt: new Date().toISOString() },
        { userId: 'seed_mem_2', email: 'sam@aurora.io', displayName: 'Samira Patel', role: 'member', joinedAt: new Date().toISOString() },
      ],
    };
    await saveTeam(demoEvent.id, sampleTeam);

    const sampleSub: Submission = {
      id: 'sub_aurora',
      teamId: sampleTeam.id,
      teamName: sampleTeam.name,
      eventId: demoEvent.id,
      problemId: 'prob_ai',
      provider: 'github',
      repoUrl: 'https://github.com/aurora-labs/code-refactor-agent',
      branch: 'main',
      frozenCommitSha: 'a4f91b7d82e1c940e53a29b47cf89234190e8a71',
      commitMessage: 'feat(core): implement AST syntax tree diff analyzer',
      authorName: 'Alex Chen',
      authorEmail: 'alex@aurora.io',
      committedAt: new Date(Date.now() - 3600000).toISOString(),
      snapshotAt: new Date().toISOString(),
      status: 'submitted',
      submittedBy: sampleTeam.leaderId,
      lateBulkUploadDetected: false,
    };
    await saveSubmission(demoEvent.id, sampleSub);

    return demoEvent;
  } catch (err) {
    console.error('Seed demo event error:', err);
    return null;
  }
}
