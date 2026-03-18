interface StatusBarProps {
  loading: boolean;
  error: string | null;
  total: number;
  geoStatus: string | null;
  hasLocation: boolean;
}

export default function StatusBar({
  loading,
  error,
  total,
  geoStatus,
  hasLocation,
}: StatusBarProps) {
  if (loading) {
    return (
      <div className="flex items-center gap-2 text-slate-200/82 text-sm py-2">
        <span className="inline-block w-4 h-4 border-2 border-teal-300 border-t-transparent rounded-full animate-spin" />
        Loading stations…
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-2 text-rose-100 text-sm py-2 bg-rose-500/10 border border-rose-300/18 rounded-xl px-4 backdrop-blur-md">
        <span>⚠️</span>
        {error}
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
      <span className="text-slate-200/90">
        <span className="text-teal-100 font-semibold">{total}</span>{" "}
        station{total !== 1 ? "s" : ""} found
      </span>
      {hasLocation && (
        <span className="text-emerald-300 flex items-center gap-1">
          <span>✓</span> Sorted by distance
        </span>
      )}
      {geoStatus && !hasLocation && (
        <span className="text-amber-300 flex items-center gap-1">
          <span>ℹ️</span> {geoStatus}
        </span>
      )}
    </div>
  );
}
