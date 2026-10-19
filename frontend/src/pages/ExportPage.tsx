import { useState } from "react";
import { Download, Loader2, FileSpreadsheet, CheckCircle2, AlertCircle } from "lucide-react";
import { downloadForecastCSV } from "../lib/api";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

const SAMPLE_COLUMNS = [
  { name: "City", type: "String", sample: "Mumbai" },
  { name: "State", type: "String", sample: "Maharashtra" },
  { name: "Country", type: "String", sample: "United Kingdom" },
  { name: "Date Time", type: "ISO DateTime", sample: "2026-10-19 12:00:00" },
  { name: "Temperature (°C)", type: "Float", sample: "29.1" },
  { name: "Feels Like (°C)", type: "Float", sample: "34.4" },
  { name: "Min Temp (°C)", type: "Float", sample: "28.5" },
  { name: "Max Temp (°C)", type: "Float", sample: "30.2" },
  { name: "Humidity (%)", type: "Integer", sample: "77" },
  { name: "Precipitation Probability (%)", type: "Integer (0-100)", sample: "25" },
  { name: "Weather Condition", type: "String", sample: "broken clouds" },
  { name: "Wind Speed (m/s)", type: "Float", sample: "1.8" },
  { name: "Cloud Cover (%)", type: "Integer", sample: "66" },
  { name: "Pressure (hPa)", type: "Integer", sample: "1012" },
];

export default function ExportPage() {
  const [city, setCity] = useState("Mumbai");
  const [days, setDays] = useState(5);
  const [exporting, setExporting] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!city.trim()) {
      setStatus({ type: "error", message: "Please enter a valid city name." });
      return;
    }

    setExporting(true);
    setStatus(null);

    try {
      await downloadForecastCSV(city.trim(), days);
      setStatus({
        type: "success",
        message: `Successfully generated and downloaded ${days}-day CSV for ${city.trim()}!`,
      });
    } catch (err) {
      setStatus({
        type: "error",
        message: err instanceof Error ? err.message : "Failed to export CSV.",
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="py-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <span className="eyebrow">Enterprise Data Hub</span>
        <h1 className="hero-title text-3xl md:text-4xl">
          Meteorological <em>Data Export</em>
        </h1>
        <p className="hero-subtitle mb-0">
          Generate RFC 4180-compliant CSV files with 3-hour timestamped telemetry for any city worldwide.
        </p>
      </div>

      {/* Export Configuration Form */}
      <Card className="linen-card p-6 md:p-8 mb-8">
        <form onSubmit={handleDownload}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="export-city" className="block text-xs font-bold text-[var(--color-stone-muted)] uppercase mb-1">
                Target City
              </Label>
              <Input
                id="export-city"
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="e.g. Bengaluru, Jaipur, Kochi"
                className="w-full h-11 px-3.5 bg-[var(--color-linen-base)] border border-[var(--color-linen-border-strong)] rounded-lg text-sm text-[var(--color-stone-ink)] font-semibold focus:outline-none focus:border-[var(--color-stone-ink)]"
              />
            </div>

            <div>
              <Label htmlFor="export-duration" className="block text-xs font-bold text-[var(--color-stone-muted)] uppercase mb-1">
                Forecast Duration
              </Label>
              <Select value={String(days)} onValueChange={(value) => setDays(Number(value))}>
                <SelectTrigger id="export-duration" className="w-full h-11 bg-[var(--color-linen-base)] border-[var(--color-linen-border-strong)] text-[var(--color-stone-ink)] font-semibold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Day (8 readings)</SelectItem>
                  <SelectItem value="2">2 Days (16 readings)</SelectItem>
                  <SelectItem value="3">3 Days (24 readings)</SelectItem>
                  <SelectItem value="4">4 Days (32 readings)</SelectItem>
                  <SelectItem value="5">5 Days (40 readings)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {status && (
            <div
              className={`mt-4 p-3 rounded-lg text-xs font-semibold flex items-center gap-2 ${
                status.type === "success"
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : "bg-rose-50 text-rose-800 border border-rose-200"
              }`}
            >
              {status.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              <span>{status.message}</span>
            </div>
          )}

          <div className="mt-6 flex items-center justify-between flex-wrap gap-3 pt-4 border-t border-[var(--color-linen-border)]">
            <div className="flex items-center gap-2 text-xs text-[var(--color-stone-muted)]">
              <FileSpreadsheet size={16} className="text-[var(--color-terracotta)]" />
              <span>Standard RFC-4180 CSV with UTF-8 encoding</span>
            </div>

            <Button
              type="submit"
              disabled={exporting}
              className="px-6 h-11 bg-[var(--color-stone-ink)] hover:bg-[var(--color-terracotta)] text-[var(--color-linen-base)] text-xs font-bold rounded-lg transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {exporting ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
              <span>{exporting ? "Compiling CSV..." : "Generate & Download CSV"}</span>
            </Button>
          </div>
        </form>
      </Card>

      {/* CSV Schema & Field Dictionary */}
      <Card className="linen-card p-6 md:p-8">
        <div className="mb-4">
          <span className="eyebrow">Data Dictionary</span>
          <h2 className="text-lg font-bold text-[var(--color-stone-ink)]">Exported CSV Schema Columns</h2>
          <p className="text-xs text-[var(--color-stone-muted)] mt-1">
            Every row corresponds to a single 3-hour timestamped observation and model forecast.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[var(--color-linen-border-strong)] text-[var(--color-stone-muted)] uppercase tracking-wider font-bold">
                <th className="py-2.5 px-3">Column Header</th>
                <th className="py-2.5 px-3">Data Type</th>
                <th className="py-2.5 px-3">Example Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-linen-border)]">
              {SAMPLE_COLUMNS.map((col) => (
                <tr key={col.name} className="hover:bg-[var(--color-linen-base)]">
                  <td className="py-2.5 px-3 font-semibold text-[var(--color-stone-ink)] font-mono">{col.name}</td>
                  <td className="py-2.5 px-3 text-[var(--color-stone-muted)]">{col.type}</td>
                  <td className="py-2.5 px-3 text-[var(--color-stone-body)] font-mono">{col.sample}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
