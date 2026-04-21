import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";
import { typeClass } from "@/ds/tokens";
import { BottomSheet } from "@/ds/hero";
import { Button, InputField } from "@/ds/primitives";

/**
 * L-03 — Создание — имя. Handoff листит как core (1 шаг), остальную
 * настройку ждёт в edit-mode на листе персонажа (класс/раса/статы).
 *
 * MVP: BottomSheet с полем «Имя» + кнопкой «Создать». При пустом имени
 * сабмит задизаблен. После create выполняется навигация на лист.
 */
export function CreateCharacterSheet({
  open,
  onOpenChange,
  onConfirm,
  isCreating,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (name: string) => void;
  isCreating?: boolean;
}) {
  const [name, setName] = useState("");

  useEffect(() => {
    if (!open) setName("");
  }, [open]);

  const trimmed = name.trim();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!trimmed || isCreating) return;
    onConfirm(trimmed);
  };

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Новый герой"
      description="Имя можно поменять позже. Всё остальное — в режиме Edit на листе."
    >
      <form onSubmit={handleSubmit} className="mt-2">
        <InputField
          label="ИМЯ"
          placeholder="Валарих"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={60}
          autoFocus
          required
          data-testid="create-name-input"
        />
        <div
          className={cn(typeClass("caption"), "text-ink-500 mt-2")}
        >
          Базовый класс — <strong className="text-ink-700">Воин</strong>,
          раса — <strong className="text-ink-700">Человек</strong>. Поправим
          на листе.
        </div>
        <div className="flex gap-2.5 mt-4">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => onOpenChange(false)}
            disabled={isCreating}
            data-testid="create-cancel"
          >
            Отмена
          </Button>
          <Button
            type="submit"
            variant="primary"
            className="flex-1"
            disabled={!trimmed || isCreating}
            data-testid="create-confirm"
          >
            {isCreating ? "Создаём…" : "Создать"}
          </Button>
        </div>
      </form>
    </BottomSheet>
  );
}
