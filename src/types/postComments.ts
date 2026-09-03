import type { ParentComment, CommentCreator } from "./postCard";

export interface PostCommentsI {
  _id: string;
  content: string;
  image: string;
  commentCreator: CommentCreator;
  post: string;
  parentComment: ParentComment;
  likes: string[];
  createdAt: string;
  repliesCount: number;
}
