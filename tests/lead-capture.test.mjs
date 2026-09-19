/**
 * PILOT-02 · Captura real de un lead: validación → servidor → PostgreSQL → respuesta.
 *
 * Es la prueba del **camino normal** (Neon sobre HTTP, sin la señal de transporte de QA): arranca la
 * aplicación construida con `next start` y comprueba contra la base de desarrollo real que un lead
 * válido se persiste exactamente una vez, que los datos guardados son los que se enviaron, que un
 * payload inválido y una propiedad inexistente se rechazan **sin escribir nada**, y que la ficha
 * pública sirve el formulario sin exponer ninguna credencial.
 *
 *   npm run build && npm test
 *
 * Datos: **todo sintético** (nombre «Punto QA Lead», correo `qa-lead@example.invalid`, teléfono con
 * marcador único por ejecución). La credencial la lee la propia aplicación desde `.env.local`; esta
 * prueba nunca la imprime.
 *
 * La evidencia de base de datos se obtiene con una **lectura directa** a la misma `DATABASE_URL` que
 * usa la aplicación, no importando su capa de datos: el código del proyecto usa importaciones relativas
 * sin extensión (válidas para el empaquetador de Next, no para el resolutor ESM de Node), así que
 * importarlo desde una prueba sería medir otra cosa. La consulta de verificación es de sólo lectura y
 * no duplica ninguna consulta del producto.
 *
 * La autoridad de PUNTO no ofrece `DELETE`, así que las filas de prueba se dejan identificables por su
 * teléfono sintético y **no** se intenta borrarlas.
 */

import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import { after, before, test } from "node:test";

const PORT = Number(process.env.PILOT_LEAD_TEST_PORT ?? 3212);
const BASE = `http://127.0.0.1:${PORT}`;

/** Slug real de una de las propiedades publicadas por el seed. */
const SLUG_CASA = "casa-moderna-residencial-el-hatillo-hn-184";

/** Marcador único de esta ejecución: hace que las filas de prueba sean localizables. */
const RUN = Date.now().toString(36).toUpperCase();

/** Teléfono sintético válido y único de esta ejecución (mínimo 8 caracteres). */
const PHONE_OK = `0000${Date.now().toString().slice(-8)}`;

/** Segundo teléfono sintético válido, para el caso del correo vacío. */
const PHONE_EMPTY_EMAIL = `8888${Date.now().toString().slice(-8)}`;

/** Tercer teléfono sintético, para el contacto general sin propiedad. */
const PHONE_NO_PROPERTY = `7777${Date.now().toString().slice(-8)}`;

/** Teléfono sintético de la petición inválida: demasiado corto a propósito. */
const PHONE_INVALID = `1234${RUN.slice(-2)}`;

/** Teléfono sintético de la petición con propiedad inexistente. */
const PHONE_UNKNOWN_PROPERTY = `9999${Date.now().toString().slice(-8)}`;

let servidor;
let sql;
let selectedPropertyId = 0;

/** Carga `.env.local` en el proceso de prueba sin imprimir ningún valor. */
function loadLocalEnvironment() {
  if (process.env.DATABASE_URL) return;
  try {
    process.loadEnvFile(".env.local");
  } catch {
    // Si no existe, el fallo aparecerá como error explícito más abajo.
  }
}

