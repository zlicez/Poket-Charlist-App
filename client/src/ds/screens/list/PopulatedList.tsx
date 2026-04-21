import { cn } from "@/lib/utils";
import { typeClass } from "@/ds/tokens";
import { Button } from "@/ds/primitives";
import type { Character } from "@shared/schema";

import { CharacterCard } from "./CharacterCard";

/**
 * L-02 — Список с персонажами. Handoff 03-screens.jsx «CharList»:
 *   [header: «Мои персонажи» · «N героев»] [settings icon] [primary «+»]
 *   [list of CharacterCard]
 *   [dashed import banner]
 */
export function PopulatedList({
  characters,
  onOpenCharacter,
  onDeleteRequest,
  onCreate,
  onImport,
  isCreating,
  isImporting,
}: {
  characters: Character[];
  onOpenCharacter: (id: string) => void;
  onDeleteRequest: (id: string) => void;
  onCreate: () => void;
  onImport: () => void;
  isCreating?: boolean;
  isImporting?: boolean;
}) {
  const n = characters.length;

  return (
    <div
      className="max-w-[480px] mx-auto px-3.5 pt-3 pb-8"
      data-testid="populated-list"
    >
      <div className="flex items-center gap-2 pb-3">
        <div className="flex-1 min-w-0">
          <h1
            className={cn(
              "font-ds-serif text-[22px] leading-[1.1] font-medium text-ink-900",
            )}
          >
            Мои персонажи
          </h1>
          <div
            className={cn(typeClass("caption"), "text-ink-500 mt-0.5")}
          >
            {n} {pluralHero(n)}
          </div>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={onCreate}
          disabled={isCreating}
          data-testid="list-header-create"
        >
          ＋ Новый
        </Button>
      </div>

      <div className="flex flex-col gap-2.5">
        {characters.map((c) => (
          <CharacterCard
            key={c.id}
            character={c}
            onOpen={() => onOpenCharacter(c.id)}
            onDelete={() => onDeleteRequest(c.id)}
          />
        ))}
      </div>

      <div
        className={cn(
          "mt-4 rounded-ds-md border border-dashed border-ink-300 bg-paper-2",
          "flex items-center gap-2.5 p-3",
        )}
      >
        <div
          className={cn(
            "font-ds-serif text-[20px] leading-none text-ink-500",
          )}
          aria-hidden
        >
          ⇡
        </div>
        <div
          className={cn(
            typeClass("body-sm"),
            "text-ink-600 flex-1 min-w-0 leading-[1.35]",
          )}
        >
          Перенести персонажа из другого сервиса? Импортируйте JSON.
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onImport}
          disabled={isImporting}
          data-testid="list-banner-import"
        >
          Импорт
        </Button>
      </div>
    </div>
  );
}

function pluralHero(n: number): string {
  if (n === 1) return "герой";
  if (n >= 2 && n <= 4) return "героя";
  return "героев";
}
