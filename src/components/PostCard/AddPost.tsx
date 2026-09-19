import { useContext, useEffect, useRef, useState } from "react";
import {
  Earth,
  Users,
  Lock,
  ChevronDown,
  Image as ImageIcon,
  Smile,
  Send,
  X,
} from "lucide-react";
import EmojiPicker, { type EmojiClickData } from "emoji-picker-react";
import { createPost } from "../../services/posts.services";
import { userContext } from "../../context/UserContext";
import AddPostHeaderSkeleton from "./AddPostHeaderSkeleton";

type Privacy = "public" | "following" | "only_me";

const PRIVACY_OPTIONS: { value: Privacy; label: string; icon: typeof Earth }[] =
  [
    { value: "public", label: "Public", icon: Earth },
    { value: "following", label: "Followers", icon: Users },
    { value: "only_me", label: "Only me", icon: Lock },
  ];

type PendingPost = {
  tempId: string;
  body: string;
  imageUrl?: string;
  progress: number;
};

type Props = {
  refatchPosts: () => void;
  onPendingPost?: (pending: PendingPost | null) => void;
  onPostCreated?: (post: any) => void;
};

export default function AddPost({
  refatchPosts,
  onPendingPost,
  onPostCreated,
}: Props) {
  const [userPostContent, setUserPostContant] = useState<string>("");
  const [userPostImg, setUserPostImg] = useState<File | null>(null);
  const imgInput = useRef<HTMLInputElement | null>(null);
  const [isSending, setIsSending] = useState<boolean>(false);

  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [privacy, setPrivacy] = useState<Privacy>("public");
  const privacyRef = useRef<HTMLSpanElement | null>(null);

  const [isEmojiOpen, setIsEmojiOpen] = useState(false);
  const emojiRef = useRef<HTMLDivElement | null>(null);

  const selected = PRIVACY_OPTIONS.find((o) => o.value === privacy)!;
  const SelectedIcon = selected.icon;

  const { userData } = useContext(userContext);

  function chooseFile() {
    imgInput.current?.click();
  }

  function getImgUrl() {
    const file = imgInput.current?.files?.[0];
    if (file) setUserPostImg(file);
  }

  function handleEmojiClick(emojiData: EmojiClickData) {
    setUserPostContant((prev) => (prev ?? "") + emojiData.emoji);
  }

  async function addPost() {
    if (!userPostContent.trim() && !userPostImg) return;

    const tempId = `temp-${Date.now()}`;
    const body = userPostContent.trim() || "  ";
    const imageUrl = userPostImg ? URL.createObjectURL(userPostImg) : undefined;

    // Show the "Publishing... 0%" card immediately, before the request even starts
    onPendingPost?.({ tempId, body, imageUrl, progress: 0 });

    setIsSending(true);
    try {
      const formData = new FormData();
      formData.append("body", body);
      if (userPostImg) {
        formData.append("image", userPostImg);
      }

      const response = await createPost(formData);
      const newPost = response.data.data.post;
      onPostCreated?.(newPost);

      onPostCreated?.(newPost);
      onPendingPost?.(null);
      refatchPosts?.();

      setUserPostContant("");
      setUserPostImg(null);
    } catch (error) {
      console.error("Failed to add post:", error);
      onPendingPost?.(null);
    } finally {
      setIsSending(false);
    }
  }

  // close the privacy and emoji dropdowns when clicking anywhere outside them
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (privacyRef.current && !privacyRef.current.contains(target)) {
        setIsPrivacyOpen(false);
      }
      if (emojiRef.current && !emojiRef.current.contains(target)) {
        setIsEmojiOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      {/* header: avatar, name, privacy dropdown */}
      {!userData ? (
        <AddPostHeaderSkeleton />
      ) : (
        <div className="mb-3 flex items-start gap-3">
          <img
            src={userData.photo}
            alt={userData.name}
            className="h-11 w-11 rounded-full object-cover"
          />

          <div className="flex-1">
            <p className="text-base font-extrabold text-slate-900">
              {userData.name}
            </p>

            <span
              ref={privacyRef}
              className="relative mt-1 inline-flex items-center gap-2 rounded-full bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700"
            >
              <button
                type="button"
                onClick={() => setIsPrivacyOpen((prev) => !prev)}
                className="inline-flex cursor-pointer items-center gap-2 text-xs hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <SelectedIcon size={11} />
                {selected.label}
                <ChevronDown size={12} />
              </button>

              {isPrivacyOpen && (
                <div className="absolute left-0 top-[calc(100%+6px)] z-30 w-40 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
                  {PRIVACY_OPTIONS.map((option) => {
                    const Icon = option.icon;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => {
                          setPrivacy(option.value);
                          setIsPrivacyOpen(false);
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        <Icon size={13} />
                        {option.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </span>
          </div>
        </div>
      )}

      {/* text area */}
      <div className="relative">
        <textarea
          value={userPostContent}
          onChange={(e) => {
            setUserPostContant(e.target.value);
          }}
          placeholder="What's on your mind, Rana?"
          rows={4}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-[17px] leading-relaxed text-slate-800 outline-none transition focus:border-[#1877f2] focus:bg-white"
        />

        {/* image preview */}
        {userPostImg && (
          <div className="relative mt-2">
            <img
              alt="Comment preview"
              className="max-h-52 w-full rounded-lg object-contain"
              src={URL.createObjectURL(userPostImg)}
            />
            <button
              type="button"
              onClick={() => setUserPostImg(null)}
              className="absolute cursor-pointer right-2 top-2 rounded-full bg-black/60 p-1 text-white"
            >
              <X size={14} />
            </button>
          </div>
        )}
      </div>

      {/* footer: photo/video, emoji, post button */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
        <div className="relative flex items-center gap-2">
          <button
            onChange={getImgUrl}
            onClick={chooseFile}
            className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
          >
            <ImageIcon size={18} className="text-emerald-600" />
            <span className="hidden sm:inline">Photo/video</span>
            <input
              accept="image/*"
              className="hidden"
              type="file"
              ref={imgInput}
            ></input>
          </button>

          <div className="relative" ref={emojiRef}>
            <button
              type="button"
              onClick={() => setIsEmojiOpen((prev) => !prev)}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 cursor-pointer"
            >
              <Smile size={18} className="text-amber-500" />
              <span className="hidden sm:inline">Feeling/activity</span>
            </button>

            {isEmojiOpen && (
              <div className="absolute top-[calc(100%+6px)] left-0 z-30">
                <EmojiPicker onEmojiClick={handleEmojiClick} />
              </div>
            )}
          </div>
        </div>

        <button
          onClick={addPost}
          type="button"
          disabled={isSending}
          className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-[#1877f2] px-4 py-1.5 text-sm font-bold text-white hover:bg-[#1461c9] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSending ? (
            <span className="flex items-center justify-center gap-1">
              Posting....
              <Send size={14} />
            </span>
          ) : (
            <>
              Post
              <Send size={14} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
