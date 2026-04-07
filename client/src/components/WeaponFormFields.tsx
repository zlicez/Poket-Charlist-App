import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { WeaponFormValues } from "@/lib/weapons";
import type { WeaponAbilityMod } from "@shared/schema";

interface WeaponFormFieldsProps {
  values: WeaponFormValues;
  onChange: (updates: Partial<WeaponFormValues>) => void;
}

export function WeaponFormFields({ values, onChange }: WeaponFormFieldsProps) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm text-muted-foreground">Бонус атаки</label>
          <Input
            type="number"
            value={values.attackBonus}
            onChange={(e) => onChange({ attackBonus: parseInt(e.target.value) || 0 })}
            data-testid="input-weapon-attack"
          />
        </div>
        <div>
          <label className="text-sm text-muted-foreground">Урон</label>
          <Input
            value={values.damage}
            onChange={(e) => onChange({ damage: e.target.value })}
            placeholder="1d8"
            data-testid="input-weapon-damage"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm text-muted-foreground">Тип урона</label>
          <Input
            value={values.damageType}
            onChange={(e) => onChange({ damageType: e.target.value })}
            placeholder="рубящий"
            data-testid="input-weapon-damage-type"
          />
        </div>
        <div>
          <label className="text-sm text-muted-foreground">Свойства</label>
          <Input
            value={values.properties}
            onChange={(e) => onChange({ properties: e.target.value })}
            placeholder="универсальное"
            data-testid="input-weapon-properties"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm text-muted-foreground">Модификатор</label>
          <Select value={values.abilityMod} onValueChange={(v) => onChange({ abilityMod: v as WeaponAbilityMod })}>
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
          <label className="flex items-center gap-2 cursor-pointer h-10 min-h-[40px]">
            <input
              type="checkbox"
              checked={values.isFinesse}
              onChange={(e) => onChange({ isFinesse: e.target.checked })}
              className="rounded w-5 h-5"
              data-testid="checkbox-weapon-finesse"
            />
            <span className="text-sm">Фехтовальное</span>
          </label>
        </div>
      </div>
    </div>
  );
}
