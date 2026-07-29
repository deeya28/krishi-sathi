import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import {
  HomeIcon,
  UsersIcon,
  PostIcon,
  HeartIcon,
  BellIcon,
  SettingsIcon,
  LogoutIcon,
  ShoppingBagIcon,
  XIcon,
} from "../Icons";
import { useAuth } from "../../context/AuthContext";
import { useData } from "../../context/DataContext";

function useSidebarItems(t) {
  return [
    { to: "/dashboard", label: t("dashboard.home"), Icon: HomeIcon },
    { to: "/dashboard/profile", label: t("dashboard.myProfile"), Icon: UsersIcon },
    { to: "/dashboard/posts", label: t("dashboard.myPosts"), Icon: PostIcon },
    { to: "/marketplace", label: t("dashboard.marketplace"), Icon: ShoppingBagIcon },
    { to: "/expert", label: t("dashboard.expert"), Icon: UsersIcon },
    { to: "/dashboard/saved", label: t("dashboard.savedPosts"), Icon: HeartIcon },
    { to: "/dashboard/notifications", label: t("dashboard.notifications"), Icon: BellIcon },
    { to: "/dashboard/settings", label: t("dashboard.settings"), Icon: SettingsIcon },
  ];
}

function SidebarLinks({ onNavigate }) {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const { logout } = useAuth();
  const { unreadCount } = useData();
  const ITEMS = useSidebarItems(t);

  return (
    <>
      <nav className="flex-1 flex flex-col gap-1 px-3">
        {ITEMS.map((item) => {
          const active = pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={onNavigate}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
                active
                  ? "bg-paddy-green text-paper"
                  : "text-ink/80 hover:bg-soil/5"
              }`}
              style={{ fontFamily: "'Work Sans', sans-serif" }}
            >
              <item.Icon className="w-5 h-5 shrink-0" />
              {item.label}
              {item.to === "/dashboard/notifications" && unreadCount > 0 && (
                <span className="ml-auto text-[10px] font-bold bg-gold-grain text-soil-dark rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                  {unreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <button
        type="button"
        onClick={() => {
          logout();
          onNavigate?.();
        }}
        className="flex items-center gap-3 px-6 py-2.5 text-sm text-ink/60 hover:text-paddy-green transition-colors"
        style={{ fontFamily: "'Work Sans', sans-serif" }}
      >
        <LogoutIcon className="w-5 h-5" />
        {t("dashboard.logout")}
      </button>
    </>
  );
}

export default function Sidebar({ mobileOpen, onClose }) {
  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col w-56 shrink-0 border-r border-soil/10 bg-paper min-h-[calc(100vh-4rem)] py-6">
        <SidebarLinks />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="md:hidden fixed inset-0 bg-black/40 z-40"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="md:hidden fixed top-0 left-0 bottom-0 w-64 bg-paper z-50 flex flex-col py-6 shadow-xl"
            >
              <div className="flex items-center justify-between px-4 mb-4">
                <span
                  className="text-sm font-medium text-paddy-green"
                  style={{ fontFamily: "'Fraunces', serif" }}
                >
                  कृषि साथी
                </span>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close menu"
                  className="p-1.5 text-ink/70 hover:text-ink"
                >
                  <XIcon className="w-5 h-5" />
                </button>
              </div>
              <SidebarLinks onNavigate={onClose} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
