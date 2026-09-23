import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PropertyCard } from "@/components/PropertyCard";
import { InteractiveHondurasMap } from "@/components/InteractiveHondurasMap";
import { getProperties, type PropertyOperation } from "@/db/queries/properties";
import { departments } from "@/lib/honduras";
import { isPropertyTypeName, propertyTypes } from "@/lib/property-types";

export default async function PropertiesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const department = typeof params.departamento === "string" ? params.departamento : "";
  const operation = typeof params.operacion === "string" ? params.operacion : "";
  const rawType = typeof params.tipo === "string" ? params.tipo : "";
  const type = isPropertyTypeName(rawType) ? rawType : "";
  const city = typeof params.ciudad === "string" ? params.ciudad : "";
  const max = typeof params.precioMax === "string" ? Number(params.precioMax) : undefined;

  const operationFilter: PropertyOperation | undefined =
    operation === "venta" ? "SALE" : operation === "alquiler" ? "RENT" : undefined;

  const filtered = await getProperties({
    department: department || undefined,
    city: city || undefined,
    operation: operationFilter,
    type: type || undefined,
    maxPrice: max,
  });

  return (
    <><Header /><main className="results-page container">
      <div className="results-header"><div><p className="eyebrow dark">Resultados</p><h1>Propiedades en Honduras</h1><p>{filtered.length} resultado(s) disponibles en este prototipo.</p></div></div>
      <form className="filter-bar">
        <select name="operacion" defaultValue={operation}><option value="">Comprar o alquilar</option><option value="venta">Comprar</option><option value="alquiler">Alquilar</option></select>
        <select name="departamento" defaultValue={department}><option value="">Toda Honduras</option>{departments.map((d) => <option key={d}>{d}</option>)}</select>
        <select name="tipo" defaultValue={type}><option value="">Todos los tipos</option>{propertyTypes.map(({ label, type: propertyType }) => <option key={propertyType} value={propertyType}>{label}</option>)}</select>
        <input name="precioMax" type="number" defaultValue={max || ""} placeholder="Precio máximo" />
        <button className="button button-primary">Aplicar filtros</button>
      </form>
      <div className="results-layout">
        <div className="results-grid">{filtered.length ? filtered.map((p) => <PropertyCard key={p.id} property={p} />) : <div className="empty-state"><h2>No encontramos coincidencias.</h2><p>Prueba eliminando alguno de los filtros.</p></div>}</div>
        <aside className="results-map">
          <InteractiveHondurasMap />
          <strong>Mapa interactivo</strong>
          <p>Selecciona un departamento para ver sus propiedades.</p>
        </aside>
      </div>
    </main><Footer /></>
  );
}
