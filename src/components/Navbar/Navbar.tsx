import { useState, useRef, useEffect, useContext } from "react";
import { Link, useLocation } from "react-router";
import {
  House,
  User,
  MessageCircle,
  Menu,
  Settings,
  LogOut,
} from "lucide-react";
import routePNG from "../../assets/hero.png";
import { authContext } from "../context/AuthContext";

export default function Navbar() {
  const { setToken } = useContext(authContext)!;

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();

  function logoutUser() {
    localStorage.removeItem("userToken");
    setToken(null);
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navLinks = [
    { to: "/feed", label: "Feed", icon: House },
    { to: "/profile", label: "Profile", icon: User },
    { to: "/notifications", label: "Notifications", icon: MessageCircle },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/90 bg-white/95 backdrop-blur">
      {/* matches MainLayout's max-w-[1400px] so the navbar content
          lines up exactly with the page content below it */}
      <div className="mx-auto flex max-w-350 items-center justify-between gap-2 px-2 py-2 sm:gap-3 sm:px-3">
        <Link to="/feed" className="flex items-center gap-3">
          <img
            alt="Route Posts"
            className="h-9 w-9 rounded-xl object-cover"
            src={routePNG}
          />
          <p className="hidden text-xl font-extrabold text-slate-900 sm:block">
            Route Posts
          </p>
        </Link>

        <nav
          aria-label="Main navigation"
          className="flex min-w-0 items-center gap-1 overflow-x-auto rounded-2xl border border-slate-200 bg-slate-50/90 px-1 py-1 sm:px-1.5"
        >
          {navLinks.map(({ to, label, icon: Icon }) => {
            const isActive = pathname === to;
            return (
              <Link
                key={to}
                to={to}
                aria-current={isActive ? "page" : undefined}
                className={`relative flex items-center gap-1.5 rounded-xl px-2.5 py-2 text-sm font-extrabold transition sm:gap-2 sm:px-3.5 ${
                  isActive
                    ? "bg-white text-[#1f6fe5]"
                    : "text-slate-600 hover:bg-white/90 hover:text-slate-900"
                }`}
              >
                <span className="relative">
                  <Icon size={20} />
                </span>
                <span className="hidden sm:inline">{label}</span>
                <span className="sr-only sm:hidden">{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            aria-label="Open user menu"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="flex cursor-pointer items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-2 py-1.5 transition hover:bg-slate-100"
          >
            <img
              alt="Rana Ahmed"
              className="h-8 w-8 rounded-full object-cover"
              src="https://pub-3cba56bacf9f4965bbb0989e07dada12.r2.dev/linkedPosts/default-profile.png"
            />
            <span className="hidden max-w-35 truncate text-sm font-semibold text-slate-800 md:block">
              Rana Ahmed
            </span>
            <Menu size={15} className="text-slate-500" />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg">
              <Link
                to="/profile"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                <User size={16} />
                Profile
              </Link>
              <Link
                to="/settings"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                <Settings size={16} />
                Settings
              </Link>
              <button
                type="button"
                onClick={logoutUser}
                className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
