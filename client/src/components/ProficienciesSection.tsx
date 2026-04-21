import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { HelpTooltip, TooltipBody } from "@/components/ui/help-tooltip";
import { BookOpen, Eye, ShieldCheck } from "lucide-react";
import { PROFICIENCIES_SECTION_TOOLTIP } from "@/lib/tooltip-content";
import type {
  Character,
  Proficiencies,
  ProficiencyCategory,
} from "@shared/schema";
import { getCharacterAutoProficiencies } from "@shared/schema";

import { DAMAGE_TYPE_LABELS } from "./proficiencies/constants";
import { ProficiencyCategoryWithAuto } from "./proficiencies/ProficiencyCategoryWithAuto";

interface ProficienciesSectionProps {
  proficiencies: Proficiencies;
  onChange: (proficiencies: Proficiencies) => void;
  isEditing: boolean;
  character: Pick<
    Character,
    | "race"
    | "class"
    | "level"
    | "subclass"
    | "subrace"
    | "classes"
    | "classSelections"
    | "raceSelections"
  >;
  raceSelections?: Record<string, unknown>;
}

export function ProficienciesSection({
  proficiencies,
  onChange,
  isEditing,
  character,
  raceSelections,
}: ProficienciesSectionProps) {
  const autoProfs = getCharacterAutoProficiencies(character);
  const effectiveRaceSelections = raceSelections ?? character.raceSelections;

  // Resolve "Один на выбор" placeholders with actual chosen languages
  const languageChoices =
    (effectiveRaceSelections?.["language-choices"] as string[] | undefined) ?? [];
  let choiceIdx = 0;
  const resolvedAutoLanguages = autoProfs.languages.map((lang) => {
    if (lang === "Один на выбор") {
      const chosen = languageChoices[choiceIdx];
      choiceIdx++;
      return chosen ?? lang;
    }
    return lang;
  });

  const handleAdd = (category: ProficiencyCategory, value: string) => {
    const current = proficiencies[category] || [];
    if (!current.includes(value)) {
      onChange({
        ...proficiencies,
        [category]: [...current, value],
      });
    }
  };

  const handleRemove = (category: ProficiencyCategory, value: string) => {
    const current = proficiencies[category] || [];
    onChange({
      ...proficiencies,
      [category]: current.filter(v => v !== value),
    });
  };

  const hasRaceBadges =
    autoProfs.darkvision || autoProfs.skills.length > 0 || autoProfs.resistances.length > 0 || autoProfs.immunities.length > 0;

  return (
    <Card className="stat-card p-2 sm:p-3" data-testid="proficiencies-section">
      <div className="flex items-start justify-between mb-3 gap-2">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-accent" />
          <h3 className="font-semibold text-sm">Владения</h3>
          <HelpTooltip
            content={<TooltipBody title={PROFICIENCIES_SECTION_TOOLTIP.title} lines={PROFICIENCIES_SECTION_TOOLTIP.lines} />}
            side="right"
          />
        </div>
        {hasRaceBadges && (
          <div className="flex flex-wrap items-center gap-1 justify-end">
            {autoProfs.darkvision && (
              <HelpTooltip
                content={<p className="text-xs">Тёмное зрение: видите на {autoProfs.darkvision} фт. как при тусклом освещении</p>}
                side="bottom"
                asChild
              >
                <span data-testid="darkvision-badge">
                  <Badge variant="secondary" className="gap-1 cursor-help text-xs">
                    <Eye className="w-3 h-3" />
                    {autoProfs.darkvision} фт.
                  </Badge>
                </span>
              </HelpTooltip>
            )}
            {autoProfs.resistances.map((resist) => (
              <HelpTooltip
                key={resist}
                content={<p className="text-xs">Сопротивление к урону: {DAMAGE_TYPE_LABELS[resist] ?? resist}</p>}
                side="bottom"
                asChild
              >
                <span>
                  <Badge variant="secondary" className="gap-1 cursor-help text-xs">
                    <ShieldCheck className="w-3 h-3 text-emerald-500" />
                    {DAMAGE_TYPE_LABELS[resist] ?? resist}
                  </Badge>
                </span>
              </HelpTooltip>
            ))}
            {autoProfs.immunities.map((immune) => (
              <HelpTooltip
                key={immune}
                content={<p className="text-xs">Иммунитет к урону: {DAMAGE_TYPE_LABELS[immune] ?? immune}</p>}
                side="bottom"
                asChild
              >
                <span>
                  <Badge variant="secondary" className="gap-1 cursor-help text-xs">
                    <ShieldCheck className="w-3 h-3 text-blue-500" />
                    {DAMAGE_TYPE_LABELS[immune] ?? immune}
                  </Badge>
                </span>
              </HelpTooltip>
            ))}
            {autoProfs.skills.map((skill) => (
              <HelpTooltip
                key={skill}
                content={<p className="text-xs">Владение навыком от расы</p>}
                side="bottom"
                asChild
              >
                <span>
                  <Badge variant="outline" className="cursor-help text-xs">
                    {skill}
                  </Badge>
                </span>
              </HelpTooltip>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-3">
        <ProficiencyCategoryWithAuto
          category="languages"
          items={proficiencies.languages || []}
          autoItems={resolvedAutoLanguages}
          isEditing={isEditing}
          onAdd={(v) => handleAdd("languages", v)}
          onRemove={(v) => handleRemove("languages", v)}
        />

        <ProficiencyCategoryWithAuto
          category="weapons"
          items={proficiencies.weapons || []}
          autoItems={autoProfs.weapons}
          isEditing={isEditing}
          onAdd={(v) => handleAdd("weapons", v)}
          onRemove={(v) => handleRemove("weapons", v)}
        />

        <ProficiencyCategoryWithAuto
          category="armor"
          items={proficiencies.armor || []}
          autoItems={autoProfs.armor}
          isEditing={isEditing}
          onAdd={(v) => handleAdd("armor", v)}
          onRemove={(v) => handleRemove("armor", v)}
        />

        <ProficiencyCategoryWithAuto
          category="tools"
          items={proficiencies.tools || []}
          autoItems={autoProfs.tools}
          isEditing={isEditing}
          onAdd={(v) => handleAdd("tools", v)}
          onRemove={(v) => handleRemove("tools", v)}
        />
      </div>
    </Card>
  );
}
