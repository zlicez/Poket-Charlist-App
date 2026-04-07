import { generateId } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogDescription,
} from "@/components/ui/responsive-dialog";
import { Dices, RotateCcw } from "lucide-react";
import { formatModifier } from "@shared/schema";

export interface DiceRoll {
  id: string;
  type: string;
  label: string;
  dice: string;
  modifier: number;
  modifierSources: string[];
  results: number[];
  total: number;
  timestamp: Date;
  isAdvantage?: boolean;
  isDisadvantage?: boolean;
}

interface DiceRollerProps {
  isOpen: boolean;
  onClose: () => void;
  rollHistory: DiceRoll[];
  onClearHistory: () => void;
}

function parseDice(diceString: string): { count: number; sides: number } {
  const match = diceString.match(/(\d+)?d(\d+)/i);
  if (!match) return { count: 1, sides: 20 };
  return {
    count: parseInt(match[1] || "1"),
    sides: parseInt(match[2]),
  };
}

export function rollDice(
  label: string,
  diceString: string = "1d20",
  modifier: number = 0,
  modifierSources: string[] = [],
  options?: { advantage?: boolean; disadvantage?: boolean }
): DiceRoll {
  const { count, sides } = parseDice(diceString);
  const results: number[] = [];
  
  const rollCount = options?.advantage || options?.disadvantage ? 2 : count;
  
  for (let i = 0; i < rollCount; i++) {
    results.push(Math.floor(Math.random() * sides) + 1);
  }
  
  let diceTotal: number;
  if (options?.advantage) {
    diceTotal = Math.max(...results);
  } else if (options?.disadvantage) {
    diceTotal = Math.min(...results);
  } else {
    diceTotal = results.reduce((a, b) => a + b, 0);
  }
  
  const total = diceTotal + modifier;

  return {
    id: generateId(),
    type: options?.advantage ? "advantage" : options?.disadvantage ? "disadvantage" : "normal",
    label,
    dice: diceString,
    modifier,
    modifierSources,
    results,
    total,
    timestamp: new Date(),
    isAdvantage: options?.advantage,
    isDisadvantage: options?.disadvantage,
  };
}

function DiceResult({ roll }: { roll: DiceRoll }) {
  const { sides } = parseDice(roll.dice);
  const isCritSuccess = sides === 20 && roll.results.some(r => r === 20);
  const isCritFail = sides === 20 && roll.results.some(r => r === 1);

  return (
    <Card className={`p-3 ${isCritSuccess ? 'border-positive bg-positive-muted' : isCritFail ? 'border-negative bg-negative-muted' : ''}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm truncate">{roll.label}</div>
          <div className="text-xs text-muted-foreground mt-0.5 font-mono">
            {roll.dice}
            {roll.modifier !== 0 && ` ${formatModifier(roll.modifier)}`}
          </div>
        </div>
        <div className={`text-2xl font-bold font-mono ${isCritSuccess ? 'text-positive' : isCritFail ? 'text-negative' : ''}`}>
          {roll.total}
        </div>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-1">
        {roll.results.map((result, i) => {
          const isMax = result === sides;
          const isMin = result === 1;
          const isUsed = roll.isAdvantage 
            ? result === Math.max(...roll.results)
            : roll.isDisadvantage 
              ? result === Math.min(...roll.results)
              : true;

          return (
            <Badge 
              key={i} 
              variant={isMax ? "default" : isMin ? "destructive" : "secondary"}
              className={`font-mono ${!isUsed ? 'opacity-50 line-through' : ''}`}
            >
              {result}
            </Badge>
          );
        })}
        {roll.modifier !== 0 && (
          <span className="text-sm text-muted-foreground font-mono">
            {formatModifier(roll.modifier)}
          </span>
        )}
      </div>

      {roll.modifierSources.length > 0 && (
        <div className="mt-2 text-xs text-muted-foreground">
          {roll.modifierSources.join(" + ")}
        </div>
      )}

      {(roll.isAdvantage || roll.isDisadvantage) && (
        <Badge variant="outline" className="mt-2 text-xs">
          {roll.isAdvantage ? "Преимущество" : "Помеха"}
        </Badge>
      )}

      {(isCritSuccess || isCritFail) && (
        <div className={`mt-2 text-xs font-bold ${isCritSuccess ? 'text-positive' : 'text-negative'}`}>
          {isCritSuccess ? "Критический успех!" : "Критический провал!"}
        </div>
      )}
    </Card>
  );
}

export function DiceRollerTrigger({ onClick, rollCount }: { onClick: () => void; rollCount: number }) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      className="gap-2 h-9"
      data-testid="button-dice-roller"
      aria-label="История бросков"
    >
      <Dices className="w-4 h-4" />
      <span className="sm:hidden">Броски</span>
      <span className="hidden sm:inline">История</span>
      {rollCount > 0 && (
        <Badge variant="secondary" className="text-xs font-mono">
          {rollCount}
        </Badge>
      )}
    </Button>
  );
}

export function DiceRoller({ isOpen, onClose, rollHistory, onClearHistory }: DiceRollerProps) {
  return (
    <ResponsiveDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <ResponsiveDialogContent className="max-w-md sm:max-h-[80vh] overflow-hidden flex flex-col">
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle className="flex items-center gap-2">
            <Dices className="w-5 h-5 text-accent" />
            История бросков
          </ResponsiveDialogTitle>
          <ResponsiveDialogDescription className="sr-only">
            Просмотр результатов ваших бросков кубов
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>
        
        <div className="flex-1 overflow-y-auto space-y-2 pr-2 max-h-[50vh] sm:max-h-[60vh]">
          {rollHistory.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <Dices className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Нет бросков</p>
              <p className="text-sm mt-1">Нажмите на характеристику или навык для броска</p>
            </div>
          ) : (
            rollHistory.map((roll) => (
              <DiceResult key={roll.id} roll={roll} />
            ))
          )}
        </div>
        
        {rollHistory.length > 0 && (
          <div className="pt-2 border-t flex justify-end">
            <Button variant="ghost" size="sm" onClick={onClearHistory} className="h-9" data-testid="button-clear-history">
              <RotateCcw className="w-4 h-4 mr-1" />
              Очистить
            </Button>
          </div>
        )}
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
