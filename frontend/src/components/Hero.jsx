import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import heroImg from "../assets/hero-paddy.jpg";

export default function Hero() {
  const { t } = useTranslation();

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-end overflow-hidden"
    >
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={heroImg}
          alt="Farmers planting rice seedlings in a paddy field"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-soil-dark via-soil-dark/60 to-paddy-green/30" />
        <div className="absolute inset-0 bg-paddy-green/10" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 pb-24 pt-40 w-full">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="uppercase tracking-[0.25em] text-xs text-gold-grain mb-6"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          {t("hero.eyebrow")}
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="text-paper text-2xl md:text-3xl max-w-2xl mb-10 leading-snug"
          style={{ fontFamily: "'Fraunces', serif" }}
        >
          {t("hero.subtitle")}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex flex-wrap gap-4"
        >
          <Link
            to="/login"
            className="text-sm px-7 py-3 rounded-full bg-gold-grain text-ink font-medium hover:bg-paper transition-colors"
            style={{ fontFamily: "'Work Sans', sans-serif" }}
          >
            {t("hero.login")}
          </Link>
          <Link
            to="/register"
            className="text-sm px-7 py-3 rounded-full border border-paper/50 text-paper font-medium hover:border-paper hover:bg-paper/10 transition-colors"
            style={{ fontFamily: "'Work Sans', sans-serif" }}
          >
            {t("hero.register")}
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
