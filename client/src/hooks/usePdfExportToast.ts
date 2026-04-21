import { useCallback, useEffect, useRef, useState } from "react";

import type { Character } from "@shared/schema";

// Юморные сообщения, которые крутятся во время генерации PDF.
const FUNNY_MESSAGES = [
  "Точим гусиное перо...",
  "Будим скрайба...",
  "Торгуемся с драконом за бумагу...",
  "Считаем кости хитов...",
  "Спрашиваем разрешения у Мастера...",
  "Пересчитываем золото в кошельке...",
  "Застёгиваем доспех персонажа...",
  "Переводим с эльфийского...",
  "Проверяем мировоззрение...",
  "Намазываем чернилами свиток...",
  "Сворачиваем пергамент...",
  "Шепчем заклинание архивации...",
];

export interface PdfToastState {
  title: string;
  msg: string;
  progress: number;
}

export interface UsePdfExportToastReturn {
  pdfToast: PdfToastState | null;
  exportPdf: (character: Character) => Promise<void>;
}

// Держит состояние прогресс-тоста и таймеров, и выполняет динамический import
// тяжёлого модуля pdf-export только в момент нажатия. Возвращает стабильное
// `exportPdf(character)` и `pdfToast`, который UI рендерит как floating pill.
export function usePdfExportToast(): UsePdfExportToastReturn {
  const [pdfToast, setPdfToast] = useState<PdfToastState | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const dismissTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Очистка при размонтировании — никаких болтающихся таймеров.
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (dismissTimeoutRef.current) clearTimeout(dismissTimeoutRef.current);
    };
  }, []);

  const exportPdf = useCallback(async (character: Character) => {
    let progress = 5;
    let msgIndex = Math.floor(Math.random() * FUNNY_MESSAGES.length);

    setPdfToast({ title: "Создаём PDF...", msg: FUNNY_MESSAGES[msgIndex], progress });

    intervalRef.current = setInterval(() => {
      progress = Math.min(progress + Math.random() * 18 + 7, 85);
      msgIndex = (msgIndex + 1) % FUNNY_MESSAGES.length;
      setPdfToast({ title: "Создаём PDF...", msg: FUNNY_MESSAGES[msgIndex], progress });
    }, 350);

    try {
      const { exportCharacterToPDF } = await import("@/lib/pdf-export");
      await exportCharacterToPDF(character);
      if (intervalRef.current) clearInterval(intervalRef.current);
      setPdfToast({ title: "PDF готов!", msg: "Файл сохранён на устройство", progress: 100 });
      dismissTimeoutRef.current = setTimeout(() => setPdfToast(null), 2500);
    } catch {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setPdfToast({ title: "Ошибка", msg: "Не удалось создать PDF", progress: 100 });
      dismissTimeoutRef.current = setTimeout(() => setPdfToast(null), 3000);
    }
  }, []);

  return { pdfToast, exportPdf };
}
