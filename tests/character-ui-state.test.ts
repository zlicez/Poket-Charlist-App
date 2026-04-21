import { describe, expect, it } from "vitest";

import {
  characterSchema,
  createDefaultCharacter,
  uiStateSchema,
} from "../shared/types/character-types";

describe("character ui_state field", () => {
  it("parses with ui_state present", () => {
    const character = createDefaultCharacter();
    const parsed = characterSchema.parse({
      id: "c-1",
      ...character,
      ui_state: { mode: "play", theme: "dark" },
    });
    expect(parsed.ui_state?.mode).toBe("play");
    expect(parsed.ui_state?.theme).toBe("dark");
  });

  it("parses without ui_state (backward compat)", () => {
    const character = createDefaultCharacter();
    const parsed = characterSchema.parse({ id: "c-1", ...character });
    expect(parsed.ui_state).toBeUndefined();
  });

  it("rejects unknown mode value", () => {
    const result = uiStateSchema.safeParse({ mode: "sandbox" });
    expect(result.success).toBe(false);
  });

  it("allows theme without mode", () => {
    const parsed = uiStateSchema.parse({ theme: "light" });
    expect(parsed.mode).toBeUndefined();
    expect(parsed.theme).toBe("light");
  });

  it("allows empty object (both fields optional)", () => {
    expect(uiStateSchema.parse({})).toEqual({});
  });
});
