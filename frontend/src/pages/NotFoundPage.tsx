import { Link } from "react-router-dom";
import { Compass, ArrowLeft } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="py-24 text-center max-w-md mx-auto">
      <div className="w-16 h-16 rounded-2xl bg-[var(--color-linen-panel)] border border-[var(--color-linen-border)] text-[var(--color-terracotta)] flex items-center justify-center mx-auto mb-5 shadow-sm">
        <Compass size={32} />
      </div>

      <span className="eyebrow">404 Error</span>
      <h1 className="text-3xl font-bold text-[var(--color-stone-ink)] mb-3">
        Lost in the Clouds
      </h1>
      <p className="text-sm text-[var(--color-stone-muted)] mb-8 leading-relaxed">
        The weather station or page you are searching for does not exist or has drifted away.
      </p>

      <Link
        to="/"
        className="px-5 py-2.5 bg-[var(--color-stone-ink)] hover:bg-[var(--color-terracotta)] text-[var(--color-linen-base)] rounded-lg text-xs font-bold inline-flex items-center gap-2 transition-colors"
      >
        <ArrowLeft size={14} />
        <span>Return to Dashboard</span>
      </Link>
    </div>
  );
}
