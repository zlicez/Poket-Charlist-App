import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Check, Dice6, Heart, TrendingUp } from "lucide-react";
import * as DialogPrimitive from "@radix-ui/react-dialog";

import { cn } from "@/lib/utils";
import { Button, Die, Tag } from "@/ds/primitives";
import { typeClass } from "@/ds/tokens";
import { useCommitRest } from "@/hooks/character/useCommitRest";
import {
  getClassDefinitionById,
  getClassDefinitionByName,
  getCharacterClasses,
  getTotalLevel,
  type Character,
} from "@shared/schema";

import {
  averageHpGain,
  buildLevelUpPatch,
  computeConMod,
  computeHpGain,
  getLevelUpFeatures,
  getPrimaryHitDieValue,
  getPrimarySelection,
  rollHitDie,
  type HpChoice,
} from "./level-up-utils";

/**
 * S-09 — Level-up wizard (3 шага). Handoff 03-screens.jsx LevelUpScreen + §7.1.
 *
 * Step 1: HP
 *   Выбор: среднее (default), бросок d{hitDie}, manual input.
 *   Отображается CON mod и итог «+N HP, maxHp → X».
 *
 * Step 2: Features
 *   Список фич из levelGrants[newLevel] + subclass levelGrants.
 *   Всегда show: accordion с описанием. Вручную добавлять в
 *   character.features НЕ нужно — class-engine вычисляет на лету.
 *
 * Step 3: Review
 *   Сводка: +Level, +HP, +Feature count. Одна кнопка «Применить» →
 *   single PATCH через useCommitRest (generic discrete PATCH).
 *
 * Reuse: useCommitRest (повторно используем как generic discrete PATCH hook;
 * в Phase J можно переименовать в useDiscreteCharacterUpdate).
 */

