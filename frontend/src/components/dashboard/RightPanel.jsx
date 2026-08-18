import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { CloudIcon, LeafIcon, MegaphoneIcon, PinIcon } from "../Icons";

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

// WMO Weather Interpretation Codes
function getWeatherCondition(code) {
  switch (code) {
    case 0:
      return "Clear sky";
    case 1:
      return "Mainly clear";
    case 2:
      return "Partly cloudy";
    case 3:
      return "Overcast";
    case 45:
    case 48:
      return "Foggy";
    case 51:
    case 53:
    case 55:
      return "Light drizzle";
    case 61:
    case 63:
    case 65:
      return "Rain";
    case 71:
    case 73:
    case 75:
      return "Snowfall";
    case 80:
    case 81:
    case 82:
      return "Rain showers";
    case 95:
    case 96:
    case 99:
      return "Thunderstorm";
    default:
      return "Clear";
  }
}

export default function RightPanel() {
  const { t } = useTranslation();

  const [weather, setWeather] = useState(null);
  const [locationName, setLocationName] = useState("Kathmandu");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usingGPS, setUsingGPS] = useState(false);

  const fetchWeatherData = async (lat, lon, fallbackName = null) => {
    setLoading(true);
    setError(null);

    try {
      let placeName = fallbackName;
      if (!placeName) {
        try {
          const geoRes = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
          );
          const geoData = await geoRes.json();
          placeName =
            geoData.city ||
            geoData.locality ||
            geoData.principalSubdivision ||
            "Local Area";
        } catch {
          placeName = "Your Location";
        }
      }
      setLocationName(placeName);

      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m`
      );
      const data = await res.json();

      if (data && data.current) {
        setWeather({
          temp: Math.round(data.current.temperature_2m),
          humidity: data.current.relative_humidity_2m,
          wind: Math.round(data.current.wind_speed_10m),
          condition: getWeatherCondition(data.current.weather_code),
        });
      } else {
        throw new Error("Unable to read weather data.");
      }
    } catch (err) {
      console.error("Failed to fetch live weather:", err);
      setError("Weather unavailable");
    } finally {
      setLoading(false);
    }
  };

  const detectLocationAndFetch = () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUsingGPS(true);
          fetchWeatherData(pos.coords.latitude, pos.coords.longitude);
        },
        () => {
          setUsingGPS(false);
          // Default fallback location: Kathmandu, Nepal (27.7172, 85.3240)
          fetchWeatherData(27.7172, 85.324, "Kathmandu");
        },
        { timeout: 8000 }
      );
    } else {
      setUsingGPS(false);
      fetchWeatherData(27.7172, 85.324, "Kathmandu");
    }
  };

  useEffect(() => {
    detectLocationAndFetch();
  }, []);

  return (
    <div>
      <PanelCard Icon={CloudIcon} title={t("dashboard.weather") || "Weather"}>
        <div className="bg-white/60 border border-soil/10 rounded-md p-4 relative overflow-hidden">
          {loading && (
            <div className="flex items-center gap-2 py-2 text-xs text-ink/60">
              <span className="w-3.5 h-3.5 border-2 border-paddy-green border-t-transparent rounded-full animate-spin" />
              <span>Detecting location & fetching weather...</span>
            </div>
          )}

          {!loading && error && (
            <div>
              <p className="text-sm text-red-600 font-medium">{error}</p>
              <button
                type="button"
                onClick={detectLocationAndFetch}
                className="mt-2 text-xs text-paddy-green underline"
              >
                Try again
              </button>
            </div>
          )}

          {!loading && !error && weather && (
            <div>
              <div className="flex items-baseline justify-between">
                <p className="text-3xl text-ink font-bold" style={{ fontFamily: "'Fraunces', serif" }}>
                  {weather.temp}°C
                </p>
                <button
                  type="button"
                  onClick={detectLocationAndFetch}
                  title="Refresh location weather"
                  className="text-[11px] text-paddy-green hover:underline flex items-center gap-1 bg-paddy-green/10 px-2 py-0.5 rounded font-medium"
                >
                  <PinIcon className="w-3 h-3" />
                  {usingGPS ? "GPS Active" : "Detect GPS"}
                </button>
              </div>

              <p className="text-sm text-ink/80 mt-1 font-medium" style={{ fontFamily: "'Work Sans', sans-serif" }}>
                {locationName} . {weather.condition}
              </p>

              <div className="mt-3 pt-2.5 border-t border-soil/10 flex items-center gap-4 text-xs text-ink/65">
                <span>💧 {weather.humidity}% Humidity</span>
                <span>🌬️ {weather.wind} km/h Wind</span>
              </div>
            </div>
          )}
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
