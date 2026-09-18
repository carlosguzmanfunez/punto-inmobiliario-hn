import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "./schema";

/**
 * Conexión mínima con PostgreSQL/Neon, sólo para el servidor.
 *
 * `DATABASE_URL` vive en `.env.local` (fuera de Git) y nunca se expone al cliente: este módulo se
 * importa únicamente desde componentes y funciones de servidor.
 *
 * Si la variable no está, se falla aquí y con un mensaje explícito. No hay datos de reserva: un
 * fallo de base de datos tiene que verse como fallo, nunca como un inventario simulado.
 */
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL no está configurada: el inventario público requiere la base de datos de desarrollo.",
  );
}

export const db = drizzle(neon(connectionString), { schema });
