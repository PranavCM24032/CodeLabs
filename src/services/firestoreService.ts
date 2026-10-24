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
  try {
    const snap = await getDocs(collection(db, path));
    const users: UserProfile[] = [];
    snap.forEach((d) => users.push({ uid: d.id, ...d.data() } as UserProfile));
    return users;
  } catch (err) {
    console.warn('Could not list users from Firestore:', err);
    return [];
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


