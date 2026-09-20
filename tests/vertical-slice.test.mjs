/**
 * PILOT-01 · prueba mínima del vertical slice.
 *
 * Arranca la aplicación construida (`next start`) contra la base de datos de DESARROLLO real y
 * comprueba el recorrido público completo: listado, ficha, 404 y los filtros existentes. No usa
 * dependencias nuevas: `node:test` (Node 24) y `fetch`.
 *
 *   npm run build && npm test
 *
 * La credencial la lee la propia aplicación desde `.env.local`; esta prueba nunca la imprime.
 */

import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";
import { after, before, test } from "node:test";
import { fileURLToPath } from "node:url";
import path from "node:path";

const PORT = Number(process.env.PILOT_TEST_PORT ?? 3210);
const BASE = `http://127.0.0.1:${PORT}`;
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

/** Códigos del inventario que el seed carga en la base de desarrollo. */
const CODIGOS = ["HN-000184", "HN-000211", "HN-000239", "HN-000247"];

/** Slug real de una de las propiedades sembradas. */
const SLUG_CASA = "casa-moderna-residencial-el-hatillo-hn-184";

let servidor;

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

/**
 * Pide una ruta y devuelve su HTML, exigiendo que la respuesta sea correcta.
 *
 * Sin esta comprobación, un fallo transitorio del servidor (un 500 por una latencia de base, por
 * ejemplo) se veía como «el filtro no devuelve la propiedad»: el mensaje culpaba a la funcionalidad y
 * ocultaba el código real, y la prueba fallaba de forma intermitente sin causa visible. Ahora el
 * código HTTP viaja en el mensaje del fallo.
 */
async function htmlDe(ruta) {
  const respuesta = await fetch(`${BASE}${ruta}`);
  const html = await respuesta.text();
  assert.equal(
    respuesta.status,
    200,
    `la ruta ${ruta} debía responder 200 y respondió ${respuesta.status}`,
  );
  return html;
}

/** Devuelve los tipos de propiedad definidos en el catálogo real (seed.sql). */
function tiposDeSeed() {
  const sql = readFileSync(path.join(root, "src/db/seed.sql"), "utf8");
  const match = sql.match(/INSERT INTO "property_types"[\s\S]*?ON CONFLICT DO NOTHING;/);
  assert.ok(match, "falta el bloque property_types en seed.sql");
  const rows = [...match[0].matchAll(/\(\s*\d+\s*,\s*'([^']+)'\s*,\s*'([^']+)'\s*\)/g)];
  assert.ok(rows.length > 0, "seed.sql debe declarar al menos un tipo");
  return rows.map((row) => row[1]);
}

before(async () => {
  servidor = spawn(`npx next start -p ${PORT}`, { stdio: "ignore", shell: true });
  await esperarArranque();
});

after(() => {
  if (servidor?.pid) {
    spawn(`taskkill /pid ${servidor.pid} /T /F`, { stdio: "ignore", shell: true });
  }
});

test("el listado público se sirve desde PostgreSQL", async () => {
  const respuesta = await fetch(`${BASE}/propiedades`);
  const html = await respuesta.text();

  assert.equal(respuesta.status, 200);
  for (const codigo of CODIGOS) {
    assert.ok(html.includes(codigo), `el listado debe incluir ${codigo}`);
  }
  assert.ok(html.includes("resultado(s)"), "el listado declara el recuento de resultados");
  assert.ok(!html.includes("No encontramos coincidencias"), "el listado no está vacío");
});

test("las opciones del filtro de tipo del listado coinciden con el catálogo de seed.sql", async () => {
  const html = await htmlDe("/propiedades");
  const tipos = tiposDeSeed();
  for (const tipo of tipos) {
    assert.ok(html.includes(`<option value="${tipo}">`), `el filtro debe ofrecer el tipo ${tipo} del catálogo`);
  }
});

test("la ficha individual se sirve desde PostgreSQL", async () => {
  const respuesta = await fetch(`${BASE}/propiedades/${SLUG_CASA}`);
  const html = await respuesta.text();

  assert.equal(respuesta.status, 200);
  assert.ok(html.includes("Casa moderna en Residencial El Hatillo"));
  assert.ok(html.includes("HN-000184"));
  assert.ok(html.includes("Tegucigalpa"));
  assert.ok(html.includes("Francisco Morazán"));
});

test("un slug inexistente conserva el 404", async () => {
  const respuesta = await fetch(`${BASE}/propiedades/no-existe-esta-propiedad`);

  assert.equal(respuesta.status, 404);
});

test("el filtro por operación sigue funcionando", async () => {
  const alquiler = await htmlDe("/propiedades?operacion=alquiler");
  const venta = await htmlDe("/propiedades?operacion=venta");

  assert.ok(alquiler.includes("HN-000247"), "el alquiler devuelve el local comercial");
  assert.ok(!alquiler.includes("HN-000184"), "el alquiler no devuelve la casa en venta");
  assert.ok(venta.includes("HN-000184"));
  assert.ok(!venta.includes("HN-000247"));
});

test("el filtro por departamento sigue funcionando", async () => {
  const html = await htmlDe(`/propiedades?departamento=${encodeURIComponent("Cortés")}`);

  assert.ok(html.includes("HN-000211"));
  assert.ok(html.includes("HN-000247"));
  assert.ok(!html.includes("HN-000184"));
});

test("el filtro por tipo y precio máximo sigue funcionando", async () => {
  const porTipo = await htmlDe("/propiedades?tipo=Terreno");
  const porPrecio = await htmlDe("/propiedades?precioMax=2000000");

  assert.ok(porTipo.includes("HN-000239"));
  assert.ok(!porTipo.includes("HN-000184"));
  assert.ok(porPrecio.includes("HN-000239"));
  assert.ok(!porPrecio.includes("HN-000184"));
});
