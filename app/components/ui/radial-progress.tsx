const TONE_COLOR: Record<string, string> = {
  primary: "var(--color-primary)",
  warning: "#f59e0b",
  success: "#16a34a",
  danger: "var(--color-error)",
};

export function RadialProgress({
  pct,
  tone = "primary",
  size = 72,
}: {
  pct: number;
  tone?: "primary" | "warning" | "success" | "danger";
  size?: number;
}) {
  const stroke = 7;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, pct));
  const offset = c - (clamped / 100) * c;
  const color = TONE_COLOR[tone];

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-surface-container-highest)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.3s" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-on-surface">
        {Math.round(pct)}%
      </div>
    </div>
  );
}
