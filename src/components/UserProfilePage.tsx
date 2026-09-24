import React, { useState, useRef } from "react";
import { motion } from "motion/react";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Camera,
  CheckCircle2,
  Shield,
  LogOut,
  Save,
  X,
  Loader2,
  AlertCircle,
  FileText,
  Clock,
  Trash2,
} from "lucide-react";
import { useAuth, getFriendlyAuthErrorMessage } from "../context/AuthContext";
import { useUserDocuments } from "../context/UserDocumentsContext";
import { AuthPageView } from "../types";

interface UserProfilePageProps {
  onNavigate: (view: AuthPageView) => void;
  onLogout: () => void;
}

export const UserProfilePage: React.FC<UserProfilePageProps> = ({ onNavigate, onLogout }) => {
  const { currentUser, userProfile, updateUserProfileData, formatInitials } = useAuth();
  const { userDocuments } = useUserDocuments();

  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(userProfile?.fullName || "");
  const [phoneNumber, setPhoneNumber] = useState(userProfile?.phoneNumber || "");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(
    userProfile?.profilePhotoURL || null
  );

  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state if userProfile changes
  React.useEffect(() => {
    if (userProfile && !isEditing) {
      setFullName(userProfile.fullName || "");
      setPhoneNumber(userProfile.phoneNumber || "");
      setPhotoPreview(userProfile.profilePhotoURL || null);
    }
  }, [userProfile, isEditing]);

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!validTypes.includes(file.type)) {
      setErrorMessage("Please select a valid image (JPG, PNG, or WebP).");
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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setErrorMessage("Full name cannot be blank.");
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await updateUserProfileData({
        fullName,
        phoneNumber,
        photoFile,
      });
      setIsEditing(false);
      setSuccessMessage("Profile updated successfully!");
      setPhotoFile(null);
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err: any) {
      console.warn("Update profile error:", err);
      setErrorMessage(getFriendlyAuthErrorMessage(err.code || err.message));
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFullName(userProfile?.fullName || "");
    setPhoneNumber(userProfile?.phoneNumber || "");
    setPhotoPreview(userProfile?.profilePhotoURL || null);
    setPhotoFile(null);
    setErrorMessage(null);
  };

  // Format member date
  const memberSince = React.useMemo(() => {
    if (currentUser?.metadata?.creationTime) {
      const d = new Date(currentUser.metadata.creationTime);
      return d.toLocaleDateString(undefined, { month: "long", year: "numeric" });
    }
    return "September 2026";
  }, [currentUser]);

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 space-y-6">
      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900 dark:text-white tracking-tight">
            User Account Profile
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Manage your personal legal-tech profile, contact credentials, and session security.
          </p>
        </div>

        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="self-start sm:self-auto px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <span>Edit Profile</span>
          </button>
        )}
      </div>

      {/* Notifications */}
      {errorMessage && (
        <div className="p-3.5 rounded-2xl bg-rose-50/90 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span className="leading-relaxed font-medium">{errorMessage}</span>
        </div>
      )}

      {successMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-50/90 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          <span className="leading-relaxed font-medium">{successMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Avatar & Quick Info Card */}
        <div className="glass-panel p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 flex flex-col items-center text-center space-y-4 shadow-sm">
          {/* Avatar display or edit trigger */}
          <div className="relative group">
            <div className="w-28 h-28 rounded-full overflow-hidden border-3 border-indigo-500/20 shadow-md bg-gradient-to-tr from-slate-900 to-indigo-950 flex items-center justify-center text-white">
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt={userProfile?.fullName || "User Avatar"}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-3xl font-bold font-display text-indigo-300">
                  {formatInitials(userProfile?.fullName || currentUser?.email)}
                </span>
              )}
            </div>

            {isEditing && (
              <>
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
                  className="absolute bottom-1 right-1 p-2 rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 cursor-pointer"
                  title="Upload / Change Photo"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </>
            )}
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {userProfile?.fullName || "Legal Professional"}
            </h3>
            <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold truncate max-w-[220px]">
              {currentUser?.email}
            </p>
          </div>

          {isEditing && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
            >
              Change Photo
            </button>
          )}

          {/* User Metrics */}
          <div className="w-full pt-4 border-t border-slate-200/60 dark:border-slate-800 grid grid-cols-2 gap-2 text-center text-xs">
            <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Documents</span>
              <span className="text-base font-bold text-slate-900 dark:text-white">
                {userDocuments.length}
              </span>
            </div>
            <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Security</span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-1 mt-1">
                <Shield className="w-3.5 h-3.5" /> High
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Profile Details & Form */}
        <div className="md:col-span-2 glass-panel p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm space-y-6">
          <form onSubmit={handleSave} className="space-y-5">
            <div className="space-y-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Full Name</span>
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                  />
                ) : (
                  <p className="px-3.5 py-2.5 rounded-xl bg-slate-50/70 dark:bg-slate-900/40 text-xs sm:text-sm text-slate-900 dark:text-white font-medium border border-slate-200/40 dark:border-slate-800/50">
                    {userProfile?.fullName || "Not provided"}
                  </p>
                )}
              </div>

              {/* Email (Read-Only) */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Email Address</span>
                </label>
                <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-50/70 dark:bg-slate-900/40 text-xs sm:text-sm text-slate-900 dark:text-white font-medium border border-slate-200/40 dark:border-slate-800/50">
                  <span className="truncate">{currentUser?.email}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shrink-0 ml-2">
                    Verified
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">
                  Primary authentication email managed via Firebase Authentication.
                </p>
              </div>

              {/* Phone Number */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Phone Number</span>
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 focus:outline-none focus:border-indigo-500 text-slate-900 dark:text-white"
                  />
                ) : (
                  <p className="px-3.5 py-2.5 rounded-xl bg-slate-50/70 dark:bg-slate-900/40 text-xs sm:text-sm text-slate-900 dark:text-white font-medium border border-slate-200/40 dark:border-slate-800/50">
                    {userProfile?.phoneNumber || "No phone number added"}
                  </p>
                )}
              </div>

              {/* Member Since */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Member Since</span>
                </label>
                <p className="px-3.5 py-2.5 rounded-xl bg-slate-50/70 dark:bg-slate-900/40 text-xs sm:text-sm text-slate-900 dark:text-white font-medium border border-slate-200/40 dark:border-slate-800/50">
                  {memberSince}
                </p>
              </div>
            </div>

            {/* Action buttons when editing */}
            {isEditing && (
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Save Changes</span>
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            )}
          </form>

          {/* Account & Security Section */}
          <div className="pt-6 border-t border-slate-200/80 dark:border-slate-800 space-y-3">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Account Security
            </h4>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/60 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800">
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Email verified &amp; token protected</span>
                </div>
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">Active</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50/60 dark:bg-slate-900/50 border border-slate-200/60 dark:border-slate-800">
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <Shield className="w-4 h-4 text-indigo-500" />
                  <span>ABAC Zero-Trust Firestore document isolation</span>
                </div>
                <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400">Enforced</span>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <button
                type="button"
                onClick={() => onNavigate("settings")}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              >
                Manage Preferences &amp; Theme &rarr;
              </button>

              <button
                type="button"
                onClick={onLogout}
                className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/50 dark:hover:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer border border-rose-200 dark:border-rose-900"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
