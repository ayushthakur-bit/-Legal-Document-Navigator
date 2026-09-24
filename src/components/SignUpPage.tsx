import React, { useState, useRef } from "react";
import { motion } from "motion/react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User as UserIcon,
  Phone,
  Camera,
  Scale,
  ArrowRight,
  Loader2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  UserCheck,
  CheckCircle2,
  Trash2,
} from "lucide-react";
import {
  useAuth,
  getFriendlyAuthErrorMessage,
  isOperationNotAllowedError,
  FIREBASE_PROJECT_ID,
  FIREBASE_CONSOLE_AUTH_URL,
} from "../context/AuthContext";
import { AuthPageView } from "../types";

interface SignUpPageProps {
  onNavigate: (view: AuthPageView) => void;
  onSignUpSuccess: () => void;
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

export const SignUpPage: React.FC<SignUpPageProps> = ({ onNavigate, onSignUpSuccess }) => {
  const { register, loginWithGoogle, loginAsDemo } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [rawErrorCode, setRawErrorCode] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Evaluate password strength: returns 0 to 4
  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const passScore = getPasswordStrength(password);
  const strengthLabels = ["Weak", "Fair", "Good", "Strong", "Excellent"];
  const strengthColors = [
    "bg-slate-200 dark:bg-slate-700",
    "bg-rose-500",
    "bg-amber-500",
    "bg-indigo-500",
    "bg-emerald-500",
  ];

  // Photo selection handler with size & type validation
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      setErrorMessage("Please select a valid image file (JPG, PNG, or WebP).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("Profile photo must be smaller than 5MB.");
      return;
    }

    setPhotoFile(file);
    setErrorMessage(null);

    const reader = new FileReader();
    reader.onload = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      setErrorMessage("Please enter your full name.");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setErrorMessage("Please provide a valid email address.");
      return;
    }
    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please re-enter.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setRawErrorCode(null);

