"use client";

import { useState } from "react";
import type { NavIcon } from "@/lib/nav";
import { Logo } from "@/app/logo";
import { Avatar } from "@/app/components/ui/avatar";
import { IconLogout } from "@/app/components/ui/icons";
import { NavLinks } from "./nav-links";

export function MobileNav({
  items,
  userName,
  rolLabel,
  logoutAction,
}: {
  items: { href: string; label: string; icon: NavIcon }[];
  userName: string;
  rolLabel: string;
  logoutAction: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-outline-variant bg-surface-container-lowest lg:hidden">
      <div className="flex items-center justify-between px-4 py-3">
        <Logo className="h-8 w-auto" />
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label="Abrir menú"
          className="flex h-10 w-10 items-center justify-center rounded-md text-on-surface-variant hover:bg-surface-container-low"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      {open ? (
        <div className="border-t border-outline-variant px-3 py-3">
          <nav className="space-y-1">
            <NavLinks items={items} />
          </nav>

          <div className="mt-3 flex items-center gap-3 border-t border-outline-variant pt-3">
            <Avatar name={userName} />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-on-surface">{userName}</p>
              <p className="text-xs text-on-surface-variant">{rolLabel}</p>
            </div>
            <form action={logoutAction}>
              <button
                type="submit"
                aria-label="Cerrar sesión"
                className="rounded-md p-2 text-on-surface-variant hover:bg-surface-container-low hover:text-secondary"
              >
                <IconLogout size={18} />
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
