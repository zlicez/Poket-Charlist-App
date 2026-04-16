import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { WeaponGripToggle } from "@/components/WeaponGripToggle";
import type { WeaponFormValues, WeaponCategory } from "@/lib/weapons";
import { WEAPON_PROPERTIES, type WeaponAbilityMod } from "@shared/schema";

interface WeaponFormFieldsProps {
  values: WeaponFormValues;
  onChange: (updates: Partial<WeaponFormValues>) => void;
}

const VERSATILE_PROPERTY_LABEL = "Универсальное";
const FINESSE_PROPERTY_LABEL = "Фехтовальное";

export function WeaponFormFields({ values, onChange }: WeaponFormFieldsProps) {
  const isVersatile = values.properties.includes(VERSATILE_PROPERTY_LABEL);

  const toggleProperty = (property: string) => {
    const nextProperties = values.properties.includes(property)
      ? values.properties.filter((value) => value !== property)
      : [...values.properties, property];
    const isFinesse = nextProperties.includes(FINESSE_PROPERTY_LABEL);
    const nextIsVersatile = nextProperties.includes(VERSATILE_PROPERTY_LABEL);

    onChange({
      properties: nextProperties,
      abilityMod: isFinesse ? "dex" : values.abilityMod,
      versatileDamage: nextIsVersatile ? values.versatileDamage : "",
      gripMode: nextIsVersatile ? values.gripMode : "oneHand",
    });
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm text-muted-foreground">Бонус атаки</label>
          <Input
            type="number"
            value={values.attackBonus}
            onChange={(e) => onChange({ attackBonus: parseInt(e.target.value, 10) || 0 })}
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
            onValueChange={(value) => onChange({ abilityMod: value as WeaponAbilityMod })}
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
          onValueChange={(value) =>
            onChange({ weaponCategory: (value || undefined) as WeaponCategory | undefined })
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
          {WEAPON_PROPERTIES.map((property) => {
            const isSelected = values.properties.includes(property);
            return (
              <button
                key={property}
                type="button"
                onClick={() => toggleProperty(property)}
                className={`px-2.5 py-0.5 rounded-full text-xs border transition-colors select-none ${
                  isSelected
                    ? "bg-accent/20 border-accent/60 text-accent"
                    : "border-border text-muted-foreground hover:border-accent/40 hover:text-foreground"
                }`}
                data-testid={`chip-prop-${property}`}
              >
                {property}
              </button>
            );
          })}
        </div>
      </div>

      {isVersatile && (
        <div className="rounded-md border border-border/70 bg-muted/20 p-3 space-y-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex-1">
              <label className="text-sm text-muted-foreground">Урон в двух руках</label>
              <Input
                value={values.versatileDamage}
                onChange={(e) => onChange({ versatileDamage: e.target.value })}
                placeholder="1d10"
                data-testid="input-weapon-versatile-damage"
              />
            </div>
            <div className="sm:pb-[1px]">
              <span className="mb-1 block text-sm text-muted-foreground">Текущий хват</span>
              <WeaponGripToggle
                value={values.gripMode}
                onChange={(gripMode) => onChange({ gripMode })}
                testIdPrefix="weapon-form-grip"
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Переключатель влияет на формулу урона для этого оружия в листе персонажа.
          </p>
        </div>
      )}
    </div>
  );
}
