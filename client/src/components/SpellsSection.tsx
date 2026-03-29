import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  ResponsiveDialog,
  ResponsiveDialogTrigger,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogFooter,
} from "@/components/ui/responsive-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  BookOpen, Plus, Trash2, ChevronDown, ChevronRight, Flame,
  Clock, Ruler, Sparkles, Eye, Target, Wand2,
} from "lucide-react";
import {
  ABILITY_LABELS,
  CLASS_DATA,
  calculateModifier,
  calculateSpellSaveDC,
  calculateSpellAttackBonus,
  formatModifier,
  getProficiencyBonus,
  getRacialBonuses,
} from "@shared/schema";
import type { Character, Spell, Spellcasting, AbilityName } from "@shared/schema";

const SPELL_LEVEL_LABELS: Record<number, string> = {
  0: "Заговоры",
  1: "1 уровень",
  2: "2 уровень",
  3: "3 уровень",
  4: "4 уровень",
  5: "5 уровень",
  6: "6 уровень",
  7: "7 уровень",
  8: "8 уровень",
  9: "9 уровень",
};

const DEFAULT_SPELLCASTING: Spellcasting = {
  ability: "INT",
  spellSlots: Array.from({ length: 9 }, () => ({ max: 0, used: 0 })),
  spells: [],
};

interface SpellsSectionProps {
  character: Character;
  onChange: (updates: Partial<Character>) => void;
  isEditing: boolean;
}

