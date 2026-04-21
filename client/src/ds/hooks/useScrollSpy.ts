/**
 * IntersectionObserver-based scroll-spy. Для DesktopShell sidebar.
 *
 * Вместо legacy useDesktopSectionNavigation с window-scroll магией —
 * чистый IO: элементы регистрируются по id, observer в scroll-root
 * отчётливо сообщает, кто сейчас «наибольше виден».
 *
 * rootMargin/threshold подобраны так, что активная секция — та, чей
 * top пересекает верхние 40% контейнера.
 */
import { useEffect, useRef, useState } from "react";

export interface UseScrollSpyOptions {
  sectionIds: string[];
  rootRef?: React.RefObject<HTMLElement>;
  /** Дополнительный offset сверху (sticky header/nav). */
  topOffsetPx?: number;
  initialActiveId?: string;
}

export function useScrollSpy({
  sectionIds,
  rootRef,
  topOffsetPx = 0,
  initialActiveId,
}: UseScrollSpyOptions): string | null {
  const [activeId, setActiveId] = useState<string | null>(
    initialActiveId ?? sectionIds[0] ?? null,
  );

  const ratioMapRef = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    if (typeof window === "undefined" || sectionIds.length === 0) return;

    const root = rootRef?.current ?? null;
    const ratios = ratioMapRef.current;
    ratios.clear();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.id;
          if (!id) continue;
          if (entry.isIntersecting) {
            ratios.set(id, entry.intersectionRatio);
          } else {
            ratios.delete(id);
          }
        }
        // Победитель — с максимальным ratio; при tie — первый по порядку sectionIds.
        let bestId: string | null = null;
        let bestRatio = -1;
        for (const id of sectionIds) {
          const r = ratios.get(id) ?? 0;
          if (r > bestRatio) {
            bestRatio = r;
            bestId = id;
          }
        }
        if (bestId) setActiveId(bestId);
      },
      {
        root,
        rootMargin: `-${topOffsetPx}px 0px -40% 0px`,
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
      },
    );

    for (const id of sectionIds) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [rootRef, sectionIds, topOffsetPx]);

  return activeId;
}
