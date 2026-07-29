import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";

const TEAM = [
  { name: "Diya Karki", role: "Project Manager & Backend" },
  { name: "Kritika Kaspal", role: "Frontend Developer" },
  { name: "Aayushma Sapkota", role: "Frontend Developer" },
  { name: "Jasmine Khadka", role: "Backend Developer" },
  { name: "Tanisha Maharajan", role: "QA Analyst" },
];

export default function Team() {
  const { t } = useTranslation();
  return (
    <section id="team" className="bg-soil-dark py-24">
      <div className="max-w-4xl mx-auto px-6">
        <p
          className="uppercase tracking-[0.25em] text-xs text-gold-grain mb-4 text-center"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          {t("team.eyebrow")}
        </p>
        <h2
          className="text-paper text-center mb-4"
          style={{
            fontFamily: "'Fraunces', serif",
            fontSize: "clamp(2rem, 4vw, 2.75rem)",
          }}
        >
          {t("team.title")}
        </h2>
        <p
          className="text-paper/60 text-center max-w-lg mx-auto mb-14"
          style={{ fontFamily: "'Work Sans', sans-serif" }}
        >
          {t("team.subtitle")}
        </p>

        <div className="border-t border-paper/15">
          {TEAM.map((member, i) => (
            <motion.div
              key={member.name}
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="flex items-center justify-between border-b border-paper/15 py-5 group"
            >
              <div className="flex items-center gap-5">
                <span
                  className="text-gold-grain text-sm w-6"
                  style={{ fontFamily: "'JetBrains Mono', monospace" }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span
                  className="text-paper text-lg group-hover:text-gold-grain transition-colors"
                  style={{ fontFamily: "'Fraunces', serif" }}
                >
                  {member.name}
                </span>
              </div>
              <span
                className="text-paper/50 text-sm text-right"
                style={{ fontFamily: "'Work Sans', sans-serif" }}
              >
                {member.role}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
