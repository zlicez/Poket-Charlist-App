import { useCallback, useEffect, useRef, useState } from "react";
import { useMediaQuery } from "@/hooks/use-media-query";

const DEFAULT_HEADER_HEIGHT = 53;
const DEFAULT_NAV_HEIGHT = 56;
const ACTIVATION_GAP = 24;
const BOTTOM_THRESHOLD = 8;
const SECTION_SCROLL_GAP = 16;
const TARGET_THRESHOLD = 6;
const SCROLL_LOCK_TIMEOUT_MS = 1200;

type ScrollLock = {
  sectionId: string;
  targetY: number;
  timeoutId: number | null;
};

type UseDesktopSectionNavigationArgs = {
  enabled: boolean;
  sectionIds: string[];
};

export function useDesktopSectionNavigation({
  enabled,
  sectionIds,
}: UseDesktopSectionNavigationArgs) {
  const prefersReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const [activeSectionId, setActiveSectionId] = useState(sectionIds[0] ?? "");
  const [headerHeight, setHeaderHeight] = useState(DEFAULT_HEADER_HEIGHT);
  const [navHeight, setNavHeight] = useState(DEFAULT_NAV_HEIGHT);

  const navElementRef = useRef<HTMLElement | null>(null);
  const sectionIdsRef = useRef(sectionIds);
  const sectionElementsRef = useRef(new Map<string, HTMLElement>());
  const sectionPositionsRef = useRef<Array<{ id: string; top: number }>>([]);
  const animationFrameRef = useRef<number | null>(null);
  const scrollLockRef = useRef<ScrollLock | null>(null);
  const metricsRef = useRef({
    headerHeight: DEFAULT_HEADER_HEIGHT,
    navHeight: DEFAULT_NAV_HEIGHT,
  });

  const sectionIdsKey = sectionIds.join("|");
  const stickyOffset = headerHeight + navHeight;
  const sectionScrollMargin = stickyOffset + SECTION_SCROLL_GAP;

  useEffect(() => {
    sectionIdsRef.current = sectionIds;
  }, [sectionIds, sectionIdsKey]);

  const clearScrollLock = useCallback(() => {
    const activeLock = scrollLockRef.current;
    if (!activeLock) return;

    if (activeLock.timeoutId !== null) {
      window.clearTimeout(activeLock.timeoutId);
    }

    scrollLockRef.current = null;
  }, []);

  const measureLayout = useCallback(() => {
    if (typeof window === "undefined") return;

    const headerElement = document.querySelector<HTMLElement>(
      '[data-testid="character-sheet-header"]',
    );
    const nextHeaderHeight = headerElement?.offsetHeight ?? DEFAULT_HEADER_HEIGHT;
    const nextNavHeight = navElementRef.current?.offsetHeight ?? DEFAULT_NAV_HEIGHT;

    if (
      metricsRef.current.headerHeight !== nextHeaderHeight ||
      metricsRef.current.navHeight !== nextNavHeight
    ) {
      metricsRef.current = {
        headerHeight: nextHeaderHeight,
        navHeight: nextNavHeight,
      };
      setHeaderHeight(nextHeaderHeight);
      setNavHeight(nextNavHeight);
    }

    sectionPositionsRef.current = sectionIdsRef.current
      .map((sectionId) => {
        const sectionElement = sectionElementsRef.current.get(sectionId);
        if (!sectionElement) return null;

        return {
          id: sectionId,
          top: sectionElement.getBoundingClientRect().top + window.scrollY,
        };
      })
      .filter(
        (section): section is { id: string; top: number } => section !== null,
      );
  }, []);

  const syncActiveSection = useCallback(() => {
    if (!enabled || typeof window === "undefined") return;

    const sectionPositions = sectionPositionsRef.current;
    const fallbackId = sectionIdsRef.current[0] ?? "";

    if (sectionPositions.length === 0) {
      if (fallbackId) {
        setActiveSectionId(fallbackId);
      }
      return;
    }

    const activeLock = scrollLockRef.current;
    if (activeLock) {
      const reachedTarget = Math.abs(window.scrollY - activeLock.targetY) <= TARGET_THRESHOLD;
      if (!reachedTarget) {
        setActiveSectionId(activeLock.sectionId);
        return;
      }

      clearScrollLock();
    }

    const nearBottom =
      window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - BOTTOM_THRESHOLD;
    if (nearBottom) {
      setActiveSectionId(sectionPositions[sectionPositions.length - 1]?.id ?? fallbackId);
      return;
    }

    const activationY =
      window.scrollY +
      metricsRef.current.headerHeight +
      metricsRef.current.navHeight +
      ACTIVATION_GAP;

    let nextActiveSection = sectionPositions[0]?.id ?? fallbackId;
    for (const section of sectionPositions) {
      if (section.top <= activationY) {
        nextActiveSection = section.id;
        continue;
      }

      break;
    }

    if (nextActiveSection) {
      setActiveSectionId(nextActiveSection);
    }
  }, [clearScrollLock, enabled]);

  const scheduleMeasureAndSync = useCallback(() => {
    if (!enabled || typeof window === "undefined") return;
    if (animationFrameRef.current !== null) return;

    animationFrameRef.current = window.requestAnimationFrame(() => {
      animationFrameRef.current = null;
      measureLayout();
      syncActiveSection();
    });
  }, [enabled, measureLayout, syncActiveSection]);

  useEffect(() => {
    const currentSectionIds = sectionIdsRef.current;
    const fallbackId = currentSectionIds[0] ?? "";

    sectionElementsRef.current.forEach((_, sectionId) => {
      if (!currentSectionIds.includes(sectionId)) {
        sectionElementsRef.current.delete(sectionId);
      }
    });

    setActiveSectionId((currentSectionId) => {
      if (currentSectionId && currentSectionIds.includes(currentSectionId)) {
        return currentSectionId;
      }

      return fallbackId;
    });

    if (!enabled) {
      clearScrollLock();
    }
  }, [clearScrollLock, enabled, sectionIdsKey]);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    const handleScroll = () => {
      if (animationFrameRef.current !== null) return;

      animationFrameRef.current = window.requestAnimationFrame(() => {
        animationFrameRef.current = null;
        syncActiveSection();
      });
    };

    const handleResize = () => {
      scheduleMeasureAndSync();
    };

    scheduleMeasureAndSync();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize);

    const resizeObserver = new ResizeObserver(() => {
      scheduleMeasureAndSync();
    });

    const headerElement = document.querySelector<HTMLElement>(
      '[data-testid="character-sheet-header"]',
    );
    if (headerElement) {
      resizeObserver.observe(headerElement);
    }

    if (navElementRef.current) {
      resizeObserver.observe(navElementRef.current);
    }

    sectionIdsRef.current.forEach((sectionId) => {
      const sectionElement = sectionElementsRef.current.get(sectionId);
      if (sectionElement) {
        resizeObserver.observe(sectionElement);
      }
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      resizeObserver.disconnect();

      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [enabled, scheduleMeasureAndSync, sectionIdsKey, syncActiveSection]);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }

      const activeLock = scrollLockRef.current;
      if (activeLock && activeLock.timeoutId !== null) {
        window.clearTimeout(activeLock.timeoutId);
      }
    };
  }, []);

  const setNavElement = useCallback((element: HTMLElement | null) => {
    navElementRef.current = element;
  }, []);

  const registerSection = useCallback((sectionId: string, element: HTMLElement | null) => {
    if (element) {
      sectionElementsRef.current.set(sectionId, element);
      return;
    }

    sectionElementsRef.current.delete(sectionId);
  }, []);

  const scrollToSection = useCallback(
    (sectionId: string) => {
      if (typeof window === "undefined") return;

      const sectionElement = sectionElementsRef.current.get(sectionId);
      if (!sectionElement) return;

      const sectionTop = sectionElement.getBoundingClientRect().top + window.scrollY;
      const nextTargetY = Math.max(
        0,
        sectionTop - metricsRef.current.headerHeight - metricsRef.current.navHeight - SECTION_SCROLL_GAP,
      );

      clearScrollLock();

      setActiveSectionId(sectionId);

      if (prefersReducedMotion) {
        window.scrollTo({ top: nextTargetY, behavior: "auto" });
        return;
      }

      const timeoutId = window.setTimeout(() => {
        clearScrollLock();
      }, SCROLL_LOCK_TIMEOUT_MS);

      scrollLockRef.current = {
        sectionId,
        targetY: nextTargetY,
        timeoutId,
      };

      window.scrollTo({
        top: nextTargetY,
        behavior: "smooth",
      });
    },
    [clearScrollLock, prefersReducedMotion],
  );

  return {
    activeSectionId,
    headerHeight,
    sectionScrollMargin,
    registerSection,
    scrollToSection,
    setNavElement,
  };
}
