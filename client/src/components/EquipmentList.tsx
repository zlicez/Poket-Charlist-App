import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Backpack, Plus, Trash2, Package, Shield, ShieldCheck, Lock, Unlock } from "lucide-react";
import { ARMOR_LIST } from "@shared/schema";
import type { Equipment, ArmorType } from "@shared/schema";

interface EquipmentListProps {
  equipment: Equipment[];
  onChange: (equipment: Equipment[]) => void;
  isEditing: boolean;
  isLocked?: boolean;
  onToggleLock?: () => void;
}

function AddEquipmentDialog({ onAdd }: { onAdd: (item: Omit<Equipment, "id">) => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [weight, setWeight] = useState<number | undefined>(undefined);
  const [description, setDescription] = useState("");
  const [isArmor, setIsArmor] = useState(false);
  const [selectedArmor, setSelectedArmor] = useState("");

  const handleSubmit = () => {
    if (isArmor && selectedArmor) {
      const armor = ARMOR_LIST.find(a => a.name === selectedArmor);
      if (armor) {
        onAdd({ 
          name: armor.name, 
          quantity: 1, 
          weight, 
          description,
          isArmor: true,
          armorType: armor.type,
          armorBaseAC: armor.baseAC,
          armorMaxDexBonus: armor.maxDexBonus,
          equipped: false
        });
      }
    } else if (name.trim()) {
      onAdd({ name, quantity, weight, description });
    } else {
      return;
    }
    
    setName("");
    setQuantity(1);
    setWeight(undefined);
    setDescription("");
    setIsArmor(false);
    setSelectedArmor("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1" data-testid="button-add-equipment">
          <Plus className="w-4 h-4" />
          Добавить
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Добавить снаряжение</DialogTitle>
          <DialogDescription>
            Добавьте предмет в инвентарь персонажа
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Checkbox
              id="is-armor"
              checked={isArmor}
              onCheckedChange={(checked) => {
                setIsArmor(!!checked);
                if (!checked) setSelectedArmor("");
              }}
              data-testid="checkbox-is-armor"
            />
            <label htmlFor="is-armor" className="text-sm">Это доспех или щит</label>
          </div>

          {isArmor ? (
            <div>
              <label className="text-sm text-muted-foreground">Выберите доспех</label>
              <Select value={selectedArmor} onValueChange={setSelectedArmor}>
                <SelectTrigger data-testid="select-armor">
                  <SelectValue placeholder="Выберите доспех" />
                </SelectTrigger>
                <SelectContent>
                  {ARMOR_LIST.filter(a => a.name !== "Без доспехов").map((armor) => (
                    <SelectItem key={armor.name} value={armor.name}>
                      {armor.name} (КД {armor.baseAC}{armor.type !== "heavy" && armor.type !== "shield" ? " + ЛОВ" : ""}{armor.maxDexBonus !== null && armor.maxDexBonus < 99 ? ` макс. ${armor.maxDexBonus}` : ""})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div>
              <label className="text-sm text-muted-foreground">Название</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Факел"
                data-testid="input-equipment-name"
              />
            </div>
          )}

          {!isArmor && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm text-muted-foreground">Количество</label>
                <Input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  data-testid="input-equipment-quantity"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground">Вес (фунты)</label>
                <Input
                  type="number"
                  min={0}
                  step={0.1}
                  value={weight ?? ""}
                  onChange={(e) => setWeight(e.target.value ? parseFloat(e.target.value) : undefined)}
                  placeholder="1"
                  data-testid="input-equipment-weight"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-sm text-muted-foreground">Описание (опционально)</label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Горит 1 час, освещает 20 футов"
              data-testid="input-equipment-description"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Отмена</Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isArmor ? !selectedArmor : !name.trim()}
            data-testid="button-save-equipment"
          >
            Сохранить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function EquipmentList({ equipment, onChange, isEditing, isLocked = false, onToggleLock }: EquipmentListProps) {
  const canModify = isEditing || !isLocked;
  const addEquipment = (item: Omit<Equipment, "id">) => {
    onChange([...equipment, { ...item, id: crypto.randomUUID() }]);
  };

  const removeEquipment = (id: string) => {
    onChange(equipment.filter((e) => e.id !== id));
  };

  const toggleEquipped = (id: string) => {
    const toggledItem = equipment.find(e => e.id === id);
    if (!toggledItem || !toggledItem.isArmor) return;
    
    const isEquipping = !toggledItem.equipped;
    const isNonShieldArmor = toggledItem.armorType !== "shield";
    
    onChange(equipment.map((e) => {
      if (e.id === id) {
        return { ...e, equipped: isEquipping };
      }
      if (isEquipping && isNonShieldArmor && e.isArmor && e.armorType !== "shield") {
        return { ...e, equipped: false };
      }
      return e;
    }));
  };

  const updateQuantity = (id: string, delta: number) => {
    onChange(equipment.map((e) => {
      if (e.id === id) {
        const newQty = Math.max(0, e.quantity + delta);
        return newQty === 0 ? null : { ...e, quantity: newQty };
      }
      return e;
    }).filter(Boolean) as Equipment[]);
  };

  const totalWeight = equipment.reduce((sum, e) => sum + (e.weight || 0) * e.quantity, 0);
  const equippedArmor = equipment.filter(e => e.isArmor && e.equipped);

  return (
    <Card className="stat-card p-2 sm:p-3">
      <div className="flex items-center justify-between mb-2 sm:mb-3">
        <div className="flex items-center gap-2">
          <Backpack className="w-4 h-4 text-accent" />
          <h3 className="font-semibold text-xs sm:text-sm">Снаряжение</h3>
          {totalWeight > 0 && (
            <Badge variant="outline" className="text-[10px] sm:text-xs">
              {totalWeight.toFixed(1)} ф.
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
                  data-testid="button-toggle-equipment-lock"
                >
                  {isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isLocked ? "Разблокировать редактирование" : "Заблокировать редактирование"}
              </TooltipContent>
            </Tooltip>
          )}
          {canModify && <AddEquipmentDialog onAdd={addEquipment} />}
        </div>
      </div>

      {equippedArmor.length > 0 && (
        <div className="mb-2 p-2 bg-accent/10 rounded-md">
          <div className="text-xs text-muted-foreground mb-1">Надето:</div>
          <div className="flex flex-wrap gap-1">
            {equippedArmor.map((item) => (
              <Badge key={item.id} variant="secondary" className="gap-1">
                <ShieldCheck className="w-3 h-3" />
                {item.name}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {equipment.length === 0 ? (
        <div className="text-center py-4 text-muted-foreground text-sm">
          <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
          {isEditing ? "Нажмите \"Добавить\" чтобы добавить предмет" : "Рюкзак пуст"}
        </div>
      ) : (
        <div className="space-y-1">
          {equipment.map((item, index) => (
            <div 
              key={item.id}
              className={`flex items-center gap-2 py-1.5 px-2 rounded-md hover-elevate ${item.equipped ? 'bg-accent/5' : ''}`}
              data-testid={`equipment-item-${index}`}
            >
              {item.isArmor && (
                <Button
                  variant="ghost"
                  size="icon"
                  className={item.equipped ? 'text-accent' : 'text-muted-foreground'}
                  onClick={() => toggleEquipped(item.id)}
                  data-testid={`button-equip-${index}`}
                  aria-label={item.equipped ? "Снять" : "Надеть"}
                >
                  {item.equipped ? <ShieldCheck className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                </Button>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-medium ${item.equipped ? 'text-accent' : ''}`}>{item.name}</span>
                  {item.quantity > 1 && (
                    <Badge variant="secondary" className="text-xs">x{item.quantity}</Badge>
                  )}
                  {item.isArmor && (
                    <Badge variant="outline" className="text-xs">
                      КД {item.armorBaseAC}
                    </Badge>
                  )}
                </div>
                {item.description && (
                  <div className="text-xs text-muted-foreground truncate">{item.description}</div>
                )}
              </div>

              {item.weight !== undefined && (
                <span className="text-xs text-muted-foreground shrink-0">
                  {(item.weight * item.quantity).toFixed(1)} ф.
                </span>
              )}

              {!isEditing && !item.isArmor && (
                <div className="flex items-center gap-0.5">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6"
                    onClick={() => updateQuantity(item.id, -1)}
                    data-testid={`button-equipment-minus-${index}`}
                    aria-label="Уменьшить количество"
                  >
                    -
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6"
                    onClick={() => updateQuantity(item.id, 1)}
                    data-testid={`button-equipment-plus-${index}`}
                    aria-label="Увеличить количество"
                  >
                    +
                  </Button>
                </div>
              )}

              {canModify && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 text-destructive shrink-0"
                  onClick={() => removeEquipment(item.id)}
                  data-testid={`button-remove-equipment-${index}`}
                  aria-label="Удалить предмет"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
