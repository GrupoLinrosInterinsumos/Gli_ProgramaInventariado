type Tone = "primary" | "secondary" | "success" | "warning" | "danger";

const FILL: Record<Tone, string> = {
  primary: "bg-primary",
  secondary: "bg-secondary",
  success: "bg-green-600",
  warning: "bg-amber-500",
  danger: "bg-error",
};

export function ProgressBar({
  value,
  max,
  tone = "primary",
  capAt,
}: {
  value: number;
  max: number;
  tone?: Tone;
  /** cap the visual fill at this percent even if value exceeds max (e.g. 100) */
  capAt?: number;
}) {
  const rawPct = max > 0 ? (value / max) * 100 : 0;
  const pct = Math.min(capAt ?? 100, Math.max(0, rawPct));
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(rawPct)}
      aria-valuemin={0}
      aria-valuemax={100}
      className="h-2 w-full overflow-hidden rounded-full bg-surface-container-highest"
    >
      <div className={`h-full rounded-full transition-all ${FILL[tone]}`} style={{ width: `${pct}%` }} />
    </div>
  );
}
