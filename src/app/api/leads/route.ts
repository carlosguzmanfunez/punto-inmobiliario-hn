import { NextResponse } from "next/server";
import { z } from "zod";

const leadSchema = z.object({
  propertyId: z.coerce.number().int().positive().optional(),
  name: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(8).max(30),
  email: z.string().trim().email().optional().or(z.literal("")),
  message: z.string().trim().max(1500).optional(),
  source: z.enum(["WEB", "WHATSAPP", "PHONE", "OTHER"]).default("WEB"),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = leadSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Datos inválidos", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  // Fase de datos: persistir en PostgreSQL y aplicar rate limiting / anti-spam.
  return NextResponse.json({ ok: true, lead: parsed.data }, { status: 201 });
}
