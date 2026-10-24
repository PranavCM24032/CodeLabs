import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AccessDeniedPage: React.FC = () => {
  const { role } = useAuth();

  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="clay-card-yellow p-8 max-w-md w-full flex flex-col items-center">
        <div className="w-14 h-14 rounded-2xl bg-amber-200/80 border border-amber-300 flex items-center justify-center text-amber-800 mb-4 shadow-sm">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-black text-stone-900 tracking-tight">Reagent Clearance Required</h1>
        <p className="mt-2 text-xs sm:text-sm text-stone-600 leading-relaxed">
          Your current lab role (<span className="font-mono text-amber-800 font-bold uppercase">{role}</span>) does not have authorization to view this specimen or trigger this catalytic operation.
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 w-full">
          <Link
            to="/app/dashboard"
            className="clay-btn-primary flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold"
          >
            <Home className="w-4 h-4" />
            Lab Workbench
          </Link>
          <Link
            to="/"
            className="clay-btn-yellow flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export const AccountSuspendedPage: React.FC = () => {
  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="clay-card-orange p-8 max-w-md w-full flex flex-col items-center">
        <div className="w-14 h-14 rounded-2xl bg-orange-200/80 border border-orange-300 flex items-center justify-center text-orange-800 mb-4 shadow-sm">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h1 className="text-2xl font-black text-stone-900 tracking-tight">Specimen Clearance Suspended</h1>
        <p className="mt-2 text-xs sm:text-sm text-stone-600 leading-relaxed">
          This account has been administratively sealed. Contact the codeLab Director at <span className="font-mono text-orange-900 font-bold">pranavpaunikar.ml24@sbjit.edu.in</span> for clearance review.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="clay-btn-orange px-5 py-2.5 rounded-2xl text-xs font-bold inline-block"
          >
            Return Home
          </Link>
        </div>
      </div>
    </div>
  );
};
