import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, School, ShieldCheck, DollarSign, LogOut, Lock, Key } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function SettingsPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Account Settings & Security
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Student profile, institutional affiliation, and active authentication session status
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="md:col-span-1 bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full bg-slate-900 text-emerald-400 flex items-center justify-center text-2xl font-bold shadow-inner">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'S'}
          </div>
          <h2 className="mt-4 text-base font-bold text-slate-900">{user?.name}</h2>
          <p className="text-xs text-slate-500 font-mono mt-0.5">{user?.email}</p>

          <span className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <ShieldCheck className="w-3.5 h-3.5" />
            Verified Student
          </span>

          <button
            onClick={handleLogout}
            className="mt-6 w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            End Session
          </button>
        </div>

        {/* Metadata and Security Settings */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <School className="w-4 h-4 text-emerald-600" />
              Institutional & Identity Details
            </h3>

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <dt className="text-xs text-slate-500">Student Internal ID</dt>
                <dd className="text-sm font-mono font-medium text-slate-900 mt-0.5 truncate">
                  {user?.id || '—'}
                </dd>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <dt className="text-xs text-slate-500">University / College</dt>
                <dd className="text-sm font-medium text-slate-900 mt-0.5">
                  {user?.college || 'Standard Student Institution'}
                </dd>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <dt className="text-xs text-slate-500">Active Currency</dt>
                <dd className="text-sm font-medium text-slate-900 mt-0.5">
                  {user?.currency || 'USD ($)'}
                </dd>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <dt className="text-xs text-slate-500">Role / Clearance</dt>
                <dd className="text-sm font-medium text-slate-900 mt-0.5 capitalize">
                  {user?.role || 'student'}
                </dd>
              </div>
            </dl>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-xs font-semibold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-600" />
              Authentication & Session Security
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Your session is cryptographically authenticated using industry-standard JSON Web Tokens with salted bcrypt credentials.
            </p>

            <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-emerald-800 font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Encrypted Bearer Session Active</span>
              </div>
              <span className="font-mono text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-200">
                HTTP Authorization Protected
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
