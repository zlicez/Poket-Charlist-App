import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { NumericInput } from "@/components/ui/numeric-input";
import { Scroll, Sparkles } from "lucide-react";
import {
  ALIGNMENTS,
  getCharacterClassSelections,
  getRaceSpeed,
  type Character,
  type ClassSelection,
} from "@shared/schema";

import { MulticlassEditor } from "@/components/multiclass/MulticlassEditor";
import { FlexibleRaceBonusesEditor } from "@/components/race-picker/FlexibleRaceBonusesEditor";
import { LanguageChoiceEditor } from "@/components/race-picker/LanguageChoiceEditor";
import { RacePickerDialog } from "@/components/race-picker/RacePickerDialog";

export function EditingFields({
  character,
  onChange,
  handleClassSelectionsChange,
  handleRaceChange,
  subraces,
}: {
  character: Character;
  onChange: (updates: Partial<Character>) => void;
  handleClassSelectionsChange: (selections: ClassSelection[]) => void;
  handleRaceChange: (newRace: string, newSubrace?: string) => void;
  subraces: string[];
}) {
  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs text-muted-foreground mb-1 block">
          Имя персонажа
        </label>
        <Input
          value={character.name}
          onChange={(e) => onChange({ name: e.target.value })}
          className="text-lg font-bold h-10"
          placeholder="Имя персонажа"
          data-testid="input-name"
        />
      </div>

      <div>
        <label className="text-xs text-muted-foreground mb-1 block">Раса</label>
        <RacePickerDialog value={character.race} subrace={character.subrace} onChange={handleRaceChange} />
      </div>

      {subraces.length > 0 && (
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">
            Подраса
          </label>
          <Select
            value={character.subrace || "none"}
            onValueChange={(value) => {
              const newSubrace = value === "none" ? "" : value;
              onChange({
                subrace: newSubrace,
                speed: getRaceSpeed(character.race, newSubrace || undefined),
              });
            }}
          >
            <SelectTrigger
              className="h-10 text-sm"
              data-testid="select-subrace"
            >
              <SelectValue placeholder="Подраса" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Нет</SelectItem>
              {subraces.map((subrace) => (
                <SelectItem key={subrace} value={subrace}>
                  {subrace}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <FlexibleRaceBonusesEditor
        key={character.race}
        character={character}
        onChange={onChange}
      />

      <LanguageChoiceEditor
        key={`lang-${character.race}`}
        character={character}
        onChange={onChange}
      />

      <MulticlassEditor
        selections={getCharacterClassSelections(character)}
        onSelectionsChange={handleClassSelectionsChange}
      />

      <div>
        <label className="text-xs text-muted-foreground mb-1 block">
          Опыт (XP)
        </label>
        <NumericInput
          min={0}
          value={character.experience}
          onChange={(v) => onChange({ experience: v })}
          className="h-10"
          data-testid="input-experience"
        />
      </div>

      <div>
        <label className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
          <Scroll className="w-3 h-3" />
          Предыстория
        </label>
        <Input
          value={character.background || ""}
          onChange={(e) => onChange({ background: e.target.value })}
          placeholder="Народный герой"
          className="h-10"
          data-testid="input-background"
        />
      </div>
      <div>
        <label className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
          <Sparkles className="w-3 h-3" />
          Мировоззрение
        </label>
        <Select
          value={character.alignment || ""}
          onValueChange={(value) => onChange({ alignment: value })}
        >
          <SelectTrigger className="h-10" data-testid="select-alignment">
            <SelectValue placeholder="Выберите" />
          </SelectTrigger>
          <SelectContent>
            {ALIGNMENTS.map((alignment) => (
              <SelectItem key={alignment} value={alignment}>
                {alignment}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
