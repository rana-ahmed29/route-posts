import {
  Camera,
  Expand,
  Users,
  Mail,
  FileText,
  Bookmark,
  ThumbsUp,
  Repeat2,
  MessageCircle,
  Clock3,
  X,
} from "lucide-react";
import { useContext, useEffect, useRef, useState } from "react";
import { userContext } from "../../context/UserContext";
import { getUserPosts } from "../../services/posts.services";
import {
  uploadProfilePhoto,
  getBookmarks,
} from "../../services/profile.services";
import type { PostCardI } from "../../types/postCard";
import ProfileSkeleton from "./ProfileSkeleton";
import { Link } from "react-router";
import AdjustProfilePhotoModal from "./AdjustProfilePhotoModal";
import usePageTitle from "../../hooks/usePageTitle";

type ProfileTab = "myPosts" | "saved";

function formatPostTime(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export default function Profile() {
  usePageTitle("Rana Ahmed");

  const { userData, refetchUserData } = useContext(userContext);
  const [posts, setPosts] = useState<PostCardI[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  const [activeTab, setActiveTab] = useState<ProfileTab>("myPosts");
  const [savedPosts, setSavedPosts] = useState<PostCardI[]>([]);
  const [loadingSaved, setLoadingSaved] = useState(false);
  const [hasFetchedSaved, setHasFetchedSaved] = useState(false);

  const [selectedPhotoFile, setSelectedPhotoFile] = useState<File | null>(null);
  const [isPhotoLightboxOpen, setIsPhotoLightboxOpen] = useState(false);
  const photoInputRef = useRef<HTMLInputElement | null>(null);

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setSelectedPhotoFile(file);
  }

  async function handleSaveCroppedPhoto(croppedFile: File) {
    try {
      const formData = new FormData();
      formData.append("photo", croppedFile);
      await uploadProfilePhoto(formData);
      await refetchUserData();
      setSelectedPhotoFile(null);
    } catch (error) {
      console.error("Failed to upload profile photo:", error);
    } finally {
      if (photoInputRef.current) photoInputRef.current.value = "";
    }
  }

  useEffect(() => {
    if (!userData?._id) return;

    async function fetchPosts() {
      try {
        setLoadingPosts(true);
        const { data } = await getUserPosts(userData!._id);
        setPosts(data.data.posts);
      } catch (error) {
        console.error("Failed to fetch posts:", error);
      } finally {
        setLoadingPosts(false);
      }
    }

    fetchPosts();
  }, [userData?._id]);

  async function handleSelectTab(tab: ProfileTab) {
    setActiveTab(tab);

    if (tab === "saved" && !hasFetchedSaved) {
      try {
        setLoadingSaved(true);
        const { data } = await getBookmarks();

        setSavedPosts(data.data.bookmarks ?? data.data.posts ?? []);
      } catch (error) {
        console.error("Failed to fetch bookmarks:", error);
      } finally {
        setLoadingSaved(false);
        setHasFetchedSaved(true);
      }
    }
  }

  if (!userData) {
    return <ProfileSkeleton />;
  }

  const visiblePosts = activeTab === "myPosts" ? posts : savedPosts;
  const isLoadingVisible =
    activeTab === "myPosts" ? loadingPosts : loadingSaved;
  const emptyMessage =
    activeTab === "myPosts" ? "No posts yet." : "No saved posts yet.";

  return (
    <div className="space-y-5 sm:space-y-6">
      {/* header card */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_2px_10px_rgba(15,23,42,.06)] sm:rounded-[28px]">
        {/* cover */}
        <div className="group/cover relative h-44 bg-[linear-gradient(112deg,#0f172a_0%,#1e3a5f_36%,#2b5178_72%,#5f8fb8_100%)] sm:h-52 lg:h-60">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_24%,rgba(255,255,255,.14)_0%,rgba(255,255,255,0)_36%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_86%_12%,rgba(186,230,253,.22)_0%,rgba(186,230,253,0)_44%)]" />
          <div className="absolute -left-16 top-10 h-36 w-36 rounded-full bg-white/8 blur-3xl" />
          <div className="absolute right-8 top-6 h-48 w-48 rounded-full bg-[#c7e6ff]/10 blur-3xl" />
          <div className="absolute inset-x-0 bottom-0 h-20 bg-linear-to-t from-black/25 to-transparent" />

          <div className="pointer-events-none absolute right-2 top-2 z-10 flex max-w-[90%] flex-wrap items-center justify-end gap-1.5 opacity-100 transition duration-200 sm:right-3 sm:top-3 sm:max-w-none sm:gap-2 sm:opacity-0 sm:group-hover/cover:opacity-100 sm:group-focus-within/cover:opacity-100">
            <label className="pointer-events-auto inline-flex cursor-pointer items-center gap-1 rounded-lg bg-black/45 px-2 py-1 text-[11px] font-bold text-white backdrop-blur transition hover:bg-black/60 sm:gap-1.5 sm:px-3 sm:py-1.5 sm:text-xs">
              <Camera size={13} />
              Add cover
              <input accept="image/*" className="hidden" type="file" />
            </label>
          </div>
        </div>

        <div className="relative -mt-12 px-3 pb-5 sm:-mt-16 sm:px-8 sm:pb-6">
          <div className="rounded-3xl border border-white/60 bg-white/92 p-5 backdrop-blur-xl sm:p-7">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="min-w-0">
                <div className="flex items-end gap-4">
                  <div className="group/avatar relative shrink-0">
                    <button
                      type="button"
                      onClick={() => setIsPhotoLightboxOpen(true)}
                      className="cursor-zoom-in rounded-full"
                    >
                      <img
                        alt={userData.name}
                        className="h-28 w-28 rounded-full border-4 border-white object-cover shadow-md ring-2 ring-[#dbeafe]"
                        src={
                          userData.photo ||
                          "https://pub-3cba56bacf9f4965bbb0989e07dada12.r2.dev/linkedPosts/default-profile.png"
                        }
                      />
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsPhotoLightboxOpen(true)}
                      className="absolute bottom-1 left-1 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white text-[#1877f2] opacity-100 shadow-sm ring-1 ring-slate-200 transition duration-200 hover:bg-slate-50 sm:opacity-0 sm:group-hover/avatar:opacity-100 sm:group-focus-within/avatar:opacity-100"
                      title="View profile photo"
                      aria-label="View profile photo"
                    >
                      <Expand size={16} />
                    </button>
                    <label className="absolute bottom-1 right-1 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-[#1877f2] text-white opacity-100 shadow-sm transition duration-200 hover:bg-[#166fe5] sm:opacity-0 sm:group-hover/avatar:opacity-100 sm:group-focus-within/avatar:opacity-100">
                      <Camera size={17} />
                      <input
                        ref={photoInputRef}
                        onChange={handlePhotoChange}
                        accept="image/*"
                        className="hidden"
                        type="file"
                      />
                    </label>
                  </div>

                  <div className="min-w-0 pb-1">
                    <h2 className="truncate text-2xl font-black tracking-tight text-slate-900 sm:text-4xl">
                      {userData.name}
                    </h2>
                    <p className="mt-1 text-lg font-semibold text-slate-500 sm:text-xl">
                      @{userData.username}
                    </p>
                    <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-[#d7e7ff] bg-[#eef6ff] px-3 py-1 text-xs font-bold text-[#0b57d0]">
                      <Users size={13} />
                      Route Posts member
                    </div>
                  </div>
                </div>
              </div>

              {/* stat row */}
              <div className="grid w-full grid-cols-3 gap-2 lg:w-[520px]">
                <div className="rounded-2xl border border-slate-200 bg-white px-3 py-3 text-center sm:px-4 sm:py-4">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500 sm:text-xs">
                    Followers
                  </p>
                  <p className="mt-1 text-2xl font-black text-slate-900 sm:text-3xl">
                    {userData.followersCount}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white px-3 py-3 text-center sm:px-4 sm:py-4">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500 sm:text-xs">
                    Following
                  </p>
                  <p className="mt-1 text-2xl font-black text-slate-900 sm:text-3xl">
                    {userData.followingCount}
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white px-3 py-3 text-center sm:px-4 sm:py-4">
                  <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500 sm:text-xs">
                    Bookmarks
                  </p>
                  <p className="mt-1 text-2xl font-black text-slate-900 sm:text-3xl">
                    {userData.bookmarksCount}
                  </p>
                </div>
              </div>
            </div>

            {/* about + posts summary */}
            <div className="mt-5 grid gap-4 lg:grid-cols-[1.3fr_.7fr]">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <h3 className="text-sm font-extrabold text-slate-800">About</h3>
                <div className="mt-3 space-y-2 text-sm text-slate-600">
                  <p className="flex items-center gap-2">
                    <Mail size={15} className="text-slate-500" />
                    {userData.email}
                  </p>
                  <p className="flex items-center gap-2">
                    <Users size={15} className="text-slate-500" />
                    Active on Route Posts
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                <div className="rounded-2xl border border-[#dbeafe] bg-[#f6faff] px-4 py-3">
                  <p className="text-xs font-bold uppercase tracking-wide text-[#1f4f96]">
                    My posts
                  </p>
                  <p className="mt-1 text-2xl font-black text-slate-900">
                    {posts.length}
                  </p>
                </div>
                <div className="rounded-2xl border border-[#dbeafe] bg-[#f6faff] px-4 py-3">
                  <p className="text-xs font-bold uppercase tracking-wide text-[#1f4f96]">
                    Saved posts
                  </p>
                  <p className="mt-1 text-2xl font-black text-slate-900">
                    {userData.bookmarksCount}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* tabs + posts list */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="grid w-full grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1.5 sm:inline-flex sm:w-auto sm:gap-0">
            <button
              type="button"
              onClick={() => handleSelectTab("myPosts")}
              className={`cursor-pointer inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition ${
                activeTab === "myPosts"
                  ? "bg-white text-[#1877f2] shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <FileText size={15} />
              My Posts
            </button>
            <button
              type="button"
              onClick={() => handleSelectTab("saved")}
              className={`cursor-pointer inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition ${
                activeTab === "saved"
                  ? "bg-white text-[#1877f2] shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Bookmark size={15} />
              Saved
            </button>
          </div>
          <span className="rounded-full bg-[#e7f3ff] px-3 py-1 text-xs font-bold text-[#1877f2]">
            {visiblePosts.length}
          </span>
        </div>

        {isLoadingVisible ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm font-semibold text-slate-500 shadow-sm">
            Loading posts...
          </div>
        ) : visiblePosts.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm font-semibold text-slate-500 shadow-sm">
            {emptyMessage}
          </div>
        ) : (
          <div className="space-y-3">
            {visiblePosts.map((post) => (
              <article
                key={post._id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_1px_6px_rgba(15,23,42,.05)] transition hover:shadow-sm"
              >
                <div className="p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <img
                        alt={post.user?.name}
                        className="h-10 w-10 rounded-full object-cover"
                        src="https://pub-3cba56bacf9f4965bbb0989e07dada12.r2.dev/linkedPosts/default-profile.png"
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-extrabold text-slate-900">
                          {post.user?.name}
                        </p>
                        <p className="truncate text-xs font-semibold text-slate-500">
                          @{post.user?.username}
                        </p>
                      </div>
                    </div>
                    <Link
                      to={`/postDetails/${post._id}`}
                      className="cursor-pointer rounded-md px-2 py-1 text-xs font-bold text-[#1877f2] transition hover:bg-[#e7f3ff]"
                    >
                      View details
                    </Link>
                  </div>
                  <div className="pt-3">
                    <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-slate-800">
                      {post.body}
                    </p>
                  </div>
                </div>

                {post.image && (
                  <div className="border-y border-slate-200 bg-slate-950/95">
                    <button
                      type="button"
                      className="group relative flex w-full cursor-zoom-in items-center justify-center"
                    >
                      <img
                        alt="post"
                        className="max-h-140 w-auto max-w-full object-contain"
                        src={post.image}
                      />
                      <span className="pointer-events-none absolute inset-0 bg-black/0 transition group-hover:bg-black/10" />
                    </button>
                  </div>
                )}

                <div className="flex flex-col gap-2 border-t border-slate-200 px-4 py-3 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                  <div className="flex flex-wrap items-center gap-3 sm:gap-5">
                    <span className="inline-flex items-center gap-2 font-semibold">
                      <ThumbsUp size={14} className="text-[#1877f2]" />
                      {post.likesCount} likes
                    </span>
                    <span className="inline-flex items-center gap-2 font-semibold">
                      <Repeat2 size={14} className="text-[#1877f2]" />
                      {post.sharesCount} shares
                    </span>
                    <span className="inline-flex items-center gap-2 font-semibold">
                      <MessageCircle size={14} className="text-[#1877f2]" />
                      {post.commentsCount} comments
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500">
                    <Clock3 size={13} />
                    {formatPostTime(post.createdAt)}
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {selectedPhotoFile && (
        <AdjustProfilePhotoModal
          file={selectedPhotoFile}
          onCancel={() => {
            setSelectedPhotoFile(null);
            if (photoInputRef.current) photoInputRef.current.value = "";
          }}
          onSave={handleSaveCroppedPhoto}
        />
      )}

      {isPhotoLightboxOpen && (
        <div
          className="fixed inset-0 z-90 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setIsPhotoLightboxOpen(false)}
        >
          <button
            type="button"
            onClick={() => setIsPhotoLightboxOpen(false)}
            className="absolute right-4 top-4 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white/90 text-slate-700 shadow-sm hover:bg-white"
          >
            <X size={20} />
          </button>

          <img
            src={
              userData.photo ||
              "https://pub-3cba56bacf9f4965bbb0989e07dada12.r2.dev/linkedPosts/default-profile.png"
            }
            alt={userData.name}
            className="max-h-[85vh] max-w-[85vw] rounded-xl object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
