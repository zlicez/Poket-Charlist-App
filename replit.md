# D&D 5e Character Sheet

## Overview
A web application for managing Dungeons & Dragons 5th Edition character sheets. Features automatic calculations, built-in dice rolling, and an intuitive fantasy-themed interface. Russian-language UI.

## Features
- **Interactive Character Sheet**: Full character management with all D&D 5e stats
- **6 Ability Scores**: STR, DEX, CON, INT, WIS, CHA with auto-calculated modifiers and racial bonuses
- **18 Skills**: With proficiency and expertise tracking, grouped by ability
- **Combat Stats**: AC (calculated from equipped armor), Initiative, Speed, Hit Dice
- **HP Tracker**: In header area with HP bar, +/- buttons, temp HP — separate from combat stats
- **Death Saves**: In header area beside HP, 3 success/3 failure checkboxes with status badges
- **Auto HP Calculation**: Max HP based on class hit dice (Level 1 = max die + CON; Level 2+ = average + CON)
- **Dice Roller**: Built-in dice rolling for ability checks, skill checks, saving throws, attacks, damage
- **Edit/Play Modes**: Switch between editing and gameplay modes
- **Play Mode Editing**: Add/remove items in play mode with lock/unlock protection
- **Currency System**: Track 5 D&D currencies (CP, SP, EP, GP, PP) with colored coin backgrounds and +/- buttons
- **Weapons & Equipment**: Track weapons with attack/damage rolls, inventory with 7 categories and drag-and-drop
- **Weapon Ability Modifiers**: D&D 5e rules: STR for melee, DEX for ranged, finesse weapons can use either
- **Features & Traits**: Track class features, racial traits, and feats
- **Multiple Characters**: Create and manage multiple characters per user
- **Dark/Light Theme**: Toggle between fantasy-themed dark and light modes
- **Mobile-First Design**: Optimized for handheld devices with min 36-40px touch targets, ResponsiveDialog (Dialog on desktop / Drawer on mobile), horizontal scrolling tabs, mobile-adapted grids
- **Race/Class Tooltips**: Info icons in edit mode and hoverable badges in play mode showing D&D 5e data
- **Darkvision Display**: Shows darkvision range based on race/subrace (60-120 ft)
- **Auto-fill Proficiencies**: Weapon, armor, tool, and language proficiencies auto-populated from race/class/subrace
- **Proficiency Styling**: Auto-filled (secondary badges with tooltips) vs user-added (outline badges, removable)
- **User Authentication**: Login via Google or email with Replit Auth (OIDC)
- **Persistent Storage**: Characters saved in PostgreSQL database per user with deep merge updates

## Tech Stack
- **Frontend**: React 18, TypeScript, TailwindCSS 3, Shadcn/UI (Radix), Wouter, TanStack Query v5, @dnd-kit, Framer Motion, Vaul
- **Backend**: Express.js 5, TypeScript, Drizzle ORM, Zod validation
- **Database**: PostgreSQL (JSONB storage for character data)
- **Auth**: Replit Auth (OpenID Connect) via Passport.js, session storage in PostgreSQL
- **Styling**: Fantasy-themed parchment design with semantic CSS color system
- **Fonts**: Inter (body), Lora (headings), JetBrains Mono (numbers/dice)
- **Design System**: Semantic color tokens (positive/negative/info/ability.*), card hierarchy (primary/secondary/tertiary), min 12px text

