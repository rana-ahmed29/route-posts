

import type { CommentCreator } from "./postCard";

export interface CommentLike {
  _id: string;
  content: string;
  image?: string;
  createdAt: string;
  likes?: string[];
  likesCount?: number;
  commentCreator: CommentCreator;
}

export interface CommentsListProps {
  postId: string;
  comments: CommentLike[];
  onCommentAdded?: () => void;
  onViewLess?: () => void;
  avatar?: string;
  username?: string;
}