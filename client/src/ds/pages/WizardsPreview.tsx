/**
 * Dev-page: LevelUpWizard + RacePickerWizard (Phase F). Нужен для QA
 * пока race picker не прибит к edit-mode header'у.
 *
 * NB: хуки используют useQuery для character data — без валидного
 * characterId страница бесполезна. Показываем подсказку + вход выбирать
 * из списка персонажей.
 */
import { Link, useSearch } from "wouter";
import { useState } from "react";

import { Button } from "@/ds/primitives";
import { typeClass } from "@/ds/tokens";
import { useCharacterState } from "@/hooks/character/useCharacterState";
import { LevelUpWizard } from "@/ds/screens/wizards/LevelUpWizard";
import { RacePickerWizard } from "@/ds/screens/wizards/RacePickerWizard";

export default function WizardsPreview() {
  const search = useSearch();
  const qs = new URLSearchParams(search);
  const id = qs.get("id");
  return (
    <div className="min-h-screen bg-paper text-ink-900 font-ds-sans p-6 sm:p-10">
      <header className="mb-8 max-w-2xl">
        <div className={`${typeClass("label")} text-ruby mb-2`}>PHASE F · WIZARDS</div>
        <h1 className={`${typeClass("display-lg")} text-ink-900`}>Wizards preview</h1>
        <p className={`${typeClass("body")} text-ink-600 mt-3`}>
          LevelUp (S-09, 3 шага) и RacePicker (S-08, 2 шага). Открывать по ссылке
          <code className="mx-1 px-1.5 py-0.5 rounded-ds-sm bg-ink-100 font-ds-mono text-[12px]">
            /ds-wizards?id=&lt;character-id&gt;
          </code>
          — хук <code className="font-ds-mono">useCharacterState</code> сам загрузит
          данные.
        </p>
      </header>

      {id ? (
        <Inner id={id} />
      ) : (
        <div className="rounded-ds-md border border-dashed border-ink-300 p-6 max-w-lg">
          <div className={`${typeClass("body-sm")} text-ink-600`}>
            Добавь query-параметр <code className="font-ds-mono">?id=&lt;character-id&gt;</code>
            в URL, чтобы открыть wizard'ы для конкретного персонажа. Например:{" "}
            <code className="font-ds-mono text-ink-800">
              /ds-wizards?id=2fcd…
            </code>
          </div>
          <Link href="/" className="text-ocean underline text-[13px] mt-3 inline-block">
            ← Список персонажей
          </Link>
        </div>
      )}
    </div>
  );
}

function Inner({ id }: { id: string }) {
  const { character, isLoading, error } = useCharacterState(id);
  const [levelUpOpen, setLevelUpOpen] = useState(false);
  const [raceOpen, setRaceOpen] = useState(false);

  if (error) return <div className="text-ruby">{(error as Error).message}</div>;
  if (isLoading || !character) return <div className="text-ink-500">Загрузка…</div>;

  return (
    <div className="space-y-4 max-w-lg">
      <div className="rounded-ds-md border border-ink-200 bg-paper-card p-4 space-y-2">
        <div className={typeClass("label") + " text-ink-500"}>ПЕРСОНАЖ</div>
        <div className="font-ds-serif text-[22px] font-medium">{character.name}</div>
        <div className={`${typeClass("body-sm")} text-ink-600`}>
          {character.race}
          {character.subrace ? ` · ${character.subrace}` : ""} · {character.class}{" "}
          {character.level} · {character.experience.toLocaleString("ru")} XP
        </div>
        <div className={`${typeClass("body-sm")} text-ink-600`}>
          HP {character.currentHp} / {character.maxHp}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Button variant="primary" onClick={() => setLevelUpOpen(true)}>
          Открыть LevelUpWizard
        </Button>
        <Button variant="outline" onClick={() => setRaceOpen(true)}>
          Открыть RacePickerWizard
        </Button>
      </div>

      <LevelUpWizard
        open={levelUpOpen}
        onOpenChange={setLevelUpOpen}
        character={character}
      />
      <RacePickerWizard
        open={raceOpen}
        onOpenChange={setRaceOpen}
        character={character}
      />
    </div>
  );
}
