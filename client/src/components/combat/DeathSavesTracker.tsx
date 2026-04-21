import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HelpTooltip, TooltipBody } from "@/components/ui/help-tooltip";
import { Badge } from "@/components/ui/badge";
import { Skull, Check, X, RotateCcw } from "lucide-react";
import { DEATH_SAVES_TOOLTIP } from "@/lib/tooltip-content";
import type { DeathSaves } from "@shared/schema";

export function DeathSavesTracker({
  deathSaves,
  onChange,
  onSetDeathSaves,
  isEditing,
}: {
  deathSaves: DeathSaves;
  onChange: (deathSaves: DeathSaves) => void;
  // Discrete-дорожка (Risk 3). Если передан — все клики идут через него
  // (own useMutation + undo toast). Иначе fallback на onChange (debounced).
  onSetDeathSaves?: (deathSaves: DeathSaves) => void;
  isEditing: boolean;
}) {
  const commit = (next: DeathSaves) => {
    if (onSetDeathSaves) {
      onSetDeathSaves(next);
    } else {
      onChange(next);
    }
  };

  const toggleSuccess = (index: number) => {
    if (isEditing) return;
    const newSuccesses = deathSaves.successes >= index + 1 ? index : index + 1;
    commit({ ...deathSaves, successes: newSuccesses });
  };

  const toggleFailure = (index: number) => {
    if (isEditing) return;
    const newFailures = deathSaves.failures >= index + 1 ? index : index + 1;
    commit({ ...deathSaves, failures: newFailures });
  };

  const reset = () => {
    commit({ successes: 0, failures: 0 });
  };

  const isStabilized = deathSaves.successes >= 3;
  const isDead = deathSaves.failures >= 3;

  return (
    <Card className={`stat-card p-3 transition-colors ${isStabilized ? 'ring-2 ring-positive/50' : ''} ${isDead ? 'ring-2 ring-negative/50' : ''}`} data-testid="stat-death-saves">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Skull className={`w-5 h-5 shrink-0 ${isDead ? 'text-negative' : isStabilized ? 'text-positive' : 'text-muted-foreground'}`} />
          <span className="font-semibold text-sm">Спасброски от смерти</span>
          <HelpTooltip
            content={<TooltipBody title={DEATH_SAVES_TOOLTIP.title} lines={DEATH_SAVES_TOOLTIP.lines} />}
            side="top"
          />
          <div className="w-[120px] shrink-0 flex items-center">
            {isDead ? (
              <Badge variant="default" className="text-xs h-5 px-1.5 bg-negative text-primary-foreground">Мёртв</Badge>
            ) : isStabilized ? (
              <Badge variant="default" className="text-xs h-5 px-1.5 bg-positive text-primary-foreground">Стабилизирован</Badge>
            ) : null}
          </div>
        </div>
        {!isEditing && (
          <Button
            variant="ghost"
            size="icon"
            onClick={reset}
            className={`h-9 w-9 sm:h-7 sm:w-7 ${deathSaves.successes === 0 && deathSaves.failures === 0 ? 'invisible' : ''}`}
            disabled={deathSaves.successes === 0 && deathSaves.failures === 0}
            data-testid="button-reset-death-saves"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Check className="w-4 h-4 text-positive" />
            <span className="text-xs font-medium">Успехи</span>
          </div>
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => {
              const isActive = deathSaves.successes > i;
              return (
                <button
                  key={i}
                  onClick={() => toggleSuccess(i)}
                  className={`w-10 h-10 sm:w-9 sm:h-9 rounded-lg border-2 transition-all flex items-center justify-center ${
                    isActive
                      ? 'bg-positive border-positive text-primary-foreground shadow-md'
                      : 'border-positive/30 hover:border-positive hover:bg-positive-muted'
                  } ${!isEditing ? 'active:scale-95' : 'opacity-50 cursor-not-allowed'}`}
                  disabled={isEditing}
                  data-testid={`button-death-success-${i}`}
                >
                  {isActive && <Check className="w-5 h-5" />}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <X className="w-4 h-4 text-negative" />
            <span className="text-xs font-medium">Провалы</span>
          </div>
          <div className="flex gap-2">
            {[0, 1, 2].map((i) => {
              const isActive = deathSaves.failures > i;
              return (
                <button
                  key={i}
                  onClick={() => toggleFailure(i)}
                  className={`w-10 h-10 sm:w-9 sm:h-9 rounded-lg border-2 transition-all flex items-center justify-center ${
                    isActive
                      ? 'bg-negative border-negative text-primary-foreground shadow-md'
                      : 'border-negative/30 hover:border-negative hover:bg-negative-muted'
                  } ${!isEditing ? 'active:scale-95' : 'opacity-50 cursor-not-allowed'}`}
                  disabled={isEditing}
                  data-testid={`button-death-failure-${i}`}
                >
                  {isActive && <X className="w-5 h-5" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </Card>
  );
}
