-- CreateEnum
CREATE TYPE "TipoRespaldo" AS ENUM ('EXCEL', 'PDF');

-- CreateTable
CREATE TABLE "RespaldoLog" (
    "id" TEXT NOT NULL,
    "sesionId" TEXT NOT NULL,
    "tipo" "TipoRespaldo" NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RespaldoLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RespaldoLog_sesionId_createdAt_idx" ON "RespaldoLog"("sesionId", "createdAt");

-- AddForeignKey
ALTER TABLE "RespaldoLog" ADD CONSTRAINT "RespaldoLog_sesionId_fkey" FOREIGN KEY ("sesionId") REFERENCES "ConteoSesion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RespaldoLog" ADD CONSTRAINT "RespaldoLog_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