function AddSpellDialog({ onAdd, defaultLevel }: { onAdd: (spell: Omit<Spell, "id">) => void; defaultLevel?: number }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [level, setLevel] = useState(defaultLevel ?? 0);
  const [castingTime, setCastingTime] = useState("1 действие");
  const [range, setRange] = useState("");
  const [components, setComponents] = useState("");
  const [duration, setDuration] = useState("");
  const [concentration, setConcentration] = useState(false);
  const [ritual, setRitual] = useState(false);
  const [description, setDescription] = useState("");

  const handleSubmit = () => {
    if (!name.trim()) return;
    onAdd({
      name,
      level,
      castingTime,
      range,
      components,
      duration,
      concentration,
      ritual,
      description,
      prepared: true,
    });
    setName("");
    setLevel(defaultLevel ?? 0);
    setCastingTime("1 действие");
    setRange("");
    setComponents("");
    setDuration("");
    setConcentration(false);
    setRitual(false);
    setDescription("");
    setOpen(false);
  };

  return (
    <ResponsiveDialog open={open} onOpenChange={setOpen}>
      <ResponsiveDialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1 h-9 sm:h-8" data-testid="button-add-spell">
          <Plus className="w-4 h-4" />
          Добавить
        </Button>
      </ResponsiveDialogTrigger>
      <ResponsiveDialogContent>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>Новое заклинание</ResponsiveDialogTitle>
        </ResponsiveDialogHeader>
        <div className="space-y-3 p-4">
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Название *</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Огненный шар"
              className="h-10"
              data-testid="input-spell-name"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Уровень</label>
              <Select value={String(level)} onValueChange={(v) => setLevel(Number(v))}>
                <SelectTrigger className="h-10" data-testid="select-spell-level">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 10 }, (_, i) => (
                    <SelectItem key={i} value={String(i)}>
                      {i === 0 ? "Заговор" : `${i} уровень`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Время сотворения</label>
              <Input
                value={castingTime}
                onChange={(e) => setCastingTime(e.target.value)}
                placeholder="1 действие"
                className="h-10"
                data-testid="input-spell-casting-time"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Дистанция</label>
              <Input
                value={range}
                onChange={(e) => setRange(e.target.value)}
                placeholder="150 фт."
                className="h-10"
                data-testid="input-spell-range"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Компоненты</label>
              <Input
                value={components}
                onChange={(e) => setComponents(e.target.value)}
                placeholder="В, С, М"
                className="h-10"
                data-testid="input-spell-components"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Длительность</label>
            <Input
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="Мгновенная"
              className="h-10"
              data-testid="input-spell-duration"
            />
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={concentration}
                onCheckedChange={(c) => setConcentration(c === true)}
                data-testid="checkbox-spell-concentration"
              />
              Концентрация
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={ritual}
                onCheckedChange={(c) => setRitual(c === true)}
                data-testid="checkbox-spell-ritual"
              />
              Ритуал
            </label>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Описание</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Описание заклинания..."
              rows={3}
              className="resize-none"
              data-testid="textarea-spell-description"
            />
          </div>
        </div>
        <ResponsiveDialogFooter>
          <Button onClick={handleSubmit} disabled={!name.trim()} data-testid="button-confirm-add-spell">
            Добавить заклинание
          </Button>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}

function SpellSlotTracker({
  level,
  max,
  used,
  onChange,
  isEditing,
}: {
  level: number;
  max: number;
  used: number;
  onChange: (max: number, used: number) => void;
  isEditing: boolean;
}) {
  if (max === 0 && !isEditing) return null;

  return (
    <div className="flex items-center gap-2" data-testid={`spell-slots-level-${level}`}>
      <span className="text-xs font-medium w-6 text-right text-muted-foreground">{level}</span>
      {isEditing ? (
        <div className="flex items-center gap-1">
          <Input
            type="number"
            inputMode="numeric"
            min={0}
            max={20}
            value={max}
            onChange={(e) => onChange(Math.max(0, parseInt(e.target.value) || 0), used)}
            className="h-8 w-14 text-center text-sm font-mono"
            data-testid={`input-spell-slots-max-${level}`}
          />
        </div>
      ) : (
        <div className="flex gap-1 flex-wrap">
          {Array.from({ length: max }, (_, i) => {
            const isUsed = i < used;
            return (
              <button
                key={i}
                onClick={() => onChange(max, isUsed ? i : i + 1)}
                className={`w-7 h-7 sm:w-6 sm:h-6 rounded border-2 transition-all flex items-center justify-center ${
                  isUsed
                    ? "bg-muted border-muted-foreground/30 opacity-40"
                    : "border-accent/50 hover:border-accent bg-accent/10"
                } active:scale-95`}
                data-testid={`button-spell-slot-${level}-${i}`}
              >
                {!isUsed && <Sparkles className="w-3 h-3 text-accent" />}
              </button>
            );
          })}
          {max === 0 && <span className="text-xs text-muted-foreground">—</span>}
        </div>
      )}
    </div>
  );
}

function SpellCard({
  spell,
  isEditing,
  onRemove,
  onTogglePrepared,
}: {
  spell: Spell;
  isEditing: boolean;
  onRemove: () => void;
  onTogglePrepared: () => void;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`border rounded-md px-2.5 py-1.5 text-sm transition-colors ${
        spell.prepared ? "border-border bg-card" : "border-border/50 bg-muted/30 opacity-60"
      }`}
      data-testid={`spell-card-${spell.id}`}
    >
      <div className="flex items-center gap-1.5">
        {spell.level > 0 && (
          <Checkbox
            checked={spell.prepared}
            onCheckedChange={() => onTogglePrepared()}
            className="shrink-0"
            data-testid={`checkbox-spell-prepared-${spell.id}`}
          />
        )}
        <button
          className="flex-1 flex items-center gap-1.5 text-left min-w-0"
          onClick={() => setExpanded(!expanded)}
          data-testid={`button-expand-spell-${spell.id}`}
        >
          {expanded ? <ChevronDown className="w-3.5 h-3.5 shrink-0 text-muted-foreground" /> : <ChevronRight className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />}
          <span className="font-medium truncate">{spell.name}</span>
          {spell.concentration && (
            <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 shrink-0">К</Badge>
          )}
          {spell.ritual && (
            <Badge variant="outline" className="text-[10px] px-1 py-0 h-4 shrink-0">Р</Badge>
          )}
        </button>
        {isEditing && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0 text-destructive"
            onClick={onRemove}
            data-testid={`button-remove-spell-${spell.id}`}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        )}
      </div>
      {expanded && (
        <div className="mt-2 space-y-1 text-xs text-muted-foreground pl-5">
          {spell.castingTime && (
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{spell.castingTime}</span>
            </div>
          )}
          {spell.range && (
            <div className="flex items-center gap-1">
              <Ruler className="w-3 h-3" />
              <span>{spell.range}</span>
            </div>
          )}
          {spell.components && (
            <div className="flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              <span>{spell.components}</span>
            </div>
          )}
          {spell.duration && (
            <div className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              <span>{spell.duration}</span>
            </div>
          )}
          {spell.description && (
            <p className="mt-1 whitespace-pre-wrap leading-relaxed">{spell.description}</p>
          )}
        </div>
      )}
    </div>
  );
}

