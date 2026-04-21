import { useEffect, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HelpTooltip, TooltipBody } from "@/components/ui/help-tooltip";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  GripVertical,
  Minus,
  Pencil,
  Plus,
  Shield,
  ShieldCheck,
  Sword,
  Trash2,
} from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ARMOR_AC_TOOLTIP,
  EQUIPPED_ARMOR_TOOLTIP,
  EQUIPPED_SHIELD_TOOLTIP,
  EQUIPPED_WEAPON_TOOLTIP,
} from "@/lib/tooltip-content";
import type { Equipment } from "@shared/schema";
import {
  getActiveWeaponDamage,
  getWeaponPropertiesDisplay,
} from "@/lib/weapons";

import { SWIPE_REVEAL_PX } from "./constants";

export function SortableEquipmentItem({
  item,
  index,
  onToggleEquip,
  onUpdateQuantity,
  onRemove,
  onEdit,
  canModify,
  isEditing,
  isLocked,
  canReorder,
  isSwipeOpen,
  onSwipeActivate,
}: {
  item: Equipment;
  index: number;
  onToggleEquip: () => void;
  onUpdateQuantity: (delta: number) => void;
  onRemove: () => void;
  onEdit: () => void;
  canModify: boolean;
  isEditing: boolean;
  isLocked: boolean;
  canReorder: boolean;
  isSwipeOpen: boolean;
  onSwipeActivate: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
    disabled: !canReorder,
  });
  const activeWeaponDamage = item.isWeapon
    ? getActiveWeaponDamage({
        damage: item.damage,
        versatileDamage: item.versatileDamage,
        gripMode: item.gripMode,
        properties: item.weaponProperties,
      })
    : undefined;
  const weaponPropertiesDisplay = item.isWeapon
    ? getWeaponPropertiesDisplay(item.weaponProperties, item.versatileDamage)
    : undefined;

  // Container ref to measure actual rendered width for trigger threshold
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(320);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => setContainerWidth(entry.contentRect.width));
    ro.observe(el);
    setContainerWidth(el.offsetWidth);
    return () => ro.disconnect();
  }, []);

  const [swipeX, setSwipeX] = useState(0);
  // snapping=true: CSS transition enabled (finger lifted); false: instant follow
  const [snapping, setSnapping] = useState(false);

  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const swipeXAtTouchStart = useRef(0);
  const dirLocked = useRef<'h' | 'v' | null>(null);
  const touchMoved = useRef(false);

  // Close smoothly when another item becomes active or outside tap happens
  useEffect(() => {
    if (!isSwipeOpen && swipeX > 0) {
      setSnapping(true);
      setSwipeX(0);
    }
  }, [isSwipeOpen, swipeX]);

  // The threshold at which a full swipe commits delete (65% of row width)
  const triggerAt = Math.min(containerWidth * 0.65, containerWidth - 16);

  // t: progress from REVEAL to commit (0..1) — drives phase-2 visuals
  const t = containerWidth > 0
    ? Math.min(1, Math.max(0, (swipeX - SWIPE_REVEAL_PX) / Math.max(1, triggerAt - SWIPE_REVEAL_PX)))
    : 0;
  const isCommitting = t >= 0.92;

  // Edit button collapses as t goes 0 → 0.5
  const editWidthPx = Math.round(52 * Math.max(0, 1 - t / 0.5));
  const editOpacity = Math.max(0, 1 - t / 0.35);
  const showEditBtn = editWidthPx > 3;
  const gapPx = showEditBtn ? 4 : 0;

  const snapTransition = `transform 0.32s cubic-bezier(0.25, 0.46, 0.45, 0.94)`;

  const snapOpen = () => { setSnapping(true); setSwipeX(SWIPE_REVEAL_PX); };
  const snapClose = () => { setSnapping(true); setSwipeX(0); };
  const commitDelete = () => {
    // Animate item off-screen then call delete
    setSnapping(true);
    setSwipeX(containerWidth + 20);
    setTimeout(() => {
      onRemove();
      setSwipeX(0);
      setSnapping(false);
    }, 200);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    // Always stop propagation so parent doesn't close this item
    e.stopPropagation();
    // Notify parent: this is the active item (closes all others)
    onSwipeActivate();
    if (!isEditing) return;
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    swipeXAtTouchStart.current = swipeX;
    dirLocked.current = null;
    touchMoved.current = false;
    setSnapping(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isEditing) return;
    const dx = touchStartX.current - e.touches[0].clientX; // positive = leftward
    const dy = Math.abs(e.touches[0].clientY - touchStartY.current);

    // Lock swipe direction on first significant movement
    if (dirLocked.current === null) {
      if (Math.abs(dx) < 4 && dy < 4) return;
      dirLocked.current = Math.abs(dx) >= dy ? 'h' : 'v';
    }
    if (dirLocked.current === 'v') return;

    touchMoved.current = true;
    e.preventDefault(); // stop page scroll while swiping horizontally

    const target = Math.max(0, Math.min(containerWidth * 0.85, swipeXAtTouchStart.current + dx));
    setSwipeX(target);
  };

  const handleTouchEnd = () => {
    if (!isEditing) return;

    // Tap on already-open item (no horizontal movement) → close
    if (!touchMoved.current && swipeX > 0) {
      snapClose();
      return;
    }

    if (isCommitting || swipeX >= triggerAt) {
      commitDelete();
    } else if (swipeX >= SWIPE_REVEAL_PX / 2) {
      snapOpen();
    } else {
      snapClose();
    }
  };

  const dndStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const isEquippable = item.isWeapon || item.isArmor;
  const actionAreaVisible = swipeX > 2;

  return (
    <div
      ref={(node) => {
        setNodeRef(node);
        // @ts-expect-error dual ref — setNodeRef принимает non-null, containerRef допускает
        containerRef.current = node;
      }}
      style={dndStyle}
      className={`relative rounded-md overflow-hidden ${isDragging ? 'z-50' : ''}`}
      data-testid={`equipment-item-${index}`}
    >
      {/* ── iOS-style swipe action strip (mobile only, edit mode only) ── */}
      {isEditing && (
        <div
          className="absolute inset-y-[2px] right-0 sm:hidden flex items-stretch overflow-hidden rounded-md"
          onTouchStart={(e) => e.stopPropagation()}
          style={{
            width: actionAreaVisible ? swipeX : 0,
            // Background fills in as phase-2 progresses (delete zone takes over)
            background: t > 0.05
              ? `hsl(var(--destructive) / ${0.12 + t * 0.88})`
              : 'transparent',
            transition: snapping
              ? `width 0.32s cubic-bezier(0.25, 0.46, 0.45, 0.94), background-color 0.2s ease`
              : 'none',
          }}
        >
          {/* Edit button — collapses as phase 2 begins */}
          {showEditBtn && (
            <button
              onClick={(e) => { e.stopPropagation(); snapClose(); onEdit(); }}
              aria-label="Редактировать"
              style={{
                width: editWidthPx,
                opacity: editOpacity,
                flexShrink: 0,
                marginRight: gapPx,
                transition: snapping ? 'width 0.2s ease, opacity 0.15s ease' : 'none',
              }}
              className="flex items-center justify-center rounded-md bg-accent text-accent-foreground overflow-hidden"
            >
              <Pencil size={16} />
            </button>
          )}

          {/* Delete button — expands to fill all remaining space */}
          <button
            onClick={(e) => { e.stopPropagation(); snapClose(); onRemove(); }}
            aria-label="Удалить"
            className="flex-1 flex items-center justify-center rounded-md text-white"
            style={{
              // Phase 1: standard red bg; phase 2: transparent (action area bg takes over)
              background: t > 0.15 ? 'transparent' : 'hsl(var(--destructive))',
              minWidth: 48,
              transition: snapping ? 'background-color 0.2s ease' : 'none',
            }}
          >
            <Trash2
              size={isCommitting ? 22 : 18}
              style={{
                transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                transform: isCommitting ? 'scale(1.25)' : 'scale(1)',
              }}
            />
          </button>
        </div>
      )}

      {/* ── Main item row ───────────────────────────────────────────────── */}
      <div
        className={`group flex items-center gap-1.5 sm:gap-2 py-1.5 px-1.5 sm:px-2 rounded-md ${item.equipped ? 'bg-accent/10' : 'hover-elevate'}`}
        style={{
          transform: `translateX(-${swipeX}px)`,
          transition: snapping ? snapTransition : 'none',
          willChange: 'transform',
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {canReorder && (
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-0.5 text-muted-foreground hover:text-foreground touch-none min-w-[32px] min-h-[36px] flex items-center justify-center shrink-0"
            data-testid={`drag-handle-${index}`}
          >
            <GripVertical className="w-3.5 h-3.5" />
          </button>
        )}

        {isEquippable && (
          <HelpTooltip
            content={
              item.isArmor && item.armorType === "shield"
                ? <TooltipBody title={EQUIPPED_SHIELD_TOOLTIP.title} lines={EQUIPPED_SHIELD_TOOLTIP.lines} />
                : item.isArmor
                ? <TooltipBody title={EQUIPPED_ARMOR_TOOLTIP.title} lines={EQUIPPED_ARMOR_TOOLTIP.lines} />
                : <TooltipBody title={EQUIPPED_WEAPON_TOOLTIP.title} lines={EQUIPPED_WEAPON_TOOLTIP.lines} />
            }
            side="right"
            asChild
          >
            <Button
              variant="ghost"
              size="icon"
              className={`h-10 w-10 sm:h-9 sm:w-9 shrink-0 ${item.equipped ? 'text-accent' : 'text-muted-foreground'}`}
              onClick={onToggleEquip}
              data-testid={`button-equip-${index}`}
            >
              {item.isArmor ? (
                item.equipped ? <ShieldCheck className="w-4 h-4" /> : <Shield className="w-4 h-4" />
              ) : (
                <Sword className={`w-4 h-4 ${item.equipped ? 'text-accent' : ''}`} />
              )}
            </Button>
          </HelpTooltip>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1 flex-wrap">
            <span className={`text-sm font-medium truncate ${item.equipped ? 'text-accent' : ''}`}>
              {item.name}
            </span>
            {item.quantity > 1 && (
              <Badge variant="secondary" className="text-[10px] sm:text-xs h-4 sm:h-5 px-1">x{item.quantity}</Badge>
            )}
            {item.isArmor && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline" className="text-[10px] sm:text-xs h-4 sm:h-5 px-1 hidden sm:inline-flex cursor-help">КД {item.armorBaseAC}</Badge>
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-[240px]">
                  <TooltipBody
                    title={ARMOR_AC_TOOLTIP(item.armorBaseAC ?? 10, item.armorMaxDexBonus ?? null).title}
                    lines={ARMOR_AC_TOOLTIP(item.armorBaseAC ?? 10, item.armorMaxDexBonus ?? null).lines}
                  />
                </TooltipContent>
              </Tooltip>
            )}
            {item.isWeapon && (
              <Badge variant="outline" className="text-[10px] sm:text-xs h-4 sm:h-5 px-1 hidden sm:inline-flex">
                {activeWeaponDamage}
              </Badge>
            )}
          </div>
          {(item.description || weaponPropertiesDisplay || item.damageType) && (
            <div className="text-[10px] sm:text-xs text-muted-foreground truncate">
              {item.isWeapon && item.damageType && <span>{item.damageType}</span>}
              {weaponPropertiesDisplay && <span> • {weaponPropertiesDisplay}</span>}
              {!item.isWeapon && item.description && <span>{item.description}</span>}
            </div>
          )}
        </div>

        {item.weight !== undefined && (
          <span className="text-[10px] sm:text-xs text-muted-foreground shrink-0 hidden sm:inline">
            {(item.weight * item.quantity).toFixed(1)}ф
          </span>
        )}

        {!isEditing && !isEquippable && !isLocked && (
          <div className="flex items-center shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 sm:h-9 sm:w-9"
              onClick={() => onUpdateQuantity(-1)}
              data-testid={`button-qty-minus-${index}`}
            >
              <Minus className="w-3.5 h-3.5 sm:w-3 sm:h-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 sm:h-9 sm:w-9"
              onClick={() => onUpdateQuantity(1)}
              data-testid={`button-qty-plus-${index}`}
            >
              <Plus className="w-3.5 h-3.5 sm:w-3 sm:h-3" />
            </Button>
          </div>
        )}

        {/* Desktop: hover-reveal edit + delete (no swipe needed) */}
        {canModify && (
          <div className="hidden sm:flex items-center gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-muted-foreground hover:text-foreground"
              onClick={onEdit}
              data-testid={`button-edit-${index}`}
            >
              <Pencil className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-destructive hover:text-destructive"
              onClick={onRemove}
              data-testid={`button-remove-${index}`}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
