import { Redirect, useLocation, useParams } from "wouter";
import { useState } from "react";

import { cn } from "@/lib/utils";
import { useMediaQuery } from "@/hooks/use-media-query";
import { useCharacterState } from "@/hooks/character/useCharacterState";
import { resolveClassState } from "@shared/schema";

import { DesktopShell, MobileShell, type TabId } from "@/ds/layout";
import { typeClass } from "@/ds/tokens";
import { CombatTab } from "@/ds/screens/combat/CombatTab";
import { SheetTab } from "@/ds/screens/sheet/SheetTab";
import { SpellsTab } from "@/ds/screens/spells/SpellsTab";
import { BagTab } from "@/ds/screens/bag/BagTab";
import {
  ActionsMenuSheet,
  ExportMenuSheet,
  NotFoundScreen,
  ServerErrorScreen,
  SharePanelSheet,
} from "@/ds/screens/edge";

/**
 * CharacterScreen — верхний orchestrator экрана персонажа.
 *
 * Routing:
 *   /character/:id          → redirect /character/:id/combat
 *   /character/:id/:tab     → tab in { combat | sheet | spells | bag }
 *
 * Layout choice (viewport):
 *   ≥ 1080px → DesktopShell (3 колонки + sidebar, tab URL игнорируется
 *              на этом этапе — single-page scroll)
 *   <  1080px → MobileShell + активный таб из URL
 */

const VALID_TABS: TabId[] = ["combat", "sheet", "spells", "bag"];

function isValidTab(v: string | undefined): v is TabId {
  return typeof v === "string" && (VALID_TABS as string[]).includes(v);
}

export function CharacterLandingRedirect() {
  const { id } = useParams<{ id: string }>();
  if (!id) return null;
  return <Redirect to={`/character/${id}/combat`} />;
}

export default function CharacterScreen() {
  const { id, tab } = useParams<{ id: string; tab?: string }>();
  const isDesktop = useMediaQuery("(min-width: 1080px)");

  if (!id) return null;

  const activeTab: TabId = isValidTab(tab) ? tab : "combat";

  return (
    <CharacterScreenBody id={id} activeTab={activeTab} isDesktop={isDesktop} />
  );
}

function Avatar({ seed, size = 34 }: { seed?: string; size?: number }) {
  const initials = (seed ?? "??").slice(0, 2).toUpperCase();
  return (
    <div
      className={cn(
        "rounded-full bg-ruby-bg border-2 border-ruby-soft text-ruby",
        "flex items-center justify-center font-ds-serif font-medium",
      )}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
      aria-hidden
    >
      {initials}
    </div>
  );
}

