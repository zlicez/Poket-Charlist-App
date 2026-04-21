import { useState } from "react";
import { Coins } from "lucide-react";

import { cn } from "@/lib/utils";
import { BottomSheet } from "@/ds/hero";
import { Button, InputField } from "@/ds/primitives";
import { typeClass } from "@/ds/tokens";
import type { Money } from "@shared/schema";

/**
 * S-05 (кошелёк) — 5-монетная сетка. Handoff 03-screens.jsx BagScreen mock:
 *   [ММ] [СМ] [ЭМ] [ЗМ] [ПМ]  — Fraunces 18 цифры + mono label
 *
 * Tap по любой монете → bottom-sheet с +/-/установить значение.
 * Persist через onChange (debounced track — это не high-frequency, OK).
 */

const COIN_LABELS: Record<keyof Money, string> = {
  cp: "ММ",
  sp: "СМ",
  ep: "ЭМ",
  gp: "ЗМ",
  pp: "ПМ",
};
const COIN_FULL: Record<keyof Money, string> = {
  cp: "Медные",
  sp: "Серебряные",
  ep: "Электрумные",
  gp: "Золотые",
  pp: "Платиновые",
};
const COIN_ORDER: (keyof Money)[] = ["cp", "sp", "ep", "gp", "pp"];

export function WalletCard({
  money,
  onChange,
}: {
  money: Money;
  onChange: (money: Money) => void;
}) {
  const [openCoin, setOpenCoin] = useState<keyof Money | null>(null);

  return (
    <>
      <div className="rounded-ds-md border border-ink-200 bg-paper-card p-3">
        <div className="flex items-center gap-2 mb-2">
          <Coins className="w-4 h-4 text-gold" />
          <div className="font-ds-sans text-[13.5px] font-semibold">Кошелёк</div>
        </div>
        <div className="grid grid-cols-5 gap-1.5">
          {COIN_ORDER.map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setOpenCoin(k)}
              className={cn(
                "text-center px-2 py-1.5 rounded-ds-sm",
                "bg-paper-2 border border-ink-200",
                "transition-colors duration-150 active:scale-[0.98]",
                "focus:outline-none focus-visible:ring-[3px] focus-visible:ring-ruby-bg",
                "hover:border-gold-soft",
              )}
              aria-label={`${COIN_FULL[k]}: ${money[k] ?? 0}`}
              data-testid={`wallet-coin-${k}`}
            >
              <div className={cn(typeClass("label"), "text-ink-500")}>
                {COIN_LABELS[k]}
              </div>
              <div className="font-ds-serif text-[18px] font-medium mt-0.5 tabular-nums">
                {money[k] ?? 0}
              </div>
            </button>
          ))}
        </div>
      </div>

      <CoinAdjustSheet
        open={openCoin !== null}
        onOpenChange={(o) => !o && setOpenCoin(null)}
        coin={openCoin}
        money={money}
        onChange={onChange}
      />
    </>
  );
}

function CoinAdjustSheet({
  open,
  onOpenChange,
  coin,
  money,
  onChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coin: keyof Money | null;
  money: Money;
  onChange: (money: Money) => void;
}) {
  const [delta, setDelta] = useState<string>("");

  if (!coin) return null;
  const current = money[coin] ?? 0;
  const parsed = parseInt(delta);
  const deltaValue = Number.isNaN(parsed) ? 0 : parsed;
  const next = Math.max(0, current + deltaValue);

  const apply = () => {
    if (deltaValue === 0) {
      onOpenChange(false);
      return;
    }
    onChange({ ...money, [coin]: next });
    setDelta("");
    onOpenChange(false);
  };

  const setAbsolute = () => {
    if (deltaValue < 0) return;
    onChange({ ...money, [coin]: Math.max(0, deltaValue) });
    setDelta("");
    onOpenChange(false);
  };

  return (
    <BottomSheet
      open={open}
      onOpenChange={(o) => {
        if (!o) setDelta("");
        onOpenChange(o);
      }}
      title={`${COIN_FULL[coin]} · ${COIN_LABELS[coin]}`}
      description={`Сейчас: ${current}`}
    >
      <InputField
        label="Δ или точное значение"
        inputMode="numeric"
        value={delta}
        onChange={(e) => setDelta(e.target.value)}
        hint="Отрицательное число — потратить (например, −5)"
        wrapperClassName="mt-2"
      />

      <div className="grid grid-cols-4 gap-1.5 mt-2">
        {[-10, -1, 1, 10].map((n) => (
          <Button
            key={n}
            variant="outline"
            size="sm"
            onClick={() => setDelta(String((parseInt(delta) || 0) + n))}
            className={n < 0 ? "border-ruby-soft text-ruby" : "border-sage-soft text-sage"}
          >
            {n > 0 ? `+${n}` : n}
          </Button>
        ))}
      </div>

      <div className="mt-3 rounded-ds-md bg-paper-2 p-3 flex items-baseline gap-2">
        <div className={cn(typeClass("label"), "text-ink-500")}>Станет:</div>
        <div className="font-ds-serif text-[24px] font-medium tabular-nums">{next}</div>
      </div>

      <div className="flex gap-2.5 mt-3">
        <Button variant="outline" className="flex-1" onClick={setAbsolute} disabled={deltaValue < 0}>
          Установить {deltaValue}
        </Button>
        <Button variant="primary" className="flex-1" onClick={apply}>
          {deltaValue >= 0 ? "+" : ""}
          {deltaValue} → {next}
        </Button>
      </div>
    </BottomSheet>
  );
}
