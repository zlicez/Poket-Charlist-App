import { describe, expect, it } from "vitest";

import {
  createDefaultCharacter,
  publicCharacterSchema,
} from "../shared/types/character-types";

describe("publicCharacterSchema", () => {
  it("keeps notes in shared payloads", () => {
    const character = createDefaultCharacter();
    character.notes = "## Секретный, но теперь общий текст";

    const parsed = publicCharacterSchema.parse({
      id: "shared-id",
      userId: "owner-id",
      ...character,
    });

    expect(parsed.notes).toBe("## Секретный, но теперь общий текст");
    expect("userId" in parsed).toBe(false);
  });
});
