import { useState } from "react";
import { X } from "lucide-react";

import {
  MoreHorizontal,
  Globe,
  ThumbsUp,
  MessageCircle,
  Share2,
  Repeat2,
} from "lucide-react";
import type { PostCardI } from "../../types/postCard";
import { Link } from "react-router";
import CommentsList from "./CommentsList";
import { getPostComments } from "../../services/comments.services";
import type { PostCommentsI } from "../../types/postComments";

export default function PostCard({
  post,
  refatchPosts,
}: {
  post: PostCardI;
  refatchPosts: () => void;
}) {
  const [isImageOpen, setIsImageOpen] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);
  const [isLoadingComments, setIsLoadingComments] = useState(false);

  // fullComments holds the REAL list fetched from the API once the user
  // asks to see all comments. Before that, we only have post.topComment
  // (a single preview comment) — NOT the full list, no matter how many
  // comments actually exist.
  const [fullComments, setFullComments] = useState<PostCommentsI[] | null>(
    null,
  );

  // Used only for the collapsed "Top comment" preview box.
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
    // Refresh this card's own comment list...
    await fetchFullComments();
    // ...and refresh the feed so commentsCount / topComment stay in sync too.
    refatchPosts();
  }

  return (
    <article className="overflow-visible rounded-xl border border-slate-200 bg-white shadow-sm">
      {/* 1-5: creator avatar, name, and (username · time · privacy) on one line */}
      <div className="flex items-start justify-between p-4 pb-3">
        <div className="flex items-center gap-3">
          <a
            className="shrink-0"
            href="#/profile/6a737f9a8ebe92c2c0129a83"
            data-discover="true"
          >
            <img
              alt="omar"
              className="h-11 w-11 rounded-full object-cover"
              src="https://pub-3cba56bacf9f4965bbb0989e07dada12.r2.dev/linkedPosts/default-profile.png"
            />
          </a>
          <div>
            <a
              className="truncate text-sm font-bold text-foreground hover:underline"
              href=""
            >
              {post.user.name}
            </a>
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

        <button className="cursor-pointer rounded-full p-1.5 text-slate-500 hover:bg-slate-100">
          <MoreHorizontal size={18} />
        </button>
      </div>

      {/* 6: post content */}
      <p className="px-4 pb-3 text-sm leading-relaxed text-foreground ">
        {post.body}
      </p>

      {/* 7: post image — full width of the card, no side padding */}
      {post.image && (
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
      <div className="p-3 pt-3">
        {/* 8: like/share/comment counts + view details */}
        <div className="mb-2 flex items-center justify-between text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#1877f2] text-white">
              <ThumbsUp size={11} fill="white" />
            </span>
            <button
              type="button"
              className="font-semibold transition cursor-pointer hover:text-[#1877f2] hover:underline"
            >
              {post.likesCount} likes
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

        {/* 9: like / comment / share buttons */}
        <div className="grid grid-cols-3 gap-1 p-1">
          <button className="cursor-pointer flex items-center justify-center gap-1.5 rounded-md p-2 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 sm:gap-2 sm:text-sm text-slate-600 hover:bg-slate-100">
            <ThumbsUp size={17} />
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
          <button className="cursor-pointer flex items-center justify-center gap-1.5 rounded-md p-2 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 sm:gap-2 sm:text-sm text-slate-600 hover:bg-slate-100">
            <Share2 size={17} />
            Share
          </button>
        </div>

        {/* 10a: collapsed — top comment preview */}
        {!showAllComments && previewComments.length > 0 && (
          <div className="mx-2 mb-4 rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-500">
              Top comment
            </p>

            <div className="flex items-start gap-2">
              <img
                alt={previewComments[0].commentCreator.name}
                className="h-8 w-8 rounded-full object-cover"
                src={previewComments[0].commentCreator.photo}
              />
              <div className="min-w-0 flex-1 rounded-2xl bg-white px-3 py-2">
                <p className="truncate text-xs font-bold text-slate-900">
                  {previewComments[0].commentCreator.name}
                </p>
                <p className="mt-0.5 whitespace-pre-wrap text-sm text-slate-700">
                  {previewComments[0].content}
                </p>
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

        {/* 10b: expanded — real full comments list, fetched on demand */}
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
    </article>
  );
}
