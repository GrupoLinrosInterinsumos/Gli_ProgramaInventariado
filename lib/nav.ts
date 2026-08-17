export type Rol = "OPERADOR" | "SUPERVISOR";

export type NavIcon = "conteo" | "dashboard" | "usuarios";

export const NAV_ITEMS: { href: string; label: string; roles: Rol[]; icon: NavIcon }[] = [
  { href: "/conteo", label: "Conteo", roles: ["OPERADOR", "SUPERVISOR"], icon: "conteo" },
  { href: "/dashboard", label: "Dashboard", roles: ["OPERADOR", "SUPERVISOR"], icon: "dashboard" },
  { href: "/usuarios", label: "Usuarios", roles: ["SUPERVISOR"], icon: "usuarios" },
];
