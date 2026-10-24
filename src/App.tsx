import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/common/Navbar';
import { ProtectedRoute } from './components/common/ProtectedRoute';

// Public Pages
import { LandingPage } from './pages/public/LandingPage';
import { EventsDirectory } from './pages/public/EventsDirectory';
import { PublicLeaderboardPage } from './pages/public/PublicLeaderboard';
import { LoginPage } from './pages/public/LoginPage';
import { RegisterPage } from './pages/public/RegisterPage';
import { AccessDeniedPage, AccountSuspendedPage } from './pages/public/AccessDenied';

// Participant Pages
import { ParticipantDashboard } from './pages/participant/ParticipantDashboard';
import { TeamsPage } from './pages/participant/TeamsPage';
import { ProblemsPage } from './pages/participant/ProblemsPage';
import { SubmissionPage } from './pages/participant/SubmissionPage';
import { ParticipantResultsPage } from './pages/participant/ParticipantResults';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { JudgingQueuePage } from './pages/admin/JudgingQueue';
import { EvaluationFormPage } from './pages/admin/EvaluationForm';
import { AdminReportsPage } from './pages/admin/AdminReports';

// Superadmin Pages
import { SuperadminDashboard } from './pages/superadmin/SuperadminDashboard';
import { UsersManagementPage } from './pages/superadmin/UsersManagement';
import { EventWizardPage } from './pages/superadmin/EventWizard';
import { ProblemManagerPage } from './pages/superadmin/ProblemManager';
import { SchemaBuilderPage } from './pages/superadmin/SchemaBuilder';
import { ScoringAndLeaderboardPage } from './pages/superadmin/ScoringAndLeaderboard';
import { AuditLogsViewPage } from './pages/superadmin/AuditLogsView';
import { PlatformSettingsPage } from './pages/superadmin/PlatformSettings';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <div className="min-h-screen text-stone-900 flex flex-col selection:bg-emerald-600 selection:text-white">
          <Navbar />
          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/events" element={<EventsDirectory />} />
              <Route path="/events/:eventId" element={<EventsDirectory />} />
              <Route path="/leaderboard" element={<PublicLeaderboardPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/access-denied" element={<AccessDeniedPage />} />
              <Route path="/account-suspended" element={<AccountSuspendedPage />} />

              {/* Participant Routes */}
              <Route
                path="/app/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['participant', 'admin', 'superadmin']}>
                    <ParticipantDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/app/teams"
                element={
                  <ProtectedRoute allowedRoles={['participant', 'admin', 'superadmin']}>
                    <TeamsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/app/problems"
                element={
                  <ProtectedRoute allowedRoles={['participant', 'admin', 'superadmin']}>
                    <ProblemsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/app/submissions"
                element={
                  <ProtectedRoute allowedRoles={['participant', 'admin', 'superadmin']}>
                    <SubmissionPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/app/results"
                element={
                  <ProtectedRoute allowedRoles={['participant', 'admin', 'superadmin']}>
                    <ParticipantResultsPage />
                  </ProtectedRoute>
                }
              />

              {/* Admin / Judge Routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/judging"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
                    <JudgingQueuePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/evaluations/:teamId"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
                    <EvaluationFormPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/analysis/:submissionId"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
                    <RepoForensicsView />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/reports"
                element={
                  <ProtectedRoute allowedRoles={['admin', 'superadmin']}>
                    <AdminReportsPage />
                  </ProtectedRoute>
                }
              />

              {/* Superadmin Routes */}
              <Route
                path="/superadmin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['superadmin']}>
                    <SuperadminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/superadmin/users"
                element={
                  <ProtectedRoute allowedRoles={['superadmin']}>
                    <UsersManagementPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/superadmin/events/create"
                element={
                  <ProtectedRoute allowedRoles={['superadmin']}>
                    <EventWizardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/superadmin/problems"
                element={
                  <ProtectedRoute allowedRoles={['superadmin']}>
                    <ProblemManagerPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/superadmin/schemas"
                element={
                  <ProtectedRoute allowedRoles={['superadmin']}>
                    <SchemaBuilderPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/superadmin/scoring"
                element={
                  <ProtectedRoute allowedRoles={['superadmin']}>
                    <ScoringAndLeaderboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/superadmin/audit-logs"
                element={
                  <ProtectedRoute allowedRoles={['superadmin']}>
                    <AuditLogsViewPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/superadmin/settings"
                element={
                  <ProtectedRoute allowedRoles={['superadmin']}>
                    <PlatformSettingsPage />
                  </ProtectedRoute>
                }
              />

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}