export function LevelUpWizard({
  open,
  onOpenChange,
  character,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  character: Character;
}) {
  const commit = useCommitRest(character.id);
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const [hpChoice, setHpChoice] = useState<HpChoice>("average");
  const [hpRoll, setHpRoll] = useState<number | null>(null);
  const [hpManual, setHpManual] = useState<string>("");
  const [rolling, setRolling] = useState(false);
  const [animVal, setAnimVal] = useState<number | null>(null);
  const animRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalLevel = getTotalLevel(getCharacterClasses(character));
  const newLevel = Math.min(20, totalLevel + 1);
  const primary = getPrimarySelection(character);
  const classDef = primary
    ? (getClassDefinitionById(primary.classId) ??
        getClassDefinitionByName(primary.className) ??
        null)
    : null;
  const hitDie = getPrimaryHitDieValue(character);
  const conMod = computeConMod(character);

  // Определяем hpRollValue — d{hitDie} result (roll) или average pre-CON.
  const hpRollValue =
    hpChoice === "average"
      ? averageHpGain(hitDie)
      : hpChoice === "roll"
        ? (hpRoll ?? 0)
        : Math.max(0, parseInt(hpManual) || 0);

  const hpGain = computeHpGain(hpRollValue, conMod);
  const newMaxHp = character.maxHp + hpGain;
  const features = getLevelUpFeatures(classDef, newLevel, primary);

  useEffect(() => {
    if (open) {
      setStep(1);
      setHpChoice("average");
      setHpRoll(null);
      setHpManual("");
      setRolling(false);
      setAnimVal(null);
    }
    return () => {
      if (animRef.current) clearInterval(animRef.current);
    };
  }, [open]);

  const doRoll = () => {
    if (rolling) return;
    setRolling(true);
    setAnimVal(rollHitDie(hitDie));
    animRef.current = setInterval(() => setAnimVal(rollHitDie(hitDie)), 60);
    setTimeout(() => {
      if (animRef.current) clearInterval(animRef.current);
      const final = rollHitDie(hitDie);
      setHpRoll(final);
      setAnimVal(null);
      setRolling(false);
    }, 500);
  };

  const canProceed = step === 1 ? (hpChoice !== "roll" || hpRoll !== null) : true;

  const apply = () => {
    const patch = buildLevelUpPatch(character, hpGain);
    commit.mutate(patch);
    onOpenChange(false);
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className={cn(
            "fixed inset-0 z-50 bg-ink-900/70",
            "motion-safe:data-[state=open]:animate-in motion-safe:data-[state=open]:fade-in-0",
            "motion-safe:data-[state=closed]:animate-out motion-safe:data-[state=closed]:fade-out-0",
          )}
        />
        <DialogPrimitive.Content
          className={cn(
            "fixed inset-0 z-50 flex flex-col bg-paper text-ink-900 font-ds-sans",
            "motion-safe:data-[state=open]:animate-in motion-safe:data-[state=open]:fade-in-0",
            "motion-safe:data-[state=closed]:animate-out motion-safe:data-[state=closed]:fade-out-0",
          )}
        >
          <DialogPrimitive.Title asChild>
            <header className="flex items-center gap-2 px-4 py-3 border-b border-ink-200 bg-paper-2 flex-shrink-0">
              <Button
                variant="icon"
                size="sm"
                onClick={() => (step === 1 ? onOpenChange(false) : setStep((s) => (s - 1) as 1 | 2 | 3))}
                aria-label="Назад"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <span className="inline-flex items-center gap-2 text-[14px] font-semibold">
                <TrendingUp className="w-4 h-4 text-gold" />
                Повышение уровня
              </span>
              <div className={cn(typeClass("code"), "text-ink-500 ml-auto")}>
                шаг {step}/3
              </div>
            </header>
          </DialogPrimitive.Title>

          {/* Progress bar */}
          <div className="flex gap-1.5 px-4 pt-3 flex-shrink-0">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={cn(
                  "flex-1 h-1 rounded-full",
                  s <= step ? "bg-ruby" : "bg-ink-200",
                )}
              />
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {step === 1 && (
              <Step1Hp
                character={character}
                newLevel={newLevel}
                hitDie={hitDie}
                conMod={conMod}
                hpChoice={hpChoice}
                setHpChoice={setHpChoice}
                hpRoll={hpRoll}
                hpManual={hpManual}
                setHpManual={setHpManual}
                rolling={rolling}
                animVal={animVal}
                doRoll={doRoll}
                hpGain={hpGain}
                newMaxHp={newMaxHp}
              />
            )}

            {step === 2 && (
              <Step2Features features={features} newLevel={newLevel} />
            )}

            {step === 3 && (
              <Step3Review
                character={character}
                newLevel={newLevel}
                hpGain={hpGain}
                newMaxHp={newMaxHp}
                featureCount={features.length}
              />
            )}
          </div>

          <footer className="px-4 py-3 border-t border-ink-200 bg-paper-2 flex gap-2 flex-shrink-0 pb-[max(12px,env(safe-area-inset-bottom))]">
            {step < 3 ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  className="flex-1"
                >
                  Отмена
                </Button>
                <Button
                  variant="primary"
                  disabled={!canProceed}
                  onClick={() => setStep((s) => (s + 1) as 1 | 2 | 3)}
                  className="flex-2"
                  data-testid="level-up-next"
                >
                  Далее: {step === 1 ? "фичи" : "обзор"}
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => setStep(2)}
                  className="flex-1"
                >
                  Назад
                </Button>
                <Button
                  variant="primary"
                  onClick={apply}
                  className="flex-2"
                  data-testid="level-up-apply"
                >
                  <Check className="w-4 h-4" />
                  Применить уровень {newLevel}
                </Button>
              </>
            )}
          </footer>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

// ─── Steps ──────────────────────────────────────────────────────────────────

