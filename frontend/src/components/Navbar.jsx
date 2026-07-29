import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { MenuIcon, XIcon, SunIcon, MoonIcon } from "./Icons";
import { useTheme } from "../context/ThemeContext";

export default function Navbar() {
  const { t } = useTranslation();
  const { isDark, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const LINKS = [
    { label: t("nav.home"), href: "#home" },
    { label: t("nav.about"), href: "#about" },
    { label: t("nav.team"), href: "#team" },
    { label: t("nav.contact"), href: "#contact" },
  ];

  const textColor = mobileOpen ? "text-ink" : scrolled ? "text-ink" : "text-paper";

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled || mobileOpen
          ? "bg-paper/95 backdrop-blur-sm shadow-[0_1px_0_0_rgba(58,46,34,0.08)] py-3"
          : "bg-transparent py-6"
      }`}
    >
      <nav className="max-w-6xl mx-auto px-6 flex items-center justify-between">
        <a href="#home" className="flex items-center gap-2 group">
          <span
            className={`text-sm font-medium tracking-tight transition-colors ${textColor}`}
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            कृषि साथी
          </span>
        </a>

        <ul className="hidden md:flex items-center gap-9">
          {LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className={`text-sm tracking-wide uppercase relative pb-1 transition-colors ${textColor} hover:text-gold-grain after:content-[''] after:absolute after:left-0 after:bottom-0 after:h-[1.5px] after:w-0 after:bg-gold-grain after:transition-all after:duration-300 hover:after:w-full`}
                style={{ fontFamily: "'Work Sans', sans-serif" }}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
            className={`p-2 rounded-full border transition-all ${
              scrolled || mobileOpen
                ? "border-ink/25 text-ink hover:bg-ink hover:text-paper"
                : "border-paper/60 text-paper hover:bg-paper hover:text-paddy-green"
            }`}
          >
            {isDark ? <SunIcon className="w-4 h-4" /> : <MoonIcon className="w-4 h-4" />}
          </button>

          <Link
            to="/login"
            className={`hidden sm:inline-block text-sm font-medium px-5 py-2 rounded-full border transition-all ${
              scrolled
                ? "border-paddy-green text-paddy-green hover:bg-paddy-green hover:text-paper"
                : "border-paper text-paper hover:bg-paper hover:text-paddy-green"
            }`}
            style={{ fontFamily: "'Work Sans', sans-serif" }}
          >
            {t("nav.login")}
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
            className={`md:hidden p-2 rounded-full transition-colors ${textColor}`}
          >
            {mobileOpen ? <XIcon className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden overflow-hidden bg-paper border-t border-soil/10"
          >
            <ul className="flex flex-col px-6 py-4 gap-4">
              {LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="block text-sm tracking-wide uppercase text-ink"
                    style={{ fontFamily: "'Work Sans', sans-serif" }}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
              <li>
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="inline-block text-sm font-medium px-5 py-2 rounded-full border border-paddy-green text-paddy-green"
                  style={{ fontFamily: "'Work Sans', sans-serif" }}
                >
                  {t("nav.login")}
                </Link>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
