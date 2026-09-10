import React, { useState } from 'react';
import { BookOpen, Download, ShieldCheck, ShieldAlert, Smartphone, GraduationCap, Cloud } from 'lucide-react';
import { Student, ActiveTab } from '../types';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { CloudSyncStatus } from '../utils/firebaseSync';

interface NavbarProps {
  currentStudent: Student | null;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  isAdmin: boolean;
  cloudStatus?: CloudSyncStatus;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentStudent,
  activeTab,
  setActiveTab,
  isAdmin,
  cloudStatus,
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs">
      <div className="max-w-md mx-auto px-3.5 py-2 flex items-center justify-between">
        {/* Logo & School Name */}
        <button
          onClick={() => setActiveTab('home')}
          className="flex items-center gap-2.5 text-left group min-w-0"
        >
          <div className="w-9 h-9 rounded-xl overflow-hidden bg-white border border-slate-200/80 shadow-xs flex items-center justify-center shrink-0 group-hover:scale-105 transition">
            <img
              src="/school-logo.png"
              alt="KBSSN Logo"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-black text-sm text-slate-900 tracking-tight">KBSSN</span>
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-200">
                PWA
              </span>
            </div>
            <p className="text-[9.5px] font-bold text-slate-500 uppercase tracking-tight truncate leading-tight">
              KARTIK BIDYANTA SMRITI SISHU NIKETAN
            </p>
          </div>
        </button>

        {/* Right controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Cloud Database Sync Status */}
          <div
            className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10.5px] font-bold border transition ${
              cloudStatus?.isConnected
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-slate-50 text-slate-500 border-slate-200'
            }`}
            title={
              cloudStatus?.isConnected
                ? `Firebase Connected (Database: ai-studio-kbssn)`
                : 'Connecting to Firebase...'
            }
          >
            <Cloud
              className={`w-3.5 h-3.5 ${
                cloudStatus?.isSyncing
                  ? 'animate-pulse text-blue-600'
                  : cloudStatus?.isConnected
                  ? 'text-emerald-600'
                  : 'text-slate-400'
              }`}
            />
            <span>
              {cloudStatus?.isSyncing ? 'Syncing...' : cloudStatus?.isConnected ? 'Cloud' : 'Offline'}
            </span>
          </div>

          {/* PWA In-App Install Button */}
          {isInstallable && !isInstalled && (
            <button
              onClick={install}
              className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition"
              title="Install KBSSN to Phone"
            >
              <Download className="w-3 h-3" />
              <span>Install</span>
            </button>
          )}

          {isIOS && !isInstalled && (
            <button
              onClick={() => setShowIOSModal(true)}
              className="flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
            >
              <Smartphone className="w-3 h-3 text-slate-500" />
              <span>Install</span>
            </button>
          )}

          {/* Admin Switch Button */}
          {isAdmin ? (
            <button
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-1 px-2 py-1 text-[11px] font-bold rounded-lg border transition ${
                activeTab === 'admin'
                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                  : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
              <span>Admin</span>
            </button>
          ) : (
            <button
              onClick={() => setActiveTab('admin')}
              className="flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200/70 transition"
              title="Switch to Admin Portal"
            >
              <ShieldAlert className="w-3 h-3 text-slate-500" />
              <span>Admin</span>
            </button>
          )}
        </div>
      </div>

      {/* iOS Safari Guide Modal */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="w-full max-w-xs bg-white rounded-2xl p-5 shadow-xl">
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
              <Download className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">Install KBSSN</h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              1. Tap the <strong className="text-slate-800">Share</strong> icon in the Safari toolbar.<br />
              2. Scroll down and tap <strong className="text-slate-800">Add to Home Screen</strong>.
            </p>
            <button
              onClick={() => setShowIOSModal(false)}
              className="mt-4 w-full py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800 transition"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
