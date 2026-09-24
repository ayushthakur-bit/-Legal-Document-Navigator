import React, { useState } from "react";
import { motion } from "motion/react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Scale,
  ArrowRight,
  Loader2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  UserCheck,
  CheckCircle2,
} from "lucide-react";
import {
  useAuth,
  getFriendlyAuthErrorMessage,
  isOperationNotAllowedError,
  FIREBASE_PROJECT_ID,
  FIREBASE_CONSOLE_AUTH_URL,
} from "../context/AuthContext";
import { AuthPageView } from "../types";

interface LoginPageProps {
  onNavigate: (view: AuthPageView) => void;
  onLoginSuccess: () => void;
}

const GoogleIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate, onLoginSuccess }) => {
  const { login, loginWithGoogle, loginAsDemo } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [rawErrorCode, setRawErrorCode] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMessage("Please enter both your email address and password.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setRawErrorCode(null);

    try {
      await login(email, password);
      onLoginSuccess();
    } catch (err: any) {
      console.warn("Login failed:", err);
      const code = err.code || err.message || "";
      setRawErrorCode(code);
      const friendly = getFriendlyAuthErrorMessage(code);
      setErrorMessage(friendly);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setErrorMessage(null);
    setRawErrorCode(null);
    try {
      await loginWithGoogle();
      onLoginSuccess();
    } catch (err: any) {
      console.warn("Google Sign-In failed:", err);
      const code = err.code || err.message || "";
      setRawErrorCode(code);
      setErrorMessage(getFriendlyAuthErrorMessage(code));
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleQuickDemo = () => {
    loginAsDemo("Eleanor Vance, Esq.", "counselor.vance@legalnavigator.app");
    onLoginSuccess();
  };

  const isOperationNotAllowed = isOperationNotAllowedError(rawErrorCode || errorMessage);

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full glass-panel-elevated p-6 sm:p-8 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800/80 relative"
      >
        {/* Header & Logo */}
        <div className="text-center space-y-2 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-slate-900 via-indigo-950 to-indigo-900 text-indigo-400 flex items-center justify-center mx-auto shadow-md border border-white/20 dark:border-white/10">
            <Scale className="w-6 h-6 text-indigo-300" />
          </div>
          <h2 className="text-2xl font-bold font-display text-slate-900 dark:text-white tracking-tight">
            Welcome Back
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Sign in to Legal Document Navigator to access your workspace and documents.
          </p>
        </div>

        {/* Operation Not Allowed Diagnostic Resolution Box */}
        {isOperationNotAllowed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-slate-800 dark:text-slate-200 text-xs space-y-2.5"
          >
            <div className="flex items-center gap-2 font-bold text-amber-700 dark:text-amber-400 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Fix `auth/operation-not-allowed`</span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-600 dark:text-slate-300">
              Firebase requires the <strong>Email/Password</strong> sign-in provider to be enabled once in your project console:
            </p>
            <ol className="list-decimal pl-4 space-y-1 text-[11px] text-slate-700 dark:text-slate-300 font-medium">
              <li>
                Open the{" "}
                <a
                  href={FIREBASE_CONSOLE_AUTH_URL}
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-600 dark:text-indigo-400 underline font-bold inline-flex items-center gap-0.5"
                >
                  Firebase Authentication Console <ExternalLink className="w-3 h-3 inline" />
                </a>
              </li>
              <li>Click <strong>Email/Password</strong> under Sign-in providers</li>
              <li>Toggle <strong>Enable</strong> to ON and click <strong>Save</strong></li>
            </ol>
            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading}
                className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-[11px] flex items-center justify-center gap-1.5 shadow cursor-pointer transition-colors"
              >
                <GoogleIcon className="w-3.5 h-3.5 bg-white rounded-full p-0.5" />
                <span>Use Google Sign-In</span>
              </button>
              <button
                type="button"
                onClick={handleQuickDemo}
                className="flex-1 py-2 px-3 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-[11px] flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <UserCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Instant Demo Login</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* Regular Error Alert (when not operation-not-allowed) */}
        {errorMessage && !isOperationNotAllowed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mb-5 p-3.5 rounded-2xl bg-rose-50/90 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed font-medium">{errorMessage}</span>
          </motion.div>
        )}

        {/* 1-Click Google Sign-In (Pre-configured in Firebase) */}
        <div className="space-y-3 mb-5">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading || isLoading}
            className="w-full py-2.5 px-4 rounded-2xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs sm:text-sm flex items-center justify-center gap-2.5 shadow-sm hover:shadow transition-all cursor-pointer disabled:opacity-60"
          >
            {isGoogleLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                <span>Connecting to Google...</span>
              </>
            ) : (
              <>
                <GoogleIcon className="w-4 h-4" />
                <span>Continue with Google</span>
              </>
            )}
          </button>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
            <span className="bg-white dark:bg-slate-950 px-3 text-[11px] uppercase tracking-wider text-slate-400 shrink-0">
              or sign in with email
            </span>
            <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div className="space-y-1.5">
            <label htmlFor="login-email" className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <span>Email Address</span>
              <span className="text-rose-500" aria-hidden="true">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" aria-hidden="true" />
              </div>
              <input
                id="login-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                aria-required="true"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@lawfirm.com or client@company.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 dark:text-white placeholder:text-slate-400 transition-colors"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="login-password" className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <span>Password</span>
                <span className="text-rose-500" aria-hidden="true">*</span>
              </label>
              <button
                type="button"
                onClick={() => onNavigate("forgot-password")}
                className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-sm"
              >
                Forgot password?
              </button>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" aria-hidden="true" />
              </div>
              <input
                id="login-password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                aria-required="true"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full pl-10 pr-10 py-2.5 rounded-2xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 dark:text-white placeholder:text-slate-400 transition-colors"
              />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center justify-between pt-1">
            <label htmlFor="login-remember-me" className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-600 dark:text-slate-400">
              <input
                id="login-remember-me"
                name="rememberMe"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
              <span>Remember this session</span>
            </label>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={isLoading || isGoogleLoading}
            className="w-full py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-indigo-500/25 transition-all cursor-pointer mt-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Signing In...</span>
              </>
            ) : (
              <>
                <span>Sign In with Email</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Access Button */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 text-center">
          <button
            type="button"
            onClick={handleQuickDemo}
            className="text-[11px] font-semibold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center justify-center gap-1.5 mx-auto cursor-pointer transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Instant Access: <strong>Launch Demo Counselor Session</strong></span>
          </button>
        </div>

        {/* Footer switch to sign up */}
        <div className="mt-5 pt-4 border-t border-slate-200/60 dark:border-slate-800/80 text-center text-xs text-slate-500 dark:text-slate-400">
          <span>Don't have an account yet? </span>
          <button
            onClick={() => onNavigate("signup")}
            className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
          >
            Create an account
          </button>
        </div>
      </motion.div>
    </div>
  );
};

