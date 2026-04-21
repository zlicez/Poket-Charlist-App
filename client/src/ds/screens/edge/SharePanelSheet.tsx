import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { cn } from "@/lib/utils";
import { typeClass } from "@/ds/tokens";
import { BottomSheet } from "@/ds/hero";
import { Button, InputField, Tag } from "@/ds/primitives";
import { disableShare, enableShare } from "@/lib/api/characters";
import { useToast } from "@/hooks/use-toast";
import { queryKeys } from "@shared/constants";

/**
 * X-02 — Share panel. Handoff 03-screens.jsx + README:
 *   [ocean «shared» tag + switch on/off]
 *   [url field с copy-button]
 *   [caption «любой с этой ссылкой увидит read-only state»]
 *   [revoke кнопка]
 *
 * Работает напрямую с enableShare/disableShare mutations — CharactersListPage
 * / CharacterScreen пробрасывают только characterId + open-state.
 */

interface ShareData {
  shareToken: string | null;
  isShared: boolean;
}

export function SharePanelSheet({
  open,
  onOpenChange,
  characterId,
  characterName,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  characterId: string;
  characterName?: string;
}) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<ShareData>({
    queryKey: queryKeys.characterShare(characterId),
    enabled: open && Boolean(characterId),
  });

  const enableMutation = useMutation({
    mutationFn: () => enableShare(characterId),
    onSuccess: ({ shareToken }) => {
      queryClient.setQueryData(queryKeys.characterShare(characterId), {
        shareToken,
        isShared: true,
      });
      toast({ title: "Общий доступ включён" });
    },
    onError: () =>
      toast({
        title: "Не удалось включить доступ",
        variant: "destructive",
      }),
  });

  const disableMutation = useMutation({
    mutationFn: () => disableShare(characterId),
    onSuccess: () => {
      queryClient.setQueryData(queryKeys.characterShare(characterId), {
        shareToken: null,
        isShared: false,
      });
      toast({ title: "Доступ отозван" });
    },
    onError: () =>
      toast({
        title: "Не удалось отозвать доступ",
        variant: "destructive",
      }),
  });

  const [copied, setCopied] = useState(false);

  const shareUrl = data?.shareToken
    ? `${window.location.origin}/shared/${data.shareToken}`
    : null;

  const handleCopy = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: "Не удалось скопировать",
        variant: "destructive",
      });
    }
  };

  const busy = enableMutation.isPending || disableMutation.isPending;
  const isShared = Boolean(data?.isShared && data.shareToken);

  return (
    <BottomSheet
      open={open}
      onOpenChange={onOpenChange}
      title="Поделиться"
      description={
        characterName
          ? `${characterName} — ссылка на read-only просмотр листа.`
          : "Ссылка на read-only просмотр листа."
      }
    >
      <div
        className={cn(
          "mt-2 rounded-ds-md border px-3 py-2.5 flex items-center gap-2",
          isShared
            ? "bg-ocean-bg border-ocean-soft"
            : "bg-paper-2 border-ink-200",
        )}
      >
        <Tag variant={isShared ? "ocean" : "default"}>
          {isShared ? "shared" : "offline"}
        </Tag>
        <span className={cn(typeClass("body-sm"), "text-ink-700 flex-1")}>
          {isLoading
            ? "Проверяем статус…"
            : isShared
              ? "Любой с ссылкой увидит лист в режиме read-only."
              : "Ссылка пока не создана."}
        </span>
      </div>

      {isShared && shareUrl && (
        <div className="mt-3">
          <InputField
            label="ССЫЛКА"
            value={shareUrl}
            readOnly
            onFocus={(e) => e.currentTarget.select()}
            data-testid="share-url"
          />
          <Button
            type="button"
            variant="outline"
            className="w-full mt-2"
            onClick={handleCopy}
            data-testid="share-copy"
          >
            {copied ? "Скопировано" : "Скопировать ссылку"}
          </Button>
        </div>
      )}

      <div className="flex gap-2.5 mt-4">
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => onOpenChange(false)}
          disabled={busy}
          data-testid="share-close"
        >
          Закрыть
        </Button>
        {isShared ? (
          <Button
            variant="ruby"
            className="flex-1"
            onClick={() => disableMutation.mutate()}
            disabled={busy}
            data-testid="share-revoke"
          >
            {disableMutation.isPending ? "Отзываем…" : "Отозвать"}
          </Button>
        ) : (
          <Button
            variant="primary"
            className="flex-1"
            onClick={() => enableMutation.mutate()}
            disabled={busy}
            data-testid="share-enable"
          >
            {enableMutation.isPending ? "Создаём…" : "Создать ссылку"}
          </Button>
        )}
      </div>

      <div className={cn(typeClass("caption"), "text-ink-500 mt-3 leading-[1.4]")}>
        Отозвать можно в любой момент. После отзыва старая ссылка перестаёт
        работать.
      </div>
    </BottomSheet>
  );
}
