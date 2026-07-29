import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { LeafIcon, GlobeIcon } from "./Icons";

export default function MissionVision() {
  const { t } = useTranslation();

  const CARDS = [
    {
      eyebrow: t("missionVision.missionEyebrow"),
      Icon: LeafIcon,
      title: t("missionVision.missionTitle"),
      text: t("missionVision.missionText"),
    },
    {
      eyebrow: t("missionVision.visionEyebrow"),
      Icon: GlobeIcon,
      title: t("missionVision.visionTitle"),
      text: t("missionVision.visionText"),
    },
  ];

  return (
    <section className="bg-paddy-green py-24">
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-8">
        {CARDS.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.6, delay: i * 0.15 }}
            className="border border-paper/15 rounded-sm p-10 hover:border-gold-grain/60 transition-colors"
          >
            <span
              className="text-xs tracking-[0.2em] uppercase text-gold-grain"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              {card.eyebrow}
            </span>
            <card.Icon className="w-9 h-9 text-gold-grain my-5" />
            <h3
              className="text-paper text-2xl mb-3"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              {card.title}
            </h3>
            <p
              className="text-paper/70 leading-relaxed"
              style={{ fontFamily: "'Work Sans', sans-serif" }}
            >
              {card.text}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
