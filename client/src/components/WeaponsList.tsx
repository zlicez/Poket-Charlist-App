import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Swords, Plus, Trash2, Dices, Lock, Unlock, Backpack } from "lucide-react";
import type { Weapon, Equipment, WeaponAbilityMod, Proficiencies } from "@shared/schema";
import { formatModifier, isWeaponProficient } from "@shared/schema";

interface WeaponsListProps {
  weapons: Weapon[];
  onChange: (weapons: Weapon[]) => void;
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

function AddWeaponDialog({ onAdd }: { onAdd: (weapon: Omit<Weapon, "id">) => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [attackBonus, setAttackBonus] = useState(0);
  const [damage, setDamage] = useState("1d8");
  const [damageType, setDamageType] = useState("рубящий");
  const [properties, setProperties] = useState("");
  const [abilityMod, setAbilityMod] = useState<WeaponAbilityMod>("str");
  const [isFinesse, setIsFinesse] = useState(false);

  const handleSubmit = () => {
    if (!name.trim()) return;
    onAdd({ name, attackBonus, damage, damageType, properties, abilityMod, isFinesse });
    setName("");
    setAttackBonus(0);
    setDamage("1d8");
    setDamageType("рубящий");
    setProperties("");
    setAbilityMod("str");
    setIsFinesse(false);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1" data-testid="button-add-weapon">
          <Plus className="w-4 h-4" />
          Добавить
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Добавить оружие</DialogTitle>
        </DialogHeader>
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-muted-foreground">Бонус атаки</label>
              <Input
                type="number"
                value={attackBonus}
                onChange={(e) => setAttackBonus(parseInt(e.target.value) || 0)}
                data-testid="input-weapon-attack"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Урон</label>
              <Input
                value={damage}
                onChange={(e) => setDamage(e.target.value)}
                placeholder="1d8"
                data-testid="input-weapon-damage"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-muted-foreground">Тип урона</label>
              <Input
                value={damageType}
                onChange={(e) => setDamageType(e.target.value)}
                placeholder="рубящий"
                data-testid="input-weapon-damage-type"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Свойства</label>
              <Input
                value={properties}
                onChange={(e) => setProperties(e.target.value)}
                placeholder="универсальное"
                data-testid="input-weapon-properties"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-muted-foreground">Модификатор</label>
              <Select value={abilityMod} onValueChange={(v) => setAbilityMod(v as WeaponAbilityMod)}>
                <SelectTrigger data-testid="select-weapon-ability">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="str">Сила (СИЛ)</SelectItem>
                  <SelectItem value="dex">Ловкость (ЛОВ)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer h-9">
                <input
                  type="checkbox"
                  checked={isFinesse}
                  onChange={(e) => setIsFinesse(e.target.checked)}
                  className="rounded"
                  data-testid="checkbox-weapon-finesse"
                />
                <span className="text-sm">Фехтовальное</span>
              </label>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Отмена</Button>
          <Button onClick={handleSubmit} data-testid="button-save-weapon">Сохранить</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function WeaponsList({ 
  weapons, 
  onChange, 
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

  const getAbilityMod = (abilityMod: WeaponAbilityMod | undefined) => {
    return abilityMod === "dex" ? dexMod : strMod;
  };

  const equippedWeapons = useMemo(() => {
    return equippedFromInventory
      .filter(e => e.isWeapon && e.equipped)
      .map(e => ({
        id: e.id,
        name: e.name,
        attackBonus: e.attackBonus || 0,
        damage: e.damage || "1d4",
        damageType: e.damageType || "дробящий",
        properties: e.weaponProperties,
        fromInventory: true,
        abilityMod: (e.abilityMod || "str") as WeaponAbilityMod,
        isFinesse: e.isFinesse,
      }));
  }, [equippedFromInventory]);

  const addWeapon = (weapon: Omit<Weapon, "id">) => {
    onChange([...weapons, { ...weapon, id: crypto.randomUUID() }]);
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
          <h3 className="font-semibold text-xs sm:text-sm">Оружие</h3>
          {hasEquippedWeapons && (
            <Badge variant="secondary" className="text-[10px] h-4 px-1.5">
              {equippedWeapons.length} экип.
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1">
          {!isEditing && onToggleLock && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onToggleLock}
                  className={isLocked ? "text-muted-foreground" : "text-accent"}
                  data-testid="button-toggle-weapons-lock"
                >
                  {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isLocked ? "Разблокировать редактирование" : "Заблокировать редактирование"}
              </TooltipContent>
            </Tooltip>
          )}
          {canModify && <AddWeaponDialog onAdd={addWeapon} />}
        </div>
      </div>

      {allWeapons.length === 0 ? (
        <div className="text-center py-4 text-muted-foreground text-sm">
          {isEditing ? "Нажмите \"Добавить\" или экипируйте оружие в снаряжении" : "Нет оружия"}
        </div>
      ) : (
        <div className="space-y-2">
          {equippedWeapons.map((weapon) => {
            const abilityModValue = getAbilityMod(weapon.abilityMod);
            const isProficient = isWeaponProficient(weapon.name, proficiencies);
            const profBonus = isProficient ? proficiencyBonus : 0;
            const totalAttack = profBonus + abilityModValue + weapon.attackBonus;
            const damageModStr = abilityModValue !== 0 ? formatModifier(abilityModValue) : "";
            const abilityLabel = weapon.abilityMod === "dex" ? "ЛОВ" : "СИЛ";
            
            return (
              <div 
                key={`inv-${weapon.id}`}
                className="flex items-center gap-2 p-2 rounded-md bg-accent/10"
                data-testid={`weapon-inv-${weapon.id}`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <Backpack className="w-3 h-3 text-accent shrink-0" />
                    <span className="font-medium text-sm truncate text-accent">{weapon.name}</span>
                    <Badge variant="outline" className="text-[9px] h-4 px-1">{abilityLabel}</Badge>
                    {weapon.isFinesse && <Badge variant="secondary" className="text-[9px] h-4 px-1">Фехт.</Badge>}
                    {isProficient && <Badge variant="default" className="text-[9px] h-4 px-1 bg-green-600">Влад.</Badge>}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {weapon.damage}{damageModStr} {weapon.damageType}
                    {weapon.properties && ` • ${weapon.properties}`}
                  </div>
                </div>

                {!isEditing && (
                  <div className="flex items-center gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
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
                      </TooltipTrigger>
                      <TooltipContent>Атака: 1d20{formatModifier(totalAttack)}{!isProficient && " (без владения)"}</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 px-2"
                          onClick={() => onRollDamage(weapon as Weapon, abilityModValue)}
                          data-testid={`button-damage-inv-${weapon.id}`}
                        >
                          <span className="text-xs">{weapon.damage}{damageModStr}</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Урон: {weapon.damage}{damageModStr}</TooltipContent>
                    </Tooltip>
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
            
            return (
              <div 
                key={weapon.id}
                className="flex items-center gap-2 p-2 rounded-md bg-muted/30"
                data-testid={`weapon-${weapon.id}`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-medium text-sm truncate">{weapon.name}</span>
                    <Badge variant="outline" className="text-[9px] h-4 px-1">{abilityLabel}</Badge>
                    {weapon.isFinesse && <Badge variant="secondary" className="text-[9px] h-4 px-1">Фехт.</Badge>}
                    {isProficient && <Badge variant="default" className="text-[9px] h-4 px-1 bg-green-600">Влад.</Badge>}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {weapon.damage}{damageModStr} {weapon.damageType}
                    {weapon.properties && ` • ${weapon.properties}`}
                  </div>
                </div>

                {!isEditing && (
                  <div className="flex items-center gap-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
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
                      </TooltipTrigger>
                      <TooltipContent>Атака: 1d20{formatModifier(totalAttack)}{!isProficient && " (без владения)"}</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-7 px-2"
                          onClick={() => onRollDamage(weapon, abilityModValue)}
                          data-testid={`button-damage-${weapon.id}`}
                        >
                          <span className="text-xs">{weapon.damage}{damageModStr}</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Урон: {weapon.damage}{damageModStr}</TooltipContent>
                    </Tooltip>
                  </div>
                )}

                {canModify && (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-destructive"
                    onClick={() => removeWeapon(weapon.id)}
                    data-testid={`button-remove-weapon-${weapon.id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
