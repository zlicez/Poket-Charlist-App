import { describe, expect, it } from "vitest";

import { __applyDamageTo } from "../client/src/hooks/character/useApplyDamage";
import { __applyHealTo } from "../client/src/hooks/character/useApplyHeal";

describe("applyDamageTo", () => {
  it("consumes tempHp first then currentHp", () => {
    const result = __applyDamageTo({ currentHp: 20, tempHp: 5 }, 8);
    expect(result).toEqual({ tempHp: 0, currentHp: 17 });
  });

  it("absorbs fully into tempHp when damage <= tempHp", () => {
    const result = __applyDamageTo({ currentHp: 20, tempHp: 10 }, 7);
    expect(result).toEqual({ tempHp: 3, currentHp: 20 });
  });

  it("floors currentHp at 0 on overkill", () => {
    const result = __applyDamageTo({ currentHp: 3, tempHp: 0 }, 50);
    expect(result).toEqual({ tempHp: 0, currentHp: 0 });
  });

  it("handles zero-damage no-op", () => {
    const result = __applyDamageTo({ currentHp: 10, tempHp: 2 }, 0);
    expect(result).toEqual({ tempHp: 2, currentHp: 10 });
  });
});

describe("applyHealTo", () => {
  it("caps at maxHp", () => {
    const result = __applyHealTo({ currentHp: 8, maxHp: 10 }, 5);
    expect(result).toEqual({ currentHp: 10 });
  });

  it("adds exactly when not capped", () => {
    const result = __applyHealTo({ currentHp: 3, maxHp: 12 }, 4);
    expect(result).toEqual({ currentHp: 7 });
  });

  it("zero heal is a no-op", () => {
    const result = __applyHealTo({ currentHp: 5, maxHp: 10 }, 0);
    expect(result).toEqual({ currentHp: 5 });
  });
});
