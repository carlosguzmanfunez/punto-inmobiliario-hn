import { departments } from "@/lib/honduras";

export function DepartmentExplorer() {
  return (
    <section className="container section">
      <div className="section-heading">
        <div><p className="eyebrow dark">Cobertura nacional</p><h2>Explora los 18 departamentos de Honduras</h2></div>
      </div>
      <div className="department-layout">
        <div className="map-placeholder" aria-label="Mapa conceptual de Honduras">
          <div className="map-shape">HN</div>
          <p>Mapa interactivo por departamento</p>
          <small>En Fase 2 se conectará a un proveedor cartográfico.</small>
        </div>
        <div className="department-grid">
          {departments.map((department) => (
            <a key={department} href={`/propiedades?departamento=${encodeURIComponent(department)}`}>{department}<span>→</span></a>
          ))}
        </div>
        <a href="/propiedades?departamento=Islas%20de%20la%20Bahía" className="roatan-card">
          <span className="eyebrow">Caribe hondureño</span>
          <strong>Propiedades en Roatán</strong>
          <span>Explorar oportunidades →</span>
        </a>
      </div>
    </section>
  );
}
