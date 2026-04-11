import { useState, useMemo } from "react";
import { generateId } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpTooltip, TooltipBody } from "@/components/ui/help-tooltip";
import {
  WEAPON_PROFICIENCY_TOOLTIP,
  FINESSE_TOOLTIP,
} from "@/lib/tooltip-content";
import {
  ResponsiveDialog,
  ResponsiveDialogTrigger,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogFooter,
} from "@/components/ui/responsive-dialog";
import { Swords, Plus, Trash2, Dices, Lock, Unlock, Backpack, ChevronDown } from "lucide-react";
import type { Weapon, Equipment, WeaponAbilityMod, Proficiencies } from "@shared/schema";
import { formatModifier, isWeaponProficient } from "@shared/schema";
import { WeaponFormFields } from "@/components/WeaponFormFields";
import {
  DEFAULT_WEAPON_FORM_VALUES,
  createWeaponFromForm,
  createEquipmentWeaponFromForm,
  getEquippedInventoryWeapons,
  type WeaponFormValues,
} from "@/lib/weapons";

interface WeaponsListProps {
  weapons: Weapon[];
  onChange: (weapons: Weapon[]) => void;
  onAddInventoryWeapon?: (weapon: Omit<Equipment, "id">) => void;
  onRollAttack: (weapon: Weapon, totalAttackBonus: number, isProficient: boolean) => void;
  onRollDamage: (weapon: Weapon, damageModifier: number) => void;
  isEditing: boolean;
  isLocked?: boolean;
  onToggleLock?: () => void;
  equippedFromInventory?: Equipment[];
  strMod?: number;
  dexMod?: number;
  proficiencyBonus?: number;
  proficiencies?: Proficiencies;
}

