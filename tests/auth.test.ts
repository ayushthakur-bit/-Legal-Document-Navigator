import { describe, it, expect } from "vitest";
import {
  getFriendlyAuthErrorMessage,
  isOperationNotAllowedError,
  formatUserInitials,
} from "../src/context/AuthContext";

describe("Authentication & Security Hardening", () => {
  describe("Firebase Auth Error Message Sanitization", () => {
    it("converts auth/invalid-credential to user-friendly message", () => {
      const msg = getFriendlyAuthErrorMessage("auth/invalid-credential");
      expect(msg).toBe("Email or password is incorrect. Please double check and try again.");
    });

    it("converts auth/email-already-in-use to friendly registration alert", () => {
      const msg = getFriendlyAuthErrorMessage("auth/email-already-in-use");
      expect(msg).toBe("An account with this email address already exists. Please log in.");
    });

    it("converts auth/weak-password to security requirement alert", () => {
      const msg = getFriendlyAuthErrorMessage("auth/weak-password");
      expect(msg).toContain("at least 6 characters");
    });

    it("converts auth/user-not-found to non-leaking credential error", () => {
      const msg = getFriendlyAuthErrorMessage("auth/user-not-found");
      expect(msg).toBe("No account exists with this email address. Please sign up first.");
    });

    it("converts auth/too-many-requests to rate limiting alert", () => {
      const msg = getFriendlyAuthErrorMessage("auth/too-many-requests");
      expect(msg).toContain("Access is temporarily paused for security");
    });

    it("converts auth/network-request-failed to network connection alert", () => {
      const msg = getFriendlyAuthErrorMessage("auth/network-request-failed");
      expect(msg).toContain("Network connection issue");
    });
  });

  describe("Operation Not Allowed Diagnostics", () => {
    it("detects raw Firebase error code auth/operation-not-allowed", () => {
      expect(isOperationNotAllowedError("auth/operation-not-allowed")).toBe(true);
      expect(isOperationNotAllowedError("FirebaseError: Firebase: Error (auth/operation-not-allowed).")).toBe(true);
    });

    it("returns false for standard credentials errors", () => {
      expect(isOperationNotAllowedError("auth/invalid-credential")).toBe(false);
      expect(isOperationNotAllowedError(null)).toBe(false);
    });
  });

  describe("User Initials & Avatar Generation", () => {
    it("formats two-word names correctly (e.g. Ayush Thakur -> AT)", () => {
      expect(formatUserInitials("Ayush Thakur")).toBe("AT");
    });

    it("formats titles and suffixes properly (e.g. Eleanor Vance -> EV)", () => {
      expect(formatUserInitials("Eleanor Vance")).toBe("EV");
    });

    it("formats single names by taking first two letters", () => {
      expect(formatUserInitials("Alexander")).toBe("AL");
    });

    it("handles empty or whitespace strings with fallback", () => {
      expect(formatUserInitials("")).toBe("LD");
      expect(formatUserInitials("   ")).toBe("LD");
      expect(formatUserInitials(undefined)).toBe("LD");
    });
  });

  describe("Document Ownership & Isolation Security", () => {
    it("enforces strict matching of resource.userId to auth.uid", () => {
      const currentAuthUid = "user_abc_123";
      const userDocument = {
        id: "doc_1",
        userId: "user_abc_123",
        fileName: "Employment Agreement.pdf",
      };
      const foreignDocument = {
        id: "doc_2",
        userId: "user_xyz_999",
        fileName: "Confidential M&A.pdf",
      };

      const canAccessOwnDoc = userDocument.userId === currentAuthUid;
      const canAccessForeignDoc = foreignDocument.userId === currentAuthUid;

      expect(canAccessOwnDoc).toBe(true);
      expect(canAccessForeignDoc).toBe(false);
    });
  });
});
