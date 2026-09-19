import { and, eq } from "drizzle-orm";

import { db, dbWriter } from "@/db";
import { leads, properties } from "@/db/schema";

/** Origen del lead, tal como lo declara el formulario público. */
export type LeadSource = "WEB" | "WHATSAPP" | "PHONE" | "OTHER";

/** Datos de un lead ya validados por el endpoint (servidor). */
export type LeadInput = {
  propertyId?: number;
  name: string;
  phone: string;
  email?: string;
  message?: string;
  source: LeadSource;
};

/** Lead persistido: solo los campos que genera o confirma el servidor. */
export type CreatedLead = Pick<
  typeof leads.$inferSelect,
  "id" | "propertyId" | "status" | "createdAt"
>;

/**
 * ¿Existe una propiedad **publicada** con ese identificador?
 *
 * La comprobación usa el mismo criterio que el catálogo público (`status = 'PUBLISHED'`): la captura
 * nace en el catálogo, así que aceptar un identificador de inventario interno (borrador o archivado)
 * dejaría al endpoint público referenciando propiedades que nadie puede ver. Se resuelve con una
 * lectura y sin `SELECT *`: el endpoint solo necesita saber si existe.
 */
export async function isPublishedProperty(propertyId: number): Promise<boolean> {
  const rows = await db
    .select({ id: properties.id })
    .from(properties)
    .where(and(eq(properties.id, propertyId), eq(properties.status, "PUBLISHED")))
    .limit(1);

  return rows.length > 0;
}

/**
 * Persiste un lead con **exactamente un** `INSERT` y devuelve lo que generó PostgreSQL.
 *
 * `status`, `createdAt` y `agentId` no se envían: los pone la base (`NEW`, `now()`, `NULL`). El
 * `returning` trae los identificadores y sellos que el servidor sí conoce, que es lo que convierte la
 * respuesta en evidencia de una escritura real.
 *
 * @param input Datos validados por el endpoint.
 * @returns El lead persistido.
 * @throws Error si la inserción no devuelve la fila creada (no debería ocurrir: `INSERT` con
 *     `RETURNING` siempre devuelve una).
 */
export async function createLead(input: LeadInput): Promise<CreatedLead> {
  const [lead] = await dbWriter
    .insert(leads)
    .values({
      propertyId: input.propertyId ?? null,
      name: input.name,
      phone: input.phone,
      email: normalizeOptionalText(input.email),
      message: normalizeOptionalText(input.message),
      source: input.source,
    })
    .returning({
      id: leads.id,
      propertyId: leads.propertyId,
      status: leads.status,
      createdAt: leads.createdAt,
    });

  if (!lead) {
    throw new Error("la inserción del lead no devolvió ninguna fila");
  }
  return lead;
}

/** Convierte `""` (y solo espacios) en `null`: una cadena vacía no es un dato, es ausencia de dato. */
function normalizeOptionalText(value?: string): string | null {
  const text = (value ?? "").trim();
  return text === "" ? null : text;
}
