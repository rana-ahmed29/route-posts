import {
  ArrowLeft,
  MoreHorizontal,
  Globe,
  ThumbsUp,
  MessageCircle,
  Share2,
  Repeat2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { getSinglePost } from "../../services/postDetails";
import type { PostCardI } from "../../types/postCard";
import { getPostComments } from "../../services/comments.services";
import type { PostCommentsI } from "../../types/postComments";
import PostDetailsSkeleton from "./postDetailsSkeleton";
import CommentsList from "../../components/PostCard/CommentsList";

export default function PostDetails() {
  const [postDetails, setPostDetails] = useState<PostCardI | "">("");
  const [postComments, setPostComments] = useState<PostCommentsI[] | "">("");
  const [isImageOpen, setIsImageOpen] = useState(false);
  const [showAllComments, setShowAllComments] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const { postId } = useParams();

  async function getPostDetails(id: string) {
    const { data } = await getSinglePost(id);
    setPostDetails(data.data.post);
  }

  async function getComments(id: string) {
    const { data } = await getPostComments(id);
    setPostComments(data.data.comments);
  }

  useEffect(() => {
    async function loadAll() {
      setIsLoading(true);
      await Promise.all([getPostDetails(postId!), getComments(postId!)]);
      setIsLoading(false);
    }
    loadAll();
  }, [postId]);

  const comments = postComments || [];

  if (isLoading || !postDetails) {
    return <PostDetailsSkeleton />;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <Link
        to="/feed"
        className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
      >
        <ArrowLeft size={16} />
        Back
      </Link>

      <article className="overflow-visible rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-start justify-between p-4 pb-3">
          <div className="flex items-center gap-3">
            <a className="shrink-0" href="#/profile/6a737f9a8ebe92c2c0129a83">
              <img
                alt={postDetails.user.name}
                className="h-11 w-11 rounded-full object-cover"
                src={postDetails.user.photo}
              />
            </a>
            <div>
              <a
                className="truncate text-sm font-bold text-slate-900 hover:underline"
                href="#"
              >
                {postDetails.user.name}
              </a>
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

          <button className="cursor-pointer rounded-full p-1.5 text-slate-500 hover:bg-slate-100">
            <MoreHorizontal size={18} />
          </button>
        </div>

        <p className="px-4 pb-3 text-sm leading-relaxed text-slate-800">
          {postDetails.body}
        </p>

        {postDetails.image && (
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
                {postDetails.likesCount} likes
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
            <button className="cursor-pointer flex items-center justify-center gap-1.5 rounded-md p-2 text-xs font-semibold transition-colors text-slate-600 hover:bg-slate-100 sm:gap-2 sm:text-sm">
              <ThumbsUp size={17} />
              Like
            </button>
            <button
              onClick={() => setShowAllComments((prev) => !prev)}
              className="cursor-pointer flex items-center justify-center gap-1.5 rounded-md p-2 text-xs font-semibold transition-colors text-slate-600 hover:bg-slate-100 sm:gap-2 sm:text-sm"
            >
              <MessageCircle size={17} />
              Comment
            </button>
            <button className="cursor-pointer flex items-center justify-center gap-1.5 rounded-md p-2 text-xs font-semibold transition-colors text-slate-600 hover:bg-slate-100 sm:gap-2 sm:text-sm">
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
                  src={comments[0].commentCreator.photo}
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

      {showAllComments && (
        <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <CommentsList
            postId={postId!}
            comments={comments}
            onCommentAdded={() => getComments(postId!)}
            onViewLess={() => setShowAllComments(false)}
          />
        </div>
      )}
    </div>
  );
}
