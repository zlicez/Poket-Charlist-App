/**
 * Entry-point новой ДС. Подключается в App.tsx под FEATURE_FLAGS.newDesignSystem.
 * Пока — scaffold с dev-страницами preview. Настоящие экраны появятся с Phase D+.
 *
 * Legacy-дерево (см. App.tsx: <Router/> из wouter) отдельно — два параллельных
 * роутера не активны одновременно, ветвление только на entry-point уровне.
 */
import { Route, Switch } from "wouter";
import { lazy, Suspense } from "react";

const TokensPreview = lazy(() => import("./pages/TokensPreview"));
const PrimitivesPreview = lazy(() => import("./pages/PrimitivesPreview"));
const HeroPreview = lazy(() => import("./pages/HeroPreview"));

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
      </ul>
    </div>
  );
}

export function NewRouter() {
  return (
    <Suspense fallback={<Loading />}>
      <Switch>
        <Route path="/ds-tokens" component={TokensPreview} />
        <Route path="/ds-primitives" component={PrimitivesPreview} />
        <Route path="/ds-hero" component={HeroPreview} />
        <Route component={DevIndex} />
      </Switch>
    </Suspense>
  );
}
