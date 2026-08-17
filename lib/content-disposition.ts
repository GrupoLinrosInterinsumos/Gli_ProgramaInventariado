/**
 * HTTP headers must be Latin-1 (ByteString). Nombres de sesión con guiones
 * largos, tildes fuera de rango, etc. rompían la descarga con
 * "Cannot convert argument to a ByteString". Se manda un filename ASCII de
 * respaldo + filename* codificado en UTF-8 (RFC 5987) para navegadores modernos.
 */
export function contentDisposition(disposition: "attachment" | "inline", filename: string) {
  const ascii = filename.replace(/[^\x20-\x7e]/g, "_");
  return `${disposition}; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(filename)}`;
}
