import { Logo } from "@/app/logo";
import { IconShield } from "@/app/components/ui/icons";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen">
      <div className="relative hidden w-1/2 overflow-hidden bg-primary lg:flex lg:flex-col lg:justify-between lg:p-10">
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.12]"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          <defs>
            <pattern id="rack" width="72" height="72" patternUnits="userSpaceOnUse">
              <rect x="4" y="4" width="28" height="28" fill="none" stroke="white" strokeWidth="2" />
              <rect x="40" y="4" width="28" height="28" fill="none" stroke="white" strokeWidth="2" />
              <rect x="4" y="40" width="28" height="28" fill="none" stroke="white" strokeWidth="2" />
              <rect x="40" y="40" width="28" height="28" fill="none" stroke="white" strokeWidth="2" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#rack)" />
        </svg>
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/60 to-primary/20" />

        <div className="relative z-10 w-fit rounded-lg bg-white p-3">
          <Logo className="h-9 w-auto" />
        </div>

        <div className="relative z-10 text-white">
          <h2 className="text-headline-xl">
            Conteo en
            <br />
            Tiempo Real.
          </h2>
          <p className="mt-4 max-w-md text-body-lg text-white/80">
            Inventariado físico de almacén. Cada dispositivo sincronizado al instante, sin perder ni un conteo.
          </p>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center bg-background px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-6 lg:hidden">
            <Logo className="h-10 w-auto" />
          </div>

          <h1 className="text-headline-md text-on-surface">Acceso al Sistema</h1>
          <p className="mt-1 text-body-sm text-on-surface-variant">
            Ingrese sus credenciales operativas para continuar.
          </p>

          <div className="mt-6">
            <LoginForm />
          </div>

          <div className="mt-6 flex items-center justify-center gap-1.5 border-t border-outline-variant pt-4 text-xs text-on-surface-variant">
            <IconShield size={14} className="text-secondary" />
            Conexión segura · Inventariado GLI
          </div>
        </div>
      </div>
    </main>
  );
}
