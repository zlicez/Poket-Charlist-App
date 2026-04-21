/**
 * Dev-страница: swatch'и всех DS-токенов. Точка верификации Phase A — если
 * цвета/radii/shadow/шрифты отрендерились корректно, токены и Tailwind-
 * extend правильно связаны через CSS-переменные.
 *
 * Доступна по пути /ds-tokens при VITE_NEW_DS=true (см. NewRouter).
 */
import {
  INK_STEPS,
  RADIUS_STEPS,
  SEMANTIC_COLORS,
  SHADOW_LEVELS,
  TYPE_SCALE,
  typeClass,
  type TypeScaleKey,
} from "@/ds/tokens";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className={`${typeClass("h2")} text-ink-900 mb-4`}>{title}</h2>
      {children}
    </section>
  );
}

function Swatch({
  bg,
  name,
  value,
  textColor = "text-ink-900",
}: {
  bg: string;
  name: string;
  value: string;
  textColor?: string;
}) {
  return (
    <div className="border border-ink-200 rounded-ds-md overflow-hidden bg-paper-card">
      <div className={`h-16 ${bg}`} />
      <div className="p-2">
        <div className={`${typeClass("caption")} ${textColor}`}>{name}</div>
        <div className={`${typeClass("code")} text-ink-500`}>{value}</div>
      </div>
    </div>
  );
}

export default function TokensPreview() {
  return (
    <div className="min-h-screen bg-paper text-ink-900 font-ds-sans p-6 sm:p-10">
      <header className="mb-10 max-w-4xl">
        <div className={`${typeClass("label")} text-ruby mb-2`}>PHASE A · TOKENS PREVIEW</div>
        <h1 className={`${typeClass("display-lg")} text-ink-900`}>DS tokens preview</h1>
        <p className={`${typeClass("body")} text-ink-600 mt-3 max-w-2xl`}>
          Swatch-страница для верификации Phase A: цвета, радиусы, тени, типография,
          шрифтовые токены из handoff'а. Если что-то не отрендерилось — Tailwind extend
          или tokens.css не связаны корректно.
        </p>
      </header>

      <Section title="Ink (neutrals, warm)">
        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-3">
          {INK_STEPS.map((step) => (
            <Swatch
              key={step}
              bg={`bg-ink-${step}`}
              name={`ink-${step}`}
              value={`var(--ink-${step})`}
            />
          ))}
        </div>
      </Section>

      <Section title="Paper (surfaces)">
        <div className="grid grid-cols-3 gap-3 max-w-md">
          <Swatch bg="bg-paper" name="paper" value="var(--paper)" />
          <Swatch bg="bg-paper-2" name="paper-2" value="var(--paper-2)" />
          <Swatch bg="bg-paper-card" name="paper-card" value="var(--paper-card)" />
        </div>
      </Section>

      <Section title="Semantic accents">
        <div className="space-y-4">
          {SEMANTIC_COLORS.map((color) => (
            <div key={color}>
              <div className={`${typeClass("caption")} text-ink-500 mb-2 uppercase tracking-wider`}>
                {color}
              </div>
              <div className="grid grid-cols-3 gap-3 max-w-md">
                <Swatch bg={`bg-${color}`} name={color} value={`var(--${color})`} />
                {color !== "violet" && (
                  <Swatch
                    bg={`bg-${color}-soft`}
                    name={`${color}-soft`}
                    value={`var(--${color}-soft)`}
                  />
                )}
                <Swatch bg={`bg-${color}-bg`} name={`${color}-bg`} value={`var(--${color}-bg)`} />
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Radii">
        <div className="flex gap-6 items-end">
          {RADIUS_STEPS.map((step) => (
            <div key={step} className="text-center">
              <div
                className={`w-20 h-16 bg-ink-200 border border-ink-300 rounded-ds-${step} mb-2`}
              />
              <div className={`${typeClass("code")} text-ink-600`}>ds-{step}</div>
              <div className={`${typeClass("caption")} text-ink-400`}>
                {step === "sm" ? "6px" : step === "md" ? "10px" : step === "lg" ? "14px" : "20px"}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Shadows">
        <div className="flex gap-8 items-end">
          {SHADOW_LEVELS.map((lvl) => (
            <div key={lvl} className="text-center">
              <div
                className={`w-24 h-16 bg-paper-card rounded-ds-md shadow-ds-${lvl} mb-3`}
              />
              <div className={`${typeClass("code")} text-ink-600`}>shadow-ds-{lvl}</div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Typography">
        <div className="divide-y divide-ink-200">
          {(Object.keys(TYPE_SCALE) as TypeScaleKey[]).map((key) => (
            <div key={key} className="py-4 grid grid-cols-[140px_1fr] gap-6 items-baseline">
              <div className={`${typeClass("label")} text-ink-500`}>{key}</div>
              <div className={typeClass(key)}>
                {key.startsWith("display")
                  ? "Валарих"
                  : key === "h1"
                    ? "Имя персонажа"
                    : key === "h2"
                      ? "Заклинания 1 уровня"
                      : key === "ability-mod"
                        ? "+3"
                        : key === "hp-current"
                          ? "24"
                          : key === "body" || key === "body-sm"
                            ? "Обычный текст абзаца описания способности."
                            : key === "label"
                              ? "Ловкость"
                              : key === "code"
                                ? "1d8+3 · DC 15 · AC 17"
                                : "Caption"}
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Font families">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 border border-ink-200 rounded-ds-md bg-paper-card">
            <div className={`${typeClass("label")} text-ink-500 mb-2`}>ds-sans</div>
            <div className="font-ds-sans text-lg text-ink-900">The quick brown fox</div>
            <div className={`${typeClass("code")} text-ink-500 mt-2`}>Inter Tight</div>
          </div>
          <div className="p-4 border border-ink-200 rounded-ds-md bg-paper-card">
            <div className={`${typeClass("label")} text-ink-500 mb-2`}>ds-serif</div>
            <div className="font-ds-serif text-lg text-ink-900">The quick brown fox</div>
            <div className={`${typeClass("code")} text-ink-500 mt-2`}>Fraunces</div>
          </div>
          <div className="p-4 border border-ink-200 rounded-ds-md bg-paper-card">
            <div className={`${typeClass("label")} text-ink-500 mb-2`}>ds-mono</div>
            <div className="font-ds-mono text-lg text-ink-900">The quick brown fox</div>
            <div className={`${typeClass("code")} text-ink-500 mt-2`}>JetBrains Mono</div>
          </div>
        </div>
      </Section>
    </div>
  );
}
