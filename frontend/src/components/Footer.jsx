import { useTranslation } from "react-i18next";

export default function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="bg-soil-dark pt-16 pb-8">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <span
          className="text-2xl text-paper"
          style={{ fontFamily: "'Fraunces', serif" }}
        >
          कृषि साथी
        </span>
        <p
          className="text-paper/50 text-sm mt-3 tracking-wide"
          style={{ fontFamily: "'Work Sans', sans-serif" }}
        >
          {t("footer.tagline")}
        </p>

        <div
          className="flex justify-center gap-8 mt-8 text-sm text-paper/60"
          style={{ fontFamily: "'Work Sans', sans-serif" }}
        >
          <a href="#home" className="hover:text-gold-grain transition-colors">
            {t("nav.home")}
          </a>
          <a href="#about" className="hover:text-gold-grain transition-colors">
            {t("nav.about")}
          </a>
          <a href="#team" className="hover:text-gold-grain transition-colors">
            {t("nav.team")}
          </a>
          <a href="#contact" className="hover:text-gold-grain transition-colors">
            {t("nav.contact")}
          </a>
        </div>

        <div className="border-t border-paper/10 mt-10 pt-6">
          <p
            className="text-paper/35 text-xs"
            style={{ fontFamily: "'Work Sans', sans-serif" }}
          >
            {t("footer.copyright")}
          </p>
        </div>
      </div>
    </footer>
  );
}