## Project Structure
```
client/src/
├── components/           # React components
│   ├── ui/               # Shadcn UI primitives (35+ components)
│   │   ├── responsive-dialog.tsx  # Dialog on desktop, Drawer on mobile (<640px)
│   │   └── ...
│   ├── AbilityScore.tsx       # Single ability score display
│   ├── AbilityWithSkills.tsx  # Ability + related skills card (h-full, fixed-width)
│   ├── CharacterCard.tsx      # Character list item
│   ├── CharacterHeader.tsx    # Name, race, class, level, XP bar, proficiency bonus
│   ├── CombatStats.tsx        # AC, initiative, speed, hit dice (exports HpTracker, DeathSavesTracker)
│   ├── DiceRoller.tsx         # Dice rolling modal with history
│   ├── EquipmentSystem.tsx    # Inventory with 7 categories, drag-and-drop, catalog
│   ├── FeaturesList.tsx       # Class/racial features with lock
│   ├── MoneyBlock.tsx         # 5 currencies with gradient coin backgrounds
│   ├── ProficienciesSection.tsx # 4 proficiency categories with auto-fill
│   ├── SavingThrows.tsx       # 6 saving throws with proficiency
│   ├── SkillItem.tsx          # Individual skill row
│   ├── ThemeProvider.tsx      # Dark/light theme context
│   └── WeaponsList.tsx        # Weapons with attack/damage rolls, lock
├── hooks/
│   ├── use-auth.ts            # Auth hook (user, isAuthenticated, logout)
│   ├── use-media-query.ts     # Media query hook
│   ├── use-mobile.tsx         # Mobile detection
│   └── use-toast.ts           # Toast notifications
├── lib/
│   ├── auth-utils.ts          # Login redirect, 401 handling
│   ├── queryClient.ts         # TanStack Query config + apiRequest
│   └── utils.ts               # cn() utility
├── pages/
│   ├── CharacterSheet.tsx     # Main character sheet (layout: header+HP+death saves → 3-col grid → inventory)
│   ├── CharactersList.tsx     # Character list + landing page
│   └── not-found.tsx          # 404 page
└── App.tsx                    # Root with routing (Wouter)

server/
├── index.ts                   # Server entry, middleware
├── routes.ts                  # API endpoints (CRUD characters)
├── storage.ts                 # IStorage interface + DatabaseStorage (Drizzle, deep merge)
├── db.ts                      # PostgreSQL connection
├── vite.ts                    # Vite dev server integration
├── static.ts                  # Static file serving (production)
└── replit_integrations/auth/  # Auth module
    ├── replitAuth.ts          # OIDC strategy, Passport setup
    ├── routes.ts              # /api/auth/user
    └── storage.ts             # Users table CRUD

shared/
├── schema.ts                  # DB schema, types, Zod schemas, D&D 5e data (1087 lines)
└── models/auth.ts             # users + sessions table schemas
```

## Page Layout (CharacterSheet)
```
┌──────────────────────────────────────────────────┐
│ CharacterHeader (name/race/class/level/XP)       │ HP Tracker     │
│                                                   │ Death Saves    │
├──────────────────────────────────────────────────┤
│ Abilities+Skills │ Combat (AC/Init/ │ Weapons      │
│ (6 cards)        │ Speed/HitDice)   │ Features     │
│                  │ + Saving Throws  │ Proficiencies│
├──────────────────────────────────────────────────┤
│ Money │ Equipment (drag-and-drop)                 │
│       │ Notes/Appearance/Allies/Factions          │
└──────────────────────────────────────────────────┘
```

## API Endpoints
- `GET /api/characters` - List user's characters
- `GET /api/characters/:id` - Get single character
- `POST /api/characters` - Create new character
- `PATCH /api/characters/:id` - Update character (deep merge)
- `DELETE /api/characters/:id` - Delete character
- `GET /api/auth/user` - Current user info
- `GET /api/login` - Redirect to OIDC
- `GET /api/callback` - OIDC callback
- `GET /api/logout` - Logout

## Key Architecture Decisions
- **JSONB storage**: Character data stored as single JSONB field for schema flexibility
- **Deep merge updates**: PATCH sends only changed fields, server merges recursively
- **Exported sub-components**: HpTracker and DeathSavesTracker exported from CombatStats for flexible layout
- **CombatStats props**: `hideHp` and `hideDeathSaves` control which sections render
- **Auto-rows-fr grid**: Ability cards use auto-rows-fr for equal height rows

## Running the App
The app runs on port 5000 with `npm run dev`. Frontend and backend served from same port via Vite middleware.

## User Preferences
- Language: Russian (Русский)
- Theme: Supports both dark and light modes
- Style: Fantasy/High-Fantasy aesthetic with parchment colors
