# Changelog

All notable changes to Pocket Charlist are documented here.

---

## [Unreleased] — Equipment UX, Loading Screen

### Added

#### Equipment — scroll fix
- `client/src/index.css`: added `max-height: inherit` and `overflow-y: auto` to `.equipment-scroll-viewport` so the Radix ScrollArea viewport respects the `min(60vh, 42rem)` constraint and scrolls internally instead of expanding the card.

#### Equipment — iOS-style swipe actions (mobile)
- `client/src/components/EquipmentSystem.tsx`: `SortableEquipmentItem` now supports swipe-to-reveal on touch screens.
  - Swipe left → reveals **Edit** (accent) and **Delete** (red) action buttons.
  - Phase 2 (drag past ~65% row width): Edit button collapses, delete zone expands with red fill animation, trash icon scales up — matching native iOS feel.
  - Full swipe commits delete after a 200ms fly-out animation.
  - Only one item can be open at a time; tapping another item or empty space closes the current one.
  - Direction detection prevents conflict with vertical scroll and `@dnd-kit` drag reorder.

#### Equipment — hover-reveal actions (desktop)
- On `sm:` and above, Edit (pencil) and Delete (trash) buttons appear on row hover via `group-hover:opacity-100`. No swipe needed.

#### Equipment — Edit item dialog
- `AddCustomItemDialog` extended with `isEdit`, `initialItem`, `onUpdate` props.
- Opens pre-filled with the selected item's data; saves via `updateEquipmentItem` instead of `addEquipment`.

#### Equipment — Delete confirmation
- All delete actions (swipe, hover button, direct) route through `requestDelete(id)` → `AlertDialog` → `confirmDelete()`. Shows the item name in the dialog body.

#### Equipment — tab order
- Category tab bar moved **above** the "Экипировано" badge strip for better visual hierarchy.

#### Loading screen — HTML pre-loader
- `client/index.html`: inline `<style>` block with shared `.pkt-loader` / `.ld-*` CSS classes + SVG d20 + orbiting dots + rotating messages.
- Inline `<script>` reads `localStorage('dnd-theme')` and sets `.dark`/`.light` class on `<html>` **before** first paint — no background flash.
- Renders immediately with the first byte of HTML, before any JS is downloaded.

#### Loading screen — React component
- `client/src/components/CharacterLoadingScreen.tsx`: renders the identical `.pkt-loader` markup reusing the same CSS from `index.html <head>`.
- `HtmlLoaderRemover` in `App.tsx`: `useEffect` fades out and removes `#app-loader` after React first commit (450ms `opacity` transition).

### Fixed

- `client/src/hooks/use-media-query.ts`: initialised state synchronously via `() => window.matchMedia(query).matches` — eliminates the Drawer→Dialog flicker on desktop when `ResponsiveDialog` first renders.
- `client/src/context/CharacterContext.tsx`: `isLoading` now includes `isAuthLoading` — prevents the "Персонаж не найден" flash while the auth check is still in-flight on hard reload.

---

## 2026-04-09 — Upstream merge (zlicez/Poket-Charlist@dev)

Merged 4 upstream commits:

- `feat: unified tooltip system, header play mode info, PDF progress toast` — `HelpTooltip`, `TooltipBody`, `tooltip-content.ts`; play mode info in `CharacterHeader`; PDF export progress toast with rotating funny messages.
- `chore: finalize template pdf export and clean up docs` — `charlist_blank.pdf` template, `NotoSans-Regular.ttf` font for PDF.
- `feat: refine character sheet flow and rich text support` — `RichTextContent`, `RichTextField` components; rich text for notes, features, spell descriptions.
- `fix: make prod cookie security configurable` — `google-auth.ts` reads `COOKIE_SECURE` env var.

New shared data: `shared/data/spell-slots.ts` — full spell slot tables for all classes + multiclass + warlock pact magic.

New tests: `tests/pdf-export.test.ts`, `tests/public-character-schema.test.ts`, `tests/rich-text.test.ts`, `tests/spell-slots.test.ts`.
