import { useMemo, useState } from "react";
import { generateId } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HelpTooltip, TooltipBody } from "@/components/ui/help-tooltip";
import {
  WEAPON_PROFICIENCY_TOOLTIP,
  FINESSE_TOOLTIP,
} from "@/lib/tooltip-content";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogTrigger,
} from "@/components/ui/responsive-dialog";
import { WeaponGripToggle } from "@/components/WeaponGripToggle";
import {
  Backpack,
  ChevronDown,
  Dices,
  Lock,
  Plus,
  Swords,
  Trash2,
  Unlock,
} from "lucide-react";
import type {
  Equipment,
  Proficiencies,
  Weapon,
  WeaponAbilityMod,
  WeaponGripMode,
} from "@shared/schema";
import { formatModifier, isWeaponProficient } from "@shared/schema";
import { WeaponFormFields } from "@/components/WeaponFormFields";
import {
  DEFAULT_WEAPON_FORM_VALUES,
  createEquipmentWeaponFromForm,
  createWeaponFromForm,
  getActiveWeaponDamage,
  getEquippedInventoryWeapons,
  getWeaponPropertiesDisplay,
  hasVersatileDamage,
  normalizeWeaponGripMode,
  type WeaponFormValues,
} from "@/lib/weapons";

interface WeaponsListProps {
  weapons: Weapon[];
  onChange: (weapons: Weapon[]) => void;
  onAddInventoryWeapon?: (weapon: Omit<Equipment, "id">) => void;
  onRollAttack: (weapon: Weapon, totalAttackBonus: number, isProficient: boolean) => void;
  onRollDamage: (weapon: Weapon, damageModifier: number) => void;
  onWeaponGripChange?: (weaponId: string, gripMode: WeaponGripMode) => void;
  onInventoryWeaponGripChange?: (weaponId: string, gripMode: WeaponGripMode) => void;
  allowGripToggle?: boolean;
  isEditing: boolean;
  isLocked?: boolean;
  onToggleLock?: () => void;
  equippedFromInventory?: Equipment[];
  strMod?: number;
  dexMod?: number;
  proficiencyBonus?: number;
  proficiencies?: Proficiencies;
}

type ListedWeapon = Weapon & {
  sourceId: string;
  fromInventory?: boolean;
};

const CATEGORY_LABELS: Record<string, string> = {
  simple: "прост.",
  martial: "воин.",
  exotic: "экзот.",
};

