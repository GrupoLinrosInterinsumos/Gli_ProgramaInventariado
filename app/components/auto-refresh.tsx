"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Refresca los datos del servidor (RSC) cada `intervalMs` sin recargar la
 * página ni perder el estado de los formularios en pantalla — así los 7
 * dispositivos ven lo que agregan los demás sin tocar nada.
 */
export function AutoRefresh({ intervalMs = 4000 }: { intervalMs?: number }) {
  const router = useRouter();

  useEffect(() => {
    const id = setInterval(() => {
      if (document.visibilityState === "visible") {
        router.refresh();
      }
    }, intervalMs);
    return () => clearInterval(id);
  }, [router, intervalMs]);

  return null;
}
