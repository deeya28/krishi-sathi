import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import aboutImg from "../assets/about-field-scan.jpg";
import { CheckIcon } from "./Icons";

export default function About() {
  const { t } = useTranslation();
  const [step, setStep] = useState(0);

  const STATES = [t("about.scanning"), t("about.checking"), t("about.healthy")];
  const CHECKLIST = [
    t("about.check1"),
    t("about.check2"),
    t("about.check3"),
    t("about.check4"),
  ];

  useEffect(() => {
    const id = setInterval(() => {
      setStep((s) => (s + 1) % STATES.length);
    }, 1800);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t]);

  return (
    <section id="about" className="bg-paper py-28">
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
        {/* Image with scan-frame signature */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
          className="relative rounded-sm overflow-hidden aspect-[4/5] shadow-[0_20px_40px_-15px_rgba(58,46,34,0.3)]"
        >
          <img
            src={aboutImg}
            alt="A farmer inspecting a leaf using a smartphone"
            className="w-full h-full object-cover"
          />

          {/* Corner scan brackets */}
          <div className="absolute inset-6 pointer-events-none">
            {["top-0 left-0 border-t-2 border-l-2", "top-0 right-0 border-t-2 border-r-2", "bottom-0 left-0 border-b-2 border-l-2", "bottom-0 right-0 border-b-2 border-r-2"].map(
              (pos, i) => (
                <span
                  key={i}
                  className={`absolute w-6 h-6 border-gold-grain ${pos}`}
                />
              )
            )}
          </div>

          {/* Status label */}
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute bottom-6 left-6 px-3 py-1.5 bg-soil-dark/80 backdrop-blur-sm rounded-full"
          >
            <span
              className="text-paper text-xs tracking-wide"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              {STATES[step]}
            </span>
          </motion.div>
        </motion.div>

        {/* Text */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.7 }}
        >
          <p
            className="uppercase tracking-[0.25em] text-xs text-gold-grain mb-4"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            {t("about.eyebrow")}
          </p>
          <h2
            className="text-ink mb-6"
            style={{
              fontFamily: "'Fraunces', serif",
              fontSize: "clamp(2rem, 4vw, 3rem)",
            }}
          >
            {t("about.title")}
          </h2>
          <p
            className="text-ink text-lg mb-8 leading-relaxed"
            style={{ fontFamily: "'Work Sans', sans-serif" }}
          >
            {t("about.description")}
          </p>

          <ul className="grid grid-cols-2 gap-4">
            {CHECKLIST.map((item) => (
              <li
                key={item}
                className="flex items-center gap-2 text-ink"
                style={{ fontFamily: "'Work Sans', sans-serif" }}
              >
                <CheckIcon className="w-4 h-4 text-paddy-green shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  );
}