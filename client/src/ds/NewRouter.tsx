/**
 * Entry-point дизайн-системы. Единственный wouter-роутер приложения после
 * Phase J — legacy-дерево удалено. Включает auth-гейт, реальные экраны
 * (CharactersListPage, CharacterScreen, SharedReadOnlyScreen) и /ds-*
 * dev-превью.
 */
import { Route, Switch, useLocation } from "wouter";
import { lazy, Suspense } from "react";

import { CharacterLandingRedirect } from "./pages/CharacterScreen";
import {
  NotFoundScreen,
  SyncConflictSheet,
} from "./screens/edge";
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
const ListPreview = lazy(() => import("./pages/ListPreview"));
const EdgePreview = lazy(() => import("./pages/EdgePreview"));
const PolishPreview = lazy(() => import("./pages/PolishPreview"));
const CharactersListPage = lazy(
  () => import("./pages/CharactersListPage"),
);
const CharacterScreen = lazy(() => import("./pages/CharacterScreen"));
const SharedReadOnlyScreen = lazy(
  () => import("./screens/edge/SharedReadOnlyScreen"),
);

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
          <a href="/ds-list" className="text-ocean hover:underline">
            /ds-list
          </a>{" "}
          — Phase H2 list preview (L-01..L-05 состояния)
        </li>
        <li>
          <a href="/ds-edge" className="text-ocean hover:underline">
            /ds-edge
          </a>{" "}
          — Phase H3 edge preview (X-01..X-08 sheets + error screens)
        </li>
        <li>
          <a href="/ds-polish" className="text-ocean hover:underline">
            /ds-polish
          </a>{" "}
          — Phase I polish preview (⌘K palette + haptic triggers)
        </li>
        <li>
          <a href="/" className="text-ocean hover:underline">
            /
          </a>{" "}
          — список персонажей (Phase H2), затем /character/:id/combat
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

  // Превью-страницы и публичный /shared/:token доступны без логина.
  if (location === "/ds-auth") {
    return (
      <Switch>
        <Route path="/ds-auth" component={AuthPreview} />
      </Switch>
    );
  }
  if (location === "/ds-list") {
    return (
      <Switch>
        <Route path="/ds-list" component={ListPreview} />
      </Switch>
    );
  }
  if (location === "/ds-edge") {
    return (
      <Switch>
        <Route path="/ds-edge" component={EdgePreview} />
      </Switch>
    );
  }
  if (location === "/ds-polish") {
    return (
      <Switch>
        <Route path="/ds-polish" component={PolishPreview} />
      </Switch>
    );
  }
  if (location.startsWith("/shared/")) {
    return (
      <Switch>
        <Route path="/shared/:token" component={SharedReadOnlyScreen} />
      </Switch>
    );
  }

  if (isLoading) return <AuthLoader />;
  if (!isAuthenticated) return <AuthScreen />;

  return (
    <Switch>
      <Route path="/" component={CharactersListPage} />
      <Route path="/ds-tokens" component={TokensPreview} />
      <Route path="/ds-primitives" component={PrimitivesPreview} />
      <Route path="/ds-hero" component={HeroPreview} />
      <Route path="/ds-wizards" component={WizardsPreview} />
      <Route path="/ds-dev" component={DevIndex} />
      {/* Character screen routes (Phase D) */}
      <Route path="/character/:id" component={CharacterLandingRedirect} />
      <Route path="/character/:id/:tab" component={CharacterScreen} />
      {/* 404 fallback (X-06) на неизвестный путь в DS-дереве. */}
      <Route>
        <NotFoundScreen />
      </Route>
    </Switch>
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
