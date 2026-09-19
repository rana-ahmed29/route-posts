export type NotificationType =
  | "share_post"
  | "comment_post"
  | "like_post"
  | "follow_user";

export type NotificationEntityType = "post" | "comment" | "user";

export interface NotificationActor {
  _id: string;
  name: string;
  photo: string;
}


export interface NotificationPostEntity {
  _id: string;
  body?: string;
  unavailable?: boolean;
}

export interface NotificationCommentEntity {
  _id: string;
  content?: string;
  post?: string;
  unavailable?: boolean;
}

export interface NotificationUserEntity {
  _id: string;
  name?: string;
  username?: string;
  photo?: string;
  unavailable?: boolean;
}

export interface NotificationI {
  _id: string;
  recipient: NotificationActor;
  actor: NotificationActor;
  type: NotificationType;
  entityType: NotificationEntityType;
  entityId: string;
  isRead: boolean;
  createdAt: string;
  entity:
    | NotificationPostEntity
    | NotificationCommentEntity
    | NotificationUserEntity;
}

export interface NotificationsI {
  success: boolean;
  message: string;
  data: {
    notifications: NotificationI[];
  };
  meta: {
    feedMode: string;
    pagination: {
      currentPage: number;
      numberOfPages: number;
      limit: number;
      total: number;
      nextPage: number | null;
    };
  };
}
