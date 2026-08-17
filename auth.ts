import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/auth.config";

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Correo", type: "email" },
        password: { label: "Contraseña", type: "password" },
      },
      authorize: async (credentials) => {
        const email = credentials?.email;
        const password = credentials?.password;
        if (typeof email !== "string" || typeof password !== "string") {
          return null;
        }

        const usuario = await prisma.usuario.findUnique({ where: { email: email.toLowerCase().trim() } });
        if (!usuario || !usuario.activo) return null;

        const valido = await bcrypt.compare(password, usuario.passwordHash);
        if (!valido) return null;

        return {
          id: usuario.id,
          name: usuario.nombre,
          email: usuario.email,
          rol: usuario.rol,
        };
      },
    }),
  ],
});
