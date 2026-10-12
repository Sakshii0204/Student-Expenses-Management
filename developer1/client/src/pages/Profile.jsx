import React from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Shield, Key, School, Calendar, CheckCircle, LogOut } from 'lucide-react';

export function Profile() {
  const { user, token, logout } = useAuth();

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Student Profile & Security</h1>
        <p className="text-sm text-slate-500 mt-1">
          Authenticated session details and access credentials
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left card: User Info */}
        <div className="md:col-span-1 bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full bg-slate-900 text-emerald-400 flex items-center justify-center text-2xl font-bold shadow-inner">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'S'}
          </div>
          <h2 className="mt-4 text-lg font-semibold text-slate-900">{user?.name}</h2>
          <p className="text-xs text-slate-500 font-mono mt-0.5">{user?.email}</p>
          <span className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle className="w-3.5 h-3.5" />
            Active Session
          </span>

          <button
            onClick={logout}
            className="mt-6 w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            End Session
          </button>
        </div>

        {/* Right cards: Verification & Security Metadata */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <School className="w-4 h-4 text-emerald-600" />
              Academic & Identity Metadata
            </h3>

            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <dt className="text-xs text-slate-500">Student ID / Internal Reference</dt>
                <dd className="text-sm font-mono font-medium text-slate-800 mt-0.5 truncate">
                  {user?.id || '—'}
                </dd>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <dt className="text-xs text-slate-500">College / Institution</dt>
                <dd className="text-sm font-medium text-slate-800 mt-0.5">
                  {user?.college || 'Not specified'}
                </dd>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <dt className="text-xs text-slate-500">Configured Currency</dt>
                <dd className="text-sm font-medium text-slate-800 mt-0.5">
                  {user?.currency || 'USD'}
                </dd>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                <dt className="text-xs text-slate-500">Access Role</dt>
                <dd className="text-sm font-medium text-slate-800 mt-0.5 capitalize">
                  {user?.role || 'student'}
                </dd>
              </div>
            </dl>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Key className="w-4 h-4 text-emerald-600" />
              JWT Security Bearer Token Status
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              This token is automatically injected in the Authorization header for Developer 2 (Expenses) and Developer 3 (Analytics).
            </p>
            <div className="p-3 bg-slate-900 rounded-lg text-emerald-400 font-mono text-xs break-all max-h-24 overflow-y-auto border border-slate-800">
              {token || 'No active bearer token'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