function CharacterScreenBody({
  id,
  activeTab,
  isDesktop,
}: {
  id: string;
  activeTab: TabId;
  isDesktop: boolean;
}) {
  const [, setLocation] = useLocation();
  const { character, isLoading, error } = useCharacterState(id);
  const [shareOpen, setShareOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);

  if (error) {
    const status = parseStatusFromError(error);
    // 404 / 410 — персонажа нет (X-06).
    if (status === 404 || status === 410) {
      return <NotFoundScreen onCta={() => setLocation("/")} />;
    }
    // 5xx — server error (X-07) с retry.
    if (typeof status === "number" && status >= 500) {
      return (
        <ServerErrorScreen
          statusCode={status}
          onRetry={() => window.location.reload()}
          onBack={() => setLocation("/")}
        />
      );
    }
    // Прочие ошибки — generic 500 без status code.
    return (
      <ServerErrorScreen
        title="Не удалось загрузить персонажа"
        description={(error as Error).message}
        onRetry={() => window.location.reload()}
        onBack={() => setLocation("/")}
      />
    );
  }

  if (isLoading || !character) {
    return (
      <div className="min-h-dvh flex items-center justify-center bg-paper text-ink-500 font-ds-sans">
        Загрузка персонажа…
      </div>
    );
  }

  const classState = resolveClassState(character);
  const hasSpellcasting = Boolean(classState.spellcasting.hasSpellcasting);

  const charLevel = character.classes?.reduce((sum, c) => sum + c.level, 0) ?? character.level;
  const primaryClass = character.classes?.[0]?.name ?? character.class;
  const subtitle = `${primaryClass} ${charLevel}`;
  const avatar = <Avatar seed={character.name} />;

  const sheets = (
    <>
      <SharePanelSheet
        open={shareOpen}
        onOpenChange={setShareOpen}
        characterId={id}
        characterName={character.name}
      />
      <ExportMenuSheet
        open={exportOpen}
        onOpenChange={setExportOpen}
        character={character}
      />
      <ActionsMenuSheet
        open={actionsOpen}
        onOpenChange={setActionsOpen}
        onShare={() => setShareOpen(true)}
        onExport={() => setExportOpen(true)}
      />
    </>
  );

  if (isDesktop) {
    return (
      <>
      <DesktopShell
        characterId={id}
        characterName={character.name}
        subtitle={subtitle}
        avatar={<Avatar seed={character.name} size={36} />}
        onShare={() => setShareOpen(true)}
        onExport={() => setExportOpen(true)}
        sections={[
          { id: "ds-section-identity", label: "Общее" },
          { id: "ds-section-combat", label: "Бой и HP" },
          { id: "ds-section-sheet", label: "Характеристики" },
          ...(hasSpellcasting
            ? [{ id: "ds-section-spells", label: "Заклинания" }]
            : []),
          { id: "ds-section-bag", label: "Снаряжение" },
        ]}
        left={
          <section id="ds-section-identity" className="space-y-3">
            <div className={`${typeClass("label")} text-ink-500`}>ИДЕНТИЧНОСТЬ</div>
            <div className="rounded-ds-md border border-ink-200 bg-paper-card p-4">
              <div className={typeClass("h1")}>{character.name}</div>
              <div className={`${typeClass("body-sm")} text-ink-600`}>
                {character.race} · {primaryClass} {character.subclass ? `· ${character.subclass}` : ""}
              </div>
            </div>
            <SheetTab characterId={id} />
          </section>
        }
        center={
          <section id="ds-section-combat" className="space-y-3">
            <div className={`${typeClass("label")} text-ink-500`}>БОЙ</div>
            <CombatTab characterId={id} />
          </section>
        }
        right={
          <div className="space-y-6">
            <section id="ds-section-sheet" className="space-y-3">
              <div className={`${typeClass("label")} text-ink-500`}>ЛИСТ</div>
              <div className="rounded-ds-md border border-dashed border-ink-300 p-4 text-center text-ink-600 text-[13px]">
                Phase E2: навыки и способности.
              </div>
            </section>
            {hasSpellcasting && (
              <section id="ds-section-spells" className="space-y-3">
                <div className={`${typeClass("label")} text-ink-500`}>МАГИЯ</div>
                <SpellsTab characterId={id} />
              </section>
            )}
            <section id="ds-section-bag" className="space-y-3">
              <div className={`${typeClass("label")} text-ink-500`}>СУМКА</div>
              <BagTab characterId={id} />
            </section>
          </div>
        }
      />
      {sheets}
      </>
    );
  }

  return (
    <>
    <MobileShell
      onOverflow={() => setActionsOpen(true)}
      characterId={id}
      characterName={character.name}
      subtitle={subtitle}
      avatar={avatar}
      showSpellsTab={hasSpellcasting}
    >
      {activeTab === "combat" && <CombatTab characterId={id} />}
      {activeTab === "sheet" && <SheetTab characterId={id} />}
      {activeTab === "spells" && hasSpellcasting && <SpellsTab characterId={id} />}
      {activeTab === "spells" && !hasSpellcasting && (
        <div className="p-6 text-center text-ink-500">
          Этот персонаж не владеет заклинаниями.
        </div>
      )}
      {activeTab === "bag" && <BagTab characterId={id} />}
    </MobileShell>
    {sheets}
    </>
  );
}

function parseStatusFromError(err: unknown): number | null {
  if (!(err instanceof Error) || !err.message) return null;
  const match = err.message.match(/^(\d{3})\b/);
  if (!match) return null;
  const code = Number.parseInt(match[1], 10);
  return Number.isFinite(code) ? code : null;
}
