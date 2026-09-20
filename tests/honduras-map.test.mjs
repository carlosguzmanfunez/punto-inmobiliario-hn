import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function read(relativePath) {
  return readFileSync(path.join(root, relativePath), "utf8");
}

function normalizeShapeName(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

test("el dataset autoritativo cubre los 18 departamentos canónicos", () => {
  const hondurasSource = read("src/lib/honduras.ts");
  const departmentsMatch = hondurasSource.match(/export const departments = \[([\s\S]*?)\] as const;/);
  assert.ok(departmentsMatch, "honduras.ts debe exportar departments");
  const departments = [...departmentsMatch[1].matchAll(/"([^"]+)"/g)].map((match) => match[1]);
  assert.equal(departments.length, 18, "la lista canónica debe contener 18 departamentos");

  const geo = JSON.parse(read("src/lib/honduras-departamentos.geojson"));
  assert.equal(geo.type, "FeatureCollection");
  assert.equal(geo.features.length, 18, "el GeoJSON debe describir 18 departamentos");

  const normalizedShapes = geo.features.map((feature) => normalizeShapeName(feature.properties.shapeName));
  const expectedShapes = new Set([
    "atlantida",
    "choluteca",
    "colon",
    "comayagua",
    "copan",
    "cortes",
    "el paraiso",
    "francisco morazan",
    "gracias a dios",
    "intibuca",
    "islas de la bahia",
    "bay islands",
    "la paz",
    "lempira",
    "ocotepeque",
    "olancho",
    "santa barbara",
    "valle",
    "yoro",
  ]);

  for (const shape of normalizedShapes) {
    assert.ok(expectedShapes.has(shape), `shapeName no reconocido: ${shape}`);
  }

  for (const department of departments) {
    const normalized = normalizeShapeName(department);
    const aliases = normalized === "islas de la bahia" ? ["islas de la bahia", "bay islands"] : [normalized];
    assert.ok(
      aliases.some((alias) => normalizedShapes.includes(alias)),
      `falta geometría para ${department}`,
    );
  }
});

test("todas las features presentan coordenadas cartográficas válidas", () => {
  const geo = JSON.parse(read("src/lib/honduras-departamentos.geojson"));

  function collectPositions(geometry) {
    const points = [];
    if (geometry.type === "Polygon") {
      for (const ring of geometry.coordinates) {
        points.push(...ring);
      }
    } else if (geometry.type === "MultiPolygon") {
      for (const polygon of geometry.coordinates) {
        for (const ring of polygon) {
          points.push(...ring);
        }
      }
    } else {
      throw new Error(`tipo de geometría no soportado: ${geometry.type}`);
    }
    return points;
  }

  for (const feature of geo.features) {
    const points = collectPositions(feature.geometry);
    assert.ok(points.length > 0, `${feature.properties.shapeName} no tiene coordenadas`);
    for (const point of points) {
      assert.ok(Array.isArray(point) && point.length >= 2, `${feature.properties.shapeName} tiene una coordenada inválida`);
      const [lon, lat] = point;
      assert.equal(typeof lon, "number", `${feature.properties.shapeName} longitud no numérica`);
      assert.equal(typeof lat, "number", `${feature.properties.shapeName} latitud no numérica`);
      assert.ok(Number.isFinite(lon) && Number.isFinite(lat), `${feature.properties.shapeName} tiene coordenada no finita`);
      assert.ok(lon >= -90 && lon <= -82, `longitud fuera de Honduras: ${lon}`);
      assert.ok(lat >= 12 && lat <= 18, `latitud fuera de Honduras: ${lat}`);
    }
  }
});

test("honduras.ts no conserva los trazados aproximados y usa el GeoJSON autoritativo", () => {
  const hondurasSource = read("src/lib/honduras.ts");
  assert.ok(hondurasSource.includes("honduras-departamentos.geojson"), "honduras.ts debe importar el GeoJSON");
  for (const token of ["M 240 80", "M 470 510", "M 500 78"]) {
    assert.ok(!hondurasSource.includes(token), `honduras.ts no debe conservar el trazo aproximado ${token}`);
  }
});