export function SpellsSection({ character, onChange, isEditing }: SpellsSectionProps) {
  const classData = CLASS_DATA[character.class];
  const classSpellAbility = classData?.spellcastingAbility;

  const resolvedDefault: Spellcasting = {
    ...DEFAULT_SPELLCASTING,
    ability: classSpellAbility ?? DEFAULT_SPELLCASTING.ability,
  };
  const spellcasting = character.spellcasting
    ? { ...character.spellcasting, ability: character.spellcasting.ability ?? classSpellAbility ?? "INT" }
    : resolvedDefault;

  const profBonus = getProficiencyBonus(character.level);

  const racialBonuses = getRacialBonuses(character.race, character.subrace);
  const abilityScore =
    character.abilityScores[spellcasting.ability] +
    (racialBonuses[spellcasting.ability] || 0) +
    (character.customAbilityBonuses?.[spellcasting.ability] || 0);
  const abilityMod = calculateModifier(abilityScore);
  const spellSaveDC = calculateSpellSaveDC(abilityMod, profBonus);
  const spellAttackBonus = calculateSpellAttackBonus(abilityMod, profBonus);

  const [openLevels, setOpenLevels] = useState<Record<number, boolean>>({ 0: true });

  const updateSpellcasting = (updates: Partial<Spellcasting>) => {
    onChange({
      spellcasting: { ...spellcasting, ...updates },
    });
  };

  const handleAbilityChange = (ability: AbilityName) => {
    updateSpellcasting({ ability });
  };

  const handleSlotChange = (levelIndex: number, max: number, used: number) => {
    const newSlots = [...spellcasting.spellSlots];
    newSlots[levelIndex] = { max, used: Math.min(used, max) };
    updateSpellcasting({ spellSlots: newSlots });
  };

  const handleAddSpell = (spellData: Omit<Spell, "id">) => {
    const newSpell: Spell = {
      ...spellData,
      id: crypto.randomUUID(),
    };
    updateSpellcasting({ spells: [...spellcasting.spells, newSpell] });
  };

  const handleRemoveSpell = (spellId: string) => {
    updateSpellcasting({
      spells: spellcasting.spells.filter((s) => s.id !== spellId),
    });
  };

  const handleTogglePrepared = (spellId: string) => {
    updateSpellcasting({
      spells: spellcasting.spells.map((s) =>
        s.id === spellId ? { ...s, prepared: !s.prepared } : s
      ),
    });
  };

  const toggleLevel = (level: number) => {
    setOpenLevels((prev) => ({ ...prev, [level]: !prev[level] }));
  };

  const spellsByLevel = new Map<number, Spell[]>();
  for (let i = 0; i <= 9; i++) {
    spellsByLevel.set(i, []);
  }
  for (const spell of spellcasting.spells) {
    const list = spellsByLevel.get(spell.level) ?? [];
    list.push(spell);
    spellsByLevel.set(spell.level, list);
  }

  const hasAnySlots = spellcasting.spellSlots.some((s) => s.max > 0);
  const hasAnySpells = spellcasting.spells.length > 0;

  if (!hasAnySlots && !hasAnySpells && !isEditing) {
    return null;
  }

  return (
    <Card className="stat-card p-2 sm:p-3" data-testid="section-spells-card">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-accent" />
          <h3 className="font-semibold text-xs sm:text-sm">Заклинания</h3>
        </div>
        {isEditing && <AddSpellDialog onAdd={handleAddSpell} />}
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3">
        <Tooltip>
          <TooltipTrigger asChild>
            <div className="text-center p-2 rounded-md bg-accent/10" data-testid="stat-spell-ability">
              <div className="text-[10px] text-muted-foreground uppercase">Характ.</div>
              {isEditing ? (
                <Select value={spellcasting.ability} onValueChange={(v) => handleAbilityChange(v as AbilityName)}>
                  <SelectTrigger className="h-7 text-xs font-bold border-0 bg-transparent p-0 justify-center" data-testid="select-spell-ability">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(["STR", "DEX", "CON", "INT", "WIS", "CHA"] as AbilityName[]).map((ab) => (
                      <SelectItem key={ab} value={ab}>
                        {ABILITY_LABELS[ab].ru}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="text-sm font-bold">{ABILITY_LABELS[spellcasting.ability].ru}</div>
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Заклинательная характеристика</p>
            <p className="text-xs text-muted-foreground">Модификатор: {formatModifier(abilityMod)}</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <div className="text-center p-2 rounded-md bg-accent/10" data-testid="stat-spell-save-dc">
              <div className="text-[10px] text-muted-foreground uppercase">Сл. спасбр.</div>
              <div className="text-lg font-bold font-mono">{spellSaveDC}</div>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Сложность спасброска заклинания</p>
            <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
              <p>8 + мастерство ({profBonus}) + {ABILITY_LABELS[spellcasting.ability].ru} ({formatModifier(abilityMod)})</p>
            </div>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <div className="text-center p-2 rounded-md bg-accent/10" data-testid="stat-spell-attack">
              <div className="text-[10px] text-muted-foreground uppercase">Атака закл.</div>
              <div className={`text-lg font-bold font-mono ${spellAttackBonus >= 0 ? "text-positive" : "text-negative"}`}>
                {formatModifier(spellAttackBonus)}
              </div>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Бонус атаки заклинанием</p>
            <div className="text-xs text-muted-foreground mt-1 space-y-0.5">
              <p>Мастерство ({profBonus}) + {ABILITY_LABELS[spellcasting.ability].ru} ({formatModifier(abilityMod)})</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </div>

      <div className="space-y-1.5 mb-3" data-testid="spell-slots-section">
        <div className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
          <Target className="w-3 h-3" />
          Ячейки заклинаний
        </div>
        {Array.from({ length: 9 }, (_, i) => (
          <SpellSlotTracker
            key={i}
            level={i + 1}
            max={spellcasting.spellSlots[i]?.max ?? 0}
            used={spellcasting.spellSlots[i]?.used ?? 0}
            onChange={(max, used) => handleSlotChange(i, max, used)}
            isEditing={isEditing}
          />
        ))}
      </div>

      <div className="space-y-2" data-testid="spells-list">
        {Array.from({ length: 10 }, (_, level) => {
          const spells = spellsByLevel.get(level) ?? [];
          if (spells.length === 0 && !isEditing) return null;

          const isOpen = openLevels[level] ?? false;

          return (
            <Collapsible key={level} open={isOpen} onOpenChange={() => toggleLevel(level)}>
              <CollapsibleTrigger className="flex items-center gap-1.5 w-full text-left py-1 hover:bg-muted/50 rounded px-1 transition-colors" data-testid={`spell-level-trigger-${level}`}>
                {isOpen ? <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />}
                <Wand2 className="w-3.5 h-3.5 text-accent" />
                <span className="text-xs font-medium flex-1">{SPELL_LEVEL_LABELS[level]}</span>
                <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
                  {spells.length}
                </Badge>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="space-y-1 mt-1 pl-1">
                  {spells.map((spell) => (
                    <SpellCard
                      key={spell.id}
                      spell={spell}
                      isEditing={isEditing}
                      onRemove={() => handleRemoveSpell(spell.id)}
                      onTogglePrepared={() => handleTogglePrepared(spell.id)}
                    />
                  ))}
                  {spells.length === 0 && (
                    <div className="text-xs text-muted-foreground py-2 text-center">
                      Нет заклинаний этого уровня
                    </div>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </div>
    </Card>
  );
}
