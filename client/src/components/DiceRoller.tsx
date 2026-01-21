import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Dices, X, RotateCcw } from "lucide-react";
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
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsAnimating(false), 500);
    return () => clearTimeout(timer);
  }, [roll.id]);

  const isCritical = roll.dice === "1d20" && roll.results.some(r => r === 20);
  const isFumble = roll.dice === "1d20" && roll.results.some(r => r === 1);

  return (
    <Card className={`p-3 ${isAnimating ? 'rolling' : ''} ${isCritical ? 'ring-2 ring-green-500' : ''} ${isFumble ? 'ring-2 ring-red-500' : ''}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="font-semibold text-sm">{roll.label}</div>
          <div className="text-xs text-muted-foreground flex flex-wrap items-center gap-1 mt-1">
            <span>{roll.dice}</span>
            {roll.isAdvantage && <Badge variant="secondary" className="text-xs py-0">Преимущество</Badge>}
            {roll.isDisadvantage && <Badge variant="secondary" className="text-xs py-0">Помеха</Badge>}
          </div>
        </div>
        <div className={`text-2xl font-bold ${isCritical ? 'text-green-500' : isFumble ? 'text-red-500' : ''}`}>
          {roll.total}
        </div>
      </div>
      
      <div className="mt-2 flex flex-wrap items-center gap-1 text-xs">
        <span className="text-muted-foreground">Кубы:</span>
        {roll.results.map((result, i) => (
          <Badge 
            key={i} 
            variant="outline" 
            className={`${
              roll.dice === "1d20" && result === 20 ? 'bg-green-500/20 border-green-500' : 
              roll.dice === "1d20" && result === 1 ? 'bg-red-500/20 border-red-500' : ''
            } ${
              (roll.isAdvantage && result === Math.max(...roll.results)) ||
              (roll.isDisadvantage && result === Math.min(...roll.results))
                ? 'ring-1 ring-accent'
                : ''
            }`}
          >
            {result}
          </Badge>
        ))}
        {roll.modifier !== 0 && (
          <>
            <span className="text-muted-foreground">+</span>
            <Badge variant="secondary">{formatModifier(roll.modifier)}</Badge>
          </>
        )}
      </div>
      
      {roll.modifierSources.length > 0 && (
        <div className="mt-1 text-xs text-muted-foreground">
          {roll.modifierSources.join(" + ")}
        </div>
      )}
      
      {isCritical && <div className="mt-1 text-xs text-green-500 font-semibold">Критический успех!</div>}
      {isFumble && <div className="mt-1 text-xs text-red-500 font-semibold">Критический провал!</div>}
    </Card>
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

export function DiceRollerTrigger({ onClick, rollCount }: { onClick: () => void; rollCount: number }) {
  return (
    <Button 
      variant="outline" 
      size="icon" 
      onClick={onClick}
      className="relative dice-glow"
      data-testid="button-dice-roller"
    >
      <Dices className="w-5 h-5" />
      {rollCount > 0 && (
        <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
          {rollCount > 99 ? "99+" : rollCount}
        </Badge>
      )}
    </Button>
  );
}
