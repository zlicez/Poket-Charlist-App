import { beforeEach, describe, expect, it } from "vitest";

import { createDefaultCharacter } from "../shared/types/character-types";
import { storage } from "../server/storage";

const USER_ID = "test-user-versioning";

async function seedCharacter() {
  const created = await storage.createCharacter(createDefaultCharacter(), USER_ID);
  return created;
}

describe("storage.updateCharacter — optimistic concurrency", () => {
  beforeEach(async () => {
    // Remove any characters created by previous tests (MemStorage is a singleton).
    const existing = await storage.getCharacters(USER_ID);
    for (const c of existing) {
      await storage.deleteCharacter(c.id, USER_ID);
    }
  });

  it("returns updatedAt on create and update", async () => {
    const created = await seedCharacter();
    expect(typeof created.updatedAt).toBe("string");
    const firstStamp = created.updatedAt!;

    // Wait 2ms to guarantee a distinct timestamp on the next update.
    await new Promise((resolve) => setTimeout(resolve, 2));

    const updated = await storage.updateCharacter(created.id, USER_ID, {
      name: "Renamed",
    });
    expect(updated.status).toBe("ok");
    if (updated.status !== "ok") return;
    expect(updated.character.name).toBe("Renamed");
    expect(typeof updated.character.updatedAt).toBe("string");
    expect(updated.character.updatedAt).not.toBe(firstStamp);
  });

  it("succeeds when expectedUpdatedAt matches", async () => {
    const created = await seedCharacter();
    const result = await storage.updateCharacter(
      created.id,
      USER_ID,
      { name: "Matched" },
      created.updatedAt,
    );
    expect(result.status).toBe("ok");
  });

  it("returns conflict when expectedUpdatedAt is stale", async () => {
    const created = await seedCharacter();
    // Simulate another writer that bumped the version.
    await new Promise((resolve) => setTimeout(resolve, 2));
    const firstWrite = await storage.updateCharacter(created.id, USER_ID, {
      name: "Bumped",
    });
    expect(firstWrite.status).toBe("ok");

    const result = await storage.updateCharacter(
      created.id,
      USER_ID,
      { name: "Stale" },
      created.updatedAt, // the stale pre-bump version
    );
    expect(result.status).toBe("conflict");
    if (result.status !== "conflict") return;
    expect(result.current.name).toBe("Bumped");
  });

  it("returns notfound for a missing character", async () => {
    const result = await storage.updateCharacter("does-not-exist", USER_ID, {
      name: "Ghost",
    });
    expect(result.status).toBe("notfound");
  });

  it("ignores updatedAt sent in the request body", async () => {
    const created = await seedCharacter();
    const fakeStamp = "1970-01-01T00:00:00.000Z";
    const result = await storage.updateCharacter(created.id, USER_ID, {
      name: "Ignored body ts",
      updatedAt: fakeStamp,
    });
    expect(result.status).toBe("ok");
    if (result.status !== "ok") return;
    expect(result.character.updatedAt).not.toBe(fakeStamp);
  });
});
