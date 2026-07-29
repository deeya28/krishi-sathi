import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import aboutImg from "../assets/about-field-scan.jpg";
import { useAuth } from "../context/AuthContext";
import { CheckIcon } from "../components/Icons";

export default function Register() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "Farmer",
  });
  const [status, setStatus] = useState(null);
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setStatus("submitting");

    // TODO: swap for a real backend call, e.g.
    // await fetch("/api/auth/register", { method: "POST", body: JSON.stringify(form) })
    setTimeout(() => {
      const result = register(form);
      if (!result.ok) {
        setStatus(null);
        setError(result.error);
        return;
      }
      setStatus("done");
      // Show a success message, then send the user to the login page —
      // registering no longer logs them straight into the dashboard.
      setTimeout(() => {
        navigate("/login", { state: { justRegistered: true } });
      }, 1600);
    }, 700);
  };

  if (status === "done") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper px-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center max-w-sm"
        >
          <div className="w-14 h-14 rounded-full bg-paddy-green/10 text-paddy-green flex items-center justify-center mx-auto mb-5">
            <CheckIcon className="w-7 h-7" />
          </div>
          <h1
            className="text-ink text-2xl mb-2"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            Registered successfully!
          </h1>
          <p
            className="text-ink/70 text-sm"
            style={{ fontFamily: "'Work Sans', sans-serif" }}
          >
            Taking you to the login page so you can sign in to your new account...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-paper">
      {/* Form side */}
      <div className="flex items-center justify-center px-6 py-16 order-2 md:order-1">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-sm"
        >
          <Link
            to="/"
            className="md:hidden inline-block mb-10 text-sm font-medium text-paddy-green"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            कृषि साथी
          </Link>

          <p
            className="uppercase tracking-[0.25em] text-xs text-gold-grain mb-3"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            {t("register.eyebrow")}
          </p>
          <h1
            className="text-ink text-3xl mb-8"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            {t("register.title")}
          </h1>

          {error && (
            <div className="mb-5 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                className="block text-xs uppercase tracking-wide text-ink/80 mb-2"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                {t("register.nameLabel")}
              </label>
              <input
                type="text"
                name="name"
                required
                value={form.name}
                onChange={handleChange}
                placeholder="Your full name"
                className="w-full bg-transparent border-b border-ink/25 pb-2 text-ink placeholder:text-ink/35 focus:outline-none focus:border-paddy-green transition-colors"
                style={{ fontFamily: "'Work Sans', sans-serif" }}
              />
            </div>

            <div>
              <label
                className="block text-xs uppercase tracking-wide text-ink/80 mb-2"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                {t("register.emailLabel")}
              </label>
              <input
                type="email"
                name="email"
                required
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full bg-transparent border-b border-ink/25 pb-2 text-ink placeholder:text-ink/35 focus:outline-none focus:border-paddy-green transition-colors"
                style={{ fontFamily: "'Work Sans', sans-serif" }}
              />
            </div>

            <div>
              <label
                className="block text-xs uppercase tracking-wide text-ink/80 mb-2"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                {t("register.passwordLabel")}
              </label>
              <input
                type="password"
                name="password"
                required
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full bg-transparent border-b border-ink/25 pb-2 text-ink placeholder:text-ink/35 focus:outline-none focus:border-paddy-green transition-colors"
                style={{ fontFamily: "'Work Sans', sans-serif" }}
              />
            </div>

            <div>
              <label
                className="block text-xs uppercase tracking-wide text-ink/80 mb-2"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
              >
                {t("register.roleLabel")}
              </label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full bg-transparent border-b border-ink/25 pb-2 text-ink focus:outline-none focus:border-paddy-green transition-colors"
                style={{ fontFamily: "'Work Sans', sans-serif" }}
              >
                <option value="Farmer">{t("register.roleFarmer")}</option>
                <option value="Expert">{t("register.roleExpert")}</option>
                <option value="Vendor">{t("register.roleVendor")}</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={status === "submitting"}
              className="w-full text-sm py-3 rounded-full bg-paddy-green text-paper font-medium hover:bg-soil-dark transition-colors disabled:opacity-60"
              style={{ fontFamily: "'Work Sans', sans-serif" }}
            >
              {status === "submitting" ? t("register.creating") : t("register.createBtn")}
            </button>
          </form>
        </motion.div>
      </div>

      {/* Image side */}
      <div className="relative hidden md:block order-1 md:order-2">
        <img
          src={aboutImg}
          alt="A farmer inspecting a leaf using a smartphone"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-soil-dark/50" />
        <Link
          to="/"
          className="absolute top-8 right-8 text-paper text-sm font-medium"
          style={{ fontFamily: "'Fraunces', serif" }}
        >
          कृषि साथी
        </Link>
        <p
          className="absolute bottom-10 left-8 right-8 text-paper text-xl leading-snug text-right"
          style={{ fontFamily: "'Fraunces', serif" }}
        >
          {t("register.welcome")}
        </p>
      </div>
    </div>
  );
}
