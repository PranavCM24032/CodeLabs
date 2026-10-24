export type UserRole = 'participant' | 'admin' | 'superadmin';
export type UserStatus = 'active' | 'suspended';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  status: UserStatus;
  createdAt: string;
  updatedAt?: string;
}

export type EventStatus = 'draft' | 'published' | 'active' | 'judging' | 'completed' | 'archived';

export interface EventRound {
  id: string;
  name: string;
  order: number;
  maxMarks: number;
  weight: number;
}

export interface HackathonEvent {
  id: string;
  title: string;
  slug: string;
  description: string;
  bannerUrl?: string;
  startDate: string;
  endDate: string;
  submissionDeadline: string;
  minTeamSize: number;
  maxTeamSize: number;
  status: EventStatus;
  eligibility?: string;
  rounds: EventRound[];
  rules?: string;
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
}

export interface EventAssignment {
  id: string;
  eventId: string;
  adminId: string;
  adminEmail: string;
  assignedRounds: string[];
  assignedTeamIds?: string[];
  canPublishLeaderboard: boolean;
  canManageTeams: boolean;
  assignedAt: string;
  assignedBy: string;
}

export interface TeamMember {
  userId: string;
  email: string;
  displayName: string;
  role: 'leader' | 'member';
  joinedAt: string;
}

export interface Team {
  id: string;
  eventId: string;
  name: string;
  code: string;
  leaderId: string;
  leaderEmail: string;
  members: TeamMember[];
  problemId?: string;
  submissionStatus: 'not_submitted' | 'submitted' | 'under_review' | 'evaluated';
  createdAt: string;
}

export interface ProblemStatement {
  id: string;
  eventId: string;
  title: string;
  code: string;
  track: string;
  summary: string;
  description: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'open';
  maxCapacity: number;
  currentCount: number;
  status: 'draft' | 'published' | 'archived';
  attachments?: { name: string; url: string }[];
}

export type RepoProvider = 'github' | 'gitlab' | 'bitbucket';

export interface Submission {
  id: string;
  teamId: string;
  teamName: string;
  eventId: string;
  problemId?: string;
  provider: RepoProvider;
  repoUrl: string;
  liveProjectUrl?: string;
  branch: string;
  frozenCommitSha: string;
  commitMessage: string;
  authorName: string;
  authorEmail: string;
  committedAt: string;
  snapshotAt: string;
  status: 'submitted' | 'analyzing' | 'analyzed' | 'flagged' | 'cleared';
  submittedBy: string;
  lateBulkUploadDetected?: boolean;
}

export interface AnalysisJob {
  id: string;
  submissionId: string;
  eventId: string;
  teamId: string;
  teamName: string;
  status: 'queued' | 'running' | 'completed' | 'failed';
  similarityScore: number;
  lateBulkUploadIndicator: boolean;
  bulkUploadReason?: string;
  totalCommits: number;
  activeContributors: number;
  findingsCount: number;
  analyzedAt: string;
  logs: string[];
}

export type FindingStatus =
  | 'unreviewed'
  | 'under_review'
  | 'needs_explanation'
  | 'reviewed'
  | 'dismissed'
  | 'escalated';

export interface AnalysisFinding {
  id: string;
  jobId: string;
  submissionId: string;
  comparisonSubmissionId?: string;
  comparisonTeamName?: string;
  fileA: string;
  fileB: string;
  lineRangeA: [number, number];
  lineRangeB: [number, number];
  matchPercentage: number;
  similarityMetric: string;
  snippetA: string;
  snippetB: string;
  status: FindingStatus;
  reviewerNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface RubricLevel {
  label: string;
  points: number;
  description: string;
}

export interface SchemaCriterion {
  id: string;
  label: string;
  description: string;
  type: 'numeric' | 'rubric' | 'dropdown' | 'comment';
  maxMarks: number;
  required: boolean;
  weight: number;
  order: number;
  rubricLevels?: RubricLevel[];
}

export interface EvaluationSchema {
  id: string;
  eventId: string;
  roundId: string;
  name: string;
  version: number;
  status: 'draft' | 'published' | 'retired';
  totalMaxMarks: number;
  criteria: SchemaCriterion[];
  createdBy: string;
  createdAt: string;
  publishedAt?: string;
}

export type EvaluationStatus = 'draft' | 'submitted' | 'returned' | 'approved' | 'finalized';

export interface Evaluation {
  id: string;
  eventId: string;
  roundId: string;
  teamId: string;
  teamName: string;
  submissionId: string;
  judgeId: string;
  judgeEmail: string;
  schemaId: string;
  schemaVersion: number;
  scores: Record<string, number>;
  criterionComments?: Record<string, string>;
  totalScore: number;
  provisionalTotal: number;
  generalFeedback: string;
  internalNotes: string;
  status: EvaluationStatus;
  submittedAt?: string;
  approvedBy?: string;
  approvedAt?: string;
  overrideReason?: string;
}

export interface LeaderboardEntry {
  rank: number;
  teamId: string;
  teamName: string;
  problemTitle?: string;
  score: number;
  roundScores: Record<string, number>;
  isTie: boolean;
  status: string;
  lastUpdated: string;
}

export interface PublishedLeaderboard {
  id: string;
  eventId: string;
  status: 'draft' | 'published';
  standings: LeaderboardEntry[];
  publishedAt?: string;
  publishedBy?: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorEmail: string;
  action: string;
  entityType: string;
  entityId: string;
  eventId?: string;
  details: string;
  reason?: string;
  timestamp: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'action';
  read: boolean;
  link?: string;
  createdAt: string;
}
