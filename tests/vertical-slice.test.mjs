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
import { after, before, test } from "node:test";

const PORT = Number(process.env.PILOT_TEST_PORT ?? 3210);
const BASE = `http://127.0.0.1:${PORT}`;

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
  const alquiler = await (await fetch(`${BASE}/propiedades?operacion=alquiler`)).text();
  const venta = await (await fetch(`${BASE}/propiedades?operacion=venta`)).text();

  assert.ok(alquiler.includes("HN-000247"), "el alquiler devuelve el local comercial");
  assert.ok(!alquiler.includes("HN-000184"), "el alquiler no devuelve la casa en venta");
  assert.ok(venta.includes("HN-000184"));
  assert.ok(!venta.includes("HN-000247"));
});

test("el filtro por departamento sigue funcionando", async () => {
  const html = await (
    await fetch(`${BASE}/propiedades?departamento=${encodeURIComponent("Cortés")}`)
  ).text();

  assert.ok(html.includes("HN-000211"));
  assert.ok(html.includes("HN-000247"));
  assert.ok(!html.includes("HN-000184"));
});

test("el filtro por tipo y precio máximo sigue funcionando", async () => {
  const porTipo = await (await fetch(`${BASE}/propiedades?tipo=Terreno`)).text();
  const porPrecio = await (await fetch(`${BASE}/propiedades?precioMax=2000000`)).text();

  assert.ok(porTipo.includes("HN-000239"));
  assert.ok(!porTipo.includes("HN-000184"));
  assert.ok(porPrecio.includes("HN-000239"));
  assert.ok(!porPrecio.includes("HN-000184"));
});
