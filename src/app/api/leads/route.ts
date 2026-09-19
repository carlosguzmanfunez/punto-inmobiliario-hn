import { NextResponse } from "next/server";
import { z } from "zod";

import { createLead, isPublishedProperty } from "@/db/queries/leads";

/**
 * Captura pública de un lead.
 *
 * El recorrido es: validar (Zod, en servidor) → comprobar la propiedad cuando viene → **persistir una
 * sola vez** → responder con lo que generó la base. La validación del navegador es comodidad; la
 * autoridad es este schema, porque nada de lo que llega del cliente se da por bueno.
 */
const leadSchema = z.object({
  propertyId: z.coerce.number().int().positive().optional(),
  name: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(8).max(30),
  email: z.string().trim().email().optional().or(z.literal("")),
  message: z.string().trim().max(1500).optional(),
  source: z.enum(["WEB", "WHATSAPP", "PHONE", "OTHER"]).default("WEB"),
});

/** Rechazo controlado de un `propertyId` que no corresponde a una propiedad publicada. */
function invalidPropertyResponse(): NextResponse {
  return NextResponse.json(
    {
      ok: false,
      error: "Datos inválidos",
      details: {
        formErrors: [],
        fieldErrors: { propertyId: ["La propiedad no existe o no está disponible"] },
      },
    },
    { status: 400 },
  );
}

/** ¿Es una violación de clave ajena? (código PostgreSQL `23503`.) */
function isForeignKeyViolation(error: unknown): boolean {
  if (typeof error !== "object" || error === null) {
    return false;
  }
  return (error as { code?: unknown }).code === "23503";
}

/** Código saneado del fallo, para el registro del servidor. */
function failureCode(error: unknown): string {
  if (typeof error === "object" && error !== null) {
    const code = (error as { code?: unknown }).code;
    if (typeof code === "string" && code.length > 0) {
      return code;
    }
  }
  return "desconocido";
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    // Un cuerpo que no es JSON es un error distinto de un cuerpo válido con campos incorrectos:
    // mezclarlos daría un mensaje engañoso sobre qué hay que corregir.
    return NextResponse.json({ ok: false, error: "JSON inválido" }, { status: 400 });
  }

  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Datos inválidos", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    if (parsed.data.propertyId !== undefined && !(await isPublishedProperty(parsed.data.propertyId))) {
      return invalidPropertyResponse();
    }

    const lead = await createLead(parsed.data);
    // La respuesta lleva lo que generó el servidor (id, estado y sello de tiempo) y **no** repite
    // teléfono, correo ni mensaje: el cliente ya los tiene y repetirlos solo amplía la exposición.
    return NextResponse.json({ ok: true, lead }, { status: 201 });
  } catch (error) {
    if (isForeignKeyViolation(error)) {
      // Carrera entre la comprobación y la inserción: si la propiedad desapareció en medio, el
      // rechazo sigue siendo controlado en lugar de un 500.
      return invalidPropertyResponse();
    }
    // El fallo real no se oculta: queda en el registro del servidor con un código saneado, y al
    // cliente solo le llega un mensaje genérico sin SQL, sin credenciales y sin traza.
    console.error("lead_create_failed", { code: failureCode(error) });
    return NextResponse.json(
      { ok: false, error: "No se pudo registrar el contacto" },
      { status: 500 },
    );
  }
}
