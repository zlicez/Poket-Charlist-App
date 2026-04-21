import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";
import { typeClass } from "@/ds/tokens";
import { Button, Tag } from "@/ds/primitives";
import { AUTH_PATHS } from "@shared/constants";

/**
 * X-08 — Rate limited (429). Handoff 03-screens.jsx:
 *   [gold 429 tag] [«Слишком много попыток входа»]
 *   [copy с countdown: «Попробуйте через <b>6:42</b> или войдите через Google»]
 *   [outline «Google»]
 *
 * retryAfter — timestamp (ms) когда можно будет повторить. Countdown обновляется
 * раз в секунду, при достижении 0 меняется CTA на «Попробовать ещё раз».
 */
export function RateLimitedScreen({
  title = "Слишком много попыток входа",
  retryAfterMs,
  attemptsCount = 10,
  windowMinutes = 15,
  onRetry,
}: {
  title?: string;
  /** Unix-ms когда можно будет повторить. Если не задан — просто пояснение. */
  retryAfterMs?: number;
  attemptsCount?: number;
  windowMinutes?: number;
  onRetry?: () => void;
}) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!retryAfterMs) return;
    const tick = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(tick);
  }, [retryAfterMs]);

  const remainMs = retryAfterMs ? Math.max(0, retryAfterMs - now) : 0;
  const canRetry = !retryAfterMs || remainMs === 0;
  const countdown = formatCountdown(remainMs);

  const handleGoogle = () => {
    window.location.href = AUTH_PATHS.oauthLogin;
  };

  return (
    <div
      className="min-h-screen bg-paper flex items-center justify-center px-6"
      data-testid="rate-limited-screen"
    >
      <div className="text-center max-w-[380px]">
        <Tag variant="gold" className="mb-3">
          429
        </Tag>
        <h1
          className={cn(
            "font-ds-serif text-[22px] font-medium text-ink-900",
          )}
        >
          {title}
        </h1>
        <p className={cn(typeClass("body-sm"), "text-ink-600 mt-2")}>
          {attemptsCount} попыток за {windowMinutes} минут.{" "}
          {retryAfterMs ? (
            canRetry ? (
              <>Можно попробовать снова.</>
            ) : (
              <>
                Попробуйте через{" "}
                <strong
                  className="text-ink-900 font-ds-mono"
                  data-testid="rate-limited-countdown"
                >
                  {countdown}
                </strong>{" "}
                или войдите через Google.
              </>
            )
          ) : (
            <>Попробуйте позже или войдите через Google.</>
          )}
        </p>

        <div className="flex flex-col gap-2.5 mt-5">
          {onRetry && (
            <Button
              variant="primary"
              size="lg"
              className="min-w-[220px]"
              onClick={onRetry}
              disabled={!canRetry}
              data-testid="rate-limited-retry"
            >
              {canRetry ? "Попробовать ещё раз" : `Ждём ${countdown}`}
            </Button>
          )}
          <Button
            variant="outline"
            size="lg"
            className="min-w-[220px]"
            onClick={handleGoogle}
            data-testid="rate-limited-google"
          >
            Войти через Google
          </Button>
        </div>
      </div>
    </div>
  );
}

function formatCountdown(ms: number): string {
  const totalSec = Math.ceil(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}
