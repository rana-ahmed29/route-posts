import {
  ArrowLeft,
  MoreHorizontal,
  Globe,
  ThumbsUp,
  MessageCircle,
  Share2,
  Repeat2,
  Bookmark,
  Pencil,
  Trash2,
  AlertTriangle,
  ExternalLink,
  X,
} from "lucide-react";
import { useContext, useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router";
import axios from "axios";
import { Button, Dropdown, Label } from "@heroui/react";
import {
  getSinglePost,
  likeAndUnlikedPost,
  bookmarkPost,
  deletePost,
} from "../../services/posts.services";
import type { PostCardI } from "../../types/postCard";
import { getPostComments } from "../../services/comments.services";
import type { PostCommentsI } from "../../types/postComments";
import PostDetailsSkeleton from "./postDetailsSkeleton";
import CommentsList from "../../components/PostCard/CommentsList";
import EditPost from "../../components/PostCard/EditPost";
import ShareModal, {
  type OriginalPost,
} from "../../components/PostCard/ShareModal";
import { userContext } from "../../context/UserContext";
import usePageTitle from "../../hooks/usePageTitle";

const DEFAULT_AVATAR =
  "https://pub-3cba56bacf9f4965bbb0989e07dada12.r2.dev/linkedPosts/default-profile.png";

export default function PostDetails() {
  const { userData } = useContext(userContext);

  const [postDetails, setPostDetails] = useState<PostCardI | "">("");
  const [postComments, setPostComments] = useState<PostCommentsI[] | "">("");
  const [isImageOpen, setIsImageOpen] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // like / unlike
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isLiking, setIsLiking] = useState(false);

  // save / unsave
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // edit
  const [isEditing, setIsEditing] = useState(false);

  // share
  const [isShareOpen, setIsShareOpen] = useState(false);

  // delete
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const navigate = useNavigate();

  const { postId } = useParams();

  // browser tab title — shows the author's name once loaded, generic
  // "Post" while loading. This MUST come after postDetails is declared above.
  usePageTitle(postDetails ? `${postDetails.user.name}'s post` : "Post");

  async function getPostDetails(id: string) {
    const { data } = await getSinglePost(id);
    const post = data.data.post;
    setPostDetails(post);

    setLikesCount(post.likesCount);
    setIsLiked(
      Boolean(post.isLiked ?? post.likes?.includes(userData?._id ?? "")),
    );
    setIsSaved(
      Boolean(
        post.bookmarked ??
        post.isBookmarked ??
        post.bookmarks?.includes(userData?._id ?? ""),
      ),
    );
  }

  async function getComments(id: string) {
    const { data } = await getPostComments(id);
    setPostComments(data.data.comments);
  }

  useEffect(() => {
    if (!postId) {
      setIsLoading(false);
      setLoadError("No post id was provided in the URL.");
      return;
    }

    let cancelled = false;

    async function loadAll() {
      setIsLoading(true);
      setLoadError(null);
      try {
        await Promise.all([getPostDetails(postId!), getComments(postId!)]);
      } catch (err) {
        console.error("Failed to load post details:", err);
        if (!cancelled) {
          const message = axios.isAxiosError(err)
            ? err.response?.data?.message
            : null;
          setLoadError(
            message ||
              "Couldn't load this post. It may have been deleted, or you may not have access to it.",
          );
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadAll();

    return () => {
      cancelled = true;
    };
  }, [postId]);

  async function handleToggleLike() {
    if (isLiking) return;
    const wasLiked = isLiked;

    setIsLiked(!wasLiked);
    setLikesCount((c) => Math.max(0, c + (wasLiked ? -1 : 1)));

    setIsLiking(true);
    try {
      await likeAndUnlikedPost(postId!);
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
      await bookmarkPost(postId!);
      setIsSaved((prev) => !prev);
    } catch (err) {
      console.error("Failed to toggle bookmark:", err);
    } finally {
      setIsSaving(false);
    }
  }

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
  }

  async function handlePostUpdated() {
    setIsEditing(false);
    if (postId) await getPostDetails(postId);
  }

  async function handleConfirmDelete() {
    setIsDeleting(true);
    setDeleteError(null);
    try {
      await deletePost(postId!);
      setIsConfirmDeleteOpen(false);
      navigate(-1);
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

  async function handleRetry() {
    if (!postId) return;
    setIsLoading(true);
    setLoadError(null);
    try {
      await Promise.all([getPostDetails(postId), getComments(postId)]);
    } catch (err) {
      console.error("Failed to load post details:", err);
      const message = axios.isAxiosError(err)
        ? err.response?.data?.message
        : null;
      setLoadError(
        message ||
          "Couldn't load this post. It may have been deleted, or you may not have access to it.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  // after a successful re-share, refresh so sharesCount stays accurate
  async function handleShared() {
    if (postId) await getPostDetails(postId);
  }

  const comments = postComments || [];

  if (isLoading) {
    return <PostDetailsSkeleton />;
  }

  if (loadError || !postDetails) {
    return (
      <div className="mx-auto max-w-4xl space-y-4">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600">
            <AlertTriangle size={22} />
          </div>
          <p className="text-lg font-extrabold text-slate-800">
            Couldn't load this post
          </p>
          <p className="mt-1 text-sm font-medium text-slate-500">
            {loadError || "Something went wrong."}
          </p>
          <button
            type="button"
            onClick={handleRetry}
            className="mt-4 cursor-pointer rounded-full bg-[#1877f2] px-4 py-1.5 text-sm font-bold text-white transition hover:bg-[#1461c9]"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  const isMyPost = userData?._id == postDetails.user._id;

  // the shared/original post, if this post IS a share — rename the field
  // below if your API calls it something other than sharedPost/originalPost
  const sharedPostFrom = postDetails as PostCardI & {
    sharedPost?: OriginalPost | null;
    originalPost?: OriginalPost | null;
  };
  const originalPost =
    sharedPostFrom.sharedPost ?? sharedPostFrom.originalPost ?? null;

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
      >
        <ArrowLeft size={16} />
        Back
      </button>

      <article className="overflow-visible rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-start justify-between p-4 pb-3">
          <div className="flex items-center gap-3">
            <Link className="shrink-0" to={`/profile/${postDetails.user._id}`}>
              <img
                alt={postDetails.user.name}
                className="h-11 w-11 rounded-full object-cover"
                src={postDetails.user.photo || DEFAULT_AVATAR}
              />
            </Link>
            <div>
              <Link
                className="truncate text-sm font-bold text-slate-900 hover:underline"
                to={`/profile/${postDetails.user._id}`}
              >
                {postDetails.user.name}
              </Link>
              <div className="flex flex-wrap items-center gap-1 text-xs text-slate-500">
                <span>@{postDetails.user.username}</span>
                <span>·</span>
                <button className="rounded cursor-pointer px-0.5 py-0.5 text-xs font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-700 hover:underline">
                  {new Date(postDetails.createdAt).toLocaleString("en-us", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </button>
                <span>·</span>
                <Globe size={12} />
                <span>{postDetails.privacy}</span>
              </div>
            </div>
          </div>

          <div className="rounded-full p-1.5 text-slate-500">
            <Dropdown>
              <Button
                aria-label="Post options"
                variant="ghost"
                className="hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
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

                  {isMyPost && (
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
              post={postDetails}
              onCancel={() => setIsEditing(false)}
              onUpdated={handlePostUpdated}
            />
          </div>
        ) : (
          <>
            {postDetails.body?.trim() && (
              <p className="px-4 pb-3 text-sm leading-relaxed text-slate-800">
                {postDetails.body}
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

            {/* nested original-post preview — shown when this post is a share */}
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
                    className="max-h-96 w-full object-cover"
                  />
                )}
              </div>
            )}

            {/* only show this post's own image when it isn't itself a share */}
            {!originalPost && postDetails.image && (
              <>
                <div className="max-h-155 overflow-hidden border-y border-slate-200">
                  <button
                    type="button"
                    className="group relative block w-full cursor-zoom-in"
                    onClick={() => setIsImageOpen(true)}
                  >
                    <img
                      src={postDetails.image}
                      alt={postDetails.body}
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
                      src={postDetails.image}
                      alt={postDetails.body}
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
                {postDetails.sharesCount} shares
              </span>
              <span>{postDetails.commentsCount} comments</span>
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
              onClick={() => setShowAllComments((prev) => !prev)}
              className="cursor-pointer flex items-center justify-center gap-1.5 rounded-md p-2 text-xs font-semibold transition-colors text-slate-600 hover:bg-slate-100 sm:gap-2 sm:text-sm"
            >
              <MessageCircle size={17} />
              Comment
            </button>
            <button
              type="button"
              onClick={() => setIsShareOpen(true)}
              className="cursor-pointer flex items-center justify-center gap-1.5 rounded-md p-2 text-xs font-semibold transition-colors text-slate-600 hover:bg-slate-100 sm:gap-2 sm:text-sm"
            >
              <Share2 size={17} />
              Share
            </button>
          </div>

          {!showAllComments && comments.length > 0 && (
            <div className="mx-2 mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-500">
                Top comment
              </p>

              <div className="flex items-start gap-2">
                <img
                  alt={comments[0].commentCreator.name}
                  className="h-8 w-8 rounded-full object-cover"
                  src={comments[0].commentCreator.photo || DEFAULT_AVATAR}
                />
                <div className="min-w-0 flex-1 rounded-2xl bg-white px-3 py-2">
                  <p className="truncate text-xs font-bold text-slate-900">
                    {comments[0].commentCreator.name}
                  </p>
                  <p className="mt-0.5 whitespace-pre-wrap text-sm text-slate-700">
                    {comments[0].content}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowAllComments(true)}
                className="mt-2 cursor-pointer text-xs font-bold text-[#1877f2] hover:underline"
              >
                View all comments
              </button>
            </div>
          )}
        </div>
      </article>

      {showAllComments && postId && (
        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <CommentsList
            postId={postId}
            comments={comments}
            onCommentAdded={() => getComments(postId)}
            onViewLess={() => setShowAllComments(false)}
          />
        </div>
      )}

      {/* share modal */}
      {isShareOpen && (
        <ShareModal
          post={postDetails}
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
    </div>
  );
}
