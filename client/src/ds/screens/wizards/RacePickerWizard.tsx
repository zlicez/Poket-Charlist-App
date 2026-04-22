import { useMemo, useState } from "react";
import { ArrowLeft, Check, ChevronRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { BottomSheet } from "@/ds/hero";
import { Button, Chip, InputField, Tag } from "@/ds/primitives";
import { typeClass } from "@/ds/tokens";
import { useDiscreteCharacterUpdate } from "@/hooks/character/useDiscreteCharacterUpdate";
import {
  ABILITY_LABELS,
  RACE_DATA,
  type AbilityName,
  type Character,
  type RaceDefinition,
  type SubraceDefinition,
} from "@shared/schema";

/**
 * S-08 — Race picker wizard. Handoff 03-screens.jsx S-08 + §7.2.
 *
 * MVP (2 steps, compact):
 *   Step 1: search + race grid с описанием + ability bonuses
 *   Step 2: subrace picker (если есть) + apply
 *
 * Apply: PATCH { race, subrace?, raceSelections: {} } — очищает любые
 * subrace-зависимые выборы (languages, flexible bonuses) чтобы не тащить
 * левачок. Заполнение повторных выборов — в следующей итерации edit-mode,
 * когда будут DS-native FlexibleRaceBonusesEditor + LanguageChoiceEditor
 * (пока переиспользовать — Phase I polish).
 *
 * Keyed-ops не нужны — race-change это one-shot root-level patch.
 */

export function RacePickerWizard({
  open,
  onOpenChange,
  character,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  character: Character;
}) {
  const commit = useDiscreteCharacterUpdate(character.id);
  const [step, setStep] = useState<1 | 2>(1);
  const [search, setSearch] = useState("");
  const [pickedRaceKey, setPickedRaceKey] = useState<string | null>(null);
  const [pickedSubrace, setPickedSubrace] = useState<string | null>(null);

  const races = useMemo(() => {
    const q = search.trim().toLowerCase();
    return Object.entries(RACE_DATA)
      .filter(([, def]) => !q || def.name.toLowerCase().includes(q))
      .sort(([a], [b]) => a.localeCompare(b, "ru"));
  }, [search]);

  const pickedRace = pickedRaceKey ? RACE_DATA[pickedRaceKey] : null;
  const subraces: SubraceDefinition[] =
    pickedRace?.subraces ? Object.values(pickedRace.subraces) : [];

  const hasSubraceStep = Boolean(pickedRace && subraces.length > 0);

  const reset = () => {
    setStep(1);
    setSearch("");
    setPickedRaceKey(null);
    setPickedSubrace(null);
  };

  const handleRacePick = (raceKey: string) => {
    setPickedRaceKey(raceKey);
    const def = RACE_DATA[raceKey];
    if (def.subraces && Object.values(def.subraces).length > 0) {
      setStep(2);
    } else {
      applyPatch(raceKey, null);
    }
  };

  const applyPatch = (raceKey: string, subrace: string | null) => {
    const race = RACE_DATA[raceKey].name;
    commit.mutate({
      race,
      subrace: subrace ?? "",
      raceSelections: {},
      selectedRacialAbilityBonuses: undefined,
    });
    reset();
    onOpenChange(false);
  };

  const applyStep2 = () => {
    if (!pickedRaceKey) return;
    applyPatch(pickedRaceKey, pickedSubrace);
  };

  return (
    <BottomSheet
      open={open}
      onOpenChange={(o) => {
        if (!o) reset();
        onOpenChange(o);
      }}
      title={
        <span className="inline-flex items-center gap-2">
          {step === 2 && (
            <button
              type="button"
              onClick={() => setStep(1)}
              className="inline-flex items-center justify-center w-6 h-6 rounded-full text-ink-700 hover:bg-ink-100"
              aria-label="Назад"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          Выбор расы
        </span>
      }
      description={
        step === 1
          ? `Текущая: ${character.race}${character.subrace ? ` · ${character.subrace}` : ""}`
          : pickedRace
            ? `${pickedRace.name} — выбери подрасу`
            : undefined
      }
    >
      {step === 1 ? (
        <Step1RaceList
          search={search}
          setSearch={setSearch}
          races={races}
          currentRace={character.race}
          onPick={handleRacePick}
        />
      ) : (
        <Step2Subrace
          race={pickedRace}
          subraces={subraces}
          picked={pickedSubrace}
          setPicked={setPickedSubrace}
          onCancel={() => setStep(1)}
          onApply={applyStep2}
        />
      )}

      {/* Step1 has an inline «Пропустить» option if you want to keep subrace empty (cases like Human) */}
      {step === 1 && hasSubraceStep && pickedRaceKey && (
        <div className={cn(typeClass("caption"), "text-ink-500 mt-2 text-center")}>
          Следующий шаг — подраса для {pickedRace?.name}.
        </div>
      )}
    </BottomSheet>
  );
}

// ─── Step 1: race list ──────────────────────────────────────────────────────

function Step1RaceList({
  search,
  setSearch,
  races,
  currentRace,
  onPick,
}: {
  search: string;
  setSearch: (v: string) => void;
  races: [string, RaceDefinition][];
  currentRace: string;
  onPick: (key: string) => void;
}) {
  return (
    <>
      <InputField
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Поиск по названию…"
        wrapperClassName="mt-2"
      />

      <div className="mt-3 rounded-ds-md border border-ink-200 bg-paper-card overflow-hidden">
        {races.length === 0 ? (
          <div className="p-5 text-center">
            <div className={cn(typeClass("body-sm"), "text-ink-500")}>
              Ничего не найдено.
            </div>
          </div>
        ) : (
          races.slice(0, 30).map(([key, def], i) => {
            const isCurrent = def.name === currentRace;
            return (
              <button
                key={key}
                type="button"
                onClick={() => onPick(key)}
                className={cn(
                  "w-full flex items-start gap-3 px-3 py-3 text-left",
                  "transition-colors duration-150",
                  "focus:outline-none focus-visible:ring-[3px] focus-visible:ring-ruby-bg",
                  "hover:bg-paper-2 active:bg-ink-100",
                  i < Math.min(races.length, 30) - 1 && "border-b border-ink-100",
                  isCurrent && "bg-ruby-bg/40",
                )}
                data-testid={`race-pick-${key}`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-ds-sans text-[14px] font-semibold">
                      {def.name}
                    </span>
                    {isCurrent && <Tag variant="ruby">текущая</Tag>}
                    {def.size && <Tag>{def.size}</Tag>}
                    {def.darkvision && (
                      <Tag variant="ocean">тёмн. зр. {def.darkvision}ф</Tag>
                    )}
                  </div>
                  <div className={cn(typeClass("caption"), "text-ink-500 mt-0.5 line-clamp-2")}>
                    {def.description}
                  </div>
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {formatAbilityBonuses(def).map((b) => (
                      <Chip key={b} variant="gold">
                        {b}
                      </Chip>
                    ))}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-ink-400 shrink-0 mt-1" />
              </button>
            );
          })
        )}
        {races.length > 30 && (
          <div className="px-3 py-2 bg-paper-2 text-center">
            <div className={cn(typeClass("caption"), "text-ink-500")}>
              Показано 30 из {races.length}. Уточни поиск.
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// ─── Step 2: subrace ────────────────────────────────────────────────────────

function Step2Subrace({
  race,
  subraces,
  picked,
  setPicked,
  onCancel,
  onApply,
}: {
  race: RaceDefinition | null;
  subraces: SubraceDefinition[];
  picked: string | null;
  setPicked: (v: string | null) => void;
  onCancel: () => void;
  onApply: () => void;
}) {
  if (!race) return null;

  return (
    <>
      <div className="mt-2 rounded-ds-md border border-ink-200 bg-paper-card overflow-hidden">
        {subraces.map((sr, i) => {
          const isPicked = picked === sr.name;
          return (
            <button
              key={sr.id ?? sr.name}
              type="button"
              onClick={() => setPicked(sr.name)}
              className={cn(
                "w-full flex items-start gap-3 px-3 py-3 text-left",
                "focus:outline-none focus-visible:ring-[3px] focus-visible:ring-ruby-bg",
                "hover:bg-paper-2 active:bg-ink-100",
                i < subraces.length - 1 && "border-b border-ink-100",
                isPicked && "bg-ruby-bg/40",
              )}
              data-testid={`subrace-pick-${sr.name}`}
            >
              <div
                className={cn(
                  "w-4 h-4 rounded-full border-2 shrink-0 mt-0.5",
                  isPicked
                    ? "bg-ruby border-ruby"
                    : "border-ink-300 bg-transparent",
                )}
              />
              <div className="flex-1 min-w-0">
                <div className="font-ds-sans text-[14px] font-semibold">{sr.name}</div>
                {sr.description && (
                  <div className={cn(typeClass("caption"), "text-ink-500 mt-0.5")}>
                    {sr.description}
                  </div>
                )}
                {Object.keys(sr.abilityBonuses ?? {}).length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {formatBonusesFromRecord(
                      sr.abilityBonuses as Record<string, number>,
                    ).map((b) => (
                      <Chip key={b} variant="gold">
                        {b}
                      </Chip>
                    ))}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex gap-2.5 mt-3.5">
        <Button variant="outline" className="flex-1" onClick={onCancel}>
          Назад
        </Button>
        <Button
          variant="primary"
          className="flex-1"
          disabled={!picked}
          onClick={onApply}
          data-testid="subrace-apply"
        >
          <Check className="w-4 h-4" />
          Применить
        </Button>
      </div>
    </>
  );
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatAbilityBonuses(def: RaceDefinition): string[] {
  const b = def.abilityBonuses as Record<string, number> | undefined;
  if (!b) return [];
  return formatBonusesFromRecord(b);
}

function formatBonusesFromRecord(rec: Record<string, number>): string[] {
  return Object.entries(rec)
    .filter(([, v]) => v && v !== 0)
    .map(([k, v]) => {
      const label = ABILITY_LABELS[k as AbilityName]?.en?.slice(0, 3).toUpperCase() ?? k;
      return `${label} ${v > 0 ? "+" : ""}${v}`;
    });
}
