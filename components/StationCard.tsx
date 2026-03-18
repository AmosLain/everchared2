import type { Station } from "@/lib/types";

interface StationCardProps {
  station: Station;
}

function formatDistance(km: number): string {
  const miles = km * 0.621371;
  if (km < 1) {
    const ft = Math.round(miles * 5280);
    return `${Math.round(km * 1000)} m / ${ft} ft`;
  }
  return `${km.toFixed(1)} km / ${miles.toFixed(1)} mi`;
}

function getMapsUrl(station: Station): string {
  // Support different coordinate field names across sources
  const lat = (station as any).lat ?? (station as any).latitude;
  const lng =
    (station as any).lng ??
    (station as any).lon ??
    (station as any).longitude;

  if (lat != null && lng != null) {
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  }

  const query = [station.name, station.address, station.city]
    .filter(Boolean)
    .join(", ");

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    query
  )}`;
}

export default function StationCard({ station }: StationCardProps) {
  const mapsUrl = getMapsUrl(station);

  const lat = (station as any).lat ?? (station as any).latitude;
  const lng = (station as any).lng ?? (station as any).lon ?? (station as any).longitude;
  const wazeUrl = lat != null && lng != null
    ? `https://waze.com/ul?ll=${lat},${lng}&navigate=yes`
    : `https://waze.com/ul?q=${encodeURIComponent([station.name, station.city].filter(Boolean).join(", "))}`;

  const rawDistance =
    (station as any).distance ??
    (station as any).distanceKm ??
    (station as any).distance_km;

  const distanceKm =
    typeof rawDistance === "number" && Number.isFinite(rawDistance)
      ? rawDistance
      : null;

  return (
    <div className="rounded-2xl p-4 flex flex-col gap-3 border border-teal-200/10 bg-[#16303a]/76 backdrop-blur-md shadow-[0_14px_36px_rgba(0,0,0,0.28)] hover:border-teal-300/28 hover:bg-[#193744]/84 transition-colors">
      <div className="flex items-start justify-between gap-2">
        <h2 className="text-slate-50 font-semibold text-base leading-snug line-clamp-2">
          {station.name}
        </h2>

        {distanceKm != null && (
          <span className="flex-shrink-0 text-teal-50 text-sm font-medium bg-teal-400/12 border border-teal-300/18 px-2 py-0.5 rounded-full">
            {formatDistance(distanceKm)}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-1 text-sm text-slate-300/82">
        {(station.address || station.city) && (
          <p className="flex items-center gap-1">
            <span>📍</span>
            <span>
              {[station.address, station.city, station.country]
                .filter(Boolean)
                .join(", ")}
            </span>
          </p>
        )}

        {(station as any).power && (
          <p className="flex items-center gap-1">
            <span>⚡</span>
            <span className="text-amber-200 font-medium">
              {(station as any).power}
            </span>
          </p>
        )}

        {(station as any).operator && (
          <p className="flex items-center gap-1">
            <span>🔌</span>
            <span>{(station as any).operator}</span>
          </p>
        )}
      </div>

      <div className="mt-auto flex gap-2">
        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 inline-flex items-center justify-center gap-1.5 bg-teal-400/12 hover:bg-teal-400/18 text-teal-50 border border-teal-300/18 text-sm font-medium py-2 px-3 rounded-lg transition-colors"
        >
          <span>🗺️</span>
          Google Maps
        </a>
        <a
          href={wazeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 inline-flex items-center justify-center gap-1.5 bg-sky-500/82 hover:bg-sky-400 text-slate-950 text-sm font-semibold py-2 px-3 rounded-lg transition-colors"
        >
          <span>🔵</span>
          Waze
        </a>
      </div>
    </div>
  );
}
