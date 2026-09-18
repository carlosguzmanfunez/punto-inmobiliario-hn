import { and, asc, eq, lte, sql } from "drizzle-orm";

import { db } from "@/db";
import {
  departments,
  municipalities,
  properties,
  propertyMedia,
  propertyTypes,
} from "@/db/schema";
import type { Property } from "@/lib/types";

/** Operación soportada por el modelo de datos. */
export type PropertyOperation = "SALE" | "RENT";

/** Filtros del listado público, ya traducidos desde la URL por la página. */
export type PropertyFilters = {
  department?: string;
  city?: string;
  operation?: PropertyOperation;
  type?: string;
  maxPrice?: number;
};

/**
 * Portada de la propiedad como subconsulta escalar.
 *
 * Se resuelve con una subconsulta y no con un `left join` para que una propiedad con más de un
 * medio marcado como portada no duplique filas en el listado: se toma el de menor `sort_order`.
 */
const coverImage = sql<string | null>`(
  select ${propertyMedia.url}
  from ${propertyMedia}
  where ${propertyMedia.propertyId} = ${properties.id}
    and ${propertyMedia.isCover} = true
  order by ${propertyMedia.sortOrder}
  limit 1
)`;

const selection = {
  id: properties.id,
  code: properties.code,
  slug: properties.slug,
  title: properties.title,
  summary: properties.summary,
  operation: properties.operation,
  price: properties.price,
  currency: properties.currency,
  bedrooms: properties.bedrooms,
  bathrooms: properties.bathrooms,
  parkingSpaces: properties.parkingSpaces,
  constructionAreaM2: properties.constructionAreaM2,
  landAreaM2: properties.landAreaM2,
  featured: properties.featured,
  propertyType: propertyTypes.name,
  department: departments.name,
  city: municipalities.name,
  image: coverImage,
};

/** Fila tal como sale de la consulta, antes de mapearla al tipo público `Property`. */
type PropertyRow = {
  id: number;
  code: string;
  slug: string;
  title: string;
  summary: string | null;
  operation: "SALE" | "RENT";
  price: string;
  currency: string;
  bedrooms: string | null;
  bathrooms: string | null;
  parkingSpaces: number | null;
  constructionAreaM2: string | null;
  landAreaM2: string | null;
  featured: boolean;
  propertyType: string;
  department: string;
  city: string | null;
  image: string | null;
};

/**
 * Traduce una fila de PostgreSQL al tipo público que ya consumen los componentes.
 *
 * Las columnas `numeric` llegan como texto y aquí se convierten a número; `featuredLabel` se deriva
 * de `featured` porque el esquema aprobado no tiene una columna de etiqueta (no se modifica el
 * esquema en este piloto).
 */
function toProperty(row: PropertyRow): Property {
  return {
    id: String(row.id),
    code: row.code,
    slug: row.slug,
    title: row.title,
    operation: row.operation,
    type: row.propertyType,
    price: Number(row.price),
    currency: row.currency === "USD" ? "USD" : "HNL",
    city: row.city ?? "",
    department: row.department,
    bedrooms: row.bedrooms === null ? undefined : Number(row.bedrooms),
    bathrooms: row.bathrooms === null ? undefined : Number(row.bathrooms),
    parking: row.parkingSpaces ?? undefined,
    constructionAreaM2:
      row.constructionAreaM2 === null ? undefined : Number(row.constructionAreaM2),
    landAreaM2: row.landAreaM2 === null ? undefined : Number(row.landAreaM2),
    featuredLabel: row.featured ? "Destacada" : undefined,
    image: row.image ?? "",
    summary: row.summary ?? "",
  };
}

/**
 * Inventario público: sólo propiedades publicadas, con su tipo, su ubicación y su portada.
 *
 * Los filtros son los mismos que ya ofrecía la página (departamento, ciudad, operación, tipo y
 * precio máximo); ninguna condición se aplica si el filtro viene vacío.
 */
export async function getProperties(filters: PropertyFilters = {}): Promise<Property[]> {
  const conditions = [eq(properties.status, "PUBLISHED")];

  if (filters.department) {
    conditions.push(eq(departments.name, filters.department));
  }
  if (filters.city) {
    conditions.push(eq(municipalities.name, filters.city));
  }
  if (filters.operation) {
    conditions.push(eq(properties.operation, filters.operation));
  }
  if (filters.type) {
    conditions.push(eq(propertyTypes.name, filters.type));
  }
  if (filters.maxPrice !== undefined && Number.isFinite(filters.maxPrice)) {
    conditions.push(lte(properties.price, String(filters.maxPrice)));
  }

  const rows = (await db
    .select(selection)
    .from(properties)
    .innerJoin(propertyTypes, eq(properties.propertyTypeId, propertyTypes.id))
    .innerJoin(departments, eq(properties.departmentId, departments.id))
    .leftJoin(municipalities, eq(properties.municipalityId, municipalities.id))
    .where(and(...conditions))
    .orderBy(asc(properties.id))) as PropertyRow[];

  return rows.map(toProperty);
}

/** Ficha individual por slug. Devuelve `undefined` si no existe, para conservar el 404. */
export async function getPropertyBySlug(slug: string): Promise<Property | undefined> {
  const rows = (await db
    .select(selection)
    .from(properties)
    .innerJoin(propertyTypes, eq(properties.propertyTypeId, propertyTypes.id))
    .innerJoin(departments, eq(properties.departmentId, departments.id))
    .leftJoin(municipalities, eq(properties.municipalityId, municipalities.id))
    .where(and(eq(properties.status, "PUBLISHED"), eq(properties.slug, slug)))
    .limit(1)) as PropertyRow[];

  const [row] = rows;
  return row ? toProperty(row) : undefined;
}