    try {
      await register(email, password, fullName, phoneNumber, photoFile);
      onSignUpSuccess();
    } catch (err: any) {
      console.warn("Sign up error:", err);
      const code = err.code || err.message || "";
      setRawErrorCode(code);
      const friendly = getFriendlyAuthErrorMessage(code);
      setErrorMessage(friendly);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setIsGoogleLoading(true);
    setErrorMessage(null);
    setRawErrorCode(null);
    try {
      await loginWithGoogle();
      onSignUpSuccess();
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
    onSignUpSuccess();
  };

  const isOperationNotAllowed = isOperationNotAllowedError(rawErrorCode || errorMessage);

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg w-full glass-panel-elevated p-6 sm:p-8 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800/80 relative"
      >
        {/* Header */}
        <div className="text-center space-y-2 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-slate-900 via-indigo-950 to-indigo-900 text-indigo-400 flex items-center justify-center mx-auto shadow-md border border-white/20 dark:border-white/10">
            <Scale className="w-6 h-6 text-indigo-300" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">
            LEGAL DOCUMENT NAVIGATOR
          </span>
          <h2 className="text-2xl font-bold font-display text-slate-900 dark:text-white tracking-tight">
            Create your account
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Secure cloud storage, AI analysis history, and personalized attorney prep.
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
                onClick={handleGoogleSignUp}
                disabled={isGoogleLoading}
                className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-[11px] flex items-center justify-center gap-1.5 shadow cursor-pointer transition-colors"
              >
                <GoogleIcon className="w-3.5 h-3.5 bg-white rounded-full p-0.5" />
                <span>Continue with Google</span>
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

        {/* Regular Error Alert */}
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

        {/* 1-Click Google Sign-In */}
        <div className="space-y-3 mb-5">
          <button
            type="button"
            onClick={handleGoogleSignUp}
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
                <span>Sign up with Google</span>
              </>
            )}
          </button>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
            <span className="bg-white dark:bg-slate-950 px-3 text-[11px] uppercase tracking-wider text-slate-400 shrink-0">
              or register with email
            </span>
            <div className="border-t border-slate-200 dark:border-slate-800 w-full" />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Profile Photo Upload */}
          <div className="flex flex-col items-center justify-center pb-2">
            <div className="relative group">
              <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-dashed border-indigo-300 dark:border-indigo-700 bg-slate-100 dark:bg-slate-800/80 flex items-center justify-center shadow-inner">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Profile preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center text-slate-400">
                    <Camera className="w-6 h-6 mx-auto mb-1 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                    <span className="text-[9px] font-semibold block">Photo</span>
                  </div>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handlePhotoSelect}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-1.5 rounded-full bg-indigo-600 text-white shadow hover:bg-indigo-700 cursor-pointer"
                title="Upload Photo (optional)"
              >
                <Camera className="w-3 h-3" />
              </button>
            </div>

            <div className="flex items-center gap-2 mt-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                {photoPreview ? "Change Photo" : "Upload Profile Photo (Optional)"}
              </button>
              {photoPreview && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="text-[11px] font-semibold text-rose-500 hover:underline cursor-pointer flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" /> Remove
                </button>
              )}
            </div>
          </div>

          {/* Full Name */}
          <div className="space-y-1.5">
            <label htmlFor="signup-name" className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <span>Full Name</span>
              <span className="text-rose-500" aria-hidden="true">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <UserIcon className="w-4 h-4" aria-hidden="true" />
              </div>
              <input
                id="signup-name"
                name="name"
                type="text"
                autoComplete="name"
                required
                aria-required="true"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Eleanor Vance, Esq."
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 dark:text-white placeholder:text-slate-400 transition-colors"
              />
            </div>
          </div>

          {/* Email Address */}
          <div className="space-y-1.5">
            <label htmlFor="signup-email" className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <span>Email Address</span>
              <span className="text-rose-500" aria-hidden="true">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" aria-hidden="true" />
              </div>
              <input
                id="signup-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                aria-required="true"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@organization.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 dark:text-white placeholder:text-slate-400 transition-colors"
              />
            </div>
          </div>

          {/* Phone Number (Optional) */}
          <div className="space-y-1.5">
            <label htmlFor="signup-phone" className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <span>Phone Number</span>
              <span className="text-slate-400 text-[10px] font-normal">(Optional)</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Phone className="w-4 h-4" aria-hidden="true" />
              </div>
              <input
                id="signup-phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 dark:text-white placeholder:text-slate-400 transition-colors"
              />
            </div>
          </div>

          {/* Password & Confirm Password Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="signup-password" className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <span>Password</span>
                <span className="text-rose-500" aria-hidden="true">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" aria-hidden="true" />
                </div>
                <input
                  id="signup-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  aria-required="true"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full pl-10 pr-9 py-2.5 rounded-2xl text-xs bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 dark:text-white placeholder:text-slate-400 transition-colors"
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label htmlFor="signup-confirm-password" className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <span>Confirm Password</span>
                <span className="text-rose-500" aria-hidden="true">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" aria-hidden="true" />
                </div>
                <input
                  id="signup-confirm-password"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  aria-required="true"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full pl-10 pr-9 py-2.5 rounded-2xl text-xs bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-slate-900 dark:text-white placeholder:text-slate-400 transition-colors"
                />
                <button
                  type="button"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded"
                >
                  {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Password Strength Indicator */}
          {password.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-slate-500 dark:text-slate-400">Password Strength:</span>
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  {strengthLabels[passScore]}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1.5 h-1.5">
                {[0, 1, 2, 3].map((step) => (
                  <div
                    key={step}
                    className={`rounded-full transition-all duration-300 ${
                      passScore > step ? strengthColors[passScore] : "bg-slate-200 dark:bg-slate-800"
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Create Account Button */}
          <button
            type="submit"
            disabled={isLoading || isGoogleLoading}
            className="w-full py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-indigo-500/25 transition-all cursor-pointer mt-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Creating Your Account...</span>
              </>
            ) : (
              <>
                <span>Create Account with Email</span>
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
            <span>Skip registration: <strong>Launch Demo Counselor Session</strong></span>
          </button>
        </div>

        {/* Footer switch to login */}
        <div className="mt-5 pt-4 border-t border-slate-200/60 dark:border-slate-800/80 text-center text-xs text-slate-500 dark:text-slate-400">
          <span>Already have an account? </span>
          <button
            onClick={() => onNavigate("login")}
            className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
          >
            Log in
          </button>
        </div>
      </motion.div>
    </div>
  );
};

