import type { HTMLAttributes } from "react";

type AccentColor = "primary" | "secondary" | "error" | "none";

const ACCENT_BORDER: Record<AccentColor, string> = {
  primary: "border-l-4 border-l-primary",
  secondary: "border-l-4 border-l-secondary",
  error: "border-l-4 border-l-error",
  none: "",
};

type Props = HTMLAttributes<HTMLDivElement> & { accent?: AccentColor };

export function Card({ accent = "none", className = "", children, ...rest }: Props) {
  return (
    <div
      className={`rounded-card border border-outline-variant bg-surface-container-lowest ${ACCENT_BORDER[accent]} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
