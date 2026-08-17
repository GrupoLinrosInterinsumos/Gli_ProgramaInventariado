"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/app/components/ui/button";
import { cerrarSesionAction } from "../actions";

export function CerrarSesionButton({ sesionId }: { sesionId: string }) {
  const [confirmando, setConfirmando] = useState(false);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  if (confirmando) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-on-surface-variant">¿Cerrar este conteo?</span>
        <Button
          variant="danger"
          size="sm"
          loading={pending}
          onClick={() =>
            startTransition(async () => {
              await cerrarSesionAction(sesionId);
              router.refresh();
            })
          }
        >
          Sí, cerrar
        </Button>
        <Button variant="ghost" size="sm" onClick={() => setConfirmando(false)}>
          Cancelar
        </Button>
      </div>
    );
  }

  return (
    <Button variant="outline" onClick={() => setConfirmando(true)}>
      Cerrar conteo
    </Button>
  );
}
