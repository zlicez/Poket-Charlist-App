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
}

const MONEY_TYPES: { key: keyof Money; label: string; color: string; fullName: string }[] = [
  { key: "pp", label: "ПЗ", color: "text-muted-foreground", fullName: "Платина" },
  { key: "gp", label: "ЗЗ", color: "text-accent", fullName: "Золото" },
  { key: "ep", label: "ЭЗ", color: "text-info", fullName: "Электрум" },
  { key: "sp", label: "СЗ", color: "text-muted-foreground", fullName: "Серебро" },
  { key: "cp", label: "МЗ", color: "text-accent", fullName: "Медь" },
];

export function MoneyBlock({ money, onChange, isEditing }: MoneyBlockProps) {
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

  return (
    <Card className="stat-card p-3" data-testid="money-block">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Coins className="w-5 h-5 text-accent" />
          <span className="text-sm font-semibold">Деньги</span>
        </div>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="text-xs text-muted-foreground font-mono">
              ~{totalGoldValue.toFixed(1)} зм
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>Эквивалент в золотых монетах</p>
          </TooltipContent>
        </Tooltip>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
        {MONEY_TYPES.map(({ key, label, color, fullName }) => (
          <div key={key} className="flex flex-col items-center">
            <Tooltip>
              <TooltipTrigger asChild>
                <span className={`text-xs font-medium ${color}`}>
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
              <div className="flex flex-col items-center gap-0.5">
                <span className="text-sm font-bold font-mono" data-testid={`text-money-${key}`}>
                  {money[key] || 0}
                </span>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 sm:h-8 sm:w-8"
                    onClick={() => adjustMoney(key, -1)}
                    disabled={!money[key]}
                    data-testid={`button-money-${key}-minus`}
                  >
                    <Minus className="w-4 h-4 sm:w-3 sm:h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 sm:h-8 sm:w-8"
                    onClick={() => adjustMoney(key, 1)}
                    data-testid={`button-money-${key}-plus`}
                  >
                    <Plus className="w-4 h-4 sm:w-3 sm:h-3" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
