import { useState } from "react";
import { Users, Search, UserPlus } from "lucide-react";

// mock data for now — later this probably comes from an API call
// (e.g. GET /friends/suggested). avatar falls back to a generated
// placeholder when the person has no profile photo.
const DEFAULT_AVATAR =
  "https://ui-avatars.com/api/?background=random&name=";

const friends = [
  { name: "MrMo", handle: "mrmo", avatar: null, followers: 145, mutual: 1 },
  {
    name: "Ahmed Abd Al-Muti",
    handle: "ahmedmutti",
    avatar: null,
    followers: 261,
    mutual: 0,
  },
  { name: "menna", handle: "gbngssssb", avatar: null, followers: 120, mutual: 0 },
  {
    name: "abdalla diaa",
    handle: "abdalla_diaa",
    avatar: null,
    followers: 114,
    mutual: 0,
  },
  { name: "Jade", handle: "jade", avatar: null, followers: 90, mutual: 0 },
];

// one friend row — shared between the mobile and desktop versions
// so there's only one place to update the card design
function FriendCard({ friend }: { friend: (typeof friends)[number] }) {
  return (
    <div className="rounded-xl border border-slate-200 p-2.5">
      <div className="flex items-center justify-between gap-2">
        {/* name + avatar are their own button so they can later
            navigate to /profile/:handle without triggering Follow */}
        <button
          type="button"
          className="flex min-w-0 cursor-pointer items-center gap-2 rounded-lg px-1 py-1 text-left transition hover:bg-slate-50"
        >
          <img
            alt={friend.name}
            className="h-10 w-10 rounded-full object-cover"
            src={friend.avatar ?? `${DEFAULT_AVATAR}${friend.name}`}
          />
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-slate-900 hover:underline">
              {friend.name}
            </p>
            <p className="truncate text-xs text-slate-500">
              @{friend.handle}
            </p>
          </div>
        </button>

        <button className="inline-flex cursor-pointer items-center gap-1 rounded-full bg-[#e7f3ff] px-3 py-1.5 text-xs font-bold text-[#1877f2] transition hover:bg-[#d8ebff] disabled:opacity-60">
          <UserPlus size={13} />
          Follow
        </button>
      </div>

      {/* followers + mutual — shown on the reference site's desktop card */}
      <div className="mt-2 flex items-center gap-2 pl-1  text-[11px] font-semibold text-slate-500">
        <span className="rounded-full bg-slate-100 px-2 py-0.5  ">
          {friend.followers} followers
        </span>
        {friend.mutual > 0 && (
          <span className="rounded-full rounded-full bg-[#edf4ff] px-2 py-0.5 text-[#1877f2]">
            {friend.mutual} mutual
          </span>
        )}
      </div>
    </div>
  );
}

// the actual header + search + list + "view more" panel.
// used as-is on desktop, and shown/hidden on mobile depending on toggle state.
function SuggestedFriendsPanel() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Users size={18} className="text-[#1877f2]" />
          <h3 className="text-base font-extrabold text-slate-900">
            Suggested Friends
          </h3>
        </div>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">
          {friends.length}
        </span>
      </div>

      <div className="mb-3">
        <label className="relative block">
          <Search
            size={15}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            placeholder="Search friends..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-700 outline-none focus:border-[#1877f2] focus:bg-white"
          />
        </label>
      </div>

      <div className="space-y-3">
        {friends.map((friend) => (
          <FriendCard key={friend.handle} friend={friend} />
        ))}
      </div>

      <button className="mt-3 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-100">
        View more
      </button>
    </div>
  );
}

export default function SuggestionsSidebar() {
  // only matters on mobile/tablet — desktop always shows the panel
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* mobile & tablet: collapsed behind a toggle */}
      <div className="space-y-3 xl:hidden">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="inline-flex w-full cursor-pointer items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left shadow-sm"
        >
          <span className="inline-flex items-center gap-2 text-sm font-extrabold text-slate-900">
            <Users size={17} className="text-[#1877f2]" />
            Suggested Friends
          </span>
          <span className="inline-flex items-center gap-2">
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">
              {friends.length}
            </span>
            <span className="text-xs font-bold text-[#1877f2]">
              {isOpen ? "Hide" : "Show"}
            </span>
          </span>
        </button>

        {isOpen && <SuggestedFriendsPanel />}
      </div>

      {/* large screens (xl+): always visible, sticky in the right column */}
      <div className="hidden h-fit xl:sticky xl:top-[84px] xl:block">
        <SuggestedFriendsPanel />
      </div>
    </>
  );
}