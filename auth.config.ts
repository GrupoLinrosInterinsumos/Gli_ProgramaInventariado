import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  // Render (y la mayoría de plataformas que no son Vercel) no exponen un host
  // fijo que Auth.js conozca de antemano — sin esto rechaza cualquier dominio
  // con "UntrustedHost". El dominio real ya está fijado por el proxy de Render.
  trustHost: true,
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.rol = (user as { rol: "OPERADOR" | "SUPERVISOR" }).rol;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.rol = token.rol;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
