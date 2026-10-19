import { useState } from "react";
import { Download, Loader2, FileSpreadsheet } from "lucide-react";
import { downloadForecastCSV } from "../../lib/api";

interface ExportCardProps {
  cityName: string;
  onSuccess?: (msg: string) => void;
  onError?: (err: string) => void;
}

export default function ExportCard({ cityName, onSuccess, onError }: ExportCardProps) {
  const [days, setDays] = useState(5);
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    if (!cityName) return;
    setExporting(true);
    try {
      await downloadForecastCSV(cityName, days);
      onSuccess?.(`${days}-day forecast CSV for ${cityName} downloaded successfully!`);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to download CSV.";
      onError?.(msg);
    } finally {
      setExporting(false);
    }
  };

  return (
    <section className="export-card mb-8" aria-labelledby="export-heading">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-[var(--color-linen-base)] border border-[var(--color-linen-border)] rounded-xl text-[var(--color-terracotta)] hidden sm:block">
          <FileSpreadsheet size={24} />
        </div>
        <div>
          <span className="eyebrow">Structured CSV Export</span>
          <h3 id="export-heading" className="export-info-title">
            Export {cityName} Forecast Telemetry
          </h3>
          <p className="export-info-text">
            Download 3-hour timestamped observations, temperature ranges, humidity, wind velocities,
            and precipitation percentages.
          </p>
        </div>
      </div>

      <div className="export-control-group">
        <label
          htmlFor="export-days-select"
          className="text-xs font-bold uppercase text-[var(--color-stone-muted)]"
        >
          Timeframe:
        </label>
        <select
          id="export-days-select"
          className="export-select"
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
        >
          <option value={1}>1 Day (Next 24h)</option>
          <option value={2}>2 Days (48h)</option>
          <option value={3}>3 Days (72h)</option>
          <option value={4}>4 Days (96h)</option>
          <option value={5}>5 Days (Complete)</option>
        </select>

        <button
          type="button"
          className="export-btn"
          onClick={handleExport}
          disabled={exporting}
        >
          {exporting ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Download size={16} />
          )}
          <span>{exporting ? "Generating..." : "Download CSV"}</span>
        </button>
      </div>
    </section>
  );
}
