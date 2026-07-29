import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { SearchIcon, BellIcon, ChevronDownIcon, MenuIcon, SunIcon, MoonIcon } from "../Icons";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";
import { useTheme } from "../../context/ThemeContext";

export default function Topbar({ onMenuClick }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentUser, logout } = useAuth();
  const { unreadCount } = useData();
  const { isDark, toggleTheme } = useTheme();
  const [profileOpen, setProfileOpen] = useState(false);

  const initial = currentUser?.name?.trim()?.[0]?.toUpperCase() || "K";

  const handleLogout = () => {
    setProfileOpen(false);
    logout();
    navigate("/login");
  };

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

        <div className="hidden sm:flex items-center flex-1 max-w-md bg-white/70 border border-soil/15 rounded-full px-4 py-2 gap-2">
          <SearchIcon className="w-4 h-4 text-ink/50 shrink-0" />
          <input
            type="text"
            placeholder={t("dashboard.searchPlaceholder")}
            className="bg-transparent w-full text-sm text-ink placeholder:text-ink/45 focus:outline-none"
            style={{ fontFamily: "'Work Sans', sans-serif" }}
          />
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
