import { useTranslation } from "react-i18next";
import { CloudIcon, LeafIcon, MegaphoneIcon } from "../Icons";

function PanelCard({ Icon, title, children }) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="w-5 h-5 text-paddy-green" />
        <h3
          className="text-ink text-sm uppercase tracking-wide"
          style={{ fontFamily: "'JetBrains Mono', monospace" }}
        >
          {title}
        </h3>
      </div>
      {children}
    </div>
  );
}

export default function RightPanel() {
  const { t } = useTranslation();

  return (
    <div>
      <PanelCard Icon={CloudIcon} title={t("dashboard.weather")}>
        <div className="bg-white/60 border border-soil/10 rounded-md p-4">
          <p className="text-2xl text-ink" style={{ fontFamily: "'Fraunces', serif" }}>
            24°C
          </p>
          <p className="text-sm text-ink/70" style={{ fontFamily: "'Work Sans', sans-serif" }}>
            Kathmandu . Partly cloudy
          </p>
        </div>
      </PanelCard>

      <PanelCard Icon={LeafIcon} title={t("dashboard.farmingTips")}>
        <ul className="space-y-3">
          {[t("dashboard.tip1"), t("dashboard.tip2"), t("dashboard.tip3")].map((tip) => (
            <li
              key={tip}
              className="text-sm text-ink/80 leading-relaxed"
              style={{ fontFamily: "'Work Sans', sans-serif" }}
            >
              {tip}
            </li>
          ))}
        </ul>
      </PanelCard>

      <PanelCard Icon={MegaphoneIcon} title={t("dashboard.announcements")}>
        <div className="bg-paddy-green/5 border border-paddy-green/15 rounded-md p-4">
          <p className="text-sm text-ink/80" style={{ fontFamily: "'Work Sans', sans-serif" }}>
            {t("dashboard.announcementText")}
          </p>
        </div>
      </PanelCard>
    </div>
  );
}
