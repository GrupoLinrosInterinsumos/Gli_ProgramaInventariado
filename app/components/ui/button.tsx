import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "danger" | "outline" | "ghost";
type Size = "sm" | "md";

const BASE =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-md font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-primary text-on-primary shadow-sm hover:bg-primary-container",
  danger: "bg-secondary text-on-secondary shadow-sm hover:bg-secondary-container",
  outline:
    "border border-outline-variant bg-surface-container-lowest text-on-surface hover:bg-surface-container-low",
  ghost: "text-on-surface-variant hover:bg-surface-container-low",
};

const SIZES: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2 text-sm",
};

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  className = "",
  children,
  ...rest
}: Props) {
  return (
    <button
      disabled={disabled || loading}
      className={`${BASE} ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...rest}
    >
      {loading ? (
        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
        </svg>
      ) : null}
      {children}
    </button>
  );
}
