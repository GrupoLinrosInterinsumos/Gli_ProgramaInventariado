import Link from "next/link";
import type { ReactNode } from "react";

type Variant = "primary" | "outline";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-primary text-on-primary shadow-sm hover:bg-primary-container",
  outline: "border border-outline-variant bg-surface-container-lowest text-on-surface hover:bg-surface-container-low",
};

export function LinkButton({ href, variant = "primary", children }: { href: string; variant?: Variant; children: ReactNode }) {
  return (
    <Link
      href={href}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-colors ${VARIANTS[variant]}`}
    >
      {children}
    </Link>
  );
}
