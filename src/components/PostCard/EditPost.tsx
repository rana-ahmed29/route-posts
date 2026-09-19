import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { Image as ImageIcon, X, Smile } from "lucide-react";
import { updatePost } from "../../services/posts.services";
import EmojiPicker, { type EmojiClickData } from "emoji-picker-react";

type EditablePost = {
  _id: string;
  body?: string;
  image?: string;
};

type Props = {
  post: EditablePost;
  onCancel: () => void;
  onUpdated: (updatedPost: any) => void;
};

export default function EditPost({ post, onCancel, onUpdated }: Props) {
  const [body, setBody] = useState<string>(post.body ?? "");
  const [newImage, setNewImage] = useState<File | null>(null);
  const [removeImage, setRemoveImage] = useState<boolean>(false); // user wants to drop the existing image
  const [progress, setProgress] = useState<number>(0);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [isEmojiOpen, setIsEmojiOpen] = useState(false);
  const emojiRef = useRef<HTMLDivElement | null>(null);

  // create the preview URL once per selected file (and free it when it changes)
  const newImageUrl = useMemo(
    () => (newImage ? URL.createObjectURL(newImage) : null),
    [newImage],
  );

  useEffect(() => {
    return () => {
      if (newImageUrl) URL.revokeObjectURL(newImageUrl);
    };
  }, [newImageUrl]);

  // focus the textarea and put the cursor at the end of the text
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.focus();
    el.setSelectionRange(el.value.length, el.value.length);
  }, []);

  // close the emoji picker on outside click
  useEffect(() => {
    if (!isEmojiOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) {
        setIsEmojiOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isEmojiOpen]);

  // a new image always wins over an existing one; otherwise show the
  // existing image unless the user chose to remove it
  const previewSrc = newImage ? newImageUrl : removeImage ? null : post.image;

  const hasChanges =
    body.trim() !== (post.body ?? "").trim() || !!newImage || removeImage;
  const hasContent = body.trim().length > 0 || !!previewSrc;
  const canSave = hasChanges && hasContent && !isSaving;

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setNewImage(file);
      setRemoveImage(false); // picking a new file supersedes a pending removal
    }
    e.target.value = ""; // allow picking the same file again later
  }

  function handleDiscardImage() {
    if (newImage) {
      // discard the newly picked image, fall back to whatever was there before
      setNewImage(null);
    } else if (post.image) {
      // mark the existing image for removal
      setRemoveImage(true);
    }
  }

  function handleEmojiClick(emojiData: EmojiClickData) {
    const el = textareaRef.current;
    if (!el) {
      setBody((prev) => prev + emojiData.emoji);
      setIsEmojiOpen(false);
      return;
    }

    const start = el.selectionStart ?? body.length;
    const end = el.selectionEnd ?? body.length;
    const nextBody = body.slice(0, start) + emojiData.emoji + body.slice(end);
    setBody(nextBody);
    setIsEmojiOpen(false);

    // put the cursor right after the inserted emoji
    requestAnimationFrame(() => {
      el.focus();
      const cursor = start + emojiData.emoji.length;
      el.setSelectionRange(cursor, cursor);
    });
  }

  async function handleSave() {
    if (!canSave) return;

    setIsSaving(true);
    setError(null);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append("body", body.trim() || "  "); // same fallback as AddPost

      if (newImage) {
        formData.append("image", newImage);
      } else if (removeImage) {
        // tell the backend to drop the existing image — adjust the field
        // name/value to whatever your API expects (e.g. "removeImage": "true")
        formData.append("removeImage", "true");
      }

      const response = await updatePost(post._id, formData, setProgress);

      // if the API doesn't return the post, fall back to the local values
      const updated = response.data?.data?.post ?? {
        ...post,
        body: body.trim(),
        image: newImage ? previewSrc : removeImage ? undefined : post.image,
      };

      onUpdated(updated);
    } catch (err) {
      console.error("Failed to update post:", err);
      const message = axios.isAxiosError(err)
        ? err.response?.data?.message
        : null;
      setError(message || "Couldn't save your changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Escape" && !isSaving) onCancel();
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSave();
    }
  }

  return (
    <div className="mt-3">
      <textarea
        ref={textareaRef}
        value={body}
        onChange={(e) => setBody(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={isSaving}
        rows={4}
        placeholder="Edit your post..."
        className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-[15px] leading-relaxed text-slate-800 outline-none transition focus:border-[#1877f2] focus:bg-white disabled:cursor-not-allowed disabled:opacity-60"
      />

      {/* current image, or the new one the user picked; hidden once removeImage is set */}
      {previewSrc && (
        <div className="relative mt-2">
          <img
            src={previewSrc}
            alt="Post attachment"
            className="max-h-64 w-full rounded-lg object-contain"
          />
          {!isSaving && (
            <button
              type="button"
              onClick={handleDiscardImage}
              aria-label={newImage ? "Discard new image" : "Remove image"}
              className="absolute right-2 top-2 cursor-pointer rounded-full bg-black/60 p-1 text-white"
            >
              <X size={14} />
            </button>
          )}
        </div>
      )}

      {/* let the user undo a pending removal of the existing image */}
      {removeImage && !newImage && !isSaving && (
        <button
          type="button"
          onClick={() => setRemoveImage(false)}
          className="mt-2 cursor-pointer text-xs font-semibold text-[#1877f2] hover:underline"
        >
          Undo remove photo
        </button>
      )}

      {/* upload progress (only while sending a new image) */}
      {isSaving && newImage && (
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-[#1877f2] transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {error && (
        <p role="alert" className="mt-2 text-xs font-semibold text-red-600">
          {error}
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
        <div className="relative flex items-center gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isSaving}
            className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <ImageIcon size={18} className="text-emerald-600" />
            <span className="hidden sm:inline">
              {post.image || newImage ? "Change photo" : "Add photo"}
            </span>
          </button>

          <div className="relative" ref={emojiRef}>
            <button
              type="button"
              onClick={() => setIsEmojiOpen((prev) => !prev)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 cursor-pointer"
            >
              <Smile size={18} className="text-amber-500" />
              <span className="hidden sm:inline">Feeling/activity</span>
            </button>

            {isEmojiOpen && (
              <div className="absolute top-[calc(100%+6px)] left-0 z-30">
                <EmojiPicker onEmojiClick={handleEmojiClick} />
              </div>
            )}
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSaving}
            className="cursor-pointer rounded-full border border-slate-200 bg-white px-4 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!canSave}
            className="cursor-pointer rounded-full bg-[#1877f2] px-4 py-1.5 text-sm font-bold text-white transition hover:bg-[#1461c9] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving
              ? newImage
                ? `Saving ${progress}%`
                : "Saving..."
              : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
