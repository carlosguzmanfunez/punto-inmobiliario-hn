import { readFileSync } from "node:fs";
import path from "node:path";

export const departments = [
  "Atlántida",
  "Choluteca",
  "Colón",
  "Comayagua",
  "Copán",
  "Cortés",
  "El Paraíso",
  "Francisco Morazán",
  "Gracias a Dios",
  "Intibucá",
  "Islas de la Bahía",
  "La Paz",
  "Lempira",
  "Ocotepeque",
  "Olancho",
  "Santa Bárbara",
  "Valle",
  "Yoro",
] as const;

export type DepartmentName = (typeof departments)[number];

export const departmentViewBox = "0 0 1000 700";

// Mapping from Spanish UI names to the `shapeName` used in the authoritative GeoJSON.
const shapeNameByDepartment: Record<DepartmentName, string> = {
  "Atlántida": "Atlántida",
  "Choluteca": "Choluteca",
  "Colón": "Colón",
  "Comayagua": "Comayagua",
  "Copán": "Copán",
  "Cortés": "Cortés",
  "El Paraíso": "El Paraíso",
  "Francisco Morazán": "Francisco Morazán",
  "Gracias a Dios": "Gracias a Dios",
  "Intibucá": "Intibucá",
  "Islas de la Bahía": "Bay Islands",
  "La Paz": "La Paz",
  "Lempira": "Lempira",
  "Ocotepeque": "Ocotepeque",
  "Olancho": "Olancho",
  "Santa Bárbara": "Santa Bárbara",
  "Valle": "Valle",
  "Yoro": "Yoro",
};

type Coordinate = [number, number];
type Ring = Coordinate[];
type Polygon = Ring[];
type MultiPolygon = Polygon[];
type Geometry = {
  type: "Polygon" | "MultiPolygon";
  coordinates: Polygon | MultiPolygon;
};
type Feature = {
  type: "Feature";
  properties: { shapeName: string };
  geometry: Geometry;
};
type FeatureCollection = {
  type: "FeatureCollection";
  features: Feature[];
};

const geojsonPath = path.join(process.cwd(), "src", "lib", "honduras-departamentos.geojson");
const geojson = JSON.parse(readFileSync(geojsonPath, "utf8")) as FeatureCollection;

function collectGeometry(geometry: Geometry, coordinates: Coordinate[]): void {
  if (geometry.type === "Polygon") {
    for (const ring of geometry.coordinates as Polygon) {
      coordinates.push(...ring);
    }
    return;
  }
  for (const polygon of geometry.coordinates as MultiPolygon) {
    for (const ring of polygon) {
      coordinates.push(...ring);
    }
  }
}

const allCoordinates: Coordinate[] = [];
geojson.features.forEach((feature) => collectGeometry(feature.geometry, allCoordinates));

let minLon = Infinity;
let maxLon = -Infinity;
let minLat = Infinity;
let maxLat = -Infinity;
for (const [lon, lat] of allCoordinates) {
  if (lon < minLon) minLon = lon;
  if (lon > maxLon) maxLon = lon;
  if (lat < minLat) minLat = lat;
  if (lat > maxLat) maxLat = lat;
}

const PAD = 40;
const DRAW_WIDTH = 920;
const DRAW_HEIGHT = 620;

function projectCoordinate([lon, lat]: Coordinate): [number, number] {
  const x = PAD + ((lon - minLon) / (maxLon - minLon)) * DRAW_WIDTH;
  const y = PAD + ((maxLat - lat) / (maxLat - minLat)) * DRAW_HEIGHT;
  return [Number(x.toFixed(2)), Number(y.toFixed(2))];
}

function ringToPathD(ring: Ring): string {
  const points = ring.map((coordinate, index) => {
    const [x, y] = projectCoordinate(coordinate);
    return `${index === 0 ? "M" : "L"} ${x} ${y}`;
  });
  return `${points.join(" ")} Z`;
}

function geometryToPathD(geometry: Geometry): string {
  if (geometry.type === "Polygon") {
    return (geometry.coordinates as Polygon).map(ringToPathD).join(" ");
  }
  return (geometry.coordinates as MultiPolygon)
    .map((polygon) => polygon.map(ringToPathD).join(" "))
    .join(" ");
}

export const departmentMapPaths: Record<DepartmentName, string> = Object.fromEntries(
  departments.map((departmentName) => {
    const shapeName = shapeNameByDepartment[departmentName];
    const feature = geojson.features.find((item) => item.properties.shapeName === shapeName);
    return [departmentName, feature ? geometryToPathD(feature.geometry) : ""] as const;
  }),
) as Record<DepartmentName, string>;
