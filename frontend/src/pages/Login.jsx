import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import heroImg from "../assets/hero-paddy.jpg";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [status, setStatus] = useState(null);
  const [error, setError] = useState("");

  const justRegistered = Boolean(location.state?.justRegistered);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setStatus("submitting");

    const result = await login(form);
    if (!result.ok) {
      setStatus(null);
      setError(result.error);
      return;
    }
    setStatus("done");
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-paper">
      {/* Image side */}
      <div className="relative hidden md:block">
        <img
          src={heroImg}
          alt="Farmers working in a rice paddy field"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-soil-dark/50" />
        <Link
          to="/"
          className="absolute top-8 left-8 text-paper text-sm font-medium"
          style={{ fontFamily: "'Fraunces', serif" }}
        >
          कृषि साथी
        </Link>
        <p
          className="absolute bottom-10 left-8 right-8 text-paper text-xl leading-snug"
          style={{ fontFamily: "'Fraunces', serif" }}
        >
          {t("login.welcome")}
        </p>
      </div>

      {/* Form side */}
      <div className="flex items-center justify-center px-6 py-16">
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
            {t("login.eyebrow")}
          </p>
          <h1
            className="text-ink text-3xl mb-8"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            {t("login.title")}
          </h1>

          {justRegistered && (
            <div className="mb-5 text-sm text-paddy-green bg-paddy-green/10 border border-paddy-green/20 rounded-md px-3 py-2">
              Account created. Please log in to continue.
            </div>
          )}

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
                {t("login.emailLabel")}
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
                {t("login.passwordLabel")}
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

            <button
              type="submit"
              disabled={status === "submitting"}
              className="w-full text-sm py-3 rounded-full bg-paddy-green text-paper font-medium hover:bg-soil-dark transition-colors disabled:opacity-60"
              style={{ fontFamily: "'Work Sans', sans-serif" }}
            >
              {status === "submitting" ? t("login.loggingIn") : t("login.loginBtn")}
            </button>
          </form>

          <p
            className="text-sm text-ink/60 mt-6"
            style={{ fontFamily: "'Work Sans', sans-serif" }}
          >
            Don&rsquo;t have an account?{" "}
            <Link to="/register" className="text-paddy-green font-medium">
              Register
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
