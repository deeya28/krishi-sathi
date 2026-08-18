import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { SunIcon, MoonIcon, GlobeIcon } from "../components/Icons";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

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

// A clickable row that expands/collapses, used for both the top-level
// "Security & Privacy" section and the "Change Password" item inside it.
function ExpandableRow({ title, description, isOpen, onToggle, children }) {
  return (
    <div className="border-b border-soil/10 last:border-b-0">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 py-4 text-left"
      >
        <div className="min-w-0">
          <p className="text-sm font-medium text-ink">{title}</p>
          {description && <p className="text-xs text-ink/55 mt-0.5">{description}</p>}
        </div>
        <span
          className={`text-ink/40 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`}
        >
          ▾
        </span>
      </button>
      {isOpen && <div className="pb-4">{children}</div>}
    </div>
  );
}

function ChangePasswordForm() {
  const { token } = useAuth();
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [status, setStatus] = useState({ loading: false, error: "", success: "" });

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ loading: false, error: "", success: "" });

    if (form.newPassword.length < 6) {
      setStatus({ loading: false, error: "New password must be at least 6 characters", success: "" });
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setStatus({ loading: false, error: "New passwords do not match", success: "" });
      return;
    }

    setStatus({ loading: true, error: "", success: "" });
    try {
      const res = await fetch(`${API_URL}/auth/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: form.currentPassword,
          newPassword: form.newPassword,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setStatus({ loading: false, error: data.message || "Failed to change password", success: "" });
        return;
      }

      setStatus({ loading: false, error: "", success: "Password changed successfully." });
      setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setStatus({ loading: false, error: "Could not connect to the server.", success: "" });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 max-w-sm">
      <div>
        <label className="block text-xs uppercase tracking-wide text-ink/70 mb-1.5">
          Current Password
        </label>
        <input
          type="password"
          name="currentPassword"
          value={form.currentPassword}
          onChange={handleChange}
          required
          className="w-full bg-white border border-soil/20 rounded-md px-3 py-2 text-sm text-ink focus:outline-none focus:border-paddy-green"
        />
      </div>
      <div>
        <label className="block text-xs uppercase tracking-wide text-ink/70 mb-1.5">
          New Password
        </label>
        <input
          type="password"
          name="newPassword"
          value={form.newPassword}
          onChange={handleChange}
          required
          minLength={6}
          className="w-full bg-white border border-soil/20 rounded-md px-3 py-2 text-sm text-ink focus:outline-none focus:border-paddy-green"
        />
      </div>
      <div>
        <label className="block text-xs uppercase tracking-wide text-ink/70 mb-1.5">
          Confirm New Password
        </label>
        <input
          type="password"
          name="confirmPassword"
          value={form.confirmPassword}
          onChange={handleChange}
          required
          minLength={6}
          className="w-full bg-white border border-soil/20 rounded-md px-3 py-2 text-sm text-ink focus:outline-none focus:border-paddy-green"
        />
      </div>

      {status.error && <p className="text-xs text-red-600">{status.error}</p>}
      {status.success && <p className="text-xs text-paddy-green">{status.success}</p>}

      <button
        type="submit"
        disabled={status.loading}
        className="text-sm px-5 py-2 rounded-full bg-paddy-green text-paper font-medium hover:bg-soil-dark transition-colors disabled:opacity-50"
      >
        {status.loading ? "Changing..." : "Change Password"}
      </button>
    </form>
  );
}

export default function Settings() {
  const { i18n } = useTranslation();
  const { isDark, toggleTheme } = useTheme();
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const [securityOpen, setSecurityOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);

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
        <SettingsRow title="Role" description={
          currentUser?.role === "agricultural_expert" ? "Agricultural Expert" :
          currentUser?.role === "farmer" ? "Farmer" :
          currentUser?.role === "community_user" ? "Community User" :
          currentUser?.role
        }>
          <span />
        </SettingsRow>
        <SettingsRow
          title="Notifications"
          description="Get notified about likes, comments, and follows."
        >
          <Toggle checked={true} onChange={() => {}} label="Toggle notifications" />
        </SettingsRow>
      </div>

      {/* SECURITY & PRIVACY - top level expandable section */}
      <div className="bg-white/60 border border-soil/10 rounded-md px-5 mb-6">
        <p className="text-xs uppercase tracking-wide text-ink/70 pt-4 pb-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
          Security & Privacy
        </p>
        <ExpandableRow
          title="Security & Privacy"
          description="Manage your password and account security."
          isOpen={securityOpen}
          onToggle={() => setSecurityOpen((v) => !v)}
        >
          {/* CHANGE PASSWORD - nested expandable item inside Security & Privacy */}
          <div className="border border-soil/10 rounded-md px-4 bg-soil/5">
            <ExpandableRow
              title="Change Password"
              description="Update the password you use to log in."
              isOpen={changePasswordOpen}
              onToggle={() => setChangePasswordOpen((v) => !v)}
            >
              <ChangePasswordForm />
            </ExpandableRow>
          </div>
        </ExpandableRow>
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