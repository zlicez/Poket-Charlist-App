import { useState, useCallback, useRef } from "react";
import Cropper from "react-easy-crop";
import type { Area, Point } from "react-easy-crop";
import { Button } from "@/components/ui/button";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
  ResponsiveDialogFooter,
} from "@/components/ui/responsive-dialog";
import { Upload, Trash2, ZoomIn, ZoomOut } from "lucide-react";
import { Slider } from "@/components/ui/slider";

// ── helpers ──────────────────────────────────────────────────────────────────

async function getCroppedImage(
  imageSrc: string,
  pixelCrop: Area,
  outputSize = 256,
  quality = 0.82,
): Promise<string> {
  const image = await createImageBitmap(await (await fetch(imageSrc)).blob());
  const canvas = document.createElement("canvas");
  canvas.width = outputSize;
  canvas.height = outputSize;
  const ctx = canvas.getContext("2d")!;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    outputSize,
    outputSize,
  );

  return canvas.toDataURL("image/jpeg", quality);
}

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const ACCEPTED = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

// ── AvatarPickerModal ─────────────────────────────────────────────────────────

interface AvatarPickerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentAvatar?: string;
  onSave: (dataUrl: string | null) => void;
}

export function AvatarPickerModal({
  open,
  onOpenChange,
  currentAvatar,
  onSave,
}: AvatarPickerModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // crop state
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  // ── file selection ──────────────────────────────────────────────────────────
  const handleFile = useCallback(async (file: File) => {
    setError(null);
    if (!ACCEPTED.includes(file.type)) {
      setError("Поддерживаются форматы: JPG, PNG, WebP, GIF");
      return;
    }
    if (file.size > MAX_BYTES) {
      setError("Файл слишком большой. Максимум 10 МБ");
      return;
    }
    const dataUrl = await readFileAsDataURL(file);
    setImageSrc(dataUrl);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
      e.target.value = ""; // reset so same file can be re-selected
    },
    [handleFile],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const file = e.dataTransfer.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  // ── save ────────────────────────────────────────────────────────────────────
  const handleSave = useCallback(async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    setIsSaving(true);
    try {
      const result = await getCroppedImage(imageSrc, croppedAreaPixels);
      onSave(result);
      onOpenChange(false);
      setImageSrc(null);
    } catch {
      setError("Не удалось обработать изображение. Попробуйте другой файл.");
    } finally {
      setIsSaving(false);
    }
  }, [imageSrc, croppedAreaPixels, onSave, onOpenChange]);

  const handleDelete = useCallback(() => {
    onSave(null);
    onOpenChange(false);
    setImageSrc(null);
  }, [onSave, onOpenChange]);

  const handleClose = useCallback(() => {
    onOpenChange(false);
    setImageSrc(null);
    setError(null);
  }, [onOpenChange]);

  // ── render ──────────────────────────────────────────────────────────────────
  return (
    <ResponsiveDialog open={open} onOpenChange={handleClose}>
      <ResponsiveDialogContent className="sm:max-w-md">
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>Фото персонажа</ResponsiveDialogTitle>
        </ResponsiveDialogHeader>

        <div className="flex flex-col gap-4 py-2">
          {/* ── crop area ── */}
          {imageSrc ? (
            <div className="flex flex-col gap-3">
              {/* Cropper */}
              <div
                className="relative w-full rounded-xl overflow-hidden bg-black"
                style={{ height: 280 }}
              >
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  cropShape="round"
                  showGrid={false}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                />
              </div>

              {/* Zoom slider */}
              <div className="flex items-center gap-3 px-1">
                <ZoomOut className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <Slider
                  min={1}
                  max={3}
                  step={0.05}
                  value={[zoom]}
                  onValueChange={([v]) => setZoom(v)}
                  className="flex-1"
                />
                <ZoomIn className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              </div>

              {/* Replace button */}
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-4 h-4 mr-2" />
                Выбрать другое фото
              </Button>
            </div>
          ) : (
            /* ── drop zone ── */
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border hover:border-accent/60 transition-colors cursor-pointer p-8 text-center select-none"
            >
              {currentAvatar ? (
                <img
                  src={currentAvatar}
                  alt="Текущее фото"
                  className="w-20 h-20 rounded-full object-cover border-2 border-accent/30"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center">
                  <Upload className="w-8 h-8 text-accent/60" />
                </div>
              )}

              <div>
                <p className="text-sm font-medium">
                  {currentAvatar ? "Заменить фото" : "Загрузить фото"}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  JPG, PNG, WebP или GIF · до 10 МБ
                </p>
                <p className="text-xs text-muted-foreground">
                  Перетащите файл или нажмите для выбора
                </p>
              </div>
            </div>
          )}

          {/* error */}
          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED.join(",")}
          className="hidden"
          onChange={handleInputChange}
        />

        <ResponsiveDialogFooter className="gap-2 flex-col sm:flex-row">
          {/* delete — only if avatar exists and no new image selected */}
          {currentAvatar && !imageSrc && (
            <Button
              variant="destructive"
              size="sm"
              className="sm:mr-auto"
              onClick={handleDelete}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Удалить фото
            </Button>
          )}

          <Button variant="outline" size="sm" onClick={handleClose}>
            Отмена
          </Button>

          <Button
            size="sm"
            disabled={!imageSrc || isSaving}
            onClick={handleSave}
          >
            {isSaving ? "Сохранение..." : "Сохранить"}
          </Button>
        </ResponsiveDialogFooter>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}

// ── AvatarViewModal ───────────────────────────────────────────────────────────

interface AvatarViewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  avatarSrc: string;
  characterName: string;
}

export function AvatarViewModal({
  open,
  onOpenChange,
  avatarSrc,
  characterName,
}: AvatarViewModalProps) {
  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent className="sm:max-w-sm">
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>{characterName}</ResponsiveDialogTitle>
        </ResponsiveDialogHeader>
        <div className="flex justify-center py-2">
          <img
            src={avatarSrc}
            alt={characterName}
            className="w-full max-w-[320px] rounded-2xl object-cover shadow-lg"
          />
        </div>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}
