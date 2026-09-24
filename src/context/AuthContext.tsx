import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  getDocFromServer,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, db, storage } from "../lib/firebase";
import { UserProfile } from "../types";

export const FIREBASE_PROJECT_ID = "deductive-signal-hdzmz";
export const FIREBASE_CONSOLE_AUTH_URL = `https://console.firebase.google.com/project/${FIREBASE_PROJECT_ID}/authentication/providers`;

interface AuthContextType {
  currentUser: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginAsDemo: (fullName?: string, email?: string) => void;
  register: (
    email: string,
    pass: string,
    fullName: string,
    phoneNumber?: string,
    photoFile?: File | null
  ) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfileData: (updates: {
    fullName?: string;
    phoneNumber?: string;
    photoFile?: File | null;
  }) => Promise<void>;
  formatInitials: (name?: string) => string;
  refreshUserProfile: () => Promise<void>;
  isFirebaseAvailable: boolean;
  isDemoUser: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper to detect if an error is operation-not-allowed
export function isOperationNotAllowedError(errorCodeOrMessage?: string | null): boolean {
  if (!errorCodeOrMessage) return false;
  const str = errorCodeOrMessage.toLowerCase();
  return str.includes("auth/operation-not-allowed") || str.includes("operation-not-allowed");
}

// Standalone helper to format initials safely
export function formatUserInitials(name?: string): string {
  if (!name || !name.trim()) return "LD";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "LD";
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Helper to convert Firebase Auth error codes to user-friendly messages
export function getFriendlyAuthErrorMessage(errorCodeOrMessage: string): string {
  const code = (errorCodeOrMessage || "").toLowerCase();

  if (isOperationNotAllowedError(code)) {
    return "Email/Password sign-in is not enabled yet in your Firebase Project Console. Use 'Continue with Google' right now, or enable Email/Password under Authentication > Sign-in method in Firebase Console.";
  }
  if (code.includes("auth/invalid-credential") || code.includes("auth/wrong-password")) {
    return "Email or password is incorrect. Please double check and try again.";
  }
  if (code.includes("auth/user-not-found")) {
    return "No account exists with this email address. Please sign up first.";
  }
  if (code.includes("auth/email-already-in-use")) {
    return "An account with this email address already exists. Please log in.";
  }
  if (code.includes("auth/weak-password")) {
    return "Password is too weak. Please use at least 6 characters including letters and numbers.";
  }
  if (code.includes("auth/invalid-email")) {
    return "Please provide a valid email address.";
  }
  if (code.includes("auth/popup-closed-by-user")) {
    return "Google Sign-In popup was closed before completing. Please try again.";
  }
  if (code.includes("auth/cancelled-popup-request")) {
    return "Google Sign-In popup request was cancelled.";
  }
  if (code.includes("auth/too-many-requests")) {
    return "Too many unsuccessful attempts. Access is temporarily paused for security. Try again in a few minutes.";
  }
  if (code.includes("auth/network-request-failed")) {
    return "Network connection issue. Please check your internet connection.";
  }
  if (code.includes("storage/unauthorized") || code.includes("permission-denied")) {
    return "Access denied. You do not have permission to perform this action.";
  }
  if (code.includes("storage/canceled")) {
    return "Profile photo upload was cancelled.";
  }

  return errorCodeOrMessage.replace(/^Firebase:\s*/, "") || "An unexpected error occurred. Please try again.";
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFirebaseAvailable, setIsFirebaseAvailable] = useState(true);
  const [isDemoUser, setIsDemoUser] = useState(false);

  // Check for saved demo session in local storage
  const loadSavedDemoSession = useCallback(() => {
    try {
      const saved = localStorage.getItem("legal_navigator_demo_session");
      if (saved) {
        const parsedProfile: UserProfile = JSON.parse(saved);
        const mockUser = {
          uid: parsedProfile.uid,
          email: parsedProfile.email,
          displayName: parsedProfile.fullName,
          photoURL: parsedProfile.profilePhotoURL,
        } as unknown as User;

        setCurrentUser(mockUser);
        setUserProfile(parsedProfile);
        setIsDemoUser(true);
        return true;
      }
    } catch (e) {
      console.warn("Could not parse demo session:", e);
    }
    return false;
  }, []);

  // Validate connection to Firestore as mandated by system skill
  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, "test", "connection"));
      } catch (error: any) {
        if (error instanceof Error && error.message.includes("the client is offline")) {
          console.warn("Firebase client is currently offline or connecting...");
          setIsFirebaseAvailable(false);
        }
      }
    }
    testConnection();
  }, []);

  // Fetch or create profile for auth user
  const fetchUserProfile = useCallback(async (user: User) => {
    try {
      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data();
        setUserProfile({
          uid: user.uid,
          fullName: data.fullName || user.displayName || "Legal Professional",
          email: user.email || data.email || "",
          phoneNumber: data.phoneNumber || "",
          profilePhotoURL: data.profilePhotoURL || user.photoURL || "",
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        });
      } else {
        // Create initial user doc if missing
        const initialProfile: UserProfile = {
          uid: user.uid,
          fullName: user.displayName || user.email?.split("@")[0] || "Legal User",
          email: user.email || "",
          phoneNumber: "",
          profilePhotoURL: user.photoURL || "",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };
        await setDoc(userRef, initialProfile, { merge: true });
        setUserProfile(initialProfile);
      }
    } catch (err) {
      console.warn("Could not fetch user profile from Firestore:", err);
      // Fallback from auth token
      setUserProfile({
        uid: user.uid,
        fullName: user.displayName || user.email?.split("@")[0] || "Legal User",
        email: user.email || "",
        profilePhotoURL: user.photoURL || "",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
  }, []);

  // Listen to Auth State with zero flicker
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        localStorage.removeItem("legal_navigator_demo_session");
        setIsDemoUser(false);
        setCurrentUser(user);
        await fetchUserProfile(user);
        setLoading(false);
      } else {
        // If not authenticated in Firebase, check for demo session
        const hasDemo = loadSavedDemoSession();
        if (!hasDemo) {
          setCurrentUser(null);
          setUserProfile(null);
          setIsDemoUser(false);
        }
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [fetchUserProfile, loadSavedDemoSession]);

  const refreshUserProfile = useCallback(async () => {
    if (currentUser && !isDemoUser) {
      await fetchUserProfile(currentUser);
    }
  }, [currentUser, isDemoUser, fetchUserProfile]);

  // Upload profile photo to Firebase Storage with local fallback
  const uploadProfilePhoto = async (uid: string, file: File): Promise<string> => {
    try {
      const fileExt = file.name.split(".").pop() || "jpg";
      const storageRef = ref(storage, `users/${uid}/avatar_${Date.now()}.${fileExt}`);
      const uploadTask = await uploadBytes(storageRef, file, {
        contentType: file.type || "image/jpeg",
      });
      return await getDownloadURL(uploadTask.ref);
    } catch (storageErr) {
      console.warn("Storage upload failed, falling back to base64 Data URL:", storageErr);
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (e) => reject(e);
        reader.readAsDataURL(file);
      });
    }
  };

  // Google Sign-In (Configured by set_up_firebase)
  const loginWithGoogle = async () => {
    localStorage.removeItem("legal_navigator_demo_session");
    setIsDemoUser(false);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    const cred = await signInWithPopup(auth, provider);
    await fetchUserProfile(cred.user);
  };

  // Demo Counselor login (instant fallback)
  const loginAsDemo = (fullName = "Eleanor Vance, Esq.", email = "counselor.vance@legalnavigator.app") => {
    const demoProfile: UserProfile = {
      uid: "demo-counselor-01",
      fullName,
      email,
      phoneNumber: "+1 (555) 749-2810",
      profilePhotoURL: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const mockUser = {
      uid: demoProfile.uid,
      email: demoProfile.email,
      displayName: demoProfile.fullName,
      photoURL: demoProfile.profilePhotoURL,
    } as unknown as User;

    localStorage.setItem("legal_navigator_demo_session", JSON.stringify(demoProfile));
    setCurrentUser(mockUser);
    setUserProfile(demoProfile);
    setIsDemoUser(true);
  };

  // Sign up
  const register = async (
    email: string,
    pass: string,
    fullName: string,
    phoneNumber?: string,
    photoFile?: File | null
  ) => {
    const cred = await createUserWithEmailAndPassword(auth, email.trim(), pass);
    const user = cred.user;

    let photoURL = "";
    if (photoFile) {
      try {
        photoURL = await uploadProfilePhoto(user.uid, photoFile);
      } catch (e) {
        console.warn("Photo upload during registration encountered error:", e);
      }
    }

    // Update Firebase Auth profile
    try {
      await updateProfile(user, {
        displayName: fullName,
        photoURL: photoURL || undefined,
      });
    } catch (e) {
      console.warn("updateProfile error:", e);
    }

    // Create Firestore document
    const userRef = doc(db, "users", user.uid);
    const profileDoc: any = {
      uid: user.uid,
      fullName: fullName.trim(),
      email: email.trim().toLowerCase(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    if (phoneNumber?.trim()) {
      profileDoc.phoneNumber = phoneNumber.trim();
    }
    if (photoURL) {
      profileDoc.profilePhotoURL = photoURL;
    }

    await setDoc(userRef, profileDoc);
    setUserProfile({
      uid: user.uid,
      fullName: fullName.trim(),
      email: email.trim(),
      phoneNumber: phoneNumber?.trim() || "",
      profilePhotoURL: photoURL || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  };

  // Login
  const login = async (email: string, pass: string) => {
    const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
    await fetchUserProfile(cred.user);
  };

  // Logout
  const logout = async () => {
    localStorage.removeItem("legal_navigator_demo_session");
    setIsDemoUser(false);
    try {
      await firebaseSignOut(auth);
    } catch (e) {
      console.warn("Firebase sign out error:", e);
    }
    setCurrentUser(null);
    setUserProfile(null);
  };

  // Password Reset
  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email.trim());
  };

  // Update profile
  const updateUserProfileData = async (updates: {
    fullName?: string;
    phoneNumber?: string;
    photoFile?: File | null;
  }) => {
    if (!currentUser) throw new Error("No authenticated user.");

    if (isDemoUser) {
      setUserProfile((prev) =>
        prev
          ? {
              ...prev,
              fullName: updates.fullName !== undefined ? updates.fullName.trim() : prev.fullName,
              phoneNumber: updates.phoneNumber !== undefined ? updates.phoneNumber.trim() : prev.phoneNumber,
              updatedAt: new Date().toISOString(),
            }
          : null
      );
      return;
    }

    let newPhotoURL = userProfile?.profilePhotoURL;
    if (updates.photoFile) {
      newPhotoURL = await uploadProfilePhoto(currentUser.uid, updates.photoFile);
    }

    const firestoreUpdates: any = {
      updatedAt: serverTimestamp(),
    };
    if (updates.fullName !== undefined) {
      firestoreUpdates.fullName = updates.fullName.trim();
    }
    if (updates.phoneNumber !== undefined) {
      firestoreUpdates.phoneNumber = updates.phoneNumber.trim();
    }
    if (newPhotoURL !== undefined) {
      firestoreUpdates.profilePhotoURL = newPhotoURL;
    }

    const userRef = doc(db, "users", currentUser.uid);
    await updateDoc(userRef, firestoreUpdates);

    // Sync auth user
    if (updates.fullName || newPhotoURL) {
      await updateProfile(currentUser, {
        displayName: updates.fullName?.trim() || currentUser.displayName,
        photoURL: newPhotoURL || currentUser.photoURL,
      });
    }

    setUserProfile((prev) =>
      prev
        ? {
            ...prev,
            fullName: updates.fullName !== undefined ? updates.fullName.trim() : prev.fullName,
            phoneNumber: updates.phoneNumber !== undefined ? updates.phoneNumber.trim() : prev.phoneNumber,
            profilePhotoURL: newPhotoURL !== undefined ? newPhotoURL : prev.profilePhotoURL,
            updatedAt: new Date().toISOString(),
          }
        : null
    );
  };

  // Format initials helper
  const formatInitials = (name?: string): string => {
    if (!name) return "LD";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        userProfile,
        loading,
        login,
        loginWithGoogle,
        loginAsDemo,
        register,
        logout,
        resetPassword,
        updateUserProfileData,
        formatInitials,
        refreshUserProfile,
        isFirebaseAvailable,
        isDemoUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