function Step1Hp({
  character,
  newLevel,
  hitDie,
  conMod,
  hpChoice,
  setHpChoice,
  hpRoll,
  hpManual,
  setHpManual,
  rolling,
  animVal,
  doRoll,
  hpGain,
  newMaxHp,
}: {
  character: Character;
  newLevel: number;
  hitDie: number;
  conMod: number;
  hpChoice: HpChoice;
  setHpChoice: (c: HpChoice) => void;
  hpRoll: number | null;
  hpManual: string;
  setHpManual: (v: string) => void;
  rolling: boolean;
  animVal: number | null;
  doRoll: () => void;
  hpGain: number;
  newMaxHp: number;
}) {
  const conModStr = conMod >= 0 ? `+${conMod}` : `${conMod}`;
  return (
    <>
      <div>
        <div className={cn(typeClass("display-lg"), "text-ink-900")}>
          Очки здоровья
        </div>
        <p className={cn(typeClass("body-sm"), "text-ink-600 mt-1")}>
          {character.class} {character.level} → {newLevel}. Бросок d{hitDie}{" "}
          {conModStr} (ТЕЛ). Минимум — среднее.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-2">
        <HpOption
          active={hpChoice === "average"}
          label="Среднее"
          value={
            <span className="font-ds-serif text-[28px] font-medium">
              +{averageHpGain(hitDie) + conMod}
            </span>
          }
          caption={`${averageHpGain(hitDie)} + ${conMod} (ТЕЛ)`}
          onClick={() => setHpChoice("average")}
        />
        <HpOption
          active={hpChoice === "roll"}
          label="Бросить"
          value={
            rolling && animVal !== null ? (
              <span className="font-ds-serif text-[28px] font-medium text-ruby motion-safe:animate-pulse">
                {animVal}
              </span>
            ) : hpRoll !== null ? (
              <span className="font-ds-serif text-[28px] font-medium">
                +{Math.max(1, hpRoll + conMod)}
              </span>
            ) : (
              <Die sides={hitDie as 4 | 6 | 8 | 10 | 12 | 20} size={32} />
            )
          }
          caption={
            hpRoll !== null
              ? `d${hitDie}(${hpRoll}) + ${conMod} (ТЕЛ)`
              : `d${hitDie} + ${conMod} (ТЕЛ)`
          }
          onClick={() => {
            setHpChoice("roll");
            if (hpRoll === null && !rolling) doRoll();
          }}
          extra={
            hpChoice === "roll" && hpRoll !== null && !rolling ? (
              <Button variant="ghost" size="sm" onClick={doRoll} className="ml-auto">
                <Dice6 className="w-3.5 h-3.5" />
                Перебросить
              </Button>
            ) : null
          }
        />
        <HpOption
          active={hpChoice === "manual"}
          label="Ввести"
          value={
            <input
              inputMode="numeric"
              value={hpManual}
              onFocus={() => setHpChoice("manual")}
              onChange={(e) => setHpManual(e.target.value)}
              placeholder="0"
              className="w-20 text-center font-ds-serif text-[24px] bg-paper-2 border border-ink-300 rounded-ds-sm py-1 outline-none focus:border-ink-900"
            />
          }
          caption="Результат броска вручную"
          onClick={() => setHpChoice("manual")}
        />
      </div>

      <div className="rounded-ds-md bg-paper-2 border border-ink-200 p-3 flex items-center gap-2">
        <Heart className="w-4 h-4 text-ruby shrink-0" />
        <div className="flex-1">
          <div className={cn(typeClass("label"), "text-ink-500")}>Новое макс. HP</div>
          <div className="font-ds-sans text-[14px] font-semibold">
            {character.maxHp} →{" "}
            <span className="font-ds-serif text-[18px] text-sage">{newMaxHp}</span>
            <span className="ml-1 text-sage">(+{hpGain})</span>
          </div>
        </div>
      </div>
    </>
  );
}

