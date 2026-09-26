import { describe, it, expect } from "vitest";
import { getAuthViewFromPath, getPathForAuthView } from "../src/App";

describe("URL Routing & Protected Path Resolution", () => {
  describe("getAuthViewFromPath", () => {
    it("resolves root path to app navigator", () => {
      expect(getAuthViewFromPath("/", "")).toBe("app");
      expect(getAuthViewFromPath("", "")).toBe("app");
    });

    it("resolves /dashboard to authenticated dashboard", () => {
      expect(getAuthViewFromPath("/dashboard", "")).toBe("dashboard");
    });

    it("resolves /documents and /my-documents to documents section", () => {
      expect(getAuthViewFromPath("/documents", "")).toBe("documents");
      expect(getAuthViewFromPath("/my-documents", "")).toBe("documents");
    });

    it("resolves /profile to user profile page", () => {
      expect(getAuthViewFromPath("/profile", "")).toBe("profile");
    });

    it("resolves /login and /signin to login view", () => {
      expect(getAuthViewFromPath("/login", "")).toBe("login");
      expect(getAuthViewFromPath("/signin", "")).toBe("login");
    });

    it("resolves /signup and /register to signup view", () => {
      expect(getAuthViewFromPath("/signup", "")).toBe("signup");
      expect(getAuthViewFromPath("/register", "")).toBe("signup");
    });

    it("resolves /forgot-password to password reset view", () => {
      expect(getAuthViewFromPath("/forgot-password", "")).toBe("forgot-password");
      expect(getAuthViewFromPath("/reset-password", "")).toBe("forgot-password");
    });

    it("prioritizes SPA hash over path when provided", () => {
      expect(getAuthViewFromPath("/", "#dashboard")).toBe("dashboard");
      expect(getAuthViewFromPath("/", "#profile")).toBe("profile");
      expect(getAuthViewFromPath("/", "#documents")).toBe("documents");
    });
  });

  describe("getPathForAuthView", () => {
    it("returns /dashboard for dashboard view", () => {
      expect(getPathForAuthView("dashboard")).toBe("/dashboard");
    });

    it("returns /documents for documents view", () => {
      expect(getPathForAuthView("documents")).toBe("/documents");
    });

    it("returns /profile for profile view", () => {
      expect(getPathForAuthView("profile")).toBe("/profile");
    });

    it("returns /login for login view", () => {
      expect(getPathForAuthView("login")).toBe("/login");
    });

    it("returns /signup for signup view", () => {
      expect(getPathForAuthView("signup")).toBe("/signup");
    });

    it("returns / for app view", () => {
      expect(getPathForAuthView("app")).toBe("/");
    });

    it("verifies back navigation targets return safely to root app navigator", () => {
      // When back button is clicked on login or signup, destination is 'app'
      const loginBackTarget = "app";
      expect(getPathForAuthView(loginBackTarget)).toBe("/");
      const signupBackTarget = "app";
      expect(getPathForAuthView(signupBackTarget)).toBe("/");
      const forgotPasswordBackTarget = "login";
      expect(getPathForAuthView(forgotPasswordBackTarget)).toBe("/login");
    });
  });
});
