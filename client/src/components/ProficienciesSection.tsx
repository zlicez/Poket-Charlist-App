import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Languages, Swords, Shield, Wrench, Plus, X, ChevronDown, ChevronRight, BookOpen, Eye, ShieldCheck } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpTooltip, TooltipBody } from "@/components/ui/help-tooltip";
import { PROFICIENCIES_SECTION_TOOLTIP } from "@/lib/tooltip-content";
import type { Proficiencies, ProficiencyCategory, DamageType } from "@shared/schema";
import {
  PROFICIENCY_CATEGORY_LABELS,
  LANGUAGES,
  WEAPON_PROFICIENCIES,
  ARMOR_PROFICIENCIES,
  TOOL_PROFICIENCIES,
  getRaceAndClassProficiencies
} from "@shared/schema";

const DAMAGE_TYPE_LABELS: Record<DamageType, string> = {
  fire:        "Огонь",
  cold:        "Холод",
  lightning:   "Молния",
  acid:        "Кислота",
  poison:      "Яд",
  psychic:     "Психика",
  radiant:     "Сияние",
  necrotic:    "Некротика",
  thunder:     "Гром",
  force:       "Силовой",
  piercing:    "Колющий",
  slashing:    "Рубящий",
  bludgeoning: "Дробящий",
};

interface ProficienciesSectionProps {
  proficiencies: Proficiencies;
  onChange: (proficiencies: Proficiencies) => void;
  isEditing: boolean;
  race: string;
  className: string;
  subrace?: string;
  raceSelections?: Record<string, unknown>;
}

const CATEGORY_ICONS: Record<ProficiencyCategory, typeof Languages> = {
  languages: Languages,
  weapons: Swords,
  armor: Shield,
  tools: Wrench,
};

const CATEGORY_PRESETS: Record<ProficiencyCategory, readonly string[]> = {
  languages: LANGUAGES,
  weapons: WEAPON_PROFICIENCIES,
  armor: ARMOR_PROFICIENCIES,
  tools: TOOL_PROFICIENCIES,
};

