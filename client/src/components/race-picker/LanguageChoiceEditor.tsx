import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Globe } from "lucide-react";
import { LANGUAGES, RACE_DATA, type Character } from "@shared/schema";

export function LanguageChoiceEditor({
  character,
  onChange,
}: {
  character: Character;
  onChange: (updates: Partial<Character>) => void;
}) {
  const raceData = RACE_DATA[character.race];
  if (!raceData) return null;

  const choiceSlots = raceData.languages.filter((l) => l === "Один на выбор");
  if (choiceSlots.length === 0) return null;

  const currentChoices =
    (character.raceSelections?.["language-choices"] as string[] | undefined) ?? [];

  // Languages already fixed by the race (non-choice slots)
  const fixedLangs = raceData.languages.filter((l) => l !== "Один на выбор");

  const handleChoiceChange = (index: number, lang: string) => {
    const next = [...currentChoices];
    next[index] = lang;
    onChange({
      raceSelections: {
        ...(character.raceSelections ?? {}),
        "language-choices": next,
      },
    });
  };

  return (
    <div className="rounded-xl border border-border/60 bg-muted/20 p-3 space-y-2">
      <div className="flex items-center gap-1.5">
        <Globe className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-xs font-medium">
          {choiceSlots.length === 1 ? "Дополнительный язык" : `Дополнительные языки (${choiceSlots.length})`}
        </span>
      </div>
      {choiceSlots.map((_, i) => (
        <Select
          key={i}
          value={currentChoices[i] ?? ""}
          onValueChange={(v) => handleChoiceChange(i, v)}
        >
          <SelectTrigger className="h-9 text-sm" data-testid={`select-language-choice-${i}`}>
            <SelectValue placeholder="Выберите язык…" />
          </SelectTrigger>
          <SelectContent>
            {(LANGUAGES as readonly string[]).map((lang) => {
              const usedByOtherSlot = currentChoices.some((c, j) => j !== i && c === lang);
              const isFixedLang = fixedLangs.includes(lang);
              return (
                <SelectItem
                  key={lang}
                  value={lang}
                  disabled={usedByOtherSlot || isFixedLang}
                >
                  {lang}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      ))}
    </div>
  );
}
