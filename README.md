# Inventariado - Almacén GLI

Programa independiente para el conteo físico de inventario en tiempo real (7 dispositivos), comparado contra un stock previo cargado por Excel. No comparte código ni base de datos con la app "Almacén GLI".

## Requisitos

- Node.js 20.9+
- Una base de datos Postgres (hoy: la de Render)

## Configuración

1. Copia tus variables a `.env` (ya incluido, no se sube a git):
   - `DATABASE_URL`: cadena de conexión Postgres.
   - `AUTH_SECRET`: secreto de sesión (ya generado).
   - `ALLOWED_EMAIL_DOMAIN`: dominio de correo permitido (`gli.pe`).
   - `SEED_SUPERVISOR_*`: datos del primer usuario supervisor (solo se usan al correr el seed).

2. Instala dependencias y aplica el esquema:

   ```bash
   npm install
   npx prisma migrate dev
   npx tsx --env-file=.env prisma/seed.ts
   ```

   El seed crea los almacenes AQP/BSF/TRU/YAN y el primer usuario supervisor.

3. Arranca en desarrollo:

   ```bash
   npm run dev
   ```

## Flujo de uso

1. Un supervisor inicia sesión y va a **Conteo → Iniciar nuevo conteo**, sube el Excel de carga previa (productos, lotes y stock previo) y elige el almacén.
2. Los 7 dispositivos entran a esa sesión y van agregando líneas contadas (producto, presentación, peso, unidades, lote, ubicación).
3. El **Dashboard** muestra el avance por producto y por lote contra el stock previo, con alertas al llegar o pasar el 100%.
4. Se puede exportar a Excel y PDF en cualquier momento, y cerrar la sesión cuando termina el inventariado.

### Formato del Excel de carga previa

Primera fila = encabezados, exactamente así:

| Codigo | Producto | Presentacion | Peso_kg | Lote | F_Produccion | F_Vencimiento | Cantidad_Stock |
|---|---|---|---|---|---|---|---|

`Codigo` es opcional: si no viene (o viene vacía) y `Producto` trae el código entre corchetes al inicio
(ej. `[ACEK1-160-025] Acesulfame K Foture x 25kg`), se extrae automáticamente. `Lote` y las fechas son
opcionales por fila (si se dejan vacías, el stock previo queda a nivel de producto). `Cantidad_Stock` es
obligatorio.

## Pendiente

El despliegue en Render (Fase 8 del plan) todavía no se ha hecho — este proyecto corre localmente por ahora.