function AddProficiencyDialog({ 
  category, 
  existingProficiencies,
  onAdd 
}: { 
  category: ProficiencyCategory; 
  existingProficiencies: string[];
  onAdd: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [customValue, setCustomValue] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const presets = CATEGORY_PRESETS[category];
  const availablePresets = presets.filter(p => !existingProficiencies.includes(p));
  const filteredPresets = availablePresets.filter(p => 
    p.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddPreset = (value: string) => {
    onAdd(value);
    setSearchTerm("");
  };

  const handleAddCustom = () => {
    if (customValue.trim() && !existingProficiencies.includes(customValue.trim())) {
      onAdd(customValue.trim());
      setCustomValue("");
      setOpen(false);
    }
  };

  const Icon = CATEGORY_ICONS[category];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1" data-testid={`button-add-proficiency-${category}`}>
          <Plus className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className="w-5 h-5" />
            Добавить: {PROFICIENCY_CATEGORY_LABELS[category]}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Поиск из списка</label>
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Поиск..."
              data-testid={`input-search-proficiency-${category}`}
            />
          </div>

          <ScrollArea className="h-48 border rounded-md p-2">
            <div className="space-y-1">
              {filteredPresets.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {availablePresets.length === 0 ? "Все владения уже добавлены" : "Ничего не найдено"}
                </p>
              ) : (
                filteredPresets.map((preset) => (
                  <Button
                    key={preset}
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-left h-auto py-2"
                    onClick={() => handleAddPreset(preset)}
                    data-testid={`button-preset-${preset}`}
                  >
                    <Plus className="w-3 h-3 mr-2 flex-shrink-0" />
                    <span className="truncate">{preset}</span>
                  </Button>
                ))
              )}
            </div>
          </ScrollArea>

          <div className="border-t pt-4">
            <label className="text-sm text-muted-foreground mb-1 block">Или добавить своё</label>
            <div className="flex gap-2">
              <Input
                value={customValue}
                onChange={(e) => setCustomValue(e.target.value)}
                placeholder="Своё владение..."
                onKeyDown={(e) => e.key === "Enter" && handleAddCustom()}
                data-testid={`input-custom-proficiency-${category}`}
              />
              <Button 
                onClick={handleAddCustom} 
                disabled={!customValue.trim()}
                data-testid={`button-add-custom-${category}`}
              >
                Добавить
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ProficiencyCategory({ 
  category, 
  items, 
  isEditing, 
  onAdd, 
  onRemove 
}: { 
  category: ProficiencyCategory;
  items: string[];
  isEditing: boolean;
  onAdd: (value: string) => void;
  onRemove: (value: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const Icon = CATEGORY_ICONS[category];
  const label = PROFICIENCY_CATEGORY_LABELS[category];

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="flex items-center justify-between">
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-2 p-1 h-auto" data-testid={`toggle-${category}`}>
            {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            <Icon className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">{label}</span>
            <Badge variant="secondary" className="ml-1">{items.length}</Badge>
          </Button>
        </CollapsibleTrigger>
        {isEditing && (
          <AddProficiencyDialog 
            category={category} 
            existingProficiencies={items}
            onAdd={onAdd} 
          />
        )}
      </div>
      
      <CollapsibleContent>
        <div className="flex flex-wrap gap-1.5 mt-2 pl-6">
          {items.length === 0 ? (
            <p className="text-xs text-muted-foreground italic">Нет владений</p>
          ) : (
            items.map((item) => (
              <Badge 
                key={item} 
                variant="outline" 
                className="gap-1"
                data-testid={`proficiency-${category}-${item}`}
              >
                {item}
                {isEditing && (
                  <button
                    onClick={() => onRemove(item)}
                    className="ml-1 hover:text-destructive"
                    data-testid={`remove-proficiency-${item}`}
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </Badge>
            ))
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function ProficienciesSection({ proficiencies, onChange, isEditing, race, className, subrace, raceSelections }: ProficienciesSectionProps) {
  const autoProfs = getRaceAndClassProficiencies(race, className, subrace);

  // Resolve "Один на выбор" placeholders with actual chosen languages
  const languageChoices = (raceSelections?.["language-choices"] as string[] | undefined) ?? [];
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
    autoProfs.darkvision || autoProfs.skills.length > 0 || autoProfs.resistances.length > 0;

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

function ProficiencyCategoryWithAuto({ 
  category, 
  items, 
  autoItems,
  isEditing, 
  onAdd, 
  onRemove 
}: { 
  category: ProficiencyCategory;
  items: string[];
  autoItems: string[];
  isEditing: boolean;
  onAdd: (value: string) => void;
  onRemove: (value: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const Icon = CATEGORY_ICONS[category];
  const label = PROFICIENCY_CATEGORY_LABELS[category];
  
  const resolvedAutoItems = autoItems.filter((i) => i !== "Один на выбор");
  const pendingChoices = autoItems.filter((i) => i === "Один на выбор").length;
  const allItems = Array.from(new Set([...resolvedAutoItems, ...items]));
  const totalCount = allItems.length;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="flex items-center justify-between">
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-2 p-1 h-auto" data-testid={`toggle-auto-${category}`}>
            {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            <Icon className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">{label}</span>
            <Badge variant="secondary" className="ml-1">{totalCount}</Badge>
            {pendingChoices > 0 && (
              <Badge variant="outline" className="ml-0.5 border-dashed text-muted-foreground text-xs">
                +{pendingChoices}
              </Badge>
            )}
          </Button>
        </CollapsibleTrigger>
        {isEditing && (
          <AddProficiencyDialog 
            category={category} 
            existingProficiencies={allItems}
            onAdd={onAdd} 
          />
        )}
      </div>
      
      <CollapsibleContent>
        <div className="flex flex-wrap gap-1.5 mt-2 pl-6">
          {totalCount === 0 && pendingChoices === 0 ? (
            <p className="text-xs text-muted-foreground italic">Нет владений</p>
          ) : (
            <>
              {autoItems.map((item) => {
                // "Один на выбор" that hasn't been resolved yet — show as pending
                if (item === "Один на выбор") {
                  return (
                    <Badge
                      key="pending-lang-choice"
                      variant="outline"
                      className="gap-1 border-dashed text-muted-foreground text-xs italic"
                    >
                      + выберите язык
                    </Badge>
                  );
                }
                return (
                  <HelpTooltip
                    key={`auto-${item}`}
                    content={<p className="text-xs">От расы/класса</p>}
                    side="top"
                    asChild
                  >
                    <span>
                      <Badge
                        variant="secondary"
                        className="gap-1 cursor-help"
                        data-testid={`proficiency-auto-${category}-${item}`}
                      >
                        {item}
                      </Badge>
                    </span>
                  </HelpTooltip>
                );
              })}
              {items.filter(item => !autoItems.includes(item)).map((item) => (
                <Badge 
                  key={item} 
                  variant="outline" 
                  className="gap-1"
                  data-testid={`proficiency-${category}-${item}`}
                >
                  {item}
                  {isEditing && (
                    <button
                      onClick={() => onRemove(item)}
                      className="ml-1 hover:text-destructive"
                      data-testid={`remove-proficiency-${item}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </Badge>
              ))}
            </>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
