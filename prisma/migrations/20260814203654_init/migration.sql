-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('OPERADOR', 'SUPERVISOR');

-- CreateEnum
CREATE TYPE "EstadoConteoSesion" AS ENUM ('ABIERTA', 'CERRADA');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "rol" "Rol" NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Almacen" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Almacen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Producto" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "presentacion" TEXT NOT NULL,
    "pesoKg" DOUBLE PRECISION,
    "almacenId" TEXT NOT NULL,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Producto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lote" (
    "id" TEXT NOT NULL,
    "productoId" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "fProduccion" TIMESTAMP(3) NOT NULL,
    "fVencimiento" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Lote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConteoSesion" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "almacenId" TEXT NOT NULL,
    "estado" "EstadoConteoSesion" NOT NULL DEFAULT 'ABIERTA',
    "creadoPorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cerradoAt" TIMESTAMP(3),

    CONSTRAINT "ConteoSesion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StockPrevio" (
    "id" TEXT NOT NULL,
    "sesionId" TEXT NOT NULL,
    "productoId" TEXT NOT NULL,
    "loteId" TEXT,
    "cantidad" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StockPrevio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConteoLinea" (
    "id" TEXT NOT NULL,
    "sesionId" TEXT NOT NULL,
    "productoId" TEXT NOT NULL,
    "presentacion" TEXT NOT NULL,
    "pesoKg" DOUBLE PRECISION NOT NULL,
    "unidades" DOUBLE PRECISION NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "loteId" TEXT NOT NULL,
    "loteCodigo" TEXT NOT NULL,
    "fProduccion" TIMESTAMP(3) NOT NULL,
    "fVencimiento" TIMESTAMP(3) NOT NULL,
    "ubicacion" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConteoLinea_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Almacen_nombre_key" ON "Almacen"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Producto_codigo_key" ON "Producto"("codigo");

-- CreateIndex
CREATE INDEX "Producto_almacenId_idx" ON "Producto"("almacenId");

-- CreateIndex
CREATE UNIQUE INDEX "Lote_productoId_codigo_key" ON "Lote"("productoId", "codigo");

-- CreateIndex
CREATE INDEX "StockPrevio_sesionId_productoId_idx" ON "StockPrevio"("sesionId", "productoId");

-- CreateIndex
CREATE UNIQUE INDEX "StockPrevio_sesionId_productoId_loteId_key" ON "StockPrevio"("sesionId", "productoId", "loteId");

-- CreateIndex
CREATE INDEX "ConteoLinea_sesionId_productoId_idx" ON "ConteoLinea"("sesionId", "productoId");

-- AddForeignKey
ALTER TABLE "Producto" ADD CONSTRAINT "Producto_almacenId_fkey" FOREIGN KEY ("almacenId") REFERENCES "Almacen"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lote" ADD CONSTRAINT "Lote_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConteoSesion" ADD CONSTRAINT "ConteoSesion_almacenId_fkey" FOREIGN KEY ("almacenId") REFERENCES "Almacen"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConteoSesion" ADD CONSTRAINT "ConteoSesion_creadoPorId_fkey" FOREIGN KEY ("creadoPorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockPrevio" ADD CONSTRAINT "StockPrevio_sesionId_fkey" FOREIGN KEY ("sesionId") REFERENCES "ConteoSesion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockPrevio" ADD CONSTRAINT "StockPrevio_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StockPrevio" ADD CONSTRAINT "StockPrevio_loteId_fkey" FOREIGN KEY ("loteId") REFERENCES "Lote"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConteoLinea" ADD CONSTRAINT "ConteoLinea_sesionId_fkey" FOREIGN KEY ("sesionId") REFERENCES "ConteoSesion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConteoLinea" ADD CONSTRAINT "ConteoLinea_productoId_fkey" FOREIGN KEY ("productoId") REFERENCES "Producto"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConteoLinea" ADD CONSTRAINT "ConteoLinea_loteId_fkey" FOREIGN KEY ("loteId") REFERENCES "Lote"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConteoLinea" ADD CONSTRAINT "ConteoLinea_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
