import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync, readdirSync } from "node:fs";
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

test("el componente reutilizable conserva la geometría y los enlaces por departamento", () => {
  // Server Component: única lectura de las fuentes canónicas del mapa (`node:fs` es server-only).
  const server = read("src/components/InteractiveHondurasMap.tsx");
  assert.ok(!/^\s*["']use client["']/m.test(server), "el contenedor debe ser un Server Component");
  assert.ok(server.includes("from \"@/lib/honduras\""), "debe importar las fuentes canónicas del mapa");
  assert.ok(server.includes("departmentMapPaths"), "debe reutilizar los trazados canónicos");
  assert.ok(server.includes("<HondurasMapView"), "debe delegar el hover a la vista cliente");

  // Vista cliente: hover/foco, enlaces y trazados recibidos por props.
  const view = read("src/components/HondurasMapView.tsx");
  assert.ok(view.includes("\"use client\""), "el mapa interactivo debe ser un componente cliente para manejar hover");
  assert.ok(view.includes("paths[departmentName]"), "debe reutilizar los trazados canónicos recibidos");
  assert.ok(view.includes("encodeURIComponent(departmentName)"), "debe conservar el enlace por departamento");
  assert.ok(view.includes("onMouseEnter"), "debe escuchar la entrada del cursor");
  assert.ok(view.includes("onMouseLeave"), "debe escuchar la salida del cursor");
  assert.ok(view.includes("setActiveDepartment(null)"), "debe limpiar el departamento activo al salir");
});

// Frontera server/client: `src/lib/honduras.ts` lee el GeoJSON con `node:fs` (server-only). Un
// Client Component que lo importe (aunque sea transitivamente) mete `node:fs` en el bundle del
// cliente y Turbopack responde 500 ("does not support external modules (request: node:fs)").
function runtimeImports(source) {
  const imports = [];
  for (const match of source.matchAll(/^\s*import\s+(?!type\b)[^;]*?from\s+["']([^"']+)["']/gm)) imports.push(match[1]);
  for (const match of source.matchAll(/^\s*import\s+["']([^"']+)["']/gm)) imports.push(match[1]);
  return imports;
}

function resolveModule(specifier) {
  const base = specifier.startsWith("@/") ? `src/${specifier.slice(2)}` : null;
  if (!base) return null;
  for (const candidate of [`${base}.ts`, `${base}.tsx`, `${base}/index.ts`, `${base}/index.tsx`]) {
    try {
      readFileSync(path.join(root, candidate), "utf8");
      return candidate;
    } catch {
      /* siguiente candidato */
    }
  }
  return null;
}

function walkSources(directory) {
  const found = [];
  for (const entry of readdirSync(path.join(root, directory), { withFileTypes: true })) {
    const relative = `${directory}/${entry.name}`;
    if (entry.isDirectory()) found.push(...walkSources(relative));
    else if (/\.(ts|tsx)$/.test(entry.name)) found.push(relative);
  }
  return found;
}

function clientGraphViolations(entry) {
  const seen = new Set();
  const violations = [];
  const visit = (file, via) => {
    if (seen.has(file)) return;
    seen.add(file);
    const source = read(file);
    for (const specifier of runtimeImports(source)) {
      if (specifier.startsWith("node:") || ["fs", "path", "child_process"].includes(specifier)) {
        violations.push(`${[...via, file].join(" -> ")} -> ${specifier}`);
        continue;
      }
      const resolved = resolveModule(specifier);
      if (resolved) visit(resolved, [...via, file]);
    }
  };
  visit(entry, []);
  return violations;
}

test("ningún Client Component arrastra node:fs (u otro módulo de Node) a su grafo de imports", () => {
  const clientEntries = walkSources("src").filter((file) => /^\s*["']use client["']/.test(read(file)));
  assert.ok(clientEntries.includes("src/components/HondurasMapView.tsx"), "el mapa cliente debe estar entre los Client Components");
  for (const entry of clientEntries) {
    assert.deepEqual(clientGraphViolations(entry), [], `${entry} importa código server-only en el cliente`);
  }
});

test("el detector de frontera detecta la cadena que rompió /propiedades", () => {
  // Reproduce la causa: un cliente que importa valores de honduras.ts (que usa node:fs).
  const source = 'import { departments } from "@/lib/honduras";';
  assert.deepEqual(runtimeImports(source), ["@/lib/honduras"]);
  assert.equal(resolveModule("@/lib/honduras"), "src/lib/honduras.ts");
  assert.ok(read("src/lib/honduras.ts").includes("node:fs"), "honduras.ts sigue siendo el módulo server-only con node:fs");
  assert.deepEqual(runtimeImports('import type { DepartmentName } from "@/lib/honduras";'), [], "un import de solo tipos se borra al compilar");
});

test("las páginas consumen el componente reutilizable y no duplican el SVG del mapa", () => {
  const page = read("src/app/propiedades/page.tsx");
  const explorer = read("src/components/DepartmentExplorer.tsx");
  assert.ok(page.includes("<InteractiveHondurasMap />"), "la página /propiedades debe usar el componente de mapa");
  assert.ok(explorer.includes("<InteractiveHondurasMap />"), "el explorador de departamentos debe usar el componente de mapa");
  assert.ok(!page.includes("<svg"), "la página de resultados no debe volver a declarar el SVG del mapa");
  assert.ok(!explorer.includes("<svg"), "el explorador no debe volver a declarar el SVG del mapa");
});

test("el CSS resalta visualmente el departamento enfocado por hover", () => {
  const css = read("src/app/globals.css");
  assert.ok(css.includes(".department-path:hover"), "el CSS debe resaltar el trazo al pasar el cursor");
  assert.ok(css.includes(".department-path.is-active"), "el CSS debe mantener el resaltado del departamento activo");
});

test("el CSS refuerza el contraste visual del departamento resaltado con un grosor de trazo mayor", () => {
  const css = read("src/app/globals.css");
  assert.ok(
    /\.department-path:hover[\s\S]{0,40}\.department-path\.is-active\s*\{[^}]*stroke-width/.test(css),
    "el hover/active debe reforzar el grosor del trazo para un destaque más visible",
  );
});

test("la etiqueta del departamento activo muestra el nombre canónico sin transformarlo", () => {
  const source = read("src/components/HondurasMapView.tsx");
  assert.ok(source.includes("{activeDepartment}"), "debe interpolar el nombre canónico directamente en la etiqueta");
  assert.ok(
    !/activeDepartment\s*\.\s*(toUpperCase|toLowerCase)/.test(source),
    "no debe transformar el nombre canónico del departamento",
  );
});
