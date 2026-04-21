import { describe, expect, it } from "vitest";

import {
  clampHpPercentage,
  clampTempPercentage,
  getHpState,
} from "../client/src/ds/hero/hp-state";

describe("getHpState", () => {
  it("returns downed when current is 0", () => {
    expect(getHpState(0, 20)).toBe("downed");
  });

  it("returns downed when current is negative", () => {
    expect(getHpState(-3, 20)).toBe("downed");
  });

  it("returns downed when max is 0", () => {
    expect(getHpState(0, 0)).toBe("downed");
  });

  it("returns healthy when current > 50% of max", () => {
    expect(getHpState(11, 20)).toBe("healthy");
    expect(getHpState(20, 20)).toBe("healthy");
  });

  it("returns wounded between 25% and 50%", () => {
    expect(getHpState(10, 20)).toBe("wounded");
    expect(getHpState(5, 20)).toBe("wounded");
  });

  it("returns critical below 25%", () => {
    expect(getHpState(4, 20)).toBe("critical");
    expect(getHpState(1, 20)).toBe("critical");
  });
});

describe("clampHpPercentage", () => {
  it("returns 0 when max is 0", () => {
    expect(clampHpPercentage(5, 0)).toBe(0);
  });

  it("returns 0 when current is negative", () => {
    expect(clampHpPercentage(-3, 20)).toBe(0);
  });

  it("computes correct percentage", () => {
    expect(clampHpPercentage(10, 20)).toBe(50);
    expect(clampHpPercentage(15, 20)).toBe(75);
  });

  it("clamps to 100 when current > max", () => {
    expect(clampHpPercentage(25, 20)).toBe(100);
  });
});

describe("clampTempPercentage", () => {
  it("returns 0 when max is 0", () => {
    expect(clampTempPercentage(5, 0, 3)).toBe(0);
  });

  it("fits within remaining bar space", () => {
    // current 15/20 = 75%, temp 3 → 15%, остаётся 25% свободного → 15% fits
    expect(clampTempPercentage(15, 20, 3)).toBe(15);
  });

  it("clamps temp to available space", () => {
    // current 19/20 = 95%, temp 5 → would be 25%, but only 5% left
    expect(clampTempPercentage(19, 20, 5)).toBe(5);
  });

  it("returns 0 when bar is full of current hp", () => {
    expect(clampTempPercentage(20, 20, 3)).toBe(0);
  });
});
