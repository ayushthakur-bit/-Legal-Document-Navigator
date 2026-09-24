import React from "react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { Sun, Moon, Shield, Bell, Key, LogOut } from "lucide-react";
import { AuthPageView } from "../types";

interface SettingsViewProps {
  onNavigate: (view: AuthPageView) => void;
  onLogout: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onNavigate, onLogout }) => {
  const { isDark, toggleTheme } = useTheme();
  const { currentUser, userProfile } = useAuth();

  return (
    <div className="max-w-3xl mx-auto py-6 px-4 sm:px-6 space-y-6">
      <div className="pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900 dark:text-white tracking-tight">
          Application Settings
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Manage workspace display preferences and security safeguards.
        </p>
      </div>

      <div className="glass-panel p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 space-y-6">
        {/* Appearance Section */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Appearance
          </h3>
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
            <div className="space-y-0.5">
              <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                {isDark ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-500" />}
                <span>Interface Theme</span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Switch between high-contrast light and dark workspace themes.
              </p>
            </div>
            <button
              onClick={toggleTheme}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs cursor-pointer"
            >
              Toggle {isDark ? "Light" : "Dark"}
            </button>
          </div>
        </div>

        {/* Security & Access */}
        <div className="space-y-3 pt-2 border-t border-slate-200/60 dark:border-slate-800">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Security &amp; Data Safeguards
          </h3>

          <div className="space-y-2 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-indigo-500" />
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">Firestore Security Isolation</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">Documents restricted by request.auth.uid</div>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                Active
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Key className="w-5 h-5 text-indigo-500" />
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">Account Password</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">Managed through Firebase Authentication</div>
                </div>
              </div>
              <button
                onClick={() => onNavigate("forgot-password")}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                Reset Password
              </button>
            </div>
          </div>
        </div>

        {/* Account controls */}
        {currentUser && (
          <div className="pt-4 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Signed in as <span className="font-bold text-slate-800 dark:text-slate-200">{currentUser.email}</span>
            </span>

            <button
              onClick={onLogout}
              className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer border border-rose-200 dark:border-rose-900"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
