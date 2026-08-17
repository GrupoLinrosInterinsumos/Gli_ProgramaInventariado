import type { DefaultSession } from "next-auth";

type Rol = "OPERADOR" | "SUPERVISOR";

// next-auth's own "next-auth"/"next-auth/jwt" entry points just re-export
// (`export *`) from @auth/core, so the interfaces TypeScript actually needs
// to merge with live in @auth/core/types and @auth/core/jwt.
declare module "@auth/core/types" {
  interface Session {
    user: {
      id: string;
      rol: Rol;
    } & DefaultSession["user"];
  }

  interface User {
    rol: Rol;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    rol: Rol;
  }
}
