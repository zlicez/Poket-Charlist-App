/**
 * Entry-point новой ДС. Подключается в App.tsx под FEATURE_FLAGS.newDesignSystem.
 * Пока — scaffold с dev-страницами preview. Настоящие экраны появятся с Phase D+.
 *
 * Legacy-дерево (см. App.tsx: <Router/> из wouter) отдельно — два параллельных
 * роутера не активны одновременно, ветвление только на entry-point уровне.
 */
import { Route, Switch, useLocation } from "wouter";
import { lazy, Suspense } from "react";

import { CharacterLandingRedirect } from "./pages/CharacterScreen";
import { SyncConflictSheet } from "./screens/edge/SyncConflictSheet";
import {
  AuthLoader,
  AuthScreen,
  SessionExpiredSheet,
} from "./screens/auth";
import { useAuth } from "@/hooks/use-auth";

const TokensPreview = lazy(() => import("./pages/TokensPreview"));
const PrimitivesPreview = lazy(() => import("./pages/PrimitivesPreview"));
const HeroPreview = lazy(() => import("./pages/HeroPreview"));
const WizardsPreview = lazy(() => import("./pages/WizardsPreview"));
const AuthPreview = lazy(() => import("./pages/AuthPreview"));
const CharacterScreen = lazy(() => import("./pages/CharacterScreen"));

function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-paper text-ink-700 font-ds-sans">
      Загрузка…
    </div>
  );
}

function DevIndex() {
  return (
    <div className="min-h-screen bg-paper text-ink-900 font-ds-sans p-10">
      <h1 className="font-ds-serif text-4xl font-medium mb-6">DS dev index</h1>
      <ul className="space-y-2 text-ink-700">
        <li>
          <a href="/ds-tokens" className="text-ocean hover:underline">
            /ds-tokens
          </a>{" "}
          — Phase A swatches
        </li>
        <li>
          <a href="/ds-primitives" className="text-ocean hover:underline">
            /ds-primitives
          </a>{" "}
          — Phase B atoms
        </li>
        <li>
          <a href="/ds-hero" className="text-ocean hover:underline">
            /ds-hero
          </a>{" "}
          — Phase C hero components
        </li>
        <li>
          <a href="/ds-wizards" className="text-ocean hover:underline">
            /ds-wizards
          </a>{" "}
          — Phase F wizards (LevelUp, RacePicker). Добавь ?id=… для данных
        </li>
        <li>
          <a href="/ds-auth" className="text-ocean hover:underline">
            /ds-auth
          </a>{" "}
          — Phase H1 auth preview (A-01..A-05, без реального гейта)
        </li>
        <li>
          <a href="/" className="text-ocean hover:underline">
            /
          </a>{" "}
          — список персонажей, затем /character/:id/combat (Phase D)
        </li>
      </ul>
      <div className="mt-6 text-[13px] text-ink-500">
        Tip: открой <code>/character/:id/combat</code> для новой ДС-раскладки
        (placeholder-контент до Phase E).
      </div>
    </div>
  );
}

/**
 * Auth gate. Порядок:
 *   1. `/ds-auth` — превью, без гейта (можно смотреть без входа).
 *   2. isLoading → AuthLoader.
 *   3. !isAuthenticated → AuthScreen.
 *   4. authenticated → роуты + SessionExpiredSheet слушает дальнейшие переходы.
 */
function GatedRoutes() {
  const { isAuthenticated, isLoading } = useAuth();
  const [location] = useLocation();

  // Превью-страница должна работать без логина — её цель показать компоненты.
  if (location === "/ds-auth") {
    return (
      <>
        <Switch>
          <Route path="/ds-auth" component={AuthPreview} />
        </Switch>
      </>
    );
  }

  if (isLoading) return <AuthLoader />;
  if (!isAuthenticated) return <AuthScreen />;

  return (
    <>
      <Switch>
        <Route path="/ds-tokens" component={TokensPreview} />
        <Route path="/ds-primitives" component={PrimitivesPreview} />
        <Route path="/ds-hero" component={HeroPreview} />
        <Route path="/ds-wizards" component={WizardsPreview} />
        {/* Character screen routes (Phase D) */}
        <Route path="/character/:id" component={CharacterLandingRedirect} />
        <Route path="/character/:id/:tab" component={CharacterScreen} />
        <Route component={DevIndex} />
      </Switch>
    </>
  );
}

export function NewRouter() {
  return (
    <Suspense fallback={<Loading />}>
      <GatedRoutes />
      {/*
        Global sync:conflict listener (Phase G). Рендерит себя только когда
        useOfflineQueue().hasConflict === true, иначе null.
      */}
      <SyncConflictSheet />
      {/*
        Global session-expired watcher (Phase H1, A-04). Рендерит sheet
        только при переходе authenticated → unauthenticated.
      */}
      <SessionExpiredSheet />
    </Suspense>
  );
}
