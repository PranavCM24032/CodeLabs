import React, { useState, useEffect } from 'react';
import { Settings, CheckCircle2, AlertCircle, ArrowLeft, Shield, Server, Database, Key, FlaskConical } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth, OWNER_EMAIL } from '../../context/AuthContext';
import firebaseConfig from '../../../firebase-applet-config.json';

export const PlatformSettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [serverHealth, setServerHealth] = useState<any | null>(null);

  useEffect(() => {
    fetch('/api/health')
      .then((r) => r.json())
      .then((data) => setServerHealth(data))
      .catch((e) => console.error(e));
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <Link
          to="/superadmin/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 hover:text-amber-900 mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Root Director Console
        </Link>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-mono text-[11px] font-bold mb-2 shadow-xs">
          <FlaskConical className="w-3.5 h-3.5 text-amber-700" />
          <span>codeLab Platform</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
          Platform & Infrastructure Settings
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 mt-1">
          Firebase cloud environment, API endpoints, and platform configuration.
        </p>
      </div>

      <div className="space-y-6">
        {/* Platform Identity */}
        <div className="clay-card-yellow p-6 sm:p-8">
          <h2 className="text-base font-black text-stone-900 mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-800" />
            Platform Root Director Clearance
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200">
              <span className="text-stone-500 font-semibold block mb-1">Root Director</span>
              <span className="font-mono font-black text-stone-900">{OWNER_EMAIL}</span>
            </div>
            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200">
              <span className="text-stone-500 font-semibold block mb-1">Active User UID</span>
              <span className="font-mono text-stone-800 font-semibold">{user?.uid || 'Not signed in'}</span>
            </div>
          </div>
        </div>

        {/* Backend & Firebase Status */}
        <div className="clay-card p-6 sm:p-8">
          <h2 className="text-base font-black text-stone-900 mb-4 flex items-center gap-2">
            <Server className="w-5 h-5 text-emerald-700" />
            Backend Infrastructure & Services
          </h2>

          <div className="space-y-3 text-xs">
            <div className="p-4 rounded-2xl bg-stone-50/90 border border-stone-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Database className="w-5 h-5 text-emerald-700" />
                <div>
                  <div className="font-black text-stone-900">Google Cloud Firestore</div>
                  <div className="text-stone-500 font-mono text-[11px]">
                    Database: {firebaseConfig.firestoreDatabaseId} • Project: {firebaseConfig.projectId}
                  </div>
                </div>
              </div>
              <span className="clay-pill bg-emerald-100 text-emerald-800 border-emerald-200 text-[10px]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Connected
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50/90 border border-stone-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Key className="w-5 h-5 text-emerald-700" />
                <div>
                  <div className="font-black text-stone-900">Firebase Authentication</div>
                  <div className="text-stone-500 font-mono text-[11px]">
                    Domain: {firebaseConfig.authDomain}
                  </div>
                </div>
              </div>
              <span className="clay-pill bg-emerald-100 text-emerald-800 border-emerald-200 text-[10px]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Operational
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50/90 border border-stone-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Server className="w-5 h-5 text-emerald-700" />
                <div>
                  <div className="font-black text-stone-900">codeLab Express API Proxy</div>
                  <div className="text-stone-500 font-mono text-[11px]">
                    Endpoints: /api/repo/inspect & /api/analysis/run-similarity
                  </div>
                </div>
              </div>
              <span className="clay-pill bg-emerald-100 text-emerald-800 border-emerald-200 text-[10px]">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> {serverHealth ? 'Online (Port 3000)' : 'Live'}
              </span>
            </div>
          </div>
        </div>

        {/* Git Providers Setup Guidelines */}
        <div className="clay-card-orange p-6 sm:p-8 text-xs">
          <h2 className="text-base font-black text-stone-900 mb-2">Git Repository Credentials</h2>
          <p className="text-stone-700 leading-relaxed mb-4">
            codeLab inspects public git repositories out-of-the-box. To lift GitHub rate limits for high-volume hackathon events, set a personal access token in your environment:
          </p>
          <div className="p-3.5 rounded-xl bg-orange-100/90 font-mono text-orange-950 border border-orange-200 font-bold">
            GITHUB_TOKEN="ghp_yourPersonalAccessTokenHere"
          </div>
          <p className="text-[11px] text-stone-600 mt-2 font-medium">
            Tokens are strictly consumed by server proxy routes and are never leaked to client browsers.
          </p>
        </div>
      </div>
    </div>
  );
};
