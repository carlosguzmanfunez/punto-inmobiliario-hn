export const propertyTypes = [
  { type: "Casa", label: "Casas", icon: "⌂" },
  { type: "Apartamento", label: "Apartamentos", icon: "▦" },
  { type: "Terreno", label: "Terrenos", icon: "⌖" },
  { type: "Local comercial", label: "Locales comerciales", icon: "▣" },
] as const;

export type PropertyTypeName = (typeof propertyTypes)[number]["type"];
