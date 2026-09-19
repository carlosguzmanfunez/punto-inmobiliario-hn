import { neon } from "@neondatabase/serverless";
import { drizzle as drizzleNeonHttp, type NeonHttpDatabase } from "drizzle-orm/neon-http";
import { drizzle as drizzlePostgresJs, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "./schema";
import { TRANSPORT_ENV_VAR, selectDatabaseTransport } from "./transport";

/**
 * Conexión mínima con PostgreSQL, sólo para el servidor.
 *
 * `DATABASE_URL` vive en `.env.local` (fuera de Git) y nunca se expone al cliente: este módulo se
 * importa únicamente desde componentes y funciones de servidor.
 *
 * El transporte se elige con una señal explícita que aporta PUNTO (`PUNTO_QA_DATABASE_TRANSPORT`):
 *
 * - sin señal, el modo normal usa **Neon sobre HTTP** (el comportamiento de siempre);
 * - con `postgres-tcp`, el modo QA aislado usa **PostgreSQL por TCP**, que es lo único que puede
 *   alcanzar la base efímera que PUNTO levanta dentro de la red interna del sandbox.
 *
 * No hay reserva silenciosa: si el transporte elegido falla, el fallo se ve como fallo. La selección
 * ocurre una sola vez, al cargar el módulo, y no cambia mientras el proceso vive.
 *
 * Si la variable no está, se falla aquí y con un mensaje explícito. No hay datos de reserva: un
 * fallo de base de datos tiene que verse como fallo, nunca como un inventario simulado.
 */

/** Base de datos del proyecto, con el transporte ya seleccionado. */
export type Database = NeonHttpDatabase<typeof schema> | PostgresJsDatabase<typeof schema>;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL no está configurada: el inventario público requiere la base de datos de desarrollo.",
  );
}

const transport = selectDatabaseTransport(process.env[TRANSPORT_ENV_VAR]);

/** Transporte activo de esta instancia, para poder afirmarlo en un diagnóstico sin exponer el DSN. */
export const DATABASE_TRANSPORT = transport;

export const db: Database =
  transport === "neon-http"
    ? drizzleNeonHttp(neon(connectionString), { schema })
    : drizzlePostgresJs(postgres(connectionString), { schema });
