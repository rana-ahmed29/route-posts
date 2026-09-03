import { useRef, useState } from "react";
import {
  MessageCircle,
  Image as ImageIcon,
  Smile,
  Send,
  X,
  Loader2,
} from "lucide-react";
import EmojiPicker, { type EmojiClickData } from "emoji-picker-react";
import type { CommentsListProps } from "../../types/comments";
import { createComment } from "../../services/comments.services";

export default function CommentsList({
  postId,
  onCommentAdded,
  comments,
  onViewLess,
  avatar = "https://pub-3cba56bacf9f4965bbb0989e07dada12.r2.dev/linkedPosts/default-profile.png",
  username = "Rana Ahmed",
}: CommentsListProps) {
  const [commentText, setCommentText] = useState("");
  const [userImg, setUserImg] = useState<File | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setCommentText((prev) => prev + emojiData.emoji);
    setShowPicker(false);
  };
  const inputImg = useRef<HTMLInputElement | null>(null);

  async function addComment() {
    if (!commentText.trim() && !userImg) return;

    setIsSending(true);
    try {
      const formData = new FormData();
      // The API requires "content" to be at least 2 characters long,
      // even when an image is attached — a single space (1 char) still
      // fails validation, so fall back to two spaces if there's no text.
      formData.append("content", commentText.trim() || "  ");
      if (userImg) {
        formData.append("image", userImg);
      }

      await createComment(postId, formData);

      setCommentText("");
      setUserImg(null);
      onCommentAdded?.(); // parent refetches comments here — this is what shows the new comment
    } catch (error) {
      console.error("Failed to add comment:", error);
    } finally {
      setIsSending(false);
    }
  }

  function chooseFile() {
    inputImg.current?.click();
  }

  function getImgUrl() {
    const file = inputImg.current?.files?.[0];
    if (file) setUserImg(file);
  }

  return (
    <div className="mt-2">
      {/* header: count + sort dropdown */}
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
        <div className="flex items-center gap-2">
          <p className="text-sm font-extrabold tracking-wide text-slate-700">
            Comments
          </p>
          <span className="rounded-full bg-[#e7f3ff] px-2 py-0.5 text-[11px] font-bold text-[#1877f2]">
            {comments.length}
          </span>
        </div>

        <select className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-bold text-slate-700 outline-none ring-[#1877f2]/20 focus:border-[#1877f2] focus:bg-white focus:ring-2">
          <option value="relevant">Most relevant</option>
          <option value="newest">Newest</option>
        </select>
      </div>

      {/* comments list */}
      {comments.length > 0 ? (
        <div className="space-y-5">
          {comments.map((comment, i) => (
            <div key={comment._id ?? i}>
              <div className="flex items-start gap-2">
                <img
                  alt={comment.commentCreator.name}
                  className="h-9 w-9 shrink-0 rounded-full object-cover"
                  src={comment.commentCreator.photo}
                />
                <div className="min-w-0 flex-1">
                  <div className="rounded-2xl bg-slate-50 px-3 py-2">
                    <p className="text-xs font-bold text-slate-900">
                      {comment.commentCreator.name}
                      <span className="ml-1.5 font-normal text-slate-500">
                        @{comment.commentCreator.username}
                        {comment.createdAt &&
                          ` · ${new Date(comment.createdAt).toLocaleString(
                            "en-us",
                            {
                              dateStyle: "medium",
                              timeStyle: "short",
                            },
                          )}`}
                      </span>
                    </p>
                    <p className="mt-0.5 text-sm text-slate-700">
                      {comment.content}
                    </p>
                    {comment.image && (
                      <img
                        src={comment.image}
                        alt="Comment attachment"
                        className="mt-2 max-h-52 rounded-lg object-cover"
                      />
                    )}
                  </div>
                  <div className="mt-1 flex items-center gap-4 pl-1 text-xs font-semibold text-slate-500">
                    {comment.createdAt && (
                      <span>
                        {new Date(comment.createdAt).toLocaleString("en-us", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </span>
                    )}
                    <button className="cursor-pointer hover:underline">
                      Like ({comment.likesCount ?? comment.likes?.length ?? 0})
                    </button>
                    <button className="cursor-pointer hover:underline">
                      Reply
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-8 text-center">
            <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#eef3ff] text-[#1877f2]">
              <MessageCircle size={22} />
            </div>
            <p className="text-lg font-extrabold text-slate-800">
              No comments yet
            </p>
            <p className="mt-1 text-sm font-medium text-slate-500">
              Be the first to comment.
            </p>
          </div>
        </div>
      )}

      {/* view less toggle */}
      {comments.length > 0 && onViewLess && (
        <button
          type="button"
          onClick={onViewLess}
          className="mt-4 cursor-pointer text-xs font-bold text-[#1877f2] hover:underline"
        >
          View less
        </button>
      )}

      {/* add-comment input */}
      <div className="mt-5 flex items-start gap-2">
        <img
          alt={username}
          className="h-9 w-9 shrink-0 rounded-full object-cover"
          src={avatar}
        />

        <div className="flex-1">
          <div className="relative flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2.5">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder={`Comment as ${username}...`}
              className="flex-1 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
            />
            <button
              type="button"
              onClick={chooseFile}
              className="cursor-pointer text-slate-400 hover:text-slate-600"
            >
              <input onChange={getImgUrl} ref={inputImg} type="file" hidden />
              <ImageIcon size={18} />
            </button>
            <button
              type="button"
              onClick={() => setShowPicker((prev) => !prev)}
              className="cursor-pointer text-slate-400 hover:text-slate-600"
            >
              <Smile size={18} />
            </button>
            <button
              type="button"
              onClick={addComment}
              disabled={isSending}
              className="cursor-pointer rounded-full bg-[#1877f2] p-1.5 text-white hover:bg-[#1461c9] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Send size={16} />
              )}
            </button>

            {showPicker && (
              <div className="absolute bottom-full right-0 z-50 mb-2">
                <EmojiPicker
                  onEmojiClick={handleEmojiClick}
                  lazyLoadEmojis={true}
                />
              </div>
            )}
          </div>

          {/* image preview */}
          {userImg && (
            <div className="relative mt-2">
              <img
                alt="Comment preview"
                className="max-h-52 w-full rounded-lg object-contain"
                src={URL.createObjectURL(userImg)}
              />
              <button
                type="button"
                onClick={() => setUserImg(null)}
                className="absolute cursor-pointer right-2 top-2 rounded-full bg-black/60 p-1 text-white"
              >
                <X size={14} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
 