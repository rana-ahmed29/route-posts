import { useEffect, useRef, useState } from "react";

type Privacy = "public" | "following" | "only_me";

interface AdjustProfilePhotoModalProps {
  file: File;
  onCancel: () => void;
  onSave: (croppedFile: File, privacy: Privacy) => Promise<void> | void;
}

const MAX_FRAME_SIZE = 320;
const MIN_FRAME_SIZE = 200;
const EXPORT_SIZE = 512;

/*
 * The frame can't just always be 320px — on a narrow phone, 320px plus the
 * modal's own padding plus the backdrop's padding is wider than the screen.
 * This shrinks the frame to fit, down to a sane minimum.
 */
function computeFrameSize() {
  if (typeof window === "undefined") return MAX_FRAME_SIZE;
  // reserve room for: backdrop p-4 (32px) + modal p-4/sm:p-5 (~40px) on both sides
  const reserved = 96;
  const available = window.innerWidth - reserved;
  return Math.max(MIN_FRAME_SIZE, Math.min(MAX_FRAME_SIZE, available));
}

export default function AdjustProfilePhotoModal({
  file,
  onCancel,
  onSave,
}: AdjustProfilePhotoModalProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const [naturalSize, setNaturalSize] = useState<{
    w: number;
    h: number;
  } | null>(null);

  const [zoom, setZoom] = useState(1);

  const [offset, setOffset] = useState({
    x: 0,
    y: 0,
  });

  const [privacy, setPrivacy] = useState<Privacy>("public");

  const [isSaving, setIsSaving] = useState(false);

  const [isDragging, setIsDragging] = useState(false);

  const [frameSize, setFrameSize] = useState(computeFrameSize);

  const dragStart = useRef({
    x: 0,
    y: 0,
  });

  const offsetStart = useRef({
    x: 0,
    y: 0,
  });

  /*
   * Recompute the frame size if the viewport is resized while the
   * modal is open (e.g. rotating a phone), and re-clamp the current
   * pan offset since the allowed movement range changes with it.
   */
  useEffect(() => {
    function handleResize() {
      setFrameSize(computeFrameSize());
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /*
   * Load selected image.
   */
  useEffect(() => {
    const url = URL.createObjectURL(file);

    setImageUrl(url);

    const img = new Image();

    img.onload = () => {
      setNaturalSize({
        w: img.naturalWidth,
        h: img.naturalHeight,
      });
    };

    img.onerror = () => {
      setNaturalSize(null);
    };

    img.src = url;

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [file]);

  /*
   * Reset zoom and position when selecting
   * a new image.
   */
  useEffect(() => {
    setZoom(1);

    setOffset({
      x: 0,
      y: 0,
    });
  }, [file]);

  /*
   * Calculate the minimum scale required
   * to completely cover the frame.
   *
   * Math.max() means:
   *
   * - width can never be smaller than the frame
   * - height can never be smaller than the frame
   *
   * The extra part will be cropped.
   */
  const baseScale = naturalSize
    ? Math.max(frameSize / naturalSize.w, frameSize / naturalSize.h)
    : 1;

  /*
   * Final scale after zoom.
   */
  const scale = baseScale * zoom;

  /*
   * Final displayed image dimensions.
   */
  const displayedW = naturalSize ? naturalSize.w * scale : frameSize;

  const displayedH = naturalSize ? naturalSize.h * scale : frameSize;

  /*
   * Maximum horizontal movement.
   */
  const maxOffsetX = Math.max(0, (displayedW - frameSize) / 2);

  /*
   * Maximum vertical movement.
   */
  const maxOffsetY = Math.max(0, (displayedH - frameSize) / 2);

  /*
   * Keep image inside the frame.
   */
  function clamp(x: number, y: number) {
    return {
      x: Math.max(-maxOffsetX, Math.min(maxOffsetX, x)),

      y: Math.max(-maxOffsetY, Math.min(maxOffsetY, y)),
    };
  }

  /*
   * Re-clamp whenever the frame size changes (window resized) so the
   * image doesn't end up positioned outside the now-smaller frame.
   */
  useEffect(() => {
    setOffset((prev) => clamp(prev.x, prev.y));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [frameSize, naturalSize, zoom]);

  /*
   * Zoom handler.
   */
  function handleZoomChange(newZoom: number) {
    const nextScale = naturalSize
      ? Math.max(frameSize / naturalSize.w, frameSize / naturalSize.h) * newZoom
      : newZoom;

    const nextW = naturalSize ? naturalSize.w * nextScale : frameSize;

    const nextH = naturalSize ? naturalSize.h * nextScale : frameSize;

    const nextMaxX = Math.max(0, (nextW - frameSize) / 2);

    const nextMaxY = Math.max(0, (nextH - frameSize) / 2);

    setZoom(newZoom);

    /*
     * Re-clamp current position because
     * the allowed movement changes with zoom.
     */
    setOffset((prev) => ({
      x: Math.max(-nextMaxX, Math.min(nextMaxX, prev.x)),

      y: Math.max(-nextMaxY, Math.min(nextMaxY, prev.y)),
    }));
  }

  /*
   * Start dragging.
   */
  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    setIsDragging(true);

    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
    };

    offsetStart.current = {
      ...offset,
    };

    /*
     * Continue receiving pointer events even
     * if pointer leaves the frame.
     */
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  /*
   * Move image while dragging.
   */
  function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
    if (!isDragging) return;

    const dx = e.clientX - dragStart.current.x;

    const dy = e.clientY - dragStart.current.y;

    setOffset(clamp(offsetStart.current.x + dx, offsetStart.current.y + dy));
  }

  /*
   * Stop dragging.
   */
  function handlePointerUp(e?: React.PointerEvent<HTMLDivElement>) {
    setIsDragging(false);

    if (e && e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  }

  /*
   * Save image.
   */
  async function handleSave() {
    if (!imageUrl || !naturalSize) return;

    setIsSaving(true);

    try {
      const croppedFile = await exportCroppedImage();

      await onSave(croppedFile, privacy);
    } finally {
      setIsSaving(false);
    }
  }

  /*
   * Export exactly what the user sees
   * inside the frame.
   *
   * Output = 512x512 PNG, regardless of the on-screen frame size.
   */
  function exportCroppedImage(): Promise<File> {
    return new Promise((resolve, reject) => {
      if (!imageUrl || !naturalSize) {
        reject(new Error("Image is not ready"));
        return;
      }

      const img = new Image();

      img.onload = () => {
        /*
         * Create output canvas.
         */
        const canvas = document.createElement("canvas");

        canvas.width = EXPORT_SIZE;
        canvas.height = EXPORT_SIZE;

        const ctx = canvas.getContext("2d");

        if (!ctx) {
          reject(new Error("Canvas not supported"));
          return;
        }

        /*
         * Convert on-screen preview coordinates (frameSize) to
         * EXPORT_SIZE export coordinates.
         */
        const ratio = EXPORT_SIZE / frameSize;

        /*
         * Image size in exported canvas.
         */
        const exportW = displayedW * ratio;

        const exportH = displayedH * ratio;

        /*
         * Image position in exported canvas.
         */
        const exportLeft = ((frameSize - displayedW) / 2 + offset.x) * ratio;

        const exportTop = ((frameSize - displayedH) / 2 + offset.y) * ratio;

        /*
         * Draw image.
         */
        ctx.drawImage(img, exportLeft, exportTop, exportW, exportH);

        /*
         * Convert canvas to PNG.
         */
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error("Failed to export image"));
            return;
          }

          const croppedFile = new File([blob], file.name, {
            type: "image/png",
          });

          resolve(croppedFile);
        }, "image/png");
      };

      img.onerror = () => {
        reject(new Error("Failed to load image"));
      };

      img.src = imageUrl;
    });
  }

  return (
    <div className="fixed inset-0 z-90 flex items-center justify-center bg-black/70 p-4">
      <div className="max-h-[90vh] w-full max-w-140 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-4 shadow-xl sm:p-5">
        {/* Header */}
        <div className="mb-3">
          <h3 className="text-lg font-extrabold text-slate-900">
            Adjust profile photo
          </h3>

          <p className="text-sm text-slate-500">
            Drag to reposition and use zoom for perfect framing.
          </p>
        </div>

        {/* Preview */}
        <div
          className="mx-auto"
          style={{ height: `${frameSize}px`, width: `${frameSize}px` }}
        >
          <div
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className="relative touch-none overflow-hidden rounded-2xl bg-slate-100 ring-1 ring-slate-200"
            style={{
              height: `${frameSize}px`,
              width: `${frameSize}px`,
              cursor: isDragging ? "grabbing" : "grab",
            }}
          >
            {imageUrl && naturalSize && (
              <img
                src={imageUrl}
                alt="Selected profile"
                draggable={false}
                className="pointer-events-none absolute select-none"
                style={{
                  /*
                   * Important:
                   * Don't let global img CSS
                   * shrink this image.
                   */
                  width: `${displayedW}px`,
                  height: `${displayedH}px`,
                  maxWidth: "none",
                  maxHeight: "none",

                  /*
                   * Always start from the center.
                   */
                  left: "50%",
                  top: "50%",

                  /*
                   * Move from center + user's offset.
                   */
                  transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px)`,

                  /*
                   * Prevent accidental selection.
                   */
                  userSelect: "none",
                }}
              />
            )}
          </div>
        </div>

        {/* Zoom */}
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500">
            <span className="font-semibold text-slate-700">Zoom</span>

            <span className="font-semibold text-slate-500">
              {zoom.toFixed(2)}x
            </span>
          </div>

          <input
            type="range"
            min={1}
            max={3}
            step={0.01}
            value={zoom}
            onChange={(e) => handleZoomChange(Number(e.target.value))}
            className="h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-[#1877f2]"
          />
        </div>

        {/* Privacy */}
        <div className="mt-4">
          <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-slate-500">
            Post privacy
          </label>

          <select
            value={privacy}
            onChange={(e) => setPrivacy(e.target.value as Privacy)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-[#1877f2]"
          >
            <option value="public">Public</option>

            <option value="following">Followers</option>

            <option value="only_me">Only me</option>
          </select>
        </div>

        {/* Actions */}
        <div className="mt-5 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            className="inline-flex cursor-pointer items-center rounded-lg border border-slate-300 px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving || !naturalSize}
            className="inline-flex cursor-pointer items-center rounded-lg bg-[#1877f2] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#166fe5] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? "Saving..." : "Save photo"}
          </button>
        </div>
      </div>
    </div>
  );
}
