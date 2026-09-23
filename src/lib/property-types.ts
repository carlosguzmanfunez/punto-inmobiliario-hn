export const propertyTypes = [
  { type: "Casa", label: "Casas", icon: "⌂" },
  { type: "Apartamento", label: "Apartamentos", icon: "▦" },
  { type: "Terreno", label: "Terrenos", icon: "⌖" },
  { type: "Local comercial", label: "Locales comerciales", icon: "▣" },
] as const;

export type PropertyTypeName = (typeof propertyTypes)[number]["type"];

/** Valida datos externos (por ejemplo, query params) contra el catálogo canónico. */
export function isPropertyTypeName(value: string): value is PropertyTypeName {
  return propertyTypes.some(({ type }) => type === value);
}
