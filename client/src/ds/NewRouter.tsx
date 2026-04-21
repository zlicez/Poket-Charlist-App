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

function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-paper text-ink-700 font-ds-sans">
      Загрузка…
    </div>
  );
}

export function NewRouter() {
  return (
    <Suspense fallback={<Loading />}>
      <Switch>
        <Route path="/ds-tokens" component={TokensPreview} />
        <Route>
          {/* Fallback — временно редирект на /ds-tokens, пока нет экранов. */}
          <TokensPreview />
        </Route>
      </Switch>
    </Suspense>
  );
}
