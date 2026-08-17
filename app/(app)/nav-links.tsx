"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavIcon } from "@/lib/nav";
import { IconChartBar, IconClipboardCheck, IconUsers } from "@/app/components/ui/icons";

const ICONS: Record<NavIcon, typeof IconClipboardCheck> = {
  conteo: IconClipboardCheck,
  dashboard: IconChartBar,
  usuarios: IconUsers,
};

export function NavLinks({ items }: { items: { href: string; label: string; icon: NavIcon }[] }) {
  const pathname = usePathname();

  return (
    <>
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = ICONS[item.icon];
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
              active
                ? "bg-primary-fixed text-on-primary-fixed"
                : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
            }`}
          >
            <Icon size={18} />
            {item.label}
          </Link>
        );
      })}
    </>
  );
}
