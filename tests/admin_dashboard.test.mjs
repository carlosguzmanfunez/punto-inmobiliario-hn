import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function read(relativePath) {
  return readFileSync(path.join(root, relativePath), "utf8");
}

test("la ruta /admin existe y renderiza el encabezado del panel", () => {
  const page = read("src/app/admin/page.tsx");
  assert.ok(page.includes("Panel administrativo"), "debe renderizar un encabezado de panel");
});

test("el panel importa el inventario canónico properties sin duplicarlo", () => {
  const page = read("src/app/admin/page.tsx");
  assert.ok(page.includes('from "@/lib/mock-data"'), "debe importar properties desde la fuente canónica");
  assert.ok(page.includes("{ properties }"), "debe importar el símbolo properties");
});

test("las cuatro métricas se derivan directamente de properties", () => {
  const page = read("src/app/admin/page.tsx");
  assert.ok(/properties\.length/.test(page), "el total de propiedades debe derivarse de properties.length");
  assert.ok(
    /properties\.filter\([\s\S]*?operation\s*===\s*"SALE"/.test(page),
    "las propiedades en venta deben filtrarse desde properties",
  );
  assert.ok(
    /properties\.filter\([\s\S]*?operation\s*===\s*"RENT"/.test(page),
    "las propiedades en alquiler deben filtrarse desde properties",
  );
  assert.ok(
    /properties\.reduce\([\s\S]*?\.price/.test(page),
    "el valor total publicado debe sumarse desde el precio de properties",
  );
});

test("la tabla es semántica e incluye código, propiedad, operación y precio", () => {
  const page = read("src/app/admin/page.tsx");
  assert.ok(page.includes("<table"), "debe usar un elemento table");
  assert.ok(page.includes("<thead"), "debe declarar encabezados de tabla");
  assert.ok(page.includes('scope="col"'), "los encabezados deben declarar scope para accesibilidad");
  for (const header of ["Código", "Propiedad", "Operación", "Precio"]) {
    assert.ok(page.includes(header), `la tabla debe incluir la columna ${header}`);
  }
});

test("el panel no incluye formularios, botones de mutación ni acceso a base de datos", () => {
  const page = read("src/app/admin/page.tsx");
  assert.ok(!page.includes("<form"), "no debe incluir formularios");
  assert.ok(!page.includes("<button"), "no debe incluir botones de mutación");
  assert.ok(!/onClick|onSubmit|onChange/.test(page), "no debe declarar manejadores de escritura");
  assert.ok(!/fetch\(|axios|pool\.query|db\.query/.test(page), "no debe acceder a una API o base de datos");
  assert.ok(page.toLowerCase().includes("solo lectura"), "debe identificarse como vista interna de solo lectura");
});

test("el diseño responsive vive en un CSS module local a /admin", () => {
  const css = read("src/app/admin/admin.module.css");
  assert.ok(/@media/.test(css), "el CSS module debe declarar reglas responsive");
  const page = read("src/app/admin/page.tsx");
  assert.ok(page.includes('from "./admin.module.css"'), "la página debe importar el CSS module local");
});

test("la portada pública no se modifica por el nuevo panel", () => {
  const home = read("src/app/page.tsx");
  assert.ok(!home.includes("admin.module.css"), "la portada no debe importar estilos del panel administrativo");
});
