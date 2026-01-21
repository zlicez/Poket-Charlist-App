import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Backpack, Plus, Trash2, Package } from "lucide-react";
import type { Equipment } from "@shared/schema";

interface EquipmentListProps {
  equipment: Equipment[];
  onChange: (equipment: Equipment[]) => void;
  isEditing: boolean;
}

function AddEquipmentDialog({ onAdd }: { onAdd: (item: Omit<Equipment, "id">) => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [weight, setWeight] = useState<number | undefined>(undefined);
  const [description, setDescription] = useState("");

  const handleSubmit = () => {
    if (!name.trim()) return;
    onAdd({ name, quantity, weight, description });
    setName("");
    setQuantity(1);
    setWeight(undefined);
    setDescription("");
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
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <label className="text-sm text-muted-foreground">Название</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Факел"
              data-testid="input-equipment-name"
            />
          </div>
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
          <Button onClick={handleSubmit} data-testid="button-save-equipment">Сохранить</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function EquipmentList({ equipment, onChange, isEditing }: EquipmentListProps) {
  const addEquipment = (item: Omit<Equipment, "id">) => {
    onChange([...equipment, { ...item, id: crypto.randomUUID() }]);
  };

  const removeEquipment = (id: string) => {
    onChange(equipment.filter((e) => e.id !== id));
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

  return (
    <Card className="stat-card p-3">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Backpack className="w-4 h-4 text-accent" />
          <h3 className="font-semibold text-sm">Снаряжение</h3>
          {totalWeight > 0 && (
            <Badge variant="outline" className="text-xs">
              {totalWeight.toFixed(1)} фунтов
            </Badge>
          )}
        </div>
        {isEditing && <AddEquipmentDialog onAdd={addEquipment} />}
      </div>

      {equipment.length === 0 ? (
        <div className="text-center py-4 text-muted-foreground text-sm">
          <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
          {isEditing ? "Нажмите \"Добавить\" чтобы добавить предмет" : "Рюкзак пуст"}
        </div>
      ) : (
        <div className="space-y-1">
          {equipment.map((item) => (
            <div 
              key={item.id}
              className="flex items-center gap-2 py-1.5 px-2 rounded-md hover-elevate"
              data-testid={`equipment-${item.id}`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{item.name}</span>
                  {item.quantity > 1 && (
                    <Badge variant="secondary" className="text-xs">x{item.quantity}</Badge>
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

              {!isEditing && (
                <div className="flex items-center gap-0.5">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6"
                    onClick={() => updateQuantity(item.id, -1)}
                    data-testid={`button-equipment-minus-${item.id}`}
                  >
                    -
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-6 w-6"
                    onClick={() => updateQuantity(item.id, 1)}
                    data-testid={`button-equipment-plus-${item.id}`}
                  >
                    +
                  </Button>
                </div>
              )}

              {isEditing && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 text-destructive shrink-0"
                  onClick={() => removeEquipment(item.id)}
                  data-testid={`button-remove-equipment-${item.id}`}
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
