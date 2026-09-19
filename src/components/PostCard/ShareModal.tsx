import { useEffect, useState } from "react";
import axios from "axios";
import { X } from "lucide-react";
import { sharePost } from "../../services/posts.services";

const DEFAULT_AVATAR =
  "https://pub-3cba56bacf9f4965bbb0989e07dada12.r2.dev/linkedPosts/default-profile.png";

// the post being shared, and the original post inside a shared post
export type OriginalPost = {
  _id: string;
  body?: string;
  image?: string | null;
  user?: {
    name?: string;
    username?: string;
    photo?: string;
  } | null;
};

type Props = {
  post: OriginalPost;
  onClose: () => void;
  onShared: () => void;
};

export default function ShareModal({ post, onClose, onShared }: Props) {
  const [text, setText] = useState("");
  const [isSharing, setIsSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // close with Esc (unless a share request is running)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && !isSharing) onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isSharing, onClose]);

  async function handleShare() {
    if (isSharing) return;

    setIsSharing(true);
    setError(null);

    try {
      // the text is optional: an empty share sends {}
      await sharePost(post._id, text.trim() || undefined);
      onShared();
      onClose();
    } catch (err) {
      console.error("Failed to share post:", err);
      const message = axios.isAxiosError(err)
        ? err.response?.data?.message
        : null;
      setError(message || "Couldn't share this post. Please try again.");
    } finally {
      setIsSharing(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-90 flex items-center justify-center bg-black/50 p-4"
      onClick={() => !isSharing && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Share post"
        className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="text-base font-bold text-slate-900">Share post</h2>
          <button
            type="button"
            onClick={onClose}
            disabled={isSharing}
            aria-label="Close"
            className="cursor-pointer rounded p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed"
          >
            <X size={18} />
          </button>
        </div>

        {/* body */}
        <div className="space-y-4 overflow-y-auto px-5 py-5">
          <textarea
            autoFocus
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={isSharing}
            rows={3}
            placeholder="Say something about this..."
            className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-relaxed text-slate-800 outline-none transition focus:border-[#1877f2] disabled:opacity-60"
          />

          {/* preview of the post being shared */}
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
            <div className="flex items-center gap-3 p-4 pb-3">
              <img
                src={post.user?.photo || DEFAULT_AVATAR}
                alt={post.user?.name}
                className="h-10 w-10 rounded-full object-cover"
              />
              <div>
                <p className="text-sm font-bold text-slate-900">
                  {post.user?.name ?? "Unknown user"}
                </p>
                {post.user?.username && (
                  <p className="text-xs text-slate-500">
                    @{post.user.username}
                  </p>
                )}
              </div>
            </div>

            {post.body?.trim() && (
              <p className="whitespace-pre-wrap px-4 pb-3 text-sm leading-relaxed text-slate-800">
                {post.body}
              </p>
            )}

            {post.image && (
              <div className="bg-slate-200/70">
                <img
                  src={post.image}
                  alt={post.body}
                  className="mx-auto max-h-64 w-full object-contain"
                />
              </div>
            )}
          </div>

          {error && (
            <p role="alert" className="text-xs font-semibold text-red-600">
              {error}
            </p>
          )}
        </div>

        {/* footer */}
        <div className="flex justify-end gap-2 border-t border-slate-200 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={isSharing}
            className="cursor-pointer rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleShare}
            disabled={isSharing}
            className="cursor-pointer rounded-lg bg-[#1877f2] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#1461c9] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSharing ? "Sharing..." : "Share now"}
          </button>
        </div>
      </div>
    </div>
  );
}
