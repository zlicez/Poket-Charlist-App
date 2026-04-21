/**
 * Dev-страница: демо всех DS-primitives. Точка верификации Phase B.
 * Доступна по /ds-primitives при VITE_NEW_DS=true.
 */
import { useState } from "react";

import { Button, Chip, Die, InputField, SlotRow, StatusPill, Tag } from "@/ds/primitives";
import { typeClass } from "@/ds/tokens";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className={`${typeClass("h2")} text-ink-900 mb-4`}>{title}</h2>
      <div className="p-5 border border-dashed border-ink-300 rounded-ds-md bg-paper-2 flex flex-wrap items-center gap-3">
        {children}
      </div>
    </section>
  );
}

export default function PrimitivesPreview() {
  const [slotsUsed, setSlotsUsed] = useState(2);
  const [pactUsed, setPactUsed] = useState(1);
  const [pillState, setPillState] = useState<"saved" | "saving" | "offline">("saved");

  return (
    <div className="min-h-screen bg-paper text-ink-900 font-ds-sans p-6 sm:p-10">
      <header className="mb-10 max-w-4xl">
        <div className={`${typeClass("label")} text-ruby mb-2`}>PHASE B · PRIMITIVES</div>
        <h1 className={`${typeClass("display-lg")} text-ink-900`}>DS primitives preview</h1>
        <p className={`${typeClass("body")} text-ink-600 mt-3 max-w-2xl`}>
          Базовые атомы: Button, InputField, Chip, Tag, StatusPill, SlotRow, Die.
          Все без зависимостей от данных — чистые props.
        </p>
      </header>

      <Section title="Buttons">
        <Button variant="primary">Сохранить</Button>
        <Button variant="outline">Отмена</Button>
        <Button variant="ghost">Скрыть</Button>
        <Button variant="ruby">Удалить</Button>
        <Button variant="primary" size="sm">
          Small
        </Button>
        <Button variant="outline" size="sm">
          Small
        </Button>
        <Button variant="primary" size="lg">
          Large (CTA)
        </Button>
        <Button variant="icon">✎</Button>
        <Button variant="icon" size="sm">
          ×
        </Button>
        <Button variant="primary" disabled>
          Disabled
        </Button>
      </Section>

      <Section title="InputField">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
          <InputField label="Имя персонажа" placeholder="Валарих..." />
          <InputField label="Уровень" defaultValue="3" hint="От 1 до 20" />
          <InputField
            label="С ошибкой"
            defaultValue="abc"
            error="Только числа 1–20"
          />
        </div>
      </Section>

      <Section title="Chips">
        <Chip>По умолчанию</Chip>
        <Chip variant="active">Выбран</Chip>
        <Chip variant="ruby">Концентрация: нет</Chip>
        <Chip variant="gold">Ритуал</Chip>
        <Chip variant="sage">Подготовлено</Chip>
        <Chip variant="ocean">Иллюзия</Chip>
        <Chip variant="violet">Эвокация</Chip>
        <Chip onClick={() => alert("clicked")}>Кликабельный</Chip>
      </Section>

      <Section title="Tags">
        <Tag>PHB</Tag>
        <Tag variant="ruby">Атака</Tag>
        <Tag variant="gold">Ритуал</Tag>
        <Tag variant="sage">Подготовлено</Tag>
        <Tag variant="ocean">Иллюзия</Tag>
        <Tag variant="violet">К</Tag>
      </Section>

      <Section title="StatusPill">
        <StatusPill state="saved" />
        <StatusPill state="saving" />
        <StatusPill state="offline" pendingCount={3} />
        <StatusPill
          state={pillState}
          onClick={() => setPillState(pillState === "saved" ? "saving" : pillState === "saving" ? "offline" : "saved")}
          pendingCount={pillState === "offline" ? 3 : undefined}
        />
      </Section>

      <Section title="SlotRow">
        <div className="flex flex-col gap-2 w-full max-w-sm">
          <SlotRow level={1} used={slotsUsed} max={4} onToggle={(i) => setSlotsUsed(i + (slotsUsed > i ? 0 : 1))} onLongPress={() => setSlotsUsed(0)} />
          <SlotRow level={2} used={0} max={2} onToggle={() => {}} />
          <SlotRow level={3} used={0} max={0} />
          <SlotRow
            label="пакт"
            level="P"
            used={pactUsed}
            max={2}
            onToggle={(i) => setPactUsed(i + (pactUsed > i ? 0 : 1))}
          />
        </div>
      </Section>

      <Section title="Die">
        {([4, 6, 8, 10, 12, 20] as const).map((s) => (
          <Die key={s} sides={s} />
        ))}
        <Die sides={20} value={17} variant="active" />
        <Die sides={10} variant="muted" />
        <Die sides={20} size={48} />
      </Section>
    </div>
  );
}
