import type { ReactNode } from "react";
import { Badge } from "./badge";

type Props = {
  icon?: ReactNode;
  label: string;
  value: ReactNode;
  helper?: string;
  chipLabel?: string;
  chipVariant?: "success" | "warning" | "danger" | "info" | "neutral";
  tone?: "neutral" | "critical";
};

export function KpiCard({ icon, label, value, helper, chipLabel, chipVariant = "neutral", tone = "neutral" }: Props) {
  const critical = tone === "critical";
  return (
    <div
      className={`rounded-card border p-4 ${
        critical ? "border-red-100 bg-red-50" : "border-outline-variant bg-surface-container-lowest"
      }`}
    >
      <div className="flex items-start justify-between">
        {icon ? (
          <span
            className={`flex h-9 w-9 items-center justify-center rounded-md ${
              critical ? "bg-white text-secondary" : "bg-primary-fixed text-primary"
            }`}
          >
            {icon}
          </span>
        ) : (
          <span />
        )}
        {chipLabel ? <Badge variant={chipVariant}>{chipLabel}</Badge> : null}
      </div>

      <p className="mt-3 text-label-md uppercase tracking-wide text-on-surface-variant">{label}</p>
      <p className="mt-1 text-headline-lg text-on-surface">{value}</p>
      {helper ? <p className="mt-1 text-body-sm text-on-surface-variant">{helper}</p> : null}
    </div>
  );
}