/** Pares clave=valor del `.env.local`, para comprobaciones de seguridad sin publicar nada. */
function localEnvironment() {
  try {
    return Object.fromEntries(
      readFileSync(".env.local", "utf8")
        .split("\n")
        .filter((line) => line.includes("="))
        .map((line) => {
          const index = line.indexOf("=");
          const value = line.slice(index + 1).trim();
          return [line.slice(0, index).trim(), value.replace(/^["']|["']$/g, "")];
        }),
    );
  } catch {
    return {};
  }
}

async function esperarArranque(intentos = 60) {
  for (let i = 0; i < intentos; i += 1) {
    try {
      const respuesta = await fetch(`${BASE}/`);
      if (respuesta.status === 200) return;
    } catch {
      // todavía no escucha
    }
    await new Promise((resolver) => setTimeout(resolver, 1000));
  }
  throw new Error(`la aplicación no respondió en ${BASE} tras ${intentos}s`);
}

/** Envía un cuerpo a la API de leads y devuelve estado y JSON. */
async function postLead(body, { raw = false } = {}) {
  const respuesta = await fetch(`${BASE}/api/leads`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: raw ? body : JSON.stringify(body),
  });
  const json = await respuesta.json().catch(() => null);
  return { status: respuesta.status, json };
}

/** Filas de `leads` con ese teléfono: la evidencia directa en la base de datos. */
async function leadsByPhone(phone) {
  return sql`
    select id, name, phone, email, message, source, status, property_id, created_at
    from leads
    where phone = ${phone}
    order by id
  `;
}

before(async () => {
  loadLocalEnvironment();
  assert.ok(process.env.DATABASE_URL, "esta prueba necesita DATABASE_URL (vive en .env.local)");

  const postgres = (await import("postgres")).default;
  sql = postgres(process.env.DATABASE_URL, { max: 1 });

  const publicadas = await sql`
    select id from properties where status = 'PUBLISHED' order by id limit 1
  `;
  assert.ok(publicadas.length === 1, "la base de desarrollo necesita al menos una propiedad publicada");
  selectedPropertyId = publicadas[0].id;

  servidor = spawn(`npx next start -p ${PORT}`, { stdio: "ignore", shell: true });
  await esperarArranque();
});

after(async () => {
  if (servidor?.pid) {
    spawn(`taskkill /pid ${servidor.pid} /T /F`, { stdio: "ignore", shell: true });
  }
  if (sql) {
    await sql.end();
  }
});

test("un lead válido se acepta y se persiste exactamente una vez", async () => {
  const antes = await leadsByPhone(PHONE_OK);
  assert.equal(antes.length, 0, "el teléfono sintético no debe existir antes de la prueba");

  const mensaje = `Lead sintético de PILOT-02 (${RUN})`;
  const { status, json } = await postLead({
    propertyId: selectedPropertyId,
    name: "Punto QA Lead",
    phone: PHONE_OK,
    email: "qa-lead@example.invalid",
    message: mensaje,
    source: "WEB",
  });

  assert.equal(status, 201, `la respuesta debía ser 201: ${JSON.stringify(json)}`);
  assert.equal(json.ok, true);
  assert.equal(typeof json.lead.id, "number");
  assert.equal(json.lead.status, "NEW");
  assert.ok(!Number.isNaN(Date.parse(json.lead.createdAt)));
  assert.equal(json.lead.propertyId, selectedPropertyId);

  // La respuesta no repite datos personales que el cliente ya envió.
  for (const campo of ["name", "phone", "email", "message"]) {
    assert.equal(json.lead[campo], undefined, `la respuesta no debe devolver ${campo}`);
  }

  const despues = await leadsByPhone(PHONE_OK);
  assert.equal(despues.length, 1, "una petición válida produce exactamente una fila");
  const fila = despues[0];
  assert.equal(fila.name, "Punto QA Lead");
  assert.equal(fila.phone, PHONE_OK);
  assert.equal(fila.email, "qa-lead@example.invalid");
  assert.equal(fila.message, mensaje);
  assert.equal(fila.source, "WEB");
  assert.equal(fila.status, "NEW");
  assert.equal(fila.property_id, selectedPropertyId);
  assert.ok(fila.created_at instanceof Date);
  assert.equal(Number(json.lead.id), fila.id, "el id devuelto es el de la fila persistida");
});

test("una sola petición no duplica la fila", async () => {
  const filas = await leadsByPhone(PHONE_OK);
  assert.equal(filas.length, 1, "sin deduplicación comercial, una petición es una fila");
});

test("el correo vacío se guarda como ausencia de dato, no como cadena vacía", async () => {
  const { status } = await postLead({
    propertyId: selectedPropertyId,
    name: "Punto QA Lead",
    phone: PHONE_EMPTY_EMAIL,
    email: "",
  });
  assert.equal(status, 201);

  const filas = await leadsByPhone(PHONE_EMPTY_EMAIL);
  assert.equal(filas.length, 1);
  assert.equal(filas[0].email, null);
});

test("un payload inválido se rechaza y no persiste nada", async () => {
  const { status, json } = await postLead({
    propertyId: selectedPropertyId,
    name: "A",
    phone: PHONE_INVALID,
    email: "qa-lead@example.invalid",
  });

  assert.equal(status, 400);
  assert.equal(json.ok, false);
  assert.equal(json.error, "Datos inválidos");
  assert.ok(json.details.fieldErrors.name, "el error de nombre se detalla");
  assert.ok(json.details.fieldErrors.phone, "el error de teléfono se detalla");

  const filas = await leadsByPhone(PHONE_INVALID);
  assert.equal(filas.length, 0, "un rechazo de validación no escribe nada");
});

test("un cuerpo que no es JSON se rechaza como JSON inválido", async () => {
  const { status, json } = await postLead("{no-es-json", { raw: true });
  assert.equal(status, 400);
  assert.equal(json.ok, false);
  assert.equal(json.error, "JSON inválido");
});

test("una propiedad inexistente se rechaza de forma controlada y no persiste nada", async () => {
  const { status, json } = await postLead({
    propertyId: 999999,
    name: "Punto QA Lead",
    phone: PHONE_UNKNOWN_PROPERTY,
    email: "qa-lead@example.invalid",
  });

  assert.equal(status, 400, `una propiedad inexistente no puede provocar un 500: ${JSON.stringify(json)}`);
  assert.equal(json.ok, false);
  assert.ok(json.details.fieldErrors.propertyId, "el rechazo señala el campo propertyId");

  const filas = await leadsByPhone(PHONE_UNKNOWN_PROPERTY);
  assert.equal(filas.length, 0, "una propiedad inexistente no escribe nada");
});

test("un lead sin propiedad sigue siendo válido (contacto general)", async () => {
  const { status, json } = await postLead({
    name: "Punto QA Lead",
    phone: PHONE_NO_PROPERTY,
    message: `Contacto general sintético (${RUN})`,
  });

  assert.equal(status, 201);
  assert.equal(json.lead.propertyId, null);

  const filas = await leadsByPhone(PHONE_NO_PROPERTY);
  assert.equal(filas.length, 1);
  assert.equal(filas[0].property_id, null);
});

test("el camino normal se prueba sin la señal de transporte de QA", () => {
  assert.equal(process.env.PUNTO_QA_DATABASE_TRANSPORT, undefined);
  assert.ok(localEnvironment().DATABASE_URL, "la aplicación lee su base del `.env.local` del proyecto");
});

test("la ficha pública sirve el formulario sin exponer ninguna credencial", async () => {
  const respuesta = await fetch(`${BASE}/propiedades/${SLUG_CASA}`);
  const html = await respuesta.text();

  assert.equal(respuesta.status, 200);
  assert.ok(html.includes('id="lead-form"'), "el formulario real está montado en la ficha");
  assert.ok(html.includes('id="lead-submit"'), "el formulario tiene su botón de envío");
  assert.ok(html.includes('id="lead-phone"'), "el formulario pide el teléfono");

  const dsn = localEnvironment().DATABASE_URL ?? "";
  const contrasena =
    dsn.includes("://") && dsn.includes("@")
      ? dsn.split("://")[1].split(":")[1].split("@")[0]
      : "";
  assert.ok(!html.includes("postgresql://"), "el HTML público no puede contener un DSN");
  assert.ok(!html.includes("postgres://"), "el HTML público no puede contener un DSN");
  assert.ok(!html.includes("DATABASE_URL"), "el HTML público no puede nombrar la variable de la base");
  if (contrasena) {
    assert.ok(!html.includes(contrasena), "el HTML público no puede contener la contraseña de la base");
  }
});
