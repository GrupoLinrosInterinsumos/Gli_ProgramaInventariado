"use client";

import { useActionState, useEffect, useState } from "react";
import { Button } from "@/app/components/ui/button";
import { IconArrowRight, IconEye, IconEyeOff, IconLock, IconUser } from "@/app/components/ui/icons";
import { loginAction, type LoginState } from "./actions";

const REMEMBER_KEY = "inventariado-gli:usuario-recordado";

export function LoginForm() {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(loginAction, undefined);
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [email, setEmail] = useState("");
  const [showForgot, setShowForgot] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(REMEMBER_KEY);
    if (saved) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEmail(saved);
      setRemember(true);
    }
  }, []);

  function handleSubmit() {
    if (remember) {
      window.localStorage.setItem(REMEMBER_KEY, email);
    } else {
      window.localStorage.removeItem(REMEMBER_KEY);
    }
  }

  return (
    <form action={formAction} onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-label-md uppercase tracking-wide text-on-surface-variant">
          Usuario o correo electrónico
        </label>
        <div className="relative mt-1.5">
          <IconUser size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nombre@gli.pe"
            className="w-full rounded-md border border-outline-variant bg-surface-container-lowest py-2.5 pl-10 pr-3 text-sm shadow-sm transition-colors placeholder:text-on-surface-variant/60 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      <div>
        <label htmlFor="password" className="block text-label-md uppercase tracking-wide text-on-surface-variant">
          Contraseña
        </label>
        <div className="relative mt-1.5">
          <IconLock size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            autoComplete="current-password"
            className="w-full rounded-md border border-outline-variant bg-surface-container-lowest py-2.5 pl-10 pr-10 text-sm shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded text-on-surface-variant transition-colors hover:text-on-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            {showPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <label className="flex items-center gap-2 text-on-surface-variant">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary"
          />
          Recordar credenciales
        </label>
        <button
          type="button"
          onClick={() => setShowForgot((v) => !v)}
          className="font-medium text-primary transition-colors hover:text-primary-container"
        >
          ¿Olvidó su contraseña?
        </button>
      </div>

      {showForgot ? (
        <p className="rounded-md bg-surface-container-low px-3 py-2 text-sm text-on-surface-variant">
          Pide a un supervisor que restablezca tu contraseña desde Usuarios.
        </p>
      ) : null}

      {state?.error ? (
        <p className="rounded-md bg-error-container px-3 py-2 text-sm text-on-error-container">{state.error}</p>
      ) : null}

      <Button type="submit" loading={pending} className="w-full">
        {pending ? "Ingresando..." : (
          <>
            Ingresar
            <IconArrowRight size={16} />
          </>
        )}
      </Button>
    </form>
  );
}
