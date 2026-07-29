import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { SunIcon, MoonIcon, GlobeIcon } from "../components/Icons";

function SettingsRow({ icon: Icon, title, description, children }) {
  return (
    <div className="flex items-center justify-between gap-4 py-4 border-b border-soil/10 last:border-b-0">
      <div className="flex items-start gap-3 min-w-0">
        {Icon && <Icon className="w-5 h-5 text-paddy-green shrink-0 mt-0.5" />}
        <div className="min-w-0">
          <p className="text-sm font-medium text-ink">{title}</p>
          {description && <p className="text-xs text-ink/55 mt-0.5">{description}</p>}
        </div>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function Toggle({ checked, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={`w-11 h-6 rounded-full transition-colors relative ${
        checked ? "bg-paddy-green" : "bg-soil/25"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

export default function Settings() {
  const { i18n } = useTranslation();
  const { isDark, toggleTheme } = useTheme();
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const isNepali = i18n.language === "ne";
  const toggleLanguage = () => i18n.changeLanguage(isNepali ? "en" : "ne");

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <DashboardLayout>
      <h1
        className="text-ink text-2xl mb-6"
        style={{ fontFamily: "'Fraunces', serif" }}
      >
        Settings
      </h1>

      <div className="bg-white/60 border border-soil/10 rounded-md px-5 mb-6">
        <p className="text-xs uppercase tracking-wide text-ink/70 pt-4" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          Appearance & Language
        </p>
        <SettingsRow
          icon={isDark ? SunIcon : MoonIcon}
          title="Dark mode"
          description="Switch between light and dark themes across the app."
        >
          <Toggle checked={isDark} onChange={toggleTheme} label="Toggle dark mode" />
        </SettingsRow>
        <SettingsRow
          icon={GlobeIcon}
          title="Language"
          description="Choose English or Nepali (नेपाली) for the interface."
        >
          <button
            type="button"
            onClick={toggleLanguage}
            className="text-sm font-medium px-4 py-1.5 rounded-full border border-paddy-green text-paddy-green hover:bg-paddy-green hover:text-paper transition-colors"
          >
            {isNepali ? "नेपाली" : "English"}
          </button>
        </SettingsRow>
      </div>

      <div className="bg-white/60 border border-soil/10 rounded-md px-5 mb-6">
        <p className="text-xs uppercase tracking-wide text-ink/70 pt-4" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          Account
        </p>
        <SettingsRow title="Name" description={currentUser?.name}>
          <span />
        </SettingsRow>
        <SettingsRow title="Email" description={currentUser?.email}>
          <span />
        </SettingsRow>
        <SettingsRow title="Role" description={currentUser?.role}>
          <span />
        </SettingsRow>
        <SettingsRow
          title="Notifications"
          description="Get notified about likes, comments, and follows."
        >
          <Toggle checked={true} onChange={() => {}} label="Toggle notifications" />
        </SettingsRow>
      </div>

      <div className="bg-white/60 border border-soil/10 rounded-md p-5">
        <button
          type="button"
          onClick={handleLogout}
          className="text-sm px-6 py-2.5 rounded-full bg-paddy-green text-paper font-medium hover:bg-soil-dark transition-colors"
        >
          Log Out
        </button>
      </div>
    </DashboardLayout>
  );
}
