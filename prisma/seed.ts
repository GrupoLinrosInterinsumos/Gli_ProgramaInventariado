import bcrypt from "bcryptjs";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { esCorreoCorporativo } from "../lib/auth-domain";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  for (const nombre of ["CRAMER", "SACCO"]) {
    await prisma.almacen.upsert({ where: { nombre }, update: {}, create: { nombre } });
  }

  const email = (process.env.SEED_SUPERVISOR_EMAIL ?? "admin@gli.pe").toLowerCase().trim();
  const nombre = process.env.SEED_SUPERVISOR_NOMBRE ?? "Administrador";
  const password = process.env.SEED_SUPERVISOR_PASSWORD ?? "CambiarAhora123";

  if (!esCorreoCorporativo(email)) {
    throw new Error(`SEED_SUPERVISOR_EMAIL debe terminar en @gli.pe (recibido: ${email})`);
  }

  const existente = await prisma.usuario.findUnique({ where: { email } });
  if (!existente) {
    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.usuario.create({
      data: { nombre, email, passwordHash, rol: "SUPERVISOR" },
    });
    console.log(`Usuario supervisor creado: ${email} / contraseña: ${password} (cámbiala después de entrar)`);
  } else {
    console.log(`Usuario supervisor ya existía: ${email}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
