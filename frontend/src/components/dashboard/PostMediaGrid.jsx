import { useState } from "react";
import { XIcon } from "../Icons";

/**
 * Extract YouTube embed URL if valid YouTube link, else return null
 */
export function getYouTubeEmbedUrl(url) {
  if (!url || typeof url !== "string") return null;
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/;
  const match = url.match(regExp);
  if (match && match[1]) {
    return `https://www.youtube.com/embed/${match[1]}?autoplay=0&rel=0`;
  }
  return null;
}

export function getYouTubeThumbnail(url) {
  if (!url || typeof url !== "string") return null;
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/;
  const match = url.match(regExp);
  if (match && match[1]) {
    return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
  }
  return null;
}

export default function PostMediaGrid({ media = [] }) {
  const [modalMediaIndex, setModalMediaIndex] = useState(null);

  if (!media || media.length === 0) return null;

  const handleNext = (e) => {
    e.stopPropagation();
    setModalMediaIndex((prev) => (prev + 1) % media.length);
  };

  const handlePrev = (e) => {
    e.stopPropagation();
    setModalMediaIndex((prev) => (prev - 1 + media.length) % media.length);
  };

  const activeMedia = modalMediaIndex !== null ? media[modalMediaIndex] : null;

  return (
    <div className="mt-3 mb-3">
      {/* MEDIA GRID DISPLAY */}
      <div
        className={`grid gap-2 overflow-hidden rounded-lg border border-soil/15 bg-black/5 ${
          media.length === 1
            ? "grid-cols-1"
            : media.length === 2
            ? "grid-cols-2"
            : "grid-cols-2 sm:grid-cols-3"
        }`}
      >
        {media.map((item, idx) => {
          const youtubeEmbed = getYouTubeEmbedUrl(item.url);

          if (item.type === "video" || youtubeEmbed) {
            if (youtubeEmbed) {
              return (
                <div
                  key={idx}
                  className={`relative overflow-hidden rounded-md bg-black ${
                    media.length === 1 ? "aspect-video max-h-[380px]" : "aspect-video"
                  }`}
                >
                  <iframe
                    src={youtubeEmbed}
                    title={`Post YouTube video ${idx + 1}`}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </div>
              );
            }

            return (
              <div
                key={idx}
                className={`relative overflow-hidden rounded-md bg-black ${
                  media.length === 1 ? "max-h-[380px]" : "aspect-video"
                }`}
              >
                <video
                  src={item.url}
                  controls
                  playsInline
                  preload="metadata"
                  className="w-full h-full object-contain max-h-[380px] bg-black"
                />
              </div>
            );
          }

          // PHOTO (Cloudinary or direct image URL)
          return (
            <div
              key={idx}
              onClick={() => setModalMediaIndex(idx)}
              className={`group relative overflow-hidden bg-soil/10 cursor-pointer ${
                media.length === 1
                  ? "max-h-[420px] aspect-auto"
                  : "aspect-square"
              }`}
            >
              <img
                src={item.url}
                alt={`Post media ${idx + 1}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 text-white text-xs px-2.5 py-1 rounded-full backdrop-blur-xs">
                  🔍 Enlarge
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* LIGHTBOX MODAL FOR PHOTOS & MEDIA */}
      {modalMediaIndex !== null && activeMedia && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setModalMediaIndex(null)}
        >
          {/* Close Button */}
          <button
            onClick={() => setModalMediaIndex(null)}
            className="absolute top-4 right-4 text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors z-10"
            aria-label="Close Lightbox"
          >
            <XIcon className="w-6 h-6" />
          </button>

          {/* Navigation Arrows */}
          {media.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white bg-black/50 hover:bg-black/80 p-3 rounded-full transition-all text-xl font-bold z-10"
                aria-label="Previous Media"
              >
                ‹
              </button>
              <button
                onClick={handleNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white bg-black/50 hover:bg-black/80 p-3 rounded-full transition-all text-xl font-bold z-10"
                aria-label="Next Media"
              >
                ›
              </button>
            </>
          )}

          {/* Content Container */}
          <div
            className="max-w-4xl max-h-[85vh] flex flex-col items-center justify-center relative"
            onClick={(e) => e.stopPropagation()}
          >
            {activeMedia.type === "video" || getYouTubeEmbedUrl(activeMedia.url) ? (
              getYouTubeEmbedUrl(activeMedia.url) ? (
                <div className="w-full aspect-video min-w-[320px] sm:min-w-[640px] rounded-lg overflow-hidden shadow-2xl">
                  <iframe
                    src={getYouTubeEmbedUrl(activeMedia.url)}
                    title="Fullscreen YouTube Video"
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </div>
              ) : (
                <video
                  src={activeMedia.url}
                  controls
                  autoPlay
                  playsInline
                  className="max-h-[80vh] max-w-full rounded-lg shadow-2xl bg-black"
                />
              )
            ) : (
              <img
                src={activeMedia.url}
                alt="Enlarged preview"
                className="max-h-[80vh] max-w-full object-contain rounded-lg shadow-2xl"
              />
            )}

            {/* Media Counter */}
            {media.length > 1 && (
              <p className="mt-3 text-xs text-white/70 tracking-widest font-mono">
                {modalMediaIndex + 1} / {media.length}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
