import { beforeEach, describe, expect, it, vi } from "vitest";
import { clientKey, rateLimit } from "@/lib/rate-limit";

describe("rateLimit", () => {
  it("permite hasta el límite y luego bloquea en la misma ventana", () => {
    const key = `test-${Date.now()}-${Math.random()}`;
    const opts = { limit: 3, windowMs: 60_000 };

    expect(rateLimit(key, opts).allowed).toBe(true);
    expect(rateLimit(key, opts).allowed).toBe(true);
    expect(rateLimit(key, opts).allowed).toBe(true);

    const blocked = rateLimit(key, opts);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("reinicia el contador tras expirar la ventana", () => {
    const key = `reset-${Date.now()}-${Math.random()}`;
    const opts = { limit: 1, windowMs: 20 };
    const now = Date.now();

    expect(rateLimit(key, opts).allowed).toBe(true);
    expect(rateLimit(key, opts).allowed).toBe(false);

    vi.spyOn(Date, "now").mockReturnValue(now + 25);
    expect(rateLimit(key, opts).allowed).toBe(true);
    vi.restoreAllMocks();
  });
});

describe("clientKey", () => {
  it("usa unknown sin request", () => {
    expect(clientKey("register")).toBe("register:unknown");
  });

  it("prioriza x-forwarded-for", () => {
    const request = new Request("https://example.com", {
      headers: { "x-forwarded-for": "1.2.3.4, 5.6.7.8" },
    });
    expect(clientKey("login", request)).toBe("login:1.2.3.4");
  });

  it("cae a x-real-ip o local", () => {
    const withIp = new Request("https://example.com", {
      headers: { "x-real-ip": "9.9.9.9" },
    });
    expect(clientKey("reset", withIp)).toBe("reset:9.9.9.9");

    const local = new Request("https://example.com");
    expect(clientKey("reset", local)).toBe("reset:local");
  });
});