function AddWeaponDialog({
  onAdd,
}: {
  onAdd: (name: string, weapon: WeaponFormValues) => void;
}) {
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
        <Button
          variant="outline"
          size="sm"
          className="gap-1 h-9 sm:h-8"
          data-testid="button-add-weapon"
        >
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
          <Button variant="outline" onClick={() => setOpen(false)}>
            Отмена
          </Button>
          <Button onClick={handleSubmit} data-testid="button-save-weapon">
            Сохранить
          </Button>
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
  onWeaponGripChange,
  onInventoryWeaponGripChange,
  allowGripToggle = true,
  isEditing,
  isLocked = false,
  onToggleLock,
  equippedFromInventory = [],
  strMod = 0,
  dexMod = 0,
  proficiencyBonus = 2,
  proficiencies = { languages: [], weapons: [], armor: [], tools: [] },
}: WeaponsListProps) {
  const canModify = isEditing || !isLocked;
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpanded = (id: string) => {
    if (!isEditing) {
      setExpandedId((prev) => (prev === id ? null : id));
    }
  };

  const getAbilityMod = (abilityMod: WeaponAbilityMod | undefined) =>
    abilityMod === "dex" ? dexMod : strMod;

  const equippedWeapons = useMemo<ListedWeapon[]>(() => {
    return getEquippedInventoryWeapons(equippedFromInventory).map((weapon) => ({
      ...weapon,
      sourceId: `inv-${weapon.id}`,
      fromInventory: true,
    }));
  }, [equippedFromInventory]);

  const listedWeapons = useMemo<ListedWeapon[]>(
    () =>
      weapons.map((weapon) => ({
        ...weapon,
        sourceId: weapon.id,
      })),
    [weapons],
  );

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
        id: generateId(),
      },
    ]);
  };

  const removeWeapon = (id: string) => {
    onChange(weapons.filter((weapon) => weapon.id !== id));
  };

  const renderWeaponCard = (weapon: ListedWeapon) => {
    const abilityModValue = getAbilityMod(weapon.abilityMod);
    const isProficient = isWeaponProficient(
      weapon.name,
      proficiencies,
      weapon.weaponCategory,
    );
    const profBonus = isProficient ? proficiencyBonus : 0;
    const totalAttack = profBonus + abilityModValue + weapon.attackBonus;
    const damageModStr = abilityModValue !== 0 ? formatModifier(abilityModValue) : "";
    const abilityLabel = weapon.abilityMod === "dex" ? "ЛОВ" : "СИЛ";
    const propertiesDisplay = getWeaponPropertiesDisplay(
      weapon.properties,
      weapon.versatileDamage,
    );
    const activeDamage = getActiveWeaponDamage(weapon);
    const isVersatile = hasVersatileDamage(weapon);
    const gripMode = normalizeWeaponGripMode(weapon);
    const gripBadgeLabel = gripMode === "twoHand" ? "2р" : "1р";
    const canToggleGrip =
      allowGripToggle &&
      isVersatile &&
      (weapon.fromInventory
        ? Boolean(onInventoryWeaponGripChange)
        : Boolean(onWeaponGripChange));
    const isExpanded = expandedId === weapon.sourceId;
    const cardClassName = weapon.fromInventory
      ? "rounded-md bg-accent/10 overflow-hidden"
      : "rounded-md bg-muted/30 overflow-hidden";
    const titleClassName = weapon.fromInventory
      ? "font-medium text-sm truncate text-accent"
      : "font-medium text-sm truncate";
    const desktopGripToggle = canToggleGrip ? (
      <WeaponGripToggle
        value={gripMode}
        onChange={(nextGripMode) => {
          if (weapon.fromInventory) {
            onInventoryWeaponGripChange?.(weapon.id, nextGripMode);
          } else {
            onWeaponGripChange?.(weapon.id, nextGripMode);
          }
        }}
        size="xs"
        className="mr-1"
        testIdPrefix={`weapon-grip-${weapon.sourceId}`}
      />
    ) : null;

    return (
      <div
        key={weapon.sourceId}
        className={cardClassName}
        data-testid={weapon.fromInventory ? `weapon-inv-${weapon.id}` : `weapon-${weapon.id}`}
      >
        <div
          className="flex items-center gap-2 p-2 cursor-pointer select-none"
          onClick={() => toggleExpanded(weapon.sourceId)}
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              {weapon.fromInventory && (
                <Backpack className="w-3 h-3 text-accent shrink-0" />
              )}
              <span className={titleClassName}>{weapon.name}</span>
              <span className="flex items-center gap-0.5 text-xs text-muted-foreground flex-wrap">
                <span>{abilityLabel}</span>
                {weapon.weaponCategory && (
                  <span>• {CATEGORY_LABELS[weapon.weaponCategory] ?? weapon.weaponCategory}</span>
                )}
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
                        content={
                          <TooltipBody
                            title={WEAPON_PROFICIENCY_TOOLTIP(proficiencyBonus).title}
                            lines={WEAPON_PROFICIENCY_TOOLTIP(proficiencyBonus).lines}
                          />
                        }
                        iconSize="xs"
                        side="top"
                      />
                    </span>
                  </>
                )}
                {isVersatile && <span>• {gripBadgeLabel}</span>}
              </span>
            </div>
            <div className="text-xs text-muted-foreground">
              {activeDamage}
              {damageModStr} {weapon.damageType}
              {propertiesDisplay && ` • ${propertiesDisplay}`}
            </div>
          </div>

          {!isEditing && (
            <div
              className="hidden sm:flex items-center gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              {desktopGripToggle}
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
                  data-testid={`button-attack-${weapon.sourceId}`}
                >
                  <Dices className="w-3 h-3" />
                  <span className="text-xs">{formatModifier(totalAttack)}</span>
                </Button>
              </HelpTooltip>
              <HelpTooltip
                content={`Урон: ${activeDamage}${damageModStr}`}
                side="top"
                asChild
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2"
                  onClick={() => onRollDamage(weapon, abilityModValue)}
                  data-testid={`button-damage-${weapon.sourceId}`}
                >
                  <span className="text-xs">{activeDamage}{damageModStr}</span>
                </Button>
              </HelpTooltip>
            </div>
          )}

          {isEditing && canToggleGrip && (
            <div className="hidden sm:block" onClick={(e) => e.stopPropagation()}>
              {desktopGripToggle}
            </div>
          )}

          {!weapon.fromInventory && canModify && (
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive h-9 w-9 sm:h-8 sm:w-8 shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                removeWeapon(weapon.id);
              }}
              data-testid={`button-remove-weapon-${weapon.id}`}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}

          {!isEditing && (
            <ChevronDown
              className={`sm:hidden w-4 h-4 text-muted-foreground shrink-0 transition-transform duration-150 ${
                isExpanded ? "rotate-180" : ""
              }`}
            />
          )}
        </div>

        {!isEditing && isExpanded && (
          <div className="sm:hidden px-2 pb-2 grid grid-cols-2 gap-2 animate-in slide-in-from-top-1 fade-in-0 duration-150">
            {canToggleGrip && (
              <div className="col-span-2" onClick={(e) => e.stopPropagation()}>
                <WeaponGripToggle
                  value={gripMode}
                  onChange={(nextGripMode) => {
                    if (weapon.fromInventory) {
                      onInventoryWeaponGripChange?.(weapon.id, nextGripMode);
                    } else {
                      onWeaponGripChange?.(weapon.id, nextGripMode);
                    }
                  }}
                  className="w-full justify-center"
                  testIdPrefix={`weapon-grip-mobile-${weapon.sourceId}`}
                />
              </div>
            )}
            <Button
              variant="outline"
              className={`h-14 flex-col gap-1 ${weapon.fromInventory ? "border-accent/40" : ""}`}
              onClick={() => onRollAttack(weapon, totalAttack, isProficient)}
              data-testid={`button-attack-${weapon.sourceId}-mobile`}
            >
              <span className="text-[10px] font-bold tracking-widest text-muted-foreground">
                АТАКА
              </span>
              <span className="text-base font-bold font-mono">
                1d20{formatModifier(totalAttack)}
              </span>
            </Button>
            <Button
              variant="outline"
              className="h-14 flex-col gap-1"
              onClick={() => onRollDamage(weapon, abilityModValue)}
              data-testid={`button-damage-${weapon.sourceId}-mobile`}
            >
              <span className="text-[10px] font-bold tracking-widest text-muted-foreground">
                УРОН
              </span>
              <span className="text-base font-bold font-mono">
                {activeDamage}
                {damageModStr}
              </span>
            </Button>
          </div>
        )}
      </div>
    );
  };

  const allWeapons = [...equippedWeapons, ...listedWeapons];
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
              className={`h-9 w-9 sm:h-8 sm:w-8 ${
                isLocked ? "text-muted-foreground" : "text-accent"
              }`}
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
          {isEditing
            ? 'Нажмите "Добавить" или экипируйте оружие в снаряжении'
            : "Нет оружия"}
        </div>
      ) : (
        <div className="space-y-3">{allWeapons.map(renderWeaponCard)}</div>
      )}
    </Card>
  );
}
