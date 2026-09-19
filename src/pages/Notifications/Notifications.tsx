import { useEffect, useState } from "react";
import { Link } from "react-router";
import {
  MessageCircle,
  Heart,
  Repeat2,
  UserPlus,
  CheckCheck,
  Check,
  Dot,
} from "lucide-react";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../../services/notifications.services";
import type { NotificationI } from "../../types/notifications";
import usePageTitle from "../../hooks/usePageTitle";

const DEFAULT_AVATAR =
  "https://pub-3cba56bacf9f4965bbb0989e07dada12.r2.dev/linkedPosts/default-profile.png";

type Tab = "all" | "unread";

function timeAgo(dateString: string) {
  const diffMs = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "now";
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d`;
  const months = Math.floor(days / 30);
  return `${months}mo`;
}


function notificationBadge(type: NotificationI["type"]) {
  switch (type) {
    case "share_post":
      return { icon: <Repeat2 size={15} />, colorClass: "text-emerald-600" };
    case "comment_post":
      return {
        icon: <MessageCircle size={15} />,
        colorClass: "text-[#1877f2]",
      };
    case "like_post":
      return { icon: <Heart size={15} />, colorClass: "text-rose-500" };
    case "follow_user":
      return { icon: <UserPlus size={15} />, colorClass: "text-violet-600" };
  }
}

function notificationText(n: NotificationI) {
  switch (n.type) {
    case "share_post":
      return "shared your post";
    case "like_post":
      return "liked your post";
    case "follow_user":
      return "followed you";
    case "comment_post":
      return n.entityType === "comment"
        ? "replied to your comment"
        : "commented on your post";
  }
}

function notificationPreview(n: NotificationI): string | null {
  if ("unavailable" in n.entity && n.entity.unavailable) return null;
  if (n.entityType === "post" && "body" in n.entity)
    return n.entity.body ?? null;
  if (n.entityType === "comment" && "content" in n.entity)
    return n.entity.content ?? null;
  if (n.entityType === "user" && "name" in n.entity)
    return n.entity.name ?? n.actor.name;
  return null;
}

function notificationLink(n: NotificationI): string | null {
  if ("unavailable" in n.entity && n.entity.unavailable) return null;
  if (n.entityType === "post") return `/postDetails/${n.entityId}`;
  if (n.entityType === "comment" && "post" in n.entity && n.entity.post) {
    return `/postDetails/${n.entity.post}`;
  }
  return null;
}

export default function Notifications() {
  usePageTitle("Notifications")
  const [activeTab, setActiveTab] = useState<Tab>("all");
  const [notifications, setNotifications] = useState<NotificationI[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  async function loadUnreadCount() {
    try {
      const { data } = await getNotifications({ unread: true, limit: 1 });
      setUnreadCount(data.meta.pagination.total);
    } catch (error) {
      console.error("Failed to load unread count:", error);
    }
  }

  async function loadNotifications(targetPage: number, tab: Tab) {
    try {
      if (targetPage === 1) setIsLoading(true);
      else setIsLoadingMore(true);

      const { data } = await getNotifications({
        unread: tab === "unread",
        page: targetPage,
        limit: 10,
      });

      setNotifications((prev) =>
        targetPage === 1
          ? data.data.notifications
          : [...prev, ...data.data.notifications],
      );
      setPage(data.meta.pagination.currentPage);
      setHasMore(Boolean(data.meta.pagination.nextPage));
    } catch (error) {
      console.error("Failed to load notifications:", error);
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }

  useEffect(() => {
    loadNotifications(1, activeTab);
    loadUnreadCount();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  async function handleMarkAsRead(notification: NotificationI) {
    if (notification.isRead) return;
    try {
      await markNotificationAsRead(notification._id);
      setNotifications((prev) =>
        prev.map((n) =>
          n._id === notification._id ? { ...n, isRead: true } : n,
        ),
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  }

  async function handleMarkAllAsRead() {
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm sm:rounded-2xl">
      <div className="border-b border-slate-200 p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-black text-slate-900 sm:text-2xl">
              Notifications
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Realtime updates for likes, comments, shares, and follows.
            </p>
          </div>
          <button
            type="button"
            onClick={handleMarkAllAsRead}
            disabled={unreadCount === 0}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            <CheckCheck size={15} />
            Mark all as read
          </button>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 sm:flex sm:items-center">
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className={`rounded-full px-4 py-1.5 text-sm font-bold transition ${
              activeTab === "all"
                ? "bg-[#1877f2] text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("unread")}
            className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-bold transition ${
              activeTab === "unread"
                ? "bg-[#1877f2] text-white"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            Unread
            <span className="rounded-full bg-white px-2 py-0.5 text-xs text-[#1877f2]">
              {unreadCount}
            </span>
          </button>
        </div>
      </div>

      <div className="space-y-2 p-3 sm:p-4">
        {isLoading ? (
          <div className="p-6 text-center text-sm font-semibold text-slate-500">
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-6 text-center text-sm font-semibold text-slate-500">
            {activeTab === "unread"
              ? "You're all caught up."
              : "You don't have any notifications yet."}
          </div>
        ) : (
          <>
            {notifications.map((n) => {
              const preview = notificationPreview(n);
              const link = notificationLink(n);
              const badge = notificationBadge(n.type);

              const article = (
                <article
                  className={`group relative flex gap-3 rounded-xl border p-3 transition sm:rounded-2xl sm:p-4 ${
                    n.isRead
                      ? "border-slate-200 bg-white"
                      : "border-[#dbeafe] bg-[#edf4ff]"
                  }`}
                >
                  <div className="relative shrink-0">
                    <span className="block">
                      <img
                        alt={n.actor.name}
                        className="h-11 w-11 rounded-full object-cover"
                        src={n.actor.photo || DEFAULT_AVATAR}
                      />
                    </span>
                    <span
                      className={`absolute -bottom-1 -right-1 inline-flex h-5 w-5 items-center justify-center rounded-full bg-white ring-2 ring-white ${badge.colorClass}`}
                    >
                      {badge.icon}
                    </span>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-1.5 sm:gap-2">
                      <p className="text-sm leading-6 text-slate-800">
                        <span className="font-extrabold">{n.actor.name}</span>{" "}
                        {notificationText(n)}
                      </p>
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <span className="text-xs font-semibold text-slate-500">
                          {timeAgo(n.createdAt)}
                        </span>
                        {!n.isRead && (
                          <Dot size={20} className="text-[#1877f2]" />
                        )}
                      </div>
                    </div>

                    {preview && (
                      <p className="mt-0.5 text-sm text-slate-600">{preview}</p>
                    )}

                    {!n.isRead && (
                      <div className="mt-2 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            handleMarkAsRead(n);
                          }}
                          className="inline-flex items-center gap-1.5 rounded-md bg-white px-2.5 py-1 text-xs font-bold text-[#1877f2] ring-1 ring-[#dbeafe] transition hover:bg-[#e7f3ff]"
                        >
                          <Check size={13} />
                          Mark as read
                        </button>
                      </div>
                    )}
                  </div>
                </article>
              );

              return link ? (
                <Link
                  key={n._id}
                  to={link}
                  onClick={() => handleMarkAsRead(n)}
                  className="block"
                >
                  {article}
                </Link>
              ) : (
                <div key={n._id}>{article}</div>
              );
            })}

            {hasMore && (
              <button
                type="button"
                onClick={() => loadNotifications(page + 1, activeTab)}
                disabled={isLoadingMore}
                className="w-full cursor-pointer rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoadingMore ? "Loading..." : "Load more"}
              </button>
            )}
          </>
        )}
      </div>
    </section>
  );
}
