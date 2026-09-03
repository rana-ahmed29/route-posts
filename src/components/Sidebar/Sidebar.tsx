import { useNavigate, useLocation } from "react-router";
import { Newspaper, Sparkles, Earth, Bookmark } from "lucide-react";
import type { LucideIcon } from "lucide-react";

// each item = one row in the sidebar
// path = the actual route it should navigate to
type NavItem = {
  label: string;
  icon: LucideIcon;
  path: string;
};

const items: NavItem[] = [
  { label: "Feed", icon: Newspaper, path: "/feed" },
  { label: "My Posts", icon: Sparkles, path: "/my-posts" },
  { label: "Community", icon: Earth, path: "/community" },
  { label: "Saved", icon: Bookmark, path: "/saved" },
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <>
      {/* mobile & tablet (below xl): 2-column grid of buttons */}
      <nav aria-label="Main sidebar navigation" className="xl:hidden">
        <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
          <ul className="grid grid-cols-2 gap-2">
            {items.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;

              return (
                <li key={item.label}>
                  <button
                    type="button"
                    onClick={() => navigate(item.path)}
                    aria-current={isActive ? "page" : undefined}
                    className={`flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-bold transition ${
                      isActive
                        ? "bg-[#e7f3ff] text-[#1877f2]"
                        : "bg-slate-50 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <Icon size={16} aria-hidden="true" />
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* large screens (xl+): sticky vertical list, hidden below xl */}
      <aside className="hidden h-fit space-y-3 xl:sticky xl:top-[84px] xl:block">
        <nav aria-label="Main sidebar navigation">
          <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
            <ul className="space-y-1">
              {items.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;

                return (
                  <li key={item.label}>
                    <button
                      type="button"
                      onClick={() => navigate(item.path)}
                      aria-current={isActive ? "page" : undefined}
                      className={`flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-left text-sm font-bold transition ${
                        isActive
                          ? "bg-[#e7f3ff] text-[#1877f2]"
                          : "text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <Icon size={17} aria-hidden="true" />
                      {item.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>
      </aside>
    </>
  );
}
