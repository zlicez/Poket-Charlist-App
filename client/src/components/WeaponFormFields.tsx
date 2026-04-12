import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { WeaponFormValues, WeaponCategory } from "@/lib/weapons";
import type { WeaponAbilityMod } from "@shared/schema";

const WEAPON_PROPERTIES_LIST = [
  "Двуручное",
  "Лёгкое",
  "Метательное",
  "Тяжёлое",
  "Универсальное",
  "Фехтовальное",
  "Боеприпасы",
  "Перезарядка",
  "Досягаемость",
  "Специальное",
] as const;

interface WeaponFormFieldsProps {
  values: WeaponFormValues;
  onChange: (updates: Partial<WeaponFormValues>) => void;
}

export function WeaponFormFields({ values, onChange }: WeaponFormFieldsProps) {
  const toggleProperty = (prop: string) => {
    const next = values.properties.includes(prop)
      ? values.properties.filter((p) => p !== prop)
      : [...values.properties, prop];
    // Auto-set abilityMod to dex when Фехтовальное is selected
    const isFinesse = next.some((p) => p.toLowerCase().includes("фехтовальное"));
    onChange({ properties: next, ...(isFinesse ? { abilityMod: "dex" } : {}) });
  };

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
          <label className="text-sm text-muted-foreground">Модификатор</label>
          <Select
            value={values.abilityMod}
            onValueChange={(v) => onChange({ abilityMod: v as WeaponAbilityMod })}
          >
            <SelectTrigger data-testid="select-weapon-ability">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="str">Сила (СИЛ)</SelectItem>
              <SelectItem value="dex">Ловкость (ЛОВ)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <label className="text-sm text-muted-foreground">Категория</label>
        <Select
          value={values.weaponCategory ?? ""}
          onValueChange={(v) =>
            onChange({ weaponCategory: (v || undefined) as WeaponCategory | undefined })
          }
        >
          <SelectTrigger data-testid="select-weapon-category">
            <SelectValue placeholder="Выберите категорию..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="simple">Простое</SelectItem>
            <SelectItem value="martial">Воинское</SelectItem>
            <SelectItem value="exotic">Экзотическое</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <label className="text-sm text-muted-foreground mb-1.5 block">Свойства</label>
        <div className="flex flex-wrap gap-1.5" data-testid="weapon-properties-chips">
          {WEAPON_PROPERTIES_LIST.map((prop) => {
            const isSelected = values.properties.includes(prop);
            return (
              <button
                key={prop}
                type="button"
                onClick={() => toggleProperty(prop)}
                className={`px-2.5 py-0.5 rounded-full text-xs border transition-colors select-none ${
                  isSelected
                    ? "bg-accent/20 border-accent/60 text-accent"
                    : "border-border text-muted-foreground hover:border-accent/40 hover:text-foreground"
                }`}
                data-testid={`chip-prop-${prop}`}
              >
                {prop}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
