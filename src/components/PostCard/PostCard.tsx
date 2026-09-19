import { useContext, useState } from "react";
import { ExternalLink, X, AlertTriangle } from "lucide-react";
import {
  MoreHorizontal,
  Bookmark,
  Pencil,
  Trash2,
  Globe,
  ThumbsUp,
  MessageCircle,
  Share2,
  Repeat2,
} from "lucide-react";
import axios from "axios";
import type { PostCardI } from "../../types/postCard";
import { Link } from "react-router";
import CommentsList from "./CommentsList";
import EditPost from "./EditPost";
import ShareModal, { type OriginalPost } from "./ShareModal";
import { getPostComments } from "../../services/comments.services";
import {
  deletePost,
  bookmarkPost,
  likeAndUnlikedPost,
} from "../../services/posts.services";
import type { PostCommentsI } from "../../types/postComments";
import { Button, Dropdown, Label } from "@heroui/react";
import { userContext } from "../../context/UserContext";

const DEFAULT_AVATAR =
  "https://pub-3cba56bacf9f4965bbb0989e07dada12.r2.dev/linkedPosts/default-profile.png";

export default function PostCard({
  post,
  refatchPosts,
}: {
  post: PostCardI;
  refatchPosts: () => void;
}) {
  const { userData } = useContext(userContext);

  const [isImageOpen, setIsImageOpen] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // --- share -----------------------------------------------------------------
  const [isShareOpen, setIsShareOpen] = useState(false);

  // --- shared/original post (if this card IS a share) -------------------------
  // rename `sharedPost` below to whatever field your API actually returns
  // (e.g. originalPost / sharedFrom) if it differs
  const sharedPostFrom = post as PostCardI & {
    sharedPost?: OriginalPost | null;
    originalPost?: OriginalPost | null;
  };
  const originalPost =
    sharedPostFrom.sharedPost ?? sharedPostFrom.originalPost ?? null;

  // --- save / unsave -------------------------------------------------------
  // the post may say whether you saved it – rename if your API uses other names
  const savedPost = post as PostCardI & {
    bookmarked?: boolean;
    isBookmarked?: boolean;
    bookmarks?: string[];
  };
  const initiallySaved = Boolean(
    savedPost.bookmarked ??
    savedPost.isBookmarked ??
    savedPost.bookmarks?.includes(userData?._id ?? ""),
  );

  const [isSaved, setIsSaved] = useState(initiallySaved);
  const [prevInitiallySaved, setPrevInitiallySaved] = useState(initiallySaved);
  const [isSaving, setIsSaving] = useState(false);

  if (initiallySaved !== prevInitiallySaved) {
    setPrevInitiallySaved(initiallySaved);
    setIsSaved(initiallySaved);
  }

  // --- like / unlike -------------------------------------------------------
  const likedPost = post as PostCardI & { isLiked?: boolean; likes?: string[] };
  const initiallyLiked = Boolean(
    likedPost.isLiked ?? likedPost.likes?.includes(userData?._id ?? ""),
  );

  const [isLiked, setIsLiked] = useState(initiallyLiked);
  const [prevInitiallyLiked, setPrevInitiallyLiked] = useState(initiallyLiked);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [prevPostLikesCount, setPrevPostLikesCount] = useState(post.likesCount);
  const [isLiking, setIsLiking] = useState(false);

  if (initiallyLiked !== prevInitiallyLiked) {
    setPrevInitiallyLiked(initiallyLiked);
    setIsLiked(initiallyLiked);
  }
  if (post.likesCount !== prevPostLikesCount) {
    setPrevPostLikesCount(post.likesCount);
    setLikesCount(post.likesCount);
  }

  const [fullComments, setFullComments] = useState<PostCommentsI[] | null>(
    null,
  );

  const previewComments = post.topComment ? [post.topComment] : [];

  async function fetchFullComments() {
    const { data } = await getPostComments(post._id);
    setFullComments(data.data.comments);
  }

  async function handleViewAllComments() {
    setShowAllComments(true);
    if (fullComments === null) {
      setIsLoadingComments(true);
      try {
        await fetchFullComments();
      } finally {
        setIsLoadingComments(false);
      }
    }
  }

  async function handleCommentAdded() {
    await fetchFullComments();
    refatchPosts();
  }

  async function handleToggleLike() {
    if (isLiking) return;
    const wasLiked = isLiked;

    setIsLiked(!wasLiked);
    setLikesCount((c) => Math.max(0, c + (wasLiked ? -1 : 1)));

    setIsLiking(true);
    try {
      await likeAndUnlikedPost(post._id);
    } catch (err) {
      console.error("Failed to like/unlike post:", err);
      setIsLiked(wasLiked);
      setLikesCount((c) => Math.max(0, c + (wasLiked ? 1 : -1)));
    } finally {
      setIsLiking(false);
    }
  }

  async function handleToggleSave() {
    if (isSaving) return;
    setIsSaving(true);
    try {
      await bookmarkPost(post._id);
      setIsSaved((prev) => !prev);
    } catch (err) {
      console.error("Failed to toggle bookmark:", err);
    } finally {
      setIsSaving(false);
    }
  }

  // called when the user picks an item from the post "..." menu
  function handlePostAction(key: React.Key) {
    if (key === "save-post") {
      handleToggleSave();
      return;
    }
    if (key === "edit-post") {
      setIsEditing(true);
      return;
    }
    if (key === "delete-post") {
      setDeleteError(null);
      setIsConfirmDeleteOpen(true);
      return;
    }
    console.log(`Selected: ${key}`);
  }

  function handlePostUpdated() {
    setIsEditing(false);
    refatchPosts();
  }

  async function handleConfirmDelete() {
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deletePost(post._id);
      setIsConfirmDeleteOpen(false);
      refatchPosts();
    } catch (err) {
      console.error("Failed to delete post:", err);
      const message = axios.isAxiosError(err)
        ? err.response?.data?.message
        : null;
      setDeleteError(message || "Couldn't delete this post. Please try again.");
    } finally {
      setIsDeleting(false);
    }
  }

  // called by ShareModal after a successful share — refresh so the
  // sharesCount on this card (and the feed) stays accurate
  function handleShared() {
    refatchPosts();
  }

  return (
    <article className="overflow-visible rounded-xl border border-slate-200 bg-white shadow-sm">
      {/* 1-5: creator avatar, name, and (username · time · privacy) on one line */}
      <div className="flex items-start justify-between p-4 pb-3">
        <div className="flex items-center gap-3">
          <Link className="shrink-0" to={`/profile/${post.user._id}`}>
            <img
              alt={post.user.name}
              className="h-11 w-11 rounded-full object-cover"
              src={post.user.photo || DEFAULT_AVATAR}
            />
          </Link>
          <div>
            <Link
              className="truncate text-sm font-bold text-foreground hover:underline"
              to={`/profile/${post.user._id}`}
            >
              {post.user.name}
            </Link>
            <div className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
              <span>@{post.user.username}</span>
              <span>·</span>
              <button className="rounded cursor-pointer px-0.5 py-0.5 text-xs font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 hover:underline">
                {new Date(post.createdAt).toLocaleString("en-us", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </button>
              <span>·</span>
              <Globe size={12} />
              <span>{post.privacy}</span>
            </div>
          </div>
        </div>

        <div className="rounded-full p-1.5 text-slate-500">
          <Dropdown>
            <Button
              aria-label="Post options"
              variant="ghost"
              className=" hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
            >
              <MoreHorizontal size={18} />
            </Button>
            <Dropdown.Popover>
              <Dropdown.Menu onAction={handlePostAction}>
                <Dropdown.Item
                  id="save-post"
                  textValue={isSaved ? "Unsave post" : "Save post"}
                  isDisabled={isSaving}
                >
                  <Bookmark
                    size={15}
                    fill={isSaved ? "currentColor" : "none"}
                  />
                  <Label>{isSaved ? "Unsave post" : "Save post"}</Label>
                </Dropdown.Item>

                {userData?._id === post.user._id && (
                  <>
                    {!isEditing && (
                      <Dropdown.Item id="edit-post" textValue="Edit post">
                        <Pencil size={15} />
                        <Label>Edit post</Label>
                      </Dropdown.Item>
                    )}

                    <Dropdown.Item
                      id="delete-post"
                      textValue="Delete post"
                      variant="danger"
                    >
                      <Trash2 size={15} />
                      <Label>Delete post</Label>
                    </Dropdown.Item>
                  </>
                )}
              </Dropdown.Menu>
            </Dropdown.Popover>
          </Dropdown>
        </div>
      </div>

      {isEditing ? (
        <div className="px-4 pb-3">
          <EditPost
            post={post}
            onCancel={() => setIsEditing(false)}
            onUpdated={handlePostUpdated}
          />
        </div>
      ) : (
        <>
          {/* 6: post content — the sharer's own comment, if any */}
          {post.body?.trim() && (
            <p className="px-4 pb-3 text-sm leading-relaxed text-foreground ">
              {post.body}
            </p>
          )}

          {isSaved && (
            <div className="px-4 pb-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#e7f3ff] px-3 py-1 text-xs font-semibold text-[#1877f2]">
                <Bookmark size={13} fill="#1877f2" />
                Saved
              </span>
            </div>
          )}

          {/* nested original-post preview — shown when this card is a share */}
          {originalPost && (
            <div className="mx-4 mb-3 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
              <div className="flex items-center justify-between gap-2 p-3 pb-2">
                <div className="flex items-center gap-2">
                  <img
                    src={originalPost.user?.photo || DEFAULT_AVATAR}
                    alt={originalPost.user?.name}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-900">
                      {originalPost.user?.name ?? "Unknown user"}
                    </p>
                    {originalPost.user?.username && (
                      <p className="text-[11px] text-slate-500">
                        @{originalPost.user.username}
                      </p>
                    )}
                  </div>
                </div>

                <Link
                  to={`/postDetails/${originalPost._id}`}
                  className="inline-flex shrink-0 cursor-pointer items-center gap-1 rounded-full bg-[#e7f3ff] px-2.5 py-1 text-xs font-bold text-[#1877f2] hover:bg-[#d9ecff]"
                >
                  Original Post
                  <ExternalLink size={12} />
                </Link>
              </div>

              {originalPost.body?.trim() && (
                <p className="whitespace-pre-wrap px-3 pb-3 text-sm text-slate-800">
                  {originalPost.body}
                </p>
              )}

              {originalPost.image && (
                <img
                  src={originalPost.image}
                  alt={originalPost.body}
                  className="max-h-72 w-full object-cover"
                />
              )}
            </div>
          )}

          {/* 7: post image — only for a post that isn't itself just a share wrapper */}
          {!originalPost && post.image && (
            <>
              <div className="max-h-155 overflow-hidden border-y border-slate-200">
                <button
                  type="button"
                  className="group relative block w-full cursor-zoom-in"
                  onClick={() => setIsImageOpen(true)}
                >
                  <img
                    src={post.image}
                    alt={post.body}
                    className="w-full object-cover cursor-pointer"
                  />
                  <span className="pointer-events-none absolute inset-0 bg-black/0 transition group-hover:bg-black/10" />
                </button>
              </div>

              {isImageOpen && (
                <div
                  className="fixed inset-0 z-80 flex items-center justify-center bg-black/90 p-4 sm:p-8"
                  onClick={() => setIsImageOpen(false)}
                >
                  <button
                    type="button"
                    className="absolute cursor-pointer right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
                    onClick={() => setIsImageOpen(false)}
                  >
                    <X size={20} />
                  </button>

                  <img
                    src={post.image}
                    alt={post.body}
                    className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              )}
            </>
          )}
        </>
      )}

      <div className="p-3 pt-3">
        <div className="mb-2 flex items-center justify-between text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#1877f2] text-white">
              <ThumbsUp size={11} fill="white" />
            </span>
            <button
              type="button"
              className="font-semibold transition cursor-pointer hover:text-[#1877f2] hover:underline"
            >
              {likesCount} likes
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs sm:gap-3 sm:text-sm">
            <span className="flex items-center gap-1">
              <Repeat2 size={15} />
              {post.sharesCount} shares
            </span>
            <span>{post.commentsCount} comments</span>
            <Link
              to={`/postDetails/${post._id}`}
              className="rounded-md px-2 py-1 text-xs font-bold text-[#1877f2] hover:bg-[#e7f3ff] cursor-pointer"
            >
              View details
            </Link>
          </div>
        </div>

        <div className="mx-4 border-t border-slate-200" />

        <div className="grid grid-cols-3 gap-1 p-1">
          <button
            onClick={handleToggleLike}
            disabled={isLiking}
            className={`cursor-pointer flex items-center justify-center gap-1.5 rounded-md p-2 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 sm:gap-2 sm:text-sm ${
              isLiked
                ? "bg-[#e7f3ff] text-[#1877f2]"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <ThumbsUp size={17} fill={isLiked ? "currentColor" : "none"} />
            Like
          </button>
          <button
            onClick={() => {
              if (showAllComments) {
                setShowAllComments(false);
              } else {
                handleViewAllComments();
              }
            }}
            className="cursor-pointer flex items-center justify-center gap-1.5 rounded-md p-2 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 sm:gap-2 sm:text-sm text-slate-600 hover:bg-slate-100"
          >
            <MessageCircle size={17} />
            Comment
          </button>
          <button
            type="button"
            onClick={() => setIsShareOpen(true)}
            className="cursor-pointer flex items-center justify-center gap-1.5 rounded-md p-2 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 sm:gap-2 sm:text-sm text-slate-600 hover:bg-slate-100"
          >
            <Share2 size={17} />
            Share
          </button>
        </div>

        {!showAllComments && previewComments.length > 0 && (
          <div className="mx-2 mb-4 rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-500">
              Top comment
            </p>

            <div className="flex items-start gap-2">
              <img
                alt={previewComments[0].commentCreator.name}
                className="h-8 w-8 rounded-full object-cover"
                src={previewComments[0].commentCreator.photo || DEFAULT_AVATAR}
              />
              <div className="min-w-0 flex flex-1 rounded-2xl bg-white px-3 py-2 justify-between">
                <div>
                  <p className="truncate text-xs font-bold text-slate-900">
                    {previewComments[0].commentCreator.name}
                  </p>
                  <p className="mt-0.5 whitespace-pre-wrap text-sm text-slate-700">
                    {previewComments[0].content}
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleViewAllComments}
              className="mt-2 cursor-pointer text-xs font-bold text-[#1877f2] hover:underline"
            >
              View all comments
            </button>
          </div>
        )}

        {showAllComments && (
          <>
            {isLoadingComments ? (
              <div className="py-6 text-center text-xs font-semibold text-slate-500">
                Loading comments…
              </div>
            ) : (
              <CommentsList
                postId={post._id}
                comments={fullComments ?? []}
                onViewLess={() => setShowAllComments(false)}
                onCommentAdded={handleCommentAdded}
              />
            )}
          </>
        )}
      </div>

      {/* share modal */}
      {isShareOpen && (
        <ShareModal
          post={post}
          onClose={() => setIsShareOpen(false)}
          onShared={handleShared}
        />
      )}

      {/* delete-post confirmation modal */}
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
                  Delete this post?
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  This post will be permanently removed from your profile and
                  feed.
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
                {isDeleting ? "Deleting..." : "Delete post"}
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
