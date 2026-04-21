import { useEffect } from "react";
import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";

import { cn } from "@/lib/utils";
import { typeClass } from "@/ds/tokens";
import { Tag } from "@/ds/primitives";
import { AbilityTile, HPWidget, formatModifier } from "@/ds/hero";
import {
  ABILITY_NAMES,
  calculateModifier,
  getCharacterClasses,
  getTotalLevel,
  getRacialBonuses,
  type Character,
  type AbilityName,
} from "@shared/schema";
import { queryKeys } from "@shared/constants";

import { NotFoundScreen } from "./NotFoundScreen";

/**
 * X-01 — Shared read-only view (`/shared/:token`). Handoff:
 *   header: name + «класс · level · read-only» + ocean «shared» tag
 *   body: HP card, 3 ability tiles (compact), meta-note
 *
 * README §Interactivity: «auto-refresh every 10s while tab visible; no buttons».
 * Реализовано через refetchInterval + pauseOnHide.
 */

const ABILITY_LABELS_RU: Record<AbilityName, string> = {
  STR: "СИЛ",
  DEX: "ЛОВ",
  CON: "ТЕЛ",
  INT: "ИНТ",
  WIS: "МДР",
  CHA: "ХАР",
};

const AUTO_REFRESH_MS = 10_000;

export default function SharedReadOnlyScreen() {
  const { token } = useParams<{ token: string }>();

  const {
    data: character,
    isLoading,
    error,
    refetch,
  } = useQuery<Character>({
    queryKey: queryKeys.sharedCharacter(token ?? ""),
    enabled: Boolean(token),
    refetchInterval: AUTO_REFRESH_MS,
    refetchIntervalInBackground: false,
    staleTime: AUTO_REFRESH_MS / 2,
  });

  // Document visibility: react-query уже сам паузит refetchInterval когда
  // вкладка невидима (refetchIntervalInBackground=false). Мы лишь триггерим
  // refetch сразу при возврате на вкладку, чтобы показать свежий state
  // пораньше, чем через 10s.
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === "visible") refetch();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [refetch]);

  if (isLoading) {
    return (
      <div
        className="min-h-screen bg-paper flex items-center justify-center"
        data-testid="shared-loading"
      >
        <div className={cn(typeClass("body-sm"), "text-ink-500")}>
          Загружаем лист…
        </div>
      </div>
    );
  }

  if (error || !character) {
    return (
      <NotFoundScreen
        title="Ссылка не работает"
        description="Возможно, владелец отозвал общий доступ или ссылка устарела."
        cta="Открыть приложение"
        onCta={() => {
          window.location.href = "/";
        }}
      />
    );
  }

  const classes = getCharacterClasses(character);
  const level = getTotalLevel(classes);
  const primaryClass =
    classes[0]?.name || character.class || "Персонаж";
  const racialBonuses = getRacialBonuses(
    character.race ?? "",
    character.subrace ?? undefined,
    character.selectedRacialAbilityBonuses,
  );

  return (
    <div className="min-h-screen bg-paper pb-12">
      <header className="sticky top-0 z-40 bg-paper-card/95 backdrop-blur border-b border-ink-200">
        <div className="max-w-[480px] mx-auto px-3.5 py-2.5 flex items-center gap-2">
          <div className="flex-1 min-w-0">
            <div
              className={cn(
                typeClass("body"),
                "text-ink-900 font-semibold truncate",
              )}
              data-testid="shared-name"
            >
              {character.name || "Персонаж"}
            </div>
            <div
              className={cn(typeClass("caption"), "text-ink-500 truncate")}
            >
              {primaryClass.toLowerCase()} {level} · read-only
            </div>
          </div>
          <Tag variant="ocean">shared</Tag>
        </div>
      </header>

      <main className="max-w-[480px] mx-auto px-3.5 pt-4">
        <HPWidget
          current={character.currentHp ?? 0}
          max={character.maxHp ?? 0}
          temp={character.tempHp ?? 0}
        />

        <div
          className={cn(typeClass("label"), "text-ink-500 mt-5 mb-2")}
        >
          ХАРАКТЕРИСТИКИ
        </div>
        <div className="grid grid-cols-3 gap-2">
          {ABILITY_NAMES.map((name) => {
            const base = character.abilityScores[name] ?? 10;
            const selectedBonus =
              character.selectedRacialAbilityBonuses?.[name] ?? 0;
            const customBonus =
              character.customAbilityBonuses?.[name] ?? 0;
            const raceBonus = racialBonuses[name] ?? 0;
            const score =
              base + selectedBonus + customBonus + raceBonus;
            const mod = calculateModifier(score);
            return (
              <AbilityTile
                key={name}
                label={ABILITY_LABELS_RU[name]}
                modifier={mod}
                score={score}
                hasSaveProficiency={Boolean(character.savingThrows?.[name])}
              />
            );
          })}
        </div>

        <div
          className={cn(
            "mt-5 rounded-ds-md border border-dashed border-ink-300 bg-paper-2",
            "px-3 py-3",
          )}
        >
          <div
            className={cn(typeClass("body-sm"), "text-ink-700 leading-[1.5]")}
          >
            Публичная ссылка. Состояние обновляется автоматически раз в 10
            секунд, пока вкладка открыта.
          </div>
          <div
            className={cn(typeClass("caption"), "text-ink-500 mt-2")}
          >
            Чтобы завести своего персонажа —{" "}
            <Link href="/" className="text-ocean hover:underline">
              откройте приложение
            </Link>
            .
          </div>
        </div>

        <div
          className={cn(
            typeClass("caption"),
            "text-ink-400 text-center mt-6",
          )}
        >
          <span data-testid="shared-formatted-mod">
            КД {character.armorClass ?? "—"} · ИНИЦ{" "}
            {formatModifier(character.initiative ?? 0)} · СКОР{" "}
            {character.speed ?? 30} фт
          </span>
        </div>
      </main>
    </div>
  );
}
