import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SearchIcon, BellIcon, ChevronDownIcon, MenuIcon, SunIcon, MoonIcon } from "../Icons";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import { useTheme } from "../../context/ThemeContext";
import { apiFetch } from "../../utils/api";

export default function Topbar({ onMenuClick }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const { unreadCount } = useData();
  const { isDark, toggleTheme } = useTheme();
  const [profileOpen, setProfileOpen] = useState(false);

  // --- SEARCH STATE ---
  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null); // { users: [], posts: [] } or null when closed
  const [searching, setSearching] = useState(false);
  const searchContainerRef = useRef(null);
  const debounceRef = useRef(null);

  const initial = currentUser?.name?.trim()?.[0]?.toUpperCase() || "K";

  const handleLogout = () => {
    setProfileOpen(false);
    logout();
    navigate("/login");
  };

  // --- SEARCH: debounce the API call while typing ---
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!value.trim()) {
      setResults(null);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      try {
        setSearching(true);
        const data = await apiFetch(`/search?q=${encodeURIComponent(value.trim())}`);
        setResults(data);
      } catch (err) {
        console.error("Search failed:", err.message);
        setResults({ users: [], posts: [] });
      } finally {
        setSearching(false);
      }
    }, 350); // wait 350ms after the user stops typing before searching
  };

  const closeSearch = () => {
    setResults(null);
    setQuery("");
  };

  // Close the search dropdown when clicking outside it
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setResults(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const showDropdown = results !== null;

  return (
    <header className="sticky top-0 z-40 bg-paper border-b border-soil/10">
      <div className="h-16 px-4 sm:px-6 flex items-center justify-between gap-4 sm:gap-6">
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Open menu"
            className="md:hidden p-1.5 -ml-1.5 text-ink/70 hover:text-ink"
          >
            <MenuIcon className="w-5 h-5" />
          </button>
          <Link
            to="/"
            className="text-sm font-medium text-paddy-green"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            कृषि साथी
          </Link>
        </div>

        <div ref={searchContainerRef} className="hidden sm:block relative flex-1 max-w-md">
          <div className="flex items-center bg-white/70 border border-soil/15 rounded-full px-4 py-2 gap-2">
            <SearchIcon className="w-4 h-4 text-ink/50 shrink-0" />
            <input
              type="text"
              value={query}
              onChange={handleSearchChange}
              placeholder={t("dashboard.searchPlaceholder")}
              className="bg-transparent w-full text-sm text-ink placeholder:text-ink/45 focus:outline-none"
              style={{ fontFamily: "'Work Sans', sans-serif" }}
            />
            {query && (
              <button
                type="button"
                onClick={closeSearch}
                className="text-ink/40 hover:text-ink/70 text-xs shrink-0"
              >
                ✕
              </button>
            )}
          </div>

          {/* SEARCH RESULTS DROPDOWN */}
          {showDropdown && (
            <div className="absolute top-full mt-2 left-0 right-0 bg-paper border border-soil/15 rounded-md shadow-lg max-h-96 overflow-y-auto z-50">
              {searching && (
                <p className="text-xs text-ink/50 text-center py-4">Searching...</p>
              )}

              {!searching && results.userCount === 0 && results.postCount === 0 && (
                <p className="text-xs text-ink/50 text-center py-4">
                  No results for &ldquo;{query}&rdquo;
                </p>
              )}

              {!searching && results.users?.length > 0 && (
                <div className="py-2">
                  <p className="px-4 text-[10px] uppercase tracking-wide text-ink/40 font-bold mb-1">
                    People
                  </p>
                  {results.users.map((u) => (
                    <button
                      key={u._id}
                      type="button"
                      onClick={() => {
                        closeSearch();
                        navigate(`/dashboard?author=${u._id}&authorName=${encodeURIComponent(u.name)}`);
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-soil/5 text-left"
                    >
                      <span className="w-8 h-8 rounded-full bg-paddy-green/15 text-paddy-green flex items-center justify-center text-xs font-bold shrink-0">
                        {u.name?.charAt(0)?.toUpperCase() || "?"}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm text-ink font-medium truncate">{u.name}</p>
                        <p className="text-xs text-ink/50 truncate">{u.email}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {!searching && results.posts?.length > 0 && (
                <div className="py-2 border-t border-soil/10">
                  <p className="px-4 text-[10px] uppercase tracking-wide text-ink/40 font-bold mb-1">
                    Posts
                  </p>
                  {results.posts.map((p) => (
                    <button
                      key={p._id}
                      type="button"
                      onClick={() => {
                        closeSearch();
                        navigate("/dashboard", { state: { scrollToPostId: p._id } });
                      }}
                      className="w-full px-4 py-2 hover:bg-soil/5 text-left"
                    >
                      <p className="text-sm text-ink font-medium">{p.cropName}</p>
                      <p className="text-xs text-ink/60 truncate">{p.description}</p>
                      <p className="text-[10px] text-ink/40 mt-0.5">
                        by {p.farmer?.name || "Unknown"}
                      </p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 sm:gap-5 shrink-0">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            className="text-ink/70 hover:text-paddy-green transition-colors"
          >
            {isDark ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
          </button>

          <Link
            to="/dashboard/notifications"
            aria-label={t("dashboard.notifications")}
            className="relative text-ink/70 hover:text-paddy-green transition-colors"
          >
            <BellIcon className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-gold-grain" />
            )}
          </Link>

          <div className="relative">
            <button
              type="button"
              onClick={() => setProfileOpen((v) => !v)}
              className="flex items-center gap-1.5 text-sm text-ink hover:text-paddy-green transition-colors"
              style={{ fontFamily: "'Work Sans', sans-serif" }}
            >
              <span className="w-7 h-7 rounded-full bg-paddy-green text-paper flex items-center justify-center text-xs">
                {initial}
              </span>
              <ChevronDownIcon className="w-4 h-4 hidden sm:block" />
            </button>

            {profileOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-paper border border-soil/15 rounded-md shadow-lg py-2">
                <Link
                  to="/dashboard/profile"
                  onClick={() => setProfileOpen(false)}
                  className="block px-4 py-2 text-sm text-ink hover:bg-soil/5"
                  style={{ fontFamily: "'Work Sans', sans-serif" }}
                >
                  {t("dashboard.myProfile")}
                </Link>
                <Link
                  to="/dashboard/settings"
                  onClick={() => setProfileOpen(false)}
                  className="block px-4 py-2 text-sm text-ink hover:bg-soil/5"
                  style={{ fontFamily: "'Work Sans', sans-serif" }}
                >
                  {t("dashboard.settings")}
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-2 text-sm text-ink hover:bg-soil/5"
                  style={{ fontFamily: "'Work Sans', sans-serif" }}
                >
                  {t("dashboard.logout")}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}