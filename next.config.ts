import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  // El Excel de carga previa puede pesar bastante (archivos reales vistos
  // de hasta ~22MB por formato de Excel aplicado a toda la hoja). El límite
  // por defecto de Server Actions es 1MB.
  experimental: {
    serverActions: {
      bodySizeLimit: "50mb",
    },
  },
};

export default nextConfig;
