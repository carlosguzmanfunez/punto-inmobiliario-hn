/**
 * PILOT-01R.2 · Selección explícita del transporte de base de datos.
 *
 * Comprueba la **regla** de selección, no la base de datos: sin credenciales, sin red y sin arrancar
 * la aplicación. Es la parte determinista de F-1; el comportamiento de cada transporte se demuestra
 * con la prueba de vertical slice (Neon, modo normal) y con la corrida de QA Consumer en la red
 * aislada (PostgreSQL TCP efímero).
 *
 *   node --test tests/db-transport.test.mjs
 */

import assert from "node:assert/strict";
import { test } from "node:test";

import {
  DATABASE_TRANSPORTS,
  DEFAULT_TRANSPORT,
  TRANSPORT_ENV_VAR,
  selectDatabaseTransport,
} from "../src/db/transport.ts";

test("sin señal, el transporte es Neon sobre HTTP (modo normal)", () => {
  assert.equal(selectDatabaseTransport(undefined), "neon-http");
  assert.equal(DEFAULT_TRANSPORT, "neon-http");
});

test("la señal permite pedir Neon sobre HTTP de forma explícita", () => {
  assert.equal(selectDatabaseTransport("neon-http"), "neon-http");
});

test("el modo QA aislado se pide con postgres-tcp", () => {
  assert.equal(selectDatabaseTransport("postgres-tcp"), "postgres-tcp");
});

test("un valor no autorizado falla cerrado, incluida la cadena vacía", () => {
  for (const valor of [
    "",
    " ",
    "postgres",
    "tcp",
    "pg",
    "auto",
    "neon-http ",
    " neon-http",
    "NEON-HTTP",
    "POSTGRES-TCP",
    "neon",
    "http",
  ]) {
    assert.throws(
      () => selectDatabaseTransport(valor),
      /valor no autorizado/,
      `el valor ${JSON.stringify(valor)} tiene que rechazarse`,
    );
  }
});

test("la lista de transportes es cerrada y solo tiene dos miembros", () => {
  assert.deepEqual([...DATABASE_TRANSPORTS], ["neon-http", "postgres-tcp"]);
});

test("el nombre de la variable es el que PUNTO inyecta en el sandbox de QA", () => {
  assert.equal(TRANSPORT_ENV_VAR, "PUNTO_QA_DATABASE_TRANSPORT");
});
