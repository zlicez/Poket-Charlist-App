import { cn } from "@/lib/utils";
import { typeClass } from "@/ds/tokens";
import { useSwipeReveal } from "@/ds/hooks/useSwipeReveal";
import {
  getCharacterClasses,
  formatClassesDisplay,
  getTotalLevel,
} from "@shared/schema";
import type { Character } from "@shared/schema";

/**
 * L-02 card atom. Handoff 03-screens.jsx «CharList»:
 *   [monogram avatar с ruby/violet/gold тоном] [name · race/class] [УР уровень]
 *
 * Тон монограммы ротируется по hash(id) — равномерное распределение по
 * ruby/violet/gold/ocean/sage без ручного выбора. Те же тона доступны в
 * токенах Tailwind.
 *
 * Свайп влево (mobile) обнажает Delete (useSwipeReveal). На desktop — кнопка
 * Удалить отображается по hover-edge (see parent page).
 */

const TONES = ["ruby", "violet", "gold", "ocean", "sage"] as const;
type Tone = (typeof TONES)[number];

function toneForId(id: string): Tone {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return TONES[h % TONES.length];
}

function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

const TONE_STYLES: Record<Tone, string> = {
  ruby: "bg-ruby-bg border-ruby-soft text-ruby",
  violet: "bg-violet-bg border-violet-soft text-violet",
  gold: "bg-gold-bg border-gold-soft text-gold",
  ocean: "bg-ocean-bg border-ocean-soft text-ocean",
  sage: "bg-sage-bg border-sage-soft text-sage",
};

export interface CharacterCardProps {
  character: Character;
  onOpen: () => void;
  onDelete: () => void;
  className?: string;
}

const REVEAL_PX = 88;

export function CharacterCard({
  character,
  onOpen,
  onDelete,
  className,
}: CharacterCardProps) {
  const tone = toneForId(character.id);
  const classes = getCharacterClasses(character);
  const classLabel =
    classes.length > 1
      ? formatClassesDisplay(classes)
      : classes[0]?.name || character.class;
  const level = getTotalLevel(classes);

  const { state, close, bindings } = useSwipeReveal({
    revealPx: REVEAL_PX,
    onPrimary: onDelete,
  });

  const handleClick = () => {
    if (state.revealed) {
      close();
      return;
    }
    onOpen();
  };

  return (
    <div
      className={cn("relative overflow-hidden rounded-ds-md", className)}
      data-testid={`character-card-${character.id}`}
    >
      {/* Action layer — revealed on swipe. */}
      <div className="absolute inset-y-0 right-0 flex items-stretch">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
            close();
          }}
          className={cn(
            "w-[88px] flex items-center justify-center bg-ruby text-white font-ds-sans text-[13px] font-semibold",
            "focus:outline-none focus-visible:ring-[3px] focus-visible:ring-ruby-bg",
          )}
          aria-label={`Удалить ${character.name}`}
          data-testid={`character-card-delete-${character.id}`}
        >
          Удалить
        </button>
      </div>

      {/* Foreground — swipes horizontally to reveal delete. */}
      <div
        {...bindings}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleClick();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label={`Открыть ${character.name}`}
        style={{
          transform: `translateX(${state.translateX}px)`,
          transition: state.dragging ? "none" : "transform 200ms ease-out",
        }}
        className={cn(
          "relative flex items-center gap-3.5 p-3.5",
          "bg-paper-card border border-ink-200 rounded-ds-md",
          "focus:outline-none focus-visible:ring-[3px] focus-visible:ring-ruby-bg",
          "cursor-pointer",
        )}
        data-testid={`character-card-open-${character.id}`}
      >
        <div
          className={cn(
            "w-[52px] h-[52px] rounded-full border-2 flex items-center justify-center shrink-0 overflow-hidden",
            "font-ds-serif text-[18px] font-medium",
            TONE_STYLES[tone],
          )}
          aria-hidden
        >
          {character.avatar ? (
            <img
              src={character.avatar}
              alt=""
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            initialsFor(character.name)
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div
            className={cn(
              typeClass("body"),
              "text-ink-900 font-semibold truncate",
            )}
          >
            {character.name}
          </div>
          <div
            className={cn(
              typeClass("body-sm"),
              "text-ink-500 truncate",
            )}
          >
            {character.race ? `${character.race} · ` : ""}
            {classLabel}
          </div>
        </div>

        <div className="text-right shrink-0">
          <div
            className={cn(typeClass("label"), "text-ink-500")}
          >
            УР
          </div>
          <div
            className={cn(
              "font-ds-serif text-[22px] leading-none font-medium text-ink-900",
            )}
          >
            {level}
          </div>
        </div>
      </div>
    </div>
  );
}
