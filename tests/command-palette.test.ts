import { describe, expect, it } from "vitest";

import {
  filterCommands,
  groupCommands,
  type Command,
} from "@/ds/hooks/useCommandPalette";

function cmd(partial: Partial<Command> & { id: string; label: string }): Command {
  return {
    onRun: () => {},
    ...partial,
  };
}

describe("filterCommands", () => {
  const all: Command[] = [
    cmd({ id: "a", label: "Открыть Бой", keywords: ["combat", "бой"] }),
    cmd({ id: "b", label: "Открыть Лист", keywords: ["skills", "навыки"] }),
    cmd({
      id: "c",
      label: "Переключиться в Edit",
      keywords: ["play", "edit"],
    }),
    cmd({ id: "d", label: "Долгий отдых", keywords: ["rest", "sleep"] }),
  ];

  it("returns input order on empty query", () => {
    expect(filterCommands(all, "").map((c) => c.id)).toEqual([
      "a",
      "b",
      "c",
      "d",
    ]);
  });

  it("prefers label prefix over label include", () => {
    // Both "Открыть Бой" and "Открыть Лист" start with "Откры"
    const result = filterCommands(all, "откры");
    expect(result.map((c) => c.id)).toEqual(["a", "b"]);
  });

  it("matches by keyword substring", () => {
    // "sleep" keyword → "Долгий отдых"
    const result = filterCommands(all, "sleep");
    expect(result.map((c) => c.id)).toEqual(["d"]);
  });

  it("ranks label-prefix above keyword-prefix", () => {
    const mixed: Command[] = [
      cmd({ id: "x", label: "Boost", keywords: ["ink"] }),
      cmd({ id: "y", label: "Ink potion", keywords: ["boost"] }),
    ];
    const result = filterCommands(mixed, "ink");
    // "Ink potion" (label prefix) должен быть впереди "Boost" (keyword)
    expect(result.map((c) => c.id)).toEqual(["y", "x"]);
  });

  it("is case-insensitive", () => {
    const result = filterCommands(all, "EDIT");
    expect(result.map((c) => c.id)).toEqual(["c"]);
  });

  it("returns empty on no matches", () => {
    expect(filterCommands(all, "xyz")).toEqual([]);
  });

  it("is stable when scores tie", () => {
    const same: Command[] = [
      cmd({ id: "x", label: "Alpha one", keywords: [] }),
      cmd({ id: "y", label: "Alpha two", keywords: [] }),
      cmd({ id: "z", label: "Alpha three", keywords: [] }),
    ];
    // All three label-prefix match "alpha" with score=0 → preserve input order.
    expect(filterCommands(same, "alpha").map((c) => c.id)).toEqual([
      "x",
      "y",
      "z",
    ]);
  });
});

describe("groupCommands", () => {
  it("buckets by section, preserving first-appearance order", () => {
    const list: Command[] = [
      cmd({ id: "a", label: "A", section: "One" }),
      cmd({ id: "b", label: "B", section: "Two" }),
      cmd({ id: "c", label: "C", section: "One" }),
    ];
    const groups = groupCommands(list);
    expect(groups.map((g) => g.section)).toEqual(["One", "Two"]);
    expect(groups[0].items.map((c) => c.id)).toEqual(["a", "c"]);
    expect(groups[1].items.map((c) => c.id)).toEqual(["b"]);
  });

  it("puts section-less commands under null key", () => {
    const list: Command[] = [
      cmd({ id: "a", label: "A" }),
      cmd({ id: "b", label: "B", section: "Sec" }),
    ];
    const groups = groupCommands(list);
    expect(groups[0].section).toBeNull();
    expect(groups[0].items.map((c) => c.id)).toEqual(["a"]);
    expect(groups[1].section).toBe("Sec");
  });
});