function HpOption({
  active,
  label,
  value,
  caption,
  onClick,
  extra,
}: {
  active: boolean;
  label: string;
  value: React.ReactNode;
  caption: string;
  onClick: () => void;
  extra?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 text-left p-3 rounded-ds-md border transition-colors",
        "focus:outline-none focus-visible:ring-[3px] focus-visible:ring-ruby-bg",
        active ? "bg-paper-card border-ink-900" : "bg-paper-card border-ink-200 hover:border-ink-400",
      )}
    >
      <div className={cn(typeClass("label"), active ? "text-ruby" : "text-ink-500", "w-20")}>
        {label}
      </div>
      <div className="min-w-0 flex-1 flex items-center gap-2">{value}</div>
      <div className={cn(typeClass("caption"), "text-ink-500 whitespace-nowrap")}>
        {caption}
      </div>
      {extra}
    </button>
  );
}

function Step2Features({
  features,
  newLevel,
}: {
  features: ReturnType<typeof getLevelUpFeatures>;
  newLevel: number;
}) {
  if (features.length === 0) {
    return (
      <div>
        <div className={cn(typeClass("display-lg"), "text-ink-900")}>Способности</div>
        <p className={cn(typeClass("body-sm"), "text-ink-600 mt-1")}>
          На уровне {newLevel} нет новых классовых фич для выбора. Продолжай.
        </p>
        <div className="mt-6 rounded-ds-md border border-dashed border-ink-300 p-5 text-center">
          <div className={cn(typeClass("body-sm"), "text-ink-500")}>
            Характеристики класса уже в {"<"}Способности{">"} (подкачаются автоматически).
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className={cn(typeClass("display-lg"), "text-ink-900")}>Способности</div>
      <p className={cn(typeClass("body-sm"), "text-ink-600 mt-1")}>
        На уровне {newLevel} ты получаешь:
      </p>
      <div className="mt-4 space-y-2">
        {features.map((f, i) => (
          <div
            key={f.id ?? i}
            className="rounded-ds-md border border-ink-200 bg-paper-card p-3"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <div className="font-ds-sans text-[14px] font-semibold">{f.name}</div>
              {f.optional && <Tag variant="gold">опция</Tag>}
            </div>
            <p className={cn(typeClass("body-sm"), "text-ink-700 whitespace-pre-wrap")}>
              {f.description || "Описание отсутствует."}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Step3Review({
  character,
  newLevel,
  hpGain,
  newMaxHp,
  featureCount,
}: {
  character: Character;
  newLevel: number;
  hpGain: number;
  newMaxHp: number;
  featureCount: number;
}) {
  return (
    <div>
      <div className={cn(typeClass("display-lg"), "text-ink-900")}>Обзор</div>
      <p className={cn(typeClass("body-sm"), "text-ink-600 mt-1")}>
        Всё правильно? После «Применить» изменения ушли на сервер одним патчем.
      </p>

      <div className="mt-4 rounded-ds-md border border-ink-200 bg-paper-card p-4 space-y-3">
        <DiffRow
          label="Уровень"
          before={character.level}
          after={newLevel}
          delta={`+${newLevel - character.level}`}
        />
        <DiffRow
          label="Макс. HP"
          before={character.maxHp}
          after={newMaxHp}
          delta={`+${hpGain}`}
        />
        <DiffRow
          label="Новые способности"
          before="—"
          after={`${featureCount}`}
          delta={featureCount > 0 ? `+${featureCount}` : "0"}
        />
        <DiffRow
          label="Кости хитов"
          before={`${character.hitDiceRemaining ?? 0} / ${character.level}`}
          after={`+1 → ${newLevel}`}
          delta="+1"
        />
      </div>
    </div>
  );
}

function DiffRow({
  label,
  before,
  after,
  delta,
}: {
  label: string;
  before: React.ReactNode;
  after: React.ReactNode;
  delta: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <div className={cn(typeClass("label"), "text-ink-500")}>{label}</div>
      <div className="flex items-baseline gap-2">
        <span className="font-ds-mono text-[12px] text-ink-500">{before}</span>
        <span className="text-ink-400">→</span>
        <span className="font-ds-sans text-[14px] font-semibold text-ink-900">
          {after}
        </span>
        <Tag variant="sage">{delta}</Tag>
      </div>
    </div>
  );
}
