import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { LeafIcon, UsersIcon, DeviceIcon } from "./Icons";

export default function Features() {
  const { t } = useTranslation();

  const FEATURES = [
    {
      Icon: LeafIcon,
      title: t("features.item1Title"),
      text: t("features.item1Text"),
    },
    {
      Icon: UsersIcon,
      title: t("features.item2Title"),
      text: t("features.item2Text"),
    },
    {
      Icon: DeviceIcon,
      title: t("features.item3Title"),
      text: t("features.item3Text"),
    },
  ];

  return (
    <section className="bg-paper py-24">
      <div className="max-w-6xl mx-auto px-6">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="uppercase tracking-[0.25em] text-xs text-gold-grain mb-4 text-center"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          {t("features.eyebrow")}
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-ink text-center mb-16"
          style={{
            fontFamily: "'Fraunces', serif",
            fontSize: "clamp(2rem, 4vw, 2.75rem)",
          }}
        >
          {t("features.title")}
        </motion.h2>

        <div className="grid sm:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-white/60 border border-soil/10 rounded-sm p-8 hover:shadow-[0_12px_30px_-15px_rgba(58,46,34,0.25)] hover:-translate-y-1 transition-all"
            >
              <f.Icon className="w-8 h-8 text-paddy-green mb-4" />
              <h3
                className="text-ink text-xl mb-2"
                style={{ fontFamily: "'Fraunces', serif" }}
              >
                {f.title}
              </h3>
              <p
                className="text-ink/90 leading-relaxed"
                style={{ fontFamily: "'Work Sans', sans-serif" }}
              >
                {f.text}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
