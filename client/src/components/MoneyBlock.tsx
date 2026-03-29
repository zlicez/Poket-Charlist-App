import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Coins, Plus, Minus } from "lucide-react";
import type { Money } from "@shared/schema";

interface MoneyBlockProps {
  money: Money;
  onChange: (money: Money) => void;
  isEditing: boolean;
  flat?: boolean;
}

const MONEY_TYPES: { key: keyof Money; label: string; coinColor: string; coinBg: string; fullName: string }[] = [
  { key: "pp", label: "ПМ", coinColor: "text-slate-500 dark:text-slate-300", coinBg: "bg-gradient-to-b from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 border-slate-300 dark:border-slate-600", fullName: "Платина" },
  { key: "gp", label: "ЗМ", coinColor: "text-amber-600 dark:text-amber-400", coinBg: "bg-gradient-to-b from-amber-50 to-amber-100 dark:from-amber-900/40 dark:to-amber-900/60 border-amber-300 dark:border-amber-700", fullName: "Золото" },
  { key: "ep", label: "ЭМ", coinColor: "text-blue-500 dark:text-blue-400", coinBg: "bg-gradient-to-b from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-900/50 border-blue-300 dark:border-blue-700", fullName: "Электрум" },
  { key: "sp", label: "СМ", coinColor: "text-gray-500 dark:text-gray-300", coinBg: "bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 border-gray-300 dark:border-gray-600", fullName: "Серебро" },
  { key: "cp", label: "МЗ", coinColor: "text-orange-600 dark:text-orange-400", coinBg: "bg-gradient-to-b from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-900/50 border-orange-300 dark:border-orange-700", fullName: "Медь" },
];

export function MoneyBlock({ money, onChange, isEditing, flat }: MoneyBlockProps) {
  const adjustMoney = (key: keyof Money, delta: number) => {
    const newValue = Math.max(0, (money[key] || 0) + delta);
    onChange({ ...money, [key]: newValue });
  };

  const handleInputChange = (key: keyof Money, value: string) => {
    const numValue = parseInt(value) || 0;
    onChange({ ...money, [key]: Math.max(0, numValue) });
  };

  const totalGoldValue = 
    (money.pp || 0) * 10 + 
    (money.gp || 0) + 
    (money.ep || 0) * 0.5 + 
    (money.sp || 0) * 0.1 + 
    (money.cp || 0) * 0.01;

  const content = (
    <div data-testid="money-block">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Coins className="w-5 h-5 text-accent" />
          <span className="text-sm font-semibold">Деньги</span>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="text-xs text-muted-foreground font-mono bg-muted px-2 py-0.5 rounded">
              ~{totalGoldValue.toFixed(1)} зм
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>Эквивалент в золотых монетах</p>
          </TooltipContent>
        </Tooltip>
      </div>

      <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
        {MONEY_TYPES.map(({ key, label, coinColor, coinBg, fullName }) => (
          <div key={key} className="flex flex-col items-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <span className={`text-[10px] sm:text-xs font-bold ${coinColor} uppercase tracking-wide mb-1`}>
                  {label}
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>{fullName}</p>
              </TooltipContent>
            </Tooltip>

            {isEditing ? (
              <Input
                type="number"
                inputMode="numeric"
                min={0}
                value={money[key] || 0}
                onChange={(e) => handleInputChange(key, e.target.value)}
                className="h-10 text-center text-sm font-mono p-1"
                data-testid={`input-money-${key}`}
              />
            ) : (
              <div className="flex flex-col items-center gap-1 w-full">
                <div className={`
                  w-full py-1.5 rounded-md border text-center
                  ${coinBg}
                `}>
                  <span className={`text-sm sm:text-base font-bold font-mono ${coinColor}`} data-testid={`text-money-${key}`}>
                    {money[key] || 0}
                  </span>
                </div>
                <div className="flex gap-0.5 w-full">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-full min-w-0 flex-1"
                    onClick={() => adjustMoney(key, -1)}
                    disabled={!money[key]}
                    data-testid={`button-money-${key}-minus`}
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-full min-w-0 flex-1"
                    onClick={() => adjustMoney(key, 1)}
                    data-testid={`button-money-${key}-plus`}
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  if (flat) return content;

  return <Card className="stat-card p-3">{content}</Card>;
}
