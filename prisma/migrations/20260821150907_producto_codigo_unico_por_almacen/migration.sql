-- El código de producto pasa a ser único por almacén, no global: el mismo
-- SKU puede existir en más de un almacén como registros de Producto distintos.
DROP INDEX "Producto_codigo_key";

CREATE UNIQUE INDEX "Producto_codigo_almacenId_key" ON "Producto"("codigo", "almacenId");
