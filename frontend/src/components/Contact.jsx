import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { PinIcon, MailIcon, PhoneIcon } from "./Icons";

export default function Contact() {
  const { t } = useTranslation();
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState(null); // null | "sending" | "sent"

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: backend integration, replace with actual API call, e.g.
    // await fetch("/api/contact", { method: "POST", body: JSON.stringify(form) })
    setStatus("sending");
    setTimeout(() => {
      setStatus("sent");
      setForm({ name: "", email: "", message: "" });
    }, 800);
  };

  return (
    <section id="contact" className="bg-paper py-28">
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-16">
        {/* Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6 }}
        >
          <p
            className="uppercase tracking-[0.25em] text-xs text-gold-grain mb-4"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            {t("contact.eyebrow")}
          </p>
          <h2
            className="text-ink mb-8"
            style={{
              fontFamily: "'Fraunces', serif",
              fontSize: "clamp(2rem, 4vw, 2.75rem)",
            }}
          >
            {t("contact.title")}
          </h2>

          <ul
            className="space-y-4 text-ink"
            style={{ fontFamily: "'Work Sans', sans-serif" }}
          >
            <li className="flex items-center gap-3">
              <PinIcon className="w-5 h-5 text-paddy-green shrink-0" /> Kathmandu, Nepal
            </li>
            <li className="flex items-center gap-3">
              <MailIcon className="w-5 h-5 text-paddy-green shrink-0" /> support@krishisathi.com
            </li>
            <li className="flex items-center gap-3">
              <PhoneIcon className="w-5 h-5 text-paddy-green shrink-0" /> 9768915008
            </li>
            <li className="flex items-center gap-3">
              <PhoneIcon className="w-5 h-5 text-paddy-green shrink-0" /> 976-8907732
            </li>
          </ul>
        </motion.div>

        {/* Form */}
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="space-y-7"
        >
          <div>
            <label
              className="block text-xs uppercase tracking-wide text-ink/80 mb-2"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              {t("contact.nameLabel")}
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              placeholder={t("contact.namePlaceholder")}
              className="w-full bg-transparent border-b border-soil/25 pb-2 text-ink placeholder:text-ink/35 focus:outline-none focus:border-paddy-green transition-colors"
              style={{ fontFamily: "'Work Sans', sans-serif" }}
            />
          </div>

          <div>
            <label
              className="block text-xs uppercase tracking-wide text-ink/80 mb-2"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              {t("contact.emailLabel")}
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              placeholder={t("contact.emailPlaceholder")}
              className="w-full bg-transparent border-b border-soil/25 pb-2 text-ink placeholder:text-ink/35 focus:outline-none focus:border-paddy-green transition-colors"
              style={{ fontFamily: "'Work Sans', sans-serif" }}
            />
          </div>

          <div>
            <label
              className="block text-xs uppercase tracking-wide text-ink/80 mb-2"
              style={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              {t("contact.messageLabel")}
            </label>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              required
              rows={4}
              placeholder={t("contact.messagePlaceholder")}
              className="w-full bg-transparent border-b border-soil/25 pb-2 text-ink placeholder:text-ink/35 focus:outline-none focus:border-paddy-green transition-colors resize-none"
              style={{ fontFamily: "'Work Sans', sans-serif" }}
            />
          </div>

          <button
            type="submit"
            disabled={status === "sending"}
            className="text-sm px-7 py-3 rounded-full bg-paddy-green text-paper font-medium hover:bg-soil-dark transition-colors disabled:opacity-60"
            style={{ fontFamily: "'Work Sans', sans-serif" }}
          >
            {status === "sending"
              ? t("contact.sending")
              : status === "sent"
              ? t("contact.sent")
              : t("contact.send")}
          </button>
        </motion.form>
      </div>
    </section>
  );
}
