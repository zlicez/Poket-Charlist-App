import { describe, expect, it } from "vitest";

import {
  describeChange,
  extractCharacterId,
  timeAgo,
} from "../client/src/ds/screens/edge/offline-utils";

describe("describeChange", () => {
  it("summarizes a character PATCH with one field", () => {
    const d = describeChange({
      id: "1",
      method: "PATCH",
      url: "/api/characters/xyz",
      body: { currentHp: 10 },
      timestamp: 0,
    });
    expect(d.field).toBe("currentHp");
    expect(d.preview).toContain("10");
  });

  it("indicates +N more fields on multi-field PATCH", () => {
    const d = describeChange({
      id: "1",
      method: "PATCH",
      url: "/api/characters/xyz",
      body: { currentHp: 10, tempHp: 3 },
      timestamp: 0,
    });
    expect(d.preview).toContain("+ещё 1 поля");
  });

  it("handles ops batch", () => {
    const d = describeChange({
      id: "1",
      method: "POST",
      url: "/api/characters/xyz/ops",
      body: {
        ops: [
          { op: "upsertItem", collection: "weapons", id: "w1" },
          { op: "removeItem", collection: "weapons", id: "w2" },
        ],
      },
      timestamp: 0,
    });
    expect(d.field).toBe("weapons");
    expect(d.preview).toContain("upsert");
    expect(d.preview).toContain("+ещё 1");
  });

  it("filters system fields from preview", () => {
    const d = describeChange({
      id: "1",
      method: "PATCH",
      url: "/api/characters/xyz",
      body: { id: "xyz", userId: "u", updatedAt: "2026-01-01", currentHp: 10 },
      timestamp: 0,
    });
    expect(d.field).toBe("currentHp");
  });
});

describe("timeAgo", () => {
  it("formats seconds", () => {
    expect(timeAgo(1000, 6000)).toBe("5 сек назад");
  });
  it("formats minutes", () => {
    expect(timeAgo(0, 120_000)).toBe("2 мин назад");
  });
  it("formats hours", () => {
    expect(timeAgo(0, 3 * 60 * 60 * 1000)).toBe("3 ч назад");
  });
  it("clamps negative to 0 sec", () => {
    expect(timeAgo(10_000, 5_000)).toBe("0 сек назад");
  });
});

describe("extractCharacterId", () => {
  it("parses id from PATCH url", () => {
    expect(extractCharacterId("/api/characters/abc-123")).toBe("abc-123");
  });
  it("parses id from ops url", () => {
    expect(extractCharacterId("/api/characters/xyz/ops")).toBe("xyz");
  });
  it("returns null on non-character url", () => {
    expect(extractCharacterId("/api/auth/user")).toBeNull();
  });
});
