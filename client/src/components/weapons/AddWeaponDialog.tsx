import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogFooter,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogTrigger,
} from "@/components/ui/responsive-dialog";
import { Plus } from "lucide-react";
import { WeaponFormFields } from "@/components/WeaponFormFields";
import {
  DEFAULT_WEAPON_FORM_VALUES,
  type WeaponFormValues,
} from "@/lib/weapons";

export function AddWeaponDialog({
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
