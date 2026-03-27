# D&D 5e Character Sheet

## Overview
A web application for managing Dungeons & Dragons 5th Edition character sheets. Features automatic calculations, built-in dice rolling, and an intuitive fantasy-themed interface.

## Features
- **Interactive Character Sheet**: Full character management with all D&D 5e stats
- **6 Ability Scores**: STR, DEX, CON, INT, WIS, CHA with auto-calculated modifiers
- **18 Skills**: With proficiency and expertise tracking
- **Combat Stats**: AC, Initiative, Speed, HP (current/max/temp), Death Saves
- **Auto HP Calculation**: Max HP based on class hit dice (Level 1 = max die + CON; Level 2+ = average + CON)
- **Dice Roller**: Built-in dice rolling for ability checks, skill checks, saving throws, attacks
- **Edit/Play Modes**: Switch between editing and gameplay modes
- **Play Mode Editing**: Add/remove items in play mode with lock/unlock protection
- **Currency System**: Track 5 D&D currencies (CP, SP, EP, GP, PP) with +/- buttons
- **Weapons & Equipment**: Track weapons with attack/damage rolls, inventory management
- **Weapon Ability Modifiers**: D&D 5e rules: STR for melee, DEX for ranged, finesse weapons can use either
- **Features & Traits**: Track class features, racial traits, and feats
- **Multiple Characters**: Create and manage multiple characters
- **Dark/Light Theme**: Toggle between themes
- **Mobile-First Design**: Optimized for handheld devices with min 36-40px touch targets, ResponsiveDialog (Dialog on desktop / Drawer on mobile), horizontal scrolling tabs, mobile-adapted grids
- **Race/Class Tooltips**: Info icons in edit mode and hoverable badges in play mode showing D&D 5e data (ability bonuses, traits, proficiencies, descriptions)
- **Darkvision Display**: Shows darkvision range based on race/subrace (60-120 ft)
- **Auto-fill Proficiencies**: Weapon, armor, tool, and language proficiencies auto-populated from race/class/subrace
- **Proficiency Styling**: Auto-filled proficiencies (secondary badges with tooltips) vs user-added (outline badges, removable)
- **User Authentication**: Login via Google or email with Replit Auth
- **Persistent Storage**: Characters saved in PostgreSQL database per user

## Tech Stack
- **Frontend**: React, TypeScript, TailwindCSS, Shadcn/UI, Wouter, TanStack Query
- **Backend**: Express.js, TypeScript
- **Data**: In-memory storage (MemStorage)
- **Styling**: Fantasy-themed parchment design with semantic CSS color system
- **Fonts**: Inter (body), Lora (headings), JetBrains Mono (numbers/dice)
- **Design System**: Semantic color tokens (positive/negative/info/ability.*), card hierarchy (primary/secondary/tertiary), min 12px text

## Project Structure
```
client/src/
├── components/           # React components
│   ├── ui/
│   │   ├── responsive-dialog.tsx  # Dialog on desktop, Drawer on mobile (<640px)
│   │   └── ...                    # Shadcn UI components
│   ├── AbilityScore.tsx     # Ability score display/edit
│   ├── CharacterCard.tsx    # Character list item (responsive)
│   ├── CharacterHeader.tsx  # Character info header (Drawer editing on mobile)
│   ├── CombatStats.tsx      # AC, HP, initiative, speed (min 40px touch targets)
│   ├── DiceRoller.tsx       # Dice rolling system (ResponsiveDialog)
│   ├── EquipmentSystem.tsx  # Inventory with categorized tabs, lock feature
│   ├── FeaturesList.tsx     # Class/racial features with lock (ResponsiveDialog)
│   ├── MoneyBlock.tsx       # Currency management (3-col mobile, 5-col desktop)
│   ├── SavingThrows.tsx     # Saving throw proficiencies (min 40px touch targets)
│   ├── SkillItem.tsx        # Individual skill display
│   ├── ThemeProvider.tsx    # Dark/light theme context
│   └── WeaponsList.tsx      # Weapons with lock feature (ResponsiveDialog)
├── hooks/
│   └── use-media-query.ts   # Media query hook for responsive behavior
├── pages/
│   ├── CharacterSheet.tsx   # Main character sheet page
│   ├── CharactersList.tsx   # Character selection page (responsive)
│   └── not-found.tsx        # 404 page
└── App.tsx                  # App root with routing

server/
├── routes.ts               # API endpoints (CRUD)
└── storage.ts              # In-memory character storage

shared/
└── schema.ts               # TypeScript types, Zod schemas, D&D data
```

## API Endpoints
- `GET /api/characters` - List all characters
- `GET /api/characters/:id` - Get single character
- `POST /api/characters` - Create new character
- `PATCH /api/characters/:id` - Update character
- `DELETE /api/characters/:id` - Delete character

## Running the App
The app runs on port 5000 with `npm run dev`. The frontend and backend are served from the same port via Vite middleware.

## User Preferences
- Language: Russian (Русский)
- Theme: Supports both dark and light modes
- Style: Fantasy/High-Fantasy aesthetic with parchment colors
