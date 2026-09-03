export interface PostCardI {
  _id: string;
  body: string;
  image: string;
  privacy: string;
  user: User;
  sharedPost: SharedPost;
  likes: string[];
  createdAt: string;
  commentsCount: number;
  topComment: TopComment2;
  comments?: TopComment2[];
  sharesCount: number;
  likesCount: number;
  isShare: boolean;
  id: string;
  bookmarked: boolean;
}

export interface User {
  _id: string;
  name: string;
  username: string;
  photo: string;
}

export interface SharedPost {
  _id: string;
  body: string;
  image: string;
  privacy: string;
  user: User2;
  sharedPost: SharedPost;
  likes: string[];
  createdAt: string;
  commentsCount: number;
  topComment: TopComment;
  sharesCount: number;
  likesCount: number;
  isShare: boolean;
  id: string;
}

export interface User2 {
  _id: string;
  name: string;
  username: string;
  photo: string;
}

export interface TopComment {
  _id: string;
  content: string;
  image: string;
  commentCreator: CommentCreator;
  post: string;
  parentComment: ParentComment;
  likes: string[];
  createdAt: string;
}

export interface CommentCreator {
  _id: string;
  name: string;
  username: string;
  photo: string;
}


export interface ParentComment {
  _id: string;
  content: string;
  commentCreator: CommentCreator;
  post: string;
  parentComment: ParentComment;
  likes: string[];
  createdAt: string;
}

export interface TopComment2 {
  _id: string;
  content: string;
  commentCreator: CommentCreator2;
  post: string;
  parentComment: ParentComment2;
  likes: string[];
  createdAt: string;
}

export interface CommentCreator2 {
  _id: string;
  name: string;
  username: string;
  photo: string;
}

export interface ParentComment2 {
  _id: string;
  content: string;
  commentCreator: CommentCreator2;
  post: string;
  parentComment: ParentComment2;
  likes: string[];
  createdAt: string;
}
