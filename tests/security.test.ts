import { describe, it, expect } from "vitest";
import {
  MemoryAnalysisCache,
  InMemoryRateLimiter,
  validateAnalyzePayload,
  validateAskPayload,
} from "../server/security";

describe("Security & Efficiency Subsystem", () => {
  describe("MemoryAnalysisCache (LRU & TTL)", () => {
    it("stores and retrieves cached items", () => {
      const cache = new MemoryAnalysisCache<{ summary: string }>(5, 5000);
      cache.set("key1", { summary: "Analysis test" });

      const retrieved = cache.get("key1");
      expect(retrieved).not.toBeNull();
      expect(retrieved?.summary).toBe("Analysis test");
      expect(cache.size()).toBe(1);
    });

    it("expires items after TTL", async () => {
      const cache = new MemoryAnalysisCache<any>(5, 30);
      cache.set("ephemeral", { valid: true }, 20);

      expect(cache.get("ephemeral")).not.toBeNull();

      // Wait 35ms for expiration
      await new Promise((resolve) => setTimeout(resolve, 35));
      expect(cache.get("ephemeral")).toBeNull();
      expect(cache.size()).toBe(0);
    });

    it("enforces maxEntries limit via LRU eviction", () => {
      const cache = new MemoryAnalysisCache<number>(3, 10000);
      cache.set("k1", 1);
      cache.set("k2", 2);
      cache.set("k3", 3);

      // Access k1 so k1 is refreshed and k2 becomes the oldest entry
      cache.get("k1");

      // Adding 4th item evicts the oldest (k2)
      cache.set("k4", 4);

      expect(cache.get("k2")).toBeNull();
      expect(cache.get("k1")).toBe(1);
      expect(cache.get("k3")).toBe(3);
      expect(cache.get("k4")).toBe(4);
      expect(cache.size()).toBe(3);
    });
  });

  describe("InMemoryRateLimiter", () => {
    it("permits requests within window limit and blocks requests exceeding limit", () => {
      const limiter = new InMemoryRateLimiter(1000, 3);
      const middleware = limiter.middleware();

      const mockRes = () => {
        const headers: Record<string, string> = {};
        return {
          setHeader: (k: string, v: string) => {
            headers[k] = v;
          },
          status: (_code: number) => ({
            json: (payload: unknown) => payload,
          }),
          headers,
        };
      };

      const req1 = { headers: {}, socket: { remoteAddress: "192.168.1.10" } } as any;
      const res1 = mockRes() as any;
      let nextCalled = false;
      const next = () => {
        nextCalled = true;
      };

      // Request 1
      middleware(req1, res1, next);
      expect(nextCalled).toBe(true);

      // Request 2
      nextCalled = false;
      middleware(req1, res1, next);
      expect(nextCalled).toBe(true);

      // Request 3
      nextCalled = false;
      middleware(req1, res1, next);
      expect(nextCalled).toBe(true);

      // Request 4 (Should be rate limited with 429)
      nextCalled = false;
      let blockedCode = 0;
      let blockedPayload: any = null;
      const resBlocked = {
        setHeader: () => {},
        status: (code: number) => {
          blockedCode = code;
          return {
            json: (data: any) => {
              blockedPayload = data;
              return data;
            },
          };
        },
      } as any;

      middleware(req1, resBlocked, next);
      expect(nextCalled).toBe(false);
      expect(blockedCode).toBe(429);
      expect(blockedPayload.error).toBe("Too Many Requests");
    });
  });

  describe("validateAnalyzePayload()", () => {
    it("rejects non-object payload", () => {
      const res = validateAnalyzePayload(null);
      expect(res.valid).toBe(false);
      expect(res.error).toContain("JSON object");
    });

    it("rejects empty or whitespace-only document text", () => {
      const res = validateAnalyzePayload({ documentText: "   " });
      expect(res.valid).toBe(false);
      expect(res.error).toContain("too short");
    });

    it("rejects document text that is too short (< 10 characters)", () => {
      const res = validateAnalyzePayload({ documentText: "Tiny" });
      expect(res.valid).toBe(false);
      expect(res.error).toContain("too short");
    });

    it("sanitizes text and title in valid payloads", () => {
      const valid = {
        documentText: "This is a legitimate commercial lease contract between Party A and Party B with clauses.",
        documentTitle: "<script>Acme</script> Contract",
        documentType: "Lease <b>Agreement</b>",
      };

      const res = validateAnalyzePayload(valid);
      expect(res.valid).toBe(true);
      expect(res.data?.documentTitle).toBe("scriptAcme/script Contract");
      expect(res.data?.documentType).toBe("Lease bAgreement/b");
      expect(res.data?.documentText).toContain("commercial lease");
    });
  });

  describe("validateAskPayload()", () => {
    it("rejects missing question or missing document context", () => {
      const noQuestion = validateAskPayload({ documentText: "Valid length contract text here..." });
      expect(noQuestion.valid).toBe(false);
      expect(noQuestion.error).toContain("question");

      const noDoc = validateAskPayload({ question: "What is the termination notice period?" });
      expect(noDoc.valid).toBe(false);
      expect(noDoc.error).toContain("documentText");
    });

    it("sanitizes question and document context when valid", () => {
      const res = validateAskPayload({
        question: "Can I terminate early <without penalty>?",
        documentText: "Tenant may terminate upon 60 days written notice.",
      });

      expect(res.valid).toBe(true);
      expect(res.data?.question).toBe("Can I terminate early without penalty?");
      expect(res.data?.documentText).toBe("Tenant may terminate upon 60 days written notice.");
    });
  });
});
