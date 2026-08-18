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
  const [showPassword, setShowPassword] = useState(false);

  const justRegistered = Boolean(location.state?.justRegistered);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setStatus("submitting");

    try {
      const result = await login(form);
      if (!result.ok) {
        setStatus(null);
        setError(result.error || "Login failed.");
        return;
      }
      setStatus("done");
      navigate("/dashboard");
    } catch (err) {
      setStatus(null);
      setError("An unexpected error occurred during login.");
    }
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
              <div className="flex items-center justify-between mb-2">
                <label
                  className="block text-xs uppercase tracking-wide text-ink/80"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  {t("login.passwordLabel")}
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-paddy-green hover:underline"
                  style={{ fontFamily: "'Work Sans', sans-serif" }}
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  required
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full bg-transparent border-b border-ink/25 pb-2 pr-8 text-ink placeholder:text-ink/35 focus:outline-none focus:border-paddy-green transition-colors"
                  style={{ fontFamily: "'Work Sans', sans-serif" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-0 bottom-2 text-ink/40 hover:text-ink/70 transition-colors"
                >
                  {showPassword ? (
                    // Eye-off icon
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.98 8.223A10.477 10.477 0 001.934 12c1.292 4.338 5.31 7.5 10.066 7.5 1.29 0 2.523-.233 3.664-.657M6.228 6.228A10.451 10.451 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                      />
                    </svg>
                  ) : (
                    // Eye icon
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  )}
                </button>
              </div>
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