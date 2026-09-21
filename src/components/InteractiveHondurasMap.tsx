import { departments, departmentMapPaths, departmentViewBox } from "@/lib/honduras";
import { HondurasMapView } from "@/components/HondurasMapView";

// Server Component (sin "use client"): es el único punto que lee las fuentes canónicas del mapa
// (`@/lib/honduras` carga el GeoJSON con `node:fs`, server-only) y las entrega por props a la vista
// cliente, que solo maneja el hover. Así `node:fs` nunca entra al grafo del cliente y las páginas
// siguen usando `<InteractiveHondurasMap />` sin cambios.
export function InteractiveHondurasMap() {
  return (
    <HondurasMapView
      departments={departments}
      paths={departmentMapPaths}
      viewBox={departmentViewBox}
    />
  );
}