function AddWeaponDialog({ onAdd }: { onAdd: (name: string, weapon: WeaponFormValues) => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [weaponForm, setWeaponForm] = useState<WeaponFormValues>(DEFAULT_WEAPON_FORM_VALUES);

  const handleSubmit = () => {
    if (!name.trim()) return;
    onAdd(name, weaponForm);
    setName("");
    setWeaponForm(DEFAULT_WEAPON_FORM_VALUES);
    setOpen(false);
  };

  return (
    <ResponsiveDialog open={open} onOpenChange={setOpen}>
      <ResponsiveDialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1 h-9 sm:h-8" data-testid="button-add-weapon">
          <Plus className="w-4 h-4" />
          Добавить
        </Button>
      </ResponsiveDialogTrigger>
      <ResponsiveDialogContent>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>Добавить оружие</ResponsiveDialogTitle>
        </ResponsiveDialogHeader>
        <div className="space-y-3">
          <div>
            <label className="text-sm text-muted-foreground">Название</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Длинный меч"
              data-testid="input-weapon-name"
            />
          </div>
          <WeaponFormFields
            values={weaponForm}
            onChange={(updates) => setWeaponForm((prev) => ({ ...prev, ...updates }))}
          />
        </div>
        <ResponsiveDialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Отмена</Button>
          <Button onClick={handleSubmit} data-testid="button-save-weapon">Сохранить</Button>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}

export function WeaponsList({ 
  weapons, 
  onChange, 
  onAddInventoryWeapon,
  onRollAttack, 
  onRollDamage, 
  isEditing, 
  isLocked = false, 
  onToggleLock,
  equippedFromInventory = [],
  strMod = 0,
  dexMod = 0,
  proficiencyBonus = 2,
  proficiencies = { languages: [], weapons: [], armor: [], tools: [] }
}: WeaponsListProps) {
  const canModify = isEditing || !isLocked;
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpanded = (id: string) => {
    if (!isEditing && !isLocked) {
      setExpandedId((prev) => (prev === id ? null : id));
    }
  };

  const getAbilityMod = (abilityMod: WeaponAbilityMod | undefined) => {
    return abilityMod === "dex" ? dexMod : strMod;
  };

  const equippedWeapons = useMemo(() => {
    return getEquippedInventoryWeapons(equippedFromInventory).map((weapon) => ({
      ...weapon,
      fromInventory: true,
    }));
  }, [equippedFromInventory]);

  const addWeapon = (name: string, weapon: WeaponFormValues) => {
    if (onAddInventoryWeapon) {
      onAddInventoryWeapon(
        createEquipmentWeaponFromForm(name, weapon, {
          quantity: 1,
          equipped: true,
        }),
      );
      return;
    }

    onChange([
      ...weapons,
      {
        ...createWeaponFromForm(name, weapon),
        id: crypto.randomUUID(),
      },
    ]);
  };

  const removeWeapon = (id: string) => {
    onChange(weapons.filter((w) => w.id !== id));
  };

  const allWeapons = [...equippedWeapons, ...weapons];
  const hasEquippedWeapons = equippedWeapons.length > 0;

  return (
    <Card className="stat-card p-2 sm:p-3">
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <div className="flex items-center gap-2">
          <Swords className="w-4 h-4 text-accent" />
          <h3 className="font-semibold text-sm">Оружие</h3>
          {hasEquippedWeapons && (
            <Badge variant="secondary" className="text-xs h-4 px-1.5">
              {equippedWeapons.length} экип.
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1">
          {!isEditing && onToggleLock && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleLock}
              className={`h-9 w-9 sm:h-8 sm:w-8 ${isLocked ? "text-muted-foreground" : "text-accent"}`}
              data-testid="button-toggle-weapons-lock"
            >
              {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
            </Button>
          )}
          {canModify && <AddWeaponDialog onAdd={addWeapon} />}
        </div>
      </div>

      {allWeapons.length === 0 ? (
        <div className="text-center py-4 text-muted-foreground text-xs">
          {isEditing ? "Нажмите \"Добавить\" или экипируйте оружие в снаряжении" : "Нет оружия"}
        </div>
      ) : (
        <div className="space-y-3">
          {equippedWeapons.map((weapon) => {
            const abilityModValue = getAbilityMod(weapon.abilityMod);
            const isProficient = isWeaponProficient(weapon.name, proficiencies);
            const profBonus = isProficient ? proficiencyBonus : 0;
            const totalAttack = profBonus + abilityModValue + weapon.attackBonus;
            const damageModStr = abilityModValue !== 0 ? formatModifier(abilityModValue) : "";
            const abilityLabel = weapon.abilityMod === "dex" ? "ЛОВ" : "СИЛ";
            
            const isExpanded = expandedId === `inv-${weapon.id}`;
            return (
              <div
                key={`inv-${weapon.id}`}
                className="rounded-md bg-accent/10 overflow-hidden"
                data-testid={`weapon-inv-${weapon.id}`}
              >
                {/* Header row */}
                <div
                  className="flex items-center gap-2 p-2 cursor-pointer select-none"
                  onClick={() => toggleExpanded(`inv-${weapon.id}`)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <Backpack className="w-3 h-3 text-accent shrink-0" />
                      <span className="font-medium text-sm truncate text-accent">{weapon.name}</span>
                      <span className="flex items-center gap-0.5 text-xs text-muted-foreground flex-wrap">
                        <span>{abilityLabel}</span>
                        {weapon.isFinesse && (
                          <>
                            <span>• фехт.</span>
                            <span onClick={(e) => e.stopPropagation()}>
                              <HelpTooltip
                                content={<TooltipBody title={FINESSE_TOOLTIP.title} lines={FINESSE_TOOLTIP.lines} />}
                                iconSize="xs"
                                side="top"
                              />
                            </span>
                          </>
                        )}
                        {isProficient && (
                          <>
                            <span>• влад.</span>
                            <span onClick={(e) => e.stopPropagation()}>
                              <HelpTooltip
                                content={<TooltipBody title={WEAPON_PROFICIENCY_TOOLTIP(proficiencyBonus).title} lines={WEAPON_PROFICIENCY_TOOLTIP(proficiencyBonus).lines} />}
                                iconSize="xs"
                                side="top"
                              />
                            </span>
                          </>
                        )}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {weapon.damage}{damageModStr} {weapon.damageType}
                      {weapon.properties && ` • ${weapon.properties}`}
                    </div>
                  </div>

                  {/* Desktop inline buttons */}
                  {!isEditing && (
                    <div className="hidden sm:flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <HelpTooltip
                        content={`Атака: 1d20${formatModifier(totalAttack)}${!isProficient ? " (без владения)" : ""}`}
                        side="top"
                        asChild
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 gap-1"
                          onClick={() => onRollAttack(weapon as Weapon, totalAttack, isProficient)}
                          data-testid={`button-attack-inv-${weapon.id}`}
                        >
                          <Dices className="w-3 h-3" />
                          <span className="text-xs">{formatModifier(totalAttack)}</span>
                        </Button>
                      </HelpTooltip>
                      <HelpTooltip
                        content={`Урон: ${weapon.damage}${damageModStr}`}
                        side="top"
                        asChild
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2"
                          onClick={() => onRollDamage(weapon as Weapon, abilityModValue)}
                          data-testid={`button-damage-inv-${weapon.id}`}
                        >
                          <span className="text-xs">{weapon.damage}{damageModStr}</span>
                        </Button>
                      </HelpTooltip>
                    </div>
                  )}

                  {/* Mobile chevron */}
                  {!isEditing && (
                    <ChevronDown
                      className={`sm:hidden w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-150 ${isExpanded ? "rotate-180" : ""}`}
                    />
                  )}
                </div>

                {/* Mobile accordion panel */}
                {!isEditing && isExpanded && (
                  <div className="sm:hidden px-2 pb-2 grid grid-cols-2 gap-2 animate-in slide-in-from-top-1 fade-in-0 duration-150">
                    <Button
                      variant="outline"
                      className="h-14 flex-col gap-1 border-accent/40"
                      onClick={() => onRollAttack(weapon as Weapon, totalAttack, isProficient)}
                      data-testid={`button-attack-inv-${weapon.id}-mobile`}
                    >
                      <span className="text-[10px] font-bold tracking-widest text-muted-foreground">АТАКА</span>
                      <span className="text-base font-bold font-mono">1d20{formatModifier(totalAttack)}</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-14 flex-col gap-1"
                      onClick={() => onRollDamage(weapon as Weapon, abilityModValue)}
                      data-testid={`button-damage-inv-${weapon.id}-mobile`}
                    >
                      <span className="text-[10px] font-bold tracking-widest text-muted-foreground">УРОН</span>
                      <span className="text-base font-bold font-mono">{weapon.damage}{damageModStr}</span>
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
          
          {weapons.map((weapon) => {
            const abilityModValue = getAbilityMod(weapon.abilityMod);
            const isProficient = isWeaponProficient(weapon.name, proficiencies);
            const profBonus = isProficient ? proficiencyBonus : 0;
            const totalAttack = profBonus + abilityModValue + weapon.attackBonus;
            const damageModStr = abilityModValue !== 0 ? formatModifier(abilityModValue) : "";
            const abilityLabel = weapon.abilityMod === "dex" ? "ЛОВ" : "СИЛ";
            
            const isExpanded = expandedId === weapon.id;
            return (
              <div
                key={weapon.id}
                className="rounded-md bg-muted/30 overflow-hidden"
                data-testid={`weapon-${weapon.id}`}
              >
                {/* Header row */}
                <div
                  className="flex items-center gap-2 p-2 cursor-pointer select-none"
                  onClick={() => toggleExpanded(weapon.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-medium text-sm truncate">{weapon.name}</span>
                      <span className="flex items-center gap-0.5 text-xs text-muted-foreground flex-wrap">
                        <span>{abilityLabel}</span>
                        {weapon.isFinesse && (
                          <>
                            <span>• фехт.</span>
                            <span onClick={(e) => e.stopPropagation()}>
                              <HelpTooltip
                                content={<TooltipBody title={FINESSE_TOOLTIP.title} lines={FINESSE_TOOLTIP.lines} />}
                                iconSize="xs"
                                side="top"
                              />
                            </span>
                          </>
                        )}
                        {isProficient && (
                          <>
                            <span>• влад.</span>
                            <span onClick={(e) => e.stopPropagation()}>
                              <HelpTooltip
                                content={<TooltipBody title={WEAPON_PROFICIENCY_TOOLTIP(proficiencyBonus).title} lines={WEAPON_PROFICIENCY_TOOLTIP(proficiencyBonus).lines} />}
                                iconSize="xs"
                                side="top"
                              />
                            </span>
                          </>
                        )}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {weapon.damage}{damageModStr} {weapon.damageType}
                      {weapon.properties && ` • ${weapon.properties}`}
                    </div>
                  </div>

                  {/* Desktop inline buttons */}
                  {!isEditing && (
                    <div className="hidden sm:flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                      <HelpTooltip
                        content={`Атака: 1d20${formatModifier(totalAttack)}${!isProficient ? " (без владения)" : ""}`}
                        side="top"
                        asChild
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 gap-1"
                          onClick={() => onRollAttack(weapon, totalAttack, isProficient)}
                          data-testid={`button-attack-${weapon.id}`}
                        >
                          <Dices className="w-3 h-3" />
                          <span className="text-xs">{formatModifier(totalAttack)}</span>
                        </Button>
                      </HelpTooltip>
                      <HelpTooltip
                        content={`Урон: ${weapon.damage}${damageModStr}`}
                        side="top"
                        asChild
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2"
                          onClick={() => onRollDamage(weapon, abilityModValue)}
                          data-testid={`button-damage-${weapon.id}`}
                        >
                          <span className="text-xs">{weapon.damage}{damageModStr}</span>
                        </Button>
                      </HelpTooltip>
                    </div>
                  )}

                  {/* Delete button (edit mode) */}
                  {canModify && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive h-9 w-9 sm:h-8 sm:w-8 shrink-0"
                      onClick={(e) => { e.stopPropagation(); removeWeapon(weapon.id); }}
                      data-testid={`button-remove-weapon-${weapon.id}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}

                  {/* Mobile chevron */}
                  {!isEditing && (
                    <ChevronDown
                      className={`sm:hidden w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-150 ${isExpanded ? "rotate-180" : ""}`}
                    />
                  )}
                </div>

                {/* Mobile accordion panel */}
                {!isEditing && isExpanded && (
                  <div className="sm:hidden px-2 pb-2 grid grid-cols-2 gap-2 animate-in slide-in-from-top-1 fade-in-0 duration-150">
                    <Button
                      variant="outline"
                      className="h-14 flex-col gap-1"
                      onClick={() => onRollAttack(weapon, totalAttack, isProficient)}
                      data-testid={`button-attack-${weapon.id}-mobile`}
                    >
                      <span className="text-[10px] font-bold tracking-widest text-muted-foreground">АТАКА</span>
                      <span className="text-base font-bold font-mono">1d20{formatModifier(totalAttack)}</span>
                    </Button>
                    <Button
                      variant="outline"
                      className="h-14 flex-col gap-1"
                      onClick={() => onRollDamage(weapon, abilityModValue)}
                      data-testid={`button-damage-${weapon.id}-mobile`}
                    >
                      <span className="text-[10px] font-bold tracking-widest text-muted-foreground">УРОН</span>
                      <span className="text-base font-bold font-mono">{weapon.damage}{damageModStr}</span>
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
