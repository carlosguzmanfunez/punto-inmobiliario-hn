import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function read(relativePath) {
  return readFileSync(path.join(root, relativePath), "utf8");
}

function parsePropertyTypesFromSource(source) {
  const match = source.match(/export const propertyTypes = \[([\s\S]*?)\] as const;/);
  assert.ok(match, "falta la declaración de propertyTypes en src/lib/property-types.ts");
  const types = [...match[1].matchAll(/type:\s*"([^"]+)"/g)].map((m) => m[1]);
  assert.ok(types.length > 0, "propertyTypes debe declarar al menos un type");
  return types;
}

function parsePropertyTypesFromSeed(sql) {
  const match = sql.match(/INSERT INTO "property_types"[\s\S]*?ON CONFLICT DO NOTHING;/);
  assert.ok(match, "falta el bloque property_types en seed.sql");
  const rows = [...match[0].matchAll(/\(\s*\d+\s*,\s*'([^']+)'\s*,\s*'([^']+)'\s*\)/g)];
  assert.ok(rows.length > 0, "seed.sql debe declarar al menos un tipo");
  return rows.map((row) => row[1]);
}

test("la constante canónica de tipos coincide con el catálogo real de seed.sql", () => {
  const uiTypes = parsePropertyTypesFromSource(read("src/lib/property-types.ts"));
  const seedTypes = parsePropertyTypesFromSeed(read("src/db/seed.sql"));
  assert.deepEqual(uiTypes, seedTypes);
});

test("la constante canónica no introduce tipos fuera del catálogo", () => {
  const uiTypes = parsePropertyTypesFromSource(read("src/lib/property-types.ts"));
  const seedTypes = parsePropertyTypesFromSeed(read("src/db/seed.sql"));
  for (const type of uiTypes) assert.ok(seedTypes.includes(type), `"${type}" no está en el catálogo`);
});
