import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
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
    id: crypto.randomUUID(),
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
    <Card className={`p-3 ${isCritSuccess ? 'border-green-500 bg-green-500/10' : isCritFail ? 'border-red-500 bg-red-500/10' : ''}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm truncate">{roll.label}</div>
          <div className="text-xs text-muted-foreground mt-0.5">
            {roll.dice}
            {roll.modifier !== 0 && ` ${formatModifier(roll.modifier)}`}
          </div>
        </div>
        <div className={`text-2xl font-bold ${isCritSuccess ? 'text-green-500' : isCritFail ? 'text-red-500' : ''}`}>
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
              className={`${!isUsed ? 'opacity-50 line-through' : ''}`}
            >
              {result}
            </Badge>
          );
        })}
        {roll.modifier !== 0 && (
          <span className="text-sm text-muted-foreground">
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
        <div className={`mt-2 text-xs font-bold ${isCritSuccess ? 'text-green-500' : 'text-red-500'}`}>
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
      className="gap-2"
      data-testid="button-dice-roller"
    >
      <Dices className="w-4 h-4" />
      История
      {rollCount > 0 && (
        <Badge variant="secondary" className="text-xs">
          {rollCount}
        </Badge>
      )}
    </Button>
  );
}

export function DiceRoller({ isOpen, onClose, rollHistory, onClearHistory }: DiceRollerProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Dices className="w-5 h-5 text-accent" />
            История бросков
          </DialogTitle>
          <DialogDescription className="sr-only">
            Просмотр результатов ваших бросков кубов
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto space-y-2 pr-2">
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
            <Button variant="ghost" size="sm" onClick={onClearHistory} data-testid="button-clear-history">
              <RotateCcw className="w-4 h-4 mr-1" />
              Очистить
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
