import type { ReactNode } from "react";

type Variant = "success" | "warning" | "danger" | "info" | "neutral";

const VARIANTS: Record<Variant, string> = {
  success: "bg-green-50 text-green-700",
  warning: "bg-amber-100 text-amber-800",
  danger: "bg-error-container text-on-error-container",
  info: "bg-primary-fixed text-on-primary-fixed",
  neutral: "bg-surface-container text-on-surface-variant",
};

export function Badge({
  variant = "neutral",
  icon,
  children,
}: {
  variant?: Variant;
  icon?: ReactNode;
  children: ReactNode;
}) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-chip px-2 py-0.5 text-xs font-medium ${VARIANTS[variant]}`}>
      {icon}
      {children}
    </span>
  );
}
