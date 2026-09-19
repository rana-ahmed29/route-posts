import { useContext, useRef, useState } from "react";
import axios from "axios";
import {
  MessageCircle,
  Image as ImageIcon,
  Smile,
  Send,
  X,
  Loader2,
  ThumbsUp,
  Pencil,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import EmojiPicker, { type EmojiClickData } from "emoji-picker-react";
import type { CommentLike, CommentsListProps } from "../../types/comments";
import {
  createComment,
  updateComment,
  deleteComment,
  likeUnlikeComment,
} from "../../services/comments.services";
import { userContext } from "../../context/UserContext";

const DEFAULT_AVATAR =
  "https://pub-3cba56bacf9f4965bbb0989e07dada12.r2.dev/linkedPosts/default-profile.png";

// ---------------------------------------------------------------------------
// One comment row: shows the comment, and (if it's yours) edit/delete;
// anyone can like/unlike it.
// ---------------------------------------------------------------------------
function CommentItem({
  postId,
  comment,
  onChanged,
}: {
  postId: string;
  comment: CommentLike;
  onChanged: () => void; // parent refetches comments after edit/delete
}) {
  const { userData } = useContext(userContext);
  const isMine = userData?._id === comment.commentCreator._id;

  // --- like / unlike -------------------------------------------------------
  const initiallyLiked = Boolean(
    comment.isLiked ?? comment.likes?.includes(userData?._id ?? ""),
  );
  const [isLiked, setIsLiked] = useState(initiallyLiked);
  const [likesCount, setLikesCount] = useState<number>(
    comment.likesCount ?? comment.likes?.length ?? 0,
  );
  const [isLiking, setIsLiking] = useState(false);

  async function handleToggleLike() {
    if (isLiking) return;
    const wasLiked = isLiked;

    setIsLiked(!wasLiked);
    setLikesCount((c) => Math.max(0, c + (wasLiked ? -1 : 1)));

    setIsLiking(true);
    try {
      await likeUnlikeComment(postId, comment._id);
    } catch (err) {
      console.error("Failed to like/unlike comment:", err);
      setIsLiked(wasLiked);
      setLikesCount((c) => Math.max(0, c + (wasLiked ? 1 : -1)));
    } finally {
      setIsLiking(false);
    }
  }

  // --- edit ------------------------------------------------------------------
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.content);
  const [editImage, setEditImage] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const editFileRef = useRef<HTMLInputElement | null>(null);

  function startEdit() {
    setEditText(comment.content);
    setEditImage(null);
    setSaveError(null);
    setIsEditing(true);
  }

  async function handleSaveEdit() {
    if (!editText.trim() && !editImage) return;

    setIsSaving(true);
    setSaveError(null);
    try {
      const formData = new FormData();
      formData.append("content", editText.trim() || "  ");
      if (editImage) formData.append("image", editImage);

      await updateComment(postId, comment._id, formData);
      setIsEditing(false);
      onChanged();
    } catch (err) {
      console.error("Failed to update comment:", err);
      const message = axios.isAxiosError(err)
        ? err.response?.data?.message
        : null;
      setSaveError(message || "Couldn't save your changes. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  // --- delete ------------------------------------------------------------------
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function handleConfirmDelete() {
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deleteComment(postId, comment._id);
      setIsConfirmDeleteOpen(false);
      onChanged();
    } catch (err) {
      console.error("Failed to delete comment:", err);
      const message = axios.isAxiosError(err)
        ? err.response?.data?.message
        : null;
      setDeleteError(
        message || "Couldn't delete this comment. Please try again.",
      );
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div>
      <div className="flex items-start gap-2">
        <img
          alt={comment.commentCreator.name}
          className="h-9 w-9 shrink-0 rounded-full object-cover"
          src={comment.commentCreator.photo || DEFAULT_AVATAR}
        />
        <div className="min-w-0 flex-1">
          <div className="rounded-2xl bg-slate-50 px-3 py-2">
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs font-bold text-slate-900">
                {comment.commentCreator.name}
                <span className="ml-1.5 font-normal text-slate-500">
                  @{comment.commentCreator.username}
                  {comment.createdAt &&
                    ` · ${new Date(comment.createdAt).toLocaleString("en-us", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}`}
                </span>
              </p>

              {isMine && !isEditing && (
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={startEdit}
                    aria-label="Edit comment"
                    className="cursor-pointer rounded p-1 text-slate-400 transition hover:bg-slate-200 hover:text-slate-700"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDeleteError(null);
                      setIsConfirmDeleteOpen(true);
                    }}
                    aria-label="Delete comment"
                    className="cursor-pointer rounded p-1 text-slate-400 transition hover:bg-rose-100 hover:text-rose-600"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              )}
            </div>

            {isEditing ? (
              <div className="mt-1.5">
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  disabled={isSaving}
                  rows={2}
                  className="w-full resize-y rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-slate-800 outline-none focus:border-[#1877f2] disabled:cursor-not-allowed disabled:opacity-60"
                />

                {(editImage || comment.image) && (
                  <div className="relative mt-2">
                    <img
                      src={
                        editImage
                          ? URL.createObjectURL(editImage)
                          : comment.image
                      }
                      alt="Comment attachment"
                      className="max-h-40 w-full rounded-lg object-contain"
                    />
                    {editImage && !isSaving && (
                      <button
                        type="button"
                        onClick={() => setEditImage(null)}
                        aria-label="Discard new image"
                        className="absolute right-1.5 top-1.5 cursor-pointer rounded-full bg-black/60 p-1 text-white"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </div>
                )}

                {saveError && (
                  <p
                    role="alert"
                    className="mt-1.5 text-xs font-semibold text-red-600"
                  >
                    {saveError}
                  </p>
                )}

                <div className="mt-2 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => editFileRef.current?.click()}
                    disabled={isSaving}
                    className="cursor-pointer text-slate-400 hover:text-slate-600 disabled:cursor-not-allowed"
                  >
                    <input
                      ref={editFileRef}
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setEditImage(file);
                        e.target.value = "";
                      }}
                    />
                    <ImageIcon size={16} />
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      disabled={isSaving}
                      className="cursor-pointer rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveEdit}
                      disabled={isSaving || !editText.trim()}
                      className="cursor-pointer rounded-full bg-[#1877f2] px-3 py-1 text-xs font-bold text-white transition hover:bg-[#1461c9] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isSaving ? "Saving..." : "Save"}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <>
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
              </>
            )}
          </div>

          {!isEditing && (
            <div className="mt-1 flex items-center gap-4 pl-1 text-xs font-semibold text-slate-500">
              {comment.createdAt && (
                <span>
                  {new Date(comment.createdAt).toLocaleString("en-us", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </span>
              )}
              <button
                type="button"
                onClick={handleToggleLike}
                className={`inline-flex cursor-pointer items-center gap-1 hover:underline ${
                  isLiked ? "text-[#1877f2]" : ""
                }`}
              >
                <ThumbsUp size={12} fill={isLiked ? "currentColor" : "none"} />
                Like ({likesCount})
              </button>
              <button className="cursor-pointer hover:underline">Reply</button>
            </div>
          )}
        </div>
      </div>

      {/* delete-comment confirmation modal */}
      {isConfirmDeleteOpen && (
        <div
          className="fixed inset-0 z-90 flex items-center justify-center bg-black/50 p-4"
          onClick={() => !isDeleting && setIsConfirmDeleteOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between">
              <h2 className="text-base font-bold text-slate-900">
                Confirm action
              </h2>
              <button
                type="button"
                onClick={() => !isDeleting && setIsConfirmDeleteOpen(false)}
                disabled={isDeleting}
                aria-label="Close"
                className="cursor-pointer rounded p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mb-5 flex items-start gap-3">
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600">
                <AlertTriangle size={18} />
              </span>
              <div>
                <p className="text-sm font-bold text-slate-900">
                  Delete this comment?
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  This comment will be permanently removed.
                </p>
              </div>
            </div>

            {deleteError && (
              <p
                role="alert"
                className="mb-3 text-xs font-semibold text-red-600"
              >
                {deleteError}
              </p>
            )}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsConfirmDeleteOpen(false)}
                disabled={isDeleting}
                className="cursor-pointer rounded-lg border border-slate-200 bg-white px-4 py-1.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="cursor-pointer rounded-lg bg-rose-600 px-4 py-1.5 text-sm font-bold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isDeleting ? "Deleting..." : "Delete comment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------

export default function CommentsList({
  postId,
  onCommentAdded,
  comments,
  onViewLess,
  avatar,
  username,
}: CommentsListProps) {
  const { userData } = useContext(userContext);

  // fall back to the logged-in user's own photo/name for the "add comment"
  // box, instead of a hardcoded placeholder — only use the props if the
  // parent explicitly passed something
  const composerAvatar = avatar ?? userData?.photo ?? DEFAULT_AVATAR;
  const composerUsername = username ?? userData?.name ?? "You";

  const [commentText, setCommentText] = useState("");
  const [userImg, setUserImg] = useState<File | null>(null);
  const [showPicker, setShowPicker] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);

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
            <CommentItem
              key={comment._id ?? i}
              postId={postId}
              comment={comment}
              onChanged={() => onCommentAdded?.()}
            />
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
          alt={composerUsername}
          className="h-9 w-9 shrink-0 rounded-full object-cover"
          src={composerAvatar}
        />

        <div className="flex-1">
          <div className="relative flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2.5">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder={`Comment as ${composerUsername}...`}
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
