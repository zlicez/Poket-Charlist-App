/**
 * Dev-страница: AbilityTile + HPWidget + ListRow + BottomSheet (Phase C).
 * Доступна по /ds-hero при VITE_NEW_DS=true.
 */
import { useState } from "react";
import { Sword, Swords } from "lucide-react";

import { AbilityTile, BottomSheet, HPWidget, ListRow } from "@/ds/hero";
import { Button, Chip, Tag } from "@/ds/primitives";
import { typeClass } from "@/ds/tokens";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <h2 className={`${typeClass("h2")} text-ink-900 mb-4`}>{title}</h2>
      {children}
    </section>
  );
}

export default function HeroPreview() {
  const [currentHp, setCurrentHp] = useState(24);
  const [temp, setTemp] = useState(3);
  const [damageOpen, setDamageOpen] = useState(false);
  const [damageInput, setDamageInput] = useState("");

  const applyDamage = (n: number) => {
    setCurrentHp((c) => {
      const consumedTemp = Math.min(temp, n);
      setTemp((t) => t - consumedTemp);
      return Math.max(0, c - (n - consumedTemp));
    });
    setDamageOpen(false);
    setDamageInput("");
  };

  return (
    <div className="min-h-screen bg-paper text-ink-900 font-ds-sans p-6 sm:p-10">
      <header className="mb-10 max-w-4xl">
        <div className={`${typeClass("label")} text-ruby mb-2`}>PHASE C · HERO</div>
        <h1 className={`${typeClass("display-lg")} text-ink-900`}>DS hero components</h1>
        <p className={`${typeClass("body")} text-ink-600 mt-3 max-w-2xl`}>
          AbilityTile, HPWidget, ListRow, BottomSheet. Сложные компоненты с
          основной «бумажностью» дизайна.
        </p>
      </header>

      <Section title="AbilityTile (6 tiles)">
        <div className="grid grid-cols-3 gap-2 max-w-md">
          <AbilityTile label="СИЛ" modifier={3} score={16} onPress={() => alert("СИЛ roll")} />
          <AbilityTile label="ЛОВ" modifier={1} score={12} hasSaveProficiency onPress={() => alert("ЛОВ")} />
          <AbilityTile label="ТЕЛ" modifier={2} score={14} hasSaveProficiency />
          <AbilityTile label="ИНТ" modifier={-1} score={8} />
          <AbilityTile label="МДР" modifier={0} score={10} />
          <AbilityTile label="ХАР" modifier={4} score={18} hasSaveProficiency onLongPress={() => alert("ХАР long-press")} />
        </div>
        <p className={`${typeClass("caption")} text-ink-500 mt-3`}>
          Tap → ролл · long-press на ХАР → alert · ruby-dot = профиценция.
        </p>
      </Section>

      <Section title="HPWidget (все состояния)">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-3xl">
          <HPWidget
            current={currentHp}
            max={32}
            temp={temp}
            onDamage={() => setDamageOpen(true)}
            onHeal={() => setCurrentHp((c) => Math.min(32, c + 5))}
            onSetTemp={() => setTemp(5)}
          />
          <HPWidget current={28} max={32} temp={0} stateOverride="healthy" onDamage={() => {}} />
          <HPWidget current={12} max={32} temp={0} stateOverride="wounded" onDamage={() => {}} onHeal={() => {}} />
          <HPWidget current={4} max={32} temp={0} stateOverride="critical" onDamage={() => {}} onHeal={() => {}} />
          <HPWidget current={0} max={32} temp={0} stateOverride="downed" onHeal={() => setCurrentHp(10)} />
        </div>
        <p className={`${typeClass("caption")} text-ink-500 mt-3`}>
          Первый виджет интерактивный: damage → opens bottom sheet. Heal +5. Long-press на число → temp=5.
        </p>
      </Section>

      <Section title="ListRow (play vs swipe)">
        <div className="max-w-md bg-paper-card border border-ink-200 rounded-ds-md overflow-hidden">
          <ListRow
            left={<Sword className="w-4 h-4 text-ink-600" />}
            title="Длинный меч"
            subtitle="1d8+3 · рубящий · универсальное"
            right={
              <>
                <Button size="sm" variant="outline">
                  атк +5
                </Button>
                <Button size="sm" variant="ruby">
                  1d8+3
                </Button>
              </>
            }
          />
          <ListRow
            left={<Swords className="w-4 h-4 text-ink-600" />}
            title="Короткий лук"
            subtitle="1d6+2 · колющий · дальнобойное"
            right={
              <>
                <Button size="sm" variant="outline">
                  атк +4
                </Button>
                <Button size="sm" variant="ruby">
                  1d6+2
                </Button>
              </>
            }
            swipeActions={{
              onEdit: () => alert("edit"),
              onDelete: () => alert("delete"),
            }}
          />
          <ListRow
            title="Зелье лечения"
            subtitle="3 шт · расходник"
            right={<Tag variant="sage">на себе</Tag>}
            showChevron
            onPress={() => alert("Zelye press")}
            isLast
          />
        </div>
        <p className={`${typeClass("caption")} text-ink-500 mt-3`}>
          Второй ряд: свайпни влево на мобиле — появятся edit/delete. Третий — tap → alert.
        </p>
      </Section>

      <Section title="BottomSheet (интерактивный)">
        <Button onClick={() => setDamageOpen(true)}>Открыть damage sheet</Button>

        <BottomSheet
          open={damageOpen}
          onOpenChange={setDamageOpen}
          title="Получить урон"
          description="Введите число или жмите +N"
        >
          <div className="flex items-center gap-2 p-3.5 bg-paper-2 rounded-ds-md mt-2">
            <Button variant="outline" size="md" className="w-11 h-11 p-0 text-lg">
              −
            </Button>
            <input
              value={damageInput}
              onChange={(e) => setDamageInput(e.target.value)}
              className="flex-1 text-center font-ds-serif text-2xl px-3 py-2 bg-paper-card border border-ink-300 rounded-ds-md outline-none focus:border-ink-900"
            />
            <Button variant="outline" size="md" className="w-11 h-11 p-0 text-lg">
              +
            </Button>
          </div>
          <div className="grid grid-cols-4 gap-1.5 mt-2.5">
            {[1, 2, 5, 10].map((n) => (
              <Button
                key={n}
                variant="outline"
                size="sm"
                onClick={() => setDamageInput(String((parseInt(damageInput) || 0) + n))}
              >
                +{n}
              </Button>
            ))}
          </div>
          <div className="flex gap-2.5 mt-3.5">
            <Button variant="outline" className="flex-1" onClick={() => setDamageOpen(false)}>
              Отмена
            </Button>
            <Button
              variant="ruby"
              className="flex-1"
              onClick={() => applyDamage(parseInt(damageInput) || 0)}
            >
              Применить {parseInt(damageInput) || 0} урона
            </Button>
          </div>
        </BottomSheet>
      </Section>

      <Section title="Chips + Tag (повторно — в контексте Hero)">
        <div className="flex flex-wrap gap-2 items-center">
          <Chip variant="active">бард</Chip>
          <Chip variant="ruby">концентрация: нет</Chip>
          <Chip>1 ур</Chip>
          <Tag variant="ruby">К</Tag>
          <Tag variant="gold">ритуал</Tag>
        </div>
      </Section>
    </div>
  );
}
