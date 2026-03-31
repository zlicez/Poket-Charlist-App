import { describe, expect, it } from "vitest";
import { hashPassword, normalizeEmail, verifyPassword } from "../server/password";

describe("password utils", () => {
  it("normalizes email with trim and lowercase", () => {
    expect(normalizeEmail("  User@Example.COM ")).toBe("user@example.com");
  });

  it("hashes and verifies a password", async () => {
    const passwordHash = await hashPassword("correct horse battery staple");

    await expect(verifyPassword("correct horse battery staple", passwordHash)).resolves.toBe(true);
    await expect(verifyPassword("wrong password", passwordHash)).resolves.toBe(false);
  });

  it("creates different hashes for the same password because of random salt", async () => {
    const firstHash = await hashPassword("same-password");
    const secondHash = await hashPassword("same-password");

    expect(firstHash).not.toBe(secondHash);
  });
});
