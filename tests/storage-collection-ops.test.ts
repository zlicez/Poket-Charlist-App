import { beforeEach, describe, expect, it } from "vitest";

import { createDefaultCharacter } from "../shared/types/character-types";
import type { CollectionOp } from "../shared/types/character-types";
import { storage } from "../server/storage";

const USER_ID = "test-user-ops";

async function seed() {
  const created = await storage.createCharacter(createDefaultCharacter(), USER_ID);
  return created;
}

const baseWeapon = (id: string, name = "Longsword") => ({
  id,
  name,
  attackBonus: 5,
  damage: "1d8",
  damageType: "slashing",
  abilityMod: "str" as const,
});

describe("storage.applyCollectionOps", () => {
  beforeEach(async () => {
    const existing = await storage.getCharacters(USER_ID);
    for (const c of existing) {
      await storage.deleteCharacter(c.id, USER_ID);
    }
  });

  it("rejects stale expectedUpdatedAt with conflict", async () => {
    const created = await seed();
    await new Promise((r) => setTimeout(r, 2));
    await storage.updateCharacter(created.id, USER_ID, { name: "Bumped" });
    const ops: CollectionOp[] = [
      { op: "upsertItem", collection: "weapons", id: "w1", patch: baseWeapon("w1") },
    ];
    const result = await storage.applyCollectionOps(created.id, USER_ID, ops, created.updatedAt!);
    expect(result.status).toBe("conflict");
  });

  it("upserts a new weapon with valid fields", async () => {
    const created = await seed();
    const result = await storage.applyCollectionOps(
      created.id,
      USER_ID,
      [{ op: "upsertItem", collection: "weapons", id: "w1", patch: baseWeapon("w1", "Axe") }],
      created.updatedAt!,
    );
    expect(result.status).toBe("ok");
    if (result.status !== "ok") return;
    expect(result.character.weapons).toHaveLength(1);
    expect(result.character.weapons[0]).toMatchObject({ id: "w1", name: "Axe" });
    expect(result.character.updatedAt).not.toBe(created.updatedAt);
  });

  it("updates an existing weapon in place", async () => {
    const created = await seed();
    const add = await storage.applyCollectionOps(
      created.id,
      USER_ID,
      [{ op: "upsertItem", collection: "weapons", id: "w1", patch: baseWeapon("w1", "Axe") }],
      created.updatedAt!,
    );
    expect(add.status).toBe("ok");
    if (add.status !== "ok") return;
    const update = await storage.applyCollectionOps(
      created.id,
      USER_ID,
      [{ op: "upsertItem", collection: "weapons", id: "w1", patch: { name: "Renamed Axe" } }],
      add.character.updatedAt!,
    );
    expect(update.status).toBe("ok");
    if (update.status !== "ok") return;
    expect(update.character.weapons).toHaveLength(1);
    expect(update.character.weapons[0].name).toBe("Renamed Axe");
    expect(update.character.weapons[0].damage).toBe("1d8"); // preserved
  });

  it("returns invalid when upsert new item violates schema", async () => {
    const created = await seed();
    // Missing required `name` for a brand-new weapon.
    const result = await storage.applyCollectionOps(
      created.id,
      USER_ID,
      [{ op: "upsertItem", collection: "weapons", id: "w1", patch: { attackBonus: 5 } }],
      created.updatedAt!,
    );
    expect(result.status).toBe("invalid");
  });

  it("removes an item by id", async () => {
    const created = await seed();
    const add = await storage.applyCollectionOps(
      created.id,
      USER_ID,
      [{ op: "upsertItem", collection: "weapons", id: "w1", patch: baseWeapon("w1") }],
      created.updatedAt!,
    );
    if (add.status !== "ok") throw new Error("setup");
    const remove = await storage.applyCollectionOps(
      created.id,
      USER_ID,
      [{ op: "removeItem", collection: "weapons", id: "w1" }],
      add.character.updatedAt!,
    );
    expect(remove.status).toBe("ok");
    if (remove.status !== "ok") return;
    expect(remove.character.weapons).toHaveLength(0);
  });

  it("returns invalid when removing a missing id", async () => {
    const created = await seed();
    const result = await storage.applyCollectionOps(
      created.id,
      USER_ID,
      [{ op: "removeItem", collection: "weapons", id: "does-not-exist" }],
      created.updatedAt!,
    );
    expect(result.status).toBe("invalid");
  });

  it("reorders items as a permutation", async () => {
    const created = await seed();
    const add = await storage.applyCollectionOps(
      created.id,
      USER_ID,
      [
        { op: "upsertItem", collection: "weapons", id: "a", patch: baseWeapon("a", "A") },
        { op: "upsertItem", collection: "weapons", id: "b", patch: baseWeapon("b", "B") },
        { op: "upsertItem", collection: "weapons", id: "c", patch: baseWeapon("c", "C") },
      ],
      created.updatedAt!,
    );
    if (add.status !== "ok") throw new Error("setup");
    const reorder = await storage.applyCollectionOps(
      created.id,
      USER_ID,
      [{ op: "reorderItems", collection: "weapons", orderedIds: ["c", "a", "b"] }],
      add.character.updatedAt!,
    );
    expect(reorder.status).toBe("ok");
    if (reorder.status !== "ok") return;
    expect(reorder.character.weapons.map((w) => w.id)).toEqual(["c", "a", "b"]);
  });

  it("returns invalid when reorder ids are not a permutation", async () => {
    const created = await seed();
    const add = await storage.applyCollectionOps(
      created.id,
      USER_ID,
      [{ op: "upsertItem", collection: "weapons", id: "a", patch: baseWeapon("a", "A") }],
      created.updatedAt!,
    );
    if (add.status !== "ok") throw new Error("setup");
    const result = await storage.applyCollectionOps(
      created.id,
      USER_ID,
      [{ op: "reorderItems", collection: "weapons", orderedIds: ["a", "extra"] }],
      add.character.updatedAt!,
    );
    expect(result.status).toBe("invalid");
  });

  it("applies a batch atomically — failure in op 2 leaves state unchanged", async () => {
    const created = await seed();
    const firstBatch: CollectionOp[] = [
      { op: "upsertItem", collection: "weapons", id: "w1", patch: baseWeapon("w1", "Good") },
      { op: "removeItem", collection: "weapons", id: "nope" }, // fails
    ];
    const result = await storage.applyCollectionOps(
      created.id,
      USER_ID,
      firstBatch,
      created.updatedAt!,
    );
    expect(result.status).toBe("invalid");
    const reread = await storage.getCharacter(created.id, USER_ID);
    expect(reread?.weapons).toHaveLength(0);
    expect(reread?.updatedAt).toBe(created.updatedAt);
  });

  it("rejects spells ops when spellcasting is not initialized", async () => {
    const created = await seed();
    const result = await storage.applyCollectionOps(
      created.id,
      USER_ID,
      [
        {
          op: "upsertItem",
          collection: "spells",
          id: "sp1",
          patch: { id: "sp1", name: "Fire Bolt", level: 0 },
        },
      ],
      created.updatedAt!,
    );
    expect(result.status).toBe("invalid");
  });
});
