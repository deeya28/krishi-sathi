import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import heroImg from "../assets/hero-paddy.jpg";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState(null); // null | "submitting" | "done"
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setStatus("submitting");

    try {
      const res = await fetch(`${API_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        setStatus(null);
        setError(data.message || "Something went wrong. Please try again.");
        return;
      }

      // Backend intentionally always returns the same success message,
      // whether or not the email is registered - don't reveal which.
      setStatus("done");
    } catch (err) {
      setStatus(null);
      setError("Could not connect to the server. Please try again.");
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
            Account Recovery
          </p>
          <h1
            className="text-ink text-3xl mb-3"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            Forgot Password
          </h1>
          <p
            className="text-sm text-ink/60 mb-8"
            style={{ fontFamily: "'Work Sans', sans-serif" }}
          >
            Enter the email linked to your account and we'll send you a link to reset your password.
          </p>

          {status === "done" ? (
            <div className="text-sm text-paddy-green bg-paddy-green/10 border border-paddy-green/20 rounded-md px-4 py-3">
              If an account with that email exists, a reset link has been sent. Check your inbox.
            </div>
          ) : (
            <>
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
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
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
                  {status === "submitting" ? "Sending..." : "Send Reset Link"}
                </button>
              </form>
            </>
          )}

          <p
            className="text-sm text-ink/60 mt-6"
            style={{ fontFamily: "'Work Sans', sans-serif" }}
          >
            Remembered your password?{" "}
            <Link to="/login" className="text-paddy-green font-medium">
              Back to Login
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}