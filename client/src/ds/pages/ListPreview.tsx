import { useState } from "react";

import { typeClass } from "@/ds/tokens";
import { Button } from "@/ds/primitives";
import {
  CreateCharacterSheet,
  DeleteConfirmSheet,
  EmptyList,
  ImportReviewSheet,
  PopulatedList,
  type ImportReviewState,
} from "@/ds/screens/list";
import type { Character, InsertCharacter } from "@shared/schema";
import { createDefaultCharacter } from "@shared/schema";

/**
 * Dev-page: Phase H2 list states. Мокаем 3 персонажа для L-02, pure
 * визуал без API. /ds-list исключена из auth-гейта.
 */

const MOCKS: Character[] = [
  buildMock({
    id: "mock-valarich",
    name: "Валарих",
    race: "Человек",
    className: "Воин",
    level: 5,
  }),
  buildMock({
    id: "mock-iliena",
    name: "Илиэна",
    race: "Эльф",
    className: "Бард",
    level: 3,
  }),
  buildMock({
    id: "mock-gromrok",
    name: "Гром-Рок",
    race: "Полуорк",
    className: "Варвар",
    level: 7,
  }),
];

type Panel = "L-01" | "L-02" | "L-03" | "L-04" | "L-05";

const panels: Array<{ id: Panel; note: string }> = [
  { id: "L-01", note: "Пустой (первый вход)" },
  { id: "L-02", note: "Список персонажей" },
  { id: "L-03", note: "Create — имя" },
  { id: "L-04", note: "Import JSON review" },
  { id: "L-05", note: "Delete confirm" },
];

export default function ListPreview() {
  const [panel, setPanel] = useState<Panel>("L-01");
  const [createOpen, setCreateOpen] = useState(false);
  const [review, setReview] = useState<ImportReviewState | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Character | null>(null);

  return (
    <div className="min-h-screen bg-paper-2 text-ink-900 font-ds-sans">
      <header className="border-b border-ink-200 bg-paper-card px-6 py-4">
        <div className={`${typeClass("label")} text-ruby mb-1`}>
          PHASE H2 · LIST
        </div>
        <h1 className={`${typeClass("h1")} text-ink-900`}>
          List screens preview
        </h1>
        <div className={`${typeClass("body-sm")} text-ink-600 mt-1`}>
          L-01..L-05 состояния в изоляции, моки без API.
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          {panels.map((p) => (
            <Button
              key={p.id}
              variant={panel === p.id ? "primary" : "outline"}
              size="sm"
              onClick={() => setPanel(p.id)}
            >
              {p.id} · {p.note}
            </Button>
          ))}
        </div>
      </header>

      <main className="px-6 py-6">
        {panel === "L-01" && (
          <div className="rounded-ds-md border border-ink-200 bg-paper overflow-hidden">
            <EmptyList
              onCreate={() => setCreateOpen(true)}
              onImport={() =>
                setReview({ data: reviewMockData(), filename: "demo.json" })
              }
            />
          </div>
        )}
        {panel === "L-02" && (
          <div className="rounded-ds-md border border-ink-200 bg-paper overflow-hidden">
            <PopulatedList
              characters={MOCKS}
              onOpenCharacter={() => {}}
              onDeleteRequest={(id) =>
                setDeleteTarget(MOCKS.find((c) => c.id === id) ?? null)
              }
              onCreate={() => setCreateOpen(true)}
              onImport={() =>
                setReview({ data: reviewMockData(), filename: "demo.json" })
              }
            />
          </div>
        )}
        {panel === "L-03" && (
          <div className="rounded-ds-md border border-dashed border-ink-300 p-6 max-w-lg">
            <div className={`${typeClass("body-sm")} text-ink-600`}>
              CreateCharacterSheet — BottomSheet. Нажмите чтобы открыть:
            </div>
            <Button
              variant="outline"
              className="mt-3"
              onClick={() => setCreateOpen(true)}
            >
              Открыть «Создать»
            </Button>
          </div>
        )}
        {panel === "L-04" && (
          <div className="rounded-ds-md border border-dashed border-ink-300 p-6 max-w-lg">
            <div className={`${typeClass("body-sm")} text-ink-600`}>
              ImportReviewSheet — превью распарсенного JSON.
            </div>
            <div className="flex gap-2 mt-3 flex-wrap">
              <Button
                variant="outline"
                onClick={() =>
                  setReview({
                    data: reviewMockData(),
                    filename: "valarich.json",
                  })
                }
              >
                Success review
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  setReview({
                    filename: "corrupt.json",
                    error:
                      "Неизвестный формат файла. Поддерживаются: Pocket Charlist JSON, Long Story Short JSON.",
                  })
                }
              >
                Error state
              </Button>
            </div>
          </div>
        )}
        {panel === "L-05" && (
          <div className="rounded-ds-md border border-dashed border-ink-300 p-6 max-w-lg">
            <div className={`${typeClass("body-sm")} text-ink-600`}>
              DeleteConfirmSheet — деструктивный confirm.
            </div>
            <Button
              variant="ruby"
              className="mt-3"
              onClick={() => setDeleteTarget(MOCKS[0])}
            >
              Удалить Валариха
            </Button>
          </div>
        )}
      </main>

      <CreateCharacterSheet
        open={createOpen}
        onOpenChange={setCreateOpen}
        onConfirm={() => setCreateOpen(false)}
      />
      <ImportReviewSheet
        open={review !== null}
        onOpenChange={(open) => {
          if (!open) setReview(null);
        }}
        review={review ?? {}}
        onConfirm={() => setReview(null)}
        onPickAnother={() => {}}
      />
      <DeleteConfirmSheet
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        character={deleteTarget}
        onConfirm={() => setDeleteTarget(null)}
      />
    </div>
  );
}

function buildMock({
  id,
  name,
  race,
  className,
  level,
}: {
  id: string;
  name: string;
  race: string;
  className: string;
  level: number;
}): Character {
  const base = createDefaultCharacter();
  const baseSelection = base.classSelections?.[0];
  return {
    ...base,
    id,
    name,
    race,
    class: className,
    level,
    classes: [{ name: className, level }],
    classSelections: baseSelection
      ? [
          {
            ...baseSelection,
            id: `class-selection-${id}`,
            className,
            level,
          },
        ]
      : [],
    currentHp: base.maxHp,
    userId: "preview",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  } as unknown as Character;
}

function reviewMockData(): InsertCharacter {
  return {
    ...createDefaultCharacter(),
    name: "Импортированный герой",
    race: "Эльф",
    class: "Волшебник",
    level: 4,
  };
}
