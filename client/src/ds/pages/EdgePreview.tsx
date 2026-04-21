import { useState } from "react";

import { typeClass } from "@/ds/tokens";
import { Button } from "@/ds/primitives";
import {
  ExportMenuSheet,
  NotFoundScreen,
  RateLimitedScreen,
  ServerErrorScreen,
  SharePanelSheet,
} from "@/ds/screens/edge";
import { createDefaultCharacter, type Character } from "@shared/schema";

/**
 * Dev-page: Phase H3 edge states preview. Не требует auth, не бьёт API
 * (кроме share-panel: он использует useQuery, который вернёт 401/ошибку
 * на несуществующий character — для review UI это ок).
 */

type Panel =
  | "X-01"
  | "X-02"
  | "X-03"
  | "X-06"
  | "X-07"
  | "X-08-fixed"
  | "X-08-countdown";

const panels: Array<{ id: Panel; note: string }> = [
  { id: "X-01", note: "Shared /shared/:token" },
  { id: "X-02", note: "Share panel" },
  { id: "X-03", note: "Export menu" },
  { id: "X-06", note: "404 — персонаж" },
  { id: "X-07", note: "500 — server error" },
  { id: "X-08-fixed", note: "429 (без countdown)" },
  { id: "X-08-countdown", note: "429 (с countdown)" },
];

export default function EdgePreview() {
  const [panel, setPanel] = useState<Panel>("X-06");
  const [shareOpen, setShareOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const mockChar = buildMock();

  return (
    <div className="min-h-screen bg-paper-2 text-ink-900 font-ds-sans">
      <header className="border-b border-ink-200 bg-paper-card px-6 py-4">
        <div className={`${typeClass("label")} text-ruby mb-1`}>
          PHASE H3 · EDGE
        </div>
        <h1 className={`${typeClass("h1")} text-ink-900`}>
          Edge states preview
        </h1>
        <div className={`${typeClass("body-sm")} text-ink-600 mt-1`}>
          X-01 shared · X-02 share · X-03 export · X-06/07/08 errors.
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
        {panel === "X-01" && (
          <div className="rounded-ds-md border border-dashed border-ink-300 p-6 max-w-lg">
            <div className={`${typeClass("body-sm")} text-ink-600`}>
              SharedReadOnlyScreen рендерит реальную страницу по
              токену. Здесь превью маршрутизации: откройте{" "}
              <code className="font-ds-mono bg-ink-100 px-1.5 py-0.5 rounded-ds-sm">
                /shared/&lt;token&gt;
              </code>{" "}
              c валидным токеном у залогиненного персонажа.
            </div>
          </div>
        )}
        {panel === "X-02" && (
          <div className="rounded-ds-md border border-dashed border-ink-300 p-6 max-w-lg">
            <div className={`${typeClass("body-sm")} text-ink-600`}>
              SharePanelSheet — BottomSheet с enable/disable/copy.
              Использует useQuery(characterShare) — для превью запрос уйдёт
              к несуществующему character_id и вернёт ошибку. Это ок: UI
              остаётся видимым.
            </div>
            <Button
              variant="outline"
              className="mt-3"
              onClick={() => setShareOpen(true)}
            >
              Открыть Share Panel
            </Button>
          </div>
        )}
        {panel === "X-03" && (
          <div className="rounded-ds-md border border-dashed border-ink-300 p-6 max-w-lg">
            <div className={`${typeClass("body-sm")} text-ink-600`}>
              ExportMenuSheet — 2 варианта (JSON / PDF). PDF-кнопка реально
              генерирует файл — можно скачать прямо из превью.
            </div>
            <Button
              variant="outline"
              className="mt-3"
              onClick={() => setExportOpen(true)}
            >
              Открыть Export Menu
            </Button>
          </div>
        )}
        {panel === "X-06" && (
          <div className="rounded-ds-md border border-ink-200 overflow-hidden">
            <NotFoundScreen />
          </div>
        )}
        {panel === "X-07" && (
          <div className="rounded-ds-md border border-ink-200 overflow-hidden">
            <ServerErrorScreen
              onRetry={() => {}}
              onBack={() => {}}
            />
          </div>
        )}
        {panel === "X-08-fixed" && (
          <div className="rounded-ds-md border border-ink-200 overflow-hidden">
            <RateLimitedScreen onRetry={() => {}} />
          </div>
        )}
        {panel === "X-08-countdown" && (
          <div className="rounded-ds-md border border-ink-200 overflow-hidden">
            <RateLimitedScreen
              retryAfterMs={Date.now() + 6 * 60 * 1000 + 42_000}
              onRetry={() => {}}
            />
          </div>
        )}
      </main>

      <SharePanelSheet
        open={shareOpen}
        onOpenChange={setShareOpen}
        characterId="preview"
        characterName={mockChar.name}
      />
      <ExportMenuSheet
        open={exportOpen}
        onOpenChange={setExportOpen}
        character={mockChar}
      />
    </div>
  );
}

function buildMock(): Character {
  const base = createDefaultCharacter();
  return {
    ...base,
    id: "preview",
    name: "Превью-персонаж",
    userId: "preview",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  } as unknown as Character;
}
