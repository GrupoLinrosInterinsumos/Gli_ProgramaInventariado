export const ALLOWED_EMAIL_DOMAIN = "gli.pe";

export function esCorreoCorporativo(email: string) {
  return email.toLowerCase().trim().endsWith(`@${ALLOWED_EMAIL_DOMAIN}`);
}
